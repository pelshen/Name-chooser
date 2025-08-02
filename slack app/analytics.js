import { PostHog } from 'posthog-node';
import { createRequire } from 'module';

// Import package.json to get dynamic version
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

// Initialize PostHog client
let posthog = null;

function initializePostHog() {
  if (!posthog && process.env.POSTHOG_API_KEY) {
    posthog = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1, // Send events immediately in serverless environment
      flushInterval: 0, // Disable interval flushing for serverless
    });
  }
  return posthog;
}

/**
 * Generate a unique user ID for PostHog tracking
 */
function getUserId(slackUserId, teamId) {
  return `${teamId}-${slackUserId}`;
}

/**
 * Get common user properties for all events
 */
function getBaseUserProperties(slackUserId, teamId, planType = 'FREE') {
  return {
    slack_user_id: slackUserId,
    slack_team_id: teamId,
    plan_type: planType,
    app_version: packageJson.version,
    environment: process.env.STAGE || 'unknown'
  };
}

/**
 * Track an event with PostHog
 */
export async function trackEvent(eventName, slackUserId, teamId, properties = {}, planType = 'FREE') {
  const client = initializePostHog();
  
  if (!client) {
    console.log(`PostHog not configured - would track: ${eventName}`);
    return;
  }

  try {
    const userId = getUserId(slackUserId, teamId);
    const baseProperties = getBaseUserProperties(slackUserId, teamId, planType);
    
    client.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        ...baseProperties,
        ...properties
      }
    });

    // Ensure events are sent in serverless environment
    await client.flush();
  } catch (error) {
    console.error(`Error tracking PostHog event '${eventName}' for user ${slackUserId} in team ${teamId}:`, {
      eventName,
      slackUserId,
      teamId,
      planType,
      error: error.message || error,
      stack: error.stack
    });
  }
}

/**
 * Identify a user with PostHog (set user properties)
 */
export async function identifyUser(slackUserId, teamId, userProperties = {}, planType = 'FREE') {
  const client = initializePostHog();
  
  if (!client) {
    console.log(`PostHog not configured - would identify user: ${slackUserId}`);
    return;
  }

  try {
    const userId = getUserId(slackUserId, teamId);
    
    client.identify({
      distinctId: userId,
      properties: {
        slack_user_id: slackUserId,
        slack_team_id: teamId,
        plan_type: planType,
        ...userProperties
      }
    });

    await client.flush();
  } catch (error) {
    console.error(`Error identifying PostHog user ${slackUserId} in team ${teamId}:`, {
      slackUserId,
      teamId,
      planType,
      error: error.message || error,
      stack: error.stack
    });
  }
}

// Event tracking functions for specific events
export const Analytics = {
  // Core user journey events
  slashCommandInitiated: (slackUserId, teamId, planType, properties = {}) =>
    trackEvent('slash_command_initiated', slackUserId, teamId, properties, planType),

  shortcutTriggered: (slackUserId, teamId, planType, shortcutName, properties = {}) =>
    trackEvent('shortcut_triggered', slackUserId, teamId, { shortcut_name: shortcutName, ...properties }, planType),

  modalOpened: (slackUserId, teamId, planType, inputMethod, properties = {}) =>
    trackEvent('modal_opened', slackUserId, teamId, { input_method: inputMethod, ...properties }, planType),

  inputMethodSelected: (slackUserId, teamId, planType, method, properties = {}) =>
    trackEvent('input_method_selected', slackUserId, teamId, { method, ...properties }, planType),

  inputMethodSwitched: (slackUserId, teamId, planType, fromMethod, toMethod, properties = {}) =>
    trackEvent('input_method_switched', slackUserId, teamId, { from_method: fromMethod, to_method: toMethod, ...properties }, planType),

  drawExecuted: ({ slackUserId, teamId, planType, drawSize, hasReason, channelType, usageCount, properties = {} }) =>
    trackEvent('draw_executed', slackUserId, teamId, {
      draw_size: drawSize,
      has_reason: hasReason,
      channel_type: channelType,
      usage_count_after: usageCount,
      ...properties
    }, planType),

  // Usage limit events
  usageLimitWarning: (slackUserId, teamId, planType, usageCount, limit, properties = {}) =>
    trackEvent('usage_limit_warning', slackUserId, teamId, {
      usage_count: usageCount,
      limit,
      remaining: limit - usageCount,
      ...properties
    }, planType),

  usageLimitReached: (slackUserId, teamId, planType, usageCount, limit, properties = {}) =>
    trackEvent('usage_limit_reached', slackUserId, teamId, {
      usage_count: usageCount,
      limit,
      ...properties
    }, planType),

  postLimitAttempt: (slackUserId, teamId, planType, usageCount, limit, properties = {}) =>
    trackEvent('post_limit_attempt', slackUserId, teamId, {
      usage_count: usageCount,
      limit,
      attempts_over_limit: usageCount - limit,
      ...properties
    }, planType),

  // Feature usage events
  reasonProvided: (slackUserId, teamId, planType, reasonLength, properties = {}) =>
    trackEvent('reason_provided', slackUserId, teamId, { reason_length: reasonLength, ...properties }, planType),

  channelSelectionChanged: (slackUserId, teamId, planType, channelType, properties = {}) =>
    trackEvent('channel_selection_changed', slackUserId, teamId, { channel_type: channelType, ...properties }, planType),

  largeDrawAttempted: (slackUserId, teamId, planType, drawSize, properties = {}) =>
    trackEvent('large_draw_attempted', slackUserId, teamId, { draw_size: drawSize, ...properties }, planType),

  // Error events
  drawFailed: (slackUserId, teamId, planType, errorType, properties = {}) =>
    trackEvent('draw_failed', slackUserId, teamId, { error_type: errorType, ...properties }, planType),

  // Conversion signals
  accountPageVisited: (slackUserId, teamId, planType, properties = {}) =>
    trackEvent('account_page_visited', slackUserId, teamId, properties, planType),

  planInfoViewed: (slackUserId, teamId, planType, properties = {}) =>
    trackEvent('plan_info_viewed', slackUserId, teamId, properties, planType),

  // User lifecycle events
  firstTimeUser: (slackUserId, teamId, planType, properties = {}) =>
    trackEvent('first_time_user', slackUserId, teamId, properties, planType),

  returningUser: (slackUserId, teamId, planType, daysSinceLastUse, properties = {}) =>
    trackEvent('returning_user', slackUserId, teamId, { days_since_last_use: daysSinceLastUse, ...properties }, planType),

  repeatUsageSameDay: (slackUserId, teamId, planType, usageCountToday, properties = {}) =>
    trackEvent('repeat_usage_same_day', slackUserId, teamId, { usage_count_today: usageCountToday, ...properties }, planType),
};

/**
 * Shutdown PostHog client (call this at the end of serverless functions)
 */
export async function shutdownAnalytics() {
  if (posthog) {
    await posthog.shutdown();
  }
}
