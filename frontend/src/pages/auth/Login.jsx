/**
 * src/pages/auth/Login.jsx — Login Page
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios.config';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

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
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      const { token, user } = response.data.data;

      // Save to context and localStorage
      login(token, user);

      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect immediately to clean role dashboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Capacity Connect</h1>
          <p className="text-slate-500 mt-1 text-sm">Competency-Driven Capacity Building Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 
                rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6" id="footer-text">
          CAPACITY CONNECT © 2026 · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
