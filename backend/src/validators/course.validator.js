/**
 * src/validators/course.validator.js — Course & LMS Input Validators
 */

const { body, param, query } = require('express-validator');

const createCourseValidator = [
  body('title')
    .notEmpty().withMessage('Course title is required')
    .isString().withMessage('Course title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Course title must be 3-200 characters')
    .trim(),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .trim(),

  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),

  body('durationHours')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Duration must be between 1 and 500 hours'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),

  body('competencies')
    .optional()
    .isArray().withMessage('Competencies must be an array of { competencyId, targetLevel }'),
];

const updateCourseValidator = [
  param('id')
    .notEmpty().withMessage('Course ID is required'),

  body('title')
    .optional()
    .isString().withMessage('Course title must be a string')
    .trim(),

  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
];

const createModuleValidator = [
  param('courseId')
    .notEmpty().withMessage('Course ID is required'),

  body('title')
    .notEmpty().withMessage('Module title is required')
    .isString().withMessage('Module title must be a string')
    .trim(),

  body('order')
    .optional()
    .isInt({ min: 1 }).withMessage('Order must be a positive integer'),
];

const createLessonValidator = [
  param('moduleId')
    .notEmpty().withMessage('Module ID is required'),

  body('title')
    .notEmpty().withMessage('Lesson title is required')
    .isString().withMessage('Lesson title must be a string')
    .trim(),

  body('type')
    .optional()
    .isIn(['TEXT', 'VIDEO', 'PDF', 'EXTERNAL_LINK', 'DOCUMENT']).withMessage('Invalid lesson type'),

  body('content')
    .optional()
    .isString().withMessage('Content must be a string'),

  body('durationMin')
    .optional()
    .isInt({ min: 1, max: 600 }).withMessage('Duration minutes must be between 1 and 600'),
];

module.exports = {
  createCourseValidator,
  updateCourseValidator,
  createModuleValidator,
  createLessonValidator,
};
