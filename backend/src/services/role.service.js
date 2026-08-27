/**
 * src/services/role.service.js — Organizational Role Business Logic
 */

const prisma = require('../config/database');

/**
 * Get all roles with department & mapped competencies
 */
async function getAllRoles(filters = {}) {
  const { departmentId } = filters;

  return await prisma.orgRole.findMany({
    where: {
      ...(departmentId && { departmentId }),
    },
    include: {
      department: {
        select: { id: true, name: true, code: true },
      },
      roleCompetencies: {
        include: {
          competency: {
            select: { id: true, name: true, category: true, maxLevel: true },
          },
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get role by ID with all details
 */
async function getRoleById(id) {
  const role = await prisma.orgRole.findUnique({
    where: { id },
    include: {
      department: true,
      roleCompetencies: {
        include: {
          competency: true,
        },
        orderBy: { requiredLevel: 'desc' },
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!role) {
    const err = new Error('Role not found.');
    err.statusCode = 404;
    throw err;
  }

  return role;
}

/**
 * Create organizational role with optional competency mapping
 */
async function createRole(data) {
  const { name, description, departmentId, competencies = [] } = data;

  const existing = await prisma.orgRole.findUnique({
    where: { name },
  });

  if (existing) {
    const err = new Error(`An organizational role with the name "${name}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  if (departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      const err = new Error('Specified department does not exist.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Use transaction to create role + roleCompetency records
  return await prisma.$transaction(async (tx) => {
    const role = await tx.orgRole.create({
      data: {
        name,
        description,
        departmentId: departmentId || null,
      },
    });

    if (competencies.length > 0) {
      await tx.roleCompetency.createMany({
        data: competencies.map((c) => ({
          orgRoleId: role.id,
          competencyId: c.competencyId,
          requiredLevel: c.requiredLevel || 1,
        })),
      });
    }

    return await tx.orgRole.findUnique({
      where: { id: role.id },
      include: {
        department: true,
        roleCompetencies: {
          include: { competency: true },
        },
      },
    });
  });
}

/**
 * Update organizational role and sync competencies
 */
async function updateRole(id, data) {
  await getRoleById(id);

  const { name, description, departmentId, competencies } = data;

  if (name) {
    const existing = await prisma.orgRole.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (existing) {
      const err = new Error(`Another role with the name "${name}" already exists.`);
      err.statusCode = 409;
      throw err;
    }
  }

  return await prisma.$transaction(async (tx) => {
    await tx.orgRole.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
      },
    });

    // If competencies array was provided, replace existing mappings
    if (Array.isArray(competencies)) {
      await tx.roleCompetency.deleteMany({
        where: { orgRoleId: id },
      });

      if (competencies.length > 0) {
        await tx.roleCompetency.createMany({
          data: competencies.map((c) => ({
            orgRoleId: id,
            competencyId: c.competencyId,
            requiredLevel: c.requiredLevel || 1,
          })),
        });
      }
    }

    return await tx.orgRole.findUnique({
      where: { id },
      include: {
        department: true,
        roleCompetencies: {
          include: { competency: true },
        },
      },
    });
  });
}

/**
 * Delete organizational role
 */
async function deleteRole(id) {
  await getRoleById(id);

  const userCount = await prisma.user.count({ where: { orgRoleId: id } });
  if (userCount > 0) {
    const err = new Error(`Cannot delete role: ${userCount} employees are currently assigned to it.`);
    err.statusCode = 400;
    throw err;
  }

  return await prisma.orgRole.delete({ where: { id } });
}

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
