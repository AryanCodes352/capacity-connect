/**
 * src/api/knowledge.api.js — Knowledge Hub API Client
 */

import axiosInstance from './axios.config';

export const getResourcesApi = async (params = {}) => {
  const response = await axiosInstance.get('/knowledge', { params });
  return response.data.data;
};

export const getResourceByIdApi = async (id) => {
  const response = await axiosInstance.get(`/knowledge/${id}`);
  return response.data.data;
};

export const createResourceApi = async (data) => {
  const response = await axiosInstance.post('/knowledge', data);
  return response.data.data;
};

export const updateResourceApi = async (id, data) => {
  const response = await axiosInstance.put(`/knowledge/${id}`, data);
  return response.data.data;
};

export const deleteResourceApi = async (id) => {
  const response = await axiosInstance.delete(`/knowledge/${id}`);
  return response.data;
};
