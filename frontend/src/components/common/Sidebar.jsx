/**
 * src/components/common/Sidebar.jsx
 */

import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/roles', label: 'Org Roles', icon: Briefcase },
    { to: '/admin/competencies', label: 'Competencies', icon: Award },
    { to: '/admin/courses', label: 'Courses & LMS', icon: BookOpen },
    { to: '/admin/training', label: 'Training Assignments', icon: GraduationCap },
    { to: '/admin/analytics', label: 'Analytics & Heatmap', icon: BarChart3 },
    { to: '/admin/knowledge', label: 'Knowledge Hub', icon: FileText },
  ];

  const trainerLinks = [
    { to: '/trainer/dashboard', label: 'Trainer Dashboard', icon: LayoutDashboard },
    { to: '/trainer/courses', label: 'My Courses', icon: BookOpen },
    { to: '/trainer/courses/create', label: 'Create Course', icon: FolderKanban },
    { to: '/trainer/assessments', label: 'Assessments', icon: FileCheck },
    { to: '/trainer/learners', label: 'Learner Analytics', icon: Users },
  ];

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-competencies', label: 'My Competencies', icon: Award },
    { to: '/skill-gaps', label: 'Skill Gaps', icon: Target },
    { to: '/recommendations', label: 'Recommendations', icon: Compass },
    { to: '/courses', label: 'Explore Courses', icon: BookOpen },
    { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
    { to: '/assessments', label: 'Assessments', icon: FileCheck },
    { to: '/knowledge-hub', label: 'Knowledge Hub', icon: FileText },
  ];

  const getLinks = () => {
    if (role === 'ADMIN') return adminLinks;
    if (role === 'TRAINER') return trainerLinks;
    return employeeLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand logo & name */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">CAPACITY CONNECT</h2>
          <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
            {role || 'Portal'}
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Navigation
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-300 text-center">
        <p className="font-semibold text-slate-300">Smart India Hackathon</p>
        <p className="text-[10px] mt-0.5">Capacity Building Platform</p>
      </div>
    </aside>
  );
}
