import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  Eye,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export default function ExpenseApprovalsPage() {
  const { expenses, approveExpense, rejectExpense } = useGymFinance();

  const [activeItem, setActiveItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'view'
  const [remarks, setRemarks] = useState('');

  const pendingExpenses = useMemo(() => {
    return (expenses || []).filter((e) => e.status === 'Pending');
  }, [expenses]);

  const totalPendingAmount = pendingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleApprove = () => {
    if (activeItem) {
      approveExpense(activeItem.id, remarks || 'Approved by Club Director');
      setActiveItem(null);
      setModalType(null);
      setRemarks('');
    }
  };

  const handleReject = () => {
    if (activeItem) {
      rejectExpense(activeItem.id, remarks || 'Declined during operational audit');
      setActiveItem(null);
      setModalType(null);
      setRemarks('');
    }
  };

  const handleApproveAll = () => {
    if (confirm(`Approve all ${pendingExpenses.length} pending claims totaling ₹${totalPendingAmount.toLocaleString('en-IN')}?`)) {
      pendingExpenses.forEach((exp) => approveExpense(exp.id, 'Bulk approved by Management'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Approvals Queue"
        description="Verify and authorize pending operational expenditures and staff reimbursements."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/finance/expenses">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to All Expenses
              </Button>
            </Link>
            {pendingExpenses.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={CheckCircle2}
                onClick={handleApproveAll}
              >
                Approve All ({pendingExpenses.length})
              </Button>
            )}
          </div>
        }
      />

      {/* Summary Banner */}
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              {pendingExpenses.length} Pending Approval Claims
            </h3>
            <p className="text-xs text-slate-500">
              Total value requiring financial authorization: <strong className="text-slate-900 font-bold">₹{totalPendingAmount.toLocaleString('en-IN')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {pendingExpenses.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-200 bg-white shadow-2xs">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <h3 className="font-semibold text-slate-900 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1">There are no pending expense approval requests right now.</p>
            <div className="mt-4">
              <Link to="/gym/finance/expenses">
                <Button variant="outline" size="sm">
                  View Expense Ledger
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          pendingExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded">
                    {exp.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {exp.category}
                  </span>
                  <span className="text-xs text-slate-400">• {exp.branchName}</span>
                </div>

                <h4 className="font-bold text-base text-slate-900">{exp.title}</h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Vendor: <strong className="text-slate-700">{exp.vendor || 'Vendor'}</strong></span>
                  <span>• Date: {exp.date}</span>
                  <span>• Mode: {exp.paymentMethod}</span>
                  <span>• Logged by: {exp.submittedBy || 'Front Desk'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Claim Amount</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Eye}
                    onClick={() => {
                      setActiveItem(exp);
                      setModalType('view');
                    }}
                  >
                    Bill Proof
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setActiveItem(exp);
                      setModalType('reject');
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={CheckCircle2}
                    onClick={() => {
                      setActiveItem(exp);
                      setModalType('approve');
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approve Modal */}
      {modalType === 'approve' && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveItem(null);
            setModalType(null);
          }}
          title="Approve Operational Expenditure"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <p className="text-sm text-slate-600">
              Confirm approval for <strong className="text-slate-900 font-semibold">{activeItem.title}</strong> of{' '}
              <strong className="text-slate-900 font-bold">
                ₹{Number(activeItem.amount).toLocaleString('en-IN')}
              </strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Approval Remarks (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Approved per branch operational budget Q4."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setActiveItem(null);
                  setModalType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleApprove}
              >
                Authorize Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {modalType === 'reject' && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveItem(null);
            setModalType(null);
          }}
          title="Decline Expense Claim"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <p className="text-sm text-slate-600">
              Provide reason for rejecting the claim of{' '}
              <strong className="text-slate-900">₹{Number(activeItem.amount).toLocaleString('en-IN')}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Audit Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Missing valid GST invoice / bill exceeds permitted ceiling."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setActiveItem(null);
                  setModalType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleReject}
              >
                Reject Claim
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Bill Modal */}
      {modalType === 'view' && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveItem(null);
            setModalType(null);
          }}
          title={`Supporting Proof: ${activeItem.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-semibold text-slate-800">{activeItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">₹{Number(activeItem.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span>{activeItem.vendor || 'Vendor Partner'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-8 text-center bg-slate-100 flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-navy-800 mb-2" />
              <div className="text-sm font-semibold text-slate-800">vendor_tax_bill_signed.pdf</div>
              <p className="text-xs text-slate-400 mt-1">Simulated verified electronic voucher attachment</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setActiveItem(null);
                setModalType(null);
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}