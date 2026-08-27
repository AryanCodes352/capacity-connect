/**
 * src/routes/knowledge.routes.js — Knowledge Hub Routes
 */

const express = require('express');
const router = express.Router();

const knowledgeController = require('../controllers/knowledge.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createResourceValidator,
  updateResourceValidator,
} = require('../validators/knowledge.validator');

router.use(protect);

// Read endpoints (All authenticated users)
router.get('/', knowledgeController.getAllResources);
router.get('/:id', knowledgeController.getResourceById);

// Write endpoints (Admin & Trainer)
router.post(
  '/',
  restrictTo('ADMIN', 'TRAINER'),
  createResourceValidator,
  validate,
  knowledgeController.createResource
);

router.put(
  '/:id',
  restrictTo('ADMIN', 'TRAINER'),
  updateResourceValidator,
  validate,
  knowledgeController.updateResource
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  knowledgeController.deleteResource
);

module.exports = router;
