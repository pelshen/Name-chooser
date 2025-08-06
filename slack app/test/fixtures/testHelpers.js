/**
 * Common test helper functions used across multiple test files
 */
import sinon from 'sinon';
import { testEnvVars } from './mockData.js';

/**
 * Sets up test environment variables and saves original values
 * @param {Object} envVars - Environment variables to set
 * @returns {Object} Original environment variables for restoration
 */
export function setupTestEnvironment(envVars = {}) {
  const originalEnv = { ...process.env };
  
  // Apply provided environment variables
  Object.assign(process.env, envVars);
  
  return originalEnv;
}

/**
 * Restores original environment variables
 * @param {Object} originalEnv - Original environment variables to restore
 */
export function restoreEnvironment(originalEnv) {
  process.env = originalEnv;
}

/**
 * Sets up common analytics test environment
 * @returns {Object} Original environment variables for restoration
 */
export function setupAnalyticsTestEnv() {
  return setupTestEnvironment(testEnvVars.analytics);
}

/**
 * Sets up common DynamoDB test environment
 * @returns {Object} Original environment variables for restoration
 */
export function setupDynamoDBTestEnv() {
  return setupTestEnvironment(testEnvVars.dynamodb);
}

/**
 * Sets up common Slack test environment
 * @returns {Object} Original environment variables for restoration
 */
export function setupSlackTestEnv() {
  return setupTestEnvironment(testEnvVars.slack);
}

/**
 * Resets all stubs in an object recursively
 * @param {Object} obj - Object containing stubs to reset
 * @param {Set} visited - Set of already visited objects to prevent infinite recursion
 */
export function resetAllStubs(obj, visited = new Set()) {
  if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
  
  visited.add(obj);
  
  Object.values(obj).forEach(value => {
    if (value && typeof value === 'object') {
      if (typeof value.reset === 'function') {
        value.reset();
      } else if (!visited.has(value)) {
        resetAllStubs(value, visited);
      }
    }
  });
}

/**
 * Creates a comprehensive beforeEach setup for tests
 * @param {Object} options - Configuration options
 * @param {Array} options.envVars - Environment variables to set
 * @param {Array} options.mocks - Mock objects to reset
 * @returns {Function} beforeEach function
 */
export function createBeforeEach(options = {}) {
  return function() {
    // Save original environment
    this.originalEnv = { ...process.env };
    
    // Set up environment variables
    if (options.envVars) {
      Object.assign(process.env, options.envVars);
    }
    
    // Reset mocks
    if (options.mocks) {
      options.mocks.forEach(mock => resetAllStubs(mock));
    }
  };
}

/**
 * Creates a comprehensive afterEach teardown for tests
 * @param {Object} options - Configuration options
 * @returns {Function} afterEach function
 */
export function createAfterEach(options = {}) {
  return function() {
    // Restore original environment
    if (this.originalEnv) {
      process.env = this.originalEnv;
    }
    
    // Reset all sinon stubs
    sinon.restore();
  };
}

/**
 * Common assertion helpers
 */
export const assertions = {
  /**
   * Asserts that a stub was called with specific arguments
   * @param {Object} stub - Sinon stub
   * @param {Array} expectedArgs - Expected arguments
   * @param {string} message - Custom assertion message
   */
  calledWithArgs(stub, expectedArgs, message = '') {
    if (!stub.calledWith(...expectedArgs)) {
      throw new Error(`${message} Expected stub to be called with ${JSON.stringify(expectedArgs)}, but it was called with ${JSON.stringify(stub.getCall(0)?.args || [])}`);
    }
  },

  /**
   * Asserts that a stub was called a specific number of times
   * @param {Object} stub - Sinon stub
   * @param {number} expectedCount - Expected call count
   * @param {string} message - Custom assertion message
   */
  calledTimes(stub, expectedCount, message = '') {
    if (stub.callCount !== expectedCount) {
      throw new Error(`${message} Expected stub to be called ${expectedCount} times, but it was called ${stub.callCount} times`);
    }
  },

  /**
   * Asserts that an object has specific properties
   * @param {Object} obj - Object to check
   * @param {Array} expectedProps - Expected property names
   * @param {string} message - Custom assertion message
   */
  hasProperties(obj, expectedProps, message = '') {
    expectedProps.forEach(prop => {
      if (!(prop in obj)) {
        throw new Error(`${message} Expected object to have property '${prop}'`);
      }
    });
  },

  /**
   * Asserts that a value is within a specific range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {string} message - Custom assertion message
   */
  inRange(value, min, max, message = '') {
    if (value < min || value > max) {
      throw new Error(`${message} Expected ${value} to be between ${min} and ${max}`);
    }
  }
};

/**
 * Utility functions for test data manipulation
 */
export const testUtils = {
  /**
   * Creates a deep copy of an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Deep copy of the object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Generates a random test ID
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Random test ID
   */
  generateTestId(prefix = 'test') {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Creates a promise that resolves after a specified delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Waits for a condition to be true
   * @param {Function} condition - Function that returns true when condition is met
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @param {number} interval - Check interval in milliseconds
   * @returns {Promise} Promise that resolves when condition is met
   */
  async waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return;
      }
      await this.delay(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

/**
 * Mock factory functions for common test scenarios
 */
export const mockFactories = {
  /**
   * Creates a mock Slack event object
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock Slack event
   */
  createSlackEvent(overrides = {}) {
    return {
      user: 'U123',
      team: 'T123',
      channel: 'C123',
      ts: '1234567890.123456',
      trigger_id: 'trigger_123',
      ...overrides
    };
  },

  /**
   * Creates a mock Slack command object
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock Slack command
   */
  createSlackCommand(overrides = {}) {
    return {
      command: '/drawnames',
      text: '',
      user_id: 'U123',
      team_id: 'T123',
      channel_id: 'C123',
      trigger_id: 'trigger_123',
      response_url: 'https://hooks.slack.com/commands/123',
      ...overrides
    };
  },

  /**
   * Creates a mock Slack view submission
   * @param {Object} overrides - Properties to override
   * @returns {Object} Mock view submission
   */
  createViewSubmission(overrides = {}) {
    return {
      type: 'view_submission',
      user: {
        id: 'U123',
        name: 'testuser'
      },
      team: {
        id: 'T123',
        domain: 'testteam'
      },
      view: {
        id: 'V123',
        callback_id: 'name_draw_modal',
        state: {
          values: {}
        }
      },
      ...overrides
    };
  }
};
