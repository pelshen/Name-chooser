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
  console.log("Tokens: " + JSON.stringify(tokens));

  // Decode id_token (JWT) to extract user info
  function decodeJwt(token: string) {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }

  const idToken = tokens.idToken();
  if (!idToken) {
    return { statusCode: 400, body: "Missing id_token from Slack response" };
  }
  const decoded = decodeJwt(idToken);

  // Extract user fields
  const user = {
    name: decoded.name,
    team_id: decoded["https://slack.com/team_id"],
    user_id: decoded["https://slack.com/user_id"],
    email: decoded.email,
    picture: decoded.picture || decoded.image || decoded.avatar || undefined,
  };

  // Create session
  const sessionId = crypto.randomBytes(32).toString("hex");
  const sessionSig = signSession(sessionId);
  await saveSession(sessionId, { user });

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
