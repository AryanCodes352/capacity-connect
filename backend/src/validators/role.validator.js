/**
 * src/validators/role.validator.js — Organizational Role Input Validators
 */

const { body, param } = require('express-validator');

const createRoleValidator = [
  body('name')
    .notEmpty().withMessage('Role name is required')
    .isString().withMessage('Role name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Role name must be 2-100 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('departmentId')
    .optional()
    .isString().withMessage('Department ID must be a string')
    .trim(),

  body('competencies')
    .optional()
    .isArray().withMessage('Competencies must be an array of { competencyId, requiredLevel }'),

  body('competencies.*.competencyId')
    .optional()
    .isString().withMessage('Competency ID must be a string'),

  body('competencies.*.requiredLevel')
    .optional()
    .isInt({ min: 1, max: 4 }).withMessage('Required level must be an integer between 1 and 4'),
];

const updateRoleValidator = [
  param('id')
    .notEmpty().withMessage('Role ID is required'),

  body('name')
    .optional()
    .isString().withMessage('Role name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Role name must be 2-100 characters')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('departmentId')
    .optional()
    .isString().withMessage('Department ID must be a string')
    .trim(),

  body('competencies')
    .optional()
    .isArray().withMessage('Competencies must be an array of { competencyId, requiredLevel }'),
];

module.exports = {
  createRoleValidator,
  updateRoleValidator,
};
