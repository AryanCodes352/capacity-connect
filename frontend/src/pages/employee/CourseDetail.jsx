/**
 * src/pages/employee/CourseDetail.jsx — Course Overview & Syllabus Details
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  User,
  CheckCircle2,
  PlayCircle,
  FileText,
  Video,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourseByIdApi, enrollInCourseApi } from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const data = await getCourseByIdApi(id);
        setCourse(data);
      } catch (err) {
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

  if (isLoading) {
    return <LoadingSpinner text="Loading course syllabus..." />;
  }

  if (!course) return null;

  const modules = course.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  const getLessonIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4 text-blue-500" />;
      case 'DOCUMENT':
      case 'PDF': return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <PlayCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Course Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {course.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                {course.difficulty}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold">{course.title}</h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              {course.description || 'Comprehensive organizational training course designed for structured competency development.'}
            </p>

            {/* Trainer Info */}
            <div className="flex items-center gap-2.5 pt-2 text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {course.trainer?.firstName?.[0] || 'T'}
              </div>
              <span>
                Instructor: <strong className="text-white">{course.trainer?.firstName} {course.trainer?.lastName}</strong> ({course.trainer?.jobTitle || 'Lead Trainer'})
              </span>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 w-full lg:w-72 shrink-0 space-y-4 text-center">
            <div>
              <p className="text-xs text-slate-300">Estimated Duration</p>
              <p className="text-2xl font-bold mt-0.5">{course.durationHours || 6} Hours</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-y border-white/15 py-3">
              <div>
                <p className="font-bold text-white text-sm">{modules.length}</p>
                <p className="text-[11px]">Modules</p>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{totalLessons}</p>
                <p className="text-[11px]">Lessons</p>
              </div>
            </div>

            {course.isEnrolled ? (
              <Link
                to="/my-learning"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-md"
              >
                <span>Continue Learning ({course.enrollment?.progressPct || 0}%)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-md disabled:bg-blue-400"
              >
                <span>{isEnrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Competencies */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          Competencies Developed by this Course
        </h3>
        <div className="flex flex-wrap gap-2">
          {course.competencies?.map((cc) => (
            <div
              key={cc.id || cc.competencyId}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-50/70 border border-blue-100 rounded-xl"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                L{cc.targetLevel || 3}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{cc.competency?.name}</p>
                <p className="text-[10px] text-blue-600">Target Proficiency Level {cc.targetLevel || 3}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus / Curriculum Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Course Curriculum</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {modules.length} Modules · {totalLessons} Lessons
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Module {modIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{mod.title}</h4>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {mod.lessons?.length || 0} Lessons
                </span>
              </div>

              <div className="divide-y divide-slate-100 p-2">
                {mod.lessons?.map((lesson, lessonIdx) => {
                  const isCompleted = course.completedLessonIds?.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {lessonIdx + 1}. {lesson.title}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {lesson.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">
                          {lesson.durationMin || 15} mins
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
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
