const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Log service connection on module load
console.log(`[PAYMENT-SERVICE] Configured to connect to Booking Service at: ${BOOKING_SERVICE_URL}`);

// Confirm booking after successful payment
exports.confirmBooking = async (bookingId) => {
  try {
    console.log(`[PAYMENT-SERVICE → BOOKING-SERVICE] Confirming booking: ${bookingId}`);
    console.log(`[PAYMENT-SERVICE → BOOKING-SERVICE] Calling: POST ${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/confirm`);
    
    const response = await axios.post(
      `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}/confirm`,
      {},
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    
    console.log(`[PAYMENT-SERVICE → BOOKING-SERVICE] Successfully confirmed booking: ${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`[PAYMENT-SERVICE → BOOKING-SERVICE] Failed to confirm booking ${bookingId}:`, error.message);
    throw new Error('Failed to confirm booking');
  }
};
