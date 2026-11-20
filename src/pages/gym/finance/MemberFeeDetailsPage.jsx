import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Mail,
  Phone,
  Plus,
  Receipt,
  User,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { PAYMENT_METHODS } from '../../../constants/gymFinanceData';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export function MemberFeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberFees, collectPayment, createInvoice } = useGymFinance();

  const feeRecord = useMemo(() => {
    return memberFees.find((f) => f.memberId === id || f.id === id);
  }, [memberFees, id]);

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState(feeRecord?.pendingAmount || 0);
  const [collectMethod, setCollectMethod] = useState('UPI');
  const [collectNotes, setCollectNotes] = useState('Direct balance settlement');

  if (!feeRecord) {
    return (
      <div className="space-y-6">
        <PageHeader title="Member Fee Record Not Found" />
        <EmptyState
          icon={Receipt}
          title="Fee Record Not Found"
          description="Could not locate fee records for the specified member ID."
          action={
            <Link to="/gym/finance/fees">
              <Button leftIcon={ArrowLeft}>Back to Fee Directory</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleQuickCollect = (e) => {
    e.preventDefault();
    if (collectAmount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    collectPayment({
      memberId: feeRecord.memberId,
      amount: collectAmount,
      paymentMethod: collectMethod,
      notes: collectNotes,
    });
    setIsCollectModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Fee Account: ${feeRecord.memberName}`}
        description={`Member ID: ${feeRecord.memberId} · ${feeRecord.membershipPlan} · Branch: ${feeRecord.branchName}`}
        actions={
          <div className="flex items-center gap-2">
            {feeRecord.pendingAmount > 0 && (
              <Button size="sm" onClick={() => setIsCollectModalOpen(true)} leftIcon={Receipt}>
                Collect Balance (₹{feeRecord.pendingAmount.toLocaleString('en-IN')})
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                createInvoice({
                  memberId: feeRecord.memberId,
                  memberName: feeRecord.memberName,
                  branchName: feeRecord.branchName,
                  items: [
                    { id: 1, description: feeRecord.membershipPlan, quantity: 1, unitPrice: feeRecord.totalFee, total: feeRecord.totalFee },
                  ],
                  subtotal: feeRecord.totalFee,
                  discount: feeRecord.discount,
                  taxRate: 18,
                  taxAmount: Math.round((feeRecord.finalAmount * 18) / 100),
                  totalAmount: Math.round(feeRecord.finalAmount * 1.18),
                });
                navigate('/gym/finance/invoices');
              }}
              leftIcon={FileText}
            >
              Generate Tax Invoice
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/gym/finance/fees')}>
              Back to Directory
            </Button>
          </div>
        }
      />

      {/* Member Profile & Ledger Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Member Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <img
              src={feeRecord.memberPhoto}
              alt={feeRecord.memberName}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary-100"
            />
            <div>
              <h3 className="font-bold text-base text-slate-800">{feeRecord.memberName}</h3>
              <p className="font-mono text-xs text-primary-600 font-semibold">{feeRecord.memberId}</p>
              <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                {feeRecord.paymentStatus}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{feeRecord.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{feeRecord.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{feeRecord.branchName}</span>
            </div>
          </div>
        </div>

        {/* Right: Financial Ledger Cards */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5">
            Membership Fee Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Fee</span>
              <p className="font-bold text-slate-800 mt-0.5">
                ₹{feeRecord.totalFee.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Discount</span>
              <p className="font-bold text-emerald-600 mt-0.5">
                -₹{feeRecord.discount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 uppercase font-semibold">Total Paid</span>
              <p className="font-bold text-emerald-900 mt-0.5">
                ₹{feeRecord.paidAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] text-amber-700 uppercase font-semibold">Balance Due</span>
              <p className="font-bold text-amber-900 mt-0.5">
                ₹{feeRecord.pendingAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Next Due Date: <strong>{feeRecord.dueDate}</strong></span>
            <span>Last Payment Logged: <strong>{feeRecord.lastPaymentDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Payment Settlements History</h4>
          <span className="text-xs text-slate-400">
            {feeRecord.paymentHistory?.length || 0} Records Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt / Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference Note</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!feeRecord.paymentHistory || feeRecord.paymentHistory.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No payment history recorded for this member yet.
                  </td>
                </tr>
              ) : (
                feeRecord.paymentHistory.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="py-3 px-4">{p.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.ref}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/gym/finance/receipts"
                        className="text-xs font-semibold text-primary-600 hover:underline"
                      >
                        Print Receipt
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Quick Collect Balance */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title={`Collect Fee: ${feeRecord.memberName}`}
        size="md"
      >
        <form onSubmit={handleQuickCollect} className="space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
            <span>Outstanding Balance:</span>
            <strong className="text-amber-600 font-mono">
              ₹{feeRecord.pendingAmount.toLocaleString('en-IN')}
            </strong>
          </div>

          <Input
            label="Payment Amount (₹)"
            type="number"
            min="1"
            max={feeRecord.pendingAmount}
            value={collectAmount}
            onChange={(e) => setCollectAmount(Number(e.target.value))}
            required
          />

          <Select
            label="Payment Method"
            value={collectMethod}
            onChange={(e) => setCollectMethod(e.target.value)}
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
          />

          <Input
            label="Payment Notes / Transaction ID"
            value={collectNotes}
            onChange={(e) => setCollectNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={CheckCircle2}>
              Confirm Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MemberFeeDetailsPage;
