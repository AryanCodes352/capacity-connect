# CAPACITY CONNECT
### Intelligent Digital Capacity Building & Competency Management Platform
> **Smart India Hackathon (SIH) Comprehensive Technical & System Overview**

---

## 🌟 Executive Summary

**CAPACITY CONNECT** is a next-generation, data-driven Human Capital Development and Competency Management platform designed to transform how organizations measure, build, and track workforce capabilities.

### 🛑 The Industry Problem
Organizations invest billions annually in corporate training and professional development without knowing if the training actually worked. Traditional Learning Management Systems (LMS) only measure vanity metrics—such as course completion rates and attendance—failing to quantify actual **competency growth** or identify organizational **skill gaps**.

### 💡 The CAPACITY CONNECT Solution
CAPACITY CONNECT bridges the gap between **role requirements** and **actual employee proficiency** through an end-to-end closed-loop capability framework:
1. **Competency Benchmarking:** Every job role has clear, required proficiency levels (Levels 1–4).
2. **Objective Skill Gap Detection:** Assessments quantify an employee's exact current proficiency and automatically flag capability deficits.
3. **Personalized Rule-Based Recommendations:** The platform recommends targeted courses specifically designed to bridge the highest-severity gaps.
4. **Interactive LMS Learning:** Employees complete modular lessons in an interactive player with real-time progress tracking.
5. **Verified Capability Uplift (Training ROI):** Post-training assessments verify if competency levels upgraded, computing precise before-and-after score deltas and program ROI for leadership.

