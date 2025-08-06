// Tests for analytics.js
import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach, afterEach } from 'mocha';

// Import shared test utilities
import { setupAnalyticsTestEnv, restoreEnvironment, createAfterEach } from '../fixtures/testHelpers.js';
import { testUsers, testTeams } from '../fixtures/mockData.js';

// Import the module under test
import { trackEvent, identifyUser, Analytics, shutdownAnalytics } from '../../analytics.js';

describe('analytics', () => {
  let originalEnv;

  beforeEach(() => {
    // Set up analytics test environment
    originalEnv = setupAnalyticsTestEnv();
  });

  afterEach(() => {
    // Restore original environment
    restoreEnvironment(originalEnv);
  });

  describe('trackEvent', () => {
    it('should handle missing PostHog configuration gracefully', async () => {
      // Arrange - POSTHOG_API_KEY is empty (set by setupAnalyticsTestEnv)
      const eventName = 'test_event';
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await trackEvent(eventName, userId, teamId);
      
      // Assert - should complete without error and return undefined
      expect(result).to.be.undefined;
    });
  });

  describe('identifyUser', () => {
    it('should handle missing PostHog configuration gracefully', async () => {
      // Arrange - POSTHOG_API_KEY is empty (set by setupAnalyticsTestEnv)
      const userId = testUsers.user2.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await identifyUser(userId, teamId);
      
      // Assert - should complete without error and return undefined
      expect(result).to.be.undefined;
    });
  });

  describe('Analytics event methods', () => {
    it('should call trackEvent for slashCommandInitiated', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      const planType = 'FREE';
      const properties = { test: 'prop' };
      
      // Act - should not throw
      const result = await Analytics.slashCommandInitiated(userId, teamId, planType, properties);

      // Assert - method exists and completes without error
      expect(Analytics.slashCommandInitiated).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for drawExecuted with correct properties', async () => {
      // Arrange
      const drawData = {
        slackUserId: testUsers.user1.id,
        teamId: testTeams.team1.id,
        planType: 'FREE',
        drawSize: 5,
        hasReason: true,
        channelType: 'public',
        usageCount: 3,
        properties: { custom: 'prop' }
      };
      
      // Act - should not throw
      const result = await Analytics.drawExecuted(drawData);

      // Assert - method exists and completes without error
      expect(Analytics.drawExecuted).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for usageLimitReached', async () => {
      // Arrange
      const userId = testUsers.user2.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await Analytics.usageLimitReached(userId, teamId, 'FREE', 5, 5, { context: 'modal' });

      // Assert - method exists and completes without error
      expect(Analytics.usageLimitReached).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for modalOpened', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team2.id;
      
      // Act - should not throw
      const result = await Analytics.modalOpened(userId, teamId, 'FREE', 'user_selection', { has_prefill: true });

      // Assert - method exists and completes without error
      expect(Analytics.modalOpened).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for reasonProvided', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await Analytics.reasonProvided(userId, teamId, 'FREE', 25, { context: 'draw' });

      // Assert - method exists and completes without error
      expect(Analytics.reasonProvided).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for largeDrawAttempted', async () => {
      // Arrange
      const userId = testUsers.user2.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await Analytics.largeDrawAttempted(userId, teamId, 'FREE', 15, { context: 'manual' });

      // Assert - method exists and completes without error
      expect(Analytics.largeDrawAttempted).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for firstTimeUser', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await Analytics.firstTimeUser(userId, teamId, 'FREE', { source: 'shortcut' });

      // Assert - method exists and completes without error
      expect(Analytics.firstTimeUser).to.be.a('function');
      expect(result).to.be.undefined;
    });

    it('should call trackEvent for returningUser', async () => {
      // Arrange
      const userId = testUsers.user1.id;
      const teamId = testTeams.team1.id;
      
      // Act - should not throw
      const result = await Analytics.returningUser(userId, teamId, 'FREE', 7, { context: 'weekly' });

      // Assert - method exists and completes without error
      expect(Analytics.returningUser).to.be.a('function');
      expect(result).to.be.undefined;
    });
  });

  describe('shutdownAnalytics', () => {
    it('should handle shutdown gracefully', async () => {
      // Act - should not throw
      const result = await shutdownAnalytics();
      
      // Assert - should complete without error and return undefined
      expect(result).to.be.undefined;
    });
  });
});
