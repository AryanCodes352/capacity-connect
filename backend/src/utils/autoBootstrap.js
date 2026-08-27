/**
 * src/utils/autoBootstrap.js — Automatic Self-Healing & Cloud Seeder
 *
 * Ensures demo users & core taxonomy exist automatically on any new deployment (Vercel, Render, Neon, etc.)
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

async function autoBootstrap() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return; // Already bootstrapped
    }

    console.log('⚡ Empty database detected! Auto-bootstrapping demo data...');

    // 1. Create Departments
    const itDept = await prisma.department.upsert({
      where: { code: 'IT' },
      update: {},
      create: { name: 'Engineering & IT', code: 'IT', description: 'Software engineering & IT infrastructure' },
    });

    const dataDept = await prisma.department.upsert({
      where: { code: 'DATA' },
      update: {},
      create: { name: 'Data & Analytics', code: 'DATA', description: 'Data science & analytics' },
    });

    // 2. Create Roles
    const devRole = await prisma.orgRole.create({
      data: { name: 'Software Developer', departmentId: itDept.id, level: 'Junior' },
    });

    const leadRole = await prisma.orgRole.create({
      data: { name: 'Lead Architect', departmentId: itDept.id, level: 'Senior' },
    });

    // 3. Create Competencies
    const sqlComp = await prisma.competency.create({
      data: {
        name: 'SQL Database Optimization',
        category: 'Database',
        description: 'Relational query design, indexing, and tuning',
        level1Desc: 'Basic SELECT queries',
        level2Desc: 'Joins and aggregate queries',
        level3Desc: 'Subqueries and indexing',
        level4Desc: 'Query execution plans and optimization',
      },
    });

    const jsComp = await prisma.competency.create({
      data: {
        name: 'JavaScript & React',
        category: 'Frontend',
        description: 'Modern ES6+ JavaScript and component architecture',
        level1Desc: 'Basic syntax',
        level2Desc: 'DOM manipulation',
        level3Desc: 'State management and hooks',
        level4Desc: 'Full stack optimization',
      },
    });

    // Role Competencies
    await prisma.roleCompetency.createMany({
      data: [
        { roleId: devRole.id, competencyId: sqlComp.id, requiredLevel: 4 },
        { roleId: devRole.id, competencyId: jsComp.id, requiredLevel: 4 },
      ],
    });

    // 4. Hash Passwords
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const employeePass = await bcrypt.hash('Employee@123', 10);
    const trainerPass = await bcrypt.hash('Trainer@123', 10);

    // 5. Create Demo Users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@technova.com',
        password: adminPass,
        firstName: 'Aditya',
        lastName: 'Raj',
        role: 'ADMIN',
        jobTitle: 'HR & Learning Manager',
        departmentId: itDept.id,
        isActive: true,
      },
    });

    const trainer = await prisma.user.create({
      data: {
        email: 'priya.trainer@technova.com',
        password: trainerPass,
        firstName: 'Priya',
        lastName: 'Sharma',
        role: 'TRAINER',
        jobTitle: 'Lead Technical Trainer',
        departmentId: itDept.id,
        isActive: true,
      },
    });

    const rahul = await prisma.user.create({
      data: {
        email: 'rahul@technova.com',
        password: employeePass,
        firstName: 'Rahul',
        lastName: 'Sharma',
        role: 'EMPLOYEE',
        jobTitle: 'Junior Software Engineer',
        departmentId: itDept.id,
        orgRoleId: devRole.id,
        isActive: true,
      },
    });

    // Set Rahul's initial Level 2 in SQL (creating a -2 gap vs Level 4)
    await prisma.skillGap.create({
      data: {
        userId: rahul.id,
        competencyId: sqlComp.id,
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        priority: 'HIGH',
      },
    });

    // 6. Create Course
    const course = await prisma.course.create({
      data: {
        title: 'SQL Fundamentals & Advanced Query Design',
        description: 'Comprehensive SQL course designed for database performance optimization',
        category: 'Database',
        difficulty: 'Beginner',
        durationHours: 6,
        status: 'PUBLISHED',
        trainerId: trainer.id,
        competencies: {
          create: [{ competencyId: sqlComp.id, targetLevel: 4 }],
        },
        modules: {
          create: [
            {
              title: 'Module 1: Relational Query Foundations',
              orderIndex: 1,
              lessons: {
                create: [
                  { title: 'Relational Database Architecture', type: 'TEXT', durationMin: 15, content: 'Overview of relational models, tables, indexes, and B-trees.' },
                  { title: 'Complex JOINs & Execution Plans', type: 'VIDEO', durationMin: 25, content: 'https://technova.internal/video/sql-joins' },
                ],
              },
            },
          ],
        },
      },
    });

    // 7. Create Assessment
    const assessment = await prisma.assessment.create({
      data: {
        title: 'SQL Database Optimization Assessment',
        description: 'Evaluates proficiency in SQL joins, indexing, and relational performance',
        durationMin: 20,
        passingScore: 60,
        competencyId: sqlComp.id,
        courseId: course.id,
        isPreTraining: true,
        questions: {
          create: [
            {
              text: 'Which SQL clause is used to filter records after grouping with GROUP BY?',
              type: 'MCQ',
              options: {
                create: [
                  { text: 'WHERE', isCorrect: false, orderIndex: 1 },
                  { text: 'HAVING', isCorrect: true, orderIndex: 2 },
                  { text: 'ORDER BY', isCorrect: false, orderIndex: 3 },
                  { text: 'FILTER', isCorrect: false, orderIndex: 4 },
                ],
              },
            },
            {
              text: 'What type of index organizes data physically on disk to match the index order?',
              type: 'MCQ',
              options: {
                create: [
                  { text: 'Non-Clustered Index', isCorrect: false, orderIndex: 1 },
                  { text: 'Clustered Index', isCorrect: true, orderIndex: 2 },
                  { text: 'Bitmap Index', isCorrect: false, orderIndex: 3 },
                  { text: 'Hash Index', isCorrect: false, orderIndex: 4 },
                ],
              },
            },
          ],
        },
      },
    });

    console.log('✅ Auto-bootstrapping completed successfully!');
  } catch (err) {
    console.error('Auto-bootstrapping notice:', err.message);
  }
}

module.exports = { autoBootstrap };