```
       ┌────────────────────────────────────────────────────────┐
       │               1. Role Competency Baseline              │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             2. Diagnostic Pre-Assessment               │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │               3. Skill Gap Calculation                 │
       │           Gap = max(0, Required - Current)             │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │           4. AI & Rule-Based Recommendation            │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │              5. Course Learning & LMS                  │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             6. Post-Training Assessment                │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │         7. Verified Competency Uplift & ROI            │
       │    Δ Level = (Post Level - Pre Level) → Heatmap Update │
       └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Architecture

### Backend Architecture
- **Runtime:** Node.js (v18+) with Express.js REST API
- **Database:** PostgreSQL with **Prisma 7 ORM** (`@prisma/adapter-pg` + `pg` connection pool)
- **Security & RBAC:** JWT (JSON Web Tokens) with HTTP-only cookies / Bearer headers, `bcryptjs` password encryption, role authorization middleware (`ADMIN`, `TRAINER`, `EMPLOYEE`), and parameterized SQL queries.
- **Validation & Error Handling:** `express-validator` middleware rules, custom `AppError` class, centralized `error.middleware.js`, and `asyncHandler` wrappers.

### Frontend Architecture
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 with modern slate/blue corporate theme
- **Routing:** React Router v7 with Smart Root Role Redirects and Protected Route Guards
- **Data Visualization:** Recharts (Grouped Bar Charts, Competency Heatmap Matrix)
- **Icons & UI:** Lucide React, `react-hot-toast` notifications, `react-hook-form` validation

---

## 🧠 Core Algorithms & Methodologies

### 1. The 4-Tier Competency Model
Assessment scores are deterministically converted into organizational competency levels:

$$\text{Level}(\text{Score}) = \begin{cases} 
1 \text{ (Beginner)} & 0\% \le \text{Score} < 40\% \\
2 \text{ (Elementary)} & 40\% \le \text{Score} < 60\% \\
3 \text{ (Intermediate)} & 60\% \le \text{Score} < 80\% \\
4 \text{ (Advanced)} & 80\% \le \text{Score} \le 100\%
\end{cases}$$

### 2. Skill Gap Calculation Engine
For each competency assigned to an employee's organizational role:

$$\text{Skill Gap} = \max(0, \text{Required Level} - \text{Current Evaluated Level})$$

$$\text{Severity Priority} = \begin{cases} 
\text{CRITICAL} & \text{Gap} \ge 3 \\
\text{HIGH} & \text{Gap} = 2 \\
\text{MEDIUM} & \text{Gap} = 1 \\
\text{NONE} & \text{Gap} = 0
\end{cases}$$

### 3. Rule-Based Course Recommendation Algorithm
1. Scans the employee's active skill gaps ordered by severity ($\text{Critical} \rightarrow \text{High} \rightarrow \text{Medium}$).
2. Matches published courses that have `CourseCompetency` mappings targeting those competencies with `targetLevel >= currentLevel`.
3. Automatically filters out courses where the employee has already achieved $100\%$ completion.
4. Generates transparent rationales (e.g. *"Addresses your SQL gap (Level 2 → 4)"*).
5. Persists rankings in the database and delivers them to the employee's dashboard.

### 4. Training Effectiveness & ROI Engine
Evaluates real skill acquisition by linking pre-training baseline attempts to post-training evaluation attempts:

$$\Delta \text{Score} = \text{Post-Training Score} - \text{Pre-Training Score}$$

$$\Delta \text{Level} = \text{Post-Training Competency Level} - \text{Pre-Training Competency Level}$$

$$\text{Program Impact} = \begin{cases} 
\text{HIGH IMPACT} & \Delta \text{Level} \ge 2 \\
\text{MODERATE IMPACT} & \Delta \text{Level} = 1 \\
\text{NO CHANGE} & \Delta \text{Level} = 0
\end{cases}$$

---

## 👥 Persona-Wise Feature Matrix

### 👑 1. HR Admin & Leadership Portal
- **Executive Command Dashboard:** Real-time metrics on total workforce, active competencies, open skill gaps, and average level uplift.
- **Department Competency Heatmap:** Color-coded matrix showing capability health across all departments (Engineering, Data & Analytics, Product & Design, Human Resources).
- **Training Effectiveness & ROI:** Recharts before-and-after score comparison charts, individual learner growth trajectory cards, and course ROI rankings.
- **Training Governance:** Assign courses to individual employees or entire departments with completion deadlines and dynamic `OVERDUE` tracking.
- **Taxonomy Management:** Full CRUD over Departments, Roles, Competencies (4-tier scales), and Role Benchmarks.
- **Knowledge Asset Governance:** Publish and manage organizational SOPs, whitepapers, and policies.

### 👨‍💻 2. Employee (Learner) Portal
- **Learner Dashboard:** Overview of personal competency levels, active skill gap alerts, and active course progress bars.
- **Skill Gaps Analysis:** Detailed breakdown of required vs. current levels with step visualizers and severity badges.
- **Personalized Recommendations:** Rule-matched learning pathways with 1-click enrollment and clear "Why recommended" callouts.
- **Interactive LMS Player:** Split-screen learning player with modular curriculum sidebar, content viewer (video, document, text), and real-time completion tracking to $100\%$.
- **Assessment Center:** Timed diagnostic pre-assessments and post-training evaluations with instant level upgrade awards.
- **Knowledge Hub:** Searchable library of company SOPs, coding guidelines, and technical whitepapers with download tracking.
- **In-App Notification Center:** Real-time alerts for training assignments, upcoming deadlines, and competency upgrades.
- **AI Capacity Assistant:** Floating conversational mentor for personalized advice and gap analysis.

### 👩‍🏫 3. Trainer & Content Creator Portal
- **Course & Curriculum Builder:** Multi-tiered course creation (`Course` $\rightarrow$ `CourseModule` $\rightarrow$ `Lesson`) with target competency tags.
- **Assessment & Question Bank:** Diagnostic and post-training test configuration with randomized question pools.
- **Learner Analytics:** Track student progress, enrollment volume, and evaluation scores.

---

## 🗄️ Database Entity Relationship (ER) Schema

The application utilizes 20+ interconnected PostgreSQL tables managed through Prisma 7:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Department    │1     *│      User       │*     1│     OrgRole     │
│─────────────────│───────│─────────────────│───────│─────────────────│
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name            │       │ email           │       │ name            │
│ code            │       │ role (ENUM)     │       │ departmentId    │
└─────────────────┘       │ departmentId    │       └────────┬────────┘
                          │ roleId          │                │1
                          └────────┬────────┘                │
                                   │1                        │*
                                   │                ┌────────┴────────┐
                                   │                │ RoleCompetency  │
                                   │                │─────────────────│
                                   │                │ roleId          │
                                   │                │ competencyId    │
                                   │                │ requiredLevel   │
                                   │                └────────┬────────┘
                                   │                         │*
                                   │*                        │1
                          ┌────────┴────────┐       ┌────────┴────────┐
                          │    SkillGap     │*     1│   Competency    │
                          │─────────────────│───────│─────────────────│
                          │ userId          │       │ id (PK)         │
                          │ competencyId    │       │ name            │
                          │ currentLevel    │       │ category        │
                          │ requiredLevel   │       │ level1Desc      │
                          │ gap             │       │ level2Desc      │
                          │ priority (ENUM) │       │ level3Desc      │
                          └─────────────────┘       │ level4Desc      │
                                                    └────────┬────────┘
                                                             │1
                                                             │*
┌─────────────────┐       ┌─────────────────┐       ┌────────┴────────┐
│   Enrollment    │*     1│     Course      │1     *│CourseCompetency │
│─────────────────│───────│─────────────────│───────│─────────────────│
│ id (PK)         │       │ id (PK)         │       │ courseId        │
│ userId          │       │ title           │       │ competencyId    │
│ courseId        │       │ difficulty      │       │ targetLevel     │
│ progressPct     │       │ trainerId       │       └─────────────────┘
│ completedAt     │       └────────┬────────┘
└─────────────────┘                │1
                                   │*
                          ┌────────┴────────┐
                          │  CourseModule   │1     *┌─────────────────┐
                          │─────────────────│───────│     Lesson      │
                          │ id (PK)         │       │─────────────────│
                          │ courseId        │       │ id (PK)         │
                          │ title           │       │ moduleId        │
                          │ orderIndex      │       │ title           │
                          └─────────────────┘       │ type (ENUM)     │
                                                    │ content         │
                                                    └─────────────────┘
```

