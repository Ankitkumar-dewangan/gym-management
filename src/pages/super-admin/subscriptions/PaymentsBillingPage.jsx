import { useMemo, useState } from 'react';
import { ArrowUpDown, Eye } from 'lucide-react';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import { TransactionDetailsModal } from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Select from '../../../components/ui/Select';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Bank Transfer',
];

export function PaymentsBillingPage() {
  const { transactions, refunds } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const pageSize = 6;

  const kpis = useMemo(() => {
    const paidTxns = transactions.filter((t) => t.status === 'paid');
    const pendingTxns = transactions.filter((t) => t.status === 'pending');
    const failedTxns = transactions.filter((t) => t.status === 'failed');

    const totalCollections = paidTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalRefundAmount = refunds
      .filter((r) => r.status === 'processed' || r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalCollections,
      successfulCount: paidTxns.length,
      pendingCount: pendingTxns.length,
      failedCount: failedTxns.length,
      totalRefundAmount,
    };
  }, [transactions, refunds]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      const matchesMethod = methodFilter === 'all' || t.method === methodFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.gymName.toLowerCase().includes(q) ||
        t.gateway.toLowerCase().includes(q);
      return matchesMethod && matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const vA = sortField === 'amount' ? a.amount : String(a[sortField] || '').toLowerCase();
      const vB = sortField === 'amount' ? b.amount : String(b[sortField] || '').toLowerCase();
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, search, methodFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters =
    Boolean(search.trim()) || methodFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setMethodFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

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
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800">{row.id}</span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    {
      key: 'subscriptionId',
      header: 'Subscription',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.planName} · <span className="font-mono">{row.subscriptionId}</span>
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
    { key: 'method', header: 'Payment Method' },
    {
      key: 'date',
      header: sortBtn('Payment Date', 'date'),
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.date)}
        </span>
      ),
    },
    { key: 'gateway', header: 'Payment Gateway' },
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
        <button
          type="button"
          onClick={() => setSelectedTxn(row)}
          aria-label={`Inspect transaction ${row.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Billing"
        description="Monitor platform collections, gateway settlements, pending invoices, and payment retries."
      />

      {/* 5 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          label="Total Collections"
          value={formatCurrency(kpis.totalCollections)}
          change="+16.4%"
          trend="up"
          previousLabel="settled period"
          icon="Wallet"
        />
        <AdminStatCard
          label="Successful Payments"
          value={String(kpis.successfulCount)}
          change="94.2%"
          trend="up"
          previousLabel="success rate"
          icon="CreditCard"
        />
        <AdminStatCard
          label="Pending Payments"
          value={String(kpis.pendingCount)}
          change="Due"
          trend="neutral"
          previousLabel="awaiting settlement"
          icon="Clock"
        />
        <AdminStatCard
          label="Failed Payments"
          value={String(kpis.failedCount)}
          change="-1"
          trend="down"
          previousLabel="retry scheduled"
          icon="Activity"
        />
        <AdminStatCard
          label="Total Refunds"
          value={formatCurrency(kpis.totalRefundAmount)}
          change="0.8%"
          trend="neutral"
          previousLabel="of gross volume"
          icon="RotateCcw"
        />
      </section>

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search transaction ID, gym, or gateway..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by payment method"
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Methods' },
            ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
          ]}
          containerClassName="sm:w-44"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ]}
          containerClassName="sm:w-40"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No payments found"
        emptyDescription="Clear your filters to inspect all platform payment records."
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

      <TransactionDetailsModal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </div>
  );
}

export default PaymentsBillingPage;
