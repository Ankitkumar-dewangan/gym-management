import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, LifeBuoy, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  SUPPORT_TICKET_SUMMARY,
  UPCOMING_EXPIRIES,
} from '../../constants/superAdminData';
import { formatCurrency } from '../../utils/formatters';

export function PlatformWidgetsRow({ gyms = [], onApprove, onReject }) {
  const pendingGyms = gyms.filter((g) => g.status === 'pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Gym Approvals */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Pending Gym Approvals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingGyms.length} awaiting compliance review
              </p>
            </div>
            <Link
              to="/super-admin/gym-approvals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
            >
              <span>Queue</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {pendingGyms.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                All pending gym applications have been reviewed.
              </p>
            ) : (
              pendingGyms.map((gym) => (
                <div
                  key={gym.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {gym.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {gym.ownerName} · {gym.plan} ({gym.branches} branches)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onApprove?.(gym)}
                      aria-label={`Approve ${gym.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject?.(gym)}
                      aria-label={`Reject ${gym.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Subscription Expiries */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Upcoming Expiries
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Subscriptions renewing or expiring within 10 days
              </p>
            </div>
            <Link
              to="/super-admin/upcoming-expiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {UPCOMING_EXPIRIES.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.gymName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 tabular-nums">
                    <Clock className="h-3 w-3 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>
                      {item.daysLeft}d left · {item.plan} · {formatCurrency(item.amount)}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success(`Renewal reminder queued for ${item.gymName}`)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>Remind</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Ticket Summary */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Support Ticket Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Avg first response: {SUPPORT_TICKET_SUMMARY.avgResponseTime}
              </p>
            </div>
            <Link
              to="/super-admin/support"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
            >
              <span>Tickets</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 px-2">
              <p className="font-display text-lg font-bold text-slate-800 tabular-nums">
                {SUPPORT_TICKET_SUMMARY.open}
              </p>
              <p className="text-[11px] text-slate-500">Open</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 px-2">
              <p className="font-display text-lg font-bold text-amber-700 tabular-nums">
                {SUPPORT_TICKET_SUMMARY.inProgress}
              </p>
              <p className="text-[11px] text-slate-500">In Progress</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 px-2">
              <p className="font-display text-lg font-bold text-emerald-700 tabular-nums">
                {SUPPORT_TICKET_SUMMARY.resolvedThisWeek}
              </p>
              <p className="text-[11px] text-slate-500">Resolved (7d)</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {SUPPORT_TICKET_SUMMARY.recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="py-2.5 flex items-start justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-slate-500 mt-0.5 truncate">
                    <span className="font-mono">{ticket.id}</span> · {ticket.gym}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 shrink-0">
                  <LifeBuoy className="h-3 w-3 text-slate-400" aria-hidden="true" />
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlatformWidgetsRow;
