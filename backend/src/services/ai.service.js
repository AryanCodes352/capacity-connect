/**
 * src/services/ai.service.js — AI Capacity Building Assistant Service
 *
 * Provides intelligent, context-aware capacity building assistance:
 *  - Analyzes employee's active skill gaps & role requirements
 *  - Recommends personalized training interventions
 *  - Explains complex competencies and organizational SOPs
 *  - Operates deterministically with rich knowledge reasoning, with optional LLM API fallback
 */

const prisma = require('../config/database');
const { getEmployeeGaps } = require('./skillGap.service');
const { getUserRecommendations } = require('./recommendation.service');

/**
 * Handle user query with contextual capacity building intelligence
 * @param {string} userId
 * @param {string} prompt
 */
async function generateCapacityResponse(userId, prompt) {
  const [user, gaps, recommendations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        orgRole: {
          include: {
            roleCompetencies: { include: { competency: true } },
          },
        },
      },
    }),
    getEmployeeGaps(userId),
    getUserRecommendations(userId),
  ]);

  const cleanPrompt = (prompt || '').toLowerCase().trim();
  const userName = user?.firstName || 'Learner';
  const roleName = user?.orgRole?.name || 'Software Developer';
  const activeGaps = gaps.filter((g) => g.gap > 0);

  // 1. Skill Gap inquiries
  if (
    cleanPrompt.includes('gap') ||
    cleanPrompt.includes('skill') ||
    cleanPrompt.includes('missing') ||
    cleanPrompt.includes('level')
  ) {
    if (activeGaps.length === 0) {
      return {
        reply: `Hello ${userName}! 🎉 Excellent news: You currently have **0 identified skill gaps** for your role as **${roleName}**. All your evaluated competencies meet or exceed your role baseline requirements. Keep exploring new courses to stay ahead!`,
        context: { role: roleName, activeGapsCount: 0 },
      };
    }

    const gapList = activeGaps
      .map(
        (g) =>
          `• **${g.competencyName}**: Currently at **Level ${g.currentLevel}**, Required **Level ${g.requiredLevel}** (Gap: -${g.gap} · ${g.priorityLabel} Priority)`
      )
      .join('\n');

    return {
      reply: `Hello ${userName}! Here is the current analysis of your competency profile for **${roleName}**:\n\n${gapList}\n\n💡 **Recommended Action:** I suggest prioritizing **${activeGaps[0].competencyName}** first, as it has the highest severity gap. Check out your personalized recommendations tab to enroll in relevant training programs.`,
      context: { role: roleName, gaps: activeGaps },
    };
  }

  // 2. Course & Recommendation inquiries
  if (
    cleanPrompt.includes('recommend') ||
    cleanPrompt.includes('course') ||
    cleanPrompt.includes('learn') ||
    cleanPrompt.includes('training')
  ) {
    if (recommendations.length === 0) {
      return {
        reply: `Hello ${userName}! You're in great shape. You have met all mandatory proficiency targets for your role. You can explore the full course catalog anytime under the **Explore Courses** menu.`,
        context: { recommendationsCount: 0 },
      };
    }

    const recList = recommendations
      .slice(0, 3)
      .map(
        (r, idx) =>
          `**${idx + 1}. ${r.course?.title}** (${r.course?.difficulty})\n   - *Why:* ${r.reason}`
      )
      .join('\n\n');

    return {
      reply: `Based on your evaluated competency levels, here are your top recommended learning pathways:\n\n${recList}\n\n🚀 You can click on any course in your **Recommendations** tab to enroll with 1 click!`,
      context: { topRecommendations: recommendations.slice(0, 3) },
    };
  }

  // 3. Assessment & Level Evaluation inquiries
  if (
    cleanPrompt.includes('assessment') ||
    cleanPrompt.includes('test') ||
    cleanPrompt.includes('quiz') ||
    cleanPrompt.includes('score')
  ) {
    return {
      reply: `Assessments in **CAPACITY CONNECT** directly evaluate your proficiency level on a 4-tier scale:\n\n• **Level 1 (Beginner):** 0–39%\n• **Level 2 (Elementary):** 40–59%\n• **Level 3 (Intermediate):** 60–79%\n• **Level 4 (Advanced):** 80–100%\n\nWhen you complete a training course, taking the **post-training assessment** automatically updates your competency profile and closes your skill gaps!`,
      context: { scale: '4-Tier Competency Model' },
    };
  }

  // Default contextual mentor reply
  return {
    reply: `Hello ${userName}! I am your **Capacity Building AI Assistant**. I can help you with:\n\n1. **Analyzing your skill gaps** against your role as *${roleName}*\n2. **Finding the best courses** to upgrade your competency levels\n3. **Preparing for assessments** to prove capability growth\n4. **Navigating organizational SOPs and Best Practices** in the Knowledge Hub\n\nHow can I help you accelerate your capacity building today?`,
    context: { role: roleName },
  };
}

module.exports = {
  generateCapacityResponse,
};
