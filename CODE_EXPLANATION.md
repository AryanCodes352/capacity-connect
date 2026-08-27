# CAPACITY CONNECT — Code-by-Code Technical Architecture Guide
> **In-depth, file-by-file, function-by-function technical breakdown of the entire platform.**

---

## 📂 Project Directory Structure

```
capacity-connect/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma 7 Data Models (20+ entities)
│   │   ├── seed.js                 # Realistic TechNova org seeder
│   │   └── prisma.config.js        # Prisma 7 configuration file
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Prisma client singleton with pg pool adapter
│   │   ├── utils/
│   │   │   ├── apiResponse.js      # Standardized JSON response formatting
│   │   │   ├── asyncHandler.js     # Async error wrapper
│   │   │   ├── competencyLevel.js  # Single source of truth for levels & gaps
│   │   │   └── jwt.util.js         # JWT signing & verification
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT validation & user attachment
│   │   │   ├── role.middleware.js  # RBAC guard (restrictTo)
│   │   │   ├── error.middleware.js # Global 404 & AppError exception handler
│   │   │   └── validate.middleware.js # express-validator bridge
│   │   ├── validators/             # Input validation schemas
│   │   ├── services/               # Core business logic layer
│   │   ├── controllers/            # HTTP request/response orchestrators
│   │   ├── routes/                 # Express route mappings
│   │   └── app.js                  # Express application root & middleware
│   └── server.js                   # Node HTTP server entrypoint
│
└── frontend/
    ├── src/
    │   ├── api/                    # Axios API client functions
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global authentication & user state
    │   ├── routes/
    │   │   ├── AppRouter.jsx       # Route tree & smart role redirects
    │   │   └── ProtectedRoute.jsx  # RBAC route guard
    │   ├── layouts/
    │   │   ├── AdminLayout.jsx     # Sidebar + Navbar + Floating AI
    │   │   └── EmployeeLayout.jsx  # Learner navigation layout
    │   ├── components/common/      # Reusable UI components
    │   │   ├── Navbar.jsx          # Top bar with live notification popover
    │   │   ├── Sidebar.jsx         # Responsive sidebar navigation
    │   │   ├── AIChatModal.jsx     # Floating AI Assistant widget
    │   │   ├── StatCard.jsx        # Standardized KPI metric card
    │   │   └── ConfirmDialog.jsx   # Modal confirmation dialog
    │   └── pages/
    │       ├── auth/Login.jsx      # Authentication screen
    │       ├── admin/              # Admin/Trainer portal pages
    │       └── employee/           # Learner portal pages
```

---

## 🧱 1. Backend Core Infrastructure & Utilities

### 1.1 Database Connection Singleton
📁 [`backend/src/config/database.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/config/database.js)

```javascript
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// 1. Create a PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Initialize Prisma 7 Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Export single PrismaClient instance
const prisma = new PrismaClient({ adapter });
module.exports = prisma;
```
- **Why this code exists:** Prisma 7 utilizes Driver Adapters to support high-performance connection pooling via `pg.Pool`. This file creates a single database connection across all modules, preventing connection leaks.

---

### 1.2 Single Source of Truth for Competency Logic
📁 [`backend/src/utils/competencyLevel.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/utils/competencyLevel.js)

```javascript
// Maps assessment percentage scores to Competency Levels (1-4)
function scoreToLevel(score) {
  const numScore = Number(score);
  if (numScore >= 80) return 4; // Advanced
  if (numScore >= 60) return 3; // Intermediate
  if (numScore >= 40) return 2; // Elementary
  return 1;                     // Beginner
}

// Calculates exact skill gap: max(0, required - current)
function calculateGap(requiredLevel, currentLevel) {
  const req = Math.max(1, Math.min(4, parseInt(requiredLevel, 10) || 1));
  const cur = Math.max(1, Math.min(4, parseInt(currentLevel, 10) || 1));
  return Math.max(0, req - cur);
}

// Calculates severity priority based on gap magnitude
function getGapPriority(gap) {
  if (gap >= 3) return 'CRITICAL';
  if (gap === 2) return 'HIGH';
  if (gap === 1) return 'MEDIUM';
  return 'NONE';
}
```
- **Why this code exists:** Ensures mathematical consistency across the entire codebase—assessments, skill gaps, recommendation filters, and analytics all use the exact same formulas.

---

