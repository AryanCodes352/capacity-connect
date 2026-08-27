/**
 * src/routes/training.routes.js — Training Assignment Routes
 */

const express = require('express');
const router = express.Router();

const trainingController = require('../controllers/training.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createAssignmentValidator,
  updateAssignmentStatusValidator,
} = require('../validators/training.validator');

router.use(protect);

// Employee view of their assigned trainings
router.get('/my-assignments', trainingController.getMyAssignments);

// Admin assignment management
router.get('/', restrictTo('ADMIN'), trainingController.getAllAssignments);

router.post(
  '/assign',
  restrictTo('ADMIN'),
  createAssignmentValidator,
  validate,
  trainingController.assignTraining
);

router.patch(
  '/:id/status',
  restrictTo('ADMIN'),
  updateAssignmentStatusValidator,
  validate,
  trainingController.updateAssignmentStatus
);

module.exports = router;
