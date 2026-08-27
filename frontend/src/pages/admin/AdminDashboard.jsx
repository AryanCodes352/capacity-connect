/**
 * src/pages/admin/AdminDashboard.jsx — Admin Overview Dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardMetricsApi, getDepartmentHeatmapApi } from '../../api/analytics.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading organizational capacity overview..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Organizational Governance Overview
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold">TechNova Solutions — Capacity Command</h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-xl">
              Monitor organizational competency baselines, identify cross-departmental skill deficits, and track workforce training ROI in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              View ROI Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={metrics?.totalEmployees || 6}
          subtitle={`${metrics?.totalDepartments || 4} Departments active`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Competencies"
          value={metrics?.totalCompetencies || 13}
          subtitle="4-Level proficiency scale"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Critical Skill Gaps"
          value={metrics?.activeSkillGaps || 5}
          subtitle="Targeted for capacity building"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Avg Competency Uplift"
          value={`+${metrics?.avgCompetencyGrowth || 1.8} Levels`}
          subtitle="Verified via post-assessments"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/training"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Assign Training Programs
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mandate capability courses to specific departments or employees with completion deadlines.
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-4">
            Manage Assignments <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          to="/admin/competencies"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Competency Taxonomy
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Define 4-level competency scales and assign required proficiency standards to organizational roles.
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-purple-600 mt-4">
            Configure Framework <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Department Heatmap & ROI
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect cross-department capability gap matrices and evaluate before-and-after score improvements.
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4">
            Explore Heatmap <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* Department Gap Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Departmental Capability Summary
          </h2>
          <Link to="/admin/analytics" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View Full Matrix →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heatmap.map((dept) => (
            <div key={dept.departmentId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 text-sm">{dept.departmentName}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {dept.totalEmployees} Staff
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Avg Gap Score: <strong className="text-slate-800">{dept.averageGapScore}</strong>
              </p>
              <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-slate-200">
                <span className="text-rose-600 font-bold">{dept.criticalGaps} Critical</span>
                <span className="text-slate-300">·</span>
                <span className="text-orange-600 font-bold">{dept.highGaps} High</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
