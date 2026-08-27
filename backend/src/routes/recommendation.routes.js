/**
 * src/routes/recommendation.routes.js — Recommendation Routes
 */

const express = require('express');
const router = express.Router();

const recommendationController = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', recommendationController.getMyRecommendations);
router.post('/refresh', recommendationController.generateRecommendations);
router.patch('/dismiss/:courseId', recommendationController.dismissRecommendation);

module.exports = router;
