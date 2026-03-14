const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Log service connection on module load
console.log(`[BOOKING-SERVICE] Configured to connect to Payment Service at: ${PAYMENT_SERVICE_URL}`);

// Initiate payment
exports.processPayment = async (bookingId, amount, userId) => {
  try {
    console.log(`[BOOKING-SERVICE → PAYMENT-SERVICE] Processing payment for booking: ${bookingId}, amount: ${amount}, userId: ${userId}`);
    console.log(`[BOOKING-SERVICE → PAYMENT-SERVICE] Calling: POST ${PAYMENT_SERVICE_URL}/api/payments/process`);
    
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
    
    console.log(`[BOOKING-SERVICE → PAYMENT-SERVICE] Payment processed successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → PAYMENT-SERVICE] Payment processing failed for booking ${bookingId}:`, error.message);
    if (error.response) {
      throw new Error(error.response.data.message || 'Payment processing failed');
    }
    throw new Error('Failed to process payment');
  }
};
