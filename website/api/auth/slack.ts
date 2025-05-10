import { Slack } from "arctic";
import crypto from "crypto";

const slack = new Slack(
  process.env.SLACK_CLIENT_ID!,
  process.env.SLACK_CLIENT_SECRET!,
  process.env.SLACK_REDIRECT_HOST! + 'api/auth/callback/slack'
);

export const handler = async () => {
  const state = crypto.randomBytes(16).toString("hex");
  const url = slack.createAuthorizationURL(state, ["openid", "profile", "email"]);
  return {
    statusCode: 302,
    headers: { Location: url.toString() }
  };
};
