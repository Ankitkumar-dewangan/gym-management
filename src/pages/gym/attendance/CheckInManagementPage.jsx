import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  QrCode,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { cn } from '../../../utils/cn';
import { formatDate } from '../../../utils/formatters';

const CHECKIN_STEPS = [
  '1. Scan QR / ID',
  '2. Identify Member',
  '3. Verify Membership',
  '4. Check Active Session',
  '5. Confirm Check-in',
  '6. Result Logged',
];

export function CheckInManagementPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { scopedMembers } = useMemberManagement();
  const {
    todayRecords,
    verifyMemberForAttendance,
    confirmCheckIn,
    resolveMemberValidity,
  } = useAttendanceManagement();

  const [lookupInput, setLookupInput] = useState('');
  const [branchId, setBranchId] = useState(tenantBranches[0]?.id || '');
  const [verification, setVerification] = useState(null);
  const [completedRecord, setCompletedRecord] = useState(null);

  const handleVerify = (e) => {
    e?.preventDefault();
    if (!lookupInput.trim()) {
      toast.error('Enter a Member ID or QR token');
      return;
    }
    setCompletedRecord(null);
    const res = verifyMemberForAttendance(lookupInput.trim(), 'checkin');
    setVerification(res);
  };

  const handleVerifyMemberRow = (memberId) => {
    setLookupInput(memberId);
    setCompletedRecord(null);
    setVerification(verifyMemberForAttendance(memberId, 'checkin'));
  };

  const handleConfirm = () => {
    if (!verification?.member) return;
    const res = confirmCheckIn({
      memberId: verification.member.id,
      branchId: branchId || verification.member.branchId,
      source: 'QR Code',
    });
    if (res.ok) {
      setCompletedRecord(res.record);
      toast.success(`Checked in ${res.record.memberName} at ${res.record.checkInTime}`);
      setVerification(verifyMemberForAttendance(verification.member.id, 'checkin'));
    } else {
      toast.error(res.message);
    }
  };

  const activeStep = completedRecord
    ? 6
    : verification?.canConfirmCheckin
      ? 5
      : verification
        ? 4
        : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in Management"
        subtitle="Guided 6-step front-desk check-in workflow with membership validation and duplicate prevention."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/gym/attendance/check-outs')}>
              Check-out Queue
            </Button>
            <Button variant="emerald" size="sm" leftIcon={QrCode} onClick={() => navigate('/gym/attendance/scanner')}>
              Camera Scanner
            </Button>
          </div>
        }
      />

      {/* Workflow Step Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CHECKIN_STEPS.map((label, idx) => {
            const stepNum = idx + 1;
            const reached = activeStep >= stepNum;
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
        {/* Left: Verification & Confirmation */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Member Check-in Verification
          </h2>

          <form onSubmit={handleVerify} className="space-y-3">
            <Input
              label="Member ID or QR Pass Payload"
              placeholder="e.g. MEM-4094 or GymPilot:PASS:..."
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
            />
            <Select
              label="Check-in Branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
            />
            <Button type="submit" variant="primary" size="md" leftIcon={Search} className="w-full">
              Identify & Verify Member
            </Button>
          </form>

          {completedRecord && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Check-in Successful</span>
              </div>
              <p>Member: <strong>{completedRecord.memberName}</strong> ({completedRecord.memberId})</p>
              <p>Check-in Time: <span className="font-mono">{completedRecord.checkInTime}</span></p>
              <p>Branch: {completedRecord.branchName}</p>
              <p>Status: Active Verified</p>
            </div>
          )}

          {verification && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div
                className={cn(
                  'rounded-lg border px-3.5 py-2.5 text-xs flex items-start gap-2.5',
                  verification.statusTone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                  verification.statusTone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
                  verification.statusTone === 'error' && 'border-red-200 bg-red-50 text-red-900'
                )}
              >
                {verification.statusTone === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : verification.statusTone === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold">{verification.headline}</p>
                  <p className="mt-0.5">{verification.message}</p>
                </div>
              </div>

              {verification.member && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar src={verification.member.avatar} name={verification.member.fullName} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{verification.member.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {verification.membership?.effectivePlan} · Exp {formatDate(verification.membership?.effectiveExpiry)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={verification.membership?.effectiveStatus || verification.member.status} />
                </div>
              )}

              {verification.canConfirmCheckin && (
                <Button variant="emerald" size="md" leftIcon={LogIn} onClick={handleConfirm} className="w-full">
                  Confirm Check-in
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right: Eligible Members & Today's Check-ins */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Member Eligibility Queue</h2>
                <p className="text-xs text-slate-500">Select any member to run verification and check-in</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{todayRecords.length} today</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Plan & Expiry</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedMembers.map((mem) => {
                    const validity = resolveMemberValidity(mem);
                    const insideNow = todayRecords.some(
                      (r) => r.memberId === mem.id && r.status === 'checked_in'
                    );
                    return (
                      <tr key={mem.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar src={mem.avatar} name={mem.fullName} size="sm" />
                            <div>
                              <p className="font-medium text-slate-900">{mem.fullName}</p>
                              <p className="text-xs font-mono text-slate-500">{mem.id} · {mem.branchName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="font-medium text-slate-800">{validity.effectivePlan}</p>
                          <p className="font-mono text-slate-500">Exp {formatDate(validity.effectiveExpiry)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {insideNow ? (
                            <StatusBadge status="checked_in" />
                          ) : (
                            <StatusBadge status={validity.effectiveStatus} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={insideNow ? 'outline' : 'emerald'}
                            size="sm"
                            onClick={() => handleVerifyMemberRow(mem.id)}
                          >
                            {insideNow ? 'Verify Session' : 'Verify & Check In'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInManagementPage;
