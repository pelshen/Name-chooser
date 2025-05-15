import { parse as parseCookie } from "cookie";
import crypto from "crypto";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getSession } from "./sessionStore";
import { getAccountPlan } from "./accountStore";

function signSession(sessionId: string): string {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET!).update(sessionId).digest("hex");
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const cookies = parseCookie(cookieHeader);
  const sessionCookie = cookies.session;
  if (!sessionCookie) {
    return { statusCode: 401, body: "Not authenticated" };
  }

  const [sessionId, sessionSig] = sessionCookie.split(".");
  if (signSession(sessionId) !== sessionSig) {
    return { statusCode: 401, body: "Invalid session" };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { statusCode: 401, body: "Session not found" };
  }

  // Look up the plan for this user's team_id
  let plan: 'FREE' | 'PRO' = 'FREE';
  try {
    plan = await getAccountPlan(session.user.team_id);
  } catch (err) {
    plan = 'FREE';
  }
  const userWithPlan = { ...session.user, plan };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userWithPlan })
  };
};
