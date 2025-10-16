// Import testing libraries
import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach, afterEach } from 'mocha';
import esmock from 'esmock';

// Import shared test utilities
import { createMockUsageTracker, createMockAnalytics, createMockSlackApp, createMockSlackClient } from '../fixtures/mockServices.js';
import { testUsers, testTeams, usageData } from '../fixtures/mockData.js';

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
    // Create shared mocks using utilities
    mockUsageTracker = createMockUsageTracker({
      customStubs: {
        canUserDraw: sinon.stub().resolves({
          allowed: true,
          usage: usageData.freeUserUsage,
          limit: 5
        }),
        incrementUsage: sinon.stub().resolves(usageData.incrementedUsage)
      }
    });
    
    mockAnalytics = createMockAnalytics();
    
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
    
    it('should display approaching-limit warning and track Analytics.usageLimitWarning with correct limit', async () => {
      const triggerId = 'test-trigger';
      const nearLimitUsage = { ...usageData.freeUserUsage, usageCount: 4, planType: 'FREE' };
      mockUsageTracker.canUserDraw.resolves({ allowed: true, usage: nearLimitUsage, limit: 5 });
      mockUsageTracker.isApproachingLimit.returns(true);

      await nameDrawApp.triggerModal(triggerId, null, false, mockClient, mockLogger, testUsers.user1.id, testTeams.team1.id);

      // Validate the views.open payload includes a warning block
      expect(mockClient.views.open.calledOnce).to.be.true;
      const callArgs = mockClient.views.open.getCall(0).args[0];
      const blocks = callArgs.view.blocks;
      const warning = blocks.find(b => b.type === 'section' && b.text && b.text.text && b.text.text.includes('⚠️'));
      expect(warning).to.exist;

      // Validate analytics warning uses the limit from canUserDraw
      expect(mockAnalytics.Analytics.usageLimitWarning.calledWith(
        testUsers.user1.id,
        testTeams.team1.id,
        nearLimitUsage.planType,
        nearLimitUsage.usageCount,
        5,
        sinon.match.object
      )).to.be.true;
    });
  });

  describe('manualViewSubmission', () => {
    let ack;

    function buildViewPayload(appInstance, rawTextInput, reason = 'for fun', channel = 'C12345') {
      return {
        state: {
          values: {
            [appInstance.manualInputBlockId]: {
              [appInstance.manualInputActionId]: { value: rawTextInput }
            },
            [appInstance.reasonInputBlockId]: {
              [appInstance.reasonInputActionId]: { value: reason }
            },
            [appInstance.conversationSelectBlockId]: {
              [appInstance.conversationSelectActionId]: { selected_conversation: channel }
            }
          }
        }
      };
    }

    beforeEach(() => {
      ack = sinon.stub().resolves();
    });

    it('trims input lines and skips blank/whitespace-only lines', async () => {
      const raw = '  Alice  \n\n Bob\n \nCharlie  \n';
      const view = buildViewPayload(nameDrawApp, raw);
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      // deterministic selection: pick Bob (index 1 after filtering)
      sinon.stub(nameDrawApp, 'getRandomInt').returns(1);

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      expect(ack.calledOnce).to.be.true;
      expect(mockClient.conversations.join.calledWith({ channel: 'C12345' })).to.be.true;

      const payload = mockClient.chat.postMessage.getCall(0).args[0];
      expect(payload.text).to.contain('_*Bob*_');

      const context = payload.blocks[1].elements[0].text;
      expect(context).to.contain('Alice, Bob and Charlie');

      expect(mockAnalytics.Analytics.drawExecuted.called).to.be.true;
      const drawArgs = mockAnalytics.Analytics.drawExecuted.getCall(0).args[0];
      expect(drawArgs.drawSize).to.equal(3);
      expect(drawArgs.properties.input_items_count).to.equal(3);
    });

    it('preserves special characters and unicode in output', async () => {
      const names = [
        'José',
        "O'Connor",
        'Acme™',
        'Alice & Bob',
        'Nord—Ångström',
        'Emoji 😀',
        'A_B*C'
      ];
      const raw = names.join('\n');
      const view = buildViewPayload(nameDrawApp, raw, 'special test');
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      sinon.stub(nameDrawApp, 'getRandomInt').returns(0);

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      const payload = mockClient.chat.postMessage.getCall(0).args[0];
      expect(payload.text).to.contain('_*José*_');

      const context = payload.blocks[1].elements[0].text;
      names.forEach(n => expect(context).to.contain(n));
      expect(context).to.match(/José, O'Connor, Acme™, Alice & Bob, Nord—Ångström, Emoji 😀 and A_B\*C/);
    });

    it('returns a field error when no valid items are provided', async () => {
      const raw = '   \n\r\n   ';
      const view = buildViewPayload(nameDrawApp, raw);
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      // first ack happens at start; second should include errors
      expect(ack.callCount).to.be.greaterThan(1);
      const errorAck = ack.getCall(1).args[0];
      expect(errorAck.response_action).to.equal('errors');
      expect(errorAck.errors).to.have.property(nameDrawApp.manualInputBlockId);
      // no message should be posted
      expect(mockClient.chat.postMessage.called).to.be.false;
    });

    it('includes approaching-limit warning in context for manual input', async () => {
      // Force approaching-limit
      mockUsageTracker.isApproachingLimit.returns(true);
      mockUsageTracker.getUsageMessage.returns('You have only 1 draw left');

      const raw = 'Alice\nBob';
      const view = buildViewPayload(nameDrawApp, raw);
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      // choose deterministic index
      sinon.stub(nameDrawApp, 'getRandomInt').returns(0);

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      const payload = mockClient.chat.postMessage.getCall(0).args[0];
      const context = payload.blocks[1].elements[0].text;
      expect(context).to.contain('⚠️');
      expect(context).to.contain('You have only 1 draw left');
    });

    it('logs an error when chat.postMessage fails', async () => {
      const raw = 'Alice\nBob';
      const view = buildViewPayload(nameDrawApp, raw);
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      // make postMessage fail
      mockClient.chat.postMessage.rejects(new Error('post failed'));

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      expect(mockLogger.error.called).to.be.true;
    });

    it('caps extremely large manual input to 200 items and warns', async () => {
      // Build 210 items
      const names = Array.from({ length: 210 }, (_, i) => `Name${i + 1}`);
      const raw = names.join('\n');
      const view = buildViewPayload(nameDrawApp, raw);
      const body = { user: { id: testUsers.user1.id }, team: { id: testTeams.team1.id } };

      // deterministic selection
      sinon.stub(nameDrawApp, 'getRandomInt').returns(0);

      await nameDrawApp.manualViewSubmission({ ack, body, view, client: mockClient, logger: mockLogger });

      // Validate message payload and cap warning
      const payload = mockClient.chat.postMessage.getCall(0).args[0];
      const context = payload.blocks[1].elements[0].text;
      expect(context).to.contain('Input capped to first 200 items (210 provided).');

      // Analytics should reflect capped size of 200
      const drawArgs = mockAnalytics.Analytics.drawExecuted.getCall(0).args[0];
      expect(drawArgs.drawSize).to.equal(200);
      expect(drawArgs.properties.input_items_count).to.equal(200);
    });
  });
});
