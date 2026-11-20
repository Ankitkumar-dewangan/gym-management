import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  Download,
  QrCode,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Pagination from '../../../components/ui/Pagination';
import Select from '../../../components/ui/Select';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { exportAttendanceCsv, formatDurationLabel } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

const PAGE_SIZE = 7;

export function AttendanceHistoryPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const { scopedRecords } = useAttendanceManagement();

  const [query, setQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scopedRecords.filter((r) => {
      if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;
      if (memberFilter !== 'all' && r.memberId !== memberFilter) return false;
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (q) {
        const hay = `${r.memberName} ${r.memberId} ${r.branchName} ${r.source} ${r.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'name_asc') return a.memberName.localeCompare(b.memberName);
      if (sortBy === 'duration_desc') return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      return b.date.localeCompare(a.date);
    });
  }, [scopedRecords, query, branchFilter, memberFilter, sourceFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No attendance records match the current filters');
      return;
    }
    exportAttendanceCsv(
      filtered.map((r) => ({
        RecordID: r.id,
        MemberID: r.memberId,
        MemberName: r.memberName,
        Branch: r.branchName,
        Date: r.date,
        CheckIn: r.checkInTime,
        CheckOut: r.checkOutTime || 'Inside',
        DurationMinutes: r.durationMinutes ?? '',
        Source: r.source,
        Status: r.status,
        ManualCorrection: r.isManualCorrection ? 'Yes' : 'No',
      })),
      'GymPilot_attendance_history.csv'
    );
    toast.success(`Exported ${filtered.length} attendance records to CSV`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        subtitle="Complete audit log of QR check-ins, manual entries, and biometric turnstile previews."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Open QR Scanner
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <Input
              label="Search"
              placeholder="Member name, ID, branch..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              leftIcon={Search}
            />
          </div>
          <Select
            label="Branch"
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Branches' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
          <Select
            label="Member"
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Members' },
              ...tenantMembers.map((m) => ({ value: m.id, label: `${m.fullName} (${m.id})` })),
            ]}
          />
          <Select
            label="Attendance Source"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'QR Code', label: 'QR Code' },
              { value: 'Manual', label: 'Manual' },
              { value: 'Biometric', label: 'Biometric (Future)' },
            ]}
          />
          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'date_desc', label: 'Newest First' },
              { value: 'date_asc', label: 'Oldest First' },
              { value: 'name_asc', label: 'Member Name (A–Z)' },
              { value: 'duration_desc', label: 'Longest Duration' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Input
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-40">
              <Input
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono tabular-nums">{filtered.length} matching records</span>
            {(query || branchFilter !== 'all' || memberFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setBranchFilter('all');
                  setMemberFilter('all');
                  setSourceFilter('all');
                  setDateFrom('');
                  setDateTo('');
                  setPage(1);
                }}
                className="font-medium text-emerald-700 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No attendance logs found"
          description="Adjust your branch, date range, or source filters to view recorded visits."
          actionLabel="Record Manual Entry"
          onAction={() => navigate('/gym/attendance/manual')}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Member ID</th>
                  <th className="px-4 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Check-in Date <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium">Check-in Time</th>
                  <th className="px-4 py-3 font-medium">Check-out Time</th>
                  <th className="px-4 py-3 font-medium">Total Duration</th>
                  <th className="px-4 py-3 font-medium">Attendance Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link
                        to={`/gym/attendance/member/${rec.memberId}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                        <span className="font-medium text-slate-900 group-hover:text-emerald-700">
                          {rec.memberName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{rec.memberId}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{rec.branchName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(rec.date)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 tabular-nums">{rec.checkInTime}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular-nums">
                      {rec.checkOutTime || 'Inside'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-800 tabular-nums">
                      {rec.durationMinutes ? formatDurationLabel(rec.durationMinutes) : 'Active'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-slate-700">{rec.source}</span>
                      {rec.isManualCorrection && (
                        <span className="block text-[11px] font-medium text-amber-700">
                          Manual Correction
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Card List */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginated.map((rec) => (
              <div key={rec.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/gym/attendance/member/${rec.memberId}`} className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{rec.memberName}</p>
                      <p className="text-xs font-mono text-slate-500">{rec.memberId} · {rec.branchName}</p>
                    </div>
                  </Link>
                  <StatusBadge status={rec.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <span>Date: <strong className="font-mono text-slate-800">{formatDate(rec.date)}</strong></span>
                  <span>Source: <strong className="text-slate-800">{rec.source}</strong></span>
                  <span>In/Out: <strong className="font-mono text-slate-800">{rec.checkInTime} – {rec.checkOutTime || 'Inside'}</strong></span>
                  <span>Duration: <strong className="font-mono text-slate-800">{rec.durationMinutes ? formatDurationLabel(rec.durationMinutes) : 'Active'}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              className="border-t-0 pt-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceHistoryPage;
