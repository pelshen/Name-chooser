import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const isOffline = process.env.IS_OFFLINE === "true";
const options = {
  region: process.env.AWS_REGION || "eu-west-2",
  ...(isOffline && {
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  }),
}
const client = new DynamoDBClient(options);
const tableName = process.env.SESSION_TABLE || "sessions";

export async function saveSession(sessionId: string, data: any) {
  await client.send(new PutCommand({
    TableName: tableName,
    Item: { sessionId, ...data, created: Date.now() }
  }));
}

export async function getSession(sessionId: string) {
  const res = await client.send(new GetCommand({
    TableName: tableName,
    Key: { sessionId }
  }));
  return res.Item;
}

export async function deleteSession(sessionId: string) {
  await client.send(new DeleteCommand({
    TableName: tableName,
    Key: { sessionId },
  }));
}
