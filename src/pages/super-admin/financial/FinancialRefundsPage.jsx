import { useMemo, useState } from 'react';
import { Check, CheckCheck, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function FinancialRefundsPage() {
  const { refunds, updateRefundStatus } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingRefund, setViewingRefund] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const kpis = useMemo(() => {
    const totalRequests = refunds.length;
    const pendingCount = refunds.filter((r) => r.status === 'pending').length;
    const approvedCount = refunds.filter(
      (r) => r.status === 'approved' || r.status === 'processed'
    ).length;
    const rejectedCount = refunds.filter((r) => r.status === 'rejected').length;
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
    return {
      totalRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalAmount,
    };
  }, [refunds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return refunds.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.transactionId.toLowerCase().includes(q) ||
        r.gymName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [refunds, search, statusFilter]);

  const confirmCopy = {
    approved: {
      title: 'Approve refund request?',
      description: 'Approving queues this refund for payout settlement.',
      label: 'Approve Refund',
      variant: 'emerald',
    },
    rejected: {
      title: 'Reject refund request?',
      description: 'Rejecting closes this request without issuing a payout.',
      label: 'Reject Refund',
      variant: 'danger',
    },
    processed: {
      title: 'Mark refund as processed?',
      description: 'Confirm that funds have been returned to the customer payment method.',
      label: 'Mark as Processed',
      variant: 'emerald',
    },
  };

  const columns = [
    {
      key: 'id',
      header: 'Refund ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.id}</span>
      ),
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.transactionId}</span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    {
      key: 'amount',
      header: 'Refund Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-xs">{row.reason}</span>
      ),
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.requestDate)}
        </span>
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
          <button
            type="button"
            onClick={() => setViewingRefund(row)}
            title="View Details"
            aria-label={`View refund ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => setPendingAction({ refund: row, nextStatus: 'approved' })}
                title="Approve Refund"
                aria-label={`Approve refund ${row.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPendingAction({ refund: row, nextStatus: 'rejected' })}
                title="Reject Refund"
                aria-label={`Reject refund ${row.id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              variant="emerald"
              size="sm"
              leftIcon={CheckCheck}
              onClick={() => setPendingAction({ refund: row, nextStatus: 'processed' })}
            >
              Mark as Processed
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeCopy = pendingAction ? confirmCopy[pendingAction.nextStatus] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Management"
        description="Evaluate customer refund requests, authorize payouts, and audit dispute decisions."
      />

      {/* 5 Refund KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          label="Total Refund Requests"
          value={String(kpis.totalRequests)}
          change="All"
          trend="neutral"
          previousLabel="in active cycle"
          icon="RotateCcw"
        />
        <AdminStatCard
          label="Pending Refunds"
          value={String(kpis.pendingCount)}
          change="Review"
          trend="neutral"
          previousLabel="awaiting decision"
          icon="Clock"
        />
        <AdminStatCard
          label="Approved Refunds"
          value={String(kpis.approvedCount)}
          change="Verified"
          trend="up"
          previousLabel="authorized & settled"
          icon="CheckCircle2"
        />
        <AdminStatCard
          label="Rejected Refunds"
          value={String(kpis.rejectedCount)}
          change="Closed"
          trend="down"
          previousLabel="outside policy"
          icon="AlertTriangle"
        />
        <AdminStatCard
          label="Total Refund Amount"
          value={formatCurrency(kpis.totalAmount)}
          change="1.1%"
          trend="neutral"
          previousLabel="of monthly volume"
          icon="DollarSign"
        />
      </section>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search refund ID, transaction ID, or gym..."
        hasActiveFilters={Boolean(search.trim()) || statusFilter !== 'all'}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      >
        <Select
          aria-label="Filter by refund status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'processed', label: 'Processed' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          containerClassName="sm:w-44"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No refund requests found"
        emptyDescription="Clear your search or status filter to view refund records."
      />

      <Modal
        isOpen={Boolean(viewingRefund)}
        onClose={() => setViewingRefund(null)}
        title={`Refund ${viewingRefund?.id || ''}`}
        description={`Transaction ${viewingRefund?.transactionId || ''} · ${viewingRefund?.gymName || ''}`}
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingRefund(null)}>
            Close
          </Button>
        }
      >
        {viewingRefund && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Refund Amount</p>
                <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(viewingRefund.amount)}
                </p>
              </div>
              <StatusBadge status={viewingRefund.status} />
            </div>
            <dl className="space-y-2.5">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Gym Organization</dt>
                <dd className="font-medium text-slate-900">{viewingRefund.gymName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Transaction ID</dt>
                <dd className="font-mono text-slate-800">{viewingRefund.transactionId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Request Date</dt>
                <dd className="tabular-nums text-slate-800">
                  {formatDate(viewingRefund.requestDate)}
                </dd>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <dt className="text-xs text-slate-500">Reason</dt>
                <dd className="mt-1 text-slate-800">{viewingRefund.reason}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          updateRefundStatus(pendingAction.refund.id, pendingAction.nextStatus);
          toast.success(
            `Refund ${pendingAction.refund.id} marked as ${pendingAction.nextStatus}`
          );
          setPendingAction(null);
        }}
        title={`${activeCopy?.title || ''} (${pendingAction?.refund?.id || ''})`}
        description={activeCopy?.description || ''}
        confirmLabel={activeCopy?.label || 'Confirm'}
        variant={activeCopy?.variant || 'emerald'}
      />
    </div>
  );
}

export default FinancialRefundsPage;
