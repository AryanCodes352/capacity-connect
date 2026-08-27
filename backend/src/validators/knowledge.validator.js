/**
 * src/validators/knowledge.validator.js — Knowledge Hub Input Validators
 */

const { body, param, query } = require('express-validator');

const createResourceValidator = [
  body('title')
    .notEmpty().withMessage('Resource title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .trim(),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['SOP', 'BEST_PRACTICE', 'TECHNICAL_DOC', 'POLICY', 'TEMPLATE', 'WHITEPAPER']).withMessage('Invalid resource category'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),

  body('fileUrl')
    .optional()
    .isString().withMessage('File URL must be a string')
    .trim(),

  body('fileType')
    .optional()
    .isString().withMessage('File type must be a string')
    .trim(),

  body('competencyId')
    .optional({ values: 'null' })
    .isString().withMessage('Competency ID must be a string'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array of strings'),
];

const updateResourceValidator = [
  param('id')
    .notEmpty().withMessage('Resource ID is required'),

  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim(),

  body('category')
    .optional()
    .isIn(['SOP', 'BEST_PRACTICE', 'TECHNICAL_DOC', 'POLICY', 'TEMPLATE', 'WHITEPAPER']).withMessage('Invalid resource category'),
];

module.exports = {
  createResourceValidator,
  updateResourceValidator,
};
