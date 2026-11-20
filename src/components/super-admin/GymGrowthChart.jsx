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

export function GymGrowthChart({ data = [] }) {
  const latest = data[data.length - 1] || { active: 132, inactive: 16 };
  const activeRatio = Math.round(
    (latest.active / Math.max(1, latest.active + latest.inactive)) * 100
  );

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Gym Growth & Activation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active vs. inactive gym accounts over the past 6 months
          </p>
        </div>
        <div className="text-xs text-slate-600 tabular-nums">
          Activation rate:{' '}
          <span className="font-mono font-semibold text-emerald-700">
            {activeRatio}%
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
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
                boxShadow: '0 6px 18px rgba(20, 33, 61, 0.08)',
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
            <Bar
              dataKey="active"
              name="Active Gyms"
              fill="#14213D"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="inactive"
              name="Inactive Gyms"
              fill="#CBD5E1"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default GymGrowthChart;
