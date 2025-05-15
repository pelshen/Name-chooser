import type { AccountUser } from "../src/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClientOptions } from "./dynamoClientOptions";

const client = new DynamoDBClient(dynamoClientOptions);
const tableName = process.env.SESSION_TABLE || "sessions";

export async function saveSession(sessionId: string, data: { user: AccountUser }) {
  await client.send(new PutCommand({
    TableName: tableName,
    Item: { sessionId, ...data, created: Date.now() }
  }));
}

export async function getSession(sessionId: string): Promise<{ user: AccountUser } | undefined> {
  const res = await client.send(new GetCommand({
    TableName: tableName,
    Key: { sessionId }
  }));
  // Defensive check: ensure returned item has a user property that matches AccountUser shape
  if (res.Item && typeof res.Item.user === "object" && res.Item.user !== null) {
    // Optionally, further validation could be added here
    return res.Item as { user: AccountUser };
  }
  return undefined;
}

export async function deleteSession(sessionId: string) {
  await client.send(new DeleteCommand({
    TableName: tableName,
    Key: { sessionId },
  }));
}
