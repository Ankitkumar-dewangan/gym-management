import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  QrCode,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { cn } from '../../../utils/cn';
import { formatDurationLabel } from '../../../utils/attendanceUtils';

const CHECKOUT_STEPS = [
  '1. Scan QR / ID',
  '2. Active Session Lookup',
  '3. Verify Member & Duration',
  '4. Confirm Check-out',
  '5. Duration Recorded',
];

export function CheckOutManagementPage() {
  const navigate = useNavigate();
  const {
    currentlyInsideRecords,
    verifyMemberForAttendance,
    confirmCheckOut,
  } = useAttendanceManagement();

  const [lookupInput, setLookupInput] = useState('');
  const [verification, setVerification] = useState(null);
  const [completedRecord, setCompletedRecord] = useState(null);

  const handleLookup = (e) => {
    e?.preventDefault();
    if (!lookupInput.trim()) {
      toast.error('Enter a Member ID or QR token');
      return;
    }
    setCompletedRecord(null);
    setVerification(verifyMemberForAttendance(lookupInput.trim(), 'checkout'));
  };

  const handleConfirmCheckOut = (targetRecord = null) => {
    const memberId = targetRecord?.memberId || verification?.member?.id;
    const attendanceId = targetRecord?.id || verification?.activeSession?.id;
    if (!memberId) return;

    const res = confirmCheckOut({
      memberId,
      attendanceId,
      source: 'QR Code',
    });

    if (res.ok) {
      setCompletedRecord(res.record);
      toast.success(
        `${res.record.memberName} checked out · Duration ${formatDurationLabel(res.record.durationMinutes)}`
      );
      setVerification(null);
    } else {
      toast.error(res.message);
    }
  };

  const activeStep = completedRecord
    ? 5
    : verification?.canConfirmCheckout
      ? 4
      : verification
        ? 2
        : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-out Management"
        subtitle="Verify active member sessions, calculate total gym duration, and record check-outs."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/check-ins')}>
              Check-in Queue
            </Button>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Camera Scanner
            </Button>
          </div>
        }
      />

      {/* 5-Step Check-out Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CHECKOUT_STEPS.map((label, idx) => {
            const reached = activeStep >= idx + 1;
            return (
              <div
                key={label}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium text-center',
                  reached
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                )}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Check-out Verification */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Scan or Enter Member to Check Out
          </h2>

          <form onSubmit={handleLookup} className="space-y-3">
            <Input
              label="Member ID or QR Token"
              placeholder="e.g. MEM-4093"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
            />
            <Button type="submit" variant="primary" size="md" leftIcon={Search} className="w-full">
              Find Active Session
            </Button>
          </form>

          {completedRecord && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Check-out Successful</span>
              </div>
              <p>Member: <strong>{completedRecord.memberName}</strong> ({completedRecord.memberId})</p>
              <p>
                Session: <span className="font-mono">{completedRecord.checkInTime}</span> →{' '}
                <span className="font-mono">{completedRecord.checkOutTime}</span>
              </p>
              <p>
                Total Gym Duration:{' '}
                <strong className="font-mono">{formatDurationLabel(completedRecord.durationMinutes)}</strong>
              </p>
            </div>
          )}

          {verification && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div
                className={cn(
                  'rounded-lg border px-3.5 py-2.5 text-xs flex items-start gap-2.5',
                  verification.statusTone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                )}
              >
                {verification.statusTone === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold">{verification.headline}</p>
                  <p className="mt-0.5">{verification.message}</p>
                </div>
              </div>

              {verification.member && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={verification.member.avatar} name={verification.member.fullName} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{verification.member.fullName}</p>
                      <p className="text-xs font-mono text-slate-500">
                        {verification.member.id} · {verification.activeSession?.branchName || verification.member.branchName}
                      </p>
                    </div>
                  </div>
                  {verification.activeSession && (
                    <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
                      <span className="text-slate-500">
                        Checked in at <strong className="font-mono text-slate-800">{verification.activeSession.checkInTime}</strong>
                      </span>
                      <span className="font-mono font-semibold text-emerald-700">
                        Est. {formatDurationLabel(verification.estimatedDurationMinutes)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {verification.canConfirmCheckout && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={LogOut}
                  onClick={() => handleConfirmCheckOut(null)}
                  className="w-full"
                >
                  Confirm Check-out
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right: Currently Inside Sessions */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Active Check-in Sessions</h2>
              <p className="text-xs text-slate-500">
                Members currently inside who require check-out completion
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{currentlyInsideRecords.length} active</span>
          </div>

          {currentlyInsideRecords.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Clock className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-800">All checked-in members have checked out</p>
              <p className="text-xs text-slate-500">New QR or manual check-ins will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Check-in Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentlyInsideRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar src={rec.memberAvatar} name={rec.memberName} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900">{rec.memberName}</p>
                            <p className="text-xs font-mono text-slate-500">{rec.memberId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">{rec.branchName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-900 tabular-nums">{rec.checkInTime}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status="checked_in" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={LogOut}
                          onClick={() => handleConfirmCheckOut(rec)}
                        >
                          Mark Check-out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckOutManagementPage;
