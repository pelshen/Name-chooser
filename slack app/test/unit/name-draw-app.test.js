// Import testing libraries
import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach, afterEach } from 'mocha';
import esmock from 'esmock';

// We'll use esmock to mock the ES modules
let NameDrawApp;
let mockUsageTracker;
let mockAnalytics;

describe('Name Draw App', () => {
  // Setup mocks
  let mockApp;
  let mockClient;
  let mockLogger;
  let nameDrawApp;
  
  beforeEach(async () => {
    // Create mock usage tracker
    mockUsageTracker = {
      canUserDraw: sinon.stub().resolves({
        allowed: true,
        usage: {
          userId: 'U001',
          teamId: 'T001',
          month: '2025-08',
          usageCount: 2,
          planType: 'FREE',
          lastUsed: '2025-08-03T09:00:00.000Z'
        },
        limit: 5
      }),
      incrementUsage: sinon.stub().resolves({
        userId: 'U001',
        teamId: 'T001',
        month: '2025-08',
        usageCount: 3,
        planType: 'FREE',
        lastUsed: '2025-08-03T09:54:00.000Z'
      }),
      isApproachingLimit: sinon.stub().returns(false),
      getUsageMessage: sinon.stub().returns('You have 2 draws remaining this month (3/5 used).')
    };
    
    // Create mock analytics
    mockAnalytics = {
      Analytics: {
        drawExecuted: sinon.stub().resolves(),
        reasonProvided: sinon.stub().resolves(),
        largeDrawAttempted: sinon.stub().resolves(),
        modalOpened: sinon.stub().resolves(),
        usageLimitReached: sinon.stub().resolves(),
        usageLimitWarning: sinon.stub().resolves()
      }
    };
    
    // Use esmock to mock the ES modules and import NameDrawApp
    const { NameDrawApp: MockedNameDrawApp } = await esmock('../../name-draw-app.js', {
      '../../usageTracker.js': mockUsageTracker,
      '../../analytics.js': mockAnalytics
    });
    
    NameDrawApp = MockedNameDrawApp;
    
    // Create a mock Slack app with the methods we'll use
    mockApp = {
      shortcut: sinon.stub().callsFake((id, callback) => {
        // Store the callback for later testing
        mockApp.shortcutCallbacks = mockApp.shortcutCallbacks || {};
        mockApp.shortcutCallbacks[id] = callback;
      }),
      command: sinon.stub().callsFake((cmd, callback) => {
        mockApp.commandCallback = callback;
      }),
      view: sinon.stub().callsFake((id, callback) => {
        mockApp.viewCallbacks = mockApp.viewCallbacks || {};
        mockApp.viewCallbacks[id] = callback;
      }),
      action: sinon.stub().callsFake((id, callback) => {
        mockApp.actionCallbacks = mockApp.actionCallbacks || {};
        mockApp.actionCallbacks[id] = callback;
      })
    };
    
    // Set up mock client for testing callbacks
    mockClient = {
      views: {
        open: sinon.stub().resolves({ ok: true }),
        update: sinon.stub().resolves({ ok: true })
      },
      conversations: {
        join: sinon.stub().resolves({ ok: true })
      },
      chat: {
        postMessage: sinon.stub().resolves({ ok: true })
      },
      usergroups: {
        users: {
          list: sinon.stub().resolves({ ok: true, users: ['U123', 'U456'] })
        }
      }
    };
    
    // Mock logger
    mockLogger = {
      error: sinon.spy()
    };
    
    // Create the app instance with our mock
    nameDrawApp = new NameDrawApp(mockApp);
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('getRandomInt', () => {
    it('should return a number within the specified range', () => {
      const min = 0;
      const max = 10;
      
      // Test multiple times to ensure it works consistently
      for (let i = 0; i < 100; i++) {
        const result = nameDrawApp.getRandomInt(min, max);
        expect(result).to.be.at.least(min);
        expect(result).to.be.lessThan(max);
      }
    });
  });
  
  describe('chosenNamePost', () => {
    it('should format the message correctly', () => {
      const conversation = 'C12345';
      const msg = 'Test message';
      const contextMsg = 'Test context';
      
      const result = nameDrawApp.chosenNamePost(conversation, msg, contextMsg);
      
      // Check the format of the returned message
      expect(result.channel).to.equal(conversation);
      expect(result.text).to.equal(msg);
      expect(result.blocks).to.be.an('array');
      expect(result.blocks[0].text.text).to.equal(msg);
      expect(result.blocks[1].elements[0].text).to.equal(contextMsg);
    });
  });
  
  describe('triggerModal', () => {
    it('should open a modal with prefilled user data', async () => {
      const triggerId = 'test-trigger';
      const prefill = ['U123', 'U456'];
      const manual = false;
      
      await nameDrawApp.triggerModal(triggerId, prefill, manual, mockClient, mockLogger);
      
      // Verify the client was called correctly
      expect(mockClient.views.open.calledOnce).to.be.true;
      
      const callArgs = mockClient.views.open.getCall(0).args[0];
      expect(callArgs.trigger_id).to.equal(triggerId);
      expect(callArgs.view.callback_id).to.equal(nameDrawApp.userInputViewId);
      expect(callArgs.view.blocks[0].element.initial_users).to.deep.equal(prefill);
    });
    
    it('should open a modal with prefilled manual data', async () => {
      const triggerId = 'test-trigger';
      const prefill = ['Name1', 'Name2'];
      const manual = true;
      
      await nameDrawApp.triggerModal(triggerId, prefill, manual, mockClient, mockLogger);
      
      // Verify the client was called correctly
      expect(mockClient.views.open.calledOnce).to.be.true;
      
      const callArgs = mockClient.views.open.getCall(0).args[0];
      expect(callArgs.trigger_id).to.equal(triggerId);
      expect(callArgs.view.callback_id).to.equal(nameDrawApp.manualInputViewId);
      expect(callArgs.view.blocks[0].element.initial_value).to.equal(prefill.join('\r\n'));
    });
    
    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      mockClient.views.open = sinon.stub().rejects(error);
      
      // Call with required userId and teamId parameters
      await nameDrawApp.triggerModal('trigger', null, false, mockClient, mockLogger, 'U123', 'T123');
      
      // The error should be logged (either from usage check failure or modal opening failure)
      expect(mockLogger.error.called).to.be.true;
    });
  });
});
