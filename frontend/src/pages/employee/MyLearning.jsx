/**
 * src/pages/employee/MyLearning.jsx — Interactive Learning Player & Enrolled Courses
 *
 * FUNCTIONAL NOTE: All API calls (getMyEnrolledCoursesApi, getCourseByIdApi,
 * toggleLessonProgressApi), all state management, useEffect hooks, and
 * handleToggleLesson logic are preserved exactly. Only visual layout changed.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  Award,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyEnrolledCoursesApi,
  getCourseByIdApi,
  toggleLessonProgressApi,
} from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState     from '../../components/common/EmptyState';

export default function MyLearning() {
  const [enrollments, setEnrollments]       = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeCourse, setActiveCourse]     = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [isToggling, setIsToggling]         = useState(false);

  // ── Unchanged functional logic ────────────────────────────────────────────
  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await getMyEnrolledCoursesApi();
      setEnrollments(data);
      if (data.length > 0 && !activeCourseId) {
        setActiveCourseId(data[0].courseId);
      }
    } catch {
      toast.error('Failed to load your enrolled courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  useEffect(() => {
    if (!activeCourseId) return;
    const fetchCourseDetails = async () => {
      try {
        const details = await getCourseByIdApi(activeCourseId);
        setActiveCourse(details);
        if (details.modules?.[0]?.lessons?.[0]) {
          setSelectedLesson(details.modules[0].lessons[0]);
        }
      } catch (err) {
        console.error('Failed to fetch active course details', err);
      }
    };
    fetchCourseDetails();
  }, [activeCourseId]);

  const handleToggleLesson = async (lessonId) => {
    try {
      setIsToggling(true);
      const res = await toggleLessonProgressApi(lessonId);

      setActiveCourse((prev) => {
        if (!prev) return prev;
        const nextIds = res.isCompleted
          ? [...prev.completedLessonIds, lessonId]
          : prev.completedLessonIds.filter((id) => id !== lessonId);
        return {
          ...prev,
          completedLessonIds: nextIds,
          enrollment: { ...prev.enrollment, progressPct: res.progressPct },
        };
      });

      setEnrollments((prev) =>
        prev.map((e) =>
          e.courseId === activeCourseId ? { ...e, progressPct: res.progressPct } : e
        )
      );

      if (res.isCourseCompleted) {
        toast.success('🎉 Congratulations! You have completed 100% of this course!');
      } else {
        toast.success(res.isCompleted ? 'Lesson marked completed!' : 'Lesson marked incomplete');
      }
    } catch {
      toast.error('Failed to update lesson status');
    } finally {
      setIsToggling(false);
    }
  };
  // ── End unchanged functional logic ────────────────────────────────────────

  if (isLoading) return <LoadingSpinner text="Loading your learning workspace…" />;

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Learning</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your active courses and track your progress
          </p>
        </div>
        <EmptyState
          title="No courses enrolled yet"
          description="Explore our competency-aligned course catalog to start your learning journey."
          icon={GraduationCap}
          action={
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Explore Courses
            </Link>
          }
        />
      </div>
    );
  }

  const isCurrentLessonDone = activeCourse?.completedLessonIds?.includes(selectedLesson?.id);
  const currentProgress     = activeCourse?.enrollment?.progressPct || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Learning</h1>
        <p className="text-sm text-slate-500 mt-1">
          {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      {/* ── Course Selector Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {enrollments.map((enr) => {
          const isActive = enr.courseId === activeCourseId;
          return (
            <button
              key={enr.id}
              onClick={() => setActiveCourseId(enr.courseId)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold line-clamp-1 max-w-[160px] ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {enr.course?.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-16 h-1 rounded-full overflow-hidden ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full ${isActive ? 'bg-white' : 'bg-blue-600'} transition-all duration-500`}
                      style={{ width: `${enr.progressPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {enr.progressPct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Learning Player ─────────────────────────────────────────────── */}
      {activeCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── Left Panel: Curriculum (4 cols) ── */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[80vh] overflow-hidden">
            {/* Course header */}
            <div className="p-5 border-b border-slate-100">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeCourse.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                {activeCourse.title}
              </h3>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-500">Progress</span>
                  <span className={`font-bold ${currentProgress === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {currentProgress}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${currentProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules & Lessons */}
            <div className="flex-1 overflow-y-auto">
              {activeCourse.modules?.map((mod, modIdx) => (
                <div key={mod.id}>
                  {/* Module label */}
                  <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Module {modIdx + 1}: {mod.title}
                    </p>
                  </div>

                  {/* Lessons */}
                  <div>
                    {mod.lessons?.map((lesson, lessonIdx) => {
                      const isCompleted = activeCourse.completedLessonIds?.includes(lesson.id);
                      const isSelected  = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0 ${
                            isSelected
                              ? 'bg-blue-50 border-l-2 border-l-blue-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-emerald-500'}`} />
                          ) : (
                            <Circle className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                              {lessonIdx + 1}. {lesson.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{lesson.durationMin}m</p>
                          </div>
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Panel: Lesson Content (8 cols) ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Course completion banner */}
            {currentProgress === 100 && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold text-base">Course Complete!</p>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Take the post-training assessment to verify your competency level upgrade.
                    </p>
                  </div>
                </div>
                <Link
                  to="/assessments"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  Take Assessment →
                </Link>
              </div>
            )}

            {/* Lesson viewer */}
            {selectedLesson ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Lesson header */}
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {selectedLesson.type}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                      {selectedLesson.title}
                    </h2>
                  </div>

                  {/* Toggle completed button */}
                  <button
                    onClick={() => handleToggleLesson(selectedLesson.id)}
                    disabled={isToggling}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0 ${
                      isCurrentLessonDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {isCurrentLessonDone ? 'Completed · Undo' : 'Mark Complete'}
                  </button>
                </div>

                {/* Lesson content */}
                <div className="p-6">
                  {selectedLesson.type === 'VIDEO' ? (
                    <div className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center text-white gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                        <PlayCircle className="w-9 h-9 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm">{selectedLesson.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedLesson.content || 'Video stream available in production environment'}
                        </p>
                      </div>
                    </div>
                  ) : selectedLesson.type === 'DOCUMENT' || selectedLesson.type === 'PDF' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">{selectedLesson.title}</h4>
                        <p className="text-sm text-slate-500">{selectedLesson.content}</p>
                      </div>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Open Document
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                      <p className="text-sm font-semibold text-slate-800 mb-3">Lesson Content</p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedLesson.content ||
                          'In this lesson, you will learn practical skills and competencies required to fulfill standard organizational workflows.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Select a lesson to begin"
                description="Click on any lesson from the curriculum panel on the left to start learning."
                icon={PlayCircle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
