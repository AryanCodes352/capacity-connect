/**
 * src/api/analytics.api.js — Training Effectiveness & Heatmap API Client
 */

import axiosInstance from './axios.config';

export const getDashboardMetricsApi = async () => {
  const response = await axiosInstance.get('/analytics/dashboard-metrics');
  return response.data.data;
};

export const getTrainingEffectivenessApi = async () => {
  const response = await axiosInstance.get('/analytics/effectiveness');
  return response.data.data;
};

export const getCourseRoiRankingsApi = async () => {
  const response = await axiosInstance.get('/analytics/courses-roi');
  return response.data.data;
};

export const getDepartmentHeatmapApi = async () => {
  const response = await axiosInstance.get('/analytics/department-heatmap');
  return response.data.data;
};
