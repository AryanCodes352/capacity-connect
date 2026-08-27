/**
 * src/controllers/department.controller.js — Department HTTP Handlers
 */

const departmentService = require('../services/department.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getAllDepartments();
  return sendSuccess(res, 200, 'Departments retrieved successfully', departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  return sendSuccess(res, 200, 'Department details retrieved', department);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  return sendSuccess(res, 201, 'Department created successfully', department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  return sendSuccess(res, 200, 'Department updated successfully', department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  return sendSuccess(res, 200, 'Department deleted successfully');
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