### 1.3 Centralized Response & Error Middleware
📁 [`backend/src/utils/apiResponse.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/utils/apiResponse.js) & [`backend/src/middleware/error.middleware.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/middleware/error.middleware.js)

```javascript
// Standardizes all JSON responses
function sendSuccess(res, statusCode = 200, message = 'Success', data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

// Global Exception Handler
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```
- **Why this code exists:** Guarantees that the frontend always receives a uniform JSON structure: `{ success: true|false, message, data }`.

---

## ⚙️ 2. Business Logic Layer (Services Deep-Dive)

### 2.1 Assessment Engine & Auto-Grading
📁 [`backend/src/services/assessment.service.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/services/assessment.service.js)

#### 🔹 `getAssessmentForTaking(assessmentId)`
```javascript
// Strips 'isCorrect' flags from questions before sending to the browser
const assessment = await prisma.assessment.findUnique({
  where: { id: assessmentId },
  include: {
    questions: {
      select: {
        id: true,
        text: true,
        type: true,
        options: {
          select: { id: true, text: true, orderIndex: true } // isCorrect OMITTED!
        }
      }
    }
  }
});
```
- **Security Design:** Prevents learners from inspecting client-side network payloads to cheat on assessments.

#### 🔹 `submitAssessment(userId, assessmentId, userAnswers)`
```javascript
// 1. Fetch official questions with true answers
const questions = await prisma.question.findMany({
  where: { assessmentId },
  include: { options: true }
});

// 2. Compute score
let correctCount = 0;
for (const q of questions) {
  const correctOpt = q.options.find(o => o.isCorrect);
  if (userAnswers[q.id] === correctOpt?.id) {
    correctCount++;
  }
}
const score = (correctCount / questions.length) * 100;

// 3. Convert score to Competency Level (1-4)
const awardedLevel = scoreToLevel(score);

// 4. Save Attempt & Update Skill Gap table immediately
await prisma.assessmentAttempt.create({
  data: { userId, assessmentId, score, competencyLevel: awardedLevel }
});
await syncUserSkillGaps(userId);
```

---

### 2.2 Skill Gap Detection Engine
📁 [`backend/src/services/skillGap.service.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/services/skillGap.service.js)

```javascript
async function calculateAndPersistUserGaps(userId) {
  // 1. Fetch user's role benchmark requirements
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orgRole: {
        include: { roleCompetencies: { include: { competency: true } } }
      }
    }
  });

  for (const rc of user.orgRole.roleCompetencies) {
    // 2. Fetch user's highest evaluated level from assessment attempts
    const latestAttempt = await prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        assessment: { competencyId: rc.competencyId }
      },
      orderBy: { completedAt: 'desc' }
    });

    const currentLevel = latestAttempt?.competencyLevel || 1;
    const requiredLevel = rc.requiredLevel;
    const gap = calculateGap(requiredLevel, currentLevel);
    const priority = getGapPriority(gap);

    // 3. Upsert into SkillGap table
    await prisma.skillGap.upsert({
      where: { userId_competencyId: { userId, competencyId: rc.competencyId } },
      update: { currentLevel, requiredLevel, gap, priority },
      create: { userId, competencyId: rc.competencyId, currentLevel, requiredLevel, gap, priority }
    });
  }
}
```
- **Why this code exists:** Bridges the gap between what an employee's role expects vs. what their actual evaluated skill is, keeping the matrix updated dynamically.

---

### 2.3 Rule-Based Recommendation Engine
📁 [`backend/src/services/recommendation.service.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/services/recommendation.service.js)

```javascript
async function generateRecommendationsForUser(userId) {
  // 1. Query active skill gaps ordered by severity (CRITICAL -> HIGH -> MEDIUM)
  const gaps = await getEmployeeGaps(userId);
  const activeGaps = gaps.filter(g => g.gap > 0);

  // 2. Fetch courses the user already finished (100% progress)
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { userId, progressPct: 100 },
    select: { courseId: true }
  });
  const completedIds = new Set(completedEnrollments.map(e => e.courseId));

  let rank = 1;
  const recommendations = [];

  // 3. Match published courses targeting the gapped competencies
  for (const gap of activeGaps) {
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        competencies: { some: { competencyId: gap.competencyId } }
      }
    });

    for (const course of courses) {
      if (completedIds.has(course.id)) continue;

      const reason = `Addresses your ${gap.competencyName} gap (Current: Level ${gap.currentLevel} → Target: Level ${gap.requiredLevel}).`;

      // Upsert recommendation
      await prisma.recommendation.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        update: { rank, reason, isDismissed: false },
        create: { userId, courseId: course.id, rank, reason }
      });

      recommendations.push({ course, rank, reason });
      rank++;
    }
  }
  return recommendations;
}
```

---

### 2.4 Training Effectiveness & Analytics Engine
📁 [`backend/src/services/analytics.service.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/services/analytics.service.js)

