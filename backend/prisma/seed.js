/**
 * prisma/seed.js — CAPACITY CONNECT Demo Data Seeder
 *
 * Organization: TechNova Solutions
 *
 * Seeds:
 *  1. Departments (IT, HR, Finance, Operations)
 *  2. Competencies (Technical + Soft Skills + Leadership)
 *  3. Organizational Roles with competency requirements
 *  4. Users (1 Admin, 2 Trainers, 6 Employees)
 *  5. Employee competency levels
 *  6. Courses with modules and lessons
 *  7. Competency-to-course mappings
 *  8. Assessments with questions and options
 *  9. Enrollments and lesson progress
 * 10. Assessment attempts (pre + post training for effectiveness demo)
 * 11. Skill gaps (calculated from role requirements vs current levels)
 * 12. Recommendations
 * 13. Training assignments
 * 14. Knowledge resources
 * 15. Notifications
 *
 * Run: node prisma/seed.js
 */

require('dotenv').config(); // Load .env so DATABASE_URL is available
const bcrypt = require('bcryptjs');

// Prisma 7 singleton with Driver Adapter
const prisma = require('../src/config/database');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Calculate gap priority from gap size — mirrors the logic in competencyLevel.js
 * Duplicated here to keep seed.js self-contained (no circular imports).
 */
function getGapPriority(gap) {
  if (gap === 0) return 'NONE';
  if (gap === 1) return 'MEDIUM';
  if (gap === 2) return 'HIGH';
  return 'CRITICAL';
}

