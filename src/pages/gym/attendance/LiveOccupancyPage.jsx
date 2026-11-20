import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  Eye,
  LogOut,
  QrCode,
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import { ATTENDANCE_MEDIA } from '../../../constants/attendanceManagementData';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import {
  calculateDurationMinutes,
  formatDurationLabel,
  getCurrentFormattedTime,
} from '../../../utils/attendanceUtils';

export function LiveOccupancyPage() {
  const navigate = useNavigate();
  const { activeBranch } = useTenant();
  const {
    currentlyInsideRecords,
    todayRecords,
    totalScopedCapacity,
    confirmCheckOut,
  } = useAttendanceManagement();

  const metrics = useMemo(() => {
    const inside = currentlyInsideRecords.length;
    const totalVisitsToday = Math.max(todayRecords.length, inside);
    const maxCapacity = Math.max(1, totalScopedCapacity);
    const available = Math.max(0, maxCapacity - inside);
    const occupancyPct = Math.min(100, Math.round((inside / maxCapacity) * 100));
    return { inside, totalVisitsToday, maxCapacity, available, occupancyPct };
  }, [currentlyInsideRecords.length, todayRecords.length, totalScopedCapacity]);

  const nowStr = getCurrentFormattedTime();

  const handleQuickCheckout = (rec) => {
    const res = confirmCheckOut({
      memberId: rec.memberId,
      attendanceId: rec.id,
      source: 'Manual',
    });
    if (res.ok) {
      toast.success(
        `Checked out ${rec.memberName} · Duration ${formatDurationLabel(res.record.durationMinutes)}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Gym Occupancy"
        subtitle="Simulated floor occupancy monitor using local demo attendance sessions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/settings')}>
              Branch Capacities
            </Button>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Open QR Scanner
            </Button>
          </div>
        }
      />

      {/* Simulated Banner + Architectural Facility Header */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-amber-700">
                Simulated Demo Data · {activeBranch.name} Floor Monitor
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                Floor Occupancy at {metrics.occupancyPct}% of Demo Capacity
              </h2>
              <p className="text-xs text-slate-600">
                Displays members with an active check-in session in browser demo state. Check-out actions immediately update available capacity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Floor Utilization</span>
                <span className="font-mono font-semibold text-navy-900 tabular-nums">
                  {metrics.inside} / {metrics.maxCapacity} members
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    metrics.occupancyPct >= 85
                      ? 'bg-red-500'
                      : metrics.occupancyPct >= 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                  )}
                  style={{ width: `${Math.max(4, metrics.occupancyPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[156px] bg-navy-900">
            <img
              src={ATTENDANCE_MEDIA.clubFloor}
              alt="Gym training floor"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-4 text-xs font-medium text-white">
              {activeBranch.name} · Simulated Floor Feed
            </p>
          </div>
        </div>
      </div>

      {/* 5 Occupancy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Currently Inside"
          value={String(metrics.inside)}
          helperText="simulated active sessions"
          icon={Radio}
        />
        <StatCard
          label="Total Today's Visits"
          value={String(metrics.totalVisitsToday)}
          helperText="today's logged entries"
          icon={Users}
        />
        <StatCard
          label="Maximum Gym Capacity"
          value={String(metrics.maxCapacity)}
          helperText="configured branch limit"
          icon={Building2}
        />
        <StatCard
          label="Available Capacity"
          value={String(metrics.available)}
          helperText="spots open right now"
          icon={ShieldCheck}
        />
        <StatCard
          label="Occupancy Percentage"
          value={`${metrics.occupancyPct}%`}
          helperText="utilization rate"
          icon={Activity}
        />
      </div>

      {/* Desktop Table & Mobile Cards */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Members Currently Inside (Simulated)</h2>
            <p className="text-xs text-slate-500">Check out members directly from this floor roster</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{currentlyInsideRecords.length} inside</span>
        </div>

        {currentlyInsideRecords.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <img
              src={ATTENDANCE_MEDIA.emptyState}
              alt="Empty floor state"
              referrerPolicy="no-referrer"
              className="mx-auto h-32 w-44 rounded-xl object-cover border border-slate-200"
            />
            <p className="text-sm font-semibold text-slate-800">No members currently checked in</p>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Scan Check-in
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Member ID</th>
                    <th className="px-4 py-3 font-medium">Check-in Time</th>
                    <th className="px-4 py-3 font-medium">Current Duration</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentlyInsideRecords.map((rec) => {
                    const mins = calculateDurationMinutes(rec.checkInTime, nowStr) ?? 42;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                            <span className="font-medium text-slate-900">{rec.memberName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{rec.memberId}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-900 tabular-nums">{rec.checkInTime}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                          {formatDurationLabel(mins)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">{rec.branchName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={Eye}
                              onClick={() => navigate(`/gym/members/${rec.memberId}`)}
                            >
                              View Profile
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={LogOut}
                              onClick={() => handleQuickCheckout(rec)}
                            >
                              Mark Check-out
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {currentlyInsideRecords.map((rec) => {
                const mins = calculateDurationMinutes(rec.checkInTime, nowStr) ?? 42;
                return (
                  <div key={rec.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="md" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{rec.memberName}</p>
                          <p className="text-xs font-mono text-slate-500">{rec.memberId} · {rec.branchName}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        {formatDurationLabel(mins)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Checked in: <strong className="font-mono text-slate-800">{rec.checkInTime}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-h-[42px]"
                        onClick={() => navigate(`/gym/members/${rec.memberId}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 min-h-[42px]"
                        onClick={() => handleQuickCheckout(rec)}
                      >
                        Mark Check-out
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LiveOccupancyPage;
