/**
 * src/services/assessment.service.js — Assessment Engine & Evaluation Service
 */

const prisma = require('../config/database');
const { scoreToLevel } = require('../utils/competencyLevel');

/**
 * Get all assessments with filters
 */
async function getAllAssessments(filters = {}) {
  const { competencyId, courseId, isActive } = filters;

  const where = {
    ...(competencyId && { competencyId }),
    ...(courseId && { courseId }),
    ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
  };

  return await prisma.assessment.findMany({
    where,
    include: {
      competency: {
        select: { id: true, name: true, category: true, maxLevel: true },
      },
      course: {
        select: { id: true, title: true, difficulty: true },
      },
      _count: {
        select: { questions: true, attempts: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get assessment details for taking the test
 * Note: `isCorrect` on options is NOT exposed to test takers!
 */
async function getAssessmentForTaking(id) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      competency: true,
      course: { select: { id: true, title: true } },
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          text: true,
          order: true,
          marks: true,
          options: {
            select: {
              id: true,
              text: true,
              // isCorrect is EXCLUDED so user cannot cheat
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    const err = new Error('Assessment not found.');
    err.statusCode = 404;
    throw err;
  }

  return assessment;
}

/**
 * Get full assessment details (Admin / Trainer view with answers)
 */
async function getAssessmentById(id) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      competency: true,
      course: true,
      questions: {
        orderBy: { order: 'asc' },
        include: { options: true },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!assessment) {
    const err = new Error('Assessment not found.');
    err.statusCode = 404;
    throw err;
  }

  return assessment;
}

/**
 * Create a new assessment with questions and options (Admin / Trainer)
 */
async function createAssessment(data) {
  const {
    title,
    description,
    competencyId,
    courseId,
    passingScore = 60,
    timeLimitMin,
    questions = [],
  } = data;

  const competency = await prisma.competency.findUnique({ where: { id: competencyId } });
  if (!competency) {
    const err = new Error('Specified competency does not exist.');
    err.statusCode = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({
      data: {
        title,
        description,
        competencyId,
        courseId: courseId || null,
        passingScore: parseInt(passingScore, 10),
        timeLimitMin: timeLimitMin ? parseInt(timeLimitMin, 10) : null,
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = await tx.question.create({
        data: {
          assessmentId: assessment.id,
          text: q.text,
          explanation: q.explanation || null,
          order: q.order || i + 1,
          marks: q.marks || 1,
        },
      });

      if (q.options && q.options.length > 0) {
        await tx.questionOption.createMany({
          data: q.options.map((opt) => ({
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect === true,
          })),
        });
      }
    }

    return await tx.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });
  });
}

/**
 * Submit assessment attempt, calculate score, update competency level
 */
async function submitAssessmentAttempt(userId, assessmentId, submissionData) {
  const {
    answers = [],
    isPreTraining = false,
    isPostTraining = false,
    courseId = null,
  } = submissionData;

  // 1. Fetch the complete assessment with questions & correct options
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      competency: true,
      questions: {
        include: { options: true },
      },
    },
  });

  if (!assessment) {
    const err = new Error('Assessment not found.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Evaluate answers
  let totalMarks = 0;
  let earnedMarks = 0;
  const answerEvaluations = [];

  for (const question of assessment.questions) {
    totalMarks += question.marks;
    const submitted = answers.find((a) => a.questionId === question.id);
    const selectedOptionId = submitted?.selectedOptionId || null;

    // Find the correct option in DB
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const isCorrect = selectedOptionId ? selectedOptionId === correctOption?.id : false;

    if (isCorrect) {
      earnedMarks += question.marks;
    }

    answerEvaluations.push({
      questionId: question.id,
      questionText: question.text,
      explanation: question.explanation,
      selectedOptionId,
      correctOptionId: correctOption?.id || null,
      isCorrect,
      marks: isCorrect ? question.marks : 0,
      maxMarks: question.marks,
    });
  }

  // 3. Compute percentage score
  const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  const isPassed = score >= assessment.passingScore;

  // 4. Convert score to Competency Level using single source of truth (competencyLevel.js)
  const levelInfo = scoreToLevel(score);
  const evaluatedLevel = levelInfo.level;

  // 5. Store Attempt and Answers inside a Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        score,
        competencyLevel: evaluatedLevel,
        isPassed,
        isPreTraining,
        isPostTraining,
        courseId: courseId || assessment.courseId || null,
        completedAt: new Date(),
        answers: {
          create: answerEvaluations.map((a) => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: {
        assessment: {
          include: { competency: true },
        },
      },
    });

    // 6. Update employee's competency level
    const existingComp = await tx.employeeCompetency.findUnique({
      where: {
        userId_competencyId: {
          userId,
          competencyId: assessment.competencyId,
        },
      },
    });

    // Update level if no record exists or new evaluated level is >= previous level
    if (!existingComp || evaluatedLevel >= existingComp.currentLevel) {
      await tx.employeeCompetency.upsert({
        where: {
          userId_competencyId: {
            userId,
            competencyId: assessment.competencyId,
          },
        },
        update: {
          currentLevel: evaluatedLevel,
          assessedAt: new Date(),
        },
        create: {
          userId,
          competencyId: assessment.competencyId,
          currentLevel: evaluatedLevel,
          assessedAt: new Date(),
        },
      });
    }

    return attempt;
  });

  return {
    attemptId: result.id,
    assessmentTitle: assessment.title,
    competencyName: assessment.competency.name,
    score,
    passingScore: assessment.passingScore,
    isPassed,
    competencyLevel: evaluatedLevel,
    levelLabel: levelInfo.label,
    levelDescription: levelInfo.description,
    totalQuestions: assessment.questions.length,
    earnedMarks,
    totalMarks,
    breakdown: answerEvaluations,
    completedAt: result.completedAt,
  };
}

/**
 * Get all attempts made by a specific user
 */
async function getUserAttempts(userId) {
  return await prisma.assessmentAttempt.findMany({
    where: { userId },
    include: {
      assessment: {
        include: {
          competency: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });
}

/**
 * Get ALL attempts across all employees — for Trainer / Admin oversight view.
 * Returns attempt + employee info + assessment info.
 * Does NOT expose individual answer details.
 */
async function getAllAttempts(filters = {}) {
  const { userId, assessmentId } = filters;

  const where = {
    ...(userId && { userId }),
    ...(assessmentId && { assessmentId }),
  };

  return await prisma.assessmentAttempt.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          department: { select: { id: true, name: true } },
        },
      },
      assessment: {
        include: {
          competency: { select: { id: true, name: true, category: true } },
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });
}

module.exports = {
  getAllAssessments,
  getAssessmentById,
  getAssessmentForTaking,
  createAssessment,
  submitAssessmentAttempt,
  getUserAttempts,
  getAllAttempts,
};

