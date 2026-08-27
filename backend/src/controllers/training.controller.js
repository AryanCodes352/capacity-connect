/**
 * src/controllers/training.controller.js — Training Assignment HTTP Handlers
 */

const trainingService = require('../services/training.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const assignTraining = asyncHandler(async (req, res) => {
  const result = await trainingService.assignTraining(req.body, req.user.id);
  return sendSuccess(res, 201, `Training assigned successfully to ${result.totalAssigned} employee(s)`, result);
});

const getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await trainingService.getAllAssignments(req.query);
  return sendSuccess(res, 200, 'Training assignments retrieved', assignments);
});

const getMyAssignments = asyncHandler(async (req, res) => {
  const assignments = await trainingService.getUserAssignments(req.user.id);
  return sendSuccess(res, 200, 'User assigned trainings retrieved', assignments);
});

const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const assignment = await trainingService.updateAssignmentStatus(req.params.id, req.body.status);
  return sendSuccess(res, 200, 'Assignment status updated', assignment);
});

module.exports = {
  assignTraining,
  getAllAssignments,
  getMyAssignments,
  updateAssignmentStatus,
};
