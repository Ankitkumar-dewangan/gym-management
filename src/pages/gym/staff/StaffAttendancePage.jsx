import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Download, Plus, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { calculateWorkingHours, exportCsvFile } from '../../../utils/payrollCalculations';

export function StaffAttendancePage() {
  const { tenantBranches } = useBranchManagement();
  const {
    allTenantStaff,
    allTenantTrainers,
    staffAttendance,
    markStaffAttendance,
  } = useTrainerStaff();

  const [dateFilter, setDateFilter] = useState('2026-11-19');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [markModalOpen, setMarkModalOpen] = useState(false);

  const rosterOptions = useMemo(() => {
    const staffEntries = allTenantStaff.map((s) => ({
      id: s.id,
      name: s.fullName,
      role: s.role,
      personType: 'staff',
      branchId: s.branchId,
      branchName: s.branchName,
    }));
    const trainerEntries = allTenantTrainers.map((t) => ({
      id: t.id,
      name: t.fullName,
      role: 'Trainer',
      personType: 'trainer',
      branchId: t.branchId,
      branchName: t.branchName,
    }));
    return [...staffEntries, ...trainerEntries];
  }, [allTenantStaff, allTenantTrainers]);

  const [markForm, setMarkForm] = useState({
    personId: rosterOptions[0]?.id || '',
    date: '2026-11-19',
    checkIn: '08:00',
    checkOut: '16:30',
    status: 'present',
    remarks: '',
  });

  const filteredLogs = useMemo(() => {
    return staffAttendance.filter((row) => {
      const matchDate = !dateFilter || row.date === dateFilter;
      const matchBranch = branchFilter === 'all' || row.branchId === branchFilter;
      const matchStatus = statusFilter === 'all' || row.status === statusFilter;
      return matchDate && matchBranch && matchStatus;
    });
  }, [staffAttendance, dateFilter, branchFilter, statusFilter]);

  const presentCount = filteredLogs.filter((r) => r.status === 'present').length;
  const absentCount = filteredLogs.filter((r) => r.status === 'absent').length;
  const lateCount = filteredLogs.filter((r) => r.status === 'late').length;
  const halfDayCount = filteredLogs.filter((r) => r.status === 'half_day').length;

  const handleMarkSubmit = (e) => {
    e.preventDefault();
    const person = rosterOptions.find((p) => p.id === markForm.personId);
    if (!person) {
      toast.error('Please select a staff member or trainer');
      return;
    }
    markStaffAttendance({
      personId: person.id,
      personType: person.personType,
      name: person.name,
      role: person.role,
      branchId: person.branchId,
      branchName: person.branchName,
      date: markForm.date,
      checkIn: markForm.status === 'absent' || markForm.status === 'on_leave' ? '' : markForm.checkIn,
      checkOut: markForm.status === 'absent' || markForm.status === 'on_leave' ? '' : markForm.checkOut,
      status: markForm.status,
      remarks: markForm.remarks,
    });
    toast.success(`Attendance updated for ${person.name}`);
    setMarkModalOpen(false);
  };

  const handleQuickStatus = (row, nextStatus) => {
    markStaffAttendance({
      ...row,
      status: nextStatus,
      checkIn: nextStatus === 'absent' || nextStatus === 'on_leave' ? '' : row.checkIn || '09:00',
      checkOut: nextStatus === 'absent' || nextStatus === 'on_leave' ? '' : row.checkOut || '17:00',
    });
    toast.success(`${row.name} marked as ${nextStatus.replace('_', ' ')}`);
  };

  const handleExport = () => {
    exportCsvFile(
      `staff-attendance-${dateFilter || 'all'}.csv`,
      ['Name', 'Role', 'Branch', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status', 'Remarks'],
      filteredLogs.map((r) => [
        r.name,
        r.role,
        r.branchName,
        r.date,
        r.checkIn || '-',
        r.checkOut || '-',
        calculateWorkingHours(r.checkIn, r.checkOut),
        r.status,
        r.remarks || '',
      ])
    );
    toast.success('Attendance CSV downloaded');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Attendance"
        description="Track daily staff & trainer check-ins, late arrivals, half-days, and leave status."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setMarkModalOpen(true)}>
              Mark Attendance
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Team Roster" value={rosterOptions.length} icon={Users} />
        <StatCard label="Present Today" value={presentCount} icon={CheckCircle2} />
        <StatCard label="Absent Today" value={absentCount} icon={XCircle} />
        <StatCard label="Late Arrivals" value={lateCount} icon={Clock} />
        <StatCard label="Half Days" value={halfDayCount} icon={Clock} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Attendance Date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
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
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'late', label: 'Late' },
              { value: 'on_leave', label: 'Leave' },
            ]}
          />
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No attendance logs for this date"
            description="Mark attendance manually or clear date/branch filters."
            actionLabel="Mark Attendance"
            onAction={() => setMarkModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 pl-4 text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.personId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{row.role}</td>
                    <td className="py-3.5 px-4 text-slate-700">{row.branchName}</td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-800">{row.checkIn || '—'}</td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-800">{row.checkOut || '—'}</td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-slate-900">
                      {calculateWorkingHours(row.checkIn, row.checkOut)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate">
                      {row.remarks || '—'}
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <select
                        aria-label={`Set attendance status for ${row.name}`}
                        value={row.status}
                        onChange={(e) => handleQuickStatus(row, e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="half_day">Half Day</option>
                        <option value="absent">Absent</option>
                        <option value="on_leave">Leave</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        title="Mark Staff / Trainer Attendance"
      >
        <form onSubmit={handleMarkSubmit} className="space-y-4">
          <Select
            label="Employee"
            value={markForm.personId}
            onChange={(e) => setMarkForm((p) => ({ ...p, personId: e.target.value }))}
            options={rosterOptions.map((r) => ({
              value: r.id,
              label: `${r.name} (${r.role})`,
            }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={markForm.date}
              onChange={(e) => setMarkForm((p) => ({ ...p, date: e.target.value }))}
            />
            <Select
              label="Status"
              value={markForm.status}
              onChange={(e) => setMarkForm((p) => ({ ...p, status: e.target.value }))}
              options={[
                { value: 'present', label: 'Present' },
                { value: 'late', label: 'Late' },
                { value: 'half_day', label: 'Half Day' },
                { value: 'absent', label: 'Absent' },
                { value: 'on_leave', label: 'Leave' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Check In"
              type="time"
              value={markForm.checkIn}
              onChange={(e) => setMarkForm((p) => ({ ...p, checkIn: e.target.value }))}
            />
            <Input
              label="Check Out"
              type="time"
              value={markForm.checkOut}
              onChange={(e) => setMarkForm((p) => ({ ...p, checkOut: e.target.value }))}
            />
          </div>
          <Input
            label="Remarks"
            placeholder="Shift note or leave reason..."
            value={markForm.remarks}
            onChange={(e) => setMarkForm((p) => ({ ...p, remarks: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setMarkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StaffAttendancePage;
