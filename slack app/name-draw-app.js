import { canUserDraw, incrementUsage, getUsageMessage, isApproachingLimit } from './usageTracker.js';
import { Analytics } from './analytics.js';

/**
 * Name Draw App for Slack
 * This class encapsulates all the functionality for the Name Draw app
 */
export class NameDrawApp {
  constructor(app) {
    this.app = app;
    
    // Block and action IDs
    this.userSelectBlockId = "multi_user_select_block";
    this.userSelectActionId = "multi_users_select_action";
    this.manualInputBlockId = "manual_text_input_block";
    this.manualInputActionId = "manual_text_input_action";
    this.switchToManualActionId = "switch_to_manual_button_action";
    this.switchToUserActionId = "switch_to_user_button_action";
    this.reasonInputBlockId = "reason_input_block";
    this.reasonInputActionId = "reason_input_action";
    this.conversationSelectBlockId = "conversation_select_block";
    this.conversationSelectActionId = "conversation_select_action";
    
    // View IDs
    this.userInputViewId = "user_input_view";
    this.manualInputViewId = "manual_input_view";

    this.envSuffix = process.env.STAGE === 'dev' || process.env.STAGE === 'local' ? 'dev' : '';
    
    // Initialize UI components
    this.initializeUIComponents();
    
    // Register event handlers
    this.registerEventHandlers();
  }
  
