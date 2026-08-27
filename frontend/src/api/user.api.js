/**
 * src/api/user.api.js — User Management API Client
 */

import axiosInstance from './axios.config';

export const getUsersApi = async (params = {}) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data; // contains data array and pagination
};

export const getUserByIdApi = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data.data;
};

export const createUserApi = async (data) => {
  const response = await axiosInstance.post('/users', data);
  return response.data.data;
};

export const updateUserApi = async (id, data) => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data.data;
};

export const toggleUserStatusApi = async (id) => {
  const response = await axiosInstance.patch(`/users/${id}/toggle-status`);
  return response.data.data;
};

export const deleteUserApi = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
