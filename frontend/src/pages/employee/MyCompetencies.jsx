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
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs text-blue-100 mb-2 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              Assigned Role: {data?.user?.orgRole || 'Software Developer'}
            </span>
            <h2 className="text-2xl font-bold">{data?.user?.name}'s Competency Profile</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Track your evaluated capability levels against the baseline requirements of your organizational role.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/assessments"
              className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Award className="w-4 h-4" />
              Take Assessment
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200">Role Competencies</p>
            <p className="text-xl font-bold mt-0.5">{totalRequired}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-emerald-300">Target Level Met</p>
            <p className="text-xl font-bold mt-0.5">{metCount}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-amber-300">Skill Gaps Identified</p>
            <p className="text-xl font-bold mt-0.5">{gapsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Competencies ({competencies.length})
          </button>
          <button
            onClick={() => setFilter('GAPS_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'GAPS_ONLY'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Skill Gaps ({gapsCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Target Met ({metCount})
          </button>
        </div>

        <Link
          to="/recommendations"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View Recommended Learning</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Competencies List */}
      {isLoading ? (
        <LoadingSpinner text="Analyzing your competency profile..." />
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                        <span className="text-slate-400 text-[11px] block">Current Proficiency</span>
                        <span className="font-bold text-slate-800 text-sm">
                          Level {current} — {comp.levelLabel}
                        </span>
                      </div>
                      {comp.requiredLevel !== null && (
                        <div className="text-right">
                          <span className="text-slate-400 text-[11px] block">Role Required</span>
                          <span className="font-bold text-blue-600 text-sm">
                            Level {required}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
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
                  <span className="text-[11px] text-slate-400">
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
