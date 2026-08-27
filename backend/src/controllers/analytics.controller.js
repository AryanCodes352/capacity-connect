/**
 * src/controllers/analytics.controller.js — Analytics HTTP Handlers
 */

const analyticsService = require('../services/analytics.service');
const skillGapService = require('../services/skillGap.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getTrainingEffectiveness = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTrainingEffectivenessData();
  return sendSuccess(res, 200, 'Training effectiveness metrics retrieved', data);
});

const getCourseRoiRankings = asyncHandler(async (req, res) => {
  const rankings = await analyticsService.getCourseEffectivenessRankings();
  return sendSuccess(res, 200, 'Course ROI rankings retrieved', rankings);
});

const getDepartmentHeatmap = asyncHandler(async (req, res) => {
  const heatmap = await skillGapService.getDepartmentGapBreakdown();
  return sendSuccess(res, 200, 'Department competency heatmap retrieved', heatmap);
});

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const metrics = await analyticsService.getOrganizationDashboardMetrics();
  return sendSuccess(res, 200, 'Organization dashboard metrics retrieved', metrics);
});

module.exports = {
  getTrainingEffectiveness,
  getCourseRoiRankings,
  getDepartmentHeatmap,
  getDashboardMetrics,
};
