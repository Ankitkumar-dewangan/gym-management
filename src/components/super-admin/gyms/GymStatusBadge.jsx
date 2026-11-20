import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  HelpCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const GYM_STATUS_CONFIG = {
  active: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending Approval',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  suspended: {
    label: 'Suspended',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: PauseCircle,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileEdit,
  },
  info_requested: {
    label: 'Info Requested',
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: HelpCircle,
  },
};

export function GymStatusBadge({ status = 'active', className = '' }) {
  const key = String(status).toLowerCase();
  const cfg = GYM_STATUS_CONFIG[key] || GYM_STATUS_CONFIG.inactive;
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0',
        cfg.classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  );
}

export default GymStatusBadge;
