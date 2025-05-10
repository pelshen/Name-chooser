import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-west-2" });
const tableName = process.env.ACCOUNT_TABLE || "accounts";

export type AccountPlan = 'FREE' | 'PRO';

export async function getAccountPlan(team_id: string): Promise<AccountPlan> {
  const res = await client.send(new GetCommand({
    TableName: tableName,
    Key: { team_id },
    ProjectionExpression: "plan"
  }));
  // Default to 'FREE' if not found or invalid
  const plan = res.Item?.plan;
  if (plan === 'PRO' || plan === 'FREE') return plan;
  return 'FREE';
}
