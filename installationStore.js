import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

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

const buildItem = (type, id, data) => ({ id: { S: id }, type: { S: type }, data: { S: data } });

export const installationStore = {
  storeInstallation: async (installation) => {
    let command;
    // Bolt will pass your handler an installation object
    // Change the lines below so they save to your database
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
      // handle storing org-wide app installation
      command = new PutItemCommand({ TableName: 'name-chooser_installation', Item: buildItem('enterprise', installation.enterprise.id, JSON.stringify(installation)) });
    }
    if (installation.team !== undefined) {
      // single team app installation
      command = new PutItemCommand({ TableName: 'name-chooser_installation', Item: buildItem('team', installation.team.id, JSON.stringify(installation)) });
    }
    if (command) {
      return await dynamoClient.send(command);
    }
    throw new Error('Failed saving installation data to installationStore');
  },
  fetchInstallation: async (installQuery) => {
    let command;
    // Bolt will pass your handler an installQuery object
    // Change the lines below so they fetch from your database
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      // handle org wide app installation lookup
      command = new GetItemCommand({ TableName: 'name-chooser_installation', Key: { id: { S: installQuery.enterpriseId }, type: { S: 'enterprise' } } });
    }
    if (installQuery.teamId !== undefined) {
      // single team app installation lookup
      command = new GetItemCommand({ TableName: 'name-chooser_installation', Key: { id: { S: installQuery.teamId }, type: { S: 'team' } } });
    }
    if (command) {
      return JSON.parse((await dynamoClient.send(command)).Item.data.S);
    }
    throw new Error('Failed fetching installation');
  },
  deleteInstallation: async (installQuery) => {
    let command;
    // Bolt will pass your handler  an installQuery object
    // Change the lines below so they delete from your database
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      // org wide app installation deletion
      command = new DeleteItemCommand({ TableName: 'name-chooser_installation', Key: { id: { S: installQuery.enterpriseId }, type: { S: 'enterprise' } } });
    }
    if (installQuery.teamId !== undefined) {
      // single team app installation deletion
      command = new DeleteItemCommand({ TableName: 'name-chooser_installation', Key: { id: { S: installQuery.teamId }, type: { S: 'team' } } });
    }
    if (command) {
      return await dynamoClient.send(command);
    }
    throw new Error('Failed to delete installation');
  },
};