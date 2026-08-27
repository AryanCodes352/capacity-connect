/**
 * src/api/role.api.js — Organizational Role API Client
 */

import axiosInstance from './axios.config';

export const getRolesApi = async (params = {}) => {
  const response = await axiosInstance.get('/roles', { params });
  return response.data.data;
};

export const getRoleByIdApi = async (id) => {
  const response = await axiosInstance.get(`/roles/${id}`);
  return response.data.data;
};

export const createRoleApi = async (data) => {
  const response = await axiosInstance.post('/roles', data);
  return response.data.data;
};

export const updateRoleApi = async (id, data) => {
  const response = await axiosInstance.put(`/roles/${id}`, data);
  return response.data.data;
};

export const deleteRoleApi = async (id) => {
  const response = await axiosInstance.delete(`/roles/${id}`);
  return response.data;
};
