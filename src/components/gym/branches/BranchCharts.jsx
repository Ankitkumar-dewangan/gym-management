import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

function BranchCurrencyTooltip({ active, payload, label }) {
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

function BranchCountTooltip({ active, payload, label, suffix = '' }) {
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

export function BranchDashboardComparisonChart({ branches }) {
  const chartData = branches.map((b) => ({
    name: b.name.length > 14 ? `${b.name.slice(0, 14)}…` : b.name,
    revenue: b.monthlyRevenue,
    expenses: b.monthlyExpenses,
    members: b.totalMembers,
    attendance: b.todaysAttendance,
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Branch Revenue vs. Expenses
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly gross collections against facility operating costs
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
              />
              <Tooltip content={<BranchCurrencyTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Monthly Revenue" fill="#14213D" radius={[5, 5, 0, 0]} />
              <Bar dataKey="expenses" name="Monthly Expenses" fill="#10B981" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Branch Members & Daily Attendance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total enrolled roster compared against today&apos;s branch check-ins
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<BranchCountTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="members" name="Total Members" fill="#14213D" radius={[5, 5, 0, 0]} />
              <Bar dataKey="attendance" name="Today's Attendance" fill="#0EA5E9" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function BranchExpenseBreakdownChart({ branches }) {
  const data = branches.map((b) => ({
    name: b.name.split(' ').slice(0, 2).join(' '),
    rent: b.expenseBreakdown?.rent || 0,
    salaries: b.expenseBreakdown?.salaries || 0,
    electricity: b.expenseBreakdown?.electricity || 0,
    maintenance: b.expenseBreakdown?.maintenance || 0,
    other: b.expenseBreakdown?.other || 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
          />
          <Tooltip content={<BranchCurrencyTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="rent" name="Rent" stackId="exp" fill="#14213D" />
          <Bar dataKey="salaries" name="Salaries" stackId="exp" fill="#10B981" />
          <Bar dataKey="electricity" name="Electricity" stackId="exp" fill="#0EA5E9" />
          <Bar dataKey="maintenance" name="Maintenance" stackId="exp" fill="#F59E0B" />
          <Bar dataKey="other" name="Other" stackId="exp" fill="#94A3B8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BranchMemberGrowthChart({ branches }) {
  const data = branches.map((b) => ({
    name: b.name.split(' ').slice(0, 2).join(' '),
    newRegistrations: b.newMembers || 0,
    activeMembers: b.activeMembers || 0,
    expiredMemberships: b.expiredMembers || 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <Tooltip content={<BranchCountTooltip suffix=" members" />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="activeMembers" name="Active Members" fill="#14213D" radius={[5, 5, 0, 0]} />
          <Bar dataKey="newRegistrations" name="New Registrations" fill="#10B981" radius={[5, 5, 0, 0]} />
          <Bar dataKey="expiredMemberships" name="Expired Memberships" fill="#EF4444" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BranchMonthlyRevenueAreaChart({ history = [] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="branchRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
          />
          <Tooltip content={<BranchCurrencyTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10B981"
            strokeWidth={2.5}
            fill="url(#branchRevGrad)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#14213D"
            strokeWidth={2}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
