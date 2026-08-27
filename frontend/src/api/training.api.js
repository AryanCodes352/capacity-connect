/**
 * src/api/training.api.js — Training Assignment API Client
 */

import axiosInstance from './axios.config';

export const getAllTrainingAssignmentsApi = async (params = {}) => {
  const response = await axiosInstance.get('/training', { params });
  return response.data.data;
};

export const getMyTrainingAssignmentsApi = async () => {
  const response = await axiosInstance.get('/training/my-assignments');
  return response.data.data;
};

export const assignTrainingApi = async (data) => {
  const response = await axiosInstance.post('/training/assign', data);
  return response.data.data;
};

export const updateAssignmentStatusApi = async (id, status) => {
  const response = await axiosInstance.patch(`/training/${id}/status`, { status });
  return response.data.data;
};
