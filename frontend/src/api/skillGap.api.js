/**
 * src/api/skillGap.api.js — Skill Gap API Client
 */

import axiosInstance from './axios.config';

export const getMySkillGapsApi = async () => {
  const response = await axiosInstance.get('/skill-gaps/my-gaps');
  return response.data.data;
};

export const getEmployeeSkillGapsApi = async (userId) => {
  const response = await axiosInstance.get(`/skill-gaps/employee/${userId}`);
  return response.data.data;
};

export const getOrgGapStatisticsApi = async () => {
  const response = await axiosInstance.get('/skill-gaps/organization-summary');
  return response.data.data;
};

export const getDepartmentGapBreakdownApi = async () => {
  const response = await axiosInstance.get('/skill-gaps/department-breakdown');
  return response.data.data;
};

export const recalculateAllGapsApi = async () => {
  const response = await axiosInstance.post('/skill-gaps/recalculate');
  return response.data.data;
};
