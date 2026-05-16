// register-webhook.js
// Run this script once to register a Figma webhook for your project.
// Usage: node register-webhook.js

require('dotenv').config();

// Step 1: Read required environment variables
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const FIGMA_WEBHOOK_SECRET = process.env.FIGMA_WEBHOOK_SECRET;
const RAILWAY_PUBLIC_URL = process.env.RAILWAY_PUBLIC_URL;

// Step 2: Validate all required variables are present
const missing = [];
if (!FIGMA_TOKEN) missing.push('FIGMA_TOKEN');
if (!FIGMA_FILE_ID) missing.push('FIGMA_FILE_ID');
if (!FIGMA_WEBHOOK_SECRET) missing.push('FIGMA_WEBHOOK_SECRET');
if (!RAILWAY_PUBLIC_URL) missing.push('RAILWAY_PUBLIC_URL');

if (missing.length > 0) {
  console.error('❌ Missing required environment variables in .env:');
  missing.forEach((v) => console.error(`   - ${v}`));
  console.error('\nSee .env.example for reference.');
  process.exit(1);
}

// Step 3: Build the webhook endpoint URL
const endpoint = `${RAILWAY_PUBLIC_URL.replace(/\/+$/, '')}/figma-webhook`;

// Step 4: Register the webhook with Figma API
async function registerWebhook() {
  console.log('🔧 Registering Figma webhook...');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   File ID:  ${FIGMA_FILE_ID}`);
  console.log('');

  try {
    const response = await fetch('https://api.figma.com/v2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIGMA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'FILE_COMMENT',
        context: 'file',
        context_id: FIGMA_FILE_ID,
        endpoint: endpoint,
        passcode: FIGMA_WEBHOOK_SECRET,
      }),
    });

    const data = await response.json();

    // Step 5: Handle different error responses
    if (!response.ok) {
      console.error(`❌ Figma API error (${response.status}):\n`);

      if (response.status === 403) {
        console.error('   Permission denied. Possible causes:');
        console.error('   - Your FIGMA_TOKEN is invalid or expired');
        console.error('   - Token is missing the "Webhooks: Write" scope');
        console.error('   - You don\'t have access to this file');
      } else if (response.status === 400) {
        console.error('   Bad request. Possible causes:');
        console.error('   - FIGMA_FILE_ID is invalid');
        console.error('   - A webhook for this file already exists');
      } else if (response.status === 404) {
        console.error('   Not found. The FIGMA_FILE_ID may be incorrect.');
      }

      console.error('\n   Full response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Step 6: Success
    console.log('✅ Webhook registered successfully!');
    console.log(`   Webhook ID: ${data.id}`);
    console.log(`   Event type: ${data.event_type}`);
    console.log(`   Status:     ${data.status}`);
    console.log(`   Endpoint:   ${data.endpoint}`);
    console.log('');
    console.log('Now try commenting on your Figma file with something like:');
    console.log('   #17 Dashboard alignment fixes - completed');
  } catch (err) {
    console.error('❌ Network error — could not reach Figma API.');
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

registerWebhook();