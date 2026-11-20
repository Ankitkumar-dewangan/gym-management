import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import NavIcon from '../common/NavIcon';
import { cn } from '../../utils/cn';

export function AdminStatCard({
  label,
  value,
  previousLabel,
  change,
  trend = 'neutral',
  icon = 'Building2',
  className = '',
}) {
  const trendStyles = {
    up: {
      icon: ArrowUpRight,
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    down: {
      icon: ArrowDownRight,
      badge: 'text-red-700 bg-red-50 border-red-200/80',
    },
    neutral: {
      icon: Minus,
      badge: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  }[trend] || {
    icon: Minus,
    badge: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  const TrendIcon = trendStyles.icon;

  return (
    <article
      className={cn(
        'rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors duration-150',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 leading-snug">
          {label}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-900 shrink-0">
          <NavIcon name={icon} className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 text-2xl sm:text-[26px] font-bold tracking-tight text-slate-800 tabular-nums font-display">
        {value}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-medium tabular-nums shrink-0',
            trendStyles.badge
          )}
        >
          <TrendIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{change}</span>
        </span>
        <span className="text-slate-500 truncate">{previousLabel}</span>
      </div>
    </article>
  );
}

export default AdminStatCard;
