/**
 * src/controllers/role.controller.js — Organizational Role HTTP Handlers
 */

const roleService = require('../services/role.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.getAllRoles(req.query);
  return sendSuccess(res, 200, 'Roles retrieved successfully', roles);
});

const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return sendSuccess(res, 200, 'Role details retrieved', role);
});

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  return sendSuccess(res, 201, 'Role created successfully', role);
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  return sendSuccess(res, 200, 'Role updated successfully', role);
});

const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id);
  return sendSuccess(res, 200, 'Role deleted successfully');
});

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
