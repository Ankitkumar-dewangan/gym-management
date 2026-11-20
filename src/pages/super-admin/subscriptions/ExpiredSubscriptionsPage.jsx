import { useState } from 'react';
import { Ban, History, RefreshCw, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
import { ChangePlanModal } from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { useGymManagement } from '../../../contexts/GymManagementContext';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function ExpiredSubscriptionsPage() {
  const {
    plans,
    subscriptions,
    renewSubscription,
    changeSubscriptionPlan,
  } = useSubscriptions();
  const { updateGymStatus } = useGymManagement();

  const [search, setSearch] = useState('');
  const [subForPlan, setSubForPlan] = useState(null);
  const [subToSuspend, setSubToSuspend] = useState(null);

  const expiredSubs = subscriptions.filter((s) => {
    const isExpired = s.status === 'expired';
    const q = search.trim().toLowerCase();
    const matches =
      !q ||
      s.gymName.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q);
    return isExpired && matches;
  });

  const columns = [
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.gymName}</p>
          <p className="font-mono text-[11px] text-slate-400">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Previous Plan',
      render: (row) => <SubscriptionBadge plan={row.planName} />,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (row) => (
        <span className="tabular-nums text-red-700 font-medium">
          {formatDate(row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'outstandingAmount',
      header: 'Outstanding Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-red-700">
          {formatCurrency(row.outstandingAmount || row.amount)}
        </span>
      ),
    },
    {
      key: 'lastPaymentDate',
      header: 'Last Payment',
      render: (row) => (
        <span className="tabular-nums text-slate-600">
          {formatDate(row.lastPaymentDate)}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Information',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-800">{row.ownerEmail}</p>
          <p className="font-mono text-slate-500">{row.ownerPhone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <Button
            variant="emerald"
            size="sm"
            leftIcon={RotateCw}
            onClick={() => {
              renewSubscription(row.id);
              toast.success(`Renewed subscription for ${row.gymName}`);
            }}
          >
            Renew
          </Button>
          <button
            type="button"
            onClick={() => setSubForPlan(row)}
            title="Change Plan"
            aria-label={`Change plan for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <Link
            to={`/super-admin/subscriptions/${row.id}`}
            title="View History"
            aria-label={`View history for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setSubToSuspend(row)}
            title="Suspend Account"
            aria-label={`Suspend ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expired Subscriptions"
        description="Follow up on lapsed accounts, collect outstanding balances, or renew plans."
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expired subscriptions..."
        hasActiveFilters={Boolean(search.trim())}
        onReset={() => setSearch('')}
      />

      <DataTable
        columns={columns}
        data={expiredSubs}
        emptyTitle="No expired subscriptions"
        emptyDescription="All gym subscriptions are currently active or within trial."
      />

      <ChangePlanModal
        isOpen={Boolean(subForPlan)}
        onClose={() => setSubForPlan(null)}
        subscription={subForPlan}
        plans={plans}
        onConfirm={(sub, planId, cycle) => {
          changeSubscriptionPlan(sub.id, planId, cycle);
          toast.success(`Updated plan for ${sub.gymName}`);
          setSubForPlan(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(subToSuspend)}
        onClose={() => setSubToSuspend(null)}
        onConfirm={() => {
          if (!subToSuspend) return;
          updateGymStatus(
            subToSuspend.gymId,
            'suspended',
            'Account suspended due to expired subscription'
          );
          toast.error(`Suspended account for ${subToSuspend.gymName}`);
          setSubToSuspend(null);
        }}
        title={`Suspend ${subToSuspend?.gymName}?`}
        description="Suspending pauses gym owner portal access until the overdue balance is resolved."
        confirmLabel="Suspend Account"
        variant="danger"
      />
    </div>
  );
}

export default ExpiredSubscriptionsPage;
