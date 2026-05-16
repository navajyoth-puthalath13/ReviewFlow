// slack.js

require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

async function postReviewMessage({ issueNumber, issueName, status, commenter, fileUrl }) {
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
    {
      type: 'divider',
    },
  ];

  await slack.chat.postMessage({
    channel: channelId,
    text: `🎨 ${header} — ${status || 'Update'}`,
    blocks,
  });
}

module.exports = { postReviewMessage };