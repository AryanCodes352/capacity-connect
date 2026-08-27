/**
 * src/services/course.service.js — Course Management & LMS Engine
 */

const prisma = require('../config/database');

/**
 * Get courses with search, category, difficulty, and competency filters
 */
async function getAllCourses(query = {}, user = null) {
  const { category, difficulty, competencyId, status, search } = query;

  // By default, non-admins/trainers only see PUBLISHED courses
  const statusFilter = status || (user?.role === 'ADMIN' || user?.role === 'TRAINER' ? undefined : 'PUBLISHED');

  const where = {
    ...(statusFilter && { status: statusFilter }),
    ...(category && { category }),
    ...(difficulty && { difficulty }),
    ...(competencyId && {
      competencies: {
        some: { competencyId },
      },
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return await prisma.course.findMany({
    where,
    include: {
      trainer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      competencies: {
        include: {
          competency: {
            select: { id: true, name: true, category: true, maxLevel: true },
          },
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get single course with curriculum (modules & lessons) and user enrollment status
 */
async function getCourseById(courseId, userId = null) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      trainer: {
        select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
      },
      competencies: {
        include: {
          competency: true,
        },
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!course) {
    const err = new Error('Course not found.');
    err.statusCode = 404;
    throw err;
  }

  // If userId is provided, check enrollment & lesson progress
  let enrollment = null;
  let completedLessonIds = [];

  if (userId) {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    const progressRecords = await prisma.lessonProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: { courseId },
        },
      },
      select: { lessonId: true },
    });

    completedLessonIds = progressRecords.map((p) => p.lessonId);
  }

  return {
    ...course,
    isEnrolled: !!enrollment,
    enrollment,
    completedLessonIds,
  };
}

/**
 * Create a new course with optional target competencies
 */
async function createCourse(data, trainerId) {
  const {
    title,
    description,
    category,
    difficulty = 'Beginner',
    durationHours = 5,
    status = 'PUBLISHED',
    competencies = [],
  } = data;

  return await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        title,
        description,
        category,
        difficulty,
        durationHours: parseInt(durationHours, 10),
        status,
        trainerId,
      },
    });

    if (competencies.length > 0) {
      await tx.courseCompetency.createMany({
        data: competencies.map((c) => ({
          courseId: course.id,
          competencyId: c.competencyId,
          targetLevel: c.targetLevel ? parseInt(c.targetLevel, 10) : null,
        })),
      });
    }

    return await tx.course.findUnique({
      where: { id: course.id },
      include: {
        competencies: {
          include: { competency: true },
        },
      },
    });
  });
}

/**
 * Update course details
 */
async function updateCourse(id, data) {
  await getCourseById(id);

  const { title, description, category, difficulty, durationHours, status, competencies } = data;

  return await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(difficulty && { difficulty }),
        ...(durationHours !== undefined && { durationHours: parseInt(durationHours, 10) }),
        ...(status && { status }),
      },
    });

    if (Array.isArray(competencies)) {
      await tx.courseCompetency.deleteMany({ where: { courseId: id } });
      if (competencies.length > 0) {
        await tx.courseCompetency.createMany({
          data: competencies.map((c) => ({
            courseId: id,
            competencyId: c.competencyId,
            targetLevel: c.targetLevel ? parseInt(c.targetLevel, 10) : null,
          })),
        });
      }
    }

    return await tx.course.findUnique({
      where: { id },
      include: {
        competencies: { include: { competency: true } },
      },
    });
  });
}

/**
 * Delete a course
 */
async function deleteCourse(id) {
  await getCourseById(id);
  return await prisma.course.delete({ where: { id } });
}

/**
 * Add a module to a course
 */
async function createModule(courseId, data) {
  const { title, description, order } = data;
  const count = await prisma.courseModule.count({ where: { courseId } });

  return await prisma.courseModule.create({
    data: {
      courseId,
      title,
      description,
      order: order ? parseInt(order, 10) : count + 1,
    },
  });
}

/**
 * Add a lesson to a module
 */
async function createLesson(moduleId, data) {
  const { title, content, type = 'TEXT', durationMin = 15, order } = data;
  const count = await prisma.lesson.count({ where: { moduleId } });

  return await prisma.lesson.create({
    data: {
      moduleId,
      title,
      content,
      type,
      durationMin: parseInt(durationMin, 10),
      order: order ? parseInt(order, 10) : count + 1,
    },
  });
}

/**
 * Enroll user in a course
 */
async function enrollUser(userId, courseId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    const err = new Error('Course not found.');
    err.statusCode = 404;
    throw err;
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId,
      courseId,
      progressPct: 0,
    },
    include: {
      course: true,
    },
  });

  return enrollment;
}

/**
 * Get all courses the user is enrolled in with progress
 */
async function getUserEnrollments(userId) {
  return await prisma.enrollment.findMany({
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
    orderBy: { enrolledAt: 'desc' },
  });
}

/**
 * Toggle lesson completion and update course progress percentage
 */
async function toggleLessonProgress(userId, lessonId) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        select: { courseId: true },
      },
    },
  });

  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.statusCode = 404;
    throw err;
  }

  const courseId = lesson.module.courseId;

  // Auto-enroll if not yet enrolled
  await enrollUser(userId, courseId);

  // Check current status
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  const nextStatus = existing ? !existing.isCompleted : true;

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      isCompleted: nextStatus,
      completedAt: nextStatus ? new Date() : null,
    },
    create: {
      userId,
      lessonId,
      isCompleted: nextStatus,
      completedAt: nextStatus ? new Date() : null,
    },
  });

  // Calculate new overall progress percentage for this course
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({
      where: {
        module: { courseId },
      },
    }),
    prisma.lessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: { module: { courseId } },
      },
    }),
  ]);

  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isFinished = progressPct === 100;

  const updatedEnrollment = await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progressPct,
      completedAt: isFinished ? new Date() : null,
    },
  });

  return {
    lessonId,
    isCompleted: nextStatus,
    progressPct,
    isCourseCompleted: isFinished,
    enrollment: updatedEnrollment,
  };
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson,
  enrollUser,
  getUserEnrollments,
  toggleLessonProgress,
};
