import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { TransactionDetailsModal } from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import { GATEWAY_SUMMARY } from '../../../constants/financialData';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const PAYMENT_SECTIONS = [
  { id: 'paid', label: 'Successful Payments' },
  { id: 'pending', label: 'Pending Payments' },
  { id: 'failed', label: 'Failed Payments' },
];

export function PaymentManagementPage() {
  const { transactions } = useSubscriptions();
  const [activeTab, setActiveTab] = useState('paid');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const counts = useMemo(
    () => ({
      paid: transactions.filter((t) => t.status === 'paid').length,
      pending: transactions.filter((t) => t.status === 'pending').length,
      failed: transactions.filter((t) => t.status === 'failed').length,
    }),
    [transactions]
  );

  const sectionRecords = useMemo(
    () => transactions.filter((t) => t.status === activeTab),
    [transactions, activeTab]
  );

  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.id}</span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    { key: 'gateway', header: 'Payment Gateway' },
    { key: 'method', header: 'Payment Method' },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.date)}
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
      header: 'Details',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedTxn(row)}
          aria-label={`View payment ${row.id}`}
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
        title="Payment Management"
        description="Inspect successful settlements, pending clearing items, failed charges, and gateway performance."
      />

      {/* Payment Gateway Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GATEWAY_SUMMARY.map((gw) => (
          <article
            key={gw.id}
            className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{gw.gateway}</h2>
              <StatusBadge status={gw.status} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(gw.processedVolume)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{gw.methods}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Success: {gw.successRate}</span>
              <span className="tabular-nums">{gw.settlementCycle}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Payment Status Sections */}
      <div className="flex flex-wrap items-center gap-2">
        {PAYMENT_SECTIONS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                isActive
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[11px] tabular-nums',
                  isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={sectionRecords}
        emptyTitle="No payments in this category"
        emptyDescription="Switch between Successful, Pending, and Failed tabs to review payment records."
      />

      <TransactionDetailsModal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </div>
  );
}

export default PaymentManagementPage;
