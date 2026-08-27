/**
 * src/services/notification.service.js — In-App Notification Engine
 */

const prisma = require('../config/database');

/**
 * Get all notifications for a specific user
 */
async function getUserNotifications(userId) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

/**
 * Get count of unread notifications for a user
 */
async function getUnreadCount(userId) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
  return { unreadCount: count };
}

/**
 * Mark a single notification as read
 */
async function markAsRead(userId, notificationId) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Create a new notification (used across system events)
 */
async function createNotification(data) {
  const { userId, type, title, message, link } = data;

  return await prisma.notification.create({
    data: {
      userId,
      type: type || 'SYSTEM_ANNOUNCEMENT',
      title,
      message,
      link: link || null,
    },
  });
}

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
};
