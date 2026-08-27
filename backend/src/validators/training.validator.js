/**
 * src/validators/training.validator.js — Training Assignment Input Validators
 */

const { body, param, query } = require('express-validator');

const createAssignmentValidator = [
  body('userId')
    .optional()
    .isString().withMessage('User ID must be a string'),

  body('userIds')
    .optional()
    .isArray().withMessage('userIds must be an array of user IDs'),

  body('departmentId')
    .optional()
    .isString().withMessage('Department ID must be a string'),

  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isString().withMessage('Course ID must be a string'),

  body('deadline')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date string'),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
    .trim(),
];

const updateAssignmentStatusValidator = [
  param('id')
    .notEmpty().withMessage('Assignment ID is required'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).withMessage('Invalid assignment status'),
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentStatusValidator,
};
