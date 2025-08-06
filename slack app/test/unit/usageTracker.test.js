// Tests for usageTracker.js
import { expect } from 'chai';
import esmock from 'esmock';
import * as aws from '@aws-sdk/client-dynamodb';

// Import shared test utilities
import { setupDynamoDBTestEnv, restoreEnvironment } from '../fixtures/testHelpers.js';
import { createMockDynamoDBClient, createMockAnalytics } from '../fixtures/mockServices.js';
import { testUsers, testTeams, usageData } from '../fixtures/mockData.js';

// Import the module under test with mocks
let usageTrackerModule;
let getUserUsage, canUserDraw, incrementUsage, isApproachingLimit, getUsageMessage;
let mockDynamoDBClient, mockSend, mockAnalytics;

describe('usageTracker', () => {
  let originalEnv;

  beforeEach(async () => {
    // Set up test environment
    originalEnv = setupDynamoDBTestEnv();
    
    // Create fresh mocks for each test
    const dynamoMock = createMockDynamoDBClient();
    mockDynamoDBClient = dynamoMock.mockDynamoDBClient;
    mockSend = dynamoMock.mockSend;
    mockAnalytics = createMockAnalytics();
    
    // Use esmock to mock the ES modules and import usageTracker
    usageTrackerModule = await esmock('../../usageTracker.js', {
      '@aws-sdk/client-dynamodb': mockDynamoDBClient,
      '../../analytics.js': mockAnalytics
    });
    
    // Extract the functions we need to test
    ({ getUserUsage, canUserDraw, incrementUsage, isApproachingLimit, getUsageMessage } = usageTrackerModule);
  });

  afterEach(() => {
    // Restore original environment
    restoreEnvironment(originalEnv);
  });

  describe('getUserUsage', () => {
    it('should return existing usage record', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      const mockUsageData = {
        Item: {
          usageCount: { N: usageData.freeUserUsage.usageCount.toString() },
          planType: { S: usageData.freeUserUsage.planType },
          lastUsed: { S: usageData.freeUserUsage.lastUsed }
        }
      };
      mockSend.resolves(mockUsageData);

      // Act
      const result = await getUserUsage(userId, teamId);

      // Assert
      expect(result).to.deep.include({
        userId,
        teamId,
        usageCount: usageData.freeUserUsage.usageCount,
        planType: usageData.freeUserUsage.planType,
        lastUsed: usageData.freeUserUsage.lastUsed
      });
      expect(result.month).to.match(/^\d{4}-\d{2}$/); // YYYY-MM format
      
      // Verify correct DynamoDB command
      expect(mockSend.calledOnce).to.be.true;
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.GetItemCommand);
      expect(command.input.Key.type.S).to.equal('usage');
    });

    it('should return default usage record when none exists', async () => {
      // Arrange
      const userId = testUsers.user3.id;
      const teamId = testTeams.team2.id;
      mockSend.resolves({}); // No Item in response

      // Act
      const result = await getUserUsage(userId, teamId);

      // Assert
      expect(result).to.deep.include({
        userId,
        teamId,
        usageCount: 0,
        planType: 'FREE',
        lastUsed: null
      });
      expect(result.month).to.match(/^\d{4}-\d{2}$/);
    });

    it('should handle DynamoDB errors', async () => {
      // Arrange
      const userId = testUsers.user2.id;
      const teamId = testTeams.team1.id;
      const error = new Error('DynamoDB error');
      mockSend.rejects(error);

      // Act & Assert
      try {
        await getUserUsage(userId, teamId);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('canUserDraw', () => {
    it('should allow draw for free user under limit', async () => {
      // Arrange
      const userId = 'U123';
      const teamId = 'T123';
      const mockUsageData = {
        Item: {
          usageCount: { N: '2' },
          planType: { S: 'FREE' }
        }
      };
      mockSend.resolves(mockUsageData);

      // Act
      const result = await canUserDraw(userId, teamId);

      // Assert
      expect(result.allowed).to.be.true;
      expect(result.usage.usageCount).to.equal(2);
      expect(result.limit).to.equal(5);
    });

    it('should deny draw for free user at limit', async () => {
      // Arrange
      const userId = 'U123';
      const teamId = 'T123';
      const mockUsageData = {
        Item: {
          usageCount: { N: '5' },
          planType: { S: 'FREE' }
        }
      };
      mockSend.resolves(mockUsageData);

      // Act
      const result = await canUserDraw(userId, teamId);

      // Assert
      expect(result.allowed).to.be.false;
      expect(result.usage.usageCount).to.equal(5);
      expect(result.limit).to.equal(5);
      
      // Should track post-limit attempt
      expect(mockAnalytics.Analytics.postLimitAttempt.calledOnce).to.be.true;
    });

    it('should always allow draw for paid user', async () => {
      // Arrange
      const userId = 'U123';
      const teamId = 'T123';
      const mockUsageData = {
        Item: {
          usageCount: { N: '100' },
          planType: { S: 'PAID' }
        }
      };
      mockSend.resolves(mockUsageData);

      // Act
      const result = await canUserDraw(userId, teamId);

      // Assert
      expect(result.allowed).to.be.true;
      expect(result.usage.planType).to.equal('PAID');
    });
  });

  describe('incrementUsage', () => {
    it('should increment existing usage record', async () => {
      // Arrange
      const userId = 'U123';
      const teamId = 'T123';
      const planType = 'FREE';
      const mockUpdateResult = {
        Attributes: {
          usageCount: { N: '3' },
          planType: { S: 'FREE' },
          lastUsed: { S: '2025-08-03T10:00:00.000Z' }
        }
      };
      mockSend.resolves(mockUpdateResult);

      // Act
      const result = await incrementUsage(userId, teamId, planType);

      // Assert
      expect(result).to.deep.include({
        userId,
        teamId,
        usageCount: 3,
        planType: 'FREE'
      });
      
      // Verify correct DynamoDB command
      expect(mockSend.calledOnce).to.be.true;
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.UpdateItemCommand);
      expect(command.input.UpdateExpression).to.include('ADD usageCount :inc');
    });

    it('should create new usage record if update fails', async () => {
      // Arrange
      const userId = 'U456';
      const teamId = 'T456';
      const planType = 'FREE';
      const validationError = new Error('ValidationException');
      validationError.name = 'ValidationException';
      
      // First call (update) fails, second call (put) succeeds
      mockSend.onFirstCall().rejects(validationError);
      mockSend.onSecondCall().resolves({});

      // Act
      const result = await incrementUsage(userId, teamId, planType);

      // Assert
      expect(result).to.deep.include({
        userId,
        teamId,
        usageCount: 1,
        planType: 'FREE'
      });
      
      // Should have made two calls: update then put
      expect(mockSend.calledTwice).to.be.true;
      const putCommand = mockSend.secondCall.args[0];
      expect(putCommand).to.be.an.instanceOf(aws.PutItemCommand);
      
      // Should track first time user
      expect(mockAnalytics.Analytics.firstTimeUser.calledOnce).to.be.true;
    });

    it('should track usage milestones', async () => {
      // Arrange - simulate user at limit
      const userId = 'U123';
      const teamId = 'T123';
      const planType = 'FREE';
      const mockUpdateResult = {
        Attributes: {
          usageCount: { N: '5' },
          planType: { S: 'FREE' },
          lastUsed: { S: '2025-08-03T10:00:00.000Z' }
        }
      };
      mockSend.resolves(mockUpdateResult);

      // Act
      const result = await incrementUsage(userId, teamId, planType);

      // Assert
      expect(result.usageCount).to.equal(5);
      
      // Should track usage limit reached
      expect(mockAnalytics.Analytics.usageLimitReached.calledOnce).to.be.true;
    });
  });

  describe('isApproachingLimit', () => {
    it('should return false for paid users', () => {
      const usage = { planType: 'PAID', usageCount: 100 };
      expect(isApproachingLimit(usage)).to.be.false;
    });

    it('should return true for free users at 4/5 limit', () => {
      const usage = { planType: 'FREE', usageCount: 4 };
      expect(isApproachingLimit(usage, 5)).to.be.true;
    });

    it('should return false for free users below warning threshold', () => {
      const usage = { planType: 'FREE', usageCount: 2 };
      expect(isApproachingLimit(usage, 5)).to.be.false;
    });
  });

  describe('getUsageMessage', () => {
    it('should return unlimited message for paid users', () => {
      const usage = { planType: 'PAID', usageCount: 10 };
      const message = getUsageMessage(usage);
      expect(message).to.include('unlimited draws');
    });

    it('should return remaining count for free users', () => {
      const usage = { planType: 'FREE', usageCount: 2 };
      const message = getUsageMessage(usage, 5);
      expect(message).to.include('3 draws remaining');
      expect(message).to.include('2/5 used');
    });

    it('should return singular form for 1 remaining', () => {
      const usage = { planType: 'FREE', usageCount: 4 };
      const message = getUsageMessage(usage, 5);
      expect(message).to.include('1 draw remaining');
    });

    it('should return limit reached message', () => {
      const usage = { planType: 'FREE', usageCount: 5 };
      const message = getUsageMessage(usage, 5);
      expect(message).to.include('used all 5 of your free draws');
    });
  });
});
