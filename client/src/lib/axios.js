import axios from 'axios';

// Create a new Axios instance with a base URL.
// All requests made with this instance will automatically go to our backend API.
const api = axios.create({
  baseURL: 'http://localhost:3002/api', // Your backend server URL
});

// Use an interceptor to add the JWT token to every outgoing request if it exists.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage.
    const token = localStorage.getItem('authToken');
    if (token) {
      // Add the Authorization header with the Bearer token.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default api;

