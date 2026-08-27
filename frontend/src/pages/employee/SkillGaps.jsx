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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 mb-2 border border-blue-500/20">
              <Target className="w-3.5 h-3.5" />
              Automated Capacity Gap Engine
            </span>
            <h2 className="text-2xl font-bold">Role Skill Gap Analysis</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Skill gaps represent the difference between your role's required proficiency levels and your current evaluated competencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Recommended Courses
            </Link>
          </div>
        </div>

        {/* Severity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <p className="text-[11px] font-semibold text-rose-400">Critical Gaps (Gap 3+)</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{criticalGaps.length}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <p className="text-[11px] font-semibold text-orange-400">High Gaps (Gap 2)</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{highGaps.length}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <p className="text-[11px] font-semibold text-yellow-400">Medium Gaps (Gap 1)</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{mediumGaps.length}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <p className="text-[11px] font-semibold text-emerald-400">No Gap (Target Met)</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{noGaps.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setPriorityFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              priorityFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Competencies ({gaps.length})
          </button>

          <button
            onClick={() => setPriorityFilter('HIGH_CRITICAL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              priorityFilter === 'HIGH_CRITICAL'
                ? 'bg-orange-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            High & Critical Gaps ({highGaps.length + criticalGaps.length})
          </button>

          <button
            onClick={() => setPriorityFilter('GAPS_ONLY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              priorityFilter === 'GAPS_ONLY'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Gaps ({gaps.filter((g) => g.gap > 0).length})
          </button>

          <button
            onClick={() => setPriorityFilter('NONE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              priorityFilter === 'NONE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Proficient / No Gap ({noGaps.length})
          </button>
        </div>

        <Link
          to="/assessments"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Retake Competency Test</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                      <span className="text-slate-400 text-[11px] block">Current Level</span>
                      <span className="font-bold text-slate-800 text-sm">
                        Level {item.currentLevel} ({item.currentLevelInfo?.label})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Required Level</span>
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
                          <p className="text-[10px] text-center font-medium text-slate-400">
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
                <span className="text-[11px] text-slate-400">
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
