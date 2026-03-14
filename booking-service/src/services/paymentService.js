const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Initiate payment
exports.processPayment = async (bookingId, amount, userId) => {
  try {
    const response = await axios.post(
      `${PAYMENT_SERVICE_URL}/api/payments/process`,
      {
        bookingId,
        amount,
        userId,
      },
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Payment processing failed');
    }
    throw new Error('Failed to process payment');
  }
};
