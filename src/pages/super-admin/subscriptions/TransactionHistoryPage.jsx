import { useMemo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { TransactionDetailsModal } from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
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

export function TransactionHistoryPage() {
  const { transactions } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [gymFilter, setGymFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const gymOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.gymName))).sort(),
    [transactions]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesGym = gymFilter === 'all' || t.gymName === gymFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || t.method === methodFilter;
      const matchesFrom = !fromDate || t.date >= fromDate;
      const matchesTo = !toDate || t.date <= toDate;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.invoiceNo.toLowerCase().includes(q) ||
        t.gymName.toLowerCase().includes(q);
      return (
        matchesGym &&
        matchesStatus &&
        matchesMethod &&
        matchesFrom &&
        matchesTo &&
        matchesSearch
      );
    });
  }, [transactions, search, gymFilter, statusFilter, methodFilter, fromDate, toDate]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    gymFilter !== 'all' ||
    statusFilter !== 'all' ||
    methodFilter !== 'all' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const resetFilters = () => {
    setSearch('');
    setGymFilter('all');
    setStatusFilter('all');
    setMethodFilter('all');
    setFromDate('');
    setToDate('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Invoice',
      'Gym Name',
      'Plan',
      'Amount',
      'Method',
      'Gateway',
      'Date',
      'Status',
    ];
    const rows = filtered.map((t) => [
      t.id,
      t.invoiceNo,
      `"${t.gymName}"`,
      t.planName,
      t.amount,
      t.method,
      t.gateway,
      t.date,
      t.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GymPilot-transaction-history.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions to CSV`);
  };

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
      key: 'invoiceNo',
      header: 'Invoice',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.invoiceNo}</span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    { key: 'planName', header: 'Plan' },
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
    { key: 'method', header: 'Method' },
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
      header: 'Invoice / Details',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={Eye}
          onClick={() => setSelectedTxn(row)}
        >
          Preview
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction History"
        description="Inspect full billing ledger records, invoice previews, and export settlement CSVs."
        actions={
          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search transaction ID, invoice, or gym..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by gym"
          value={gymFilter}
          onChange={(e) => setGymFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Gyms' },
            ...gymOptions.map((g) => ({ value: g, label: g })),
          ]}
          containerClassName="sm:w-48"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ]}
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by method"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Methods' },
            ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
          ]}
          containerClassName="sm:w-40"
        />
        <Input
          type="date"
          aria-label="From date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          containerClassName="sm:w-38"
        />
        <Input
          type="date"
          aria-label="To date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          containerClassName="sm:w-38"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No matching transactions"
        emptyDescription="Adjust your date range or filter selections to view ledger records."
        emptyActionLabel="Reset filters"
        onEmptyAction={resetFilters}
      />

      <TransactionDetailsModal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </div>
  );
}

export default TransactionHistoryPage;
