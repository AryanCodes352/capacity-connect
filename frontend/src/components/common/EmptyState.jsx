/**
 * src/components/common/EmptyState.jsx
 *
 * Improved empty state with colored icon circle and better typography.
 * Props interface unchanged (title, description, icon, action).
 */

import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No data found',
  description = 'There are currently no records to display.',
  icon: Icon = FolderOpen,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-4 animate-fade-in">
      {/* Icon with layered circle */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
