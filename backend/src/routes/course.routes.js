/**
 * src/routes/course.routes.js — Course & LMS Routes
 */

const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCourseValidator,
  updateCourseValidator,
  createModuleValidator,
  createLessonValidator,
} = require('../validators/course.validator');

// All course routes require authentication
router.use(protect);

// ── Read Routes ──────────────────────────────────────────────────────────────
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// ── Admin & Trainer Management Routes ─────────────────────────────────────────
router.post(
  '/',
  restrictTo('ADMIN', 'TRAINER'),
  createCourseValidator,
  validate,
  courseController.createCourse
);

router.put(
  '/:id',
  restrictTo('ADMIN', 'TRAINER'),
  updateCourseValidator,
  validate,
  courseController.updateCourse
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  courseController.deleteCourse
);

// Module & Lesson Routes
router.post(
  '/:courseId/modules',
  restrictTo('ADMIN', 'TRAINER'),
  createModuleValidator,
  validate,
  courseController.createModule
);

router.post(
  '/modules/:moduleId/lessons',
  restrictTo('ADMIN', 'TRAINER'),
  createLessonValidator,
  validate,
  courseController.createLesson
);

module.exports = router;
