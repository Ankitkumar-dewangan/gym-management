import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Edit3, ShieldAlert, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { ATTENDANCE_TODAY, formatDurationLabel } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

export function ManualAttendancePage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    scopedRecords,
    tenantSettings,
    saveManualAttendance,
  } = useAttendanceManagement();

  const [editingId, setEditingId] = useState(null);
  const [memberId, setMemberId] = useState(tenantMembers[0]?.id || '');
  const [branchId, setBranchId] = useState(tenantBranches[0]?.id || '');
  const [date, setDate] = useState(ATTENDANCE_TODAY);
  const [checkInTime, setCheckInTime] = useState('08:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('09:15 AM');
  const [status, setStatus] = useState('checked_out');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const manualRecords = useMemo(
    () => scopedRecords.filter((r) => r.source === 'Manual' || r.isManualCorrection),
    [scopedRecords]
  );

  const resetForm = () => {
    setEditingId(null);
    setMemberId(tenantMembers[0]?.id || '');
    setBranchId(tenantBranches[0]?.id || '');
    setDate(ATTENDANCE_TODAY);
    setCheckInTime('08:00 AM');
    setCheckOutTime('09:15 AM');
    setStatus('checked_out');
    setNotes('');
    setErrors({});
  };

  const handleLoadForEdit = (rec) => {
    setEditingId(rec.id);
    setMemberId(rec.memberId);
    setBranchId(rec.branchId);
    setDate(rec.date);
    setCheckInTime(rec.checkInTime === '—' ? '08:00 AM' : rec.checkInTime);
    setCheckOutTime(rec.checkOutTime || '');
    setStatus(rec.status);
    setNotes(rec.correctionNote || rec.notes || '');
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!memberId) next.memberId = 'Please select a member.';
    if (!branchId) next.branchId = 'Please select a branch.';
    if (!date) next.date = 'Attendance date is required.';
    if (status !== 'absent' && !checkInTime.trim()) {
      next.checkInTime = 'Check-in time is required unless marked absent.';
    }
    if (status === 'checked_out' && !checkOutTime.trim()) {
      next.checkOutTime = 'Check-out time is required for completed sessions.';
    }
    if (!notes.trim()) {
      next.notes = 'Provide an audit reason or note for manual attendance.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!tenantSettings.manualAttendanceEnabled) {
      toast.error('Manual attendance is disabled in Attendance Settings.');
      return;
    }
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    const saved = saveManualAttendance({
      id: editingId,
      memberId,
      branchId,
      date,
      checkInTime,
      checkOutTime: status === 'checked_in' || status === 'absent' ? '' : checkOutTime,
      status,
      notes,
    });
    setConfirmOpen(false);
    if (saved || editingId) {
      toast.success(
        editingId
          ? 'Manual attendance correction updated (audit logged)'
          : 'Manual attendance recorded (demo state)'
      );
      resetForm();
    }
  };

  const selectedMemberObj = tenantMembers.find((m) => m.id === memberId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual Attendance"
        subtitle="Record or adjust member attendance manually with mandatory audit notes."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/history')}>
              View Full History
            </Button>
            <Button variant="emerald" size="sm" onClick={() => navigate('/gym/attendance/scanner')}>
              Open QR Scanner
            </Button>
          </div>
        }
      />

      {!tenantSettings.manualAttendanceEnabled && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>Manual Attendance is currently disabled in Attendance Settings.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Manual Attendance Form */}
        <form
          onSubmit={handleRequestSubmit}
          className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? `Edit Attendance (${editingId})` : 'Mark Manual Attendance'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                New Entry
              </button>
            )}
          </div>

          <Select
            label="Select Member"
            value={memberId}
            onChange={(e) => {
              setMemberId(e.target.value);
              const mem = tenantMembers.find((m) => m.id === e.target.value);
              if (mem?.branchId) setBranchId(mem.branchId);
            }}
            error={errors.memberId}
            options={tenantMembers.map((m) => ({
              value: m.id,
              label: `${m.fullName} (${m.id}) — ${m.status}`,
            }))}
          />

          <Select
            label="Select Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            error={errors.branchId}
            options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Attendance Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Select
              label="Attendance Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'checked_in', label: 'Present (Inside Gym)' },
                { value: 'checked_out', label: 'Present (Checked Out)' },
                { value: 'late', label: 'Late Check-in' },
                { value: 'absent', label: 'Marked Absent' },
              ]}
            />
          </div>

          {status !== 'absent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Check-in Time"
                placeholder="e.g. 08:00 AM"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                error={errors.checkInTime}
              />
              {status !== 'checked_in' && (
                <Input
                  label="Check-out Time"
                  placeholder="e.g. 09:15 AM"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  error={errors.checkOutTime}
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reason / Audit Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why manual entry or correction is required (e.g. member phone battery died, gate override)..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
            {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-navy-900 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Manual entries are automatically flagged with a <strong>Manual Correction</strong> audit indicator in attendance reports.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              type="submit"
              variant="emerald"
              size="md"
              leftIcon={CheckCircle2}
              disabled={!tenantSettings.manualAttendanceEnabled}
            >
              {editingId ? 'Update Attendance' : 'Mark Present'}
            </Button>
            <Button type="button" variant="outline" size="md" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Manually Recorded & Corrected Audit Table */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Manual Entries & Audit-Flagged Corrections
              </h2>
              <p className="text-xs text-slate-500">
                Click Edit on any record below to submit a manual attendance adjustment.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{manualRecords.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Audit Indicator</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedRecords.slice(0, 8).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{rec.memberName}</p>
                          <p className="text-xs font-mono text-slate-500">{rec.memberId} · {rec.branchName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-mono text-slate-800">{formatDate(rec.date)}</p>
                      <p className="font-mono text-slate-500 tabular-nums">
                        {rec.checkInTime} – {rec.checkOutTime || 'Inside'}
                        {rec.durationMinutes ? ` (${formatDurationLabel(rec.durationMinutes)})` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {rec.isManualCorrection ? (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                            Manual Correction
                          </span>
                          {rec.correctionNote && (
                            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] truncate">
                              {rec.correctionNote}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">{rec.source}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Edit3}
                        onClick={() => handleLoadForEdit(rec)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title={editingId ? 'Confirm Attendance Update' : 'Confirm Manual Attendance'}
        description={`Save ${status.replace('_', ' ')} entry for ${selectedMemberObj?.fullName || memberId} on ${date}? This action will be marked as a Manual Correction in the audit trail.`}
        confirmLabel={editingId ? 'Save Update' : 'Confirm Entry'}
        variant="primary"
      />
    </div>
  );
}

export default ManualAttendancePage;
