/**
 * src/validators/competency.validator.js — Competency Input Validators
 */

const { body, param, query } = require('express-validator');

const createCompetencyValidator = [
  body('name')
    .notEmpty().withMessage('Competency name is required')
    .isString().withMessage('Competency name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Competency name must be 2-100 characters')
    .trim(),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('maxLevel')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Max level must be an integer between 1 and 10'),
];

const updateCompetencyValidator = [
  param('id')
    .notEmpty().withMessage('Competency ID is required'),

  body('name')
    .optional()
    .isString().withMessage('Competency name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Competency name must be 2-100 characters')
    .trim(),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('maxLevel')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Max level must be an integer between 1 and 10'),
];

const updateEmployeeCompetencyValidator = [
  param('userId')
    .notEmpty().withMessage('User ID is required'),

  body('competencyId')
    .notEmpty().withMessage('Competency ID is required'),

  body('currentLevel')
    .notEmpty().withMessage('Current level is required')
    .isInt({ min: 1, max: 4 }).withMessage('Current level must be between 1 and 4'),
];

module.exports = {
  createCompetencyValidator,
  updateCompetencyValidator,
  updateEmployeeCompetencyValidator,
};
