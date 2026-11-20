import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Printer,
  QrCode,
  Search,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { MEMBER_PAYMENTS_DATA } from '../../constants/memberPortalData';

export function MemberPaymentsPage() {
  const [invoices, setInvoices] = useState(MEMBER_PAYMENTS_DATA.invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const summary = MEMBER_PAYMENTS_DATA.summary;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPayModal(false);
      toast.success('Payment of ₹2,500 successfully authorized via UPI!');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Payments, Invoices & Receipts"
        description="Review all membership transactions, view itemized tax invoices, and download official payment receipts."
      />

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Paid"
          value={`₹${summary.totalPaid.toLocaleString('en-IN')}`}
          helperText="Across all membership cycles"
          icon={CreditCard}
        />
        <StatCard
          label="Pending Dues"
          value={`₹${summary.pendingDues}`}
          helperText="No outstanding balances"
          icon={AlertCircle}
        />
        <StatCard
          label="Last Payment"
          value={`₹${summary.lastPaymentAmount.toLocaleString('en-IN')}`}
          helperText={summary.lastPaymentDate}
          icon={CheckCircle2}
        />
        <StatCard
          label="Next Due Date"
          value={summary.nextDueDate}
          helperText="Annual membership renewal"
          icon={Clock}
        />
      </div>

      {/* Payment History Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Billing History & GST Invoices</h3>
            <p className="text-xs text-slate-500">Official tax invoices compliant with Indian GST laws.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={CreditCard}
              onClick={() => setShowPayModal(true)}
            >
              Make Advance Payment
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice number or description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PAID', label: 'Paid' },
                { value: 'PENDING', label: 'Pending' },
              ]}
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-mono font-bold text-slate-800">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{inv.date}</td>
                  <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                    {inv.description}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{inv.paymentMode}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(inv)}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.success(`Receipt for ${inv.invoiceNumber} downloaded!`)}
                        className="text-slate-500 hover:text-slate-800 font-semibold text-xs flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Itemized Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNumber || ''}`}
        maxWidth="max-w-xl"
      >
        {selectedInvoice && (
          <div className="p-6 space-y-5 text-xs text-slate-700">
            {/* Header with Gym details */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">MY GYM CLUB PVT LTD</h3>
                <p className="text-slate-500 mt-0.5">104 Marine Drive, Nariman Point, Mumbai 400021</p>
                <p className="text-slate-500 font-mono text-[11px]">GSTIN: 27AABCM1094E1Z8</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded">
                  {selectedInvoice.status}
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 mt-1">{selectedInvoice.invoiceNumber}</p>
                <p className="text-slate-400 text-[11px]">Date: {selectedInvoice.date}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Billed To</span>
                <p className="font-bold text-slate-900 mt-0.5">Aarav Sharma</p>
                <p className="text-slate-500">Member ID: MEM-4094</p>
                <p className="text-slate-500">+91 98201 22311</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Details</span>
                <p className="text-slate-700 mt-0.5">Method: {selectedInvoice.paymentMode}</p>
                <p className="text-slate-700 font-mono text-[11px]">Txn ID: {selectedInvoice.transactionId}</p>
                <p className="text-emerald-700 font-semibold">Payment Confirmed</p>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left border-y border-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2 text-right">Taxable Amount</th>
                  <th className="py-2 px-2 text-right">GST (18%)</th>
                  <th className="py-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-800">
                    {selectedInvoice.description}
                  </td>
                  <td className="py-3 px-2 text-right">₹{selectedInvoice.baseAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-right">₹{selectedInvoice.gstAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900">
                    ₹{selectedInvoice.amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total Block */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 text-xs">Authorized Electronic Invoice (Computer Generated)</span>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total Paid: </span>
                <strong className="text-base font-mono text-slate-900">
                  ₹{selectedInvoice.amount?.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Printer}
                onClick={() => toast.success('Sending to connected printer...')}
              >
                Print Receipt
              </Button>
              <Button
                size="sm"
                leftIcon={Download}
                onClick={() => {
                  toast.success(`Invoice ${selectedInvoice.invoiceNumber} downloaded!`);
                  setShowInvoiceModal(false);
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Online Pay Modal (Demo Checkout) */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Quick Fee Checkout (Demo)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimulatePayment} className="p-6 space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-center space-y-1">
            <span className="text-xs text-primary-700 font-medium">Advance Facility Fee / Renewal Deposit</span>
            <p className="text-2xl font-extrabold text-primary-950 font-mono">₹2,500</p>
            <span className="text-[11px] text-primary-600">Simulated Gateway · No real charges</span>
          </div>

          <div className="space-y-3">
            <Select
              label="Select Payment Method"
              options={[
                { value: 'UPI', label: 'UPI QR / Virtual Payment Address' },
                { value: 'CARD', label: 'Credit or Debit Card' },
                { value: 'NETBANKING', label: 'Net Banking (HDFC, SBI, ICICI)' },
              ]}
            />
            <Input
              label="UPI ID / Cardholder Name"
              placeholder="aarav@okhdfcbank"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowPayModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={isProcessingPayment}
            >
              Authorize Payment (₹2,500)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MemberPaymentsPage;
