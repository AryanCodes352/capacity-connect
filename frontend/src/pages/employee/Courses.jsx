/**
 * src/pages/employee/Courses.jsx — Course Catalog & Learning Explorer
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Award,
  Clock,
  User,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCoursesApi } from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getCoursesApi({
        search: search || undefined,
        difficulty: difficultyFilter || undefined,
        category: categoryFilter || undefined,
      });
      setCourses(data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, difficultyFilter, categoryFilter]);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'advanced': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs text-blue-100 mb-2 border border-white/10">
              <BookOpen className="w-3.5 h-3.5" />
              Competency-Aligned Course Library
            </span>
            <h2 className="text-2xl font-bold">Explore Courses & Capacity Programs</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              All courses are directly mapped to organizational competencies and designed to bridge measured skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/my-learning"
              className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              My Enrolled Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Difficulty Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          <option value="Database">Database</option>
          <option value="Web Development">Web Development</option>
          <option value="Backend">Backend</option>
          <option value="Leadership">Leadership</option>
          <option value="Data">Data</option>
        </select>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try modifying your search or filter options."
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Category & Difficulty Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {course.category || 'General'}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1.5 line-clamp-1">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {course.description || 'Structured learning curriculum with interactive lessons and modules.'}
                </p>

                {/* Target Competencies */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Competencies ({course.competencies?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {course.competencies && course.competencies.length > 0 ? (
                      course.competencies.map((cc) => (
                        <span
                          key={cc.id || cc.competencyId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100"
                        >
                          <Award className="w-3 h-3" />
                          {cc.competency?.name} (Target L{cc.targetLevel || 3})
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">General Skills</span>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationHours || 5} Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course._count?.modules || 0} Modules</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/courses/${course.id}`}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
              >
                <span>View Syllabus & Enroll</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
