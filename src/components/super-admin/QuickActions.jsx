import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

const ACTIONS = [
  {
    label: 'Register New Gym',
    description: 'Onboard a new gym tenant & branch',
    to: '/super-admin/gyms/add',
    icon: PlusCircle,
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Create Subscription Plan',
    description: 'Configure pricing tiers & limits',
    to: '/super-admin/subscription-plans/create',
    icon: Sparkles,
    accent: 'bg-navy-50 text-navy-900',
  },
  {
    label: 'View All Gyms',
    description: 'Inspect directory & branch quotas',
    to: '/super-admin/gyms',
    icon: Building2,
    accent: 'bg-slate-100 text-slate-700',
  },
  {
    label: 'Manage Payments',
    description: 'Review payouts, invoices & retries',
    to: '/super-admin/billing',
    icon: CreditCard,
    accent: 'bg-slate-100 text-slate-700',
  },
];

export function QuickActions() {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Direct shortcuts to common platform operations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-navy-700/40 hover:shadow-xs transition-all duration-150"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${action.accent}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-navy-900 truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 text-slate-400 group-hover:text-navy-900 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActions;
