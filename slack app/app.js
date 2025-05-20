import Bolt from '@slack/bolt';
import { installationStore } from './installationStore.js';
import serverlessExpress from '@codegenie/serverless-express';
import { NameDrawApp } from './name-draw-app.js';

const { App, ExpressReceiver } = Bolt;

// Create the Bolt app
const expressReceiver = new ExpressReceiver({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  stateSecret: '979ad718-cd06-4ab2-8c13-ad2bf04da98b',
  scopes: ['chat:write', 'commands', 'channels:history', 'groups:history', 'im:history', 'mpim:history', 'usergroups:read', 'channels:join'],
  installationStore: installationStore,
  processBeforeResponse: true,
});

const app = new App({
  receiver: expressReceiver,
  processBeforeResponse: true,
});

// Initialize our app class with the Bolt app
const nameDrawApp = new NameDrawApp(app);

// Export the serverless handler
export const handler = serverlessExpress({ app: expressReceiver.app });