function log(msg) {
  console.log(`  ✔  ${msg}`);
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 CAPACITY CONNECT — Seeding TechNova Solutions\n');
  console.log('─'.repeat(55));

  // ── 1. DEPARTMENTS ──────────────────────────────────────────────────────────
  console.log('\n📁 Creating departments...');

  const [deptIT, deptHR, deptFinance, deptOps] = await Promise.all([
    prisma.department.upsert({
      where: { name: 'IT Department' },
      update: {},
      create: { name: 'IT Department', description: 'Software development, infrastructure, and IT support', code: 'IT' },
    }),
    prisma.department.upsert({
      where: { name: 'HR Department' },
      update: {},
      create: { name: 'HR Department', description: 'Human resources, recruitment, and employee welfare', code: 'HR' },
    }),
    prisma.department.upsert({
      where: { name: 'Finance Department' },
      update: {},
      create: { name: 'Finance Department', description: 'Financial planning, budgeting, and accounting', code: 'FIN' },
    }),
    prisma.department.upsert({
      where: { name: 'Operations Department' },
      update: {},
      create: { name: 'Operations Department', description: 'Business operations, process management, and logistics', code: 'OPS' },
    }),
  ]);
  log('IT, HR, Finance, Operations departments created');

  // ── 2. COMPETENCIES ─────────────────────────────────────────────────────────
  console.log('\n🎯 Creating competencies...');

  const competencyData = [
    // Technical
    { name: 'JavaScript', category: 'Technical', description: 'JavaScript programming including ES6+, async/await, and modern patterns' },
    { name: 'SQL', category: 'Technical', description: 'Structured Query Language — queries, joins, indexing, stored procedures' },
    { name: 'REST API Development', category: 'Technical', description: 'Designing and building RESTful APIs with proper HTTP semantics' },
    { name: 'Git & Version Control', category: 'Technical', description: 'Git workflows, branching strategies, and collaborative development' },
    { name: 'React.js', category: 'Technical', description: 'React component development, hooks, state management, and ecosystem' },
    { name: 'Node.js', category: 'Technical', description: 'Server-side JavaScript with Node.js, Express, and npm ecosystem' },
    { name: 'Data Analysis', category: 'Technical', description: 'Statistical analysis, data visualization, and insight generation' },
    { name: 'Python', category: 'Technical', description: 'Python programming for scripting, automation, and data processing' },
    // Soft Skills
    { name: 'Communication', category: 'Soft Skills', description: 'Written, verbal, and presentation communication skills' },
    { name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical thinking, root cause analysis, and solution design' },
    { name: 'Team Collaboration', category: 'Soft Skills', description: 'Working effectively in teams, cross-functional communication' },
    // Leadership
    { name: 'Leadership', category: 'Leadership', description: 'Inspiring, guiding, and developing team members' },
    { name: 'Project Management', category: 'Leadership', description: 'Planning, execution, risk management, and delivery of projects' },
  ];

  const competencies = {};
  for (const comp of competencyData) {
    competencies[comp.name] = await prisma.competency.upsert({
      where: { name: comp.name },
      update: {},
      create: comp,
    });
  }
  log(`${competencyData.length} competencies created`);

  // ── 3. ORGANIZATIONAL ROLES ─────────────────────────────────────────────────
  console.log('\n🏢 Creating organizational roles...');

  const roleData = [
    {
      name: 'Software Developer',
      description: 'Designs, builds, and maintains software applications',
      departmentId: deptIT.id,
      requirements: [
        { comp: 'JavaScript', level: 4 },
        { comp: 'SQL', level: 4 },
        { comp: 'REST API Development', level: 3 },
        { comp: 'Git & Version Control', level: 3 },
        { comp: 'Communication', level: 3 },
        { comp: 'Problem Solving', level: 3 },
      ],
    },
    {
      name: 'Senior Software Developer',
      description: 'Leads technical delivery and mentors junior developers',
      departmentId: deptIT.id,
      requirements: [
        { comp: 'JavaScript', level: 4 },
        { comp: 'SQL', level: 4 },
        { comp: 'REST API Development', level: 4 },
        { comp: 'Git & Version Control', level: 4 },
        { comp: 'React.js', level: 3 },
        { comp: 'Node.js', level: 3 },
        { comp: 'Communication', level: 4 },
        { comp: 'Leadership', level: 3 },
        { comp: 'Problem Solving', level: 4 },
      ],
    },
    {
      name: 'HR Executive',
      description: 'Manages recruitment, employee relations, and HR processes',
      departmentId: deptHR.id,
      requirements: [
        { comp: 'Communication', level: 4 },
        { comp: 'Leadership', level: 3 },
        { comp: 'Problem Solving', level: 3 },
        { comp: 'Team Collaboration', level: 4 },
      ],
    },
    {
      name: 'Financial Analyst',
      description: 'Performs financial analysis, reporting, and forecasting',
      departmentId: deptFinance.id,
      requirements: [
        { comp: 'SQL', level: 4 },
        { comp: 'Data Analysis', level: 4 },
        { comp: 'Python', level: 2 },
        { comp: 'Communication', level: 3 },
        { comp: 'Problem Solving', level: 3 },
      ],
    },
    {
      name: 'Operations Manager',
      description: 'Oversees operational processes and manages cross-functional teams',
      departmentId: deptOps.id,
      requirements: [
        { comp: 'Leadership', level: 4 },
        { comp: 'Project Management', level: 4 },
        { comp: 'Communication', level: 4 },
        { comp: 'Team Collaboration', level: 3 },
        { comp: 'Problem Solving', level: 3 },
      ],
    },
  ];

  const orgRoles = {};
  for (const roleInfo of roleData) {
    const { requirements, ...roleFields } = roleInfo;
    const orgRole = await prisma.orgRole.upsert({
      where: { name: roleFields.name },
      update: {},
      create: roleFields,
    });
    orgRoles[roleFields.name] = orgRole;

    // Create competency requirements
    for (const req of requirements) {
      await prisma.roleCompetency.upsert({
        where: {
          orgRoleId_competencyId: {
            orgRoleId: orgRole.id,
            competencyId: competencies[req.comp].id,
          },
        },
        update: { requiredLevel: req.level },
        create: {
          orgRoleId: orgRole.id,
          competencyId: competencies[req.comp].id,
          requiredLevel: req.level,
        },
      });
    }
  }
  log(`${roleData.length} organizational roles created with competency mappings`);

  // ── 4. USERS ────────────────────────────────────────────────────────────────
  console.log('\n👤 Creating users...');

  const adminPass    = await hashPassword('Admin@123');
  const trainerPass  = await hashPassword('Trainer@123');
  const employeePass = await hashPassword('Employee@123');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@technova.com' },
    update: {},
    create: {
      email: 'admin@technova.com',
      password: adminPass,
      firstName: 'Aditya',
      lastName: 'Raj',
      role: 'ADMIN',
      jobTitle: 'HR & Learning Manager',
    },
  });

  // Trainers
  const trainer1 = await prisma.user.upsert({
    where: { email: 'priya.trainer@technova.com' },
    update: {},
    create: {
      email: 'priya.trainer@technova.com',
      password: trainerPass,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'TRAINER',
      jobTitle: 'Database & Backend Trainer',
      departmentId: deptIT.id,
    },
  });

  const trainer2 = await prisma.user.upsert({
    where: { email: 'amit.trainer@technova.com' },
    update: {},
    create: {
      email: 'amit.trainer@technova.com',
      password: trainerPass,
      firstName: 'Amit',
      lastName: 'Verma',
      role: 'TRAINER',
      jobTitle: 'Frontend & JavaScript Trainer',
      departmentId: deptIT.id,
    },
  });

  // Employees — defined with their current competency levels
  const employeeData = [
    {
      email: 'rahul@technova.com',
      firstName: 'Rahul',
      lastName: 'Sharma',
      jobTitle: 'Junior Software Engineer',
      departmentId: deptIT.id,
      orgRoleId: orgRoles['Software Developer'].id,
      // Current competency levels — deliberately below requirements for the demo
      levels: {
        'JavaScript': 3,         // Required: 4 → Gap: 1 (MEDIUM)
        'SQL': 2,                 // Required: 4 → Gap: 2 (HIGH) ⭐ Main gap for demo
        'REST API Development': 2,// Required: 3 → Gap: 1 (MEDIUM)
        'Git & Version Control': 4,// Required: 3 → Gap: 0 (NONE)
        'Communication': 3,       // Required: 3 → Gap: 0 (NONE)
        'Problem Solving': 2,     // Required: 3 → Gap: 1 (MEDIUM)
      },
    },
    {
      email: 'priya@technova.com',
      firstName: 'Priya',
      lastName: 'Patel',
      jobTitle: 'Software Engineer',
      departmentId: deptIT.id,
      orgRoleId: orgRoles['Software Developer'].id,
      levels: {
        'JavaScript': 4,
        'SQL': 3,                  // Required: 4 → Gap: 1 (MEDIUM)
        'REST API Development': 3,
        'Git & Version Control': 3,
        'Communication': 2,        // Required: 3 → Gap: 1 (MEDIUM)
        'Problem Solving': 3,
      },
    },
    {
      email: 'deepak@technova.com',
      firstName: 'Deepak',
      lastName: 'Kumar',
      jobTitle: 'Senior Software Engineer',
      departmentId: deptIT.id,
      orgRoleId: orgRoles['Senior Software Developer'].id,
      levels: {
        'JavaScript': 4,
        'SQL': 4,
        'REST API Development': 4,
        'Git & Version Control': 4,
        'React.js': 3,
        'Node.js': 3,
        'Communication': 4,
        'Leadership': 3,
        'Problem Solving': 4,
      },
    },
    {
      email: 'ananya@technova.com',
      firstName: 'Ananya',
      lastName: 'Singh',
      jobTitle: 'HR Executive',
      departmentId: deptHR.id,
      orgRoleId: orgRoles['HR Executive'].id,
      levels: {
        'Communication': 4,
        'Leadership': 2,           // Required: 3 → Gap: 1 (MEDIUM)
        'Problem Solving': 3,
        'Team Collaboration': 3,   // Required: 4 → Gap: 1 (MEDIUM)
      },
    },
    {
      email: 'rohan@technova.com',
      firstName: 'Rohan',
      lastName: 'Gupta',
      jobTitle: 'Junior Financial Analyst',
      departmentId: deptFinance.id,
      orgRoleId: orgRoles['Financial Analyst'].id,
      levels: {
        'SQL': 3,                  // Required: 4 → Gap: 1 (MEDIUM)
        'Data Analysis': 2,        // Required: 4 → Gap: 2 (HIGH)
        'Python': 1,               // Required: 2 → Gap: 1 (MEDIUM)
        'Communication': 3,
        'Problem Solving': 2,      // Required: 3 → Gap: 1 (MEDIUM)
      },
    },
    {
      email: 'neha@technova.com',
      firstName: 'Neha',
      lastName: 'Joshi',
      jobTitle: 'Operations Manager',
      departmentId: deptOps.id,
      orgRoleId: orgRoles['Operations Manager'].id,
      levels: {
        'Leadership': 3,           // Required: 4 → Gap: 1 (MEDIUM)
        'Project Management': 2,   // Required: 4 → Gap: 2 (HIGH)
        'Communication': 4,
        'Team Collaboration': 3,
        'Problem Solving': 3,
      },
    },
  ];

  const employees = {};
  for (const empData of employeeData) {
    const { levels, ...userFields } = empData;
    const emp = await prisma.user.upsert({
      where: { email: userFields.email },
      update: {},
      create: { ...userFields, password: employeePass },
    });
    employees[empData.email] = emp;

    // Create employee competency records
    for (const [compName, level] of Object.entries(levels)) {
      await prisma.employeeCompetency.upsert({
        where: {
          userId_competencyId: {
            userId: emp.id,
            competencyId: competencies[compName].id,
          },
        },
        update: { currentLevel: level },
        create: {
          userId: emp.id,
          competencyId: competencies[compName].id,
          currentLevel: level,
        },
      });
    }
  }
  log(`1 admin, 2 trainers, ${employeeData.length} employees created`);

  // ── 5. SKILL GAPS ───────────────────────────────────────────────────────────
  console.log('\n⚡ Calculating skill gaps...');

  // For each employee, get their role requirements and compare with their levels
  for (const empData of employeeData) {
    const emp = employees[empData.email];
    const orgRole = await prisma.orgRole.findFirst({
      where: { id: empData.orgRoleId },
      include: { roleCompetencies: true },
    });

    for (const req of orgRole.roleCompetencies) {
      const currentLevel = empData.levels[
        Object.keys(empData.levels).find(
          (name) => competencies[name]?.id === req.competencyId
        )
      ] || 1;

      const gap = Math.max(0, req.requiredLevel - currentLevel);
      const priority = getGapPriority(gap);

      await prisma.skillGap.upsert({
        where: {
          userId_competencyId: {
            userId: emp.id,
            competencyId: req.competencyId,
          },
        },
        update: { requiredLevel: req.requiredLevel, currentLevel, gap, priority },
        create: {
          userId: emp.id,
          competencyId: req.competencyId,
          requiredLevel: req.requiredLevel,
          currentLevel,
          gap,
          priority,
        },
      });
    }
  }
  log('Skill gaps calculated and stored for all employees');

  // ── 6. COURSES ──────────────────────────────────────────────────────────────
  console.log('\n📚 Creating courses with modules and lessons...');

  const coursesData = [
    {
      title: 'SQL Fundamentals',
      description: 'Master the basics of SQL — from writing your first SELECT to complex JOINs and aggregations. Perfect for beginners and those with Level 1 SQL skills.',
      category: 'Database',
      difficulty: 'Beginner',
      durationHours: 8,
      status: 'PUBLISHED',
      trainerId: trainer1.id,
      competencies: [{ comp: 'SQL', targetLevel: 3 }],
      modules: [
        {
          title: 'Introduction to SQL and Databases',
          order: 1,
          lessons: [
            { title: 'What is a Database?', type: 'TEXT', content: 'A database is an organized collection of structured data...', order: 1, durationMin: 15 },
            { title: 'Installing PostgreSQL', type: 'VIDEO', content: 'https://example.com/sql-install-video', order: 2, durationMin: 20 },
            { title: 'Your First SELECT Query', type: 'TEXT', content: 'SELECT * FROM employees; — Let\'s break this down...', order: 3, durationMin: 25 },
          ],
        },
        {
          title: 'Filtering and Sorting Data',
          order: 2,
          lessons: [
            { title: 'WHERE Clause Deep Dive', type: 'TEXT', content: 'The WHERE clause filters rows that match conditions...', order: 1, durationMin: 30 },
            { title: 'ORDER BY and LIMIT', type: 'TEXT', content: 'Sort your results with ORDER BY...', order: 2, durationMin: 20 },
            { title: 'Practice: Filtering Lab', type: 'DOCUMENT', content: '/uploads/sql-filtering-exercises.pdf', order: 3, durationMin: 45 },
          ],
        },
        {
          title: 'Joins and Relationships',
          order: 3,
          lessons: [
            { title: 'Understanding Table Relationships', type: 'TEXT', content: 'Databases store data in related tables...', order: 1, durationMin: 20 },
            { title: 'INNER JOIN, LEFT JOIN, RIGHT JOIN', type: 'VIDEO', content: 'https://example.com/sql-joins-video', order: 2, durationMin: 35 },
            { title: 'Practice: Join Exercises', type: 'DOCUMENT', content: '/uploads/sql-joins-exercises.pdf', order: 3, durationMin: 60 },
          ],
        },
      ],
    },
    {
      title: 'Advanced SQL & Database Optimization',
      description: 'Take your SQL from Level 3 to Level 4. Learn query optimization, indexes, CTEs, window functions, and stored procedures used in production systems.',
      category: 'Database',
      difficulty: 'Intermediate',
      durationHours: 12,
      status: 'PUBLISHED',
      trainerId: trainer1.id,
      competencies: [{ comp: 'SQL', targetLevel: 4 }],
      modules: [
        {
          title: 'Query Optimization',
          order: 1,
          lessons: [
            { title: 'How PostgreSQL Executes Queries', type: 'TEXT', content: 'Understanding the query planner...', order: 1, durationMin: 30 },
            { title: 'EXPLAIN and EXPLAIN ANALYZE', type: 'VIDEO', content: 'https://example.com/explain-video', order: 2, durationMin: 25 },
            { title: 'Avoiding N+1 and Slow Queries', type: 'TEXT', content: 'Common performance anti-patterns...', order: 3, durationMin: 40 },
          ],
        },
        {
          title: 'Indexes and Performance',
          order: 2,
          lessons: [
            { title: 'B-Tree, Hash, and GIN Indexes', type: 'TEXT', content: 'PostgreSQL supports multiple index types...', order: 1, durationMin: 35 },
            { title: 'When to Index — and When Not To', type: 'TEXT', content: 'Index design requires careful thought...', order: 2, durationMin: 25 },
          ],
        },
        {
          title: 'Advanced SQL Features',
          order: 3,
          lessons: [
            { title: 'Common Table Expressions (CTEs)', type: 'TEXT', content: 'WITH clauses make complex queries readable...', order: 1, durationMin: 30 },
            { title: 'Window Functions', type: 'VIDEO', content: 'https://example.com/window-functions', order: 2, durationMin: 40 },
            { title: 'Stored Procedures and Functions', type: 'TEXT', content: 'PL/pgSQL basics for reusable logic...', order: 3, durationMin: 45 },
          ],
        },
      ],
    },
    {
      title: 'JavaScript Essentials',
      description: 'Build a solid JavaScript foundation. Covers variables, functions, arrays, objects, DOM manipulation, and modern ES6+ syntax.',
      category: 'Web Development',
      difficulty: 'Beginner',
      durationHours: 10,
      status: 'PUBLISHED',
      trainerId: trainer2.id,
      competencies: [{ comp: 'JavaScript', targetLevel: 3 }],
      modules: [
        {
          title: 'JavaScript Fundamentals',
          order: 1,
          lessons: [
            { title: 'Variables, Data Types, and Scope', type: 'TEXT', content: 'JavaScript has var, let, and const...', order: 1, durationMin: 25 },
            { title: 'Functions and Arrow Functions', type: 'VIDEO', content: 'https://example.com/js-functions-video', order: 2, durationMin: 30 },
            { title: 'Arrays and Array Methods', type: 'TEXT', content: 'map, filter, reduce, and find...', order: 3, durationMin: 35 },
          ],
        },
        {
          title: 'Modern JavaScript (ES6+)',
          order: 2,
          lessons: [
            { title: 'Destructuring and Spread Operator', type: 'TEXT', content: 'ES6 destructuring makes code cleaner...', order: 1, durationMin: 20 },
            { title: 'Promises and Async/Await', type: 'VIDEO', content: 'https://example.com/async-video', order: 2, durationMin: 40 },
            { title: 'Modules: import and export', type: 'TEXT', content: 'ES modules replaced CommonJS in the browser...', order: 3, durationMin: 20 },
          ],
        },
      ],
    },
    {
      title: 'Modern JavaScript — Advanced Patterns',
      description: 'Deep dive into closures, prototypes, design patterns, performance optimization, and testing. For developers targeting Level 4 JavaScript.',
      category: 'Web Development',
      difficulty: 'Intermediate',
      durationHours: 14,
      status: 'PUBLISHED',
      trainerId: trainer2.id,
      competencies: [{ comp: 'JavaScript', targetLevel: 4 }],
      modules: [
        {
          title: 'Closures, Prototypes, and the Event Loop',
          order: 1,
          lessons: [
            { title: 'How Closures Work', type: 'TEXT', content: 'A closure gives you access to outer scope...', order: 1, durationMin: 35 },
            { title: 'The JavaScript Event Loop Explained', type: 'VIDEO', content: 'https://example.com/event-loop', order: 2, durationMin: 30 },
          ],
        },
      ],
    },
    {
      title: 'REST API Development with Node.js',
      description: 'Learn to design and build production-quality REST APIs using Node.js and Express. Covers routing, middleware, authentication, and error handling.',
      category: 'Backend',
      difficulty: 'Intermediate',
      durationHours: 12,
      status: 'PUBLISHED',
      trainerId: trainer1.id,
      competencies: [
        { comp: 'REST API Development', targetLevel: 4 },
        { comp: 'Node.js', targetLevel: 3 },
      ],
      modules: [
        {
          title: 'REST API Fundamentals',
          order: 1,
          lessons: [
            { title: 'HTTP Methods and Status Codes', type: 'TEXT', content: 'GET, POST, PUT, PATCH, DELETE — when to use each...', order: 1, durationMin: 25 },
            { title: 'Designing Resource URLs', type: 'TEXT', content: 'RESTful URL conventions...', order: 2, durationMin: 20 },
          ],
        },
        {
          title: 'Building APIs with Express',
          order: 2,
          lessons: [
            { title: 'Express Routing and Middleware', type: 'VIDEO', content: 'https://example.com/express-routing', order: 1, durationMin: 35 },
            { title: 'JWT Authentication Implementation', type: 'TEXT', content: 'Implementing stateless authentication...', order: 2, durationMin: 45 },
            { title: 'Error Handling and Validation', type: 'TEXT', content: 'Centralized error handling with express-validator...', order: 3, durationMin: 30 },
          ],
        },
      ],
    },
    {
      title: 'Leadership & Team Management',
      description: 'Develop essential leadership skills — motivating teams, giving feedback, managing conflict, and leading with empathy.',
      category: 'Leadership',
      difficulty: 'Beginner',
      durationHours: 6,
      status: 'PUBLISHED',
      trainerId: trainer1.id,
      competencies: [
        { comp: 'Leadership', targetLevel: 3 },
        { comp: 'Communication', targetLevel: 4 },
      ],
      modules: [
        {
          title: 'Foundations of Leadership',
          order: 1,
          lessons: [
            { title: 'What Makes a Great Leader?', type: 'TEXT', content: 'Leadership is about influence, not authority...', order: 1, durationMin: 20 },
            { title: 'Leadership Styles and When to Use Them', type: 'VIDEO', content: 'https://example.com/leadership-styles', order: 2, durationMin: 25 },
            { title: 'Giving Effective Feedback', type: 'TEXT', content: 'The SBI (Situation-Behavior-Impact) model...', order: 3, durationMin: 20 },
          ],
        },
      ],
    },
    {
      title: 'Data Analysis with Python',
      description: 'Learn to analyse data using Python, pandas, and matplotlib. Goes from zero to building your first data report.',
      category: 'Data',
      difficulty: 'Beginner',
      durationHours: 10,
      status: 'PUBLISHED',
      trainerId: trainer1.id,
      competencies: [
        { comp: 'Data Analysis', targetLevel: 3 },
        { comp: 'Python', targetLevel: 2 },
      ],
      modules: [
        {
          title: 'Python for Data Analysis',
          order: 1,
          lessons: [
            { title: 'Python Basics for Analysts', type: 'TEXT', content: 'Variables, lists, dictionaries, and loops...', order: 1, durationMin: 30 },
            { title: 'pandas: DataFrames and Series', type: 'VIDEO', content: 'https://example.com/pandas-intro', order: 2, durationMin: 40 },
            { title: 'Reading and Cleaning Data', type: 'TEXT', content: 'read_csv, dropna, fillna, and data types...', order: 3, durationMin: 35 },
          ],
        },
        {
          title: 'Visualizing Data',
          order: 2,
          lessons: [
            { title: 'matplotlib and seaborn Basics', type: 'VIDEO', content: 'https://example.com/matplotlib-video', order: 1, durationMin: 30 },
            { title: 'Building Your First Report', type: 'DOCUMENT', content: '/uploads/data-analysis-project.pdf', order: 2, durationMin: 60 },
          ],
        },
      ],
    },
  ];

  const courses = {};
  for (const courseInfo of coursesData) {
    const { modules: modulesData, competencies: courseComps, ...courseFields } = courseInfo;

    const course = await prisma.course.create({
      data: courseFields,
    });
    courses[courseInfo.title] = course;

    // Competency mappings
    for (const compMapping of courseComps) {
      await prisma.courseCompetency.create({
        data: {
          courseId: course.id,
          competencyId: competencies[compMapping.comp].id,
          targetLevel: compMapping.targetLevel,
        },
      });
    }

    // Modules and Lessons
    for (const modData of modulesData) {
      const { lessons: lessonsData, ...moduleFields } = modData;
      const mod = await prisma.courseModule.create({
        data: { ...moduleFields, courseId: course.id },
      });

      for (const lessonData of lessonsData) {
        await prisma.lesson.create({
          data: { ...lessonData, moduleId: mod.id },
        });
      }
    }
  }
  log(`${coursesData.length} courses with modules and lessons created`);

  // ── 7. ASSESSMENTS ──────────────────────────────────────────────────────────
  console.log('\n📝 Creating assessments with questions...');

  const assessmentData = [
    {
      title: 'SQL Competency Assessment',
      description: 'Tests your SQL knowledge across querying, joins, aggregations, and optimization.',
      competencyId: competencies['SQL'].id,
      passingScore: 60,
      timeLimitMin: 30,
      questions: [
        {
          text: 'Which SQL clause is used to filter rows AFTER a GROUP BY?',
          explanation: 'HAVING filters grouped data; WHERE filters rows before grouping.',
          order: 1,
          options: [
            { text: 'WHERE', isCorrect: false },
            { text: 'HAVING', isCorrect: true },
            { text: 'FILTER', isCorrect: false },
            { text: 'GROUP FILTER', isCorrect: false },
          ],
        },
        {
          text: 'What does SELECT DISTINCT do?',
          explanation: 'DISTINCT removes duplicate rows from the result set.',
          order: 2,
          options: [
            { text: 'Selects only the first row', isCorrect: false },
            { text: 'Removes duplicate rows from the result', isCorrect: true },
            { text: 'Sorts results alphabetically', isCorrect: false },
            { text: 'Selects the maximum value', isCorrect: false },
          ],
        },
        {
          text: 'Which JOIN type returns ALL rows from the left table, even if there is no match on the right?',
          explanation: 'LEFT JOIN (or LEFT OUTER JOIN) returns all left table rows; NULL for unmatched right columns.',
          order: 3,
          options: [
            { text: 'INNER JOIN', isCorrect: false },
            { text: 'RIGHT JOIN', isCorrect: false },
            { text: 'LEFT JOIN', isCorrect: true },
            { text: 'CROSS JOIN', isCorrect: false },
          ],
        },
        {
          text: 'What is the correct order of SQL clauses?',
          explanation: 'The standard order is SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.',
          order: 4,
          options: [
            { text: 'SELECT → WHERE → FROM → GROUP BY → ORDER BY', isCorrect: false },
            { text: 'FROM → WHERE → SELECT → GROUP BY → ORDER BY', isCorrect: false },
            { text: 'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY', isCorrect: true },
            { text: 'SELECT → FROM → GROUP BY → WHERE → ORDER BY', isCorrect: false },
          ],
        },
        {
          text: 'Which aggregate function counts the number of NON-NULL values in a column?',
          explanation: 'COUNT(column_name) counts non-NULL values; COUNT(*) counts all rows.',
          order: 5,
          options: [
            { text: 'SUM()', isCorrect: false },
            { text: 'COUNT(*)', isCorrect: false },
            { text: 'COUNT(column_name)', isCorrect: true },
            { text: 'TOTAL()', isCorrect: false },
          ],
        },
        {
          text: 'What is an index in a database?',
          explanation: 'An index is a data structure that speeds up SELECT queries at the cost of slower writes.',
          order: 6,
          options: [
            { text: 'A column with unique values', isCorrect: false },
            { text: 'A data structure that speeds up data retrieval', isCorrect: true },
            { text: 'A constraint that prevents duplicate rows', isCorrect: false },
            { text: 'A foreign key reference', isCorrect: false },
          ],
        },
        {
          text: 'Which SQL statement is used to update existing rows?',
          explanation: 'UPDATE modifies existing rows; INSERT adds new rows.',
          order: 7,
          options: [
            { text: 'MODIFY', isCorrect: false },
            { text: 'INSERT', isCorrect: false },
            { text: 'UPDATE', isCorrect: true },
            { text: 'ALTER', isCorrect: false },
          ],
        },
        {
          text: 'What does a PRIMARY KEY constraint ensure?',
          explanation: 'A primary key ensures each row is uniquely identifiable and cannot be NULL.',
          order: 8,
          options: [
            { text: 'The column values are sorted', isCorrect: false },
            { text: 'Unique and NOT NULL values for the column', isCorrect: true },
            { text: 'The column is the first in the table', isCorrect: false },
            { text: 'The column references another table', isCorrect: false },
          ],
        },
        {
          text: 'Which window function assigns a rank to each row without gaps?',
          explanation: 'DENSE_RANK() gives consecutive ranks without gaps; RANK() leaves gaps for tied positions.',
          order: 9,
          options: [
            { text: 'ROW_NUMBER()', isCorrect: false },
            { text: 'RANK()', isCorrect: false },
            { text: 'DENSE_RANK()', isCorrect: true },
            { text: 'NTILE()', isCorrect: false },
          ],
        },
        {
          text: 'What is a CTE (Common Table Expression)?',
          explanation: 'A CTE is a named temporary result set defined with the WITH clause for use within a query.',
          order: 10,
          options: [
            { text: 'A permanent table stored in the database', isCorrect: false },
            { text: 'A named temporary result set using the WITH clause', isCorrect: true },
            { text: 'A type of constraint', isCorrect: false },
            { text: 'A stored procedure', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'JavaScript Competency Assessment',
      description: 'Measures JavaScript proficiency from fundamentals to advanced async patterns.',
      competencyId: competencies['JavaScript'].id,
      passingScore: 60,
      timeLimitMin: 30,
      questions: [
        {
          text: 'What is the difference between let and var in JavaScript?',
          explanation: 'let is block-scoped; var is function-scoped. let cannot be redeclared in the same scope.',
          order: 1,
          options: [
            { text: 'They are identical', isCorrect: false },
            { text: 'let is block-scoped; var is function-scoped', isCorrect: true },
            { text: 'var is block-scoped; let is global', isCorrect: false },
            { text: 'let cannot hold numbers', isCorrect: false },
          ],
        },
        {
          text: 'What does Array.prototype.map() return?',
          explanation: 'map() returns a new array with the results of calling the provided function on each element.',
          order: 2,
          options: [
            { text: 'The original array, modified', isCorrect: false },
            { text: 'A new array with transformed elements', isCorrect: true },
            { text: 'A boolean indicating success', isCorrect: false },
            { text: 'The first matching element', isCorrect: false },
          ],
        },
        {
          text: 'What is a closure in JavaScript?',
          explanation: 'A closure is a function that retains access to its outer (enclosing) scope even after the outer function has returned.',
          order: 3,
          options: [
            { text: 'A function that runs immediately', isCorrect: false },
            { text: 'A function with access to its outer scope after the outer function has returned', isCorrect: true },
            { text: 'A method on arrays', isCorrect: false },
            { text: 'A way to close a file', isCorrect: false },
          ],
        },
        {
          text: 'Which keyword makes a function return a Promise?',
          explanation: 'The async keyword before a function makes it return a Promise automatically.',
          order: 4,
          options: [
            { text: 'promise', isCorrect: false },
            { text: 'await', isCorrect: false },
            { text: 'async', isCorrect: true },
            { text: 'defer', isCorrect: false },
          ],
        },
        {
          text: 'What does === check in JavaScript?',
          explanation: '=== checks both value AND type (strict equality). == only checks value (loose equality).',
          order: 5,
          options: [
            { text: 'Value only', isCorrect: false },
            { text: 'Type only', isCorrect: false },
            { text: 'Both value and type (strict equality)', isCorrect: true },
            { text: 'Object reference', isCorrect: false },
          ],
        },
        {
          text: 'What is event bubbling?',
          explanation: 'Event bubbling means an event triggered on a child element propagates up through its ancestors.',
          order: 6,
          options: [
            { text: 'Events that only work in Google Chrome', isCorrect: false },
            { text: 'An event that propagates from child to parent elements', isCorrect: true },
            { text: 'A method to create animations', isCorrect: false },
            { text: 'Events that are delayed', isCorrect: false },
          ],
        },
        {
          text: 'What does the spread operator (...) do?',
          explanation: 'The spread operator expands an iterable (like an array) into individual elements.',
          order: 7,
          options: [
            { text: 'Creates a new empty array', isCorrect: false },
            { text: 'Expands an iterable into individual elements', isCorrect: true },
            { text: 'Concatenates two strings', isCorrect: false },
            { text: 'Multiplies values', isCorrect: false },
          ],
        },
        {
          text: 'What is the output of: typeof null?',
          explanation: 'typeof null === "object" is a known JavaScript bug/quirk. null is not actually an object.',
          order: 8,
          options: [
            { text: '"null"', isCorrect: false },
            { text: '"undefined"', isCorrect: false },
            { text: '"object"', isCorrect: true },
            { text: '"number"', isCorrect: false },
          ],
        },
        {
          text: 'Which Array method removes and returns the LAST element?',
          explanation: 'pop() removes and returns the last element. push() adds to the end. shift() removes the first.',
          order: 9,
          options: [
            { text: 'shift()', isCorrect: false },
            { text: 'pop()', isCorrect: true },
            { text: 'splice()', isCorrect: false },
            { text: 'slice()', isCorrect: false },
          ],
        },
        {
          text: 'What is a Promise in JavaScript?',
          explanation: 'A Promise represents the eventual result of an asynchronous operation — pending, fulfilled, or rejected.',
          order: 10,
          options: [
            { text: 'A synchronous callback function', isCorrect: false },
            { text: 'An object representing the eventual result of an async operation', isCorrect: true },
            { text: 'A way to declare variables', isCorrect: false },
            { text: 'A type of loop', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Leadership Competency Assessment',
      description: 'Assess leadership knowledge, team management, and interpersonal skills.',
      competencyId: competencies['Leadership'].id,
      passingScore: 60,
      timeLimitMin: 20,
      questions: [
        {
          text: 'What is the SBI model used for?',
          explanation: 'SBI (Situation-Behavior-Impact) is a framework for giving constructive feedback.',
          order: 1,
          options: [
            { text: 'Project management', isCorrect: false },
            { text: 'Giving structured, constructive feedback', isCorrect: true },
            { text: 'Performance appraisals only', isCorrect: false },
            { text: 'Conflict resolution', isCorrect: false },
          ],
        },
        {
          text: 'What is a transformational leadership style characterized by?',
          explanation: 'Transformational leaders inspire change by appealing to high ideals and motivating followers to exceed their own self-interest.',
          order: 2,
          options: [
            { text: 'Strict rule enforcement', isCorrect: false },
            { text: 'Inspiring followers to achieve beyond expectations', isCorrect: true },
            { text: 'Only rewarding high performers', isCorrect: false },
            { text: 'Avoiding team input', isCorrect: false },
          ],
        },
        {
          text: 'What does psychological safety in a team mean?',
          explanation: 'Psychological safety is the belief that one will not be punished for speaking up, taking risks, or making mistakes.',
          order: 3,
          options: [
            { text: 'Employees have physical safety equipment', isCorrect: false },
            { text: 'Team members feel safe to speak up without fear of punishment', isCorrect: true },
            { text: 'No difficult conversations occur', isCorrect: false },
            { text: 'Managers protect employees from criticism', isCorrect: false },
          ],
        },
        {
          text: 'Which leadership approach works best when team members are highly skilled and motivated?',
          explanation: 'Delegative (laissez-faire) leadership works best with highly capable, self-motivated teams who need autonomy.',
          order: 4,
          options: [
            { text: 'Autocratic', isCorrect: false },
            { text: 'Micromanagement', isCorrect: false },
            { text: 'Delegative/Laissez-Faire', isCorrect: true },
            { text: 'Transactional', isCorrect: false },
          ],
        },
        {
          text: 'What is the primary goal of a 1:1 meeting between manager and employee?',
          explanation: '1:1s are primarily for the employee — to discuss their growth, blockers, and wellbeing.',
          order: 5,
          options: [
            { text: 'Status reporting to management', isCorrect: false },
            { text: 'Building relationship, discussing growth, and removing blockers', isCorrect: true },
            { text: 'Evaluating performance for raises', isCorrect: false },
            { text: 'Reviewing project deadlines only', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Data Analysis Competency Assessment',
      description: 'Test your knowledge of data analysis concepts, statistics, and tools.',
      competencyId: competencies['Data Analysis'].id,
      passingScore: 60,
      timeLimitMin: 25,
      questions: [
        {
          text: 'What does the mean of a dataset represent?',
          explanation: 'The mean (arithmetic average) is the sum of all values divided by the count of values.',
          order: 1,
          options: [
            { text: 'The most frequently occurring value', isCorrect: false },
            { text: 'The middle value when sorted', isCorrect: false },
            { text: 'The sum divided by the count of values', isCorrect: true },
            { text: 'The highest minus the lowest value', isCorrect: false },
          ],
        },
        {
          text: 'In pandas, what does df.describe() return?',
          explanation: 'df.describe() returns summary statistics: count, mean, std, min, quartiles, and max for numeric columns.',
          order: 2,
          options: [
            { text: 'The first 5 rows of the DataFrame', isCorrect: false },
            { text: 'Summary statistics for numeric columns', isCorrect: true },
            { text: 'The column data types', isCorrect: false },
            { text: 'A text description of the DataFrame', isCorrect: false },
          ],
        },
        {
          text: 'What is data normalization?',
          explanation: 'Normalization scales data to a common range (e.g. 0–1) so features with different scales are comparable.',
          order: 3,
          options: [
            { text: 'Removing duplicate rows', isCorrect: false },
            { text: 'Filling missing values', isCorrect: false },
            { text: 'Scaling features to a standard range for comparison', isCorrect: true },
            { text: 'Converting text to numbers', isCorrect: false },
          ],
        },
        {
          text: 'What does a correlation coefficient of -1.0 indicate?',
          explanation: 'A correlation of -1.0 indicates perfect negative correlation: as one variable increases, the other decreases proportionally.',
          order: 4,
          options: [
            { text: 'No relationship between variables', isCorrect: false },
            { text: 'Perfect positive correlation', isCorrect: false },
            { text: 'Perfect negative correlation', isCorrect: true },
            { text: 'The data is invalid', isCorrect: false },
          ],
        },
        {
          text: 'Which chart type is best for showing a distribution of values?',
          explanation: 'A histogram shows the frequency distribution of a continuous variable.',
          order: 5,
          options: [
            { text: 'Pie chart', isCorrect: false },
            { text: 'Line chart', isCorrect: false },
            { text: 'Histogram', isCorrect: true },
            { text: 'Scatter plot', isCorrect: false },
          ],
        },
      ],
    },
  ];

  const assessments = {};
  for (const aData of assessmentData) {
    const { questions: questionsData, ...assessmentFields } = aData;
    const assessment = await prisma.assessment.create({
      data: assessmentFields,
    });
    assessments[assessment.title] = assessment;

    for (const qData of questionsData) {
      const { options: optionsData, ...questionFields } = qData;
      const question = await prisma.question.create({
        data: { ...questionFields, assessmentId: assessment.id },
      });

      for (const optData of optionsData) {
        await prisma.questionOption.create({
          data: { ...optData, questionId: question.id },
        });
      }
    }
  }
  log(`${assessmentData.length} assessments created with ${assessmentData.reduce((a, b) => a + b.questions.length, 0)} questions`);

  // ── 8. ENROLLMENTS + LESSON PROGRESS ────────────────────────────────────────
  console.log('\n📖 Creating enrollments and progress...');

  const rahul = employees['rahul@technova.com'];
  const rohan = employees['rohan@technova.com'];
  const ananya = employees['ananya@technova.com'];

  const sqlFundamentals = courses['SQL Fundamentals'];
  const jsFundamentals  = courses['JavaScript Essentials'];
  const leadership      = courses['Leadership & Team Management'];
  const dataAnalysis    = courses['Data Analysis with Python'];

  // Rahul enrolled in SQL Fundamentals (50% done) and JS Essentials (25% done)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: rahul.id, courseId: sqlFundamentals.id } },
    update: {},
    create: { userId: rahul.id, courseId: sqlFundamentals.id, progressPct: 50 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: rahul.id, courseId: jsFundamentals.id } },
    update: {},
    create: { userId: rahul.id, courseId: jsFundamentals.id, progressPct: 25 },
  });

  // Rohan enrolled in Data Analysis (completed!) and SQL Fundamentals (completed)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: rohan.id, courseId: sqlFundamentals.id } },
    update: {},
    create: {
      userId: rohan.id,
      courseId: sqlFundamentals.id,
      progressPct: 100,
      completedAt: new Date('2026-07-15'),
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: rohan.id, courseId: dataAnalysis.id } },
    update: {},
    create: { userId: rohan.id, courseId: dataAnalysis.id, progressPct: 40 },
  });

  // Ananya enrolled in Leadership
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: ananya.id, courseId: leadership.id } },
    update: {},
    create: { userId: ananya.id, courseId: leadership.id, progressPct: 66 },
  });

  log('Enrollments created with realistic progress');

  // ── 9. ASSESSMENT ATTEMPTS (Pre & Post Training) ─────────────────────────────
  console.log('\n🧪 Creating assessment attempts for training effectiveness demo...');

  const sqlAssessment = assessments['SQL Competency Assessment'];
  const jsAssessment  = assessments['JavaScript Competency Assessment'];

  // Rahul — Pre-training SQL attempt: 50% → Level 2
  await prisma.assessmentAttempt.create({
    data: {
      userId: rahul.id,
      assessmentId: sqlAssessment.id,
      score: 50,
      competencyLevel: 2,
      isPassed: false,
      isPreTraining: true,
      completedAt: new Date('2026-08-01'),
    },
  });

  // Rahul — Post-training SQL attempt: 82% → Level 4 (the SIH demo moment!)
  await prisma.assessmentAttempt.create({
    data: {
      userId: rahul.id,
      assessmentId: sqlAssessment.id,
      score: 82,
      competencyLevel: 4,
      isPassed: true,
      isPostTraining: true,
      courseId: sqlFundamentals.id,
      completedAt: new Date('2026-08-20'),
    },
  });

  // Rahul — JS assessment: 65% → Level 3
  await prisma.assessmentAttempt.create({
    data: {
      userId: rahul.id,
      assessmentId: jsAssessment.id,
      score: 65,
      competencyLevel: 3,
      isPassed: true,
      isPreTraining: true,
      completedAt: new Date('2026-08-05'),
    },
  });

  // Rohan — SQL pre-training: 62% → Level 3
  await prisma.assessmentAttempt.create({
    data: {
      userId: rohan.id,
      assessmentId: sqlAssessment.id,
      score: 62,
      competencyLevel: 3,
      isPassed: true,
      isPostTraining: true,
      courseId: sqlFundamentals.id,
      completedAt: new Date('2026-07-20'),
    },
  });

  log('Assessment attempts created (includes pre/post training for effectiveness demo)');

  // ── 10. TRAINING ASSIGNMENTS ─────────────────────────────────────────────────
  console.log('\n📋 Creating training assignments...');

  const advancedSql   = courses['Advanced SQL & Database Optimization'];
  const restApiCourse = courses['REST API Development with Node.js'];

  const trainingData = [
    {
      userId: rahul.id,
      courseId: sqlFundamentals.id,
      assignedBy: admin.id,
      deadline: new Date('2026-09-15'),
      status: 'IN_PROGRESS',
      notes: 'Priority training — SQL gap is HIGH severity.',
    },
    {
      userId: rahul.id,
      courseId: advancedSql.id,
      assignedBy: admin.id,
      deadline: new Date('2026-10-31'),
      status: 'ASSIGNED',
      notes: 'Follow-up after completing SQL Fundamentals.',
    },
    {
      userId: rohan.id,
      courseId: sqlFundamentals.id,
      assignedBy: admin.id,
      deadline: new Date('2026-07-31'),
      status: 'COMPLETED',
      notes: 'Completed ahead of schedule.',
    },
    {
      userId: rohan.id,
      courseId: dataAnalysis.id,
      assignedBy: admin.id,
      deadline: new Date('2026-09-30'),
      status: 'IN_PROGRESS',
    },
    {
      userId: ananya.id,
      courseId: leadership.id,
      assignedBy: admin.id,
      deadline: new Date('2026-09-01'),
      status: 'IN_PROGRESS',
    },
    {
      userId: employees['priya@technova.com'].id,
      courseId: advancedSql.id,
      assignedBy: admin.id,
      deadline: new Date('2026-08-20'),
      status: 'OVERDUE',
      notes: 'Deadline passed — please follow up.',
    },
  ];

  for (const assignment of trainingData) {
    try {
      await prisma.trainingAssignment.upsert({
        where: { userId_courseId: { userId: assignment.userId, courseId: assignment.courseId } },
        update: {},
        create: assignment,
      });
    } catch (e) {
      // Skip if already exists
    }
  }
  log(`${trainingData.length} training assignments created`);

  // ── 11. RECOMMENDATIONS ──────────────────────────────────────────────────────
  console.log('\n💡 Creating course recommendations...');

  const recommendationData = [
    // Rahul — SQL gap is highest priority
    { userId: rahul.id, courseId: sqlFundamentals.id, competencyId: competencies['SQL'].id, rank: 1, reason: 'Your SQL level (2) is below the required level (4) for Software Developer. Start here.' },
    { userId: rahul.id, courseId: advancedSql.id, competencyId: competencies['SQL'].id, rank: 2, reason: 'Follow up with Advanced SQL once you complete the fundamentals.' },
    { userId: rahul.id, courseId: restApiCourse.id, competencyId: competencies['REST API Development'].id, rank: 3, reason: 'Your REST API level (2) has a gap of 1. This course targets Level 3–4.' },
    // Rohan
    { userId: rohan.id, courseId: dataAnalysis.id, competencyId: competencies['Data Analysis'].id, rank: 1, reason: 'Data Analysis gap is HIGH (Level 2, Required: Level 4). Start now.' },
    // Ananya
    { userId: ananya.id, courseId: leadership.id, competencyId: competencies['Leadership'].id, rank: 1, reason: 'Leadership gap detected. This course will bring you from Level 2 to Level 3.' },
    // Neha
    {
      userId: employees['neha@technova.com'].id,
      courseId: leadership.id,
      competencyId: competencies['Leadership'].id,
      rank: 1,
      reason: 'Leadership gap (Level 3, Required: Level 4). This course strengthens leadership fundamentals.'
    },
  ];

  for (const rec of recommendationData) {
    try {
      await prisma.recommendation.upsert({
        where: { userId_courseId: { userId: rec.userId, courseId: rec.courseId } },
        update: {},
        create: rec,
      });
    } catch (e) {
      // skip duplicates
    }
  }
  log(`${recommendationData.length} recommendations generated`);

  // ── 12. KNOWLEDGE RESOURCES ──────────────────────────────────────────────────
  console.log('\n📂 Creating knowledge resources...');

  const resourceData = [
    {
      title: 'TechNova Employee Handbook 2024',
      description: 'Complete guide to policies, benefits, code of conduct, and organizational values.',
      category: 'POLICY',
      tags: ['onboarding', 'hr', 'policy', 'benefits'],
      uploadedBy: admin.id,
      isPublic: true,
    },
    {
      title: 'Software Development Best Practices',
      description: 'Coding standards, git workflow, code review guidelines, and deployment procedures for the IT team.',
      category: 'BEST_PRACTICE',
      tags: ['development', 'git', 'code-review', 'it'],
      uploadedBy: admin.id,
      isPublic: true,
    },
    {
      title: 'SQL Style Guide',
      description: 'Internal SQL formatting standards, naming conventions, and performance guidelines.',
      category: 'GUIDELINE',
      tags: ['sql', 'database', 'standards', 'technical'],
      uploadedBy: trainer1.id,
      isPublic: true,
    },
    {
      title: 'Leave Policy and Procedures',
      description: 'Detailed guide on annual leave, sick leave, maternity/paternity leave, and the application process.',
      category: 'POLICY',
      tags: ['hr', 'leave', 'policy'],
      uploadedBy: admin.id,
      isPublic: true,
    },
    {
      title: 'API Development Standards — TechNova',
      description: 'Internal API design standards: naming conventions, versioning, error responses, and authentication.',
      category: 'SOP',
      tags: ['api', 'rest', 'standards', 'technical'],
      uploadedBy: trainer1.id,
      isPublic: true,
    },
    {
      title: 'Performance Review FAQ',
      description: 'Answers to the most common questions about the annual performance review process.',
      category: 'FAQ',
      tags: ['hr', 'performance', 'review', 'faq'],
      uploadedBy: admin.id,
      isPublic: true,
    },
  ];

  for (const res of resourceData) {
    await prisma.knowledgeResource.create({ data: res });
  }
  log(`${resourceData.length} knowledge resources created`);

  // ── 13. NOTIFICATIONS ────────────────────────────────────────────────────────
  console.log('\n🔔 Creating notifications...');

  const notifications = [
    {
      userId: rahul.id,
      type: 'TRAINING_ASSIGNED',
      title: 'New Training Assigned',
      message: 'You have been assigned "SQL Fundamentals". Complete by 15 September 2026.',
      link: `/courses/${sqlFundamentals.id}`,
    },
    {
      userId: rahul.id,
      type: 'NEW_RECOMMENDATION',
      title: 'New Learning Recommendation',
      message: 'Based on your SQL skill gap, we recommend "Advanced SQL & Database Optimization".',
      link: '/recommendations',
    },
    {
      userId: rahul.id,
      type: 'ASSESSMENT_AVAILABLE',
      title: 'Assessment Available',
      message: 'Your SQL Competency Assessment is ready. Take it to identify your current level.',
      link: '/assessments',
      isRead: true,
    },
    {
      userId: rohan.id,
      type: 'COURSE_COMPLETED',
      title: 'Course Completed! 🎉',
      message: 'Congratulations! You have completed "SQL Fundamentals". Your SQL level has been updated.',
      link: '/my-learning',
    },
    {
      userId: rohan.id,
      type: 'TRAINING_ASSIGNED',
      title: 'New Training Assigned',
      message: 'You have been assigned "Data Analysis with Python". Complete by 30 September 2026.',
      link: `/courses/${dataAnalysis.id}`,
      isRead: true,
    },
    {
      userId: ananya.id,
      type: 'DEADLINE_APPROACHING',
      title: 'Training Deadline Approaching',
      message: '"Leadership & Team Management" is due in 7 days. You are 66% complete.',
      link: `/courses/${leadership.id}`,
    },
    {
      userId: ananya.id,
      type: 'NEW_RECOMMENDATION',
      title: 'New Learning Recommendation',
      message: 'A Leadership gap has been detected. We recommend the Leadership & Team Management course.',
      link: '/recommendations',
      isRead: true,
    },
    {
      userId: employees['neha@technova.com'].id,
      type: 'NEW_RESOURCE',
      title: 'New Knowledge Resource',
      message: 'A new resource "Software Development Best Practices" has been added to the Knowledge Hub.',
      link: '/knowledge-hub',
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }
  log(`${notifications.length} notifications created`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(55));
  console.log('\n✅ Seeding complete! TechNova Solutions is ready.\n');
  console.log('  Demo Credentials:');
  console.log('  ┌──────────────────────────────────────────────────┐');
  console.log('  │  Admin    admin@technova.com         Admin@123    │');
  console.log('  │  Trainer  priya.trainer@technova.com Trainer@123  │');
  console.log('  │  Employee rahul@technova.com         Employee@123 │');
  console.log('  │  Employee rohan@technova.com         Employee@123 │');
  console.log('  │  Employee ananya@technova.com        Employee@123 │');
  console.log('  └──────────────────────────────────────────────────┘');
  console.log('\n  SIH Demo Flow:');
  console.log('  1. Login as admin → see org-level skill gaps');
  console.log('  2. Login as rahul → see SQL gap (Level 2, Required: 4)');
  console.log('  3. Take SQL assessment → score 50% → Level 2');
  console.log('  4. System recommends SQL Fundamentals');
  console.log('  5. Complete course → post-assessment 82% → Level 4');
  console.log('  6. Admin dashboard shows +2 level improvement\n');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