```javascript
async function getTrainingEffectivenessData() {
  // 1. Group assessment attempts by user & competency
  const allAttempts = await prisma.assessmentAttempt.findMany({
    include: { user: true, assessment: { include: { competency: true, course: true } } },
    orderBy: { completedAt: 'asc' }
  });

  // 2. Correlate Pre-Training vs Post-Training attempts
  const comparisons = [];
  // For each user + competency:
  // preAttempt = isPreTraining === true (e.g. 50%, Level 2)
  // postAttempt = isPostTraining === true (e.g. 82%, Level 4)

  const scoreDelta = postAttempt.score - preAttempt.score;         // +32%
  const levelDelta = postAttempt.competencyLevel - preAttempt.competencyLevel; // +2 Levels

  comparisons.push({
    user: postAttempt.user,
    competencyName: postAttempt.assessment.competency.name,
    preScore: preAttempt.score,
    postScore: postAttempt.score,
    scoreDelta,
    preLevel: preAttempt.competencyLevel,
    postLevel: postAttempt.competencyLevel,
    levelDelta,
    impact: levelDelta >= 2 ? 'HIGH_IMPACT' : 'MODERATE_IMPACT'
  });

  return { summary: { avgScoreIncrease, avgLevelGrowth }, comparisons };
}
```
- **Why this code exists:** This computes the core proof of training ROI for leadership, demonstrating measurable capability growth.

---

## 🎨 3. Frontend Component & Flow Breakdown

### 3.1 Interactive Assessment Runner
📁 [`frontend/src/pages/employee/TakeAssessment.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/pages/employee/TakeAssessment.jsx)

- **Countdown Timer:** Decrements every second using `setInterval`. When time expires, it auto-submits the candidate's answers.
- **Question Navigation Matrix:** Shows answered vs. unanswered question bubbles allowing jumping between questions.
- **Evaluation Modal:** Upon submission, opens an animated modal showing:
  - Percentage Score achieved
  - Awarded Competency Level badge (Level 1–4)
  - Level descriptor defining what the learner is now capable of.

---

### 3.2 Interactive LMS Course Player
📁 [`frontend/src/pages/employee/MyLearning.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/pages/employee/MyLearning.jsx)

- **Split-Screen Workspace:**
  - **Left Sidebar:** Modular curriculum stepper (`Module` $\rightarrow$ `Lesson`) with completed checkmarks.
  - **Right Content Viewer:** Renders video players, PDF/document viewers, or text articles based on `lesson.type`.
- **Live Progress Recalculation:** Clicking "Mark as Completed" calls `toggleLessonProgressApi`, which recalculates overall course completion % in real time.
- **Post-Assessment Prompt:** When progress reaches $100\%$, triggers a celebratory banner prompting the learner to take the post-training evaluation to upgrade their organizational level.

---

### 3.3 Recharts ROI Analytics Dashboard
📁 [`frontend/src/pages/admin/Analytics.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/pages/admin/Analytics.jsx)

- **Grouped Bar Chart:** Uses `ResponsiveContainer`, `BarChart`, `Bar`, `Tooltip` to visually display Pre-Training Score vs. Post-Training Score across learners.
- **Competency Growth Highlights:** Displays individual learner trajectories (e.g. Rahul Sharma: $+2$ Levels Growth, $+32\%$ score uplift).
- **Department Competency Heatmap Matrix:** Visual grid of departments with average gap scores and color-coded alert badges (Critical, High, Medium).

---

### 3.4 Floating AI Capacity Assistant
📁 [`frontend/src/components/common/AIChatModal.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/components/common/AIChatModal.jsx)

- **Global Presence:** Mounted directly in `AdminLayout` and `EmployeeLayout` as a floating launcher in the bottom right corner.
- **Quick Prompt Pills:** One-click prompt suggestions (*"Analyze my skill gaps"*, *"What courses are recommended?"*).
- **Context-Aware Replies:** The backend AI service inspects the user's role and calculated skill gaps to provide tailored career and learning advice.

