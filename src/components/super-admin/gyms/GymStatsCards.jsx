import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Clock,
  PauseCircle,
} from 'lucide-react';

export function GymStatsCards({ gyms = [] }) {
  const total = gyms.length;
  const active = gyms.filter((g) => g.status === 'active').length;
  const pending = gyms.filter((g) => g.status === 'pending' || g.status === 'info_requested').length;
  const suspended = gyms.filter((g) => g.status === 'suspended').length;
  const inactive = gyms.filter((g) => g.status === 'inactive' || g.status === 'draft').length;

  const cards = [
    {
      label: 'Total Gyms',
      value: total,
      icon: Building2,
      iconClass: 'bg-navy-50 text-navy-900',
    },
    {
      label: 'Active Gyms',
      value: active,
      icon: BadgeCheck,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Pending Approval',
      value: pending,
      icon: Clock,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Suspended Gyms',
      value: suspended,
      icon: AlertTriangle,
      iconClass: 'bg-red-50 text-red-700',
    },
    {
      label: 'Inactive Gyms',
      value: inactive,
      icon: PauseCircle,
      iconClass: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">
                {card.label}
              </p>
              <p className="mt-1.5 font-display text-2xl font-bold text-slate-800 tabular-nums">
                {card.value}
              </p>
            </div>
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${card.iconClass}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default GymStatsCards;
