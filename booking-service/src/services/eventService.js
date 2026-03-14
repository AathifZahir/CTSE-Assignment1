const axios = require('axios');

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Check ticket availability
exports.checkAvailability = async (eventId, quantity) => {
  try {
    const response = await axios.get(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/availability`,
      {
        params: { quantity },
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to check availability');
  }
};

// Reserve tickets
exports.reserveTickets = async (eventId, quantity) => {
  try {
    const response = await axios.post(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/reserve`,
      { quantity },
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data.message || 'Failed to reserve tickets');
    }
    throw new Error('Failed to reserve tickets');
  }
};

// Release tickets
exports.releaseTickets = async (eventId, quantity) => {
  try {
    const response = await axios.post(
      `${EVENT_SERVICE_URL}/api/events/${eventId}/release`,
      { quantity },
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to release tickets');
  }
};

// Get event details
exports.getEventDetails = async (eventId) => {
  try {
    const response = await axios.get(
      `${EVENT_SERVICE_URL}/api/events/${eventId}`,
      {
        headers: {
          'x-service-token': SERVICE_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to get event details');
  }
};
