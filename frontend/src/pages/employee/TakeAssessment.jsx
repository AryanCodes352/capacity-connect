/**
 * src/pages/employee/TakeAssessment.jsx — Interactive Assessment Test Runner
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  getAssessmentForTakingApi,
  submitAssessmentAttemptApi,
} from '../../api/assessment.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const backPath =
    user?.role === 'TRAINER'
      ? '/trainer/assessments'
      : user?.role === 'ADMIN'
      ? '/admin/assessments'
      : '/assessments';

  const profilePath =
    user?.role === 'TRAINER'
      ? '/trainer/dashboard'
      : user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/my-competencies';

  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setIsLoading(true);
        const data = await getAssessmentForTakingApi(id);
        setAssessment(data);
        if (data.timeLimitMin) {
          setTimeLeft(data.timeLimitMin * 60);
        }
      } catch (err) {
        toast.error('Failed to load assessment questions');
        navigate(backPath);
      } finally {
        setIsLoading(false);
      }
    };
    loadAssessment();
  }, [id, navigate, backPath]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (auto = false) => {
    if (isSubmitting || result) return;

    const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
      questionId: qId,
      selectedOptionId: optId,
    }));

    if (
      !auto &&
      formattedAnswers.length < (assessment?.questions?.length || 0)
    ) {
      if (
        !window.confirm(
          `You have answered ${formattedAnswers.length} of ${assessment.questions.length} questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await submitAssessmentAttemptApi(id, {
        answers: formattedAnswers,
        isPreTraining: false,
        isPostTraining: false,
      });
      setResult(res);
      toast.success('Assessment evaluated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Preparing your assessment..." />;
  }

  if (!assessment) return null;

  const questions = assessment.questions || [];
  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Test Header Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {assessment.competency?.name} Assessment
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-1">{assessment.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {timeLeft !== null && !result && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs border ${
              timeLeft < 180
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 font-medium">
            Answered: <span className="font-bold text-slate-800">{answeredCount}</span> / {totalQuestions}
          </div>
        </div>
      </div>

      {/* ── Test Body or Result ── */}
      {!result ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
          {/* Question Index Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Question {currentIdx + 1} of {totalQuestions}</span>
              <span>{Math.round((answeredCount / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="pt-2">
            <h3 className="text-base lg:text-lg font-bold text-slate-900 leading-relaxed">
              {currentIdx + 1}. {currentQ?.text}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ?.options?.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === opt.id;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-xs lg:text-sm font-medium text-slate-800">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question Navigation Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors shadow-xs"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── RESULT & EVALUATION SCREEN ── */
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Main Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-blue-600 mb-2">
              <Award className="w-12 h-12" />
            </div>

            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                result.isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {result.isPassed ? 'Assessment Passed' : 'Assessment Completed (Needs Improvement)'}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">{result.score}%</h2>
              <p className="text-xs text-slate-500 mt-1">
                Passing Score: {result.passingScore}% · Earned {result.earnedMarks} / {result.totalMarks} marks
              </p>
            </div>

            {/* Competency Level Award Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-sm max-w-lg mx-auto">
              <p className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                Updated Competency Level
              </p>
              <h3 className="text-xl font-bold mt-1">
                Level {result.competencyLevel} — {result.levelLabel}
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                {result.levelDescription}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                to={profilePath}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {user?.role === 'EMPLOYEE' ? 'View Updated Competency Profile' : 'View Dashboard'}
              </Link>
              <Link
                to={backPath}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Back to Assessments
              </Link>
            </div>
          </div>

          {/* Detailed Question Review & Explanations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Question-by-Question Review</h3>

            <div className="space-y-4">
              {result.breakdown?.map((item, idx) => (
                <div
                  key={item.questionId}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    item.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800">
                      {idx + 1}. {item.questionText}
                    </p>
                    <span className="font-semibold shrink-0">
                      {item.isCorrect ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> +{item.marks} marks
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> 0 marks
                        </span>
                      )}
                    </span>
                  </div>

                  {item.explanation && (
                    <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-bold text-slate-800">Explanation: </span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
