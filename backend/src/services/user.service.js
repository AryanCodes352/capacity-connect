/**
 * src/services/user.service.js — User Management Business Logic
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const USER_SELECT_FULL = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatar: true,
  jobTitle: true,
  phone: true,
  isActive: true,
  departmentId: true,
  orgRoleId: true,
  department: {
    select: { id: true, name: true, code: true },
  },
  orgRole: {
    select: { id: true, name: true },
  },
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      enrollments: true,
      assessmentAttempts: true,
      trainingAssignments: true,
      skillGaps: true,
    },
  },
};

/**
 * Get users with filtering, search, and pagination
 */
async function getAllUsers(query = {}) {
  const {
    role,
    departmentId,
    orgRoleId,
    isActive,
    search,
    page = 1,
    limit = 20,
  } = query;

  const take = parseInt(limit, 10) || 20;
  const skip = (parseInt(page, 10) - 1) * take;

  const where = {
    ...(role && { role }),
    ...(departmentId && { departmentId }),
    ...(orgRoleId && { orgRoleId }),
    ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT_FULL,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * Get user by ID with competencies, gaps, and enrollments
 */
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...USER_SELECT_FULL,
      employeeCompetencies: {
        include: {
          competency: true,
        },
        orderBy: { currentLevel: 'desc' },
      },
      skillGaps: {
        include: {
          competency: true,
        },
        orderBy: { gap: 'desc' },
      },
      trainingAssignments: {
        include: {
          course: {
            select: { id: true, title: true, difficulty: true, durationHours: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

/**
 * Create a new user (Admin functionality)
 */
async function createUser(data) {
  const {
    email,
    password,
    firstName,
    lastName,
    role = 'EMPLOYEE',
    departmentId,
    orgRoleId,
    jobTitle,
    phone,
  } = data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    const err = new Error(`User with email "${email}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      departmentId: departmentId || null,
      orgRoleId: orgRoleId || null,
      jobTitle: jobTitle?.trim() || null,
      phone: phone?.trim() || null,
    },
    select: USER_SELECT_FULL,
  });
}

/**
 * Update user details
 */
async function updateUser(id, data) {
  await getUserById(id);

  const {
    firstName,
    lastName,
    role,
    departmentId,
    orgRoleId,
    jobTitle,
    phone,
    isActive,
  } = data;

  return await prisma.user.update({
    where: { id },
    data: {
      ...(firstName && { firstName: firstName.trim() }),
      ...(lastName && { lastName: lastName.trim() }),
      ...(role && { role }),
      ...(departmentId !== undefined && { departmentId: departmentId || null }),
      ...(orgRoleId !== undefined && { orgRoleId: orgRoleId || null }),
      ...(jobTitle !== undefined && { jobTitle: jobTitle?.trim() || null }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
    select: USER_SELECT_FULL,
  });
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(id) {
  const user = await getUserById(id);

  return await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: USER_SELECT_FULL,
  });
}

/**
 * Delete a user
 */
async function deleteUser(id) {
  await getUserById(id);
  return await prisma.user.delete({ where: { id } });
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
