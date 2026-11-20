import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DataTable from '../tables/DataTable';
import SearchBar from '../ui/SearchBar';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function RecentTransactionsTable({ transactions = [] }) {
  const [query, setQuery] = useState('');

  const filtered = transactions.filter((txn) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      txn.id.toLowerCase().includes(q) ||
      txn.gymName.toLowerCase().includes(q) ||
      txn.plan.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800">
          {row.id}
        </span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => (
        <span className="font-medium text-slate-800">{row.gymName}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
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
    {
      key: 'date',
      header: 'Payment Date',
      render: (row) => (
        <span className="text-slate-600 tabular-nums whitespace-nowrap">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (row) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">{row.method}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Recent Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest subscription settlements and billing attempts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Filter by ID or gym..."
            className="sm:w-60"
          />
          <Link
            to="/super-admin/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No matching transactions"
        emptyDescription="Clear the search input to view recent subscription payments."
        emptyActionLabel="Clear filter"
        onEmptyAction={() => setQuery('')}
      />
    </section>
  );
}

export default RecentTransactionsTable;
