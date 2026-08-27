/**
 * src/api/notification.api.js — Notification API Client
 */

import axiosInstance from './axios.config';

export const getMyNotificationsApi = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data.data;
};

export const getUnreadCountApi = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data.data;
};

export const markAsReadApi = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await axiosInstance.patch('/notifications/mark-all-read');
  return response.data;
};