---

## 🔄 4. End-to-End Data Flow Sequence (The "Rahul" Journey)

```
1. Admin opens /admin/analytics
   └─> Fetches /api/analytics/department-heatmap
       └─> Heatmap reveals Engineering has a critical gap in SQL Database Optimization.

2. Rahul logs in at /login
   └─> AuthContext stores JWT in localStorage & axios headers.
   └─> Redirected to /dashboard -> Navigates to /skill-gaps.
   └─> Backend compares Role Requirement (L4) vs Current (L2) -> Displays "-2 Level Gap (High Priority)".

3. Rahul takes SQL Pre-Assessment at /assessments/:id/take
   └─> Questions delivered with isCorrect omitted.
   └─> Rahul answers -> Submits to /api/assessments/:id/submit.
   └─> Backend grades 50% -> Awards Level 2 (Elementary).

4. Rahul checks /recommendations
   └─> Recommendation Engine matches SQL gap with "SQL Fundamentals".
   └─> Rahul clicks "Enroll & Start" -> calls /api/enrollments/enroll.

5. Rahul completes lessons in /my-learning
   └─> Toggles lesson completion -> /api/enrollments/lessons/:id/toggle-progress.
   └─> Progress reaches 100% -> Completion timestamp saved -> Post-assessment unlocked.

6. Rahul takes Post-Training Assessment
   └─> Scores 82% -> Backend awards Level 4 (Advanced).
   └─> SkillGap table updated: Gap = max(0, 4 - 4) = 0!

7. Admin opens /admin/analytics
   └─> Training Effectiveness table displays Rahul Sharma:
       Pre-Test: 50% (Level 2) | Post-Test: 82% (Level 4) | Growth: +2 Levels (+32% Uplift)
   └─> Department Heatmap updates in real-time, showing gap closure!
```

---

## 🔒 5. Authentication, Security & RBAC Implementation

### 5.1 Password Hashing & JWT Generation
📁 [`backend/src/utils/jwt.util.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/utils/jwt.util.js) & [`backend/src/services/auth.service.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/services/auth.service.js)

```javascript
// 1. Password verification during Login
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  const err = new Error('Invalid email or password');
  err.statusCode = 401;
  throw err;
}

// 2. JWT Signing with claims
const token = jwt.sign(
  { id: user.id, role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### 5.2 Request Authentication & Route Guards
📁 [`backend/src/middleware/auth.middleware.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/middleware/auth.middleware.js) & [`backend/src/middleware/role.middleware.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/backend/src/middleware/role.middleware.js)

```javascript
// Auth Middleware: Extracts token & validates user active status
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authenticated. Please log in.', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, departmentId: true, isActive: true }
  });

  if (!user || !user.isActive) throw new AppError('User is no longer active.', 401);

  req.user = user; // Attach user to request object
  next();
});

// Role Guard: Restricts endpoint to specific personas
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  };
};
```

---

## 🗄️ 6. Prisma Database Models (Table-by-Table Breakdown)

| Model Name | Primary Key | Key Relations | Purpose |
|---|---|---|---|
| `User` | `id (UUID)` | `Department`, `OrgRole`, `Enrollments`, `SkillGaps`, `Attempts` | System accounts with role (`ADMIN`, `TRAINER`, `EMPLOYEE`), hashed password, job title. |
| `Department` | `id (UUID)` | `Users`, `OrgRoles` | Organizational divisions (Engineering, Data & Analytics, Product & Design, HR). |
| `OrgRole` | `id (UUID)` | `Department`, `RoleCompetencies`, `Users` | Job positions with department association (e.g. Software Developer, DevOps Engineer). |
| `Competency` | `id (UUID)` | `RoleCompetencies`, `CourseCompetencies`, `Assessments` | Skills catalog with 4 detailed level descriptors (`level1Desc`, `level2Desc`, `level3Desc`, `level4Desc`). |
| `RoleCompetency` | `id (UUID)` | `OrgRole`, `Competency` | Mapping table defining required minimum level (1–4) for a role. |
| `SkillGap` | `id (UUID)` | `User`, `Competency` | Dynamic record storing evaluated level, required level, gap score, and priority badge. |
| `Assessment` | `id (UUID)` | `Competency`, `Course`, `Questions`, `Attempts` | Test wrapper with duration minutes, passing score, and pre/post training flags. |
| `Question` & `QuestionOption` | `id (UUID)` | `Assessment`, `QuestionOptions` | Assessment questions (MCQ) with true/false `isCorrect` flags and order indexes. |
| `AssessmentAttempt` | `id (UUID)` | `User`, `Assessment`, `AttemptAnswers` | Records of user test submissions, percentage scores, and awarded competency levels. |
| `Course` | `id (UUID)` | `Trainer (User)`, `Modules`, `CourseCompetencies`, `Enrollments` | Capacity training programs with difficulty, category, and target competency mappings. |
| `CourseModule` & `Lesson` | `id (UUID)` | `Course`, `Lessons`, `UserLessonProgress` | Multi-tiered course curriculum hierarchy supporting video, document, and text lessons. |
| `Enrollment` | `id (UUID)` | `User`, `Course` | Learner course registration with `progressPct` (0–100%) and `completedAt` timestamp. |
| `Recommendation` | `id (UUID)` | `User`, `Course`, `Competency` | Deterministic recommendations ranked by gap severity with explanation strings. |
| `TrainingAssignment`| `id (UUID)` | `User`, `Course`, `AssignedBy (User)` | Admin mandated training with deadlines and dynamic status (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`). |
| `KnowledgeResource`| `id (UUID)` | `Author (User)`, `Competency` | Organizational repository for SOPs, whitepapers, policies, and templates with download counters. |
| `Notification` | `id (UUID)` | `User` | In-app alerts for assignments, evaluation results, and deadline warnings. |

