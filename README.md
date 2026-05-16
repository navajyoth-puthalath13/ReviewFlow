# Figma Review Bot

A Node.js bot that listens for Figma comment webhooks, parses issue numbers and statuses from comments, and posts formatted review updates to Slack.

## Environment Variables

Create a `.env` file with the following:

| Variable | Description |
|----------|-------------|
| `SLACK_BOT_TOKEN` | Slack Bot OAuth token (`xoxb-...`). Get it from [Slack API](https://api.slack.com/apps) → Your App → OAuth & Permissions. |
| `SLACK_CHANNEL_ID` | The Slack channel ID to post messages to. Right-click a channel → View channel details → copy the ID. |
| `FIGMA_WEBHOOK_SECRET` | A passcode you define when registering your Figma webhook. Used to verify incoming requests. |

## Deploy to Railway

1. Push this project to a GitHub repository.
2. Go to [Railway](https://railway.app) and create a new project.
3. Select **Deploy from GitHub repo** and connect your repository.
4. In the Railway dashboard, go to **Variables** and add the three environment variables above.
5. Railway will detect the `Procfile` and start the server automatically.
6. Copy your Railway deployment URL (e.g. `https://your-app.up.railway.app`).

## Register the Figma Webhook

Once deployed, register your webhook endpoint with Figma by making a POST request:

```bash
curl -X POST https://api.figma.com/v2/webhooks \
  -H "Authorization: Bearer YOUR_FIGMA_PERSONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "FILE_COMMENT",
    "team_id": "YOUR_TEAM_ID",
    "endpoint": "https://your-app.up.railway.app/figma-webhook",
    "passcode": "your-figma-webhook-secret"
  }'