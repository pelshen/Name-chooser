// Tests for installationStore.js
import { expect } from 'chai';
import sinon from 'sinon';
import * as aws from '@aws-sdk/client-dynamodb';

// Set environment variables before importing the module
process.env.ACCOUNT_TABLE = 'test-table';

// Create a mock for the send method
const mockSend = sinon.stub();

// Create our spy before importing the module under test
sinon.stub(aws.DynamoDBClient.prototype, 'send').callsFake(function() {
  return mockSend.apply(this, arguments);
});

// Now import the module under test
import { installationStore } from '../installationStore.js';

describe('installationStore', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Reset the stub before each test
    mockSend.reset();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('storeInstallation', () => {
    it('should store team installation', async () => {
      // Arrange
      const teamInstallation = {
        team: { id: 'T12345' },
        isEnterpriseInstall: false
      };
      mockSend.resolves({ success: true });

      // Act
      const result = await installationStore.storeInstallation(teamInstallation);

      // Assert
      expect(result).to.deep.equal({ success: true });
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.PutItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Item.id.S).to.equal('T12345');
      expect(command.input.Item.type.S).to.equal('installation');
      expect(command.input.Item.installationType.S).to.equal('team');
      expect(JSON.parse(command.input.Item.installationData.S)).to.deep.equal(teamInstallation);
    });

    it('should store enterprise installation', async () => {
      // Arrange
      const enterpriseInstallation = {
        enterprise: { id: 'E12345' },
        isEnterpriseInstall: true
      };
      mockSend.resolves({ success: true });

      // Act
      const result = await installationStore.storeInstallation(enterpriseInstallation);

      // Assert
      expect(result).to.deep.equal({ success: true });
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.PutItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Item.id.S).to.equal('E12345');
      expect(command.input.Item.type.S).to.equal('installation');
      expect(command.input.Item.installationType.S).to.equal('enterprise');
      expect(JSON.parse(command.input.Item.installationData.S)).to.deep.equal(enterpriseInstallation);
    });

    it('should throw error for invalid installation data', async () => {
      // Arrange
      const invalidInstallation = {
        isEnterpriseInstall: false
        // Missing team property
      };

      // Act & Assert
      try {
        await installationStore.storeInstallation(invalidInstallation);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed saving installation data to installationStore');
        expect(mockSend.called).to.be.false;
      }
    });
  });

  describe('fetchInstallation', () => {
    it('should fetch team installation', async () => {
      // Arrange
      const teamQuery = {
        teamId: 'T12345',
        isEnterpriseInstall: false
      };
      const mockInstallation = {
        team: { id: 'T12345' },
        bot: { token: 'xoxb-test-token' }
      };
      mockSend.resolves({
        Item: {
          installationData: { S: JSON.stringify(mockInstallation) }
        }
      });

      // Act
      const result = await installationStore.fetchInstallation(teamQuery);

      // Assert
      expect(result).to.deep.equal(mockInstallation);
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.GetItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Key.id.S).to.equal('T12345');
      expect(command.input.Key.type.S).to.equal('installation');
    });

    it('should fetch enterprise installation', async () => {
      // Arrange
      const enterpriseQuery = {
        enterpriseId: 'E12345',
        isEnterpriseInstall: true
      };
      const mockInstallation = {
        enterprise: { id: 'E12345' },
        bot: { token: 'xoxb-test-token' }
      };
      mockSend.resolves({
        Item: {
          installationData: { S: JSON.stringify(mockInstallation) }
        }
      });

      // Act
      const result = await installationStore.fetchInstallation(enterpriseQuery);

      // Assert
      expect(result).to.deep.equal(mockInstallation);
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.GetItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Key.id.S).to.equal('E12345');
      expect(command.input.Key.type.S).to.equal('installation');
    });

    it('should throw error for invalid query', async () => {
      // Arrange
      const invalidQuery = {
        isEnterpriseInstall: false
        // Missing teamId property
      };

      // Act & Assert
      try {
        await installationStore.fetchInstallation(invalidQuery);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed fetching installation');
        expect(mockSend.called).to.be.false;
      }
    });
  });

  describe('deleteInstallation', () => {
    it('should delete team installation', async () => {
      // Arrange
      const teamQuery = {
        teamId: 'T12345',
        isEnterpriseInstall: false
      };
      mockSend.resolves({ success: true });

      // Act
      const result = await installationStore.deleteInstallation(teamQuery);

      // Assert
      expect(result).to.deep.equal({ success: true });
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.DeleteItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Key.id.S).to.equal('T12345');
      expect(command.input.Key.type.S).to.equal('installation');
    });

    it('should delete enterprise installation', async () => {
      // Arrange
      const enterpriseQuery = {
        enterpriseId: 'E12345',
        isEnterpriseInstall: true
      };
      mockSend.resolves({ success: true });

      // Act
      const result = await installationStore.deleteInstallation(enterpriseQuery);

      // Assert
      expect(result).to.deep.equal({ success: true });
      expect(mockSend.calledOnce).to.be.true;
      
      // Verify correct command was created
      const command = mockSend.firstCall.args[0];
      expect(command).to.be.an.instanceOf(aws.DeleteItemCommand);
      // Skip table name check as it's initialized at module load time
      expect(command.input.Key.id.S).to.equal('E12345');
      expect(command.input.Key.type.S).to.equal('installation');
    });

    it('should throw error for invalid query', async () => {
      // Arrange
      const invalidQuery = {
        isEnterpriseInstall: false
        // Missing teamId property
      };

      // Act & Assert
      try {
        await installationStore.deleteInstallation(invalidQuery);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to delete installation');
        expect(mockSend.called).to.be.false;
      }
    });
  });
});
