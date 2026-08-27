/**
 * src/validators/auth.validator.js — Authentication Input Validators
 *
 * Defines express-validator rule arrays for auth-related endpoints.
 * These are used as route-level middleware BEFORE the controller runs.
 *
 * How it works:
 *  1. Express-validator checks each rule against req.body / req.params
 *  2. Errors are stored internally on the request object
 *  3. The `validate` middleware reads those errors and rejects if any found
 *  4. Controller only runs if ALL rules pass
 *
 * Usage:
 *   router.post('/login', loginValidator, validate, authController.login);
 */

const { body } = require('express-validator');

// ─── Login Validator ─────────────────────────────────────────────────────────
const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail() // converts to lowercase and trims
    .isLength({ max: 255 }).withMessage('Email must be less than 255 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password must be less than 128 characters'),
];

// ─── Register Validator ───────────────────────────────────────────────────────
// Only used by Admin when creating employees/trainers (no public self-registration)
const registerValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must be less than 255 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password is too long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 1, max: 50 }).withMessage('First name must be 1–50 characters')
    .trim(),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 1, max: 50 }).withMessage('Last name must be 1–50 characters')
    .trim(),

  body('role')
    .optional()
    .isIn(['ADMIN', 'TRAINER', 'EMPLOYEE']).withMessage('Role must be ADMIN, TRAINER, or EMPLOYEE'),

  body('departmentId')
    .optional()
    .isString().withMessage('Department ID must be a string')
    .notEmpty().withMessage('Department ID cannot be empty'),

  body('orgRoleId')
    .optional()
    .isString().withMessage('Org role ID must be a string'),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Must be a valid phone number'),

  body('jobTitle')
    .optional()
    .isLength({ max: 100 }).withMessage('Job title must be less than 100 characters')
    .trim(),
];

// ─── Change Password Validator ────────────────────────────────────────────────
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

module.exports = { loginValidator, registerValidator, changePasswordValidator };
