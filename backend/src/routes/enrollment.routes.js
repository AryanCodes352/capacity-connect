/**
 * src/routes/enrollment.routes.js — Enrollment & Progress Routes
 */

const express = require('express');
const router = express.Router();

const enrollmentController = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-courses', enrollmentController.getMyEnrollments);
router.post('/enroll', enrollmentController.enrollUser);
router.patch('/lessons/:lessonId/toggle-progress', enrollmentController.toggleLessonProgress);

module.exports = router;
