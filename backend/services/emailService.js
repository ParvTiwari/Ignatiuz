/**
 * Simulated Gmail Gateway Service for Hackathon Demos
 * Simulates enterprise email delivery with realistic dispatch receipts and audit logging.
 */

async function sendEmailViaGmail({ ticketId, recipientEmail, subject, body }) {
  if (!recipientEmail || typeof recipientEmail !== 'string') {
    const error = new Error('Recipient email is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!body || typeof body !== 'string') {
    const error = new Error('Email body is required.');
    error.statusCode = 400;
    throw error;
  }

  // Simulate network latency of sending through Google Workspace API (150ms)
  await new Promise((resolve) => setTimeout(resolve, 150));

  const messageId = `gmail_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sentAt = new Date().toISOString();

  console.log(`[Gmail Gateway] ✉️ Demo email dispatched successfully!`);
  console.log(`  To:         ${recipientEmail}`);
  console.log(`  Ticket:     ${ticketId || 'N/A'}`);
  console.log(`  Subject:    Re: ${subject || 'Support Ticket Update'}`);
  console.log(`  Message ID: ${messageId}`);
  console.log(`  Timestamp:  ${sentAt}`);

  return {
    success: true,
    messageId,
    recipientEmail,
    ticketId: ticketId || null,
    sentAt,
    provider: 'Gmail Simulated Gateway',
  };
}

module.exports = {
  sendEmailViaGmail,
};
