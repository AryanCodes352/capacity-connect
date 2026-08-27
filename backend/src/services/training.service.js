/**
 * src/services/training.service.js — Training Assignment & Deadline Tracking Service
 */

const prisma = require('../config/database');

/**
 * Assign training to a user (or multiple users)
 */
async function assignTraining(data, assignedBy) {
  const { userId, userIds, departmentId, courseId, deadline, notes } = data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    const err = new Error('Course not found.');
    err.statusCode = 404;
    throw err;
  }

  // Determine target user IDs
  let targetUserIds = [];

  if (userId) {
    targetUserIds.push(userId);
  } else if (Array.isArray(userIds) && userIds.length > 0) {
    targetUserIds = userIds;
  } else if (departmentId) {
    const deptUsers = await prisma.user.findMany({
      where: { departmentId, isActive: true, role: 'EMPLOYEE' },
      select: { id: true },
    });
    targetUserIds = deptUsers.map((u) => u.id);
  }

  if (targetUserIds.length === 0) {
    const err = new Error('No target employees specified for assignment.');
    err.statusCode = 400;
    throw err;
  }

  const createdAssignments = [];

  for (const uId of targetUserIds) {
    // 1. Create or update training assignment
    const assignment = await prisma.trainingAssignment.upsert({
      where: {
        userId_courseId: {
          userId: uId,
          courseId,
        },
      },
      update: {
        assignedBy,
        deadline: deadline ? new Date(deadline) : null,
        notes,
        status: 'ASSIGNED',
      },
      create: {
        userId: uId,
        courseId,
        assignedBy,
        deadline: deadline ? new Date(deadline) : null,
        notes,
        status: 'ASSIGNED',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    // 2. Auto-create notification for the employee
    await prisma.notification.create({
      data: {
        userId: uId,
        type: 'TRAINING_ASSIGNED',
        title: 'New Training Assigned',
        message: `You have been assigned "${course.title}". ${deadline ? `Complete by ${new Date(deadline).toLocaleDateString()}` : ''}`,
        link: `/courses/${course.id}`,
      },
    });

    createdAssignments.push(assignment);
  }

  return {
    totalAssigned: createdAssignments.length,
    assignments: createdAssignments,
  };
}

/**
 * Get all training assignments (Admin view with overdue calculation)
 */
async function getAllAssignments(query = {}) {
  const { status, departmentId, search } = query;
  const now = new Date();

  const where = {
    ...(status && { status }),
    ...(departmentId && { user: { departmentId } }),
    ...(search && {
      OR: [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { course: { title: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const assignments = await prisma.trainingAssignment.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: { select: { id: true, name: true, code: true } },
          orgRole: { select: { name: true } },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          durationHours: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate OVERDUE dynamically if deadline passed and status is not COMPLETED
  return assignments.map((a) => {
    const isPastDeadline = a.deadline && new Date(a.deadline) < now;
    const computedStatus = isPastDeadline && a.status !== 'COMPLETED' ? 'OVERDUE' : a.status;

    return {
      ...a,
      status: computedStatus,
      isOverdue: isPastDeadline && a.status !== 'COMPLETED',
    };
  });
}

/**
 * Get training assignments for a single employee
 */
async function getUserAssignments(userId) {
  const now = new Date();

  const assignments = await prisma.trainingAssignment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          trainer: { select: { firstName: true, lastName: true } },
          competencies: { include: { competency: true } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return assignments.map((a) => {
    const isPastDeadline = a.deadline && new Date(a.deadline) < now;
    const computedStatus = isPastDeadline && a.status !== 'COMPLETED' ? 'OVERDUE' : a.status;

    return {
      ...a,
      status: computedStatus,
      isOverdue: isPastDeadline && a.status !== 'COMPLETED',
    };
  });
}

/**
 * Update status of an assignment
 */
async function updateAssignmentStatus(id, status) {
  return await prisma.trainingAssignment.update({
    where: { id },
    data: { status },
  });
}

module.exports = {
  assignTraining,
  getAllAssignments,
  getUserAssignments,
  updateAssignmentStatus,
};
