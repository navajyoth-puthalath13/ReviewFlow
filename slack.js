// slack.js

require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

async function postReviewMessage({ issueNumber, issueName, status, commenter, fileUrl }) {
  if (!channelId) {
    console.error('SLACK_CHANNEL_ID is not set');
    return;
  }

  const header = `#${issueNumber}${issueName ? ` ${issueName}` : ''}`;

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎨 *${header}*`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Status:*\n\`${status || 'Unknown'}\``,
        },
        {
          type: 'mrkdwn',
          text: `*Commenter:*\n${commenter || 'Unknown'}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔗 Open in Figma',
            emoji: true,
          },
          url: fileUrl,
          action_id: 'open_figma',
        },
      ],
    },
    { type: 'divider' },
  ];

  const result = await slack.chat.postMessage({
    channel: channelId,
    text: `🎨 ${header} — ${status || 'Update'}`,
    blocks,
  });

  console.log('Slack API response ok:', result.ok, 'ts:', result.ts);
}

module.exports = { postReviewMessage };