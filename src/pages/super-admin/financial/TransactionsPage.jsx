import { useMemo, useState } from 'react';
import { ArrowUpDown, Download, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
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

export function TransactionsPage() {
  const { transactions, subscriptions } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gymFilter, setGymFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const pageSize = 6;

  const ownerByGym = useMemo(() => {
    const map = {};
    subscriptions.forEach((s) => {
      map[s.gymName] = s.ownerName;
    });
    return map;
  }, [subscriptions]);

  const enrichedTransactions = useMemo(
    () =>
      transactions.map((t) => ({
        ...t,
        ownerName: t.ownerName || ownerByGym[t.gymName] || 'Gym Owner',
      })),
    [transactions, ownerByGym]
  );

  const gymOptions = useMemo(
    () => Array.from(new Set(enrichedTransactions.map((t) => t.gymName))).sort(),
    [enrichedTransactions]
  );

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
    const filtered = enrichedTransactions.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesGym = gymFilter === 'all' || t.gymName === gymFilter;
      const matchesMethod = methodFilter === 'all' || t.method === methodFilter;
      const matchesFrom = !fromDate || t.date >= fromDate;
      const matchesTo = !toDate || t.date <= toDate;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.invoiceNo.toLowerCase().includes(q) ||
        t.gymName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q);
      return (
        matchesStatus &&
        matchesGym &&
        matchesMethod &&
        matchesFrom &&
        matchesTo &&
        matchesSearch
      );
    });

    return [...filtered].sort((a, b) => {
      const vA = sortField === 'amount' ? a.amount : String(a[sortField] || '').toLowerCase();
      const vB = sortField === 'amount' ? b.amount : String(b[sortField] || '').toLowerCase();
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    enrichedTransactions,
    search,
    statusFilter,
    gymFilter,
    methodFilter,
    fromDate,
    toDate,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== 'all' ||
    gymFilter !== 'all' ||
    methodFilter !== 'all' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setGymFilter('all');
    setMethodFilter('all');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Invoice No',
      'Gym Name',
      'Owner Name',
      'Plan',
      'Amount',
      'Payment Method',
      'Gateway',
      'Date',
      'Status',
    ];
    const rows = filteredAndSorted.map((t) => [
      t.id,
      t.invoiceNo,
      `"${t.gymName}"`,
      `"${t.ownerName}"`,
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
    link.download = 'GymPilot-financial-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredAndSorted.length} transactions`);
  };

  const handleDownloadInvoice = (txn) => {
    const content = [
      'GymPilot GYM SAAS — INVOICE RECEIPT (POWERED BY AGP EMPIRE)',
      `Invoice Number: ${txn.invoiceNo}`,
      `Transaction ID: ${txn.id}`,
      `Date: ${txn.date}`,
      `Gym Name: ${txn.gymName}`,
      `Owner Name: ${txn.ownerName}`,
      `Subscription Plan: ${txn.planName}`,
      `Payment Method: ${txn.method} (${txn.gateway})`,
      `Amount: ${formatCurrency(txn.amount)}`,
      `Status: ${txn.status.toUpperCase()}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${txn.invoiceNo || txn.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded invoice ${txn.invoiceNo || txn.id}`);
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
        <div>
          <p className="font-mono text-xs font-semibold text-slate-900">{row.id}</p>
          <p className="font-mono text-[11px] text-slate-400">{row.invoiceNo}</p>
        </div>
      ),
    },
    {
      key: 'gymName',
      header: sortBtn('Gym Name', 'gymName'),
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    { key: 'ownerName', header: 'Owner Name' },
    {
      key: 'planName',
      header: 'Subscription Plan',
      render: (row) => <SubscriptionBadge plan={row.planName} />,
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
    { key: 'gateway', header: 'Gateway' },
    {
      key: 'date',
      header: sortBtn('Transaction Date', 'date'),
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
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
            onClick={() => setSelectedTxn(row)}
            title="View Transaction Details"
            aria-label={`View transaction ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadInvoice(row)}
            title="Download Invoice"
            aria-label={`Download invoice for ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Searchable financial ledger across all gym subscriptions, payment methods, and gateways."
        actions={
          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search transaction ID, invoice, gym, or owner..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by payment status"
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
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by gym"
          value={gymFilter}
          onChange={(e) => {
            setGymFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Gyms' },
            ...gymOptions.map((g) => ({ value: g, label: g })),
          ]}
          containerClassName="sm:w-44"
        />
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
          containerClassName="sm:w-40"
        />
        <Input
          type="date"
          aria-label="From date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setCurrentPage(1);
          }}
          containerClassName="sm:w-38"
        />
        <Input
          type="date"
          aria-label="To date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setCurrentPage(1);
          }}
          containerClassName="sm:w-38"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No matching transactions"
        emptyDescription="Adjust your filters or date range to inspect ledger activity."
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

export default TransactionsPage;
