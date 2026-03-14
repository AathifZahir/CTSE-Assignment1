const axios = require('axios');

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Log service connection on module load
console.log(`[BOOKING-SERVICE] Configured to connect to Event Service at: ${EVENT_SERVICE_URL}`);

// Check ticket availability
exports.checkAvailability = async (eventId, quantity) => {
  try {
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Checking availability for event: ${eventId}, quantity: ${quantity}`);
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Calling: GET ${EVENT_SERVICE_URL}/api/events/${eventId}/availability?quantity=${quantity}`);
    
    const response = await axios.get(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/availability`,
      {
        params: { quantity },
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Availability check successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → EVENT-SERVICE] Failed to check availability for event ${eventId}:`, error.message);
    if (error.response && error.response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to check availability');
  }
};

// Reserve tickets
exports.reserveTickets = async (eventId, quantity) => {
  try {
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Reserving ${quantity} tickets for event: ${eventId}`);
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Calling: POST ${EVENT_SERVICE_URL}/api/events/${eventId}/reserve`);
    
    const response = await axios.post(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/reserve`,
      { quantity },
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Successfully reserved ${quantity} tickets:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → EVENT-SERVICE] Failed to reserve tickets for event ${eventId}:`, error.message);
    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data.message || 'Failed to reserve tickets');
    }
    throw new Error('Failed to reserve tickets');
  }
};

// Release tickets
exports.releaseTickets = async (eventId, quantity) => {
  try {
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Releasing ${quantity} tickets for event: ${eventId}`);
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Calling: POST ${EVENT_SERVICE_URL}/api/events/${eventId}/release`);
    
    const response = await axios.post(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/release`,
      { quantity },
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Successfully released ${quantity} tickets:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → EVENT-SERVICE] Failed to release tickets for event ${eventId}:`, error.message);
    throw new Error('Failed to release tickets');
  }
};

// Get event details
exports.getEventDetails = async (eventId) => {
  try {
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Getting event details for: ${eventId}`);
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Calling: GET ${EVENT_SERVICE_URL}/api/events/${eventId}`);
    
    const response = await axios.get(
      `${EVENT_SERVICE_URL}/api/events/${eventId}`,
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    
    console.log(`[BOOKING-SERVICE → EVENT-SERVICE] Successfully retrieved event details for: ${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → EVENT-SERVICE] Failed to get event details for ${eventId}:`, error.message);
    if (error.response && error.response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to get event details');
  }
};