---

## 💻 7. Frontend State Management & Lifecycle

### 7.1 Automatic Token Injection & 401 Interception
📁 [`frontend/src/api/axios.config.js`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/api/axios.config.js)

```javascript
// Request Interceptor: Automatically injects JWT into Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Redirects to /login on 401 Unauthenticated
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 7.2 Protected Route Guard & Smart Root Redirect
📁 [`frontend/src/routes/ProtectedRoute.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/routes/ProtectedRoute.jsx) & [`frontend/src/routes/AppRouter.jsx`](file:///C:/Users/DELL/OneDrive/Desktop/sih/capacity-connect/frontend/src/routes/AppRouter.jsx)

```javascript
// Checks authentication and role authorization
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner text="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Smart Root Redirect based on user persona
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'TRAINER') return <Navigate to="/admin/courses" replace />;
  return <Navigate to="/dashboard" replace />;
}
```

---

## ❓ 8. Technical Judge Q&A / FAQs

### Q1: How is Training ROI mathematically proven in Capacity Connect?
> **Answer:** Unlike conventional LMS platforms that measure seat time or attendance, Capacity Connect evaluates learners through paired diagnostic assessments:
> 1. **Baseline Pre-Assessment:** Determines starting competency level $L_{\text{pre}}$ (e.g. Rahul at $50\% \rightarrow \text{Level 2}$).
> 2. **Post-Training Evaluation:** Measures skill mastery $L_{\text{post}}$ after $100\%$ course completion (e.g. Rahul at $82\% \rightarrow \text{Level 4}$).
> 3. **ROI Uplift:** The platform computes $\Delta \text{Level} = L_{\text{post}} - L_{\text{pre}} = +2\text{ Levels}$, updating the organization's department heatmap and proving that the skill gap was closed.

### Q2: How do you prevent candidates from cheating on assessments?
> **Answer:** We employ strict backend data stripping in `assessment.service.js`:
> When `GET /api/assessments/:id/take` is called, the server deliberately omits the `isCorrect` boolean property from all question options before returning the JSON payload to the client. Question evaluation happens strictly on the backend during `POST /api/assessments/:id/submit`.

### Q3: Why did you use Prisma 7 Driver Adapters?
> **Answer:** Prisma 7 separates the client query engine from raw database connections through Driver Adapters (`@prisma/adapter-pg` + `pg.Pool`). This enables native PostgreSQL connection pooling, lower memory overhead, sub-millisecond query execution, and compatibility with modern serverless/edge environments.

### Q4: How does the AI Assistant operate without breaking if an external LLM API is down?
> **Answer:** The AI Assistant in `ai.service.js` uses a resilient design: it directly queries the user's live role and competency graph to generate deterministic, structured mentoring insights (skill gap summaries, course suggestions, scoring scale explanations), with seamless fallback capabilities.

---

*CAPACITY CONNECT — Complete Code-by-Code Technical Documentation.*

