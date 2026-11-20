import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, History, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { REFERENCE_TODAY } from '../../../utils/membershipCalculations';

export function ExpiredMembershipsPage() {
  const navigate = useNavigate();
  const {
    tenantPlans,
    scopedMemberships,
    renewMembershipRecord,
    sendExpiryReminder,
  } = useMembershipManagement();

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('');

  const expiredRows = useMemo(
    () => scopedMemberships.filter((m) => m.status === 'expired'),
    [scopedMemberships]
  );

  const totalOutstanding = useMemo(
    () => expiredRows.reduce((sum, r) => sum + (Number(r.pendingAmount) || 0), 0),
    [expiredRows]
  );

  const handleConfirmRenew = () => {
    if (!renewTarget) return;
    renewMembershipRecord(renewTarget.id, {
      planId: renewPlanId || renewTarget.planId,
      renewalDate: REFERENCE_TODAY,
    });
    toast.success(`Reactivated & renewed ${renewTarget.memberName}`);
    setRenewTarget(null);
  };

  const columns = [
    {
      key: 'member',
      header: 'Member Name',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[170px]">
          <UserAvatar src={row.memberAvatar} name={row.memberName} size="md" />
          <div className="min-w-0">
            <Link
              to={`/gym/membership/${row.id}`}
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
      header: 'Previous Plan',
      render: (row) => <span className="text-xs font-medium text-slate-800">{row.planName}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expired Date',
      numeric: true,
      render: (row) => <span className="text-xs text-red-700 font-medium">{formatDate(row.expiryDate)}</span>,
    },
    {
      key: 'pendingAmount',
      header: 'Outstanding Dues',
      numeric: true,
      render: (row) => (
        <span className={row.pendingAmount > 0 ? 'text-xs font-semibold text-red-700' : 'text-xs text-slate-500'}>
          {formatCurrency(row.pendingAmount)}
        </span>
      ),
    },
    {
      key: 'lastPayment',
      header: 'Last Payment',
      render: (row) => {
        const last = row.paymentHistory?.[0];
        return (
          <span className="text-xs font-mono text-slate-600">
            {last ? `${formatCurrency(last.amount)} · ${formatDate(last.date)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-xs text-slate-600">{row.branchName}</span>,
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
            leftIcon={Plus}
            onClick={() => navigate(`/gym/membership/assign?memberId=${row.memberId}`)}
          >
            New Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/gym/membership/${row.id}`)}
            title="View history"
            className="px-2"
          >
            <History className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sendExpiryReminder(row.id);
              toast.success(`Sent win-back reminder to ${row.memberName}`);
            }}
            title="Send reminder"
            className="px-2"
          >
            <Bell className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expired Memberships"
        description="Recover lapsed member cycles, clear outstanding dues, or assign a fresh plan."
        actions={
          <Button
            variant="emerald"
            leftIcon={Plus}
            onClick={() => navigate('/gym/membership/assign')}
          >
            Assign New Plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Expired Cycles"
          value={String(expiredRows.length)}
          trend={expiredRows.length > 0 ? 'down' : 'neutral'}
          helperText="pending reactivation"
          icon={RefreshCw}
        />
        <StatCard
          label="Outstanding Dues"
          value={formatCurrency(totalOutstanding)}
          helperText="unsettled balances"
          icon={Bell}
        />
        <StatCard
          label="Win-Back Queue"
          value={String(expiredRows.filter((r) => r.reminderStatus !== 'Sent').length)}
          helperText="awaiting reminder"
          icon={History}
        />
      </div>

      <DataTable
        columns={columns}
        data={expiredRows}
        onRowClick={(row) => navigate(`/gym/membership/${row.id}`)}
        emptyTitle="No expired memberships"
        emptyDescription="All scoped members currently hold active, frozen, or closed memberships."
      />

      <Modal
        isOpen={Boolean(renewTarget)}
        onClose={() => setRenewTarget(null)}
        title="Renew Expired Membership"
        description={renewTarget ? `Reactivate ${renewTarget.memberName} (${renewTarget.memberId})` : ''}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>Confirm Renewal</Button>
          </>
        }
      >
        <Select
          label="Select Plan"
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

export default ExpiredMembershipsPage;
