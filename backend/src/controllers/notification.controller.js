/**
 * src/controllers/notification.controller.js — Notification HTTP Handlers
 */

const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  return sendSuccess(res, 200, 'Notifications retrieved', notifications);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  return sendSuccess(res, 200, 'Unread notification count', count);
});

const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user.id, req.params.id);
  return sendSuccess(res, 200, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, 200, 'All notifications marked as read');
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
