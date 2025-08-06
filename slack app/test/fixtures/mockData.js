/**
 * Common test data objects used across multiple test files
 */

// Common user and team IDs for testing
export const testUsers = {
  user1: {
    id: 'U001',
    name: 'testuser1'
  },
  user2: {
    id: 'U123',
    name: 'testuser2'
  },
  user3: {
    id: 'U456',
    name: 'testuser3'
  }
};

export const testTeams = {
  team1: {
    id: 'T001',
    name: 'Test Team 1'
  },
  team2: {
    id: 'T123',
    name: 'Test Team 2'
  }
};

// Usage tracking test data
export const usageData = {
  freeUserUsage: {
    userId: testUsers.user1.id,
    teamId: testTeams.team1.id,
    month: '2025-08',
    usageCount: 2,
    planType: 'FREE',
    lastUsed: '2025-08-03T09:00:00.000Z'
  },
  freeUserAtLimit: {
    userId: testUsers.user2.id,
    teamId: testTeams.team1.id,
    month: '2025-08',
    usageCount: 5,
    planType: 'FREE',
    lastUsed: '2025-08-03T09:54:00.000Z'
  },
  paidUserUsage: {
    userId: testUsers.user1.id,
    teamId: testTeams.team1.id,
    month: '2025-08',
    usageCount: 15,
    planType: 'PAID',
    lastUsed: '2025-08-03T09:54:00.000Z'
  },
  incrementedUsage: {
    userId: testUsers.user1.id,
    teamId: testTeams.team1.id,
    month: '2025-08',
    usageCount: 3,
    planType: 'FREE',
    lastUsed: '2025-08-03T09:54:00.000Z'
  }
};

// Installation data for testing
export const installationData = {
  teamInstallation: {
    team: {
      id: testTeams.team1.id,
      name: testTeams.team1.name
    },
    bot: {
      token: 'xoxb-test-token',
      userId: 'B001',
      id: 'B001'
    },
    user: {
      token: 'xoxp-test-token',
      id: testUsers.user1.id
    },
    isEnterpriseInstall: false
  },
  enterpriseInstallation: {
    enterprise: {
      id: 'E001',
      name: 'Test Enterprise'
    },
    bot: {
      token: 'xoxb-test-enterprise-token',
      userId: 'B002',
      id: 'B002'
    },
    user: {
      token: 'xoxp-test-enterprise-token',
      id: testUsers.user1.id
    },
    isEnterpriseInstall: true
  }
};

// Modal and view structures for testing
export const modalData = {
  userSelectionModal: {
    type: 'modal',
    callback_id: 'name_draw_modal',
    title: {
      type: 'plain_text',
      text: 'Draw Names'
    },
    blocks: [
      {
        type: 'input',
        block_id: 'users_block',
        element: {
          type: 'multi_users_select',
          action_id: 'users_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select users to draw from'
          }
        },
        label: {
          type: 'plain_text',
          text: 'Users'
        }
      }
    ]
  },
  manualInputModal: {
    type: 'modal',
    callback_id: 'name_draw_modal_manual',
    title: {
      type: 'plain_text',
      text: 'Draw Names (Manual)'
    },
    blocks: [
      {
        type: 'input',
        block_id: 'names_block',
        element: {
          type: 'plain_text_input',
          action_id: 'names_input',
          multiline: true,
          placeholder: {
            type: 'plain_text',
            text: 'Enter names, one per line'
          }
        },
        label: {
          type: 'plain_text',
          text: 'Names'
        }
      }
    ]
  }
};

// Common test environment variables
export const testEnvVars = {
  analytics: {
    POSTHOG_API_KEY: '',
    POSTHOG_HOST: 'https://test.posthog.com',
    STAGE: 'test'
  },
  dynamodb: {
    ACCOUNT_TABLE: 'test-table',
    USAGE_TABLE: 'test-usage-table'
  },
  slack: {
    SLACK_BOT_TOKEN: 'xoxb-test-token',
    SLACK_SIGNING_SECRET: 'test-signing-secret'
  }
};

// Usage messages for testing
export const usageMessages = {
  unlimited: 'Unlimited draws available',
  remaining: (count) => `You have ${count} draw${count === 1 ? '' : 's'} remaining this month`,
  limitReached: 'You have reached your monthly limit of 5 draws'
};
