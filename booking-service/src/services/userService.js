const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Log service connection on module load
console.log(`[BOOKING-SERVICE] Configured to connect to User Service at: ${USER_SERVICE_URL}`);

// Validate user and get user details
exports.validateUser = async (userId) => {
  try {
    console.log(`[BOOKING-SERVICE → USER-SERVICE] Validating user: ${userId}`);
    console.log(`[BOOKING-SERVICE → USER-SERVICE] Calling: GET ${USER_SERVICE_URL}/api/users/${userId}`);
    
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'x-service-token': SERVICE_TOKEN,
      },
    });
    
    console.log(`[BOOKING-SERVICE → USER-SERVICE] Successfully validated user: ${userId}`);
    return response.data;
  } catch (error) {
    console.error(`[BOOKING-SERVICE → USER-SERVICE] Failed to validate user ${userId}:`, error.message);
    if (error.response && error.response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Failed to validate user');
  }
};
