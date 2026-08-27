/**
 * src/controllers/enrollment.controller.js — Enrollment & Progress HTTP Handlers
 */

const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const enrollUser = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const enrollment = await courseService.enrollUser(req.user.id, courseId);
  return sendSuccess(res, 201, 'Enrolled in course successfully', enrollment);
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await courseService.getUserEnrollments(req.user.id);
  return sendSuccess(res, 200, 'User enrollments retrieved', enrollments);
});

const toggleLessonProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const result = await courseService.toggleLessonProgress(req.user.id, lessonId);
  return sendSuccess(res, 200, 'Lesson progress updated', result);
});

module.exports = {
  enrollUser,
  getMyEnrollments,
  toggleLessonProgress,
};
