/**
 * src/pages/admin/AdminAssessments.jsx
 *
 * Admin Assessment & Submissions Command Center:
 * 1. Available Assessments: View all active competency tests configured in the system.
 * 2. Assessment Submissions: View and filter ALL submissions across the organization,
 *    distinguishing between EMPLOYEE and TRAINER attempts.
 * 3. Detail Pane: Inspect full metadata (score, level, answers breakdown, timestamps).
 *
 * Accessible to: ADMIN role
 * APIs:
 *   - GET /assessments (active catalog)
 *   - GET /assessments/all-attempts (workforce submissions with user.role)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Search,
  TrendingUp,
  Clock,
  Calendar,
  Building2,
  HelpCircle,
  ArrowRight,
  Filter,
  Shield,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssessmentsApi, getAllAttemptsApi } from '../../api/assessment.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

/** Translate numeric competency level to a human-readable label */
const levelLabel = (level) => {
  const map = { 1: 'Awareness', 2: 'Working', 3: 'Practitioner', 4: 'Expert' };
  return map[level] || `Level ${level}`;
};

/** Color classes for competency level badge */
const levelBadgeClass = (level) => {
  const map = {
    4: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    3: 'bg-blue-100 text-blue-800 border-blue-200',
    2: 'bg-amber-100 text-amber-800 border-amber-200',
    1: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  return map[level] || map[1];
};

/** Badge for user role (EMPLOYEE vs TRAINER vs ADMIN) */
const roleBadgeClass = (role) => {
  switch (role) {
    case 'TRAINER':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ADMIN':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'EMPLOYEE':
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // selected attempt id for detail panel
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL | EMPLOYEE | TRAINER

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [assessmentsData, allAttemptsData] = await Promise.all([
          getAssessmentsApi({ isActive: true }),
          getAllAttemptsApi(),
        ]);
        setAssessments(assessmentsData || []);
        setAttempts(allAttemptsData || []);
      } catch (err) {
        toast.error('Failed to load assessment data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter attempts by search string and role filter
  const filteredAttempts = attempts.filter((att) => {
    // Role filter
    if (roleFilter !== 'ALL' && att.user?.role !== roleFilter) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${att.user?.firstName} ${att.user?.lastName}`.toLowerCase();
    const title = att.assessment?.title?.toLowerCase() || '';
    const competency = att.assessment?.competency?.name?.toLowerCase() || '';
    const role = att.user?.role?.toLowerCase() || '';
    return (
      name.includes(q) ||
      title.includes(q) ||
      competency.includes(q) ||
      role.includes(q)
    );
  });

  const selectedAttempt = attempts.find((a) => a.id === expandedId);

  // Summary counts
  const totalSubmissions = attempts.length;
  const employeeSubmissionsCount = attempts.filter((a) => a.user?.role === 'EMPLOYEE').length;
  const trainerSubmissionsCount = attempts.filter((a) => a.user?.role === 'TRAINER').length;
  const passedCount = attempts.filter((a) => a.isPassed).length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalSubmissions)
      : 0;

  if (isLoading) {
    return <LoadingSpinner text="Loading organizational assessment results..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
              <Shield className="w-3.5 h-3.5" />
              Organizational Assessment Governance
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold">Assessment & Submission Command</h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-xl">
              Supervise all organizational competency evaluations. View submissions from both Employees and Trainers, monitor pass rates, and inspect proficiency levels.
            </p>
          </div>
        </div>

        {/* Summary KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200">Total Submissions</p>
            <p className="text-xl font-bold mt-0.5">{totalSubmissions}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200">Employee Tests</p>
            <p className="text-xl font-bold mt-0.5">{employeeSubmissionsCount}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-purple-200">Trainer Tests</p>
            <p className="text-xl font-bold mt-0.5">{trainerSubmissionsCount}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-emerald-300">Avg Score</p>
            <p className="text-xl font-bold mt-0.5">{avgScore}%</p>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: AVAILABLE ASSESSMENTS ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Configured Assessments ({assessments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Active competency evaluation frameworks available in the system
              </p>
            </div>
          </div>
        </div>

        {assessments.length === 0 ? (
          <EmptyState
            title="No assessments configured"
            description="Create assessments to evaluate workforce competencies."
            icon={FileCheck}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[130px]">
                      {a.competency?.name || 'General'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                      Pass: {a.passingScore}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-1 mb-1.5 line-clamp-1">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {a.description || 'Competency assessment test.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                    <div className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{a._count?.questions || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{a.timeLimitMin ? `${a.timeLimitMin}m` : 'Untimed'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{a._count?.attempts || 0} attempts</span>
                  </div>
                  <Link
                    to={`/admin/assessments/${a.id}/take`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Take Test <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* ── SECTION 2: ASSESSMENT SUBMISSIONS (EMPLOYEE & TRAINER) ──────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Assessment Submissions ({attempts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive log of all attempts submitted by Employees and Trainers
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Role Filter Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  roleFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({attempts.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('EMPLOYEE')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  roleFilter === 'EMPLOYEE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Employees ({employeeSubmissionsCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('TRAINER')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  roleFilter === 'TRAINER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Trainers ({trainerSubmissionsCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, assessment, role..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {attempts.length === 0 ? (
          <EmptyState
            title="No assessment submissions recorded"
            description="Workforce test attempts will appear here once submitted."
            icon={FileCheck}
          />
        ) : filteredAttempts.length === 0 ? (
          <EmptyState
            title="No matching submissions"
            description="Try changing the role filter or search keyword."
            icon={Search}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Submissions Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submissions List ({filteredAttempts.length})
                </h3>
                <span className="text-[11px] text-slate-400">Click row for full details</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttempts.map((att) => {
                      const isSelected = expandedId === att.id;
                      const role = att.user?.role || 'EMPLOYEE';

                      return (
                        <tr
                          key={att.id}
                          onClick={() => setExpandedId(isSelected ? null : att.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-l-2 border-l-blue-600'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                                {att.user?.firstName?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">
                                  {att.user?.firstName} {att.user?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {att.user?.department?.name || att.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass(
                                role
                              )}`}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 truncate max-w-[130px]">
                              {att.assessment?.title}
                            </p>
                            <p className="text-[10px] text-blue-600 font-medium">
                              {att.assessment?.competency?.name}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-bold text-slate-800">
                              {Math.round(att.score)}%
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {att.isPassed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                                <XCircle className="w-3.5 h-3.5" />
                                Needs Imp.
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Detail Panel */}
            <div>
              {selectedAttempt ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-20">
                  {/* User Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0">
                      {selectedAttempt.user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedAttempt.user?.firstName} {selectedAttempt.user?.lastName}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass(
                            selectedAttempt.user?.role || 'EMPLOYEE'
                          )}`}
                        >
                          {selectedAttempt.user?.role || 'EMPLOYEE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedAttempt.user?.jobTitle || selectedAttempt.user?.email}
                      </p>
                      {selectedAttempt.user?.department && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                          <Building2 className="w-3 h-3" />
                          {selectedAttempt.user.department.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assessment Info */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Assessment Details
                    </p>
                    <h4 className="text-sm font-bold text-slate-800">
                      {selectedAttempt.assessment?.title}
                    </h4>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      Competency: {selectedAttempt.assessment?.competency?.name}
                    </p>
                    {selectedAttempt.assessment?.course && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Linked Course: {selectedAttempt.assessment.course.title}
                      </p>
                    )}
                  </div>

                  {/* Score + Level Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-800">
                        {Math.round(selectedAttempt.score)}%
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Passing: {selectedAttempt.assessment?.passingScore || 60}%
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${levelBadgeClass(selectedAttempt.competencyLevel)}`}>
                        Level {selectedAttempt.competencyLevel} — {levelLabel(selectedAttempt.competencyLevel)}
                      </span>
                    </div>
                  </div>

                  {/* Status + Type */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Result</span>
                      {selectedAttempt.isPassed ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="w-3.5 h-3.5" /> Needs Improvement
                        </span>
                      )}
                    </div>

                    {selectedAttempt.isPreTraining && (
                      <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Type</span>
                        <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                          Pre-Training Baseline
                        </span>
                      </div>
                    )}
                    {selectedAttempt.isPostTraining && (
                      <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Type</span>
                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          Post-Training Evaluation
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Submitted At
                      </span>
                      <span className="font-semibold text-slate-700">
                        {selectedAttempt.completedAt
                          ? new Date(selectedAttempt.completedAt).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-10 flex flex-col items-center justify-center text-center text-slate-400">
                  <FileCheck className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm font-semibold">Select a submission</p>
                  <p className="text-xs mt-1">
                    Click any row in the submissions table to inspect attempt details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
