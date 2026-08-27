/**
 * src/controllers/skillGap.controller.js — Skill Gap HTTP Handlers
 */

const skillGapService = require('../services/skillGap.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getMySkillGaps = asyncHandler(async (req, res) => {
  const gaps = await skillGapService.getEmployeeGaps(req.user.id);
  return sendSuccess(res, 200, 'Employee skill gaps retrieved', gaps);
});

const getEmployeeSkillGaps = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const gaps = await skillGapService.getEmployeeGaps(userId);
  return sendSuccess(res, 200, 'Employee skill gaps retrieved', gaps);
});

const recalculateAllGaps = asyncHandler(async (req, res) => {
  const result = await skillGapService.recalculateAllOrganizationGaps();
  return sendSuccess(res, 200, `Successfully recalculated skill gaps for ${result.totalUpdated} employees`, result);
});

const getOrganizationGapStatistics = asyncHandler(async (req, res) => {
  const stats = await skillGapService.getOrganizationGapStatistics();
  return sendSuccess(res, 200, 'Organization skill gap statistics retrieved', stats);
});

const getDepartmentGapBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await skillGapService.getDepartmentGapBreakdown();
  return sendSuccess(res, 200, 'Department skill gap breakdown retrieved', breakdown);
});

module.exports = {
  getMySkillGaps,
  getEmployeeSkillGaps,
  recalculateAllGaps,
  getOrganizationGapStatistics,
  getDepartmentGapBreakdown,
};
