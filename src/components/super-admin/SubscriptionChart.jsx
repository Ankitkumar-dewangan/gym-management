import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export function SubscriptionChart({ data = [] }) {
  const totalSubs = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-800">
          Subscription Distribution
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Active gym plans across Starter, Pro, and Enterprise tiers
        </p>
      </div>

      <div className="relative h-56 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
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
                boxShadow: '0 6px 18px rgba(20, 33, 61, 0.08)',
              }}
              formatter={(value, name, props) => [
                `${value} gyms (${formatCurrency(props?.payload?.mrr || 0)} MRR)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-slate-800 tabular-nums">
            {totalSubs}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Active Plans
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        {data.map((tier) => {
          const pct = totalSubs ? Math.round((tier.value / totalSubs) * 100) : 0;
          return (
            <div
              key={tier.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: tier.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-700">{tier.name}</span>
                <span className="text-slate-400 tabular-nums">({pct}%)</span>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                <span className="text-slate-600 font-medium">{tier.value} gyms</span>
                <span className="font-mono text-slate-500">
                  {formatCurrency(tier.mrr)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SubscriptionChart;
