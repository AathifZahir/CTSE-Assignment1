const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { confirmBookingById } = require('../controllers/bookingController');

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const VISIBILITY_TIMEOUT = 60;
const WAIT_TIME_SECONDS = 20;
const MAX_NUMBER_OF_MESSAGES = 10;

let client = null;

function getClient() {
  if (!client) {
    client = new SQSClient({ region: AWS_REGION });
  }
  return client;
}

async function processMessage(message) {
  const body = JSON.parse(message.Body || '{}');
  const { bookingId } = body;
  if (!bookingId) {
    console.error('[BOOKING-SERVICE] SQS message missing bookingId:', body);
    return;
  }
  await confirmBookingById(bookingId);
}

async function poll() {
  if (!QUEUE_URL) return [];

  const response = await getClient().send(
    new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,
      WaitTimeSeconds: WAIT_TIME_SECONDS,
      VisibilityTimeout: VISIBILITY_TIMEOUT,
    })
  );

  return response.Messages || [];
}

async function deleteMessage(ReceiptHandle) {
  await getClient().send(
    new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle,
    })
  );
}

async function runLoop() {
  if (!QUEUE_URL) {
    console.log('[BOOKING-SERVICE] SQS_QUEUE_URL not set; SQS consumer disabled');
    return;
  }

  console.log('[BOOKING-SERVICE] SQS consumer started, polling for booking confirmation messages');
  while (true) {
    try {
      const messages = await poll();
      for (const message of messages) {
        try {
          await processMessage(message);
          await deleteMessage(message.ReceiptHandle);
        } catch (error) {
          console.error('[BOOKING-SERVICE] Failed to process SQS message:', error.message);
          // Do not delete; message will reappear after visibility timeout for retry
        }
      }
    } catch (error) {
      console.error('[BOOKING-SERVICE] SQS receive error:', error.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

exports.startSqsConsumer = function startSqsConsumer() {
  runLoop().catch((err) => {
    console.error('[BOOKING-SERVICE] SQS consumer crashed:', err);
    process.exit(1);
  });
};
