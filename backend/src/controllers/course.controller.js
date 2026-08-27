/**
 * src/controllers/course.controller.js — Course HTTP Handlers
 */

const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getAllCourses(req.query, req.user);
  return sendSuccess(res, 200, 'Courses retrieved successfully', courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user?.id);
  return sendSuccess(res, 200, 'Course details retrieved', course);
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);
  return sendSuccess(res, 201, 'Course created successfully', course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  return sendSuccess(res, 200, 'Course updated successfully', course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  return sendSuccess(res, 200, 'Course deleted successfully');
});

const createModule = asyncHandler(async (req, res) => {
  const moduleItem = await courseService.createModule(req.params.courseId, req.body);
  return sendSuccess(res, 201, 'Course module added successfully', moduleItem);
});

const createLesson = asyncHandler(async (req, res) => {
  const lesson = await courseService.createLesson(req.params.moduleId, req.body);
  return sendSuccess(res, 201, 'Lesson created successfully', lesson);
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson,
};
