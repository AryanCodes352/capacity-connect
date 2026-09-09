/**
 * src/pages/employee/SkillGaps.jsx — Employee Skill Gap Analysis Dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMySkillGapsApi } from '../../api/skillGap.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function SkillGaps() {
  const [gaps, setGaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchGaps = async () => {
    try {
      setIsLoading(true);
      const data = await getMySkillGapsApi();
      setGaps(data);
    } catch (err) {
      toast.error('Failed to load skill gap analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const criticalGaps = gaps.filter((g) => g.priority === 'CRITICAL');
  const highGaps = gaps.filter((g) => g.priority === 'HIGH');
  const mediumGaps = gaps.filter((g) => g.priority === 'MEDIUM');
  const noGaps = gaps.filter((g) => g.priority === 'NONE' || g.gap === 0);

  const filteredGaps = gaps.filter((g) => {
    if (priorityFilter === 'GAPS_ONLY') return g.gap > 0;
    if (priorityFilter === 'HIGH_CRITICAL') return g.priority === 'HIGH' || g.priority === 'CRITICAL';
    if (priorityFilter === 'NONE') return g.gap === 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Gap Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gaps between your current proficiency and role requirements
          </p>
        </div>
        <Link
          to="/recommendations"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          Recommended Courses
        </Link>
      </div>

      {/* Severity stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-l-4 border-rose-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Critical</p>
          <p className="text-3xl font-bold text-rose-600">{criticalGaps.length}</p>
          <p className="text-xs text-slate-400 mt-1">gap ≥ 3 levels</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-orange-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">High</p>
          <p className="text-3xl font-bold text-orange-600">{highGaps.length}</p>
          <p className="text-xs text-slate-400 mt-1">gap of 2 levels</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-amber-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Medium</p>
          <p className="text-3xl font-bold text-amber-600">{mediumGaps.length}</p>
          <p className="text-xs text-slate-400 mt-1">gap of 1 level</p>
        </div>
        <div className="bg-white rounded-2xl border border-l-4 border-emerald-500 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Met</p>
          <p className="text-3xl font-bold text-emerald-600">{noGaps.length}</p>
          <p className="text-xs text-slate-400 mt-1">target reached</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'ALL',           label: `All (${gaps.length})` },
            { key: 'HIGH_CRITICAL', label: `High & Critical (${highGaps.length + criticalGaps.length})` },
            { key: 'GAPS_ONLY',     label: `All Gaps (${gaps.filter((g) => g.gap > 0).length})` },
            { key: 'NONE',          label: `Proficient (${noGaps.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPriorityFilter(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                priorityFilter === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Link
          to="/assessments"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 shrink-0 transition-colors"
        >
          <Award className="w-4 h-4" />
          Retake Assessment →
        </Link>
      </div>

      {/* Skill Gaps Cards */}
      {isLoading ? (
        <LoadingSpinner text="Computing skill gap severity metrics..." />
      ) : filteredGaps.length === 0 ? (
        <EmptyState
          title="No skill gaps in this filter"
          description="Great job! There are no competencies matching this gap severity filter."
          icon={CheckCircle2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGaps.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-0.5">
                      {item.competencyName}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.bgColor} ${item.textColor}`}
                  >
                    {item.gap === 0 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        No Gap
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Gap: -{item.gap} ({item.priorityLabel})
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {item.description || 'Target competency defined for organizational capability development.'}
                </p>

                {/* Level Comparison Bars */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-xs block">Current Level</span>
                      <span className="font-bold text-slate-800 text-sm">
                        Level {item.currentLevel} ({item.currentLevelInfo?.label})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-xs block">Required Level</span>
                      <span className="font-bold text-blue-600 text-sm">
                        Level {item.requiredLevel} ({item.requiredLevelInfo?.label})
                      </span>
                    </div>
                  </div>

                  {/* Visual Step Tracker (Levels 1 to 4) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[1, 2, 3, 4].map((step) => {
                      const isCurrent = step <= item.currentLevel;
                      const isRequired = step <= item.requiredLevel;
                      const isGap = step > item.currentLevel && step <= item.requiredLevel;

                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isGap
                                ? 'bg-amber-400/80 animate-pulse'
                                : isCurrent
                                ? 'bg-emerald-500'
                                : isRequired
                                ? 'bg-blue-400'
                                : 'bg-slate-200'
                            }`}
                          />
                          <p className="text-xs text-center font-medium text-slate-400">
                            L{step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">
                  {item.gap > 0 ? 'Target learning recommended' : 'Proficiency standard achieved'}
                </span>

                {item.gap > 0 ? (
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                  >
                    <span>View Learning Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Target Achieved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
