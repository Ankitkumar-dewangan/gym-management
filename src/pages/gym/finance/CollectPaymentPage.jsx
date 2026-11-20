import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Printer,
  Receipt,
  User,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { PAYMENT_METHODS } from '../../../constants/gymFinanceData';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export function CollectPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') || '';

  const { memberFees, collectPayment } = useGymFinance();

  const [selectedMemberId, setSelectedMemberId] = useState(
    preselectedMemberId || memberFees[0]?.memberId || ''
  );

  const selectedFeeRecord = useMemo(() => {
    return memberFees.find((f) => f.memberId === selectedMemberId) || memberFees[0];
  }, [memberFees, selectedMemberId]);

  const [paymentAmount, setPaymentAmount] = useState(
    selectedFeeRecord?.pendingAmount > 0 ? selectedFeeRecord.pendingAmount : 5000
  );
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [reference, setReference] = useState('UPI-IND-8890');
  const [paymentNotes, setPaymentNotes] = useState('Counter payment collected');
  const [isAdvancePayment, setIsAdvancePayment] = useState(false);

  // Success Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  useEffect(() => {
    if (selectedFeeRecord) {
      if (!isAdvancePayment) {
        setPaymentAmount(selectedFeeRecord.pendingAmount > 0 ? selectedFeeRecord.pendingAmount : 0);
      }
    }
  }, [selectedFeeRecord, isAdvancePayment]);

  const remainingAfterPayment = useMemo(() => {
    if (!selectedFeeRecord) return 0;
    return Math.max(0, (selectedFeeRecord.pendingAmount || 0) - (Number(paymentAmount) || 0));
  }, [selectedFeeRecord, paymentAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number(paymentAmount);

    if (amountNum <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (!isAdvancePayment && selectedFeeRecord?.pendingAmount && amountNum > selectedFeeRecord.pendingAmount) {
      toast.error('Payment exceeds pending amount. Enable advance payment toggle to collect extra.');
      return;
    }

    const { txnId, recId } = collectPayment({
      memberId: selectedFeeRecord.memberId,
      amount: amountNum,
      paymentMethod,
      paymentDate,
      reference,
      notes: paymentNotes,
      isAdvance: isAdvancePayment,
    });

    setGeneratedReceipt({
      receiptNumber: recId,
      transactionId: txnId,
      memberName: selectedFeeRecord.memberName,
      memberId: selectedFeeRecord.memberId,
      amount: amountNum,
      method: paymentMethod,
      date: paymentDate,
      plan: selectedFeeRecord.membershipPlan,
      balanceRemaining: remainingAfterPayment,
    });

    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Collect Member Fee & Dues"
        description="Record counter cash, UPI digital transfers, POS card payments, or bank settlements with instant receipt issuance."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Member Selection & Fee Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" /> Member Account & Active Balance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Gym Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={memberFees.map((f) => ({
                value: f.memberId,
                label: `${f.memberName} (${f.memberId}) — Bal: ₹${f.pendingAmount.toLocaleString('en-IN')}`,
              }))}
              required
            />

            <Input
              label="Associated Membership Plan"
              value={selectedFeeRecord?.membershipPlan || ''}
              disabled
            />
          </div>

          {/* Balance Breakdown Strip */}
          {selectedFeeRecord && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Fee</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  ₹{selectedFeeRecord.finalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Previously Paid</span>
                <p className="font-bold text-emerald-600 mt-0.5">
                  ₹{selectedFeeRecord.paidAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Balance</span>
                <p className="font-bold text-amber-600 mt-0.5">
                  ₹{selectedFeeRecord.pendingAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance After Payment</span>
                <p className="font-bold text-primary-600 mt-0.5">
                  ₹{remainingAfterPayment.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Payment Particulars */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" /> Payment Transaction Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Amount (₹)"
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />

            <Select
              label="Payment Mode"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
              required
            />

            <Input
              label="Transaction Reference / Cheque #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UPI/20261120/49102"
              required
            />
          </div>

          <div>
            <Input
              label="Payment Notes / Internal Remarks"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2.5 pt-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAdvancePayment}
              onChange={(e) => setIsAdvancePayment(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span>Allow advance payment beyond current pending dues</span>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <Button type="button" variant="outline" onClick={() => navigate('/gym/finance')}>
            Cancel
          </Button>

          <Button type="submit" leftIcon={CheckCircle2}>
            Confirm Payment Collection (₹{Number(paymentAmount || 0).toLocaleString('en-IN')})
          </Button>
        </div>
      </form>

      {/* Modal: Receipt Preview */}
      {generatedReceipt && (
        <Modal
          isOpen={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false);
            navigate('/gym/finance/receipts');
          }}
          title="Payment Receipt Issued"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary-600">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">PULSE FITNESS STUDIO</h3>
                <p className="text-[11px] text-slate-500">Official Membership Fee Receipt</p>
              </div>

              <div className="border-t border-b border-slate-200 py-3 text-left space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <strong className="font-mono text-slate-800">{generatedReceipt.receiptNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <strong className="font-mono text-slate-800">{generatedReceipt.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Member:</span>
                  <strong>{generatedReceipt.memberName} ({generatedReceipt.memberId})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span>{generatedReceipt.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span>{generatedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span>{generatedReceipt.method}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-800">
                  <span>Amount Paid:</span>
                  <span className="font-mono">₹{generatedReceipt.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Remaining Due:</span>
                  <span>₹{generatedReceipt.balanceRemaining.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Thank you for your payment. Powered by AGP Empire SaaS.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                leftIcon={Printer}
              >
                Print Receipt
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setReceiptModalOpen(false);
                  navigate('/gym/finance/receipts');
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CollectPaymentPage;
