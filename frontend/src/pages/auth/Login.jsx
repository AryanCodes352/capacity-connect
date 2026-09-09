/**
 * src/pages/auth/Login.jsx — Login Page
 *
 * FUNCTIONAL NOTE: All form logic (useForm, register, handleSubmit, validation),
 * API call (axiosInstance.post('/auth/login')), auth context (login()),
 * navigation (getDashboardPath → navigate), and error handling are
 * preserved 100% unchanged. Only visual layout is redesigned.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Zap, BarChart3, Users, Award, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios.config';

// Feature highlights shown on the left panel — purely decorative, no fake data
const features = [
  { icon: BarChart3, text: 'Real-time competency gap analytics' },
  { icon: BookOpen,  text: 'Curated learning paths & course catalog' },
  { icon: Award,     text: 'Automated skill level assessments' },
  { icon: Users,     text: 'Role-based training & team management' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  // ── Unchanged functional logic ────────────────────────────────────────────
  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':   return '/admin/dashboard';
      case 'TRAINER': return '/trainer/dashboard';
      case 'EMPLOYEE':
      default:        return '/dashboard';
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        email:    data.email.toLowerCase().trim(),
        password: data.password,
      });

      const { token, user } = response.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.firstName}!`);
      const targetPath = getDashboardPath(user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  // ── End unchanged functional logic ────────────────────────────────────────

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel: Brand ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-slate-900 flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-800/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Capacity Connect</h2>
              <p className="text-xs text-blue-400 mt-0.5">Enterprise LMS Platform</p>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Build a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                smarter
              </span>{' '}
              workforce
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              A competency-driven learning platform that bridges skill gaps, accelerates growth, and delivers measurable training ROI.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-slate-600">
          © 2026 Capacity Connect · All rights reserved
        </p>
      </div>

      {/* ── Right Panel: Login Form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo (only visible < lg) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Capacity Connect</h2>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-1">Sign in to your learning portal</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm text-slate-900 placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                      ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                  active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed
                  text-white font-semibold py-3 rounded-xl transition-all duration-200
                  text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
