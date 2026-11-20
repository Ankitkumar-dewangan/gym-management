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
import { MEMBER_GROWTH_SERIES } from '../../../constants/memberManagementData';

function CustomTooltip({ active, payload, label, suffix = '' }) {
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

export function MemberGrowthChart({ dateScale = 1, activeCount = 0, expiredCount = 0 }) {
  const factor = dateScale === 0.28 ? 0.45 : dateScale === 2.6 ? 1.35 : dateScale === 9.5 ? 2.1 : 1;

  const data = MEMBER_GROWTH_SERIES.map((item, idx) => {
    const isLatest = idx === MEMBER_GROWTH_SERIES.length - 1;
    return {
      month: item.month,
      registrations: Math.max(1, Math.round(item.registrations * factor)),
      active: isLatest
        ? Math.max(item.active, activeCount * 150)
        : Math.round(item.active * (factor > 1.5 ? 1.15 : 1)),
      expired: isLatest
        ? Math.max(item.expired, expiredCount * 12)
        : Math.max(1, Math.round(item.expired * (factor < 1 ? 0.6 : 1))),
    };
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Member Growth & Retention</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly new registrations compared against expired memberships
          </p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip suffix=" members" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="registrations" name="New Registrations" fill="#10B981" radius={[5, 5, 0, 0]} />
            <Bar dataKey="expired" name="Expired" fill="#EF4444" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  active: '#10B981',
  inactive: '#64748B',
  expired: '#EF4444',
  suspended: '#B91C1C',
  on_hold: '#F59E0B',
};

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  suspended: 'Suspended',
  on_hold: 'On Hold',
};

export function MembershipStatusDistributionChart({ members = [] }) {
  const counts = {
    active: 0,
    inactive: 0,
    expired: 0,
    suspended: 0,
    on_hold: 0,
  };

  members.forEach((m) => {
    const key = m.status || 'active';
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  });

  const data = Object.keys(counts)
    .map((key) => ({
      key,
      name: STATUS_LABELS[key],
      value: counts[key],
      color: STATUS_COLORS[key],
    }))
    .filter((d) => d.value > 0);

  const total = members.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">Membership Status Distribution</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Breakdown across {total} scoped member {total === 1 ? 'record' : 'records'}
        </p>
      </div>

      {total === 0 ? (
        <div className="h-52 flex items-center justify-center text-xs text-slate-400">
          No member records in current scope.
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
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip suffix=" members" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="sm:col-span-6 space-y-2.5">
            {Object.keys(STATUS_LABELS).map((key) => {
              const count = counts[key];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[key] }}
                    />
                    {STATUS_LABELS[key]}
                  </span>
                  <span className="font-mono text-slate-900 font-semibold tabular-nums">
                    {count} <span className="text-slate-400 font-normal">({pct}%)</span>
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

export function MemberProgressCharts({ progressHistory = [] }) {
  if (!progressHistory.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No measurement check-ins recorded yet. Add an optional progress measurement to visualize trends.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Weight History (kg)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recorded weigh-in progression across check-in milestones
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14213D" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip suffix=" kg" />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#14213D"
                  strokeWidth={2.5}
                  fill="url(#weightAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">BMI & Body Fat %</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Optional trainer-recorded body composition estimates
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="bmi"
                  name="BMI"
                  stroke="#14213D"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  name="Body Fat %"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Body Measurements (cm)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Optional chest, waist, hip, and arm circumference records
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip suffix=" cm" />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="chest" name="Chest" stroke="#14213D" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="waist" name="Waist" stroke="#10B981" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="hip" name="Hip" stroke="#0EA5E9" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="arm" name="Arm" stroke="#F59E0B" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
