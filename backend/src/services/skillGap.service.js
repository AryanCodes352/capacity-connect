/**
 * src/services/skillGap.service.js — Dedicated Skill Gap Analysis Engine
 *
 * This service implements the core capacity-building logic:
 *   1. Get employee assigned organizational role
 *   2. Get required role competencies and target levels
 *   3. Get employee's evaluated current competency levels
 *   4. Compare Required vs. Current levels: Gap = max(0, Required - Current)
 *   5. Assign priority (NONE, MEDIUM, HIGH, CRITICAL)
 *   6. Persist results in the SkillGap table for fast querying & analytics
 *   7. Provide reusable aggregation methods for analytics & heatmaps
 */

const prisma = require('../config/database');
const { calculateGap, getLevelInfo } = require('../utils/competencyLevel');

/**
 * Calculate, persist, and return skill gaps for a specific employee
 * @param {string} userId
 * @returns {Promise<Array>} Array of calculated skill gap objects
 */
async function calculateAndSyncEmployeeGaps(userId) {
  // 1. Fetch user with assigned OrgRole (and its required competencies) and current evaluated competencies
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

  // If user has no assigned role, they have no formal requirements
  const roleCompetencies = user.orgRole?.roleCompetencies || [];
  const currentCompetencies = user.employeeCompetencies || [];

  const currentLevelMap = new Map();
  for (const ec of currentCompetencies) {
    currentLevelMap.set(ec.competencyId, ec.currentLevel);
  }

  const results = [];

  // Calculate gaps for all competencies required by the employee's role
  for (const rc of roleCompetencies) {
    const compId = rc.competencyId;
    const requiredLevel = rc.requiredLevel;
    const currentLevel = currentLevelMap.get(compId) || 1; // Default to Level 1 (Beginner) if unassessed

    const { gap, priority } = calculateGap(requiredLevel, currentLevel);

    // Upsert into SkillGap database table
    const skillGapRecord = await prisma.skillGap.upsert({
      where: {
        userId_competencyId: {
          userId,
          competencyId: compId,
        },
      },
      update: {
        requiredLevel,
        currentLevel,
        gap,
        priority: priority.severity,
        calculatedAt: new Date(),
      },
      create: {
        userId,
        competencyId: compId,
        requiredLevel,
        currentLevel,
        gap,
        priority: priority.severity,
        calculatedAt: new Date(),
      },
      include: {
        competency: true,
      },
    });

    results.push({
      id: skillGapRecord.id,
      competencyId: compId,
      competencyName: rc.competency.name,
      category: rc.competency.category,
      description: rc.competency.description,
      requiredLevel,
      currentLevel,
      gap,
      priority: priority.severity,
      priorityLabel: priority.label,
      priorityColor: priority.color,
      textColor: priority.textColor,
      bgColor: priority.bgColor,
      currentLevelInfo: getLevelInfo(currentLevel),
      requiredLevelInfo: getLevelInfo(requiredLevel),
      calculatedAt: skillGapRecord.calculatedAt,
    });
  }

  // Sort by gap severity descending (Critical/High gaps first)
  results.sort((a, b) => b.gap - a.gap);

  return results;
}

/**
 * Get skill gaps for an employee (from database, syncs if empty)
 * @param {string} userId
 */
async function getEmployeeGaps(userId) {
  const existingGaps = await prisma.skillGap.findMany({
    where: { userId },
    include: { competency: true },
    orderBy: { gap: 'desc' },
  });

  // If no gaps recorded yet, calculate and persist them
  if (existingGaps.length === 0) {
    return await calculateAndSyncEmployeeGaps(userId);
  }

  // Format with helper metadata
  return existingGaps.map((sg) => {
    const { priority } = calculateGap(sg.requiredLevel, sg.currentLevel);
    return {
      id: sg.id,
      competencyId: sg.competencyId,
      competencyName: sg.competency.name,
      category: sg.competency.category,
      description: sg.competency.description,
      requiredLevel: sg.requiredLevel,
      currentLevel: sg.currentLevel,
      gap: sg.gap,
      priority: sg.priority,
      priorityLabel: priority.label,
      priorityColor: priority.color,
      textColor: priority.textColor,
      bgColor: priority.bgColor,
      currentLevelInfo: getLevelInfo(sg.currentLevel),
      requiredLevelInfo: getLevelInfo(sg.requiredLevel),
      calculatedAt: sg.calculatedAt,
    };
  });
}

