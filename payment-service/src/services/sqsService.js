const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

let client = null;

function getClient() {
  if (!client) {
    client = new SQSClient({ region: AWS_REGION });
  }
  return client;
}

/**
 * Send a booking confirmation message to SQS after successful payment.
 * Message body: { bookingId, paymentId, userId }
 */
exports.sendBookingConfirmationMessage = async ({ bookingId, paymentId, userId }) => {
  if (!QUEUE_URL) {
    console.warn('[PAYMENT-SERVICE] SQS_QUEUE_URL not set; skipping SQS send');
    return;
  }

  try {
    const body = JSON.stringify({ bookingId, paymentId, userId });
    await getClient().send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: body,
      })
    );
    console.log(`[PAYMENT-SERVICE] Sent booking confirmation message to SQS for bookingId: ${bookingId}`);
  } catch (error) {
    console.error('[PAYMENT-SERVICE] Failed to send message to SQS:', error.message);
    throw error;
  }
};
