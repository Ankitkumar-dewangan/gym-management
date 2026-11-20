import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, CheckCircle2, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import UserAvatar from '../common/UserAvatar';
import DataTable from '../tables/DataTable';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/formatters';

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900 mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {Number(entry.value).toLocaleString()}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GymRevenueAnalyticsSection({ revenueSeriesByTab, branchLabel }) {
  const [periodTab, setPeriodTab] = useState('monthly');

  const tabs = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const activeData = revenueSeriesByTab[periodTab] || revenueSeriesByTab.monthly;

  const totals = useMemo(() => {
    const totalRev = activeData.reduce((sum, item) => sum + item.revenue, 0);
    const prevRev = activeData.reduce((sum, item) => sum + item.previous, 0);
    const growth = prevRev > 0 ? (((totalRev - prevRev) / prevRev) * 100).toFixed(1) : '0.0';
    return { totalRev, prevRev, growth };
  }, [activeData]);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Main Revenue Overview Chart */}
      <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Revenue Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {branchLabel} · Period revenue performance vs prior period
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPeriodTab(tab.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                  periodTab === tab.key
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 mb-5 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Revenue</p>
            <p className="mt-0.5 text-base sm:text-lg font-bold text-slate-900 tabular-nums font-display">
              {formatCurrency(totals.totalRev)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Previous Period</p>
            <p className="mt-0.5 text-base sm:text-lg font-semibold text-slate-700 tabular-nums font-display">
              {formatCurrency(totals.prevRev)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Revenue Growth</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-base sm:text-lg font-bold text-emerald-600 tabular-nums font-display">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              +{totals.growth}%
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gymRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14213D" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Current Revenue"
                stroke="#14213D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gymRevFill)"
              />
              <Area
                type="monotone"
                dataKey="previous"
                name="Previous Period"
                stroke="#94A3B8"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Stream Breakdown */}
      <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Revenue Stream Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Membership fees, personal training, and other income
            </p>
          </div>
          <Link
            to="/gym/reports/revenue"
            className="text-xs font-medium text-navy-900 hover:text-emerald-700 whitespace-nowrap"
          >
            Full Report
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#14213D]" /> Membership
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#10B981]" /> Personal Training
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#94A3B8]" /> Other Income
          </span>
        </div>

        <div className="h-64 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="membership" name="Membership" stackId="rev" fill="#14213D" radius={[0, 0, 0, 0]} />
              <Bar dataKey="training" name="Personal Training" stackId="rev" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="other" name="Other Income" stackId="rev" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export function MembershipAnalyticsSection({
  membershipMetrics,
  membershipDonut,
  membershipByTier,
}) {
  const metricPills = [
    { label: 'Active Memberships', value: membershipMetrics.active, tone: 'text-emerald-700' },
    { label: 'Expired Memberships', value: membershipMetrics.expired, tone: 'text-red-700' },
    { label: 'Expiring Soon', value: membershipMetrics.expiringSoon, tone: 'text-amber-700' },
    { label: 'Free Trial Members', value: membershipMetrics.freeTrials, tone: 'text-sky-700' },
    { label: 'Membership Renewals', value: membershipMetrics.renewals, tone: 'text-navy-900' },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Membership Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan distribution, lifecycle status, and billing tier volume
          </p>
        </div>
        <Link
          to="/gym/membership"
          className="text-xs font-medium text-navy-900 hover:text-emerald-700"
        >
          Manage Plans &rarr;
        </Link>
      </div>

      {/* 5 Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricPills.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-3"
          >
            <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
            <p className={cn('mt-1 text-xl font-bold tabular-nums font-display', item.tone)}>
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        {/* Donut Chart */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 rounded-lg border border-slate-100 bg-slate-50/40 p-4">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipDonut}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                >
                  {membershipDonut.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CountTooltip suffix=" members" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full space-y-2.5">
            <p className="text-xs font-semibold text-slate-700">Plan Status Share</p>
            {membershipDonut.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.name}
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {slice.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart by Plan Duration */}
        <div className="lg:col-span-7 rounded-lg border border-slate-100 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700">
              Members by Billing Cycle (Monthly / Quarterly / Half-Yearly / Yearly)
            </p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membershipByTier} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="tier"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CountTooltip suffix=" members" />} />
                <Bar dataKey="members" name="Members" fill="#14213D" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AttendanceAnalyticsSection({
  attendanceSummary,
  attendanceWeekly,
  attendanceDaily,
  peakHours,
  branchPerformance,
  recentAttendance,
}) {
  const [chartView, setChartView] = useState('weekly');

  const views = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'daily', label: 'Daily Trend' },
    { key: 'peak', label: 'Peak Hours' },
    { key: 'branch', label: 'By Branch' },
  ];

  const summaryItems = [
    { label: "Today's Check-ins", value: attendanceSummary.todayCheckIns, icon: Users },
    { label: 'Currently Inside Gym', value: attendanceSummary.currentlyInside, icon: Clock },
    { label: 'Total Check-outs', value: attendanceSummary.totalCheckOuts, icon: CheckCircle2 },
    { label: 'Avg Daily Attendance', value: attendanceSummary.avgDaily, icon: ArrowUpRight },
  ];

  const columns = [
    {
      key: 'memberName',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={row.avatar} name={row.memberName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.memberName}</p>
            <p className="text-xs font-mono text-slate-500">{row.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check-in Time',
      numeric: true,
    },
    {
      key: 'checkOut',
      header: 'Check-out Time',
      numeric: true,
    },
    {
      key: 'branch',
      header: 'Branch',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status === 'inside' ? 'active' : 'closed'}
          label={row.status === 'inside' ? 'Inside Gym' : 'Checked Out'}
        />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Attendance Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live check-in volume, peak gym floor hours, and branch occupancy
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start overflow-x-auto max-w-full">
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setChartView(v.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                  chartView === v.key
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-slate-50/70 px-4 py-3"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums font-display">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-navy-900 shrink-0">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Chart */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'weekly' ? (
              <BarChart data={attendanceWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CountTooltip suffix=" visits" />} />
                <Bar dataKey="checkIns" name="Check-ins" fill="#10B981" radius={[5, 5, 0, 0]} barSize={24} />
                <Bar dataKey="checkOuts" name="Check-outs" fill="#14213D" radius={[5, 5, 0, 0]} barSize={24} />
              </BarChart>
            ) : chartView === 'daily' ? (
              <AreaChart data={attendanceDaily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="attDailyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CountTooltip suffix=" check-ins" />} />
                <Area type="monotone" dataKey="checkIns" name="Daily Check-ins" stroke="#10B981" strokeWidth={2.5} fill="url(#attDailyFill)" />
              </AreaChart>
            ) : chartView === 'peak' ? (
              <BarChart data={peakHours} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CountTooltip suffix=" members" />} />
                <Bar dataKey="occupancy" name="Floor Occupancy" fill="#14213D" radius={[5, 5, 0, 0]} barSize={28} />
              </BarChart>
            ) : (
              <BarChart data={branchPerformance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CountTooltip suffix=" today" />} />
                <Bar dataKey="todaysAttendance" name="Today's Attendance" fill="#10B981" radius={[5, 5, 0, 0]} barSize={36} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Recent Attendance Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Recent Check-ins</h3>
            <Link
              to="/gym/attendance"
              className="text-xs font-medium text-navy-900 hover:text-emerald-700"
            >
              View Full Log &rarr;
            </Link>
          </div>
          <DataTable
            columns={columns}
            data={recentAttendance}
            emptyTitle="No recent check-ins"
            emptyDescription="Attendance scans for the selected branch will appear here."
          />
        </div>
      </div>
    </section>
  );
}

export function BranchPerformanceSection({
  branchPerformance,
  activeBranch,
  onSelectBranch,
}) {
  const columns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.city}</p>
        </div>
      ),
    },
    {
      key: 'totalMembers',
      header: 'Total Members',
      align: 'right',
      numeric: true,
      render: (row) => row.totalMembers.toLocaleString(),
    },
    {
      key: 'activeMembers',
      header: 'Active Members',
      align: 'right',
      numeric: true,
      render: (row) => row.activeMembers.toLocaleString(),
    },
    {
      key: 'monthlyRevenue',
      header: 'Monthly Revenue',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.monthlyRevenue),
    },
    {
      key: 'todaysAttendance',
      header: "Today's Attendance",
      align: 'right',
      numeric: true,
      render: (row) => row.todaysAttendance.toLocaleString(),
    },
    {
      key: 'expenses',
      header: 'Expenses',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.expenses),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Branch Performance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare member volume, revenue, attendance, and operating expenses across branches
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeBranch.id !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectBranch('all')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Reset to All Branches
            </button>
          )}
          <Link
            to="/gym/branches"
            className="text-xs font-medium text-navy-900 hover:text-emerald-700"
          >
            Manage Branches &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8">
          <DataTable
            columns={columns}
            data={branchPerformance}
            onRowClick={(row) => onSelectBranch(row.id)}
          />
        </div>

        <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">
            Branch Revenue Comparison
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerformance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar dataKey="monthlyRevenue" name="Revenue" fill="#14213D" radius={[5, 5, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#10B981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
