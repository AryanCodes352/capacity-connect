/**
 * src/routes/analytics.routes.js — Analytics Routes
 */

const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect);

router.get('/dashboard-metrics', analyticsController.getDashboardMetrics);
router.get('/effectiveness', analyticsController.getTrainingEffectiveness);
router.get('/courses-roi', analyticsController.getCourseRoiRankings);
router.get('/department-heatmap', restrictTo('ADMIN', 'TRAINER'), analyticsController.getDepartmentHeatmap);

module.exports = router;
