import { useState, useMemo } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Users,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import AnalyticsFilterBar from '../../../components/gym/analytics/AnalyticsFilterBar';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { HOURLY_ATTENDANCE_DATA } from '../../../constants/gymAnalyticsNotificationsData';

const COLORS = ['#14213D', '#10B981', '#0EA5E9', '#E5A93C', '#8B5CF6'];

export default function AttendanceAnalyticsPage() {
  const { records: attendanceRecords } = useAttendanceManagement();
  const { branches } = useTenant();
  const { globalFilters } = useGymAnalyticsNotifications();

  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return (attendanceRecords || []).filter((r) => {
      const matchSearch =
        !search ||
        r.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        r.memberId?.toLowerCase().includes(search.toLowerCase());

      const matchMethod =
        selectedMethod === 'all' ||
        (selectedMethod === 'qr' && (r.method === 'QR' || r.method === 'Biometric Scanner')) ||
        (selectedMethod === 'manual' && r.method === 'Manual');

      const matchBranch = globalFilters.branch === 'all' || r.branchName === globalFilters.branch;

      return matchSearch && matchMethod && matchBranch;
    });
  }, [attendanceRecords, search, selectedMethod, globalFilters]);

  // Metrics
  const totalCheckins = filteredRecords.length || 184;
  const todayCount = 74;
  const avgDaily = 68;
  const peakOccupancy = 94;
  const missedCount = 14;
  const activeMembersToday = 72;

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Charts
  const weekdayVsWeekend = [
    { name: 'Weekdays (Mon-Fri)', value: 72 },
    { name: 'Weekends (Sat-Sun)', value: 28 },
  ];

  const branchAttendance = (branches || []).map((b, idx) => ({
    branch: b.name.replace(' Branch', '').replace(' Fitness Hub', ''),
    checkIns: [88, 54, 42][idx] || 38,
  }));

  const exportAttendanceCSV = () => {
    const headers = ['Member Name', 'Member ID', 'Branch', 'Check-in Time', 'Check-out Time', 'Method', 'Status'];
    const rows = filteredRecords.map((r) => [
      `"${r.memberName}"`,
      r.memberId,
      `"${r.branchName || 'Downtown'}"`,
      r.checkInTime || '07:30 AM',
      r.checkOutTime || '08:45 AM',
      r.method || 'Biometric Scanner',
      r.status || 'Present',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Attendance_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Analytics & Peak Load Insights"
        description="Monitor daily turnstile footfalls, peak hour bottlenecks, check-in modes, and member engagement consistency."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportAttendanceCSV}>
              Export Attendance CSV
            </Button>
          </div>
        }
      />

      <AnalyticsFilterBar onExportCSV={exportAttendanceCSV} onPrint={() => window.print()} />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Check-ins', value: totalCheckins, icon: Activity, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: "Today's Visits", value: todayCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Daily Average', value: avgDaily, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Peak Hour Load', value: `${peakOccupancy} Users`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Missed Visits', value: missedCount, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Active Today', value: activeMembersToday, icon: QrCode, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  {k.label}
                </span>
                <div className={`p-1 rounded ${k.bg} ${k.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Hourly Peak Load Chart */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Hourly Peak Footfall Traffic Analysis</h3>
            <p className="text-xs text-slate-500">Facility concurrent check-in volume throughout operating hours</p>
          </div>
          <span className="text-xs text-amber-600 font-semibold font-mono">Evening Peak: 07:00 PM</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_ATTENDANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip />
              <Bar dataKey="checkIns" name="Check-ins" fill="#14213D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch & Weekday/Weekend Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Branch Footfall Comparison</h3>
            <span className="text-xs text-slate-400">Total Check-ins</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchAttendance} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="branch" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="checkIns" name="Visits" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Weekday vs. Weekend Load</h3>
            <span className="text-xs text-slate-400">Distribution %</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weekdayVsWeekend}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                >
                  <Cell fill="#14213D" />
                  <Cell fill="#E5A93C" />
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Attendance Check-in Log</h3>
            <p className="text-xs text-slate-500">Live biometric and QR scan logs across all gate readers</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
              />
            </div>

            <Select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              options={[
                { value: 'all', label: 'All Entry Modes' },
                { value: 'qr', label: 'Biometric / QR' },
                { value: 'manual', label: 'Manual Check-in' },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-4 py-2.5">Branch</th>
                <th className="px-4 py-2.5">Check-in</th>
                <th className="px-4 py-2.5">Check-out</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{r.memberName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{r.memberId}</div>
                    </td>
                    <td className="px-4 py-2.5">{r.branchName || 'Downtown Main Arena'}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.checkInTime || '07:30 AM'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.checkOutTime || '08:45 AM'}</td>
                    <td className="px-4 py-2.5 font-medium">1h 15m</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                        <QrCode className="w-3 h-3 text-slate-500" />
                        {r.method || 'Biometric Scanner'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {r.status || 'Verified Present'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRecords.length)} of{' '}
            {filteredRecords.length} check-in logs
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="font-semibold px-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
