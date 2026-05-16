// parser.js

const STATUS_KEYWORDS = [
  'needs changes',
  'in progress',
  'in review',
  'completed',
];

function parseComment(text) {
  if (!text) return null;

  // Match issue number like #95, optionally followed by a name/heading
  const issueMatch = text.match(/#(\d+)\s*(.*)/);
  if (!issueMatch) return null;

  const issueNumber = parseInt(issueMatch[1], 10);
  const remaining = issueMatch[2].trim();

  // Detect status keyword (case-insensitive)
  const lowerText = text.toLowerCase();
  const status = STATUS_KEYWORDS.find((kw) => lowerText.includes(kw)) || null;

  // Remove the status keyword from the remaining text to get the issue name
  let issueName = remaining;
  if (status) {
    issueName = remaining.replace(new RegExp(status, 'i'), '').trim();
  }
  // Clean up leftover punctuation like leading/trailing dashes, colons, etc.
  issueName = issueName.replace(/^[\s\-:]+|[\s\-:]+$/g, '').trim() || null;

  return { issueNumber, issueName, status };
}

module.exports = { parseComment };