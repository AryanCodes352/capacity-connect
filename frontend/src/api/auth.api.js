/**
 * src/api/auth.api.js — Authentication API Client
 *
 * Provides functions for all auth-related API requests:
 *  - login(email, password)
 *  - getMe()
 *  - registerUser(userData) [Admin only]
 *  - changePassword(currentPassword, newPassword, confirmPassword)
 */

import axiosInstance from './axios.config';

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginApi = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data.data;
};

/**
 * Fetch current authenticated user's profile
 * @returns {Promise<object>} User object
 */
export const getMeApi = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data.data;
};

/**
 * Admin creates a new user account
 * @param {object} userData
 * @returns {Promise<{ token: string, user: object }>}
 */
export const registerUserApi = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data.data;
};

/**
 * Change current user password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {Promise<object>} Response message
 */
export const changePasswordApi = async (currentPassword, newPassword, confirmPassword) => {
  const response = await axiosInstance.put('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};
