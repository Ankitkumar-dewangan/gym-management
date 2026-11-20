import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Clock, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { calculateRemainingDays, REFERENCE_TODAY } from '../../../utils/membershipCalculations';

const EXPIRY_BUCKETS = [
  { key: 'all', label: 'All Within 30 Days', maxDays: 30 },
  { key: 'today', label: 'Expiring Today', maxDays: 0 },
  { key: '3d', label: 'Within 3 Days', maxDays: 3 },
  { key: '7d', label: 'Within 7 Days', maxDays: 7 },
  { key: '15d', label: 'Within 15 Days', maxDays: 15 },
  { key: '30d', label: 'Within 30 Days', maxDays: 30 },
];

export function UpcomingExpiriesPage() {
  const navigate = useNavigate();
  const {
    tenantPlans,
    scopedMemberships,
    renewMembershipRecord,
    sendExpiryReminder,
  } = useMembershipManagement();

  const [bucketKey, setBucketKey] = useState('all');
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('');

  const upcomingAll = useMemo(
    () =>
      scopedMemberships
        .filter((m) => m.status === 'active')
        .map((m) => ({
          ...m,
          remainingDays: calculateRemainingDays(m.expiryDate),
        }))
        .filter((m) => m.remainingDays >= 0 && m.remainingDays <= 30)
        .sort((a, b) => a.remainingDays - b.remainingDays),
    [scopedMemberships]
  );

  const counts = useMemo(
    () => ({
      today: upcomingAll.filter((m) => m.remainingDays === 0).length,
      d3: upcomingAll.filter((m) => m.remainingDays <= 3).length,
      d7: upcomingAll.filter((m) => m.remainingDays <= 7).length,
      d15: upcomingAll.filter((m) => m.remainingDays <= 15).length,
      d30: upcomingAll.length,
    }),
    [upcomingAll]
  );

  const filtered = useMemo(() => {
    const bucket = EXPIRY_BUCKETS.find((b) => b.key === bucketKey) || EXPIRY_BUCKETS[0];
    if (bucket.key === 'today') return upcomingAll.filter((m) => m.remainingDays === 0);
    return upcomingAll.filter((m) => m.remainingDays <= bucket.maxDays);
  }, [upcomingAll, bucketKey]);

  const handleSendReminder = (row) => {
    sendExpiryReminder(row.id);
    toast.success(`Renewal reminder sent to ${row.memberName}`);
  };

  const handleConfirmRenew = () => {
    if (!renewTarget) return;
    renewMembershipRecord(renewTarget.id, {
      planId: renewPlanId || renewTarget.planId,
      renewalDate: REFERENCE_TODAY,
    });
    toast.success(`Renewed membership for ${renewTarget.memberName}`);
    setRenewTarget(null);
  };

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[170px]">
          <UserAvatar src={row.memberAvatar} name={row.memberName} size="md" />
          <div className="min-w-0">
            <Link
              to={`/gym/members/${row.memberId}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
            >
              {row.memberName}
            </Link>
            <p className="text-xs font-mono text-slate-500">{row.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Membership Plan',
      render: (row) => <span className="text-xs font-semibold text-slate-800">{row.planName}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-700">{formatDate(row.expiryDate)}</span>,
    },
    {
      key: 'remainingDays',
      header: 'Urgency',
      render: (row) => {
        if (row.remainingDays === 0) {
          return <StatusBadge status="overdue" label="Expires Today" />;
        }
        if (row.remainingDays <= 3) {
          return <StatusBadge status="overdue" label={`${row.remainingDays} days left`} />;
        }
        if (row.remainingDays <= 7) {
          return <StatusBadge status="pending" label={`${row.remainingDays} days left`} />;
        }
        return <StatusBadge status="trial" label={`${row.remainingDays} days left`} />;
      },
    },
    {
      key: 'finalAmount',
      header: 'Renewal Amount',
      numeric: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-900">
          {formatCurrency(row.finalAmount)}
        </span>
      ),
    },
    {
      key: 'reminderStatus',
      header: 'Reminder Status',
      render: (row) => (
        <StatusBadge
          status={row.reminderStatus === 'Sent' ? 'sent' : 'pending'}
          label={row.reminderStatus}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="emerald"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => {
              setRenewTarget(row);
              setRenewPlanId(row.planId);
            }}
          >
            Renew
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={Bell}
            onClick={() => handleSendReminder(row)}
          >
            Remind
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/gym/members/${row.memberId}`)}
            aria-label={`View ${row.memberName}`}
            className="px-2"
          >
            <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Expiries"
        description="Track expiring memberships by urgency window, dispatch reminders, and process renewals."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/gym/membership/renewals')}
          >
            Open Renewal Workbench
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Expiring Today"
          value={String(counts.today)}
          trend={counts.today > 0 ? 'down' : 'neutral'}
          helperText="immediate action"
          icon={Clock}
        />
        <StatCard
          label="Within 3 Days"
          value={String(counts.d3)}
          trend={counts.d3 > 0 ? 'down' : 'neutral'}
          helperText="critical window"
          icon={Clock}
        />
        <StatCard
          label="Within 7 Days"
          value={String(counts.d7)}
          helperText="follow-up queue"
          icon={Bell}
        />
        <StatCard
          label="Within 30 Days"
          value={String(counts.d30)}
          helperText="upcoming pipeline"
          icon={RefreshCw}
        />
      </div>

      {/* Category Filter Buttons */}
      <div className="inline-flex flex-wrap items-center rounded-lg border border-slate-200 bg-white p-1 gap-1">
        {EXPIRY_BUCKETS.map((bucket) => (
          <button
            key={bucket.key}
            type="button"
            onClick={() => setBucketKey(bucket.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
              bucketKey === bucket.key
                ? 'bg-navy-900 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {bucket.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/gym/membership/${row.id}`)}
        emptyTitle="No upcoming expiries in this window"
        emptyDescription="All scoped memberships are currently well clear of this expiry threshold."
      />

      <Modal
        isOpen={Boolean(renewTarget)}
        onClose={() => setRenewTarget(null)}
        title="Renew Expiring Membership"
        description={
          renewTarget
            ? `${renewTarget.memberName} (${renewTarget.memberId}) · Expires ${formatDate(renewTarget.expiryDate)}`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>Confirm Renewal</Button>
          </>
        }
      >
        <Select
          label="Renewal Plan"
          value={renewPlanId}
          onChange={(e) => setRenewPlanId(e.target.value)}
          options={tenantPlans.map((p) => ({
            value: p.id,
            label: `${p.name} — ₹${p.regularPrice} (${p.durationDays}d)`,
          }))}
        />
      </Modal>
    </div>
  );
}

export default UpcomingExpiriesPage;
