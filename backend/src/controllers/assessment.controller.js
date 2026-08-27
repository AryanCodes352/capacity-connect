/**
 * src/controllers/assessment.controller.js — Assessment HTTP Handlers
 */

const assessmentService = require('../services/assessment.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllAssessments = asyncHandler(async (req, res) => {
  const assessments = await assessmentService.getAllAssessments(req.query);
  return sendSuccess(res, 200, 'Assessments retrieved successfully', assessments);
});

const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getAssessmentById(req.params.id);
  return sendSuccess(res, 200, 'Assessment details retrieved', assessment);
});

const getAssessmentForTaking = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getAssessmentForTaking(req.params.id);
  return sendSuccess(res, 200, 'Assessment loaded for testing', assessment);
});

const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.createAssessment(req.body);
  return sendSuccess(res, 201, 'Assessment created successfully', assessment);
});

const submitAssessmentAttempt = asyncHandler(async (req, res) => {
  const result = await assessmentService.submitAssessmentAttempt(
    req.user.id,
    req.params.id,
    req.body
  );
  return sendSuccess(res, 200, 'Assessment submitted and evaluated successfully', result);
});

const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await assessmentService.getUserAttempts(req.user.id);
  return sendSuccess(res, 200, 'Assessment history retrieved', attempts);
});

const getUserAttempts = asyncHandler(async (req, res) => {
  const attempts = await assessmentService.getUserAttempts(req.params.userId);
  return sendSuccess(res, 200, 'User assessment history retrieved', attempts);
});

/**
 * GET /assessments/all-attempts — Trainer/Admin: view all employee submissions
 * Optional query params: ?userId=...&assessmentId=...
 */
const getAllAttempts = asyncHandler(async (req, res) => {
  const attempts = await assessmentService.getAllAttempts(req.query);
  return sendSuccess(res, 200, 'All assessment attempts retrieved', attempts);
});

module.exports = {
  getAllAssessments,
  getAssessmentById,
  getAssessmentForTaking,
  createAssessment,
  submitAssessmentAttempt,
  getMyAttempts,
  getUserAttempts,
  getAllAttempts,
};
