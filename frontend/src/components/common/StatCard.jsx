/**
 * src/components/common/StatCard.jsx
 *
 * Upgraded with left-border accent, stronger value typography,
 * and optional trend indicator. Props interface unchanged.
 */

const colorMap = {
  blue:   { border: 'border-blue-500',   icon: 'bg-blue-50 text-blue-600',   value: 'text-blue-600'   },
  green:  { border: 'border-emerald-500', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600' },
  amber:  { border: 'border-amber-500',  icon: 'bg-amber-50 text-amber-600',  value: 'text-amber-600'  },
  purple: { border: 'border-violet-500', icon: 'bg-violet-50 text-violet-600', value: 'text-violet-600' },
  rose:   { border: 'border-rose-500',   icon: 'bg-rose-50 text-rose-600',   value: 'text-rose-600'   },
  red:    { border: 'border-rose-500',   icon: 'bg-rose-50 text-rose-600',   value: 'text-rose-600'   },
  indigo: { border: 'border-indigo-500', icon: 'bg-indigo-50 text-indigo-600', value: 'text-indigo-600' },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${c.border} p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-800 leading-none">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shrink-0 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
