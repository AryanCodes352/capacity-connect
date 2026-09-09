/**
 * src/components/common/Sidebar.jsx
 *
 * Desktop (≥768px): Always visible inline sidebar (w-64)
 * Mobile (<768px):  Slide-in drawer with backdrop overlay
 *
 * FUNCTIONAL NOTE: All NavLink routes, useAuth(), and onClose callbacks
 * are preserved exactly. Only visual styling is changed.
 */

import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Award,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  Compass,
  Target,
  FileCheck,
  FolderKanban,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Navigation link definitions ────────────────────────────────────────────

const adminLinks = [
  {
    group: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Organization',
    items: [
      { to: '/admin/employees', label: 'Employees', icon: Users },
      { to: '/admin/departments', label: 'Departments', icon: Building2 },
      { to: '/admin/roles', label: 'Org Roles', icon: Briefcase },
      { to: '/admin/competencies', label: 'Competencies', icon: Award },
    ],
  },
  {
    group: 'Learning',
    items: [
      { to: '/admin/courses', label: 'Courses & LMS', icon: BookOpen },
      { to: '/admin/assessments', label: 'Assessments', icon: FileCheck },
      { to: '/admin/training', label: 'Training Assignments', icon: GraduationCap },
      { to: '/admin/knowledge', label: 'Knowledge Hub', icon: FileText },
    ],
  },
  {
    group: 'Insights',
    items: [
      { to: '/admin/analytics', label: 'Analytics & Heatmap', icon: BarChart3 },
    ],
  },
];

const trainerLinks = [
  {
    group: 'Overview',
    items: [
      { to: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Teaching',
    items: [
      { to: '/trainer/courses', label: 'My Courses', icon: BookOpen },
      { to: '/trainer/courses/create', label: 'Create Course', icon: FolderKanban },
      { to: '/trainer/assessments', label: 'Assessments', icon: FileCheck },
    ],
  },
  {
    group: 'Students',
    items: [
      { to: '/trainer/learners', label: 'Learner Analytics', icon: Users },
    ],
  },
];

const employeeLinks = [
  {
    group: 'Home',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Learning',
    items: [
      { to: '/courses', label: 'Explore Courses', icon: BookOpen },
      { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
      { to: '/assessments', label: 'Assessments', icon: FileCheck },
      { to: '/knowledge-hub', label: 'Knowledge Hub', icon: FileText },
    ],
  },
  {
    group: 'My Skills',
    items: [
      { to: '/my-competencies', label: 'My Competencies', icon: Award },
      { to: '/skill-gaps', label: 'Skill Gaps', icon: Target },
      { to: '/recommendations', label: 'Recommendations', icon: Compass },
    ],
  },
];

// ── Role badge colors ───────────────────────────────────────────────────────
const roleMeta = {
  ADMIN:    { label: 'Admin Portal',   dot: 'bg-purple-400' },
  TRAINER:  { label: 'Trainer Portal', dot: 'bg-blue-400' },
  EMPLOYEE: { label: 'Employee Portal', dot: 'bg-emerald-400' },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const linkGroups =
    role === 'ADMIN' ? adminLinks :
    role === 'TRAINER' ? trainerLinks :
    employeeLinks;

  const meta = roleMeta[role] || roleMeta.EMPLOYEE;

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      {/* ── Brand Header ── */}
      <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white tracking-wide leading-none">
              Capacity Connect
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {meta.label}
              </p>
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {linkGroups.map((group) => (
          <div key={group.group} className="mb-1 px-3">
            {/* Group label */}
            <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 select-none">
              {group.group}
            </p>

            {/* Group links */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Group divider */}
            <div className="mt-3 border-t border-slate-800/60" />
          </div>
        ))}
      </nav>

      {/* ── User Footer ── */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-none">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible inline sidebar ── */}
      <div className="hidden md:flex md:shrink-0">
        {sidebarContent}
      </div>

      {/* ── Mobile: drawer overlay ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
