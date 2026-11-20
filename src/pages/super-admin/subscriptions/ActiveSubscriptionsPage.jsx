import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CalendarPlus,
  Eye,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
import {
  ChangePlanModal,
  ExtendSubscriptionModal,
} from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function ActiveSubscriptionsPage() {
  const {
    plans,
    subscriptions,
    changeSubscriptionPlan,
    extendSubscription,
    cancelSubscription,
  } = useSubscriptions();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [fromDate, setFromDate] = useState('');
  const [sortField, setSortField] = useState('nextRenewalDate');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [subForPlan, setSubForPlan] = useState(null);
  const [subForExtend, setSubForExtend] = useState(null);
  const [subToCancel, setSubToCancel] = useState(null);

  const pageSize = 6;

  const hasActiveFilters =
    Boolean(search.trim()) ||
    planFilter !== 'all' ||
    cycleFilter !== 'all' ||
    statusFilter !== 'active' ||
    Boolean(fromDate);

  const resetFilters = () => {
    setSearch('');
    setPlanFilter('all');
    setCycleFilter('all');
    setStatusFilter('active');
    setFromDate('');
    setCurrentPage(1);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = subscriptions.filter((sub) => {
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesPlan = planFilter === 'all' || sub.planName === planFilter;
      const matchesCycle = cycleFilter === 'all' || sub.billingCycle === cycleFilter;
      const matchesDate = !fromDate || sub.startDate >= fromDate;
      const matchesSearch =
        !q ||
        sub.gymName.toLowerCase().includes(q) ||
        sub.ownerName.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q);
      return matchesStatus && matchesPlan && matchesCycle && matchesDate && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const vA = sortField === 'amount' ? a.amount : String(a[sortField] || '').toLowerCase();
      const vB = sortField === 'amount' ? b.amount : String(b[sortField] || '').toLowerCase();
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [subscriptions, search, planFilter, cycleFilter, statusFilter, fromDate, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const sortBtn = (label, field) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
    >
      <span>{label}</span>
      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  const columns = [
    {
      key: 'gymName',
      header: sortBtn('Gym Name', 'gymName'),
      render: (row) => (
        <div>
          <Link
            to={`/super-admin/subscriptions/${row.id}`}
            className="font-semibold text-slate-800 hover:text-navy-800 hover:underline"
          >
            {row.gymName}
          </Link>
          <p className="font-mono text-[11px] text-slate-400">{row.id}</p>
        </div>
      ),
    },
    { key: 'ownerName', header: 'Owner Name' },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (row) => <SubscriptionBadge plan={row.planName} />,
    },
    { key: 'billingCycle', header: 'Billing Cycle' },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.startDate)}
        </span>
      ),
    },
    {
      key: 'nextRenewalDate',
      header: sortBtn('Next Renewal Date', 'nextRenewalDate'),
      render: (row) => (
        <span className="tabular-nums text-slate-700 whitespace-nowrap">
          {formatDate(row.nextRenewalDate)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: sortBtn('Amount', 'amount'),
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.paymentStatus} />,
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
        <div className="inline-flex items-center justify-end gap-1">
          <Link
            to={`/super-admin/subscriptions/${row.id}`}
            title="View Details"
            aria-label={`View ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setSubForPlan(row)}
            title="Change Plan"
            aria-label={`Change plan for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSubForExtend(row)}
            title="Extend Subscription"
            aria-label={`Extend subscription for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          </button>
          {row.status === 'active' && (
            <button
              type="button"
              onClick={() => setSubToCancel(row)}
              title="Cancel Subscription"
              aria-label={`Cancel subscription for ${row.gymName}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Subscriptions"
        description="Monitor active tenant billing cycles, renewal dates, and subscription plan tiers."
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by gym name or owner..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by plan"
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Plans' },
            ...plans.map((p) => ({ value: p.name, label: p.name })),
          ]}
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by billing cycle"
          value={cycleFilter}
          onChange={(e) => {
            setCycleFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Cycles' },
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Yearly', label: 'Yearly' },
          ]}
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'all', label: 'All Statuses' },
            { value: 'trial', label: 'Trial' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          containerClassName="sm:w-36"
        />
        <Input
          type="date"
          aria-label="Start date from"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setCurrentPage(1);
          }}
          containerClassName="sm:w-40"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No subscriptions match your filters"
        emptyDescription="Clear your search or filter selections to view subscriptions."
        emptyActionLabel="Reset filters"
        onEmptyAction={resetFilters}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: filteredAndSorted.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
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

      <ExtendSubscriptionModal
        isOpen={Boolean(subForExtend)}
        onClose={() => setSubForExtend(null)}
        subscription={subForExtend}
        onConfirm={(sub, days) => {
          extendSubscription(sub.id, days);
          toast.success(`Extended ${sub.gymName} by ${days} days`);
          setSubForExtend(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(subToCancel)}
        onClose={() => setSubToCancel(null)}
        onConfirm={() => {
          if (!subToCancel) return;
          cancelSubscription(subToCancel.id);
          toast.error(`Cancelled subscription for ${subToCancel.gymName}`);
          setSubToCancel(null);
        }}
        title={`Cancel ${subToCancel?.gymName}'s subscription?`}
        description="Cancelling stops future automatic renewals in this preview environment."
        confirmLabel="Cancel Subscription"
        variant="danger"
      />
    </div>
  );
}

export default ActiveSubscriptionsPage;
