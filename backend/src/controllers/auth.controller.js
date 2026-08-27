/**
 * src/controllers/auth.controller.js — Authentication HTTP Handlers with Auto-Bootstrap
 */

const authService = require('../services/auth.service');
const { autoBootstrap } = require('../utils/autoBootstrap');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Auto-seed demo accounts if cloud database is empty
  await autoBootstrap();

  const { token, user } = await authService.login(email, password);

  return sendSuccess(res, 200, 'Login successful', { token, user });
});

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { token, user } = await authService.register(req.body);
  return sendSuccess(res, 201, 'User account created successfully', { token, user });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'User profile fetched', req.user);
});

/**
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  return sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
});

module.exports = { login, register, getMe, changePassword };
