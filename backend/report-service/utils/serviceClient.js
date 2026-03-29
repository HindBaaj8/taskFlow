const axios = require('axios');

const createServiceClient = (token, baseURL) => {
  if (!token) {
    throw new Error('No authorization token provided');
  }

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    timeout: 8000,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(`Service error [${baseURL}]:`, error.message);
      return Promise.reject(error);
    }
  );

  return client;
};

module.exports = { createServiceClient };