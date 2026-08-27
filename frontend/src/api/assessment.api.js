/**
 * src/api/assessment.api.js — Assessment API Client
 */

import axiosInstance from './axios.config';

export const getAssessmentsApi = async (params = {}) => {
  const response = await axiosInstance.get('/assessments', { params });
  return response.data.data;
};

export const getAssessmentForTakingApi = async (id) => {
  const response = await axiosInstance.get(`/assessments/${id}/take`);
  return response.data.data;
};

export const getAssessmentByIdApi = async (id) => {
  const response = await axiosInstance.get(`/assessments/${id}`);
  return response.data.data;
};

export const submitAssessmentAttemptApi = async (id, submissionData) => {
  const response = await axiosInstance.post(`/assessments/${id}/submit`, submissionData);
  return response.data.data;
};

export const getMyAttemptsApi = async () => {
  const response = await axiosInstance.get('/assessments/my-attempts');
  return response.data.data;
};

export const createAssessmentApi = async (data) => {
  const response = await axiosInstance.post('/assessments', data);
  return response.data.data;
};
