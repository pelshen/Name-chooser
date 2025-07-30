import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

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
    
    return {
      userId,
      teamId,
      month: monthKey,
      usageCount: parseInt(result.Attributes.usageCount.N),
      planType: result.Attributes.planType.S,
      lastUsed: result.Attributes.lastUsed.S
    };
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
      
      return {
        userId,
        teamId,
        month: monthKey,
        usageCount: 1,
        planType,
        lastUsed: now
      };
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
