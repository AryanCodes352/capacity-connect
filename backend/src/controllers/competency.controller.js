/**
 * src/controllers/competency.controller.js — Competency HTTP Handlers
 */

const competencyService = require('../services/competency.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllCompetencies = asyncHandler(async (req, res) => {
  const competencies = await competencyService.getAllCompetencies(req.query);
  return sendSuccess(res, 200, 'Competencies retrieved successfully', competencies);
});

const getCompetencyCategories = asyncHandler(async (req, res) => {
  const categories = await competencyService.getCompetencyCategories();
  return sendSuccess(res, 200, 'Competency categories retrieved', categories);
});

const getCompetencyById = asyncHandler(async (req, res) => {
  const competency = await competencyService.getCompetencyById(req.params.id);
  return sendSuccess(res, 200, 'Competency details retrieved', competency);
});

const createCompetency = asyncHandler(async (req, res) => {
  const competency = await competencyService.createCompetency(req.body);
  return sendSuccess(res, 201, 'Competency created successfully', competency);
});

const updateCompetency = asyncHandler(async (req, res) => {
  const competency = await competencyService.updateCompetency(req.params.id, req.body);
  return sendSuccess(res, 200, 'Competency updated successfully', competency);
});

const deleteCompetency = asyncHandler(async (req, res) => {
  await competencyService.deleteCompetency(req.params.id);
  return sendSuccess(res, 200, 'Competency deleted successfully');
});

const getEmployeeCompetencies = asyncHandler(async (req, res) => {
  // If no userId param is provided, default to currently logged-in user
  const userId = req.params.userId || req.user.id;
  const result = await competencyService.getEmployeeCompetencies(userId);
  return sendSuccess(res, 200, 'Employee competencies retrieved', result);
});

const updateEmployeeCompetency = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { competencyId, currentLevel } = req.body;
  const result = await competencyService.updateEmployeeCompetency(userId, competencyId, currentLevel);
  return sendSuccess(res, 200, 'Employee competency updated successfully', result);
});

module.exports = {
  getAllCompetencies,
  getCompetencyCategories,
  getCompetencyById,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  getEmployeeCompetencies,
  updateEmployeeCompetency,
};
