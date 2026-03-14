const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Confirm booking after successful payment
exports.confirmBooking = async (bookingId) => {
  try {
    const response = await axios.post(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/confirm`,
      {},
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to confirm booking');
  }
};
