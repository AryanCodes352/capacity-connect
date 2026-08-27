/**
 * src/api/course.api.js — Course & LMS API Client
 */

import axiosInstance from './axios.config';

export const getCoursesApi = async (params = {}) => {
  const response = await axiosInstance.get('/courses', { params });
  return response.data.data;
};

export const getCourseByIdApi = async (id) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data.data;
};

export const createCourseApi = async (data) => {
  const response = await axiosInstance.post('/courses', data);
  return response.data.data;
};

export const updateCourseApi = async (id, data) => {
  const response = await axiosInstance.put(`/courses/${id}`, data);
  return response.data.data;
};

export const deleteCourseApi = async (id) => {
  const response = await axiosInstance.delete(`/courses/${id}`);
  return response.data;
};

export const createModuleApi = async (courseId, data) => {
  const response = await axiosInstance.post(`/courses/${courseId}/modules`, data);
  return response.data.data;
};

export const createLessonApi = async (moduleId, data) => {
  const response = await axiosInstance.post(`/courses/modules/${moduleId}/lessons`, data);
  return response.data.data;
};

export const enrollInCourseApi = async (courseId) => {
  const response = await axiosInstance.post('/enrollments/enroll', { courseId });
  return response.data.data;
};

export const getMyEnrolledCoursesApi = async () => {
  const response = await axiosInstance.get('/enrollments/my-courses');
  return response.data.data;
};

export const toggleLessonProgressApi = async (lessonId) => {
  const response = await axiosInstance.patch(`/enrollments/lessons/${lessonId}/toggle-progress`);
  return response.data.data;
};
