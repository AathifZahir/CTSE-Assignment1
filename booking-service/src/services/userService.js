const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'your-service-token';

// Validate user and get user details
exports.validateUser = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'x-service-token': SERVICE_TOKEN,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Failed to validate user');
  }
};