/**
 * Recalculate skill gaps across all active employees in the organization
 */
async function recalculateAllOrganizationGaps() {
  const employees = await prisma.user.findMany({
    where: { isActive: true, role: 'EMPLOYEE' },
    select: { id: true },
  });

  let totalUpdated = 0;
  for (const emp of employees) {
    await calculateAndSyncEmployeeGaps(emp.id);
    totalUpdated++;
  }

  return { totalUpdated };
}

/**
 * Get high-level organization skill gap statistics
 */
async function getOrganizationGapStatistics() {
  const [totalEmployees, allGaps, competencies] = await Promise.all([
    prisma.user.count({ where: { role: 'EMPLOYEE', isActive: true } }),
    prisma.skillGap.findMany({
      include: {
        competency: true,
        user: { select: { id: true, departmentId: true, department: { select: { name: true } } } },
      },
    }),
    prisma.competency.count(),
  ]);

  let totalGapsCount = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let zeroGapCount = 0;

  const competencyGapMap = {};

  for (const g of allGaps) {
    if (g.gap > 0) {
      totalGapsCount++;
      if (g.priority === 'CRITICAL') criticalCount++;
      else if (g.priority === 'HIGH') highCount++;
      else if (g.priority === 'MEDIUM') mediumCount++;

      // Aggregate by competency
      const cName = g.competency.name;
      if (!competencyGapMap[cName]) {
        competencyGapMap[cName] = { name: cName, category: g.competency.category, totalGapScore: 0, employeeCount: 0 };
      }
      competencyGapMap[cName].totalGapScore += g.gap;
      competencyGapMap[cName].employeeCount += 1;
    } else {
      zeroGapCount++;
    }
  }

  // Top critical competencies needing training
  const topGappedCompetencies = Object.values(competencyGapMap)
    .sort((a, b) => b.totalGapScore - a.totalGapScore)
    .slice(0, 5);

  return {
    totalEmployees,
    totalCompetencies: competencies,
    totalGapsIdentified: totalGapsCount,
    criticalGaps: criticalCount,
    highGaps: highCount,
    mediumGaps: mediumCount,
    targetMetCount: zeroGapCount,
    topGappedCompetencies,
  };
}

/**
 * Get department-wise skill gap matrix for heatmaps and analytics
 */
async function getDepartmentGapBreakdown() {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        where: { isActive: true },
        include: {
          skillGaps: {
            include: { competency: true },
          },
        },
      },
    },
  });

  return departments.map((dept) => {
    let totalEmployees = dept.users.length;
    let deptGapCount = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let totalGapSum = 0;

    const compGaps = {};

    for (const user of dept.users) {
      for (const sg of user.skillGaps) {
        if (sg.gap > 0) {
          deptGapCount++;
          totalGapSum += sg.gap;
          if (sg.priority === 'CRITICAL') criticalCount++;
          if (sg.priority === 'HIGH') highCount++;
          if (sg.priority === 'MEDIUM') mediumCount++;
        }

        const compName = sg.competency.name;
        if (!compGaps[compName]) {
          compGaps[compName] = { totalGap: 0, count: 0 };
        }
        compGaps[compName].totalGap += sg.gap;
        compGaps[compName].count += 1;
      }
    }

    const avgGapScore = deptGapCount > 0 ? Number((totalGapSum / (totalEmployees || 1)).toFixed(1)) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      code: dept.code,
      totalEmployees,
      totalGaps: deptGapCount,
      criticalGaps: criticalCount,
      highGaps: highCount,
      mediumGaps: mediumCount,
      averageGapScore: avgGapScore,
      competencyAverages: Object.entries(compGaps).map(([name, data]) => ({
        competency: name,
        averageGap: Number((data.totalGap / (data.count || 1)).toFixed(1)),
      })),
    };
  });
}

module.exports = {
  calculateAndSyncEmployeeGaps,
  getEmployeeGaps,
  recalculateAllOrganizationGaps,
  getOrganizationGapStatistics,
  getDepartmentGapBreakdown,
};
