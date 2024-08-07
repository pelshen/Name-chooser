import Bolt from '@slack/bolt';

import { installationStore } from './installationStore.js';

// Initializes your app with your bot token and signing secret
const app = new Bolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: '979ad718-cd06-4ab2-8c13-ad2bf04da98b',
  scopes: ['chat:write', 'commands', 'channels:history', 'groups:history', 'im:history', 'mpim:history', 'usergroups:read', 'channels:join'],
  installationStore: installationStore,
});

const userSelectBlockId = "multi_user_select_block";
const userSelectActionId = "multi_users_select_action";
const userSelect = {
  "type": "input",
  "block_id": userSelectBlockId,
  "element": {
    "type": "multi_users_select",
    "placeholder": {
      "type": "plain_text",
      "text": "Select users"
    },
    "action_id": userSelectActionId
  },
  "label": {
    "type": "plain_text",
    "text": "Pick the users you want to be in the draw"
  }
};

const manualInputBlockId = "manual_text_input_block";
const manualInputActionId = "manual_text_input_action";
const manualInput = {
  "type": "input",
  "block_id": manualInputBlockId,
  "element": {
    "type": "plain_text_input",
    "multiline": true,
    "action_id": manualInputActionId,
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

const switchToManualActionId = "switch_to_manual_button_action";
const switchToManualButton = {
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
    "action_id": switchToManualActionId
  }
};

const switchToUserActionId = "switch_to_user_button_action";
const switchToUserButton = {
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
    "action_id": switchToUserActionId
  }
};

const reasonInputBlockId = "reason_input_block";
const reasonInputActionId = "reason_input_action";
const reasonInput = {
  "type": "input",
  "block_id": reasonInputBlockId,
  "optional": true,
  "element": {
    "type": "plain_text_input",
    "action_id": reasonInputActionId,
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

const conversationSelectBlockId = "conversation_select_block";
const conversationSelectActionId = "conversation_select_action";
const conversationSelect = {
  "type": "input",
  "block_id": conversationSelectBlockId,
  "element": {
    "type": "conversations_select",
    "action_id": conversationSelectActionId,
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
}

const userInputViewId = "user_input_view";
const userInputModalView = {
  "type": "modal",
  "callback_id": userInputViewId,
  "title": {
    "type": "plain_text",
    "text": "Name chooser"
  },
  "blocks": [
    userSelect,
    switchToManualButton,
    reasonInput,
    conversationSelect
  ],
  "submit": {
    "type": "plain_text",
    "text": "Choose!"
  }
}

const manualInputViewId = "manual_input_view";
const manualInputModalView = {
  "type": "modal",
  "callback_id": manualInputViewId,
  "title": {
    "type": "plain_text",
    "text": "Name chooser"
  },
  "blocks": [
    manualInput,
    switchToUserButton,
    reasonInput,
    conversationSelect
  ],
  "submit": {
    "type": "plain_text",
    "text": "Choose!"
  }
}

var triggerModal = async (triggerId, prefill, manual, client, logger) => {

  const view = manual ? { ...manualInputModalView } : { ...userInputModalView };
  if (prefill) {
    if (manual) {
      view.blocks[0].element.initial_value = prefill.join('\r\n');
    } else {
      view.blocks[0].element.initial_users = prefill;
    }
  }

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: triggerId,
      // View payload
      view: view
    });
  }
  catch (error) {
    logger.error(error);
  }
}

app.shortcut('user_choose_shortcut', async ({ shortcut, ack, client, logger }) => {
  await ack();
  triggerModal(shortcut.trigger_id, null, false, client, logger);
});

app.shortcut('manual_input_shortcut', async ({ shortcut, ack, client, logger }) => {
  await ack();
  triggerModal(shortcut.trigger_id, null, true, client, logger);
});

app.command('/choosenames', async ({ command, ack, client, logger }) => {
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
  triggerModal(command.trigger_id, prefill, manual, client, logger);
});

app.view(userInputViewId, async ({ ack, body, view, client, logger }) => {
  await ack();

  const namesSelection = view['state']['values'][userSelectBlockId][userSelectActionId].selected_users;
  const user = body['user']['id'];
  const reason = view['state']['values'][reasonInputBlockId][reasonInputActionId]['value'];
  const conversation = view['state']['values'][conversationSelectBlockId][conversationSelectActionId];

  const max = namesSelection.length;

  // Message to send
  let msg = `<@${namesSelection[getRandomInt(0, max)]}> was chosen at random${reason ? ' *' + reason + '*' : ''}!`;
  let userList = namesSelection.reduce((prev, curr, index, arr) =>
    `${index === 0 ? '' : prev + (index === arr.length - 1 ? ' and ' : ', ')}<@${curr}>`,
    '');
  let contextMsg = `${userList} were included in the draw. Draw performed by <@${user}>.`;

  // Message the channel specified, try to join first
  try {
    await client.conversations.join({channel: conversation.selected_conversation});
  }
  catch (error) {
    logger.error(error);
  }
  try {
    await client.chat.postMessage(chosenNamePost(conversation.selected_conversation, msg, contextMsg));
  }
  catch (error) {
    logger.error(error);
  }
});

app.view(manualInputViewId, async ({ ack, body, view, client, logger }) => {
  await ack();

  const rawTextInput = view['state']['values'][manualInputBlockId][manualInputActionId]['value'];
  const inputArray = rawTextInput.split(/\r?\n/).map((val) => val.trim());
  const user = body['user']['id'];
  const reason = view['state']['values'][reasonInputBlockId][reasonInputActionId]['value'];
  const conversation = view['state']['values'][conversationSelectBlockId][conversationSelectActionId];

  const max = inputArray.length;

  // Message to send
  let msg = `_*${inputArray[getRandomInt(0, max)]}*_ was chosen at random${reason ? ' *' + reason + '*' : ''}!`;
  let inputList = inputArray.reduce((prev, curr, index, arr) =>
    `${index === 0 ? '' : prev + (index === arr.length - 1 ? ' and ' : ', ')}${curr}`,
    '');
  let contextMsg = `${inputList} were included in the draw. Draw performed by <@${user}>.`;

  // Message the channel specified, try to join first
  try {
    await client.conversations.join({channel: conversation.selected_conversation});
  }
  catch (error) {
    logger.error(error);
  }
  try {
    await client.chat.postMessage(chosenNamePost(conversation.selected_conversation, msg, contextMsg));
  }
  catch (error) {
    logger.error(error);
  }
});

const chosenNamePost = (conversation, msg, contextMsg) => ({
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
});

app.action(switchToUserActionId, async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: userInputModalView
    });
  } catch (error) {
    logger.error(error);
  }
});

app.action(switchToManualActionId, async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: manualInputModalView
    });
  } catch (error) {
    logger.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
