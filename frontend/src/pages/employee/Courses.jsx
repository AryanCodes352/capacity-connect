/**
 * src/pages/employee/Courses.jsx — Course Catalog & Learning Explorer
 *
 * FUNCTIONAL NOTE: All API calls (getCoursesApi with search/difficulty/category
 * params), state management, filter state, and useEffect are preserved exactly.
 * Only visual layout/styling changed.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Award,
  Clock,
  GraduationCap,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCoursesApi }  from '../../api/course.api';
import LoadingSpinner     from '../../components/common/LoadingSpinner';
import EmptyState         from '../../components/common/EmptyState';

// Category → accent color mapping for card top bar
const categoryColors = {
  'Database':        'from-amber-500 to-orange-500',
  'Web Development': 'from-blue-500 to-cyan-500',
  'Backend':         'from-violet-500 to-purple-600',
  'Leadership':      'from-emerald-500 to-teal-600',
  'Data':            'from-pink-500 to-rose-500',
  'General':         'from-slate-400 to-slate-600',
};
const getCategoryGradient = (cat) =>
  categoryColors[cat] || 'from-blue-500 to-indigo-600';

const difficultyConfig = {
  beginner:     { label: 'Beginner',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  intermediate: { label: 'Intermediate', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  advanced:     { label: 'Advanced',     cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};
const getDifficulty = (diff) =>
  difficultyConfig[diff?.toLowerCase()] || { label: diff, cls: 'bg-slate-100 text-slate-700 border-slate-200' };

export default function Courses() {
  const [courses, setCourses]               = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [search, setSearch]                 = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // ── Unchanged functional logic ────────────────────────────────────────────
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getCoursesApi({
        search:     search || undefined,
        difficulty: difficultyFilter || undefined,
        category:   categoryFilter || undefined,
      });
      setCourses(data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, difficultyFilter, categoryFilter]);
  // ── End unchanged functional logic ────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Competency-aligned courses designed to bridge your skill gaps
          </p>
        </div>
        <Link
          to="/my-learning"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <GraduationCap className="w-4 h-4" />
          My Enrolled Courses
        </Link>
      </div>

      {/* ── Filters Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, topics, keywords…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              <option value="Database">Database</option>
              <option value="Web Development">Web Development</option>
              <option value="Backend">Backend</option>
              <option value="Leadership">Leadership</option>
              <option value="Data">Data</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-slate-400 mt-3">
            {courses.length} course{courses.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
        )}
      </div>

      {/* ── Course Grid ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingSpinner text="Loading courses…" />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search or filter options to discover more courses."
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const diff = getDifficulty(course.difficulty);
            const grad = getCategoryGradient(course.category);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Category accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${grad}`} />

                <div className="p-5 flex flex-col flex-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {course.category || 'General'}
                    </span>
                    <span className={`inline-flex shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diff.cls}`}>
                      {diff.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {course.description || 'Structured learning curriculum with interactive lessons and modules.'}
                  </p>

                  {/* Target Competencies */}
                  {course.competencies && course.competencies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Target Competencies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {course.competencies.slice(0, 3).map((cc) => (
                          <span
                            key={cc.id || cc.competencyId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100"
                          >
                            <Award className="w-3 h-3" />
                            {cc.competency?.name}
                          </span>
                        ))}
                        {course.competencies.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">
                            +{course.competencies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-5 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.durationHours || 5}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{course._count?.modules || 0} modules</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/courses/${course.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 group"
                  >
                    View & Enroll
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
