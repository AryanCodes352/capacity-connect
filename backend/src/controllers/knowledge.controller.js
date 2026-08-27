/**
 * src/controllers/knowledge.controller.js — Knowledge Hub HTTP Handlers
 */

const knowledgeService = require('../services/knowledge.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllResources = asyncHandler(async (req, res) => {
  const resources = await knowledgeService.getAllResources(req.query);
  return sendSuccess(res, 200, 'Knowledge resources retrieved successfully', resources);
});

const getResourceById = asyncHandler(async (req, res) => {
  const resource = await knowledgeService.getResourceById(req.params.id);
  return sendSuccess(res, 200, 'Resource details retrieved', resource);
});

const createResource = asyncHandler(async (req, res) => {
  const resource = await knowledgeService.createResource(req.body, req.user.id);
  return sendSuccess(res, 201, 'Knowledge resource published successfully', resource);
});

const updateResource = asyncHandler(async (req, res) => {
  const resource = await knowledgeService.updateResource(req.params.id, req.body);
  return sendSuccess(res, 200, 'Knowledge resource updated successfully', resource);
});

const deleteResource = asyncHandler(async (req, res) => {
  await knowledgeService.deleteResource(req.params.id);
  return sendSuccess(res, 200, 'Knowledge resource removed successfully');
});

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};
