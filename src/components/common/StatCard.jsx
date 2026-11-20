import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StatCard({
  label,
  value,
  change,
  trend = 'neutral',
  helperText,
  icon: Icon,
  className = '',
}) {
  const trendConfig = {
    up: {
      icon: ArrowUpRight,
      color: 'text-emerald-700',
    },
    down: {
      icon: ArrowDownRight,
      color: 'text-red-700',
    },
    neutral: {
      icon: Minus,
      color: 'text-slate-600',
    },
  }[trend] || { icon: Minus, color: 'text-slate-600' };

  const TrendIcon = trendConfig.icon;

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-navy-900 shrink-0">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-display">
        {value}
      </div>

      {(change || helperText) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {change && (
            <span className={cn('inline-flex items-center gap-0.5 font-medium tabular-nums', trendConfig.color)}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {change}
            </span>
          )}
          {helperText && <span className="text-slate-500">{helperText}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
