/**
 * src/routes/AppRouter.jsx — Application Routing Tree
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';

// Public Pages
import Login from '../pages/auth/Login';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Employees from '../pages/admin/Employees';
import Departments from '../pages/admin/Departments';
import Roles from '../pages/admin/Roles';
import Competencies from '../pages/admin/Competencies';
import AdminCourses from '../pages/admin/Courses';
import TrainingAssignments from '../pages/admin/TrainingAssignments';
import Analytics from '../pages/admin/Analytics';
import KnowledgeAdmin from '../pages/admin/KnowledgeAdmin';

// Trainer Pages
import TrainerAssessments from '../pages/trainer/TrainerAssessments';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyCompetencies from '../pages/employee/MyCompetencies';
import SkillGaps from '../pages/employee/SkillGaps';
import Recommendations from '../pages/employee/Recommendations';
import Courses from '../pages/employee/Courses';
import CourseDetail from '../pages/employee/CourseDetail';
import MyLearning from '../pages/employee/MyLearning';
import Assessments from '../pages/employee/Assessments';
import TakeAssessment from '../pages/employee/TakeAssessment';
import KnowledgeHub from '../pages/employee/KnowledgeHub';
import Notifications from '../pages/employee/Notifications';

// Unauthorized Page
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <div className="text-6xl mb-4">🔒</div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
    <p className="text-slate-500 mb-4">You do not have permission to view this page with your current account role.</p>
    <a
      href="/login"
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
    >
      Return to Login
    </a>
  </div>
);

// Smart Root Redirect based on role
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'TRAINER') return <Navigate to="/trainer/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<RootRedirect />} />

      {/* ── Employee Routes (role: EMPLOYEE or ADMIN) with EmployeeLayout ─────── */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']} />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/dashboard"             element={<EmployeeDashboard />} />
          <Route path="/my-profile"            element={<MyCompetencies />} />
          <Route path="/my-competencies"       element={<MyCompetencies />} />
          <Route path="/skill-gaps"            element={<SkillGaps />} />
          <Route path="/recommendations"       element={<Recommendations />} />
          <Route path="/courses"               element={<Courses />} />
          <Route path="/courses/:id"           element={<CourseDetail />} />
          <Route path="/my-learning"           element={<MyLearning />} />
          <Route path="/assessments"           element={<Assessments />} />
          <Route path="/assessments/:id/take"  element={<TakeAssessment />} />
          <Route path="/knowledge-hub"         element={<KnowledgeHub />} />
          <Route path="/notifications"         element={<Notifications />} />
        </Route>
      </Route>

      {/* ── Trainer Routes (role: TRAINER or ADMIN) with AdminLayout ───────────── */}
      <Route element={<ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/trainer/dashboard"          element={<AdminDashboard />} />
          <Route path="/trainer/courses"            element={<AdminCourses />} />
          <Route path="/trainer/courses/create"     element={<AdminCourses />} />
          <Route path="/trainer/courses/:id"        element={<AdminCourses />} />
          {/* Trainer-specific assessment results page (not the employee take-test page) */}
          <Route path="/trainer/assessments"        element={<TrainerAssessments />} />
          <Route path="/trainer/learners"           element={<Employees />} />
        </Route>
      </Route>

      {/* ── Admin Routes (role: ADMIN) with AdminLayout ───────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/employees"    element={<Employees />} />
          <Route path="/admin/departments"  element={<Departments />} />
          <Route path="/admin/roles"        element={<Roles />} />
          <Route path="/admin/competencies" element={<Competencies />} />
          <Route path="/admin/courses"      element={<AdminCourses />} />
          <Route path="/admin/training"     element={<TrainingAssignments />} />
          <Route path="/admin/analytics"    element={<Analytics />} />
          <Route path="/admin/knowledge"    element={<KnowledgeAdmin />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
