/**
 * src/services/department.service.js — Department Business Logic
 */

const prisma = require('../config/database');

/**
 * Get all departments with user count and role count
 */
async function getAllDepartments() {
  return await prisma.department.findMany({
    include: {
      _count: {
        select: {
          users: true,
          orgRoles: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get single department by ID
 */
async function getDepartmentById(id) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      orgRoles: {
        include: {
          _count: { select: { users: true } },
        },
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          jobTitle: true,
          isActive: true,
        },
      },
    },
  });

  if (!department) {
    const err = new Error('Department not found.');
    err.statusCode = 404;
    throw err;
  }

  return department;
}

/**
 * Create a new department
 */
async function createDepartment(data) {
  const { name, description, code } = data;

  const existing = await prisma.department.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        ...(code ? [{ code: { equals: code, mode: 'insensitive' } }] : []),
      ],
    },
  });

  if (existing) {
    const err = new Error('A department with this name or code already exists.');
    err.statusCode = 409;
    throw err;
  }

  return await prisma.department.create({
    data: {
      name,
      description,
      code,
    },
  });
}

/**
 * Update an existing department
 */
async function updateDepartment(id, data) {
  await getDepartmentById(id); // Ensure exists

  const { name, description, code } = data;

  if (name || code) {
    const existing = await prisma.department.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(name ? [{ name: { equals: name, mode: 'insensitive' } }] : []),
          ...(code ? [{ code: { equals: code, mode: 'insensitive' } }] : []),
        ],
      },
    });

    if (existing) {
      const err = new Error('Another department with this name or code already exists.');
      err.statusCode = 409;
      throw err;
    }
  }

  return await prisma.department.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(code !== undefined && { code }),
    },
  });
}

/**
 * Delete a department
 */
async function deleteDepartment(id) {
  await getDepartmentById(id);

  // Check if department has users
  const userCount = await prisma.user.count({ where: { departmentId: id } });
  if (userCount > 0) {
    const err = new Error(`Cannot delete department: ${userCount} users are currently assigned to it.`);
    err.statusCode = 400;
    throw err;
  }

  return await prisma.department.delete({ where: { id } });
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
