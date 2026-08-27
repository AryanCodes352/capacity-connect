/**
 * src/routes/role.routes.js — Organizational Role Routes
 */

const express = require('express');
const router = express.Router();

const roleController = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createRoleValidator,
  updateRoleValidator,
} = require('../validators/role.validator');

// All role routes require authentication
router.use(protect);

// Read routes: Accessible to all authenticated users
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);

// Write routes: Admin only
router.post(
  '/',
  restrictTo('ADMIN'),
  createRoleValidator,
  validate,
  roleController.createRole
);

router.put(
  '/:id',
  restrictTo('ADMIN'),
  updateRoleValidator,
  validate,
  roleController.updateRole
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  roleController.deleteRole
);

module.exports = router;
