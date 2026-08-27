/**
 * src/validators/department.validator.js — Department Input Validators
 */

const { body, param } = require('express-validator');

const createDepartmentValidator = [
  body('name')
    .notEmpty().withMessage('Department name is required')
    .isString().withMessage('Department name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be 2-100 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('code')
    .optional()
    .isString().withMessage('Code must be a string')
    .isLength({ min: 2, max: 10 }).withMessage('Code must be 2-10 characters')
    .toUpperCase()
    .trim(),
];

const updateDepartmentValidator = [
  param('id')
    .notEmpty().withMessage('Department ID is required'),

  body('name')
    .optional()
    .isString().withMessage('Department name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be 2-100 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('code')
    .optional()
    .isString().withMessage('Code must be a string')
    .isLength({ min: 2, max: 10 }).withMessage('Code must be 2-10 characters')
    .toUpperCase()
    .trim(),
];

module.exports = {
  createDepartmentValidator,
  updateDepartmentValidator,
};
