/**
 * src/routes/department.routes.js — Department Routes
 */

const express = require('express');
const router = express.Router();

const departmentController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createDepartmentValidator,
  updateDepartmentValidator,
} = require('../validators/department.validator');

// All department routes require authentication
router.use(protect);

// Read routes: Accessible to all authenticated users
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Write routes: Admin only
router.post(
  '/',
  restrictTo('ADMIN'),
  createDepartmentValidator,
  validate,
  departmentController.createDepartment
);

router.put(
  '/:id',
  restrictTo('ADMIN'),
  updateDepartmentValidator,
  validate,
  departmentController.updateDepartment
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  departmentController.deleteDepartment
);

module.exports = router;
