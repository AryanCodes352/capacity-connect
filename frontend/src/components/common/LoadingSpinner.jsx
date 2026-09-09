/**
 * src/components/common/LoadingSpinner.jsx
 *
 * Improved full-page loading state with pulsing logo mark.
 * Props interface unchanged (text, size).
 */

import { Zap } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
      {/* Animated logo mark */}
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
          <Zap className="w-6 h-6 text-white" />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 border-t-blue-600 animate-spin" />
      </div>
      {text && (
        <p className="text-sm font-medium text-slate-400 text-center max-w-xs">{text}</p>
      )}
    </div>
  );
}
