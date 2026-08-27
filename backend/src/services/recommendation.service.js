/**
 * src/services/recommendation.service.js — Rule-Based Course Recommendation Engine
 *
 * Implements intelligent, deterministic learning path recommendation:
 *   1. Identifies the employee's active skill gaps (gap > 0)
 *   2. Sorts gaps by severity priority (Critical -> High -> Medium)
 *   3. Matches courses that develop those competencies to the target level
 *   4. Filters out courses the employee has already completed
 *   5. Ranks recommendations with transparent reasons
 *   6. Persists into the Recommendation database table
 */

const prisma = require('../config/database');
const { getEmployeeGaps } = require('./skillGap.service');

/**
 * Generate, sync, and return personalized course recommendations for a user
 * @param {string} userId
 */
async function generateRecommendationsForUser(userId) {
  // 1. Fetch user's calculated skill gaps
  const gaps = await getEmployeeGaps(userId);
  const activeGaps = gaps.filter((g) => g.gap > 0);

  // 2. Fetch courses the user has already completed (100% progress)
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      progressPct: 100,
    },
    select: { courseId: true },
  });
  const completedCourseIds = new Set(completedEnrollments.map((e) => e.courseId));

  const recommendations = [];
  const addedCourseIds = new Set();
  let currentRank = 1;

  // 3. For each gapped competency, find matching courses
  for (const gap of activeGaps) {
    const matchingCourses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        competencies: {
          some: {
            competencyId: gap.competencyId,
          },
        },
      },
      include: {
        trainer: { select: { firstName: true, lastName: true } },
        competencies: { include: { competency: true } },
        _count: { select: { modules: true } },
      },
    });

    for (const course of matchingCourses) {
      if (completedCourseIds.has(course.id) || addedCourseIds.has(course.id)) {
        continue;
      }

      addedCourseIds.add(course.id);

      const targetComp = course.competencies.find(
        (c) => c.competencyId === gap.competencyId
      );
      const targetLevel = targetComp?.targetLevel || gap.requiredLevel;

      const reason = `Addresses your ${gap.competencyName} gap (Current: Level ${gap.currentLevel} → Target: Level ${targetLevel}).`;

      // Upsert into Recommendation table
      await prisma.recommendation.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        update: {
          rank: currentRank,
          reason,
          competencyId: gap.competencyId,
          isDismissed: false,
        },
        create: {
          userId,
          courseId: course.id,
          rank: currentRank,
          reason,
          competencyId: gap.competencyId,
        },
      });

      recommendations.push({
        courseId: course.id,
        rank: currentRank,
        reason,
        competencyId: gap.competencyId,
        competencyName: gap.competencyName,
        gapSeverity: gap.priority,
        course,
      });

      currentRank++;
    }
  }

  return recommendations;
}

/**
 * Get user recommendations (fetches from DB or generates freshly)
 */
async function getUserRecommendations(userId) {
  const existing = await prisma.recommendation.findMany({
    where: {
      userId,
      isDismissed: false,
    },
    include: {
      course: {
        include: {
          trainer: { select: { firstName: true, lastName: true } },
          competencies: { include: { competency: true } },
          _count: { select: { modules: true } },
        },
      },
      competency: true,
    },
    orderBy: { rank: 'asc' },
  });

  if (existing.length === 0) {
    return await generateRecommendationsForUser(userId);
  }

  return existing.map((rec) => ({
    id: rec.id,
    courseId: rec.courseId,
    rank: rec.rank,
    reason: rec.reason,
    competencyId: rec.competencyId,
    competencyName: rec.competency?.name || 'Target Skill',
    isViewed: rec.isViewed,
    course: rec.course,
  }));
}

/**
 * Dismiss a recommendation
 */
async function dismissRecommendation(userId, courseId) {
  return await prisma.recommendation.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      isDismissed: true,
    },
  });
}

module.exports = {
  generateRecommendationsForUser,
  getUserRecommendations,
  dismissRecommendation,
};
