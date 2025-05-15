// Shared DynamoDB client options for use in sessionStore and accountStore

const isOffline = process.env.IS_OFFLINE === "true";

export const dynamoClientOptions = {
  region: process.env.AWS_REGION || "eu-west-2",
  ...(isOffline && {
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  }),
};
