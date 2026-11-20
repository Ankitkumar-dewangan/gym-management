import { cn } from '../../../utils/cn';

const PLAN_STYLES = {
  Starter: 'bg-slate-100 text-slate-700 border-slate-200',
  Pro: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Enterprise: 'bg-navy-50 text-navy-900 border-navy-100',
};

export function SubscriptionBadge({ plan = 'Starter', className = '' }) {
  const style = PLAN_STYLES[plan] || PLAN_STYLES.Starter;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap shrink-0',
        style,
        className
      )}
    >
      {plan}
    </span>
  );
}

export default SubscriptionBadge;
