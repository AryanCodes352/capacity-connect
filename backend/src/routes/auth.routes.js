/**
 * src/routes/auth.routes.js — Authentication Routes
 *
 * Maps HTTP endpoints to controller functions, applying validation
 * and authentication/RBAC middleware.
 *
 * Endpoints:
 *  POST /api/auth/login            -> Public: Login with email & password
 *  POST /api/auth/register         -> Protected: Admin only, create new user account
 *  GET  /api/auth/me               -> Protected: Get currently authenticated user profile
 *  PUT  /api/auth/change-password  -> Protected: Change authenticated user password
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  loginValidator,
  registerValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

// ── Public Routes ────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
router.post('/login', loginValidator, validate, authController.login);

// ── Protected Routes ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user's profile
 * @access  Private (All authenticated roles)
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST /api/auth/register
 * @desc    Admin registers/creates a new user
 * @access  Private (Admin only)
 */
router.post(
  '/register',
  protect,
  restrictTo('ADMIN'),
  registerValidator,
  validate,
  authController.register
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for the current user
 * @access  Private (All authenticated roles)
 */
router.put(
  '/change-password',
  protect,
  changePasswordValidator,
  validate,
  authController.changePassword
);

module.exports = router;
