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
  // Respond immediately so Figma doesn't timeout/retry
  res.status(200).json({ message: 'Webhook received' });

  try {
    console.log('--- Webhook received ---');
    console.log('Raw body:', JSON.stringify(req.body, null, 2));

    // Signature verification
    const signature = req.headers['x-figma-signature'];
    const secret = process.env.FIGMA_WEBHOOK_SECRET;

    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(JSON.stringify(req.body));
      const expected = hmac.digest('hex');
      if (signature !== expected) {
        console.error('Invalid signature');
        return;
      }
    }

    const { comment, file_name, file_key, triggered_by } = req.body;

    const commenterName = triggered_by?.handle || 'Unknown';
    const fileUrl = `https://www.figma.com/file/${file_key}`;

    // FIX: comment is an array — extract text from first element
    let commentText = '';
    if (Array.isArray(comment) && comment.length > 0) {
      commentText = comment[0]?.text || '';
    } else if (typeof comment === 'object' && comment !== null) {
      commentText = comment.text || '';
    } else if (typeof comment === 'string') {
      commentText = comment;
    }

    console.log(`Commenter: ${commenterName}`);
    console.log(`Comment text: "${commentText}"`);
    console.log(`File: ${file_name} (${fileUrl})`);

    if (!commentText) {
      console.log('No comment text found');
      return;
    }

    const parsed = parseComment(commentText);
    console.log('Parser result:', JSON.stringify(parsed));

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
