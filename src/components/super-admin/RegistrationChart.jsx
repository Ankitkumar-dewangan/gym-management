import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RegistrationChart({ data = [] }) {
  const totalNew = data.reduce((sum, item) => sum + item.registrations, 0);

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Gym Registration Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            New gym organizations onboarded per month
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 tabular-nums">
          +{totalNew} gyms
        </span>
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
              width={32}
              allowDecimals={false}
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
              formatter={(value) => [`${value} new gyms`, 'Registrations']}
            />
            <Bar
              dataKey="registrations"
              name="New Registrations"
              fill="#10B981"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RegistrationChart;
