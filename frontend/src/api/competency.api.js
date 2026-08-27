/**
 * src/api/competency.api.js — Competency API Client
 */

import axiosInstance from './axios.config';

export const getCompetenciesApi = async (params = {}) => {
  const response = await axiosInstance.get('/competencies', { params });
  return response.data.data;
};

export const getCompetencyCategoriesApi = async () => {
  const response = await axiosInstance.get('/competencies/categories');
  return response.data.data;
};

export const getCompetencyByIdApi = async (id) => {
  const response = await axiosInstance.get(`/competencies/${id}`);
  return response.data.data;
};

export const createCompetencyApi = async (data) => {
  const response = await axiosInstance.post('/competencies', data);
  return response.data.data;
};

export const updateCompetencyApi = async (id, data) => {
  const response = await axiosInstance.put(`/competencies/${id}`, data);
  return response.data.data;
};

export const deleteCompetencyApi = async (id) => {
  const response = await axiosInstance.delete(`/competencies/${id}`);
  return response.data;
};

export const getMyCompetenciesApi = async () => {
  const response = await axiosInstance.get('/competencies/my-competencies');
  return response.data.data;
};

export const getEmployeeCompetenciesApi = async (userId) => {
  const response = await axiosInstance.get(`/competencies/employee/${userId}`);
  return response.data.data;
};

export const updateEmployeeCompetencyApi = async (userId, competencyId, currentLevel) => {
  const response = await axiosInstance.put(`/competencies/employee/${userId}`, {
    competencyId,
    currentLevel,
  });
  return response.data.data;
};
