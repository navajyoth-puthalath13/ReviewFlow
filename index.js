require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { parseComment } = require('./parser');
const { postReviewMessage } = require('./slack');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Figma Review Bot is running' });
});

app.post('/figma-webhook', async (req, res) => {
  // Verify the request is from Figma using the webhook secret
  const signature = req.headers['x-figma-signature'];
  const secret = process.env.FIGMA_WEBHOOK_SECRET;

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(req.body));
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Figma webhook signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }
  }

  const { comment, file_name, file_key, triggered_by } = req.body;

  const commenterName = triggered_by?.handle || 'Unknown';
  const commentText = comment?.text || '';
  const fileUrl = `https://www.figma.com/file/${file_key}`;

  console.log('--- New Figma Comment ---');
  console.log(`Commenter: ${commenterName}`);
  console.log(`Comment: ${commentText}`);
  console.log(`File: ${file_name} (${fileUrl})`);
  console.log('-------------------------');

  const parsed = parseComment(commentText);

  if (parsed) {
    try {
      await postReviewMessage({
        issueNumber: parsed.issueNumber,
        issueName: parsed.issueName,
        status: parsed.status,
        commenter: commenterName,
        fileUrl,
      });
      console.log('Slack message sent successfully');
    } catch (err) {
      console.error('Failed to send Slack message:', err.message);
    }
  }

  res.status(200).json({ message: 'Webhook received' });
});

app.listen(PORT, () => {
  console.log(`Figma Review Bot server running on port ${PORT}`);
});

// web: node index.js
