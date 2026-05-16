# ReviewFlow

Automate Figma review comments directly into Slack using webhooks, Railway, Node.js, and Slack APIs.

ReviewFlow listens to Figma comment events in real time and posts structured design review updates into Slack channels.

---

# What It Does

When someone comments in Figma using a structured format like:

```txt id="r1"
#17 Dashboard alignment fixes - completed
```

ReviewFlow automatically:

1. Receives the Figma webhook
2. Parses issue number + status
3. Formats the review event
4. Sends a Slack message to your channel

---

# Architecture

```txt id="r2"
Figma Comment
↓
Figma Webhook
↓
Railway Node.js Server
↓
Parser
↓
Slack Bot API
↓
Slack Channel
```

---

# Features

- Real-time Figma comment tracking
- Slack notifications
- Issue/status parsing
- Railway deployment ready
- Lightweight Node.js Express backend
- Open-source and customizable
- Works with file-level Figma webhooks
- Supports structured design review workflows

---

# Tech Stack

- Node.js
- Express.js
- Railway
- Slack Web API
- Figma Webhooks API

---

# Folder Structure

```md
figma-review-bot/
├── index.js
├── parser.js
├── slack.js
├── register-webhook.js
├── package.json
├── .env.example
├── README.md
```

---

# Setup Guide

# 1. Clone Repository

```bash id="r4"
git clone https://github.com/navajyoth-puthalath13/ReviewFlow.git
cd ReviewFlow
```

---

# 2. Install Dependencies

```bash id="r5"
npm install
```

---

# 3. Create Environment Variables

Create `.env`

```md
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=CXXXXXXXX
FIGMA_WEBHOOK_SECRET=mySuperSecret123
FIGMA_TOKEN=figd_xxxxxxxxx
FIGMA_FILE_ID=YOUR_FILE_ID
RAILWAY_PUBLIC_URL=https://your-app.up.railway.app
```

---

# Slack Setup

# 1. Create Slack App

Open:

[Slack Apps Dashboard](https://api.slack.com/apps?utm_source=chatgpt.com)

Create app:
```txt id="r7"
Figma Review Bot
```

---

# 2. Add OAuth Scope

Go to:
```txt id="r8"
OAuth & Permissions
```

Add Bot Token Scope:

```txt id="r9"
chat:write
```

---

# 3. Install to Workspace

Click:
```txt id="r10"
Install to Workspace
```

Copy generated:

```txt id="r11"
xoxb-...
```

token into `.env`

---

# 4. Invite Bot to Channel

Inside Slack:

```txt id="r12"
/invite @Figma Review Bot
```

---

# Railway Deployment

# 1. Push to GitHub

```bash id="r13"
git add .
git commit -m "Initial deploy"
git push
```

---

# 2. Create Railway Project

Open:

[Railway](https://railway.app?utm_source=chatgpt.com)

Deploy GitHub repo.

---

# 3. Add Variables

Inside Railway → Variables:

```env id="r14"
SLACK_BOT_TOKEN=
SLACK_CHANNEL_ID=
FIGMA_WEBHOOK_SECRET=
```

---

# 4. Get Public URL

Railway generates:

```txt id="r15"
https://your-app.up.railway.app
```

Webhook endpoint becomes:

```txt id="r16"
https://your-app.up.railway.app/figma-webhook
```

---

# Figma Webhook Setup

# IMPORTANT

There are TWO webhook types:

| Type | Requirement |
|---|---|
| Team Webhook | Team admin/owner access |
| File Webhook | File access only |

Most indie users should use:

```txt id="r17"
FILE webhook
```

because team-level webhooks often fail with permission errors.

---

# Generate Figma Token

Open:

[Figma Settings](https://www.figma.com/settings?utm_source=chatgpt.com)

Generate Personal Access Token.

Required scopes:
- `webhooks:write`
- `files:read`

---

# File-Level Webhook Registration

Run the automatic webhook setup script:

```bash
node register-webhook.js
```

This script:
- reads values from `.env`
- registers the Figma webhook automatically
- connects your Railway endpoint to Figma
- avoids manual curl setup issues

---

# Getting File ID

From:

```txt id="r19"
https://www.figma.com/design/uijd59BeYkDzOj5jDThJpw/test
```

File ID is:

```txt id="r20"
uijd59BeYkDzOj5jDThJpw
```

---

# Comment Format

Supported format:

```txt id="r21"
#17 Dashboard alignment fixes - completed
```

Supported statuses:
- completed
- in review
- in progress
- needs changes

---

# Common Problems

# 1. Slack invalid_auth

Cause:
- wrong bot token
- app not installed
- missing `chat:write`

Fix:
- reinstall Slack app
- update Railway variables

---

# 2. Figma Permission Error

Error:

```txt id="r22"
You don't have permission to create a webhook for this team
```

Cause:
- using team webhook without admin access

Fix:
- use file-level webhook instead

---

# 3. Railway Not Updating

Cause:
- old deployment still running

Fix:
- redeploy latest commit manually

---

# 4. Webhook Receives But Slack Doesn't Send

Usually:
- parser issue
- wrong payload structure
- stale deployment

Check Railway logs carefully.

---

# 5. Figma Retries Webhooks Repeatedly

Cause:
- server returns non-200 response
- webhook processing crashes
- Slack API failure blocks response

Fix:
- always return `res.sendStatus(200)` to Figma
- wrap Slack calls in try/catch
- log errors without crashing the server

---

# Debugging Tips

Add logs inside:

```txt id="r23"
index.js
parser.js
slack.js
```

Useful logs:

```js id="r24"
console.log(JSON.stringify(req.body, null, 2));
```

---

# Open Source Notes

This project was built as an experimental open-source workflow tool for design review automation between Figma and Slack.

Main engineering challenges were:
- webhook permissions
- deployment consistency
- Slack OAuth setup
- Figma API scopes
- webhook runtime debugging

The actual parser logic is small compared to the infrastructure setup complexity.

---

# Future Improvements

- GitHub issue sync
- Multiple Slack channels
- Figma thread support
- Rich Slack cards
- AI review summaries
- Database persistence
- Retry queue
- User authentication

---

# License

MIT

---

# Author

Created by Navajyoth Putalath

- GitHub: https://github.com/navajyoth-puthalath13
- X (Twitter): https://x.com/putalath
- LinkedIn: https://www.linkedin.com/in/navajyothp

Built with ❤️