---

## 📡 RESTful API Endpoints Summary

| Group | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | User login & JWT issuance | Public |
| | `GET` | `/api/auth/me` | Current authenticated user profile | Authenticated |
| **Users** | `GET` | `/api/users` | List employees with filters & pagination | Admin, Trainer |
| | `POST` | `/api/users` | Create employee account | Admin |
| **Departments** | `GET` | `/api/departments` | List all departments with staff count | Authenticated |
| **Roles** | `GET` | `/api/roles` | List roles with competency benchmarks | Authenticated |
| **Competencies**| `GET` | `/api/competencies` | 4-tier competency catalog | Authenticated |
| | `GET` | `/api/competencies/my-profile` | Employee evaluated competency profile | Employee |
| **Assessments** | `GET` | `/api/assessments` | Assessment catalog & history | Authenticated |
| | `GET` | `/api/assessments/:id/take` | Fetch test questions (answers hidden) | Authenticated |
| | `POST` | `/api/assessments/:id/submit` | Auto-grade test & award competency level | Authenticated |
| **Skill Gaps** | `GET` | `/api/skill-gaps/my-gaps` | Employee calculated skill gaps | Employee |
| | `GET` | `/api/skill-gaps/organization-summary` | Org-level gap statistics | Admin, Trainer |
| | `GET` | `/api/skill-gaps/department-breakdown` | Department gap breakdown | Admin, Trainer |
| **Courses** | `GET` | `/api/courses` | Filterable course library | Authenticated |
| | `GET` | `/api/courses/:id` | Full syllabus & lesson structure | Authenticated |
| | `POST` | `/api/courses` | Create new course program | Admin, Trainer |
| **Enrollments** | `POST` | `/api/enrollments/enroll` | Enroll employee in course | Authenticated |
| | `GET` | `/api/enrollments/my-courses` | User active course enrollments | Authenticated |
| | `PATCH`| `/api/enrollments/lessons/:id/toggle-progress` | Toggle lesson & recalculate progress % | Authenticated |
| **Recommendations**| `GET` | `/api/recommendations` | Personalized rule-matched courses | Authenticated |
| | `POST` | `/api/recommendations/refresh` | Recalculate recommendations | Authenticated |
| **Training** | `GET` | `/api/training` | All training assignments & overdue check | Admin |
| | `POST` | `/api/training/assign` | Individual or department bulk assign | Admin |
| **Analytics** | `GET` | `/api/analytics/dashboard-metrics` | Top-level organizational KPIs | Authenticated |
| | `GET` | `/api/analytics/effectiveness` | Pre vs. Post score & level deltas | Authenticated |
| | `GET` | `/api/analytics/courses-roi` | Course capability ROI rankings | Authenticated |
| | `GET` | `/api/analytics/department-heatmap` | Department competency heatmap matrix | Admin, Trainer |
| **Knowledge** | `GET` | `/api/knowledge` | Filterable SOPs & Whitepapers | Authenticated |
| | `POST` | `/api/knowledge` | Publish organizational asset | Admin, Trainer |
| **Notifications**| `GET` | `/api/notifications` | User in-app notifications | Authenticated |
| | `PATCH`| `/api/notifications/mark-all-read`| Mark all notifications read | Authenticated |
| **AI Assistant**| `POST` | `/api/ai/chat` | Context-aware AI mentoring response | Authenticated |

