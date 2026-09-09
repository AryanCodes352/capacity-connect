/**
 * src/pages/trainer/TrainerAssessments.jsx
 *
 * Trainer assessment management & results dashboard:
 * 1. Available Assessments: View all active competency assessments and take them.
 * 2. My Assessment Attempts: View the Trainer's own completed assessment attempts & scores.
 * 3. Employee Submissions: View and oversee all employee assessment attempts and scores.
 *
 * Accessible to: TRAINER and ADMIN roles
 * APIs:
 *   - GET /assessments (active assessments catalog)
 *   - GET /assessments/my-attempts (logged-in user's attempts)
 *   - GET /assessments/all-attempts (all workforce submissions)
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
  History,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAssessmentsApi,
  getMyAttemptsApi,
  getAllAttemptsApi,
} from '../../api/assessment.api';
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

export default function TrainerAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [employeeAttempts, setEmployeeAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // selected attempt id for detail panel
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [assessmentsData, myAttemptsData, allAttemptsData] = await Promise.all([
          getAssessmentsApi({ isActive: true }),
          getMyAttemptsApi(),
          getAllAttemptsApi(),
        ]);
        setAssessments(assessmentsData || []);
        setMyAttempts(myAttemptsData || []);
        // Employee submissions (filter for role === 'EMPLOYEE' or all non-self submissions)
        const empOnly = (allAttemptsData || []).filter(
          (a) => a.user?.role === 'EMPLOYEE' || !a.user?.role
        );
        setEmployeeAttempts(empOnly.length > 0 ? empOnly : (allAttemptsData || []));
      } catch (err) {
        toast.error('Failed to load trainer assessment data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter employee submissions by employee name, assessment title, or competency
  const filteredEmployeeAttempts = employeeAttempts.filter((att) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${att.user?.firstName} ${att.user?.lastName}`.toLowerCase();
    const title = att.assessment?.title?.toLowerCase() || '';
    const competency = att.assessment?.competency?.name?.toLowerCase() || '';
    return name.includes(q) || title.includes(q) || competency.includes(q);
  });

  const selectedAttempt = employeeAttempts.find((a) => a.id === expandedId);

  // Summary stats
  const totalSubmissions = employeeAttempts.length;
  const passedCount = employeeAttempts.filter((a) => a.isPassed).length;
  const uniqueEmployees = new Set(employeeAttempts.map((a) => a.userId)).size;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          employeeAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalSubmissions
        )
      : 0;

  if (isLoading) {
    return <LoadingSpinner text="Loading trainer assessments & submissions..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
              <FileCheck className="w-3.5 h-3.5" />
              Trainer Assessment Management
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold">Assessments & Results</h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-xl">
              Take competency assessments to evaluate your own skills, and review employee submissions, scores, and proficiency levels in real-time.
            </p>
          </div>
        </div>

        {/* Summary KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-xs text-blue-200">Available Assessments</p>
            <p className="text-xl font-bold mt-0.5">{assessments.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-xs text-blue-200">My Completed Tests</p>
            <p className="text-xl font-bold mt-0.5">{myAttempts.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-xs text-blue-200">Employee Submissions</p>
            <p className="text-xl font-bold mt-0.5">{totalSubmissions}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-xs text-emerald-300">Avg Employee Score</p>
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
                Available Assessments ({assessments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Choose any active assessment to test and calibrate your competency
              </p>
            </div>
          </div>
        </div>

        {assessments.length === 0 ? (
          <EmptyState
            title="No assessments available"
            description="There are currently no active competency assessments published."
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
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[130px]">
                      {a.competency?.name || 'General'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      Pass: {a.passingScore}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-1 mb-1.5 line-clamp-1">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {a.description || 'Competency assessment and evaluation test.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
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

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{a._count?.attempts || 0} total attempts</span>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </div>

                  <Link
                    to={`/trainer/assessments/${a.id}/take`}
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Start Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2: TRAINER'S OWN ASSESSMENT ATTEMPTS ────────────────── */}
      {myAttempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                My Assessment Attempts ({myAttempts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Your personal competency assessment history and scores
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3">Assessment</th>
                    <th className="px-4 py-3">Competency</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Level Achieved</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {att.assessment?.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {att.assessment?.competency?.name}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {Math.round(att.score)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${levelBadgeClass(att.competencyLevel)}`}>
                          Level {att.competencyLevel} — {levelLabel(att.competencyLevel)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {att.isPassed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                            <XCircle className="w-3.5 h-3.5" />
                            Needs Improvement
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <hr className="border-slate-200" />

      {/* ── SECTION 3: EMPLOYEE SUBMISSIONS & RESULTS ────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Employee Submissions ({employeeAttempts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review scores, competency levels, and test histories for employees
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, assessment, competency..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {employeeAttempts.length === 0 ? (
          <EmptyState
            title="No employee assessment submissions yet"
            description="Employee submissions will appear here once employees complete competency assessments."
            icon={FileCheck}
          />
        ) : filteredEmployeeAttempts.length === 0 ? (
          <EmptyState
            title="No results match your search"
            description="Try a different name, assessment title, or competency."
            icon={Search}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Results Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submissions List ({filteredEmployeeAttempts.length})
                </h3>
                <span className="text-xs text-slate-400">Click a row for details</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployeeAttempts.map((att) => {
                      const isSelected = expandedId === att.id;
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
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {att.user?.firstName?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">
                                  {att.user?.firstName} {att.user?.lastName}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {att.user?.department?.name || att.user?.jobTitle || att.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 truncate max-w-[140px]">
                              {att.assessment?.title}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {att.assessment?.competency?.name}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800">
                              {Math.round(att.score)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {att.isPassed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                                <XCircle className="w-3.5 h-3.5" />
                                Needs Improvement
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
                  {/* Employee Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0">
                      {selectedAttempt.user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedAttempt.user?.firstName} {selectedAttempt.user?.lastName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedAttempt.user?.jobTitle || selectedAttempt.user?.email}
                      </p>
                      {selectedAttempt.user?.department && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                          <Building2 className="w-3 h-3" />
                          {selectedAttempt.user.department.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assessment Info */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</p>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-800">
                        {Math.round(selectedAttempt.score)}%
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Passing: {selectedAttempt.assessment?.passingScore || 60}%
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Level</p>
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
                        <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                          Pre-Training Baseline
                        </span>
                      </div>
                    )}
                    {selectedAttempt.isPostTraining && (
                      <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Type</span>
                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
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
                    Click any row in the table on the left to inspect attempt details
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
