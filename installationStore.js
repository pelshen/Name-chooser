
import { TableServiceClient } from "@azure/data-tables";

const tableService = new TableServiceClient();
await tableService.createTable("installations");
const buildEntity = (partitionKey, rowKey, entityData) => {partitionKey, rowKey, entityData};

export const installationStore = {
    storeInstallation: async (installation) => {
      // Bolt will pass your handler an installation object
      // Change the lines below so they save to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // handle storing org-wide app installation
        return await tableService.upsertEntity(buildEntity('enterprise', installation.enterprise.id, installation), "Replace");
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await tableService.upsertEntity(buildEntity('team', installation.team.id, installation), "Replace");
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // Bolt will pass your handler an installQuery object
      // Change the lines below so they fetch from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // handle org wide app installation lookup
        return await tableService.getEntity('enterprise', installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await tableService.getEntity('team', installQuery.enterpriseId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // Bolt will pass your handler  an installQuery object
      // Change the lines below so they delete from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await tableService.deleteEntity('enterprise', installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await tableService.deleteEntity('team', installQuery.enterpriseId);
      }
      throw new Error('Failed to delete installation');
    },
  };