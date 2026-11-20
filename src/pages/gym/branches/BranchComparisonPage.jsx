import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart3, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import { formatCurrency } from '../../../utils/formatters';

export function BranchComparisonPage() {
  const { activeTenant } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const [selectedIds, setSelectedIds] = useState([]);

  const comparedBranches = useMemo(() => {
    if (selectedIds.length === 0) return tenantBranches;
    const picked = tenantBranches.filter((b) => selectedIds.includes(b.id));
    return picked.length > 0 ? picked : tenantBranches;
  }, [tenantBranches, selectedIds]);

  const rankings = useMemo(() => {
    if (!comparedBranches.length) return { highest: null, lowest: null };
    const sorted = [...comparedBranches].sort(
      (a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0)
    );
    return {
      highest: sorted[0],
      lowest: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    };
  }, [comparedBranches]);

  const toggleBranchSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const chartData = comparedBranches.map((b) => ({
    name: b.name.split(' ').slice(0, 2).join(' '),
    revenue: b.monthlyRevenue || 0,
    expenses: b.monthlyExpenses || 0,
    members: b.totalMembers || 0,
    attendance: b.todaysAttendance || 0,
    renewals: b.renewals || 0,
  }));

  const handleExportComparison = () => {
    const headers = [
      'Branch',
      'Code',
      'Total Members',
      'Monthly Revenue',
      'Today Attendance',
      'Expenses',
      'Membership Renewals',
      'Net Margin',
    ];
    const rows = comparedBranches.map((b) =>
      [
        `"${b.name}"`,
        `"${b.code}"`,
        b.totalMembers,
        b.monthlyRevenue,
        b.todaysAttendance,
        b.monthlyExpenses,
        b.renewals,
        (b.monthlyRevenue || 0) - (b.monthlyExpenses || 0),
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-branch-comparison.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported branch comparison CSV');
  };

  const columns = [
    {
      key: 'name',
      header: 'Branch',
      render: (row) => {
        const isHighest = rankings.highest?.id === row.id;
        const isLowest = rankings.lowest?.id === row.id;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <Link
                to={`/gym/branches/${row.id}`}
                className="font-semibold text-slate-900 hover:text-emerald-700"
              >
                {row.name}
              </Link>
              <p className="text-xs font-mono text-slate-500">
                {row.code} · {row.city}
              </p>
            </div>
            {isHighest && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                Top Performer
              </span>
            )}
            {isLowest && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                Needs Focus
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalMembers',
      header: 'Total Members',
      align: 'right',
      numeric: true,
      render: (row) => (row.totalMembers || 0).toLocaleString(),
    },
    {
      key: 'monthlyRevenue',
      header: 'Monthly Revenue',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.monthlyRevenue || 0),
    },
    {
      key: 'todaysAttendance',
      header: 'Attendance',
      align: 'right',
      numeric: true,
      render: (row) => (row.todaysAttendance || 0).toLocaleString(),
    },
    {
      key: 'monthlyExpenses',
      header: 'Expenses',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.monthlyExpenses || 0),
    },
    {
      key: 'renewals',
      header: 'Membership Renewals',
      align: 'right',
      numeric: true,
      render: (row) => (row.renewals || 0).toLocaleString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Comparison"
        description={`Benchmark ${activeTenant.name} branches side-by-side across members, revenue, attendance, expenses, and renewals.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/branches">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                All Branches
              </Button>
            </Link>
            <Link to="/gym/branches/performance">
              <Button variant="outline" size="sm" leftIcon={BarChart3}>
                Performance Analytics
              </Button>
            </Link>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={handleExportComparison}>
              Export Comparison
            </Button>
          </div>
        }
      />

      {/* Branch Multi-Selector */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Select Branches to Compare</p>
          <p className="text-xs text-slate-500">
            Leave empty to compare all {tenantBranches.length} locations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tenantBranches.map((b) => {
            const active = selectedIds.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBranchSelection(b.id)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  active
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                )}
              >
                {b.name}
              </button>
            );
          })}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer ml-1"
            >
              Show All
            </button>
          )}
        </div>
      </section>

      {/* Highest & Lowest Performing Highlights */}
      {rankings.highest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-white p-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-700">Highest Performing Branch</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{rankings.highest.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {rankings.highest.city} · {rankings.highest.totalMembers} members ·{' '}
                {rankings.highest.renewals} renewals
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-emerald-700 tabular-nums font-display">
                {formatCurrency(rankings.highest.monthlyRevenue)}
              </p>
              <p className="text-[11px] text-slate-500">monthly revenue</p>
            </div>
          </div>

          {rankings.lowest && (
            <div className="rounded-xl border border-amber-200 bg-white p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-amber-700">Lowest Performing Branch</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{rankings.lowest.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rankings.lowest.city} · {rankings.lowest.totalMembers} members ·{' '}
                  {rankings.lowest.renewals} renewals
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-amber-700 tabular-nums font-display">
                  {formatCurrency(rankings.lowest.monthlyRevenue)}
                </p>
                <p className="text-[11px] text-slate-500">monthly revenue</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Revenue vs Operating Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Financial efficiency across compared locations
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
                />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" name="Monthly Revenue" fill="#14213D" radius={[5, 5, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Members, Attendance & Renewals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Engagement and retention metrics side-by-side
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="members" name="Total Members" fill="#14213D" radius={[5, 5, 0, 0]} />
                <Bar dataKey="attendance" name="Today's Attendance" fill="#10B981" radius={[5, 5, 0, 0]} />
                <Bar dataKey="renewals" name="Renewals" fill="#0EA5E9" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Comparison Matrix Table */}
      <DataTable columns={columns} data={comparedBranches} />
    </div>
  );
}

export default BranchComparisonPage;
