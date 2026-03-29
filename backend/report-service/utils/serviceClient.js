const axios = require('axios');

<<<<<<< HEAD
const createServiceClient = (token, baseURL) => {
  if (!token) {
    throw new Error('No authorization token provided');
  }

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: token,
=======
/**
 * Create an axios instance that forwards the caller's JWT
 * to other internal microservices.
 * @param {string} token - Bearer token from the original request
 */
const createServiceClient = (token) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
>>>>>>> hind
      'Content-Type': 'application/json',
    },
    timeout: 8000,
  });
<<<<<<< HEAD

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(`Service error [${baseURL}]:`, error.message);
      return Promise.reject(error);
    }
  );

  return client;
=======
>>>>>>> hind
};

module.exports = { createServiceClient };