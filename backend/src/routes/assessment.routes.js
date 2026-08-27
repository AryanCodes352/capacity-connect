/**
 * src/routes/assessment.routes.js — Assessment Routes
 */

const express = require('express');
const router = express.Router();

const assessmentController = require('../controllers/assessment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createAssessmentValidator,
  submitAttemptValidator,
} = require('../validators/assessment.validator');

// All assessment routes require authentication
router.use(protect);

// ── Read & Attempt Endpoints (Employee, Trainer, Admin) ──────────────────────
router.get('/', assessmentController.getAllAssessments);
router.get('/my-attempts', assessmentController.getMyAttempts);
router.get('/:id/take', assessmentController.getAssessmentForTaking);
router.get('/:id', assessmentController.getAssessmentById);

// Submit test attempt
router.post(
  '/:id/submit',
  submitAttemptValidator,
  validate,
  assessmentController.submitAssessmentAttempt
);

// View user attempts (Admin / Trainer)
router.get('/user/:userId', restrictTo('ADMIN', 'TRAINER'), assessmentController.getUserAttempts);

// ── Admin / Trainer Management Endpoints ─────────────────────────────────────
router.post(
  '/',
  restrictTo('ADMIN', 'TRAINER'),
  createAssessmentValidator,
  validate,
  assessmentController.createAssessment
);

module.exports = router;
