import { Slack } from "arctic";
import { serialize as serializeCookie } from "cookie";
import crypto from "crypto";
import { APIGatewayProxyEvent } from "aws-lambda";

const slack = new Slack(
  process.env.SLACK_CLIENT_ID!,
  process.env.SLACK_CLIENT_SECRET!,
  process.env.SLACK_REDIRECT_URI!
);

import { saveSession } from "../../sessionStore";

function signSession(sessionId: string): string {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET!).update(sessionId).digest("hex");
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const code = event.queryStringParameters?.code;
  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  const tokens = await slack.validateAuthorizationCode(code);

  // Fetch Slack user info
  const userResp = await fetch("https://slack.com/api/users.identity", {
    headers: { Authorization: `Bearer ${tokens.accessToken()}` }
  });
  const userData = await userResp.json();

  // Create session
  const sessionId = crypto.randomBytes(32).toString("hex");
  const sessionSig = signSession(sessionId);
  await saveSession(sessionId, { user: userData.user });

  // Set session cookie (signed)
  const cookie = serializeCookie("session", `${sessionId}.${sessionSig}`, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  // Redirect to account page
  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": cookie,
      Location: "/account"
    },
    body: ""
  };
};
