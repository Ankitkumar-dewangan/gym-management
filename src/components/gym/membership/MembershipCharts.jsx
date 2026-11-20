import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MEMBERSHIP_CHART_SERIES } from '../../../constants/membershipManagementData';

const PLAN_PIE_COLORS = ['#14213D', '#10B981', '#0EA5E9', '#F59E0B', '#64748B'];

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      {label && <p className="font-semibold text-slate-900 mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.payload?.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembershipGrowthChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Membership Growth</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Monthly new plan enrollments across active club locations
        </p>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MEMBERSHIP_CHART_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="msGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip suffix=" plans" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="newMemberships"
              name="New Assignments"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#msGrowthGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PlanDistributionChart({ plans = [], memberships = [] }) {
  const data = plans
    .map((plan, idx) => ({
      id: plan.id,
      name: plan.name,
      value: memberships.filter((m) => m.planId === plan.id).length,
      color: PLAN_PIE_COLORS[idx % PLAN_PIE_COLORS.length],
    }))
    .filter((d) => d.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">Plan Distribution</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Share of assigned members across {plans.length} configured tiers
        </p>
      </div>

      {total === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-slate-400">
          No memberships assigned in current scope.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
          <div className="sm:col-span-6 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip suffix=" members" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="sm:col-span-6 space-y-2.5">
            {data.map((item) => {
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                  <span className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                    {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthlyRenewalsChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Monthly Renewals</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Completed plan renewals and upgrades recorded per month
        </p>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MEMBERSHIP_CHART_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip suffix=" renewals" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="renewals" name="Renewed Plans" fill="#14213D" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ExpiryTrendsChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Expiry Trends</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Monthly expiring cycles compared against retention renewals
        </p>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MEMBERSHIP_CHART_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip suffix=" members" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="expiries"
              name="Expired Cycles"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="renewals"
              name="Renewals Captured"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
