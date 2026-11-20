import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ATTENDANCE_CHARTS_SERIES } from '../../../constants/attendanceManagementData';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { cn } from '../../../utils/cn';
import {
  ATTENDANCE_TODAY,
  exportAttendanceCsv,
  formatDurationLabel,
} from '../../../utils/attendanceUtils';

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily Attendance' },
  { key: 'weekly', label: 'Weekly Attendance' },
  { key: 'monthly', label: 'Monthly Attendance' },
  { key: 'member', label: 'Member-wise Attendance' },
  { key: 'branch', label: 'Branch-wise Attendance' },
  { key: 'peak', label: 'Peak Hours Report' },
  { key: 'absent', label: 'Absent Members Report' },
];

export function AttendanceReportsPage() {
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const { tenantRecords, getBranchCapacity } = useAttendanceManagement();

  const [reportType, setReportType] = useState('daily');
  const [branchFilter, setBranchFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-11-01');
  const [dateTo, setDateTo] = useState(ATTENDANCE_TODAY);

  const filteredLogs = useMemo(() => {
    return tenantRecords.filter((r) => {
      if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;
      if (memberFilter !== 'all' && r.memberId !== memberFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });
  }, [tenantRecords, branchFilter, memberFilter, dateFrom, dateTo]);

  const reportData = useMemo(() => {
    if (reportType === 'daily') {
      return {
        columns: ['Date', 'Member', 'Branch', 'Check-in', 'Check-out', 'Duration', 'Source'],
        rows: filteredLogs.map((r) => ({
          Date: r.date,
          Member: `${r.memberName} (${r.memberId})`,
          Branch: r.branchName,
          'Check-in': r.checkInTime,
          'Check-out': r.checkOutTime || 'Inside',
          Duration: r.durationMinutes ? formatDurationLabel(r.durationMinutes) : 'Active',
          Source: r.source,
        })),
      };
    }

    if (reportType === 'weekly') {
      return {
        columns: ['Week', 'QR Check-ins', 'Manual Check-ins', 'Total Visits', 'Avg Duration'],
        rows: ATTENDANCE_CHARTS_SERIES.weeklyTrend.map((w) => ({
          Week: w.week,
          'QR Check-ins': w.qrCheckIns,
          'Manual Check-ins': w.manualCheckIns,
          'Total Visits': w.qrCheckIns + w.manualCheckIns,
          'Avg Duration': `${w.avgDuration}m`,
        })),
      };
    }

    if (reportType === 'monthly') {
      return {
        columns: ['Month', 'Total Visits', 'Unique Members', 'Attendance Rate'],
        rows: ATTENDANCE_CHARTS_SERIES.monthlyTrend.map((m) => ({
          Month: m.month,
          'Total Visits': m.visits,
          'Unique Members': m.uniqueMembers,
          'Attendance Rate': `${m.attendancePct}%`,
        })),
      };
    }

    if (reportType === 'member') {
      const targetMembers =
        memberFilter !== 'all'
          ? tenantMembers.filter((m) => m.id === memberFilter)
          : tenantMembers;
      return {
        columns: ['Member ID', 'Member Name', 'Branch', 'Logged Sessions', 'Last Visit', 'Status'],
        rows: targetMembers
          .filter((m) => branchFilter === 'all' || m.branchId === branchFilter)
          .map((m) => {
            const count = filteredLogs.filter((r) => r.memberId === m.id).length;
            return {
              'Member ID': m.id,
              'Member Name': m.fullName,
              Branch: m.branchName,
              'Logged Sessions': Math.max(count, m.monthlyAttendance || 0),
              'Last Visit': m.lastVisit || '—',
              Status: m.status,
            };
          }),
      };
    }

    if (reportType === 'branch') {
      const branches =
        branchFilter !== 'all'
          ? tenantBranches.filter((b) => b.id === branchFilter)
          : tenantBranches;
      return {
        columns: ['Branch Name', 'City', 'Today Check-ins', 'Floor Capacity', 'Logged Events'],
        rows: branches.map((b) => ({
          'Branch Name': b.name,
          City: b.city,
          'Today Check-ins': b.todaysAttendance || 0,
          'Floor Capacity': getBranchCapacity(b.id),
          'Logged Events': filteredLogs.filter((r) => r.branchId === b.id).length,
        })),
      };
    }

    if (reportType === 'peak') {
      return {
        columns: ['Time Window', 'Check-in Volume', 'Utilization Level'],
        rows: ATTENDANCE_CHARTS_SERIES.peakHours.map((slot) => ({
          'Time Window': slot.slot,
          'Check-in Volume': slot.checkIns,
          'Utilization Level':
            slot.checkIns >= 85 ? 'Peak Demand' : slot.checkIns >= 50 ? 'Moderate' : 'Off-Peak',
        })),
      };
    }

    // absent report: active members without a visit today
    const visitedTodayIds = new Set(
      tenantRecords.filter((r) => r.date === ATTENDANCE_TODAY).map((r) => r.memberId)
    );
    const absentMembers = tenantMembers.filter(
      (m) =>
        m.status === 'active' &&
        !visitedTodayIds.has(m.id) &&
        (branchFilter === 'all' || m.branchId === branchFilter)
    );
    return {
      columns: ['Member ID', 'Member Name', 'Branch', 'Plan', 'Last Visit'],
      rows: absentMembers.map((m) => ({
        'Member ID': m.id,
        'Member Name': m.fullName,
        Branch: m.branchName,
        Plan: m.plan,
        'Last Visit': m.lastVisit || 'No recent visit',
      })),
    };
  }, [reportType, filteredLogs, memberFilter, tenantMembers, branchFilter, tenantBranches, getBranchCapacity, tenantRecords]);

  const handleExportCsv = () => {
    if (reportData.rows.length === 0) {
      toast.error('No rows to export for this report');
      return;
    }
    exportAttendanceCsv(reportData.rows, `attendance_report_${reportType}.csv`);
    toast.success(`Exported ${reportType} attendance report`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        subtitle="Generate, preview, export CSV, and print attendance intelligence reports."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button variant="emerald" size="sm" leftIcon={Download} onClick={handleExportCsv}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Report Type Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.key}
              type="button"
              onClick={() => setReportType(rt.key)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                reportType === rt.key
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Select
            label="Branch Filter"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
          <Select
            label="Member Filter"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Members' },
              ...tenantMembers.map((m) => ({ value: m.id, label: `${m.fullName} (${m.id})` })),
            ]}
          />
        </div>
      </div>

      {/* Report Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Report Dataset"
          value={REPORT_TYPES.find((r) => r.key === reportType)?.label || 'Daily'}
          helperText={`${dateFrom} to ${dateTo}`}
          icon={FileSpreadsheet}
        />
        <StatCard
          label="Preview Rows"
          value={String(reportData.rows.length)}
          helperText="ready for CSV export or print"
          icon={FileSpreadsheet}
        />
        <StatCard
          label="Filtered Attendance Events"
          value={String(filteredLogs.length)}
          helperText="matching branch & date scope"
          icon={FileSpreadsheet}
        />
      </div>

      {/* Report Preview Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {REPORT_TYPES.find((r) => r.key === reportType)?.label} Preview
            </h2>
            <p className="text-xs text-slate-500">
              Simulated reporting preview · Export CSV for spreadsheet analysis
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{reportData.rows.length} rows</span>
        </div>

        {reportData.rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No matching rows found for the selected report filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  {reportData.columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    {reportData.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-xs text-slate-700 font-mono">
                        {String(row[col] ?? '—')}
                      </td>
                    ))}
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

export default AttendanceReportsPage;
