import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_OVERVIEW_STATS } from '../../constants/superAdminData';

export function SubscriptionOverview({ stats = SUBSCRIPTION_OVERVIEW_STATS }) {
  const rows = [
    {
      label: 'Active Subscriptions',
      value: stats.active,
      tone: 'text-emerald-700',
    },
    {
      label: 'Expiring Soon (7d)',
      value: stats.expiringSoon,
      tone: 'text-amber-700',
    },
    {
      label: 'Expired Subscriptions',
      value: stats.expired,
      tone: 'text-red-700',
    },
    {
      label: 'Free Trial Users',
      value: stats.freeTrials,
      tone: 'text-slate-800',
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Subscription Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan lifecycle & trial conversion metrics
            </p>
          </div>
          <Link
            to="/super-admin/active-subscriptions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-slate-600">{row.label}</span>
              <span className={`font-mono font-semibold tabular-nums ${row.tone}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Trial-to-Paid Conversion Rate
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Trailing 30-day cohort
          </p>
        </div>
        <span className="font-display text-xl font-bold text-emerald-700 tabular-nums">
          {stats.conversionRate}
        </span>
      </div>
    </section>
  );
}

export default SubscriptionOverview;
