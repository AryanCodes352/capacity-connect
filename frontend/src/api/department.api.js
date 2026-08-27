/**
 * src/api/department.api.js — Department API Client
 */

import axiosInstance from './axios.config';

export const getDepartmentsApi = async () => {
  const response = await axiosInstance.get('/departments');
  return response.data.data;
};

export const getDepartmentByIdApi = async (id) => {
  const response = await axiosInstance.get(`/departments/${id}`);
  return response.data.data;
};

export const createDepartmentApi = async (data) => {
  const response = await axiosInstance.post('/departments', data);
  return response.data.data;
};

export const updateDepartmentApi = async (id, data) => {
  const response = await axiosInstance.put(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartmentApi = async (id) => {
  const response = await axiosInstance.delete(`/departments/${id}`);
  return response.data;
};
