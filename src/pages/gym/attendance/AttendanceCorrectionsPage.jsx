import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardEdit, Eye, PlusCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { cn } from '../../../utils/cn';
import { ATTENDANCE_TODAY } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

export function AttendanceCorrectionsPage() {
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    scopedCorrections,
    approveCorrectionRequest,
    rejectCorrectionRequest,
    submitCorrectionRequest,
  } = useAttendanceManagement();

  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingRequest, setViewingRequest] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null); // { type: 'approve' | 'reject', request }
  const [reviewNote, setReviewNote] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    memberId: tenantMembers[0]?.id || '',
    branchId: tenantBranches[0]?.id || '',
    requestedDate: ATTENDANCE_TODAY,
    origCheckIn: 'Not Recorded',
    origCheckOut: '—',
    reqCheckIn: '07:15 AM',
    reqCheckOut: '08:30 AM',
    reason: '',
  });

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return scopedCorrections;
    return scopedCorrections.filter((c) => c.status === statusFilter);
  }, [scopedCorrections, statusFilter]);

  const handleConfirmDecision = () => {
    if (!decisionModal) return;
    if (decisionModal.type === 'approve') {
      approveCorrectionRequest(
        decisionModal.request.id,
        reviewNote || 'Approved after front-desk log check.'
      );
      toast.success(`Approved correction ${decisionModal.request.id}`);
    } else {
      rejectCorrectionRequest(
        decisionModal.request.id,
        reviewNote || 'Rejected after review.'
      );
      toast.success(`Rejected correction ${decisionModal.request.id}`);
    }
    setDecisionModal(null);
    setReviewNote('');
  };

  const handleSubmitNewRequest = (e) => {
    e.preventDefault();
    if (!newForm.reason.trim()) {
      toast.error('Please enter a reason for the correction request');
      return;
    }
    submitCorrectionRequest(newForm);
    toast.success('Correction request logged for review');
    setNewOpen(false);
    setNewForm((prev) => ({ ...prev, reason: '' }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Correction Requests"
        subtitle="Review, approve, or reject member requests for missed scans or adjusted session times."
        actions={
          <Button variant="emerald" size="sm" leftIcon={PlusCircle} onClick={() => setNewOpen(true)}>
            Log Correction Request
          </Button>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-500">
          {filtered.length} request{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No correction requests in this status"
          description="Submitted member correction requests will appear here for manager approval."
          actionLabel="View All Requests"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Request ID</th>
                  <th className="px-4 py-3 font-medium">Member Name</th>
                  <th className="px-4 py-3 font-medium">Requested Date</th>
                  <th className="px-4 py-3 font-medium">Original Attendance</th>
                  <th className="px-4 py-3 font-medium">Requested Correction</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Request Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">
                      {req.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar src={req.memberAvatar} name={req.memberName} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{req.memberName}</p>
                          <p className="text-xs font-mono text-slate-500">{req.memberId} · {req.branchName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {formatDate(req.requestedDate)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {req.originalAttendance.checkInTime} → {req.originalAttendance.checkOutTime}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">
                      {req.requestedCorrection.checkInTime} → {req.requestedCorrection.checkOutTime}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[220px]">
                      <p className="truncate">{req.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={Eye}
                          onClick={() => setViewingRequest(req)}
                        >
                          View
                        </Button>
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="emerald"
                              size="sm"
                              leftIcon={CheckCircle2}
                              onClick={() => {
                                setReviewNote('');
                                setDecisionModal({ type: 'approve', request: req });
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={XCircle}
                              onClick={() => {
                                setReviewNote('');
                                setDecisionModal({ type: 'reject', request: req });
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      <Modal
        isOpen={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        title={`Correction Request ${viewingRequest?.id || ''}`}
        description={`Submitted by ${viewingRequest?.memberName || ''} · ${viewingRequest?.submittedAt || ''}`}
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingRequest(null)}>
            Close
          </Button>
        }
      >
        {viewingRequest && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar src={viewingRequest.memberAvatar} name={viewingRequest.memberName} size="md" />
                <div>
                  <p className="font-semibold text-slate-900">{viewingRequest.memberName}</p>
                  <p className="text-xs font-mono text-slate-500">
                    {viewingRequest.memberId} · {viewingRequest.branchName}
                  </p>
                </div>
              </div>
              <StatusBadge status={viewingRequest.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-slate-500">Original Attendance</p>
                <p className="font-mono font-semibold text-slate-800 mt-1">
                  {viewingRequest.originalAttendance.checkInTime} → {viewingRequest.originalAttendance.checkOutTime}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-emerald-700">Requested Correction</p>
                <p className="font-mono font-semibold text-emerald-900 mt-1">
                  {viewingRequest.requestedCorrection.checkInTime} → {viewingRequest.requestedCorrection.checkOutTime}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500">Member Reason</p>
              <p className="text-sm text-slate-800 mt-1">{viewingRequest.reason}</p>
            </div>

            {viewingRequest.reviewNote && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <span className="font-semibold">Manager Review Note:</span> {viewingRequest.reviewNote}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve / Reject Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(decisionModal)}
        onClose={() => setDecisionModal(null)}
        onConfirm={handleConfirmDecision}
        title={
          decisionModal?.type === 'approve'
            ? `Approve Correction ${decisionModal?.request?.id}?`
            : `Reject Correction ${decisionModal?.request?.id}?`
        }
        description={
          decisionModal?.type === 'approve'
            ? `Approving updates ${decisionModal?.request?.memberName}'s attendance record to ${decisionModal?.request?.requestedCorrection?.checkInTime} – ${decisionModal?.request?.requestedCorrection?.checkOutTime} with a Manual Correction audit flag.`
            : `Rejecting declines ${decisionModal?.request?.memberName}'s request and keeps original logs unchanged.`
        }
        confirmLabel={decisionModal?.type === 'approve' ? 'Approve Correction' : 'Reject Request'}
        variant={decisionModal?.type === 'approve' ? 'primary' : 'danger'}
      />

      {/* Submit New Demo Correction Modal */}
      <Modal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        title="Log Attendance Correction Request"
        description="Submit a simulated member attendance correction request for review."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" leftIcon={ClipboardEdit} onClick={handleSubmitNewRequest}>
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitNewRequest} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Member"
              value={newForm.memberId}
              onChange={(e) => setNewForm((p) => ({ ...p, memberId: e.target.value }))}
              options={tenantMembers.map((m) => ({ value: m.id, label: `${m.fullName} (${m.id})` }))}
            />
            <Select
              label="Branch"
              value={newForm.branchId}
              onChange={(e) => setNewForm((p) => ({ ...p, branchId: e.target.value }))}
              options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={newForm.requestedDate}
              onChange={(e) => setNewForm((p) => ({ ...p, requestedDate: e.target.value }))}
            />
            <Input
              label="Requested Check-in"
              value={newForm.reqCheckIn}
              onChange={(e) => setNewForm((p) => ({ ...p, reqCheckIn: e.target.value }))}
            />
            <Input
              label="Requested Check-out"
              value={newForm.reqCheckOut}
              onChange={(e) => setNewForm((p) => ({ ...p, reqCheckOut: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Reason</label>
            <textarea
              rows={3}
              value={newForm.reason}
              onChange={(e) => setNewForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="Reason for missed scan or time adjustment..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-700 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AttendanceCorrectionsPage;
