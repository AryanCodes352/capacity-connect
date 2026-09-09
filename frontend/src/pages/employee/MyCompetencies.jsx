/**
 * src/pages/employee/MyCompetencies.jsx — Employee Competency Profile Page
 */

import { useState, useEffect } from 'react';
import { Award, Target, CheckCircle, AlertCircle, ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyCompetenciesApi } from '../../api/competency.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function MyCompetencies() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, GAPS_ONLY, COMPLETED

  const fetchCompetencies = async () => {
    try {
      setIsLoading(true);
      const res = await getMyCompetenciesApi();
      setData(res);
    } catch (err) {
      toast.error('Failed to load your competency profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 4: return 'bg-emerald-500 text-white';
      case 3: return 'bg-blue-500 text-white';
      case 2: return 'bg-amber-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getGapPriorityBadge = (gapInfo) => {
    if (!gapInfo || gapInfo.gap === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" />
          No Gap (Target Met)
        </span>
      );
    }

    const priority = gapInfo.priority;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.bgColor} ${priority.textColor} border`}>
        <AlertCircle className="w-3.5 h-3.5" />
        Gap {gapInfo.gap} ({priority.label})
      </span>
    );
  };

  const competencies = data?.competencies || [];

  const filteredCompetencies = competencies.filter((c) => {
    if (filter === 'GAPS_ONLY') return c.gapInfo && c.gapInfo.gap > 0;
    if (filter === 'COMPLETED') return c.gapInfo && c.gapInfo.gap === 0;
    return true;
  });

  const totalRequired = competencies.filter((c) => c.isRoleRequired).length;
  const gapsCount = competencies.filter((c) => c.gapInfo && c.gapInfo.gap > 0).length;
  const metCount = totalRequired - gapsCount;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Competency Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            {data?.user?.orgRole ? `Role: ${data.user.orgRole}` : 'Track your capability levels vs. role requirements'}
          </p>
        </div>
        <Link
          to="/assessments"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Award className="w-4 h-4" />
          Take Assessment
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Required</p>
          <p className="text-3xl font-bold text-slate-800">{totalRequired}</p>
          <p className="text-xs text-slate-400 mt-1">role competencies</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-emerald-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Met</p>
          <p className="text-3xl font-bold text-emerald-600">{metCount}</p>
          <p className="text-xs text-slate-400 mt-1">target levels reached</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-amber-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Gaps</p>
          <p className="text-3xl font-bold text-amber-600">{gapsCount}</p>
          <p className="text-xs text-slate-400 mt-1">need attention</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-1">
          {[
            { key: 'ALL', label: `All (${competencies.length})` },
            { key: 'GAPS_ONLY', label: `Gaps (${gapsCount})` },
            { key: 'COMPLETED', label: `Met (${metCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                filter === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Link
          to="/recommendations"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 transition-colors"
        >
          View Recommendations →
        </Link>
      </div>

      {/* Competencies List */}
      {isLoading ? (
        <LoadingSpinner text="Analyzing your competency profile…" />
      ) : filteredCompetencies.length === 0 ? (
        <EmptyState
          title="No competencies found"
          description="No competency items match the selected filter."
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCompetencies.map((comp) => {
            const current = comp.currentLevel || 1;
            const required = comp.requiredLevel || 4;
            const progressPercent = Math.min(100, Math.round((current / required) * 100));

            return (
              <div
                key={comp.competencyId}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {comp.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">
                        {comp.name}
                      </h3>
                    </div>
                    {getGapPriorityBadge(comp.gapInfo)}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4">
                    {comp.description}
                  </p>

                  {/* Level Comparison Card */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-xs block">Current Proficiency</span>
                        <span className="font-bold text-slate-800 text-sm">
                          Level {current} — {comp.levelLabel}
                        </span>
                      </div>
                      {comp.requiredLevel !== null && (
                        <div className="text-right">
                          <span className="text-slate-400 text-xs block">Role Required</span>
                          <span className="font-bold text-blue-600 text-sm">
                            Level {required}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                        <span>Proficiency Match</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            current >= required ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">
                    {comp.assessedAt
                      ? `Last assessed on ${new Date(comp.assessedAt).toLocaleDateString()}`
                      : 'Pending initial assessment'}
                  </span>

                  {comp.gapInfo && comp.gapInfo.gap > 0 ? (
                    <Link
                      to="/recommendations"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Close Gap
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Proficient
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
