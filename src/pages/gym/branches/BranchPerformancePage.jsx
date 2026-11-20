import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Download, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import {
  BranchExpenseBreakdownChart,
  BranchMemberGrowthChart,
  BranchMonthlyRevenueAreaChart,
} from '../../../components/gym/branches/BranchCharts';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import {
  PEAK_GYM_HOURS_DATA,
  WEEKLY_ATTENDANCE_DATA,
} from '../../../constants/gymOwnerData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { formatCurrency } from '../../../utils/formatters';

const ANALYTICS_RANGES = [
  { value: '30d', label: 'Last 30 Days', scale: 1 },
  { value: '90d', label: 'Last 3 Months', scale: 2.85 },
  { value: '6m', label: 'Last 6 Months', scale: 5.5 },
  { value: '1y', label: 'This Year', scale: 11.4 },
];

export function BranchPerformancePage() {
  const { activeTenant } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const [dateRange, setDateRange] = useState('30d');
  const [selectedBranchId, setSelectedBranchId] = useState('all');

  const rangeObj = useMemo(
    () => ANALYTICS_RANGES.find((r) => r.value === dateRange) || ANALYTICS_RANGES[0],
    [dateRange]
  );

  const scopedBranches = useMemo(() => {
    const base =
      selectedBranchId === 'all'
        ? (tenantBranches || [])
        : (tenantBranches || []).filter((b) => b.id === selectedBranchId);

    return base.map((b) => ({
      ...b,
      monthlyRevenue: Math.round((b.monthlyRevenue || 0) * rangeObj.scale),
      monthlyExpenses: Math.round((b.monthlyExpenses || 0) * rangeObj.scale),
      newMembers: Math.round((b.newMembers || 0) * Math.min(4, rangeObj.scale)),
      expenseBreakdown: {
        rent: Math.round((b.expenseBreakdown?.rent || 0) * rangeObj.scale),
        salaries: Math.round((b.expenseBreakdown?.salaries || 0) * rangeObj.scale),
        electricity: Math.round((b.expenseBreakdown?.electricity || 0) * rangeObj.scale),
        maintenance: Math.round((b.expenseBreakdown?.maintenance || 0) * rangeObj.scale),
        other: Math.round((b.expenseBreakdown?.other || 0) * rangeObj.scale),
      },
    }));
  }, [tenantBranches, selectedBranchId, rangeObj.scale]);

  const monthlyHistory = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((month, idx) => {
      let revenue = 0;
      let expenses = 0;
      for (const b of scopedBranches) {
        const pt = b.revenueHistory?.[idx];
        revenue += pt?.revenue || 0;
        expenses += pt?.expenses || 0;
      }
      return { month, revenue, expenses };
    });
  }, [scopedBranches]);

  const branchAttendanceSeries = useMemo(() => {
    const share =
      selectedBranchId === 'all'
        ? 1
        : Math.max(0.25, 1 / Math.max(1, tenantBranches.length));
    return WEEKLY_ATTENDANCE_DATA.map((d) => ({
      day: d.day,
      dailyAttendance: Math.round(d.checkIns * share),
      weeklyAvg: Math.round(d.checkOuts * share * 0.96),
    }));
  }, [selectedBranchId, tenantBranches.length]);

  const peakHoursSeries = useMemo(() => {
    const share =
      selectedBranchId === 'all'
        ? 1
        : Math.max(0.25, 1 / Math.max(1, tenantBranches.length));
    return PEAK_GYM_HOURS_DATA.map((p) => ({
      hour: p.hour,
      occupancy: Math.round(p.occupancy * share),
    }));
  }, [selectedBranchId, tenantBranches.length]);

  const handleExportAnalytics = () => {
    const headers = ['Branch', 'Revenue', 'Expenses', 'Active Members', 'New Registrations', 'Expired'];
    const rows = scopedBranches.map((b) =>
      [`"${b.name}"`, b.monthlyRevenue, b.monthlyExpenses, b.activeMembers, b.newMembers, b.expiredMembers].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-branch-analytics.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported branch performance analytics CSV');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Performance Analytics"
        description={`Deep financial, membership, attendance, and expense diagnostics across ${activeTenant.name}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/branches">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Branches
              </Button>
            </Link>
            <Link to="/gym/branches/comparison">
              <Button variant="outline" size="sm" leftIcon={GitCompare}>
                Compare Matrix
              </Button>
            </Link>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={handleExportAnalytics}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 h-10">
            <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Select analytics period"
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {ANALYTICS_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <Select
            aria-label="Filter analytics by branch"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches Consolidated' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
            containerClassName="sm:w-56"
          />
        </div>

        <p className="text-xs text-slate-500">
          Combined Revenue:{' '}
          <strong className="font-mono text-slate-900">
            {formatCurrency(
              scopedBranches.reduce((sum, b) => sum + (b.monthlyRevenue || 0), 0)
            )}
          </strong>
        </p>
      </div>

      {/* A. Revenue Comparison */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            A. Branch-wise Revenue ({rangeObj.label})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Gross collections across locations
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scopedBranches}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.split(' ').slice(0, 2).join(' ')}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
                />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="monthlyRevenue" name="Revenue" fill="#14213D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Monthly Revenue vs Expense Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            6-month consolidated comparison
          </p>
          <BranchMonthlyRevenueAreaChart history={monthlyHistory} />
        </div>
      </section>

      {/* B. Member Growth & D. Expense Comparison */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            B. Member Growth by Branch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            New registrations, active members, and expired memberships
          </p>
          <BranchMemberGrowthChart branches={scopedBranches} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            D. Operating Expense Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Rent, salaries, electricity, maintenance, and other operating costs
          </p>
          <BranchExpenseBreakdownChart branches={scopedBranches} />
        </div>
      </section>

      {/* C. Attendance Analytics */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            C. Daily Attendance & Weekly Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Check-in activity compared against trailing weekly average
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={branchAttendanceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="dailyAttendance" name="Daily Attendance" stroke="#10B981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="weeklyAvg" name="Weekly Baseline" stroke="#14213D" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Peak Gym Hours</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Hourly floor load distribution
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="occupancy" name="Members on Floor" fill="#0EA5E9" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BranchPerformancePage;