  /**
   * Initialize UI components used in the app
   */
  initializeUIComponents() {
    // User selection component
    this.userSelect = {
      "type": "input",
      "block_id": this.userSelectBlockId,
      "element": {
        "type": "multi_users_select",
        "placeholder": {
          "type": "plain_text",
          "text": "Select users"
        },
        "action_id": this.userSelectActionId
      },
      "label": {
        "type": "plain_text",
        "text": "Pick the users you want to be in the draw"
      }
    };

    // Manual text input
    this.manualInput = {
      "type": "input",
      "block_id": this.manualInputBlockId,
      "element": {
        "type": "plain_text_input",
        "multiline": true,
        "action_id": this.manualInputActionId,
        "placeholder": {
          "type": "plain_text",
          "text": "Mabel\nTheresa\nHugo"
        }
      },
      "label": {
        "type": "plain_text",
        "text": "Add the names or values one per line"
      }
    };

    // Switch to manual input button
    this.switchToManualButton = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": " "
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Switch to manual input",
          "emoji": true
        },
        "value": "switch_to_manual",
        "action_id": this.switchToManualActionId
      }
    };

    // Switch to user selection button
    this.switchToUserButton = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": " "
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Switch to user input",
          "emoji": true
        },
        "value": "switch_to_user",
        "action_id": this.switchToUserActionId
      }
    };

    // Reason input field
    this.reasonInput = {
      "type": "input",
      "block_id": this.reasonInputBlockId,
      "optional": true,
      "element": {
        "type": "plain_text_input",
        "action_id": this.reasonInputActionId,
        "placeholder": {
          "type": "plain_text",
          "text": "eg. to run the next meeting"
        }
      },
      "label": {
        "type": "plain_text",
        "text": "What are you choosing them for?"
      }
    };

    // Conversation selection
    this.conversationSelect = {
      "type": "input",
      "block_id": this.conversationSelectBlockId,
      "element": {
        "type": "conversations_select",
        "action_id": this.conversationSelectActionId,
        "placeholder": {
          "type": "plain_text",
          "text": "Find a conversation",
          "emoji": true
        },
        "default_to_current_conversation": true,
        "filter": {
          "include": [
            "public",
            "private"
          ],
          "exclude_bot_users": true
        }
      },
      "label": {
        "type": "plain_text",
        "text": "Select a conversation to post the result to"
      }
    };

    // Modal view for user selection
    this.userInputModalView = {
      "type": "modal",
      "callback_id": this.userInputViewId,
      "title": {
        "type": "plain_text",
        "text": "Name draw"
      },
      "blocks": [
        this.userSelect,
        this.switchToManualButton,
        this.reasonInput,
        this.conversationSelect
      ],
      "submit": {
        "type": "plain_text",
        "text": "Choose!"
      }
    };

    // Modal view for manual input
    this.manualInputModalView = {
      "type": "modal",
      "callback_id": this.manualInputViewId,
      "title": {
        "type": "plain_text",
        "text": "Name draw"
      },
      "blocks": [
        this.manualInput,
        this.switchToUserButton,
        this.reasonInput,
        this.conversationSelect
      ],
      "submit": {
        "type": "plain_text",
        "text": "Choose!"
      }
    };
  }
  
  /**
   * Register all event handlers for the app
   */
  registerEventHandlers() {
    // Register shortcut handlers
    this.app.shortcut('user_choose_shortcut', async ({ shortcut, ack, client, logger }) => {
      await ack();
      const { usage } = await canUserDraw(shortcut.user.id, shortcut.team.id);
      Analytics.shortcutTriggered(shortcut.user.id, shortcut.team.id, usage.planType, 'user_choose_shortcut');
      return await this.triggerModal(shortcut.trigger_id, null, false, client, logger, shortcut.user.id, shortcut.team.id);
    });

    this.app.shortcut('manual_input_shortcut', async ({ shortcut, ack, client, logger }) => {
      await ack();
      const { usage } = await canUserDraw(shortcut.user.id, shortcut.team.id);
      Analytics.shortcutTriggered(shortcut.user.id, shortcut.team.id, usage.planType, 'manual_input_shortcut');
      return await this.triggerModal(shortcut.trigger_id, null, true, client, logger, shortcut.user.id, shortcut.team.id);
    });

    // Register command handler
    this.app.command('/drawnames' + this.envSuffix, async ({ command, ack, client, logger }) => {
      await ack();
      const commandText = command.text.trim();
      let prefill = [];
      let manual = false;
      if (commandText.startsWith('manual')) {
        manual = true;
        prefill = commandText.split(' ').slice(1);
      }
      if (commandText.length > 0) {
        var tokens = commandText.split(' ');
        for (const token of tokens) {
          if (token.startsWith('<@U')) {
            prefill.push(token.slice(token.indexOf('@') + 1, token.indexOf('|')));
          } else if (token.startsWith('<!subteam')) {
            try {
              const result = await client.usergroups.users.list({ usergroup: token.slice(token.indexOf('^') + 1, token.indexOf('|')) });
              if (result.ok) {
                prefill.push(...result.users);
              }
              else {
                logger.error('Error in response getting users for group:' + result.error);
              }
            }
            catch (error) {
              logger.error('Error occurred whilst getting user for group: ' + error);
            }
          } else {
            manual = true;
            prefill.push(token);
          }
        }
      }
      
      // Track slash command usage
      const { usage } = await canUserDraw(command.user_id, command.team_id);
      Analytics.slashCommandInitiated(command.user_id, command.team_id, usage.planType, {
        command_text_length: commandText.length,
        has_prefill: prefill.length > 0,
        prefill_count: prefill.length,
        manual_mode: manual
      });
      
      var result = await this.triggerModal(command.trigger_id, prefill, manual, client, logger, command.user_id, command.team_id);
      return result;
    });

    // Register view submission handlers
    this.app.view(this.userInputViewId, async (params) => {
      return await this.userViewSubmission(params);
    });

    this.app.view(this.manualInputViewId, async (params) => {
      return await this.manualViewSubmission(params);
    });
    
    // Register action handlers
    this.app.action(this.switchToUserActionId, async ({ ack, body, client }) => {
      await ack();

      try {
        const result = await client.views.update({
          view_id: body.view.id,
          hash: body.view.hash,
          view: this.userInputModalView
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.app.action(this.switchToManualActionId, async ({ ack, body, client }) => {
      await ack();

      try {
        const result = await client.views.update({
          view_id: body.view.id,
          hash: body.view.hash,
          view: this.manualInputModalView
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Handle user selection view submission
   * Exposed as a method for testing
   */
  async userViewSubmission({ ack, body, view, client, logger }) {
    const user = body['user']['id'];
    const teamId = body['team']['id'];
    
    try {
      await ack();
      
      // Get current usage to determine plan type, then increment
      const { usage } = await canUserDraw(user, teamId);
      const updatedUsage = await incrementUsage(user, teamId, usage.planType);
      
      const namesSelection = view['state']['values'][this.userSelectBlockId][this.userSelectActionId].selected_users;
      const reason = view['state']['values'][this.reasonInputBlockId][this.reasonInputActionId]['value'];
      const conversation = view['state']['values'][this.conversationSelectBlockId][this.conversationSelectActionId];

      const max = namesSelection.length;
      
      // Track draw execution
      const channelType = conversation.selected_conversation.startsWith('C') ? 'public' : 'private';
      Analytics.drawExecuted({
        slackUserId: user,
        teamId: teamId,
        planType: updatedUsage.planType,
        drawSize: max,
        hasReason: !!reason,
        channelType: channelType,
        usageCount: updatedUsage.usageCount,
        properties: {
          input_method: 'user_selection',
          selected_users_count: max
        }
      });
      
      // Track reason provided if applicable
      if (reason && reason.trim()) {
        Analytics.reasonProvided(user, teamId, updatedUsage.planType, reason.trim().length, {}, client);
      }
      
      // Track large draw if applicable
      if (max > 10) {
        Analytics.largeDrawAttempted(user, teamId, updatedUsage.planType, max, {}, client);
      }

      // Message to send
      let msg = `<@${namesSelection[this.getRandomInt(0, max)]}> was chosen at random${reason ? ' *' + reason + '*' : ''}!`;
      let userList = namesSelection.reduce((prev, curr, index, arr) =>
        `${index === 0 ? '' : prev + (index === arr.length - 1 ? ' and ' : ', ')}<@${curr}>`,
        '');
      let contextMsg = `${userList} were included in the draw. Draw performed by <@${user}>.`;
      
      // Add usage info if approaching limit (only for free users after this draw)
      if (isApproachingLimit(updatedUsage)) {
        contextMsg += `\n\n⚠️ ${getUsageMessage(updatedUsage)}`;
      }

      // Message the channel specified, try to join first
      try {
        await client.conversations.join({ channel: conversation.selected_conversation });
      }
      catch (error) {
        logger.error(error);
      }
      try {
        await client.chat.postMessage(this.chosenNamePost(conversation.selected_conversation, msg, contextMsg));
      }
      catch (error) {
        logger.error(error);
      }
    } catch (error) {
      logger.error('Error in userViewSubmission:', error);
      await ack({
        response_action: 'errors',
        errors: {
          [this.userSelectBlockId]: 'An error occurred. Please try again.'
        }
      });
    }
  }
  
  /**
   * Handle manual input view submission
   * Exposed as a method for testing
   */
  async manualViewSubmission({ ack, body, view, client, logger }) {
    const user = body['user']['id'];
    const teamId = body['team']['id'];
    
    try {
      await ack();
      
      // Get current usage to determine plan type, then increment
      const { usage } = await canUserDraw(user, teamId);
      const updatedUsage = await incrementUsage(user, teamId, usage.planType);

      const rawTextInput = view['state']['values'][this.manualInputBlockId][this.manualInputActionId]['value'];
      const inputArray = rawTextInput.split(/\r?\n/).map((val) => val.trim());
      const reason = view['state']['values'][this.reasonInputBlockId][this.reasonInputActionId]['value'];
      const conversation = view['state']['values'][this.conversationSelectBlockId][this.conversationSelectActionId];

      const max = inputArray.length;
      
      // Track draw execution
      const channelType = conversation.selected_conversation.startsWith('C') ? 'public' : 'private';
      Analytics.drawExecuted({
        slackUserId: user,
        teamId: teamId,
        planType: updatedUsage.planType,
        drawSize: max,
        hasReason: !!reason,
        channelType: channelType,
        usageCount: updatedUsage.usageCount,
        properties: {
          input_method: 'manual_input',
          input_items_count: max,
          total_input_length: rawTextInput.length
        }
      });
      
      // Track reason provided if applicable
      if (reason && reason.trim()) {
        Analytics.reasonProvided(user, teamId, updatedUsage.planType, reason.trim().length, {}, client);
      }
      
      // Track large draw if applicable
      if (max > 10) {
        Analytics.largeDrawAttempted(user, teamId, updatedUsage.planType, max, {}, client);
      }

      // Message to send
      let msg = `_*${inputArray[this.getRandomInt(0, max)]}*_ was chosen at random${reason ? ' *' + reason + '*' : ''}!`;
      let inputList = inputArray.reduce((prev, curr, index, arr) =>
        `${index === 0 ? '' : prev + (index === arr.length - 1 ? ' and ' : ', ')}${curr}`,
        '');
      let contextMsg = `${inputList} were included in the draw. Draw performed by <@${user}>.`;
      
      // Add usage info if approaching limit (only for free users after this draw)
      if (isApproachingLimit(updatedUsage)) {
        contextMsg += `\n\n⚠️ ${getUsageMessage(updatedUsage)}`;
      }

      // Message the channel specified, try to join first
      try {
        await client.conversations.join({ channel: conversation.selected_conversation });
      }
      catch (error) {
        logger.error(error);
      }
      try {
        await client.chat.postMessage(this.chosenNamePost(conversation.selected_conversation, msg, contextMsg));
      }
      catch (error) {
        logger.error(error);
      }
    } catch (error) {
      logger.error('Error in manualViewSubmission:', error);
      await ack({
        response_action: 'errors',
        errors: {
          [this.manualInputBlockId]: 'An error occurred. Please try again.'
        }
      });
    }
  }
  
  /**
   * Trigger the modal dialog
   */
  async triggerModal(triggerId, prefill, manual, client, logger, userId, teamId) {
    // Check usage limits before showing the modal
    try {
      const { allowed, usage, limit } = await canUserDraw(userId, teamId);
      
      if (!allowed) {
        // Track limit reached event
        Analytics.usageLimitReached(userId, teamId, usage.planType, usage.usageCount, limit, { context: 'modal_trigger' });
        
        // Send ephemeral message instead of showing modal
        await client.chat.postEphemeral({
          channel: userId, // DM the user
          user: userId,
          text: `🚫 You've reached your limit of ${limit} draws this month!`,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `🚫 *You've reached your limit of ${limit} draws this month!*\n\nPaid plans with unlimited draws coming soon! 🎉`
              }
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `📊 *Usage this month:* ${usage.usageCount}/${limit} draws used`
              }
            }
          ]
        });
        return { ok: false, error: 'usage_limit_reached' };
      }
      
      // Track modal opened
      const inputMethod = manual ? 'manual' : 'user_selection';
      Analytics.modalOpened(userId, teamId, usage.planType, inputMethod, {
        has_prefill: prefill && prefill.length > 0,
        prefill_count: prefill ? prefill.length : 0,
        approaching_limit: isApproachingLimit(usage)
      }, client);
      
      // Show usage warning if approaching limit
      const view = manual ? { ...this.manualInputModalView } : { ...this.userInputModalView };
      
      // Add usage info to modal if approaching limit
      if (isApproachingLimit(usage)) {
        Analytics.usageLimitWarning(userId, teamId, usage.planType, usage.usageCount, FREE_PLAN_MONTHLY_LIMIT, { context: 'modal_display' });
        const warningBlock = {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `⚠️ ${getUsageMessage(usage)}`
          }
        };
        view.blocks.push(warningBlock);
      }
      
      if (prefill) {
        if (manual) {
          view.blocks[0].element.initial_value = prefill.join('\r\n');
        } else {
          view.blocks[0].element.initial_users = prefill;
        }
      }

      // Call views.open with the built-in client
      const result = await client.views.open({
        trigger_id: triggerId,
        view: view
      });
      return result;
    }
    catch (error) {
      logger.error('Error in triggerModal:', error);
      // Fallback - show modal anyway if usage check fails
      const view = manual ? { ...this.manualInputModalView } : { ...this.userInputModalView };
      if (prefill) {
        if (manual) {
          view.blocks[0].element.initial_value = prefill.join('\r\n');
        } else {
          view.blocks[0].element.initial_users = prefill;
        }
      }
      
      try {
        const result = await client.views.open({
          trigger_id: triggerId,
          view: view
        });
        return result;
      }
      catch (modalError) {
        logger.error('Error opening modal:', modalError);
        return { ok: false, error: modalError };
      }
    }
  }
  
  /**
   * Format the message to post in the channel
   */
  chosenNamePost(conversation, msg, contextMsg) {
    return {
      channel: conversation,
      text: msg,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": msg
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": contextMsg
            }
          ]
        }
      ]
    };
  }
  
  /**
   * Get a random integer between min (inclusive) and max (exclusive)
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }
}
