/**
 * src/api/recommendation.api.js — Recommendation API Client
 */

import axiosInstance from './axios.config';

export const getMyRecommendationsApi = async () => {
  const response = await axiosInstance.get('/recommendations');
  return response.data.data;
};

export const refreshRecommendationsApi = async () => {
  const response = await axiosInstance.post('/recommendations/refresh');
  return response.data.data;
};

export const dismissRecommendationApi = async (courseId) => {
  const response = await axiosInstance.patch(`/recommendations/dismiss/${courseId}`);
  return response.data;
};
