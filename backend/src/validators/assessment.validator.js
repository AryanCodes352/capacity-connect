/**
 * src/validators/assessment.validator.js — Assessment Input Validators
 */

const { body, param, query } = require('express-validator');

const createAssessmentValidator = [
  body('title')
    .notEmpty().withMessage('Assessment title is required')
    .isString().withMessage('Assessment title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .trim(),

  body('competencyId')
    .notEmpty().withMessage('Competency ID is required')
    .isString().withMessage('Competency ID must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),

  body('courseId')
    .optional({ values: 'null' })
    .isString().withMessage('Course ID must be a string'),

  body('passingScore')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Passing score must be between 1 and 100'),

  body('timeLimitMin')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 300 }).withMessage('Time limit must be between 1 and 300 minutes'),

  body('questions')
    .optional()
    .isArray({ min: 1 }).withMessage('Questions must be an array with at least 1 question'),

  body('questions.*.text')
    .optional()
    .notEmpty().withMessage('Question text is required'),

  body('questions.*.options')
    .optional()
    .isArray({ min: 2 }).withMessage('Each question must have at least 2 options'),
];

const submitAttemptValidator = [
  param('id')
    .notEmpty().withMessage('Assessment ID is required'),

  body('answers')
    .isArray({ min: 1 }).withMessage('Answers array is required with at least 1 answer'),

  body('answers.*.questionId')
    .notEmpty().withMessage('Question ID is required for each answer'),

  body('answers.*.selectedOptionId')
    .optional({ values: 'null' })
    .isString().withMessage('Selected option ID must be a string'),

  body('isPreTraining')
    .optional()
    .isBoolean().withMessage('isPreTraining must be a boolean'),

  body('isPostTraining')
    .optional()
    .isBoolean().withMessage('isPostTraining must be a boolean'),

  body('courseId')
    .optional({ values: 'null' })
    .isString().withMessage('Course ID must be a string'),
];

module.exports = {
  createAssessmentValidator,
  submitAttemptValidator,
};
