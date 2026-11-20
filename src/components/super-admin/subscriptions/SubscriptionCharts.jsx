import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

export function SubscriptionRevenueChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Subscription Revenue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly vs. yearly billing revenue over the last 12 months
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 tabular-nums">
          12M INR
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="subMonthlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14213D" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="subYearlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.625rem',
                fontSize: '12px',
                boxShadow: '0 6px 18px rgba(20, 33, 61, 0.08)',
              }}
              formatter={(value, name) => [formatCurrency(value), name]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#475569' }}
            />
            <Area
              type="monotone"
              dataKey="monthlyBilling"
              name="Monthly Billing"
              stroke="#14213D"
              strokeWidth={2}
              fill="url(#subMonthlyFill)"
            />
            <Area
              type="monotone"
              dataKey="yearlyBilling"
              name="Yearly Billing"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#subYearlyFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function SubscriptionGrowthChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">
          Subscription Growth
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          New subscriptions, renewals, and cancellations
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              width={36}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.625rem',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#475569' }}
            />
            <Bar dataKey="renewals" name="Renewals" fill="#14213D" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="newSubs" name="New" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="cancellations" name="Cancelled" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function PlanDistributionChart({ data = [] }) {
  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-800">
          Plan Distribution
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Breakdown across Starter, Pro, and Enterprise plans
        </p>
      </div>

      <div className="relative h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.625rem',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${value} subscriptions`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-slate-800 tabular-nums">
            {total}
          </span>
          <span className="text-[11px] font-medium text-slate-500">Total Plans</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="font-medium text-slate-700">{item.name}</span>
            </div>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {item.value} gyms
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SubscriptionStatusChart({ data = [] }) {
  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-800">
          Subscription Status
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Active, expired, trial, and cancelled accounts
        </p>
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 6, right: 16, left: 10, bottom: 6 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 12 }}
              width={72}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.625rem',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value} accounts`, 'Count']}
            />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={22}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total tracked subscriptions</span>
        <span className="font-mono font-semibold text-slate-800 tabular-nums">
          {total}
        </span>
      </div>
    </section>
  );
}
