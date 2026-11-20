import { ArrowLeft, Ban, CheckCircle2, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import GymStatusBadge from './GymStatusBadge';
import SubscriptionBadge from './SubscriptionBadge';

export function GymProfileHeader({ gym, onToggleStatus }) {
  if (!gym) return null;
  const isSuspendedOrInactive =
    gym.status === 'suspended' || gym.status === 'inactive';

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/super-admin/gyms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to All Gyms</span>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {gym.logoUrl ? (
            <img
              src={gym.logoUrl}
              alt={`${gym.name} logo`}
              className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: gym.logoColor || '#14213D' }}
            >
              {gym.initials}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                {gym.name}
              </h1>
              <GymStatusBadge status={gym.status} />
              <SubscriptionBadge plan={gym.subscription?.plan} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-medium text-slate-700">{gym.id}</span>
              <span aria-hidden="true">·</span>
              <span>Owner: {gym.owner?.fullName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {gym.address?.city}, {gym.address?.state}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to={`/super-admin/gyms/${gym.id}/edit`}>
            <Button variant="outline" size="sm" leftIcon={Edit3}>
              Edit
            </Button>
          </Link>
          <Button
            variant={isSuspendedOrInactive ? 'emerald' : 'danger'}
            size="sm"
            leftIcon={isSuspendedOrInactive ? CheckCircle2 : Ban}
            onClick={onToggleStatus}
          >
            {isSuspendedOrInactive ? 'Activate Gym' : 'Suspend Gym'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GymProfileHeader;
