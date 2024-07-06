import { TableClient } from "@azure/data-tables";
import * as dotenv from 'dotenv';
dotenv.config();

const tableClient = TableClient.fromConnectionString(process.env.AZURE_TABLES_ENDPOINT, "installations");
await tableClient.createTable();
const buildEntity = (partitionKey, rowKey, entityData) => ({partitionKey, rowKey, entityData});

export const installationStore = {
    storeInstallation: async (installation) => {
      // Bolt will pass your handler an installation object
      // Change the lines below so they save to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // handle storing org-wide app installation
        return await tableClient.upsertEntity(buildEntity('enterprise', installation.enterprise.id, JSON.stringify(installation)), "Replace");
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await tableClient.upsertEntity(buildEntity('team', installation.team.id, JSON.stringify(installation)), "Replace");
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // Bolt will pass your handler an installQuery object
      // Change the lines below so they fetch from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // handle org wide app installation lookup
        return JSON.parse((await tableClient.getEntity('enterprise', installQuery.enterpriseId)).entityData);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return JSON.parse((await tableClient.getEntity('team', installQuery.teamId)).entityData);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // Bolt will pass your handler  an installQuery object
      // Change the lines below so they delete from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await tableClient.deleteEntity('enterprise', installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await tableClient.deleteEntity('team', installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  };