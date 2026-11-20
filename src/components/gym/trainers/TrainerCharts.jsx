import {
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

const COLORS = ['#14213D', '#10B981', '#0284C7', '#F59E0B', '#64748B'];

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm text-xs">
      {label && <p className="font-semibold text-slate-900 mb-1">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {entry.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrainerAssignmentsChart({ trainers = [] }) {
  const data = trainers.slice(0, 6).map((t) => ({
    name: t.fullName.split(' ')[0],
    Assigned: t.assignedClients || 0,
    Capacity: t.maxClients || 15,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Trainer Member Assignments</h3>
        <p className="text-xs text-slate-500 mt-0.5">Active assigned clients vs max coaching capacity</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Assigned" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Capacity" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WeeklyTrainingSessionsChart({ data = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Weekly Training Sessions</h3>
        <p className="text-xs text-slate-500 mt-0.5">Scheduled vs completed personal training blocks</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Scheduled"
              stroke="#14213D"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TrainerPerformanceChart({ trainers = [] }) {
  const data = trainers.slice(0, 6).map((t) => ({
    name: t.fullName.split(' ')[0],
    Sessions: t.completedSessionsMonth || 0,
    Retention: t.retentionRate || 0,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Trainer Performance &amp; Retention</h3>
          <p className="text-xs text-slate-500 mt-0.5">Completed sessions and retention % (Simulated demo metrics)</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Sessions" fill="#14213D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Retention" name="Retention %" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BranchTrainerDistributionChart({ trainers = [], branches = [] }) {
  const counts = branches.map((b) => ({
    name: b.name.replace(' Flagship', '').replace(' Studio', ''),
    value: trainers.filter(
      (t) =>
        t.branchId === b.id ||
        (Array.isArray(t.assignedBranches) && t.assignedBranches.includes(b.id))
    ).length,
  })).filter((entry) => entry.value > 0);

  const fallback = counts.length > 0 ? counts : [{ name: 'No Data', value: 1 }];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Branch-wise Trainer Distribution</h3>
        <p className="text-xs text-slate-500 mt-0.5">Coaching roster coverage across locations</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fallback}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
            >
              {fallback.map((entry, idx) => (
                <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip suffix=" trainers" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MemberProgressSummaryChart({ data = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Member Progress &amp; Adherence</h3>
        <p className="text-xs text-slate-500 mt-0.5">Average outcome improvement &amp; program adherence % (Demo)</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip suffix="%" />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="avgImprovement" name="Outcome Gain %" fill="#14213D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="adherence" name="Adherence %" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
