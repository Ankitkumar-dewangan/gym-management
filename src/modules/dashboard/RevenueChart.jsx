import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export function RevenueChart({
  data = [],
  primaryKey = 'revenue',
  primaryLabel = 'Revenue',
  secondaryKey,
  secondaryLabel,
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="navyAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F1E36" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#0F1E36" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="emeraldAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
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
            tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
            formatter={(value, name) => [formatCurrency(value), name]}
          />
          <Area
            type="monotone"
            dataKey={primaryKey}
            name={primaryLabel}
            stroke="#0F1E36"
            strokeWidth={2}
            fill="url(#navyAreaFill)"
          />
          {secondaryKey && (
            <Area
              type="monotone"
              dataKey={secondaryKey}
              name={secondaryLabel || secondaryKey}
              stroke="#059669"
              strokeWidth={2}
              fill="url(#emeraldAreaFill)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;
