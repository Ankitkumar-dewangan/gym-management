import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export function RevenueChart({ data = [], rangeLabel = 'Last 12 Months' }) {
  const latest = data[data.length - 1]?.current || 0;
  const previous = data[data.length - 1]?.previous || 0;

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Revenue Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly recurring revenue comparison · {rangeLabel}
          </p>
        </div>
        <div className="flex items-baseline gap-3 text-xs tabular-nums">
          <span className="font-mono font-semibold text-slate-800 text-sm">
            {formatCurrency(latest)}
          </span>
          <span className="text-slate-500">
            vs {formatCurrency(previous)} prior period
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="saCurrentRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14213D" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saPrevRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
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
              tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
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
              dataKey="current"
              name="Current Period"
              stroke="#14213D"
              strokeWidth={2.2}
              fill="url(#saCurrentRev)"
            />
            <Area
              type="monotone"
              dataKey="previous"
              name="Previous Period"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#saPrevRev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RevenueChart;
