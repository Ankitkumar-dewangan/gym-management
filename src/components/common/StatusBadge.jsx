import { AlertCircle, CheckCircle2, Clock, PauseCircle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const STATUS_MAP = {
  active: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  confirmed: {
    label: 'Confirmed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  paid: {
    label: 'Paid',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  trial: {
    label: 'Trial',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Clock,
  },
  paused: {
    label: 'Paused',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: PauseCircle,
  },
  overdue: {
    label: 'Overdue',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  suspended: {
    label: 'Suspended',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  on_hold: {
    label: 'On Hold',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: PauseCircle,
  },
  frozen: {
    label: 'Frozen',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: PauseCircle,
  },
  partially_paid: {
    label: 'Partially Paid',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  renewed: {
    label: 'Renewed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  upgraded: {
    label: 'Upgraded',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  downgraded: {
    label: 'Downgraded',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  processed: {
    label: 'Processed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  open: {
    label: 'Open',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: XCircle,
  },
  high: {
    label: 'High',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  low: {
    label: 'Low',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CheckCircle2,
  },
  success: {
    label: 'Success',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  warning: {
    label: 'Warning',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
  },
  scheduled: {
    label: 'Scheduled',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Clock,
  },
  sent: {
    label: 'Sent',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  read: {
    label: 'Read',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CheckCircle2,
  },
  unread: {
    label: 'Unread',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Clock,
  },
  checked_in: {
    label: 'Inside Gym',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  checked_out: {
    label: 'Checked Out',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CheckCircle2,
  },
  present: {
    label: 'Present',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  late: {
    label: 'Late Check-in',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  available: {
    label: 'Available',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  busy: {
    label: 'In Session',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  on_leave: {
    label: 'On Leave',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: PauseCircle,
  },
  half_day: {
    label: 'Half Day',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  rescheduled: {
    label: 'Rescheduled',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
};

export function StatusBadge({ status = 'active', label, className = '' }) {
  const key = String(status).toLowerCase();
  const config = STATUS_MAP[key] || {
    label: label || status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0',
        config.classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label || config.label}</span>
    </span>
  );
}

export default StatusBadge;
