import { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  History,
  Printer,
  QrCode,
  Search,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/ui/Button';
import {
  MEMBER_ATTENDANCE_LOGS,
  MEMBER_ATTENDANCE_SUMMARY,
  MEMBER_PROFILE_DATA,
} from '../../constants/memberPortalData';

export function MemberAttendancePage() {
  const [logs] = useState(MEMBER_ATTENDANCE_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const summary = MEMBER_ATTENDANCE_SUMMARY;

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.date.includes(searchTerm) ||
      item.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
      selectedBranch === 'ALL' || item.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const handleExportCSV = () => {
    const headers = 'Date,Day,Time In,Time Out,Duration,Branch,Mode,Status\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `${l.date},${l.day},${l.timeIn},${l.timeOut},${l.duration},${l.branch},${l.mode},${l.status}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-history-aarav-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Attendance CSV downloaded!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Attendance & Check-in Records"
        description="Monitor your training consistency, monthly attendance streaks, entrance scan history, and active check-in pass."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleExportCSV}
          >
            Export Attendance (CSV)
          </Button>
        }
      />

      {/* 5 Attendance Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Visits"
          value={`${summary.totalVisits} Days`}
          helperText="All-time check-ins"
          icon={CalendarCheck}
        />
        <StatCard
          label="This Month"
          value={`${summary.thisMonthVisits} Visits`}
          helperText={`Target: ${summary.monthlyTarget} visits`}
          icon={Calendar}
        />
        <StatCard
          label="Monthly Adherence"
          value={`${summary.adherencePct}%`}
          helperText="Above average target"
          icon={CheckCircle2}
        />
        <StatCard
          label="Average Duration"
          value={summary.avgDuration}
          helperText="Per gym workout session"
          icon={Clock}
        />
        <StatCard
          label="Active Streak"
          value={`🔥 ${summary.activeStreak} Days`}
          helperText="Consecutive workout streak"
          icon={Flame}
        />
      </div>

      {/* Digital Check-in QR & Turnstile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-100 text-primary-800">
            Automated Turnstile Check-in
          </span>
          <h3 className="text-lg font-bold text-slate-800">Your Personal Check-in QR</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Hold your smartphone screen directly in front of the kiosk optical scanner at the gym entrance turnstile to record your check-in and unlock the speed gates.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <span className="font-semibold">Registered Facility: Downtown Arena</span>
            <span className="text-slate-300">·</span>
            <span>Turnstile Access: <strong className="text-emerald-600">Granted 24/7</strong></span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={Printer}
              onClick={() => toast.success('Printing QR Badge pass...')}
            >
              Print Hard Pass
            </Button>
            <Button
              size="sm"
              leftIcon={Download}
              onClick={() => toast.success('QR Code saved to gallery!')}
            >
              Save QR to Device
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-center flex flex-col items-center shrink-0">
          <QrCode className="w-32 h-32 text-slate-900" />
          <span className="font-mono text-xs font-bold text-slate-700 mt-2">
            {MEMBER_PROFILE_DATA.memberId}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Aarav Sharma</span>
        </div>
      </div>

      {/* Monthly Attendance Calendar Grid / Heatmap Simulation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">November 2026 Check-in Calendar</h3>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> Rest Day
            </span>
          </div>
        </div>

        {/* 30 Day Calendar Squares */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-1 text-center">
          {Array.from({ length: 30 }, (_, i) => {
            const dayNum = i + 1;
            // Days 3,4,6,7,9,10,12,13,14,16,17,18,19,20 were attended
            const isAttended = [3, 4, 6, 7, 9, 10, 12, 13, 14, 16, 17, 18, 19, 20].includes(dayNum);
            const isFuture = dayNum > 20;

            return (
              <div
                key={dayNum}
                title={`Nov ${dayNum}: ${isAttended ? 'Attended (1h 25m)' : isFuture ? 'Upcoming' : 'Rest Day'}`}
                className={`h-11 rounded-lg border text-xs flex flex-col items-center justify-center transition-all ${
                  isAttended
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : isFuture
                    ? 'bg-slate-50/50 border-slate-100 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-[10px] leading-none">{dayNum}</span>
                {isAttended && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-800">Check-in History Log</h4>
            <p className="text-xs text-slate-400">Total Records: {filteredLogs.length} verified sessions</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search date, day..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary-500 w-44"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Check-out Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Scan Method</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 font-bold text-slate-800 font-mono">{row.date}</td>
                  <td className="py-3 px-4 text-slate-700">{row.day}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{row.timeIn}</td>
                  <td className="py-3 px-4 text-slate-600">{row.timeOut}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.duration}</td>
                  <td className="py-3 px-4 text-slate-700">{row.branch}</td>
                  <td className="py-3 px-4 text-slate-500">{row.mode}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {row.status}
                    </span>
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

export default MemberAttendancePage;
