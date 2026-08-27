/**
 * src/controllers/ai.controller.js — AI Assistant HTTP Handlers
 */

const aiService = require('../services/ai.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const chatWithAssistant = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const response = await aiService.generateCapacityResponse(req.user.id, prompt);
  return sendSuccess(res, 200, 'AI response generated', response);
});

module.exports = {
  chatWithAssistant,
};
