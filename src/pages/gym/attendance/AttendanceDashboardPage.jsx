import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarCheck,
  Clock,
  LogIn,
  LogOut,
  QrCode,
  Radio,
  TrendingUp,
  UserCheck,
  UserX,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import {
  BranchAttendanceChart,
  DailyAttendanceTrendChart,
  MonthlyAttendanceChart,
  PeakHoursDistributionChart,
  WeeklyAttendanceChart,
} from '../../../components/gym/attendance/AttendanceCharts';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import {
  ATTENDANCE_CHARTS_SERIES,
  ATTENDANCE_DATE_RANGES,
  ATTENDANCE_MEDIA,
} from '../../../constants/attendanceManagementData';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { ATTENDANCE_TODAY, formatDurationLabel } from '../../../utils/attendanceUtils';

export function AttendanceDashboardPage() {
  const navigate = useNavigate();
  const { activeTenant, activeBranch } = useTenant();
  const { scopedBranches, tenantBranches } = useBranchManagement();
  const { scopedMembers } = useMemberManagement();
  const {
    scopedRecords,
    todayRecords,
    currentlyInsideRecords,
    scopedCorrections,
    totalScopedCapacity,
  } = useAttendanceManagement();

  const [dateRangeKey, setDateRangeKey] = useState('today');

  const activeRange =
    ATTENDANCE_DATE_RANGES.find((r) => r.key === dateRangeKey) || ATTENDANCE_DATE_RANGES[0];

  const kpis = useMemo(() => {
    const safeScopedBranches = scopedBranches || [];
    const safeTodayRecords = todayRecords || [];
    const safeInsideRecords = currentlyInsideRecords || [];
    const safeScopedMembers = scopedMembers || [];

    const branchBaseDaily = safeScopedBranches.reduce(
      (sum, b) => sum + (b?.todaysAttendance || 0),
      0
    );
    const totalCheckInsToday = safeTodayRecords.length + branchBaseDaily;
    const insideCount = safeInsideRecords.length;
    const checkedOutToday = safeTodayRecords.filter((r) => r.status === 'checked_out').length;
    const activeMembersRoster = safeScopedMembers.filter((m) => m.status === 'active').length;
    const presentCount = insideCount + checkedOutToday;
    const absentMembers = Math.max(0, activeMembersRoster - presentCount);
    const scaledTotal = Math.round(totalCheckInsToday * (activeRange?.scale || 1));
    const avgDaily =
      dateRangeKey === 'today'
        ? totalCheckInsToday
        : Math.round(scaledTotal / Math.max(1, activeRange?.scale || 1));
    const attendancePct =
      activeMembersRoster > 0
        ? Math.min(100, Math.round((presentCount / activeMembersRoster) * 100))
        : 0;

    return {
      todayCheckIns: totalCheckInsToday,
      insideNow: insideCount,
      totalCheckOuts: checkedOutToday,
      activePresent: presentCount,
      absentMembers,
      avgDaily,
      peakHours: totalCheckInsToday > 0 ? '06:00 PM – 08:00 PM' : 'No activity',
      attendancePct,
    };
  }, [scopedBranches, todayRecords, currentlyInsideRecords, scopedMembers, activeRange, dateRangeKey]);

  const branchChartData = useMemo(() => {
    const list = activeBranch?.id && activeBranch.id !== 'all'
      ? (tenantBranches || []).filter((b) => b.id === activeBranch.id)
      : (tenantBranches || []);
    return list.map((branch) => {
      const branchToday = (scopedRecords || []).filter(
        (r) => r.branchId === branch.id && r.date === ATTENDANCE_TODAY
      );
      const insideNow = branchToday.filter((r) => r.status === 'checked_in').length;
      return {
        branch: (branch?.name || 'Branch').split(' ')[0],
        checkIns: Math.max(branch?.todaysAttendance || 0, branchToday.length),
        insideNow,
      };
    });
  }, [activeBranch, tenantBranches, scopedRecords]);

  const pendingCorrections = scopedCorrections.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Monitor daily gym attendance, check-ins and member activity."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Select
                aria-label="Select date range"
                value={dateRangeKey}
                onChange={(e) => setDateRangeKey(e.target.value)}
                options={ATTENDANCE_DATE_RANGES.map((r) => ({ value: r.key, label: r.label }))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Radio}
              onClick={() => navigate('/gym/attendance/live')}
            >
              Live Occupancy
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={UserCheck}
              onClick={() => navigate('/gym/attendance/manual')}
            >
              Manual Entry
            </Button>
            <Button
              variant="emerald"
              size="sm"
              leftIcon={QrCode}
              onClick={() => navigate('/gym/attendance/scanner')}
            >
              Open QR Scanner
            </Button>
          </div>
        }
      />

      {/* Simulated Demo Data Notice + Quick Operations Bar */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-emerald-700">
                {activeTenant.name} · {activeBranch.name} · Simulated Front-Desk Demo State
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                QR Check-in, Check-out & Occupancy Control
              </h2>
              <p className="text-sm text-slate-600">
                Scan opaque member QR passes via browser camera or enter a Member ID to verify active membership validity and prevent duplicate entries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button variant="primary" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
                Launch QR Scanner
              </Button>
              <Button variant="outline" size="sm" leftIcon={LogIn} onClick={() => navigate('/gym/attendance/check-ins')}>
                Check-in Queue
              </Button>
              <Button variant="outline" size="sm" leftIcon={LogOut} onClick={() => navigate('/gym/attendance/check-outs')}>
                Check-out Queue
              </Button>
              {pendingCorrections > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/corrections')}>
                  {pendingCorrections} Pending Corrections
                </Button>
              )}
            </div>
          </div>
          <div className="lg:col-span-4 relative min-h-[168px] bg-navy-900">
            <img
              src={ATTENDANCE_MEDIA.qrKiosk}
              alt="Front-desk QR check-in kiosk"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-medium">Front-Desk Kiosk Ready</span>
              <span className="font-mono tabular-nums">
                {kpis.insideNow} / {totalScopedCapacity} cap
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Mandatory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Check-ins"
          value={String(kpis.todayCheckIns)}
          delta="+9.4%"
          trend="up"
          helperText="vs previous period"
          icon={LogIn}
        />
        <StatCard
          label="Currently Inside Gym"
          value={String(kpis.insideNow)}
          helperText={`of ${totalScopedCapacity} floor capacity (demo)`}
          icon={Radio}
        />
        <StatCard
          label="Total Check-outs"
          value={String(kpis.totalCheckOuts)}
          helperText="completed visits today"
          icon={LogOut}
        />
        <StatCard
          label="Active Members Present"
          value={String(kpis.activePresent)}
          delta={`${kpis.attendancePct}%`}
          trend="up"
          helperText="daily attendance rate"
          icon={UserCheck}
        />
        <StatCard
          label="Absent Members"
          value={String(kpis.absentMembers)}
          helperText="active members not visited today"
          icon={UserX}
        />
        <StatCard
          label="Average Daily Attendance"
          value={String(kpis.avgDaily)}
          delta="+5.2%"
          trend="up"
          helperText={activeRange.label}
          icon={Activity}
        />
        <StatCard
          label="Peak Attendance Hours"
          value="6–8 PM"
          helperText="104 avg check-ins in evening slot"
          icon={Clock}
        />
        <StatCard
          label="Attendance Percentage"
          value={`${kpis.attendancePct}%`}
          delta="+3.1%"
          trend="up"
          helperText="eligible roster engagement"
          icon={TrendingUp}
        />
      </div>

      {/* Charts A, B, C */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Daily Attendance Trend</h3>
              <p className="text-xs text-slate-500">14-day check-ins vs check-outs (simulated)</p>
            </div>
            <Link to="/gym/attendance/reports" className="text-xs font-medium text-emerald-700 hover:underline">
              Reports
            </Link>
          </div>
          <DailyAttendanceTrendChart data={ATTENDANCE_CHARTS_SERIES.dailyTrend} />
        </div>

        <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Weekly Attendance</h3>
            <p className="text-xs text-slate-500">QR pass scans compared with manual entries</p>
          </div>
          <WeeklyAttendanceChart data={ATTENDANCE_CHARTS_SERIES.weeklyTrend} />
        </div>
      </div>

      {/* Charts C, D, E */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Monthly Attendance</h3>
            <p className="text-xs text-slate-500">Total visits and unique active visitors</p>
          </div>
          <MonthlyAttendanceChart data={ATTENDANCE_CHARTS_SERIES.monthlyTrend} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Branch-wise Attendance</h3>
              <p className="text-xs text-slate-500">Check-ins and currently inside by branch</p>
            </div>
            <Link to="/gym/attendance/branches" className="text-xs font-medium text-emerald-700 hover:underline">
              Compare
            </Link>
          </div>
          <BranchAttendanceChart data={branchChartData} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Peak Hours Distribution</h3>
            <p className="text-xs text-slate-500">Hourly entry volume across operating hours</p>
          </div>
          <PeakHoursDistributionChart data={ATTENDANCE_CHARTS_SERIES.peakHours} />
        </div>
      </div>

      {/* Recent Attendance Activity */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Check-in & Check-out Activity</h3>
            <p className="text-xs text-slate-500">Latest attendance entries for {activeBranch.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={CalendarCheck} onClick={() => navigate('/gym/attendance/history')}>
              View Full History
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedRecords.slice(0, 6).map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{rec.memberName}</p>
                        <p className="text-xs font-mono text-slate-500">{rec.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{rec.branchName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-900 tabular-nums">{rec.checkInTime}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular-nums">
                    {rec.checkOutTime || 'Inside'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 tabular-nums">
                    {rec.durationMinutes ? formatDurationLabel(rec.durationMinutes) : 'Active'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{rec.source}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/gym/attendance/member/${rec.memberId}`}
                      className="text-xs font-medium text-emerald-700 hover:underline"
                    >
                      Member Log
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceDashboardPage;
