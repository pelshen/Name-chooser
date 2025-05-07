import { parse as parseCookie } from "cookie";
import crypto from "crypto";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getSession } from "./sessionStore";

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

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: session.user })
  };
};
