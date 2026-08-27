/**
 * src/pages/employee/Assessments.jsx — Assessment Center & Test History
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
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssessmentsApi, getMyAttemptsApi } from '../../api/assessment.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('AVAILABLE'); // AVAILABLE | HISTORY
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assessmentsData, attemptsData] = await Promise.all([
        getAssessmentsApi({ isActive: true }),
        getMyAttemptsApi(),
      ]);
      setAssessments(assessmentsData);
      setAttempts(attemptsData);
    } catch (err) {
      toast.error('Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getLevelBadge = (level) => {
    const map = {
      4: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      3: 'bg-blue-100 text-blue-800 border-blue-200',
      2: 'bg-amber-100 text-amber-800 border-amber-200',
      1: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return map[level] || map[1];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs text-blue-100 mb-2 border border-white/10">
              <FileCheck className="w-3.5 h-3.5" />
              Competency Evaluation Center
            </span>
            <h2 className="text-2xl font-bold">Skills & Competency Assessments</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Take assessments to measure and update your organizational competency levels. Scores are automatically translated to proficiency levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/my-competencies"
              className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Award className="w-4 h-4" />
              My Competencies
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200">Available Tests</p>
            <p className="text-xl font-bold mt-0.5">{assessments.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200">Total Attempts</p>
            <p className="text-xl font-bold mt-0.5">{attempts.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-emerald-300">Passed Tests</p>
            <p className="text-xl font-bold mt-0.5">
              {attempts.filter((a) => a.isPassed).length}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'AVAILABLE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Available Assessments ({assessments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Attempt History ({attempts.length})</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner text="Loading assessments..." />
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
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {a.competency?.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Pass: {a.passingScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-1 mb-2">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {a.description || 'Test your knowledge and evaluate your competency level.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>{a._count?.questions || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{a.timeLimitMin ? `${a.timeLimitMin} mins` : 'Untimed'}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/assessments/${a.id}/take`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )
      ) : attempts.length === 0 ? (
        <EmptyState
          title="No attempts recorded"
          description="You haven't completed any assessments yet. Choose an available assessment to get started."
          icon={History}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Assessment</th>
                  <th className="px-4 py-3.5">Competency</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Level Achieved</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      {att.assessment?.title}
                      {att.isPostTraining && (
                        <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Post-Training
                        </span>
                      )}
                      {att.isPreTraining && (
                        <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Pre-Training
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {att.assessment?.competency?.name}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {Math.round(att.score)}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${getLevelBadge(att.competencyLevel)}`}>
                        Level {att.competencyLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {att.isPassed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                          <XCircle className="w-3.5 h-3.5" />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400">
                      {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
