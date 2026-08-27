/**
 * src/pages/employee/Recommendations.jsx — Rule-Based Personalized Learning Pathways
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyRecommendationsApi,
  refreshRecommendationsApi,
} from '../../api/recommendation.api';
import { enrollInCourseApi } from '../../api/course.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await getMyRecommendationsApi();
      setRecommendations(data);
    } catch (err) {
      toast.error('Failed to load personalized recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await refreshRecommendationsApi();
      setRecommendations(data);
      toast.success('Recommendations recalculated based on your latest skill gaps!');
    } catch (err) {
      toast.error('Failed to refresh recommendations');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      await enrollInCourseApi(courseId);
      toast.success('Enrolled successfully! Redirecting to course...');
      navigate('/my-learning');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 rounded-2xl p-6 lg:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs text-blue-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligent Capability Matching
            </span>
            <h2 className="text-2xl font-bold">Personalized Learning Pathways</h2>
            <p className="text-xs lg:text-sm text-blue-100 max-w-xl">
              These courses are prioritized based on the severity of your evaluated skill gaps, mapping directly to your organizational role requirements.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-xl backdrop-blur-xs border border-white/20 transition-colors shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      {isLoading ? (
        <LoadingSpinner text="Analyzing your skill gaps and ranking courses..." />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="No recommendations found"
          description="Great job! You have no active skill gaps, or no uncompleted courses match your profile."
          icon={CheckCircle2}
        />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => {
            const course = rec.course;
            return (
              <div
                key={rec.id || rec.courseId}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left info */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {course?.category} · {course?.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{course?.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {course?.description || 'Target capacity program designed to close organizational competency gaps.'}
                    </p>
                  </div>

                  {/* Recommendation Rationale Callout */}
                  <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-950">Why recommended: </strong>
                      {rec.reason}
                    </span>
                  </div>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course?.durationHours || 6} Hours
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course?._count?.modules || 0} Modules
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      {rec.competencyName}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2.5 shrink-0 w-full md:w-48">
                  <button
                    onClick={() => handleEnroll(rec.courseId)}
                    disabled={enrollingId === rec.courseId}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-xs disabled:bg-blue-400"
                  >
                    <span>{enrollingId === rec.courseId ? 'Enrolling...' : 'Enroll & Start'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/courses/${rec.courseId}`}
                    className="w-full text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    View Syllabus
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
