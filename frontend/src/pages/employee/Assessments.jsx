/**
 * src/pages/employee/Assessments.jsx — Assessment Center & Test History
 *
 * FUNCTIONAL NOTE: All API calls (getAssessmentsApi, getMyAttemptsApi),
 * state management, tab switching, and data rendering are preserved exactly.
 * Only visual layout/styling changed.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Award,
  Clock,
  HelpCircle,
  History,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssessmentsApi, getMyAttemptsApi } from '../../api/assessment.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState     from '../../components/common/EmptyState';

// Level badge config
const levelConfig = {
  4: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Expert' },
  3: { cls: 'bg-blue-50 text-blue-800 border-blue-200',          label: 'Proficient' },
  2: { cls: 'bg-amber-50 text-amber-800 border-amber-200',       label: 'Developing' },
  1: { cls: 'bg-slate-100 text-slate-800 border-slate-200',      label: 'Beginner' },
};

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts]       = useState([]);
  const [activeTab, setActiveTab]     = useState('AVAILABLE');
  const [isLoading, setIsLoading]     = useState(true);

  // ── Unchanged functional logic ────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assessmentsData, attemptsData] = await Promise.all([
        getAssessmentsApi({ isActive: true }),
        getMyAttemptsApi(),
      ]);
      setAssessments(assessmentsData);
      setAttempts(attemptsData);
    } catch {
      toast.error('Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  // ── End unchanged functional logic ────────────────────────────────────────

  const passedCount = attempts.filter((a) => a.isPassed).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Measure and certify your competency levels through structured assessments
          </p>
        </div>
        <Link
          to="/my-competencies"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Award className="w-4 h-4" />
          My Competencies
        </Link>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Available</p>
          <p className="text-3xl font-bold text-slate-800">{assessments.length}</p>
          <p className="text-xs text-slate-400 mt-1">active tests</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Attempted</p>
          <p className="text-3xl font-bold text-slate-800">{attempts.length}</p>
          <p className="text-xs text-slate-400 mt-1">total attempts</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-emerald-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Passed</p>
          <p className="text-3xl font-bold text-emerald-600">{passedCount}</p>
          <p className="text-xs text-slate-400 mt-1">assessments</p>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { key: 'AVAILABLE', label: 'Available', count: assessments.length, icon: FileCheck },
          { key: 'HISTORY',   label: 'My History', count: attempts.length,  icon: History },
        ].map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingSpinner text="Loading assessments…" />
      ) : activeTab === 'AVAILABLE' ? (
        assessments.length === 0 ? (
          <EmptyState
            title="No assessments available"
            description="There are currently no active competency assessments published."
            icon={FileCheck}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Top accent */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

                <div className="p-5 flex flex-col flex-1">
                  {/* Competency + pass score */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {a.competency?.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 shrink-0">
                      Pass: {a.passingScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {a.title}
                  </h3>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {a.description || 'Test your knowledge and evaluate your competency level.'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {a._count?.questions || 0} questions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {a.timeLimitMin ? `${a.timeLimitMin} min` : 'Untimed'}
                    </div>
                  </div>

                  <Link
                    to={`/assessments/${a.id}/take`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 group"
                  >
                    Start Assessment
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : attempts.length === 0 ? (
        <EmptyState
          title="No attempts yet"
          description="You haven't completed any assessments yet. Choose an available test to get started."
          icon={History}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assessment</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Competency</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => {
                  const lvl = levelConfig[att.competencyLevel] || levelConfig[1];
                  return (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{att.assessment?.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {att.isPostTraining && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Post-Training
                            </span>
                          )}
                          {att.isPreTraining && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              Pre-Training
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {att.assessment?.competency?.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-base font-bold text-slate-800">{Math.round(att.score)}%</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${lvl.cls}`}>
                          L{att.competencyLevel} · {lvl.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {att.isPassed ? (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-500">
                            <XCircle className="w-4 h-4" />
                            Not Passed
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-slate-400">
                        {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
