import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClientOptions } from "./dynamoClientOptions";

const client = new DynamoDBClient(dynamoClientOptions);
const tableName = process.env.ACCOUNT_TABLE || "accounts";

export type AccountPlan = 'FREE' | 'PRO';

export async function getAccountPlan(team_id: string): Promise<AccountPlan> {
    const res = await client.send(new GetCommand({
    TableName: tableName,
    Key: { id: team_id, type: 'team' }
  }));
  const item = res.Item;
  const plan = item?.planType;
  if (plan === 'PRO' || plan === 'FREE') return plan;
  // If the account exists but no plan property, set it to 'FREE' and update in DynamoDB
  if (item) {
    await client.send(new PutCommand({
      TableName: tableName,
      Item: { id: team_id, type: 'team', ...item, planType: 'FREE' },
    }));
  }
  return 'FREE';
}

