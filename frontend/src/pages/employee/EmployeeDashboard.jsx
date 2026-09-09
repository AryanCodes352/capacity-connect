/**
 * src/pages/employee/EmployeeDashboard.jsx — Employee Learning Dashboard
 *
 * FUNCTIONAL NOTE: All API calls (getMySkillGapsApi, getMyEnrolledCoursesApi,
 * getMyRecommendationsApi), state management, and data processing are
 * preserved exactly. Only visual layout/styling changed.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  BookOpen,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  PlayCircle,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMySkillGapsApi }        from '../../api/skillGap.api';
import { getMyEnrolledCoursesApi }  from '../../api/course.api';
import { getMyRecommendationsApi }  from '../../api/recommendation.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard       from '../../components/common/StatCard';

// Gap severity colour helper
const gapSeverityColor = (gap) => {
  if (gap >= 3) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (gap === 2) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
};

// Greeting based on hour
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [gaps, setGaps]               = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);

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
      } catch {
        toast.error('Failed to load employee dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading your personal learning dashboard…" />;
  }

  const activeGaps       = gaps.filter((g) => g.gap > 0);
  const completedCourses = enrollments.filter((e) => e.progressPct === 100);
  const inProgress       = enrollments.filter((e) => e.progressPct > 0 && e.progressPct < 100);

  // The most recent in-progress course gets the hero CTA
  const continueCourse = inProgress[0] || enrollments[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">

      {/* ── Hero: Welcome + Primary CTA ─────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden shadow-lg">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-48 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: greeting */}
            <div className="space-y-3 max-w-xl">
              <p className="text-blue-300 text-sm font-medium">
                {getGreeting()}, {user?.firstName} 👋
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Your Learning Hub
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-slate-200 font-medium">{user?.orgRole?.name || 'Employee'}</span>
                {user?.department?.name ? ` · ${user.department.name}` : ''}
              </p>

              {/* Quick stats row */}
              <div className="flex items-center gap-5 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{enrollments.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Enrolled</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{completedCourses.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Completed</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{activeGaps.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Skill Gaps</p>
                </div>
              </div>
            </div>

            {/* Right: CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to="/my-learning"
                className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                <PlayCircle className="w-4.5 h-4.5" />
                Continue Learning
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="Active Skill Gaps"
            value={activeGaps.length}
            subtitle={activeGaps.length === 0 ? '✓ All competencies met' : 'Targeted for development'}
            icon={AlertTriangle}
            color={activeGaps.length === 0 ? 'green' : 'amber'}
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="Enrolled Courses"
            value={enrollments.length}
            subtitle={`${inProgress.length} in progress`}
            icon={BookOpen}
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="Courses Completed"
            value={completedCourses.length}
            subtitle="100% progress achieved"
            icon={CheckCircle2}
            color="green"
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <StatCard
            title="Recommendations"
            value={recommendations.length}
            subtitle="Competency-matched courses"
            icon={Sparkles}
            color="purple"
          />
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Active Courses (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">My Active Courses</h2>
            </div>
            <Link
              to="/my-learning"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Open Player <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6">
            {enrollments.length === 0 ? (
              <div className="py-8 text-center">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 mb-1">No courses yet</p>
                <p className="text-xs text-slate-400 mb-4">Explore our catalog to start your learning journey</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 4).map((enr, idx) => (
                  <div key={enr.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${enr.progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <p className="text-sm font-medium text-slate-800 truncate">{enr.course?.title}</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ml-3 ${enr.progressPct === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {enr.progressPct}%
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden ml-4">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${enr.progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${enr.progressPct}%` }}
                      />
                    </div>
                    {idx < enrollments.slice(0, 4).length - 1 && (
                      <div className="mt-4 border-t border-slate-100" />
                    )}
                  </div>
                ))}

                {enrollments.length > 4 && (
                  <Link
                    to="/my-learning"
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium pt-2 transition-colors"
                  >
                    +{enrollments.length - 4} more courses
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Skill Gaps (2/5) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Skill Gaps</h2>
            </div>
            <Link
              to="/skill-gaps"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6">
            {activeGaps.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">All gaps closed!</p>
                <p className="text-xs text-slate-400">You meet all required competency levels for your role.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGaps.slice(0, 4).map((gap) => (
                  <div key={gap.competencyId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{gap.competencyName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        L{gap.currentLevel} → L{gap.requiredLevel} required
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${gapSeverityColor(gap.gap)}`}>
                      -{gap.gap}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recommendations strip ─────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Recommended for You</h2>
              <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                {recommendations.length} courses
              </span>
            </div>
            <Link
              to="/recommendations"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6 flex gap-4 overflow-x-auto pb-2">
            {recommendations.slice(0, 4).map((rec) => (
              <Link
                key={rec.id || rec.courseId}
                to={`/courses/${rec.courseId || rec.id}`}
                className="shrink-0 w-56 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                  {rec.course?.title || rec.title}
                </p>
                <p className="text-xs text-slate-400">{rec.course?.category || 'Learning'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
