const axios = require('axios');

/**
 * Create an axios instance that forwards the caller's JWT
 * to other internal microservices.
 * @param {string} token - Bearer token from the original request
 */
const createServiceClient = (token) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 8000,
  });
};

module.exports = { createServiceClient };