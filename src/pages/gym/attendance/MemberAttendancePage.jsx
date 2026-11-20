import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarCheck,
  Clock,
  IdCard,
  TrendingUp,
} from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import { MemberFrequencyChart } from '../../../components/gym/attendance/AttendanceCharts';
import MemberQrCodeCard from '../../../components/gym/attendance/MemberQrCodeCard';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import { formatDurationLabel } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

export function MemberAttendancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { tenantMembers, getMemberById } = useMemberManagement();
  const { tenantRecords, resolveMemberValidity } = useAttendanceManagement();

  const member = getMemberById(id) || tenantMembers[0] || null;

  const memberRecords = useMemo(() => {
    if (!member) return [];
    return tenantRecords
      .filter((r) => r.memberId === member.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [tenantRecords, member]);

  const metrics = useMemo(() => {
    if (!member) {
      return { totalVisits: 0, monthlyVisits: 0, avgDuration: 0, lastVisit: '—', attendancePct: 0 };
    }
    const durations = memberRecords
      .map((r) => r.durationMinutes)
      .filter((d) => typeof d === 'number' && d > 0);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length)
        : 68;
    const totalVisits = Math.max(member.totalVisits || 0, memberRecords.length);
    const monthlyVisits = Math.max(member.monthlyAttendance || 0, memberRecords.length);
    const attendancePct = Math.min(100, Math.round((monthlyVisits / 22) * 100));
    const latest = memberRecords[0];
    const lastVisit = latest
      ? `${formatDate(latest.date)} · ${latest.checkInTime}`
      : member.lastVisit || 'No visits yet';
    return { totalVisits, monthlyVisits, avgDuration, lastVisit, attendancePct };
  }, [member, memberRecords]);

  if (!member) {
    return (
      <EmptyState
        title="Member not found"
        description="Select an existing member under the active gym organization."
        actionLabel="Back to Attendance"
        onAction={() => navigate('/gym/attendance')}
      />
    );
  }

  const validity = resolveMemberValidity(member);

  const calendarDays = Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
    const record = memberRecords.find((r) => r.date === dateStr);
    const demoVisited =
      Boolean(record) ||
      (validity.isEligible && [2, 4, 6, 8, 10, 12, 15, 17].includes(day));
    return { day, dateStr, visited: demoVisited, record };
  });

  const weeklyChartData = [
    { label: 'Wk 1', visits: Math.max(1, Math.round(metrics.monthlyVisits * 0.22)) },
    { label: 'Wk 2', visits: Math.max(2, Math.round(metrics.monthlyVisits * 0.25)) },
    { label: 'Wk 3', visits: Math.max(2, Math.round(metrics.monthlyVisits * 0.28)) },
    { label: 'Wk 4', visits: Math.max(1, Math.round(metrics.monthlyVisits * 0.25)) },
  ];

  const monthlyChartData = [
    { label: 'Jun', visits: 12 },
    { label: 'Jul', visits: 14 },
    { label: 'Aug', visits: 15 },
    { label: 'Sep', visits: 16 },
    { label: 'Oct', visits: 17 },
    { label: 'Nov', visits: metrics.monthlyVisits },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member-wise Attendance"
        subtitle={`Detailed visit frequency, monthly calendar, and QR pass for ${member.fullName}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-60">
              <Select
                aria-label="Switch member"
                value={member.id}
                onChange={(e) => navigate(`/gym/attendance/member/${e.target.value}`)}
                options={tenantMembers.map((m) => ({
                  value: m.id,
                  label: `${m.fullName} (${m.id})`,
                }))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/gym/attendance/history')}
            >
              History
            </Button>
          </div>
        }
      />

      {/* Member Profile Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <UserAvatar src={member.avatar} name={member.fullName} size="xl" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 truncate">{member.fullName}</h2>
              <StatusBadge status={validity.effectiveStatus} />
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-mono font-semibold text-navy-900">{member.id}</span>
              {' · '}
              {member.branchName}
              {' · '}
              Plan: <strong>{validity.effectivePlan}</strong>
              {' · '}
              Expires {formatDate(validity.effectiveExpiry)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={IdCard}
            onClick={() => navigate(`/gym/members/${member.id}`)}
          >
            Member Profile
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => navigate('/gym/attendance/scanner')}
          >
            Scan Check-in
          </Button>
        </div>
      </div>

      {/* 5 Member Attendance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Visits" value={String(metrics.totalVisits)} helperText="lifetime visits" icon={CalendarCheck} />
        <StatCard label="Monthly Visits" value={String(metrics.monthlyVisits)} helperText="November 2026" icon={Activity} />
        <StatCard
          label="Average Duration"
          value={formatDurationLabel(metrics.avgDuration)}
          helperText="per training session"
          icon={Clock}
        />
        <StatCard
          label="Last Visit"
          value={metrics.lastVisit.split(' · ')[0]}
          helperText={metrics.lastVisit.split(' · ')[1] || 'front-desk log'}
          icon={CalendarCheck}
        />
        <StatCard
          label="Attendance Percentage"
          value={`${metrics.attendancePct}%`}
          helperText="target 22 sessions/mo"
          icon={TrendingUp}
        />
      </div>

      {/* Calendar & QR Pass */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Monthly Attendance Calendar</h3>
              <p className="text-xs text-slate-500">November 2026 · Highlighted days denote recorded check-ins</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              {calendarDays.filter((d) => d.visited).length} days present
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-slate-400 pb-1">
                {d}
              </div>
            ))}
            {calendarDays.map((item) => (
              <div
                key={item.day}
                title={`${item.dateStr}: ${item.visited ? 'Present' : 'No Check-in'}`}
                className={cn(
                  'h-10 rounded-lg border flex flex-col items-center justify-center text-xs font-mono tabular-nums',
                  item.visited
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                )}
              >
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6">
          <MemberQrCodeCard member={member} tenantName={activeTenant.name} />
        </div>
      </div>

      {/* Weekly & Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Weekly Attendance Breakdown</h3>
          <MemberFrequencyChart data={weeklyChartData} label="Weekly Visits" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Monthly Attendance Trend</h3>
          <MemberFrequencyChart data={monthlyChartData} label="Monthly Visits" />
        </div>
      </div>

      {/* Member Attendance Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Attendance History</h3>
          <Link to="/gym/attendance/manual" className="text-xs font-medium text-emerald-700 hover:underline">
            Add Manual Entry
          </Link>
        </div>
        {memberRecords.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No attendance logs recorded for {member.fullName} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Check-out</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(rec.date)}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{rec.branchName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900">{rec.checkInTime}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{rec.checkOutTime || 'Inside'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-800">
                      {rec.durationMinutes ? formatDurationLabel(rec.durationMinutes) : 'Active'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{rec.source}</td>
                    <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberAttendancePage;
