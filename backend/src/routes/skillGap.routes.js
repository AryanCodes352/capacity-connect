/**
 * src/routes/skillGap.routes.js — Skill Gap Analysis Routes
 */

const express = require('express');
const router = express.Router();

const skillGapController = require('../controllers/skillGap.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// All skill gap routes require authentication
router.use(protect);

// Employee routes
router.get('/my-gaps', skillGapController.getMySkillGaps);

// Admin & Trainer aggregation routes
router.get('/organization-summary', restrictTo('ADMIN', 'TRAINER'), skillGapController.getOrganizationGapStatistics);
router.get('/department-breakdown', restrictTo('ADMIN', 'TRAINER'), skillGapController.getDepartmentGapBreakdown);
router.post('/recalculate', restrictTo('ADMIN'), skillGapController.recalculateAllGaps);

// Specific employee gap lookup
router.get('/employee/:userId', restrictTo('ADMIN', 'TRAINER'), skillGapController.getEmployeeSkillGaps);

module.exports = router;
