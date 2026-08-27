/**
 * src/pages/employee/EmployeeDashboard.jsx — Employee Learning Dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileCheck,
  PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMySkillGapsApi } from '../../api/skillGap.api';
import { getMyEnrolledCoursesApi } from '../../api/course.api';
import { getMyRecommendationsApi } from '../../api/recommendation.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [gaps, setGaps] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [gapsData, enrData, recData] = await Promise.all([
          getMySkillGapsApi(),
          getMyEnrolledCoursesApi(),
          getMyRecommendationsApi(),
        ]);
        setGaps(gapsData);
        setEnrollments(enrData);
        setRecommendations(recData);
      } catch (err) {
        toast.error('Failed to load employee dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading your personal learning dashboard..." />;
  }

  const activeGaps = gaps.filter((g) => g.gap > 0);
  const completedCourses = enrollments.filter((e) => e.progressPct === 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 rounded-2xl p-6 lg:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/10 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome Back, {user?.firstName}!
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold">Your Capacity Growth Hub</h1>
            <p className="text-xs lg:text-sm text-blue-100 max-w-xl">
              Role: <strong>{user?.orgRole?.name || 'Software Developer'}</strong> · Department: <strong>{user?.department?.name || 'Engineering'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/my-learning"
              className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Resume Learning
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Skill Gaps"
          value={activeGaps.length}
          subtitle={activeGaps.length === 0 ? 'All competencies met!' : 'Targeted for upgrade'}
          icon={AlertTriangle}
          color={activeGaps.length === 0 ? 'green' : 'amber'}
        />
        <StatCard
          title="Enrolled Courses"
          value={enrollments.length}
          subtitle={`${completedCourses.length} completed (100%)`}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Personalized Recommendations"
          value={recommendations.length}
          subtitle="AI & Rule-matched courses"
          icon={Sparkles}
          color="purple"
        />
        <StatCard
          title="Evaluated Competencies"
          value={gaps.length}
          subtitle="Assessed proficiency levels"
          icon={Award}
          color="green"
        />
      </div>

      {/* Grid: Active Learning & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Skill Gaps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Identified Skill Gaps
            </h2>
            <Link to="/skill-gaps" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View Analysis →
            </Link>
          </div>

          {activeGaps.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              🎉 No active skill gaps! You meet all required competencies.
            </div>
          ) : (
            <div className="space-y-3">
              {activeGaps.slice(0, 3).map((gap) => (
                <div
                  key={gap.competencyId}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{gap.competencyName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Current: <strong>Level {gap.currentLevel}</strong> · Required: <strong>Level {gap.requiredLevel}</strong>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    -{gap.gap} Level Gap
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Enrolled Courses & Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              My Active Learning Courses
            </h2>
            <Link to="/my-learning" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Open Player →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              You have not enrolled in any courses yet. Check out your recommendations!
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 3).map((enr) => (
                <div
                  key={enr.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-xs">{enr.course?.title}</p>
                    <span className="text-[11px] font-bold text-blue-600">
                      {enr.progressPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${enr.progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${enr.progressPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
