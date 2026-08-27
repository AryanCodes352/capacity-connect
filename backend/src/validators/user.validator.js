/**
 * src/validators/user.validator.js — User Management Input Validators
 */

const { body, param, query } = require('express-validator');

const createUserValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('firstName')
    .notEmpty().withMessage('First name is required')
    .trim(),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .trim(),

  body('role')
    .optional()
    .isIn(['ADMIN', 'TRAINER', 'EMPLOYEE']).withMessage('Role must be ADMIN, TRAINER, or EMPLOYEE'),

  body('departmentId')
    .optional({ values: 'null' })
    .isString().withMessage('Department ID must be a string'),

  body('orgRoleId')
    .optional({ values: 'null' })
    .isString().withMessage('Org role ID must be a string'),

  body('jobTitle')
    .optional()
    .isString().withMessage('Job title must be a string')
    .trim(),

  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string')
    .trim(),
];

const updateUserValidator = [
  param('id')
    .notEmpty().withMessage('User ID is required'),

  body('firstName')
    .optional()
    .isString().withMessage('First name must be a string')
    .trim(),

  body('lastName')
    .optional()
    .isString().withMessage('Last name must be a string')
    .trim(),

  body('role')
    .optional()
    .isIn(['ADMIN', 'TRAINER', 'EMPLOYEE']).withMessage('Role must be ADMIN, TRAINER, or EMPLOYEE'),

  body('departmentId')
    .optional({ values: 'null' })
    .isString().withMessage('Department ID must be a string'),

  body('orgRoleId')
    .optional({ values: 'null' })
    .isString().withMessage('Org role ID must be a string'),

  body('jobTitle')
    .optional()
    .isString().withMessage('Job title must be a string')
    .trim(),

  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string')
    .trim(),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
