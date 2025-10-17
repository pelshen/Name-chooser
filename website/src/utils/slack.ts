/**
 * Get the stage-specific Slack install URL
 * Falls back to a generic Slack app directory if no host is configured
 */
export function getSlackInstallUrl(): string {
  const host = import.meta.env.VITE_SLACK_INSTALL_HOST;
  
  if (host) {
    // Remove trailing slash if present and add /slack/install
    const cleanHost = host.replace(/\/$/, '');
    return `${cleanHost}/slack/install`;
  }
  
  // Fallback to generic Slack app directory
  return 'https://slack.com/apps';
}