/**
 * src/api/ai.api.js — AI Assistant API Client
 */

import axiosInstance from './axios.config';

export const chatWithAIApi = async (prompt) => {
  const response = await axiosInstance.post('/ai/chat', { prompt });
  return response.data.data;
};
