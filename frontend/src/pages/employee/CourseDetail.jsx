/**
 * src/pages/employee/CourseDetail.jsx — Course Overview & Syllabus Details
 *
 * FUNCTIONAL NOTE: All API calls (getCourseByIdApi, enrollInCourseApi),
 * state management, enrollment handler, navigation, and conditional rendering
 * are preserved exactly. Only visual layout/styling changed.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  FileText,
  Video,
  ArrowRight,
  ChevronLeft,
  Layers,
  User,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourseByIdApi, enrollInCourseApi } from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Lesson type icon helper
const getLessonIcon = (type) => {
  switch (type) {
    case 'VIDEO':    return <Video className="w-4 h-4 text-blue-500" />;
    case 'DOCUMENT':
    case 'PDF':      return <FileText className="w-4 h-4 text-amber-500" />;
    default:         return <PlayCircle className="w-4 h-4 text-emerald-500" />;
  }
};

export default function CourseDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [course, setCourse]         = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // ── Unchanged functional logic ────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const data = await getCourseByIdApi(id);
        setCourse(data);
      } catch {
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      await enrollInCourseApi(id);
      toast.success('Successfully enrolled in course!');
      navigate('/my-learning');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };
  // ── End unchanged functional logic ────────────────────────────────────────

  if (isLoading) return <LoadingSpinner text="Loading course syllabus…" />;
  if (!course) return null;

  const modules     = course.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const totalMinutes = modules.reduce((acc, m) =>
    acc + (m.lessons?.reduce((la, l) => la + (l.durationMin || 0), 0) || 0), 0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">

      {/* ── Back link ───────────────────────────────────────────────────── */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* ── Course Hero ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: Course info */}
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  {course.category}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-300">
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-400 text-sm leading-relaxed">
                {course.description || 'Comprehensive organizational training course designed for structured competency development.'}
              </p>

              {/* Trainer */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {course.trainer?.firstName?.[0] || 'T'}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Instructor</p>
                  <p className="text-sm font-semibold text-white">
                    {course.trainer?.firstName} {course.trainer?.lastName}
                    <span className="text-slate-400 font-normal ml-1.5">
                      · {course.trainer?.jobTitle || 'Lead Trainer'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 pt-1 border-t border-slate-800">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{course.durationHours || 6}h</p>
                  <p className="text-xs text-slate-500 mt-0.5">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{modules.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Modules</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{totalLessons}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Lessons</p>
                </div>
              </div>
            </div>

            {/* Right: Action card */}
            <div className="w-full lg:w-72 shrink-0 bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-6 space-y-4">
              {course.isEnrolled ? (
                <>
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">Your progress</span>
                      <span className="font-bold text-white">{course.enrollment?.progressPct || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${course.enrollment?.progressPct || 0}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/my-learning"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-center pb-2">
                    <p className="text-2xl font-bold text-white">{course.durationHours || 6}h</p>
                    <p className="text-xs text-slate-400 mt-0.5">Estimated completion</p>
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isEnrolling ? 'Enrolling…' : 'Enroll in Course'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-xs text-center text-slate-500">
                    Free to enroll · Start anytime
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Target Competencies ─────────────────────────────────────────── */}
      {course.competencies && course.competencies.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-600" />
            Competencies Developed
          </h3>
          <div className="flex flex-wrap gap-3">
            {course.competencies.map((cc) => (
              <div
                key={cc.id || cc.competencyId}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  L{cc.targetLevel || 3}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{cc.competency?.name}</p>
                  <p className="text-xs text-blue-600">Target Level {cc.targetLevel || 3}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Curriculum ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Course Curriculum</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {modules.length} modules · {totalLessons} lessons
              {totalMinutes > 0 && ` · ~${Math.round(totalMinutes / 60)}h total`}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Module header */}
              <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Module {modIdx + 1}
                  </p>
                  <h4 className="text-sm font-semibold text-slate-800 mt-0.5">{mod.title}</h4>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full shrink-0">
                  {mod.lessons?.length || 0} lessons
                </span>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-slate-100">
                {mod.lessons?.map((lesson, lessonIdx) => {
                  const isCompleted = course.completedLessonIds?.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {lessonIdx + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-slate-400 uppercase font-medium tracking-wide mt-0.5">
                            {lesson.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-xs text-slate-400">{lesson.durationMin || 15} min</span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
