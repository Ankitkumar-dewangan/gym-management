import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Upload,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { createExpense } = useGymFinance();
  const { branches } = useTenant();

  const [form, setForm] = useState({
    title: '',
    category: 'Electricity',
    branchName: branches?.[0]?.name || 'Downtown Main Arena',
    amount: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    billNumber: '',
    description: '',
    receiptUploaded: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    setIsSubmitting(true);
    createExpense({
      title: form.title,
      category: form.category,
      branchName: form.branchName,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      date: form.date,
      vendor: form.vendor || 'Facility Vendor',
      receiptUrl: form.billNumber ? `BILL-${form.billNumber}.pdf` : 'invoice_voucher.pdf',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/gym/finance/expenses');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Record Operational Expense"
        description="Log an operational expenditure, utility bill, or facility purchase for accounting and audit."
        actions={
          <Link to="/gym/finance/expenses">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Expenses
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Expense Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify the expenditure title, category, branch, and financial amount.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Expense Title"
                required
                placeholder="e.g. October Commercial Electricity Bill"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <Select
              label="Expense Category"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: 'Rent', label: 'Rent' },
                { value: 'Electricity', label: 'Electricity' },
                { value: 'Equipment Maintenance', label: 'Equipment Maintenance' },
                { value: 'Staff Salaries', label: 'Staff Salaries' },
                { value: 'Cleaning & Housekeeping', label: 'Cleaning & Housekeeping' },
                { value: 'Marketing & Promotion', label: 'Marketing & Promotion' },
                { value: 'Software & SaaS', label: 'Software & SaaS' },
                { value: 'Taxes & GST', label: 'Taxes & GST' },
                { value: 'Repair & Renovation', label: 'Repair & Renovation' },
                { value: 'Supplements & Water', label: 'Supplements & Water' },
                { value: 'Miscellaneous', label: 'Miscellaneous' },
              ]}
            />

            <Select
              label="Branch"
              required
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              options={(branches || []).map((b) => ({ value: b.name, label: b.name }))}
            />

            <Input
              label="Amount in INR (₹)"
              type="number"
              min="1"
              required
              placeholder="e.g. 18500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <Select
              label="Payment Method"
              required
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              options={[
                { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
                { value: 'UPI', label: 'UPI / QR Code' },
                { value: 'Cash', label: 'Cash / Petty Cash' },
                { value: 'Corporate Card', label: 'Corporate Credit Card' },
                { value: 'Cheque', label: 'Account Payee Cheque' },
              ]}
            />

            <Input
              label="Expense Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <Input
              label="Vendor / Payee Name"
              placeholder="e.g. State Electricity Distribution Co."
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />

            <Input
              label="Invoice / Bill Ref Number"
              placeholder="e.g. EB-2026-9941"
              value={form.billNumber}
              onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Internal Description & Justification
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or purchase rationale for the audit committee..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>
        </div>

        {/* Attachment Card */}
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Bill / Receipt Proof Attachment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload vendor tax invoice, GST bill, or POS slip (PDF, PNG, JPG).
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-navy-700 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-medium text-slate-700">
              Drag and drop vendor bill or <span className="text-navy-800 font-semibold cursor-pointer">browse file</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pre-attached: vendor_tax_invoice.pdf
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/gym/finance/expenses">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Recording Expense...' : 'Submit Expense for Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
}