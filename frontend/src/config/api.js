import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// API Configuration
// In production (Heroku), the frontend is served by the Flask backend, so we use relative paths ('')
// In development, we use localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

// Create an axios instance with caching enabled
// Cache will live for 15 minutes by default
export const axios = setupCache(Axios.create(), {
  ttl: 1000 * 60 * 15, // 15 minutes
});

export default API_BASE_URL;
