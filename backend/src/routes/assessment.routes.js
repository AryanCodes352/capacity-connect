/**
 * src/routes/assessment.routes.js — Assessment Routes
 *
 * IMPORTANT: Route ordering matters in Express!
 * Specific path segments (e.g. /my-attempts, /user/:userId, /all-attempts)
 * MUST be registered BEFORE wildcard param routes (/:id)
 * to prevent Express from treating those path segments as an :id value.
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

// ── Specific named routes FIRST (before wildcard /:id) ────────────────────────

// Employee: view their own attempt history
router.get('/my-attempts', assessmentController.getMyAttempts);

// Trainer + Admin: view ALL employee attempts across all assessments
router.get(
  '/all-attempts',
  restrictTo('ADMIN', 'TRAINER'),
  assessmentController.getAllAttempts
);

// Trainer + Admin: view attempts for a specific user
// NOTE: This must come BEFORE /:id to prevent "user" being treated as an :id
router.get(
  '/user/:userId',
  restrictTo('ADMIN', 'TRAINER'),
  assessmentController.getUserAttempts
);

// ── Read & Attempt Endpoints (all authenticated users) ───────────────────────
router.get('/', assessmentController.getAllAssessments);
router.get('/:id/take', assessmentController.getAssessmentForTaking);
router.get('/:id', assessmentController.getAssessmentById);

// Submit assessment attempt (employees)
router.post(
  '/:id/submit',
  submitAttemptValidator,
  validate,
  assessmentController.submitAssessmentAttempt
);

// ── Admin / Trainer Management Endpoints ─────────────────────────────────────
router.post(
  '/',
  restrictTo('ADMIN', 'TRAINER'),
  createAssessmentValidator,
  validate,
  assessmentController.createAssessment
);

module.exports = router;