---

## 🏆 Official 7-Step SIH Live Presentation & Demo Flow

To demonstrate the full power of CAPACITY CONNECT during an evaluation, follow this sequential narrative:

| Step | Persona | Action & URL | Key Presentation Talking Point |
|---|---|---|---|
| **1** | **HR Admin** | Login as `aditya@technova.com` (`Admin@123`) $\rightarrow$ Navigate to `/admin/dashboard` & `/admin/analytics` | Show the **Department Competency Heatmap**. Point out that the Engineering Department has critical capability deficits in *SQL Database Optimization*. |
| **2** | **Employee** | Logout $\rightarrow$ Login as `rahul@technova.com` (`Employee@123`) $\rightarrow$ Navigate to `/skill-gaps` | Show Rahul's calculated profile: Current SQL is **Level 2 (Elementary)**, but his Software Developer role requires **Level 4 (Advanced)** $\rightarrow$ Identified **-2 Level Gap (High Priority)**. |
| **3** | **Pre-Test** | Navigate to `/assessments` $\rightarrow$ Select *SQL Database Optimization Assessment* $\rightarrow$ Take test | Run through the interactive test runner with real-time countdown timer $\rightarrow$ Score $50\% \rightarrow$ System evaluates and confirms **Level 2**. |
| **4** | **Recommendations** | Navigate to `/recommendations` | Explain the deterministic recommendation rule: System automatically prioritizes **"SQL Fundamentals"** with the rationale *"Addresses your SQL gap (Level 2 → 4)"*. Click **Enroll & Start**. |
| **5** | **LMS Player** | Navigate to `/my-learning` | Open the interactive course player. Step through modules and click **Mark as Completed**. When progress reaches $100\%$, an animated completion banner unlocks the post-training evaluation. |
| **6** | **Post-Test** | Navigate to `/assessments` $\rightarrow$ Select *SQL Post-Training Evaluation* $\rightarrow$ Take test | Score $82\% \rightarrow$ System immediately awards **Level 4 (Advanced)** and resets the skill gap to $0$! |
| **7** | **ROI Proof** | Logout $\rightarrow$ Login as `aditya@technova.com` $\rightarrow$ Navigate to `/admin/analytics` | Present the verified **+2 Level Growth** trajectory for Rahul Sharma, $+32\%$ score uplift, and show SQL training ranked #1 in the **Course Capability ROI Rankings**! |
| **Bonus** | **AI Assistant** | Click the floating **AI Assistant** button in bottom-right | Ask *"Analyze my skill gaps"* to demonstrate real-time contextual AI mentoring. |

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **PostgreSQL Database:** Running locally (port 5432) or hosted on Cloud (Neon/Supabase)

### 2. Backend Setup
```bash
cd capacity-connect/backend

# Install dependencies
npm install

# Configure environment variables (.env)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/capacity_connect_db?schema=public"
# JWT_SECRET="super-secret-jwt-key"
# PORT=5000

# Push Prisma schema to PostgreSQL & Seed demo organization
npx prisma db push
npm run seed

# Start development server
npm run dev
```
Backend API will be running on `http://localhost:5000/api`.

### 3. Frontend Setup
```bash
cd capacity-connect/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| **System Admin / HR** | Aditya Admin | `aditya@technova.com` | `Admin@123` |
| **Technical Trainer** | Priya Trainer | `priya.trainer@technova.com` | `Trainer@123` |
| **Software Developer (Learner)** | Rahul Sharma | `rahul@technova.com` | `Employee@123` |
| **Frontend Engineer (Learner)** | Priya Patel | `priya.dev@technova.com` | `Employee@123` |
| **DevOps Engineer (Learner)** | Deepak Kumar | `deepak@technova.com` | `Employee@123` |
| **Data Analyst (Learner)** | Ananya Singh | `ananya@technova.com` | `Employee@123` |

---

## 🎯 Measurable Impact & Future Roadmap

1. **Measurable Training ROI:** Replaces subjective feedback forms with verified competency level upgrades.
2. **Targeted Upskilling:** Eliminates wasted training hours by matching employees only with courses addressing their active deficits.
3. **Automated Succession Planning:** Enables leadership to search for internal talent by verified competency levels rather than arbitrary resumes.
4. **Future AI Enhancements:** Integration of LLM-generated dynamic quizzes, automated code grading for technical exercises, and external LMS sync (SCORM/xAPI).

---

*Developed for the Smart India Hackathon (SIH).*
