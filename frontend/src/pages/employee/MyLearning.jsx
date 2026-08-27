/**
 * src/pages/employee/MyLearning.jsx — Interactive Learning Player & Enrolled Courses
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
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyEnrolledCoursesApi,
  getCourseByIdApi,
  toggleLessonProgressApi,
} from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await getMyEnrolledCoursesApi();
      setEnrollments(data);
      if (data.length > 0 && !activeCourseId) {
        setActiveCourseId(data[0].courseId);
      }
    } catch (err) {
      toast.error('Failed to load your enrolled courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Fetch full details of the active selected course
  useEffect(() => {
    if (!activeCourseId) return;

    const fetchCourseDetails = async () => {
      try {
        const details = await getCourseByIdApi(activeCourseId);
        setActiveCourse(details);

        // Select first lesson if none selected
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

      // Update activeCourse completedLessonIds & progressPct
      setActiveCourse((prev) => {
        if (!prev) return prev;
        const nextIds = res.isCompleted
          ? [...prev.completedLessonIds, lessonId]
          : prev.completedLessonIds.filter((id) => id !== lessonId);

        return {
          ...prev,
          completedLessonIds: nextIds,
          enrollment: {
            ...prev.enrollment,
            progressPct: res.progressPct,
          },
        };
      });

      // Update enrollment in list
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
    } catch (err) {
      toast.error('Failed to update lesson status');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your learning workspace..." />;
  }

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold">My Learning Workspace</h2>
          <p className="text-xs text-blue-100 mt-1">
            Access your active courses, follow lesson modules, and evaluate completed competencies.
          </p>
        </div>
        <EmptyState
          title="No courses enrolled yet"
          description="Explore our competency-aligned course catalog to start your learning journey."
          icon={GraduationCap}
          action={
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs transition-colors"
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
  const currentProgress = activeCourse?.enrollment?.progressPct || 0;

  return (
    <div className="space-y-6">
      {/* ── Course Selector Tabs ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-200">
        {enrollments.map((enr) => {
          const isActive = enr.courseId === activeCourseId;
          return (
            <button
              key={enr.id}
              onClick={() => setActiveCourseId(enr.courseId)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left shrink-0 transition-all ${
                isActive
                  ? 'border-blue-600 bg-white shadow-md ring-1 ring-blue-600/20'
                  : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                  {enr.course?.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${enr.progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {enr.progressPct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Learning Player (Split View) ── */}
      {activeCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Curriculum Stepper (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4 h-fit max-h-[80vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {activeCourse.category}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-1">
                {activeCourse.title}
              </h3>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Course Progress</span>
                  <span className="font-bold text-blue-600">{currentProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {activeCourse.modules?.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Module {modIdx + 1}: {mod.title}
                  </p>

                  <div className="space-y-0.5">
                    {mod.lessons?.map((lesson, lessonIdx) => {
                      const isCompleted = activeCourse.completedLessonIds?.includes(lesson.id);
                      const isSelected = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            ) : (
                              <Circle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-300'}`} />
                            )}
                            <span className="truncate">
                              {lessonIdx + 1}. {lesson.title}
                            </span>
                          </div>
                          <span className={`text-[10px] shrink-0 ml-2 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {lesson.durationMin}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Active Lesson Content Viewer (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {currentProgress === 100 && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Course Complete! Ready for Post-Training Assessment
                  </h4>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Take the post-training assessment to verify and upgrade your organizational competency level.
                  </p>
                </div>
                <Link
                  to="/assessments"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0 shadow-xs"
                >
                  Take Assessment
                </Link>
              </div>
            )}

            {selectedLesson ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {selectedLesson.type} Lesson
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {selectedLesson.title}
                    </h2>
                  </div>

                  {/* Mark Completed Action Button */}
                  <button
                    onClick={() => handleToggleLesson(selectedLesson.id)}
                    disabled={isToggling}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                      isCurrentLessonDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentLessonDone ? 'Completed (Click to undo)' : 'Mark as Completed'}</span>
                  </button>
                </div>

                {/* Lesson Content Area */}
                <div className="prose prose-slate max-w-none text-xs lg:text-sm text-slate-700 leading-relaxed space-y-4">
                  {selectedLesson.type === 'VIDEO' ? (
                    <div className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                      <PlayCircle className="w-16 h-16 text-blue-500 hover:scale-110 transition-transform cursor-pointer" />
                      <div>
                        <p className="font-bold text-sm">{selectedLesson.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Video Stream: {selectedLesson.content || 'https://technova.internal/video-stream'}
                        </p>
                      </div>
                    </div>
                  ) : selectedLesson.type === 'DOCUMENT' || selectedLesson.type === 'PDF' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                      <FileText className="w-12 h-12 text-amber-500" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{selectedLesson.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Attached Resource Document: {selectedLesson.content}
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Document
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 mb-2">Lesson Overview</p>
                      <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                        {selectedLesson.content || 'In this lesson, you will learn practical skills and competencies required to fulfill standard organizational workflows.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Select a lesson"
                description="Click on any lesson from the curriculum sidebar on the left to begin."
                icon={PlayCircle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
