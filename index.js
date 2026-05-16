require('dotenv').config();
const express = require('express');
const { parseComment } = require('./parser');
const { postReviewMessage } = require('./slack');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Figma Review Bot is running' });
});

app.post('/figma-webhook', async (req, res) => {
  console.log('Webhook received');
  console.log(JSON.stringify(req.body, null, 2));

  // Respond immediately to avoid Figma timeout
  res.status(200).send('OK');

  try {
    const { comment, file_name, file_key, triggered_by } = req.body;

    const commenterName = triggered_by?.handle || 'Unknown';
    const commentText = Array.isArray(comment)
      ? comment[0]?.text || ''
      : comment?.text || comment?.message || '';
    const fileUrl = file_key
      ? `https://www.figma.com/file/${file_key}`
      : 'https://www.figma.com';

    console.log('--- New Figma Comment ---');
    console.log(`Commenter: ${commenterName}`);
    console.log(`Comment: ${commentText}`);
    console.log(`File: ${file_name} (${fileUrl})`);
    console.log('-------------------------');

    const parsed = parseComment(commentText);

    if (!parsed) {
      console.log('No valid issue pattern found in comment');
      return;
    }

    await postReviewMessage({
      issueNumber: parsed.issueNumber,
      issueName: parsed.issueName,
      status: parsed.status,
      commenter: commenterName,
      fileUrl,
    });

    console.log('Slack message sent successfully');
  } catch (err) {
    console.error('Webhook processing error:', err);
  }
});

app.listen(PORT, () => {
  console.log(`Figma Review Bot server running on port ${PORT}`);
});

// web: node index.js
