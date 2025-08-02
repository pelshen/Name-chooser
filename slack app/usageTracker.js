import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Analytics } from './analytics.js';

// In-memory cache to track last limit attempt log time per user
// Format: { "userId-teamId": timestamp }
const lastLimitAttemptLog = new Map();

// Rate limit: only log postLimitAttempt once per hour per user
const LIMIT_ATTEMPT_LOG_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'MockAccessKeyId',
      secretAccessKey: 'MockSecretAccessKey'
    },
  };
}

const dynamoClient = new DynamoDBClient(options);
const usageTableName = process.env.USAGE_TABLE || process.env.ACCOUNT_TABLE;

// Free plan limits
const FREE_PLAN_MONTHLY_LIMIT = 5;

/**
 * Get the current month key (YYYY-MM format)
 */
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get user's current usage for this month
 */
export async function getUserUsage(userId, teamId) {
  const monthKey = getCurrentMonthKey();
  const usageId = `${userId}-${teamId}-${monthKey}`;
  
  try {
    const command = new GetItemCommand({
      TableName: usageTableName,
      Key: {
        id: { S: usageId },
        type: { S: 'usage' }
      }
    });
    
    const result = await dynamoClient.send(command);
    
    if (result.Item) {
      return {
        userId,
        teamId,
        month: monthKey,
        usageCount: parseInt(result.Item.usageCount.N),
        planType: result.Item.planType?.S || 'FREE',
        lastUsed: result.Item.lastUsed?.S
      };
    }
    
    // Return default usage record if none exists
    return {
      userId,
      teamId,
      month: monthKey,
      usageCount: 0,
      planType: 'FREE',
      lastUsed: null
    };
  } catch (error) {
    console.error('Error fetching user usage:', error);
    throw error;
  }
}

/**
 * Check if user can perform a draw (hasn't exceeded limits)
 */
export async function canUserDraw(userId, teamId) {
  const usage = await getUserUsage(userId, teamId);
  
  // Paid users have unlimited usage
  if (usage.planType === 'PAID') {
    return { allowed: true, usage };
  }
  
  // Free users are limited
  const allowed = usage.usageCount < FREE_PLAN_MONTHLY_LIMIT;
  
  // Track if user is hitting limit (with rate limiting)
  if (!allowed) {
    const userKey = `${userId}-${teamId}`;
    const now = Date.now();
    const lastLogged = lastLimitAttemptLog.get(userKey);
    
    // Only log if we haven't logged for this user in the last hour
    if (!lastLogged || (now - lastLogged) >= LIMIT_ATTEMPT_LOG_INTERVAL_MS) {
      Analytics.postLimitAttempt(userId, teamId, usage.planType, usage.usageCount, FREE_PLAN_MONTHLY_LIMIT, {
        attempts_since_last_log: lastLogged ? Math.floor((now - lastLogged) / (1000 * 60)) : 0, // minutes since last log
        is_rate_limited_event: true
      });
      lastLimitAttemptLog.set(userKey, now);
    }
  }
  
  return { allowed, usage, limit: FREE_PLAN_MONTHLY_LIMIT };
}

/**
 * Increment user's usage count
 */
export async function incrementUsage(userId, teamId, planType = 'FREE') {
  const monthKey = getCurrentMonthKey();
  const usageId = `${userId}-${teamId}-${monthKey}`;
  const now = new Date().toISOString();
  
  try {
    // Try to update existing record
    const updateCommand = new UpdateItemCommand({
      TableName: usageTableName,
      Key: {
        id: { S: usageId },
        type: { S: 'usage' }
      },
      UpdateExpression: 'ADD usageCount :inc SET lastUsed = :now, planType = :plan',
      ExpressionAttributeValues: {
        ':inc': { N: '1' },
        ':now': { S: now },
        ':plan': { S: planType }
      },
      ReturnValues: 'ALL_NEW'
    });
    
    const result = await dynamoClient.send(updateCommand);
    
    const updatedUsage = {
      userId,
      teamId,
      month: monthKey,
      usageCount: parseInt(result.Attributes.usageCount.N),
      planType: result.Attributes.planType.S,
      lastUsed: result.Attributes.lastUsed.S
    };
    
    // Track usage milestone events
    if (updatedUsage.usageCount === 1) {
      Analytics.firstTimeUser(userId, teamId, planType);
    } else {
      // Check if this is same-day repeat usage
      const lastUsedDate = new Date(result.Attributes.lastUsed.S).toDateString();
      const nowDate = new Date().toDateString();
      if (lastUsedDate === nowDate) {
        Analytics.repeatUsageSameDay(userId, teamId, planType, updatedUsage.usageCount);
      } else {
        const daysSinceLastUse = Math.floor((new Date() - new Date(result.Attributes.lastUsed.S)) / (1000 * 60 * 60 * 24));
        Analytics.returningUser(userId, teamId, planType, daysSinceLastUse);
      }
    }
    
    // Track if approaching limit
    if (isApproachingLimit(updatedUsage)) {
      Analytics.usageLimitWarning(userId, teamId, planType, updatedUsage.usageCount, FREE_PLAN_MONTHLY_LIMIT);
    }
    
    // Track if at limit
    if (updatedUsage.usageCount >= FREE_PLAN_MONTHLY_LIMIT && planType === 'FREE') {
      Analytics.usageLimitReached(userId, teamId, planType, updatedUsage.usageCount, FREE_PLAN_MONTHLY_LIMIT);
    }
    
    return updatedUsage;
  } catch (error) {
    // If update fails (record doesn't exist), create new record
    if (error.name === 'ValidationException') {
      const putCommand = new PutItemCommand({
        TableName: usageTableName,
        Item: {
          id: { S: usageId },
          type: { S: 'usage' },
          userId: { S: userId },
          teamId: { S: teamId },
          month: { S: monthKey },
          usageCount: { N: '1' },
          planType: { S: planType },
          lastUsed: { S: now },
          createdAt: { S: now }
        }
      });
      
      await dynamoClient.send(putCommand);
      
      const newUsage = {
        userId,
        teamId,
        month: monthKey,
        usageCount: 1,
        planType,
        lastUsed: now
      };
      
      // Track first time user
      Analytics.firstTimeUser(userId, teamId, planType);
      
      return newUsage;
    }
    
    console.error('Error incrementing usage:', error);
    throw error;
  }
}

/**
 * Get usage statistics for a team
 */
export async function getTeamUsageStats(teamId) {
  // This would require a GSI or scan operation
  // For now, we'll implement this as needed
  // Could be useful for team-level analytics
  return null;
}

/**
 * Check if user is approaching their limit
 */
export function isApproachingLimit(usage, limit = FREE_PLAN_MONTHLY_LIMIT) {
  if (usage.planType === 'PAID') return false;
  return usage.usageCount >= limit - 1; // Warning at 4/5 uses
}

/**
 * Get user-friendly usage message
 */
export function getUsageMessage(usage, limit = FREE_PLAN_MONTHLY_LIMIT) {
  if (usage.planType === 'PAID') {
    return 'You have unlimited draws with your paid plan! 🎉';
  }
  
  const remaining = limit - usage.usageCount;
  
  if (remaining <= 0) {
    return `You've used all ${limit} of your free draws this month. Paid plans with unlimited draws coming soon!`;
  }
  
  if (remaining === 1) {
    return `You have ${remaining} draw remaining this month. Paid plans with unlimited draws coming soon!`;
  }
  
  return `You have ${remaining} draws remaining this month (${usage.usageCount}/${limit} used).`;
}
