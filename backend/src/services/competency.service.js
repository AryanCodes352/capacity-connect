/**
 * src/services/competency.service.js — Competency Management Business Logic
 */

const prisma = require('../config/database');
const { getLevelInfo, calculateGap } = require('../utils/competencyLevel');

/**
 * Get all competencies with optional category filter
 */
async function getAllCompetencies(filters = {}) {
  const { category, search } = filters;

  const where = {
    ...(category && { category }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return await prisma.competency.findMany({
    where,
    include: {
      _count: {
        select: {
          roleCompetencies: true,
          courseCompetencies: true,
          assessments: true,
          employeeCompetencies: true,
        },
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

/**
 * Get list of all distinct competency categories
 */
async function getCompetencyCategories() {
  const distinctCats = await prisma.competency.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return distinctCats.map((c) => c.category).filter(Boolean);
}

/**
 * Get single competency details
 */
async function getCompetencyById(id) {
  const competency = await prisma.competency.findUnique({
    where: { id },
    include: {
      roleCompetencies: {
        include: {
          orgRole: {
            select: { id: true, name: true, department: { select: { name: true } } },
          },
        },
      },
      courseCompetencies: {
        include: {
          course: {
            select: { id: true, title: true, difficulty: true, status: true },
          },
        },
      },
      assessments: {
        select: { id: true, title: true, passingScore: true, timeLimitMin: true, isActive: true },
      },
    },
  });

  if (!competency) {
    const err = new Error('Competency not found.');
    err.statusCode = 404;
    throw err;
  }

  return competency;
}

/**
 * Create a new competency
 */
async function createCompetency(data) {
  const { name, category, description, maxLevel = 4 } = data;

  const existing = await prisma.competency.findUnique({
    where: { name },
  });

  if (existing) {
    const err = new Error(`Competency with name "${name}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  return await prisma.competency.create({
    data: {
      name,
      category: category || 'Technical',
      description,
      maxLevel: parseInt(maxLevel, 10) || 4,
    },
  });
}

/**
 * Update competency
 */
async function updateCompetency(id, data) {
  await getCompetencyById(id);

  const { name, category, description, maxLevel } = data;

  if (name) {
    const existing = await prisma.competency.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (existing) {
      const err = new Error(`Another competency with name "${name}" already exists.`);
      err.statusCode = 409;
      throw err;
    }
  }

  return await prisma.competency.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(maxLevel !== undefined && { maxLevel: parseInt(maxLevel, 10) }),
    },
  });
}

/**
 * Delete competency
 */
async function deleteCompetency(id) {
  await getCompetencyById(id);

  const roleCount = await prisma.roleCompetency.count({ where: { competencyId: id } });
  if (roleCount > 0) {
    const err = new Error(`Cannot delete competency: It is mapped to ${roleCount} organizational roles.`);
    err.statusCode = 400;
    throw err;
  }

  return await prisma.competency.delete({ where: { id } });
}

/**
 * Get employee competencies compared against their assigned role requirements
 */
async function getEmployeeCompetencies(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orgRole: {
        include: {
          roleCompetencies: {
            include: { competency: true },
          },
        },
      },
      employeeCompetencies: {
        include: { competency: true },
      },
    },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const roleCompetencies = user.orgRole?.roleCompetencies || [];
  const currentCompetencies = user.employeeCompetencies || [];

  // Map each competency with current level, required level, level info, and calculated gap
  const competenciesMap = {};

  // First, add all competencies required by their role
  for (const rc of roleCompetencies) {
    competenciesMap[rc.competencyId] = {
      competencyId: rc.competencyId,
      name: rc.competency.name,
      category: rc.competency.category,
      description: rc.competency.description,
      maxLevel: rc.competency.maxLevel,
      requiredLevel: rc.requiredLevel,
      currentLevel: 1, // default until found
      assessedAt: null,
      isRoleRequired: true,
    };
  }

  // Then, blend in their assessed/current levels
  for (const ec of currentCompetencies) {
    if (competenciesMap[ec.competencyId]) {
      competenciesMap[ec.competencyId].currentLevel = ec.currentLevel;
      competenciesMap[ec.competencyId].assessedAt = ec.assessedAt;
    } else {
      competenciesMap[ec.competencyId] = {
        competencyId: ec.competencyId,
        name: ec.competency.name,
        category: ec.competency.category,
        description: ec.competency.description,
        maxLevel: ec.competency.maxLevel,
        requiredLevel: null,
        currentLevel: ec.currentLevel,
        assessedAt: ec.assessedAt,
        isRoleRequired: false,
      };
    }
  }

  // Enrich with gap calculations & level metadata
  const results = Object.values(competenciesMap).map((item) => {
    const levelInfo = getLevelInfo(item.currentLevel);
    let gapInfo = null;

    if (item.requiredLevel !== null) {
      const { gap, priority } = calculateGap(item.requiredLevel, item.currentLevel);
      gapInfo = { gap, priority };
    }

    return {
      ...item,
      levelLabel: levelInfo.label,
      levelDescription: levelInfo.description,
      gapInfo,
    };
  });

  return {
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle,
      orgRole: user.orgRole?.name || 'Unassigned',
    },
    competencies: results,
  };
}

/**
 * Update employee competency level directly (Admin/Assessment update)
 */
async function updateEmployeeCompetency(userId, competencyId, currentLevel) {
  const comp = await prisma.competency.findUnique({ where: { id: competencyId } });
  if (!comp) {
    const err = new Error('Competency does not exist.');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.employeeCompetency.upsert({
    where: {
      userId_competencyId: {
        userId,
        competencyId,
      },
    },
    update: {
      currentLevel: parseInt(currentLevel, 10),
      assessedAt: new Date(),
    },
    create: {
      userId,
      competencyId,
      currentLevel: parseInt(currentLevel, 10),
      assessedAt: new Date(),
    },
    include: {
      competency: true,
    },
  });

  return updated;
}

module.exports = {
  getAllCompetencies,
  getCompetencyCategories,
  getCompetencyById,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  getEmployeeCompetencies,
  updateEmployeeCompetency,
};
