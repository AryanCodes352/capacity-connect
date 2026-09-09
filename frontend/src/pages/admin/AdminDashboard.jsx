/**
 * src/pages/admin/AdminDashboard.jsx — Admin / Trainer Overview Dashboard
 *
 * FUNCTIONAL NOTE: All API calls (getDashboardMetricsApi, getDepartmentHeatmapApi),
 * state management, and data rendering are preserved exactly.
 * Only visual layout/styling changed. Role-awareness for TRAINER added via
 * visual-only useAuth() check — no new API calls.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Building2,
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  BarChart3,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardMetricsApi, getDepartmentHeatmapApi } from '../../api/analytics.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';

// Gap severity → bg color for heatmap cells
const heatmapColor = (score) => {
  if (score >= 2.5) return 'border-l-rose-500 bg-rose-50';
  if (score >= 1.5) return 'border-l-amber-500 bg-amber-50';
  if (score >= 0.5) return 'border-l-yellow-400 bg-yellow-50';
  return 'border-l-emerald-500 bg-emerald-50';
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const role     = user?.role;
  const isTrainer = role === 'TRAINER';

  const [metrics, setMetrics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Unchanged functional logic ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [mRes, hRes] = await Promise.all([
          getDashboardMetricsApi(),
          getDepartmentHeatmapApi(),
        ]);
        setMetrics(mRes);
        setHeatmap(hRes);
      } catch {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  // ── End unchanged functional logic ────────────────────────────────────────

  if (isLoading) return <LoadingSpinner text="Loading organizational capacity overview…" />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-blue-300 text-sm font-medium">
                {isTrainer ? '👨‍🏫 Trainer Portal' : '🛡️ Admin Console'}
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {isTrainer ? 'Training Dashboard' : 'Capacity Command Center'}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                {isTrainer
                  ? 'Manage your courses, track learner progress, and publish assessments.'
                  : 'Monitor organizational competency baselines, identify cross-departmental skill gaps, and track training effectiveness.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {isTrainer ? (
                <>
                  <Link
                    to="/trainer/courses"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </Link>
                  <Link
                    to="/trainer/assessments"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    Assessments
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/analytics"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Analytics
                  </Link>
                  <Link
                    to="/admin/training"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Assign Training
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="Total Workforce"
            value={metrics?.totalEmployees || 0}
            subtitle={`${metrics?.totalDepartments || 0} departments`}
            icon={Users}
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="Active Competencies"
            value={metrics?.totalCompetencies || 0}
            subtitle="4-level proficiency scale"
            icon={Award}
            color="purple"
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="Critical Skill Gaps"
            value={metrics?.activeSkillGaps || 0}
            subtitle="Targeted for development"
            icon={AlertTriangle}
            color="red"
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <StatCard
            title="Avg Competency Uplift"
            value={`+${metrics?.avgCompetencyGrowth || 0}`}
            subtitle="Levels via post-assessments"
            icon={TrendingUp}
            color="green"
          />
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(isTrainer ? [
            {
              to: '/trainer/courses',
              icon: BookOpen,
              color: 'blue',
              title: 'Manage Courses',
              desc: 'Create, update, and organize your course content and curriculum modules.',
            },
            {
              to: '/trainer/assessments',
              icon: FileCheck,
              color: 'violet',
              title: 'Assessments',
              desc: 'Publish competency assessments, manage questions, and review submissions.',
            },
            {
              to: '/trainer/learners',
              icon: Users,
              color: 'emerald',
              title: 'Learner Analytics',
              desc: 'Track enrollment progress, performance trends, and course completion rates.',
            },
          ] : [
            {
              to: '/admin/training',
              icon: GraduationCap,
              color: 'blue',
              title: 'Assign Training',
              desc: 'Mandate capability courses to departments or individuals with deadlines.',
            },
            {
              to: '/admin/competencies',
              icon: Award,
              color: 'violet',
              title: 'Competency Taxonomy',
              desc: 'Define proficiency scales and assign required levels to organizational roles.',
            },
            {
              to: '/admin/analytics',
              icon: BarChart3,
              color: 'emerald',
              title: 'Analytics & Heatmap',
              desc: 'Inspect department gap matrices and evaluate training effectiveness ROI.',
            },
          ]).map(({ to, icon: Icon, color, title, desc }) => {
            const colorMap = {
              blue:   { icon: 'bg-blue-50 text-blue-600', arrow: 'text-blue-600', hover: 'group-hover:text-blue-600' },
              violet: { icon: 'bg-violet-50 text-violet-600', arrow: 'text-violet-600', hover: 'group-hover:text-violet-600' },
              emerald: { icon: 'bg-emerald-50 text-emerald-600', arrow: 'text-emerald-600', hover: 'group-hover:text-emerald-600' },
            };
            const c = colorMap[color] || colorMap.blue;
            return (
              <Link
                key={to}
                to={to}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base font-semibold text-slate-900 mb-1.5 transition-colors ${c.hover}`}>
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium mt-5 ${c.arrow}`}>
                  Go to {title}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Department Capability Summary (Admin only) ─────────────────── */}
      {!isTrainer && heatmap.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Departmental Capability Summary</h2>
            </div>
            <Link
              to="/admin/analytics"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Full Matrix <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmap.map((dept) => {
              const colorCls = heatmapColor(dept.averageGapScore);
              return (
                <div
                  key={dept.departmentId}
                  className={`border border-l-4 rounded-xl p-4 space-y-2 ${colorCls}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800 text-sm">{dept.departmentName}</p>
                    <span className="text-xs font-medium text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">
                      {dept.totalEmployees} staff
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Avg Gap Score: <strong className="text-slate-800">{dept.averageGapScore}</strong>
                  </p>
                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-200">
                    <span className="text-rose-700 font-semibold">{dept.criticalGaps} Critical</span>
                    <span className="text-amber-700 font-semibold">{dept.highGaps} High</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
