/**
 * src/routes/competency.routes.js — Competency Management Routes
 */

const express = require('express');
const router = express.Router();

const competencyController = require('../controllers/competency.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCompetencyValidator,
  updateCompetencyValidator,
  updateEmployeeCompetencyValidator,
} = require('../validators/competency.validator');

// All competency routes require authentication
router.use(protect);

// ── General Competency Endpoints ─────────────────────────────────────────────
router.get('/categories', competencyController.getCompetencyCategories);
router.get('/', competencyController.getAllCompetencies);
router.get('/my-competencies', competencyController.getEmployeeCompetencies);
router.get('/:id', competencyController.getCompetencyById);

// ── Employee Competency Endpoints ────────────────────────────────────────────
router.get('/employee/:userId', competencyController.getEmployeeCompetencies);
router.put(
  '/employee/:userId',
  restrictTo('ADMIN'),
  updateEmployeeCompetencyValidator,
  validate,
  competencyController.updateEmployeeCompetency
);

// ── Admin Management Routes ───────────────────────────────────────────────────
router.post(
  '/',
  restrictTo('ADMIN'),
  createCompetencyValidator,
  validate,
  competencyController.createCompetency
);

router.put(
  '/:id',
  restrictTo('ADMIN'),
  updateCompetencyValidator,
  validate,
  competencyController.updateCompetency
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  competencyController.deleteCompetency
);

module.exports = router;
