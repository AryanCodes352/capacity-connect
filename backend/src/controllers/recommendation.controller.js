/**
 * src/controllers/recommendation.controller.js — Recommendation HTTP Handlers
 */

const recommendationService = require('../services/recommendation.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getMyRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.getUserRecommendations(req.user.id);
  return sendSuccess(res, 200, 'Personalized learning recommendations retrieved', recommendations);
});

const generateRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.generateRecommendationsForUser(req.user.id);
  return sendSuccess(res, 200, 'Learning recommendations refreshed successfully', recommendations);
});

const dismissRecommendation = asyncHandler(async (req, res) => {
  await recommendationService.dismissRecommendation(req.user.id, req.params.courseId);
  return sendSuccess(res, 200, 'Recommendation dismissed');
});

module.exports = {
  getMyRecommendations,
  generateRecommendations,
  dismissRecommendation,
};
