/**
 * src/routes/user.routes.js — User Management Routes
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createUserValidator,
  updateUserValidator,
} = require('../validators/user.validator');

// All user management routes require authentication
router.use(protect);

// Admin & Trainer can view users (e.g., trainer viewing learners)
router.get('/', restrictTo('ADMIN', 'TRAINER'), userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Admin only actions
router.post(
  '/',
  restrictTo('ADMIN'),
  createUserValidator,
  validate,
  userController.createUser
);

router.put(
  '/:id',
  restrictTo('ADMIN'),
  updateUserValidator,
  validate,
  userController.updateUser
);

router.patch(
  '/:id/toggle-status',
  restrictTo('ADMIN'),
  userController.toggleUserStatus
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  userController.deleteUser
);

module.exports = router;
