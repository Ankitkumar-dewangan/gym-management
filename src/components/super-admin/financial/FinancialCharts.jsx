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
import { formatCurrency } from '../../../utils/formatters';

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PercentTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            +{entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueTrendYoYChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Revenue Trend</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Current year vs previous year monthly collections
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="finCurrentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14213D" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="finPrevGrad" x1="0" y1="0" x2="0" y2="1">
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
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="currentYear"
              name="Current Year"
              stroke="#14213D"
              strokeWidth={2}
              fill="url(#finCurrentGrad)"
            />
            <Area
              type="monotone"
              dataKey="previousYear"
              name="Previous Year"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#finPrevGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function RevenueByPlanChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">
          Revenue by Subscription Plan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          MRR contribution across Starter, Pro, and Enterprise tiers
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="plan"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CurrencyTooltip />} />
            <Bar dataKey="revenue" name="Monthly Revenue" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((entry) => (
                <Cell key={entry.plan} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function PaymentMethodsChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">Payment Methods</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Settlement volume across UPI, cards, net banking, and transfers
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="volume"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.method} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                borderRadius: '0.5rem',
                borderColor: '#E2E8F0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function RevenueGrowthChart({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">Revenue Growth</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monthly, quarterly, and yearly percentage growth trajectory
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<PercentTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="monthlyGrowth"
              name="Monthly Growth"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="quarterlyGrowth"
              name="Quarterly Growth"
              stroke="#14213D"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="yearlyGrowth"
              name="Yearly Growth"
              stroke="#64748B"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
