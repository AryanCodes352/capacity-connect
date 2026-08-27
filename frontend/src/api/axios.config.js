/**
 * src/api/axios.config.js — Axios instance for CAPACITY CONNECT
 *
 * This file creates a configured Axios instance with:
 *  1. A base URL pointing to the backend API
 *  2. Default headers
 *  3. A request interceptor that automatically attaches the JWT token
 *  4. A response interceptor that handles 401 (auto logout on token expiry)
 *
 * Every API module (auth.api.js, course.api.js, etc.) imports this instance
 * instead of using the raw `axios` package. This means auth logic only lives
 * in one place.
 */

import axios from 'axios';

// In development, Vite proxies /api → http://localhost:5000
// In production, set VITE_API_URL in your .env file
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout — adjust if uploads are large
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Runs before every request. Reads the JWT from localStorage and attaches it.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token'); // cc_ prefix = CapacityConnect
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs after every response. Handles token expiry globally.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear local storage and redirect to login
      // We check if we're already on the login page to avoid infinite redirects
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
