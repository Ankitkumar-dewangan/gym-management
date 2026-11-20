import { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  FileText,
  DollarSign,
  ArrowDownLeft,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export default function RefundsPage() {
  const { refunds, memberFees, createRefundRequest, processRefund, rejectRefund } = useGymFinance();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Create Form State
  const [createForm, setCreateForm] = useState({
    memberId: memberFees?.[0]?.memberId || '',
    amount: '',
    originalTxnId: 'TXN-0901',
    reason: 'Relocation to another city',
    paymentMethod: 'UPI',
  });

  const filteredRefunds = useMemo(() => {
    return (refunds || []).filter((r) => {
      const matchSearch =
        !search ||
        r.id?.toLowerCase().includes(search.toLowerCase()) ||
        r.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        r.originalTxnId?.toLowerCase().includes(search.toLowerCase()) ||
        r.reason?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [refunds, search, statusFilter]);

  // Metrics
  const totalRefundAmount = (refunds || [])
    .filter((r) => r.status === 'Processed')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const pendingCount = (refunds || []).filter((r) => r.status === 'Requested' || r.status === 'Approved').length;
  const processedCount = (refunds || []).filter((r) => r.status === 'Processed').length;
  const rejectedCount = (refunds || []).filter((r) => r.status === 'Rejected').length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const selMember = memberFees.find((m) => m.memberId === createForm.memberId);
    createRefundRequest({
      memberId: createForm.memberId,
      memberName: selMember?.memberName || 'Member',
      originalTxnId: createForm.originalTxnId,
      amount: Number(createForm.amount),
      reason: createForm.reason,
      paymentMethod: createForm.paymentMethod,
    });
    setIsCreateOpen(false);
    setCreateForm({
      memberId: memberFees?.[0]?.memberId || '',
      amount: '',
      originalTxnId: 'TXN-0901',
      reason: 'Relocation to another city',
      paymentMethod: 'UPI',
    });
  };

  const handleProcessConfirm = () => {
    if (activeItem) {
      processRefund(activeItem.id, remarks);
      setIsProcessOpen(false);
      setActiveItem(null);
      setRemarks('');
    }
  };

  const handleRejectConfirm = () => {
    if (activeItem) {
      rejectRefund(activeItem.id, remarks);
      setIsRejectOpen(false);
      setActiveItem(null);
      setRemarks('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Management"
        description="Review member refund claims, reversal approvals, and transaction settlement tracking."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Initiate Refund Request
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Disbursed</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalRefundAmount.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">Processed refund payouts</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">{pendingCount}</div>
          <p className="mt-1 text-xs text-slate-500">Awaiting director authorization</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Settled & Processed</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{processedCount}</div>
          <p className="mt-1 text-xs text-emerald-600">Returned to source accounts</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rejected Requests</span>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-700">{rejectedCount}</div>
          <p className="mt-1 text-xs text-slate-500">Declined per cancellation policy</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by refund ID, member name, transaction ID, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'requested', label: 'Pending Review (Requested)' },
              { value: 'processed', label: 'Settled (Processed)' },
              { value: 'rejected', label: 'Declined (Rejected)' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Refund ID</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Original Txn</th>
                <th className="px-4 py-3">Refund Amount</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Requested Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => {
                  const isPending = ref.status === 'Requested' || ref.status === 'Approved';
                  const isProcessed = ref.status === 'Processed';
                  const isRejected = ref.status === 'Rejected';

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-navy-800">
                        {ref.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{ref.memberName}</div>
                        <div className="text-xs text-slate-400 font-mono">{ref.memberId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {ref.originalTxnId}
                      </td>
                      <td className="px-4 py-3 font-bold text-red-600">
                        ₹{Number(ref.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                        {ref.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {ref.requestDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isProcessed
                              ? 'bg-emerald-50 text-emerald-700'
                              : isRejected
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isProcessed && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            leftIcon={Eye}
                            onClick={() => setSelectedRefund(ref)}
                          >
                            Details
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => {
                                  setActiveItem(ref);
                                  setIsProcessOpen(true);
                                }}
                              >
                                Disburse
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  setActiveItem(ref);
                                  setIsRejectOpen(true);
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initiate Refund Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Initiate Member Refund Request"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-slate-800">
            <Select
              label="Select Member"
              required
              value={createForm.memberId}
              onChange={(e) => setCreateForm({ ...createForm, memberId: e.target.value })}
              options={(memberFees || []).map((m) => ({
                value: m.memberId,
                label: `${m.memberName} (${m.memberId}) - Paid: ₹${m.paidAmount}`,
              }))}
            />

            <Input
              label="Original Transaction Reference"
              required
              placeholder="e.g. TXN-1002"
              value={createForm.originalTxnId}
              onChange={(e) => setCreateForm({ ...createForm, originalTxnId: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Refund Amount (₹)"
                type="number"
                required
                min="1"
                placeholder="2000"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
              />

              <Select
                label="Reversal Mode"
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                options={[
                  { value: 'UPI', label: 'UPI (Instant)' },
                  { value: 'Bank Transfer', label: 'Bank Transfer (NEFT)' },
                  { value: 'Credit Card Reversal', label: 'Credit Card Reversal' },
                  { value: 'Cash', label: 'Cash at Counter' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
                placeholder="Reason provided by member (e.g., medical leave, duplicate transaction, moving out)..."
                value={createForm.reason}
                onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>Refund claims require review against club policy and deduction of registration charges.</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Disburse Modal */}
      {isProcessOpen && activeItem && (
        <Modal
          isOpen={isProcessOpen}
          onClose={() => setIsProcessOpen(false)}
          title={`Confirm Refund Payout: ${activeItem.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <p className="text-sm text-slate-600">
              You are authorizing a refund payout of{' '}
              <strong className="text-slate-900 font-bold">
                ₹{Number(activeItem.amount).toLocaleString('en-IN')}
              </strong>{' '}
              to <strong className="text-slate-900">{activeItem.memberName}</strong>.
            </p>

            <Input
              label="Settlement Remarks & Reference"
              placeholder="e.g. UTR / NEFT Reference number"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsProcessOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleProcessConfirm}
              >
                Confirm Disbursement
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decline Modal */}
      {isRejectOpen && activeItem && (
        <Modal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          title={`Decline Refund Claim: ${activeItem.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <p className="text-sm text-slate-600">
              State the reason for declining the refund claim of{' '}
              <strong>{activeItem.memberName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Decline Audit Reason</label>
              <textarea
                rows={3}
                placeholder="e.g. Membership cancellation policy requires 15 days notice..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsRejectOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleRejectConfirm}
              >
                Decline Claim
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Details Modal */}
      {selectedRefund && (
        <Modal
          isOpen={Boolean(selectedRefund)}
          onClose={() => setSelectedRefund(null)}
          title={`Refund Audit: ${selectedRefund.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Member:</span>
              <span className="font-semibold text-slate-900">{selectedRefund.memberName} ({selectedRefund.memberId})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Original Txn:</span>
              <span className="font-mono text-slate-700">{selectedRefund.originalTxnId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Refund Amount:</span>
              <span className="font-bold text-red-600">₹{Number(selectedRefund.amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Status:</span>
              <span className="font-medium text-slate-900">{selectedRefund.status}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Requested On:</span>
              <span>{selectedRefund.requestDate}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Processed On:</span>
              <span>{selectedRefund.processedDate || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">Reason:</span>
              <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                {selectedRefund.reason}
              </p>
            </div>
            {selectedRefund.remarks && (
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Audit Remarks:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                  {selectedRefund.remarks}
                </p>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedRefund(null)}
              >
                Close Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}