import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Clock, QrCode, Radio, TrendingUp } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  BranchAttendanceChart,
  PeakHoursDistributionChart,
} from '../../../components/gym/attendance/AttendanceCharts';
import Button from '../../../components/ui/Button';
import { ATTENDANCE_CHARTS_SERIES } from '../../../constants/attendanceManagementData';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { ATTENDANCE_TODAY } from '../../../utils/attendanceUtils';

export function BranchAttendancePage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { tenantRecords, getBranchCapacity } = useAttendanceManagement();

  const branchRows = useMemo(() => {
    return tenantBranches.map((branch, index) => {
      const branchToday = tenantRecords.filter(
        (r) => r.branchId === branch.id && r.date === ATTENDANCE_TODAY
      );
      const insideNow = branchToday.filter((r) => r.status === 'checked_in').length;
      const totalCheckIns = Math.max(branch.todaysAttendance || 0, branchToday.length);
      const activeRoster = Math.max(1, branch.activeMembers || branch.totalMembers || 100);
      const attendancePct = Math.min(100, Math.round((totalCheckIns / activeRoster) * 100) + 45);
      const capacity = getBranchCapacity(branch.id);
      const peakSlot = index % 2 === 0 ? '06:00 PM – 08:00 PM' : '07:00 AM – 09:00 AM';

      return {
        id: branch.id,
        name: branch.name,
        shortName: branch.name.split(' ')[0],
        city: branch.city,
        status: branch.status,
        totalCheckIns,
        insideNow,
        capacity,
        peakHours: peakSlot,
        attendancePct: Math.min(96, attendancePct),
      };
    });
  }, [tenantBranches, tenantRecords, getBranchCapacity]);

  const totalCheckInsAll = branchRows.reduce((s, r) => s + r.totalCheckIns, 0);
  const totalInsideAll = branchRows.reduce((s, r) => s + r.insideNow, 0);
  const avgPct =
    branchRows.length > 0
      ? Math.round(branchRows.reduce((s, r) => s + r.attendancePct, 0) / branchRows.length)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch-wise Attendance"
        subtitle="Compare check-in volume, live demo floor presence, peak hours, and attendance rates across locations."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/live')}>
              Live Occupancy
            </Button>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Open QR Scanner
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Branches"
          value={String(branchRows.filter((b) => b.status === 'active').length)}
          helperText={`${branchRows.length} total locations`}
          icon={Building2}
        />
        <StatCard
          label="Combined Today Check-ins"
          value={String(totalCheckInsAll)}
          helperText="across all branches"
          icon={TrendingUp}
        />
        <StatCard
          label="Currently Inside (All)"
          value={String(totalInsideAll)}
          helperText="simulated active sessions"
          icon={Radio}
        />
        <StatCard
          label="Avg Branch Attendance Rate"
          value={`${avgPct}%`}
          helperText="monthly member engagement"
          icon={Clock}
        />
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Branch Check-ins vs Inside Now</h2>
            <p className="text-xs text-slate-500">Cross-branch volume comparison</p>
          </div>
          <BranchAttendanceChart
            data={branchRows.map((b) => ({
              branch: b.shortName,
              checkIns: b.totalCheckIns,
              insideNow: b.insideNow,
            }))}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Organization Peak Hours Distribution</h2>
            <p className="text-xs text-slate-500">Aggregated check-in timing across clubs</p>
          </div>
          <PeakHoursDistributionChart data={ATTENDANCE_CHARTS_SERIES.peakHours} />
        </div>
      </div>

      {/* Branch Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Branch Attendance Comparison</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Branch Name</th>
                <th className="px-4 py-3 font-medium">Total Check-ins</th>
                <th className="px-4 py-3 font-medium">Currently Inside</th>
                <th className="px-4 py-3 font-medium">Floor Capacity</th>
                <th className="px-4 py-3 font-medium">Peak Hours</th>
                <th className="px-4 py-3 font-medium">Attendance %</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchRows.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.city}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {b.totalCheckIns}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                    {b.insideNow}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular-nums">
                    {b.capacity} spots
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{b.peakHours}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${b.attendancePct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                        {b.attendancePct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
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

export default BranchAttendancePage;
