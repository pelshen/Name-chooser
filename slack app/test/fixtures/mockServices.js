/**
 * Reusable service mocks used across multiple test files
 */
import sinon from 'sinon';
import * as aws from '@aws-sdk/client-dynamodb';
import { usageData, testUsers, testTeams } from './mockData.js';

/**
 * Creates a mock DynamoDB client with configurable responses
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock DynamoDB client and send stub
 */
export function createMockDynamoDBClient(options = {}) {
  const mockSend = sinon.stub();
  
  const mockDynamoDBClient = {
    DynamoDBClient: class {
      constructor() {}
      send = mockSend
    },
    PutItemCommand: aws.PutItemCommand,
    GetItemCommand: aws.GetItemCommand,
    UpdateItemCommand: aws.UpdateItemCommand,
    DeleteItemCommand: aws.DeleteItemCommand
  };

  // Configure default responses
  if (options.getUserUsageResponse) {
    mockSend.withArgs(sinon.match.instanceOf(aws.GetItemCommand))
           .resolves({ Item: options.getUserUsageResponse });
  }

  if (options.putItemResponse) {
    mockSend.withArgs(sinon.match.instanceOf(aws.PutItemCommand))
           .resolves(options.putItemResponse);
  }

  if (options.updateItemResponse) {
    mockSend.withArgs(sinon.match.instanceOf(aws.UpdateItemCommand))
           .resolves(options.updateItemResponse);
  }

  if (options.deleteItemResponse) {
    mockSend.withArgs(sinon.match.instanceOf(aws.DeleteItemCommand))
           .resolves(options.deleteItemResponse);
  }

  // Configure error responses
  if (options.throwError) {
    mockSend.rejects(new Error(options.errorMessage || 'DynamoDB error'));
  }

  return { mockDynamoDBClient, mockSend };
}

/**
 * Creates a mock Analytics service with all required methods
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock Analytics service
 */
export function createMockAnalytics(options = {}) {
  const mockAnalytics = {
    Analytics: {
      // User flow events
      slashCommandInitiated: sinon.stub().resolves(),
      drawExecuted: sinon.stub().resolves(),
      reasonProvided: sinon.stub().resolves(),
      largeDrawAttempted: sinon.stub().resolves(),
      modalOpened: sinon.stub().resolves(),
      
      // Usage tracking events
      firstTimeUser: sinon.stub().resolves(),
      returningUser: sinon.stub().resolves(),
      repeatUsageSameDay: sinon.stub().resolves(),
      usageLimitWarning: sinon.stub().resolves(),
      usageLimitReached: sinon.stub().resolves(),
      postLimitAttempt: sinon.stub().resolves()
    }
  };

  // Configure custom responses if provided
  if (options.customStubs) {
    Object.keys(options.customStubs).forEach(method => {
      if (mockAnalytics.Analytics[method]) {
        mockAnalytics.Analytics[method] = options.customStubs[method];
      }
    });
  }

  return mockAnalytics;
}

/**
 * Creates a mock Slack app with all required methods
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock Slack app
 */
export function createMockSlackApp(options = {}) {
  const mockApp = {
    shortcut: sinon.stub(),
    command: sinon.stub(),
    view: sinon.stub(),
    action: sinon.stub(),
    
    // Store callbacks for testing
    shortcutCallbacks: {},
    viewCallbacks: {},
    commandCallback: null,
    actionCallback: null
  };

  // Configure callback storage
  mockApp.shortcut.callsFake((id, callback) => {
    mockApp.shortcutCallbacks[id] = callback;
  });

  mockApp.command.callsFake((cmd, callback) => {
    mockApp.commandCallback = callback;
  });

  mockApp.view.callsFake((id, callback) => {
    mockApp.viewCallbacks[id] = callback;
  });

  mockApp.action.callsFake((id, callback) => {
    mockApp.actionCallback = callback;
  });

  return mockApp;
}

/**
 * Creates a mock Slack client with views and other APIs
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock Slack client
 */
export function createMockSlackClient(options = {}) {
  const mockClient = {
    views: {
      open: sinon.stub().resolves({ ok: true }),
      update: sinon.stub().resolves({ ok: true }),
      publish: sinon.stub().resolves({ ok: true })
    },
    chat: {
      postMessage: sinon.stub().resolves({ ok: true, ts: '1234567890.123456' }),
      update: sinon.stub().resolves({ ok: true }),
      delete: sinon.stub().resolves({ ok: true })
    },
    users: {
      info: sinon.stub().resolves({ 
        ok: true, 
        user: { 
          id: testUsers.user1.id, 
          name: testUsers.user1.name,
          real_name: 'Test User 1'
        } 
      }),
      list: sinon.stub().resolves({ 
        ok: true, 
        members: [
          { id: testUsers.user1.id, name: testUsers.user1.name },
          { id: testUsers.user2.id, name: testUsers.user2.name }
        ] 
      })
    }
  };

  // Configure custom responses if provided
  if (options.viewsOpenResponse) {
    mockClient.views.open.resolves(options.viewsOpenResponse);
  }

  if (options.chatPostMessageResponse) {
    mockClient.chat.postMessage.resolves(options.chatPostMessageResponse);
  }

  if (options.throwViewsError) {
    mockClient.views.open.rejects(new Error(options.viewsErrorMessage || 'Views API error'));
  }

  return mockClient;
}

/**
 * Creates a mock Usage Tracker with all required methods
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock Usage Tracker
 */
export function createMockUsageTracker(options = {}) {
  const mockUsageTracker = {
    canUserDraw: sinon.stub().resolves({
      allowed: true,
      usage: usageData.freeUserUsage,
      limit: 5
    }),
    incrementUsage: sinon.stub().resolves(usageData.incrementedUsage),
    getUserUsage: sinon.stub().resolves(usageData.freeUserUsage),
    isApproachingLimit: sinon.stub().returns(false),
    getUsageMessage: sinon.stub().returns('You have 2 draws remaining this month (3/5 used).')
  };

  // Configure custom responses
  if (options.userAtLimit) {
    mockUsageTracker.canUserDraw.resolves({
      allowed: false,
      usage: usageData.freeUserAtLimit,
      limit: 5
    });
    mockUsageTracker.isApproachingLimit.returns(true);
    mockUsageTracker.getUsageMessage.returns('You have reached your monthly limit of 5 draws');
  }

  if (options.paidUser) {
    mockUsageTracker.canUserDraw.resolves({
      allowed: true,
      usage: usageData.paidUserUsage,
      limit: -1
    });
    mockUsageTracker.isApproachingLimit.returns(false);
    mockUsageTracker.getUsageMessage.returns('Unlimited draws available');
  }

  if (options.customStubs) {
    Object.keys(options.customStubs).forEach(method => {
      if (mockUsageTracker[method]) {
        mockUsageTracker[method] = options.customStubs[method];
      }
    });
  }

  return mockUsageTracker;
}

/**
 * Creates a mock logger for testing
 * @param {Object} options - Configuration options for the mock
 * @returns {Object} Mock logger
 */
export function createMockLogger(options = {}) {
  return {
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    debug: sinon.stub()
  };
}
