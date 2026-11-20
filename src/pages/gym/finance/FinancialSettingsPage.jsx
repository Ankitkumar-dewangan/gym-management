import { useState } from 'react';
import {
  Settings,
  CreditCard,
  Percent,
  FileText,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  Building2,
  QrCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export default function FinancialSettingsPage() {
  const { financeSettings, updateFinanceSettings, resetFinanceData } = useGymFinance();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'tax' | 'payments' | 'invoices' | 'reminders'
  const [form, setForm] = useState(financeSettings || {});

  const handleSave = (e) => {
    e.preventDefault();
    updateFinanceSettings(form);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Financial & Billing Settings"
        description="Configure GST tax slabs, payment gateways, invoice templates, and automated WhatsApp dues reminders."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={() => {
                if (confirm('Restore finance mock data and settings to system defaults?')) {
                  resetFinanceData();
                }
              }}
            >
              Reset Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Save}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'general', label: 'General Finance', icon: Settings },
          { id: 'tax', label: 'GST & Taxes', icon: Percent },
          { id: 'payments', label: 'Payment Methods & UPI', icon: CreditCard },
          { id: 'invoices', label: 'Invoice & Receipts', icon: FileText },
          { id: 'reminders', label: 'Automated Reminders', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: General */}
        {activeTab === 'general' && (
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">General Accounting Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define currency defaults, fiscal year cycle, and grace periods.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Currency Symbol"
                value="₹ (INR)"
                disabled
              />

              <Select
                label="Fiscal Year Cycle"
                value="apr-mar"
                options={[
                  { value: 'apr-mar', label: 'April 1 – March 31 (Indian Fiscal Year)' },
                  { value: 'jan-dec', label: 'January 1 – December 31 (Calendar Year)' },
                ]}
              />

              <Input
                label="Fee Due Grace Period (Days)"
                type="number"
                min="0"
                value={form.gracePeriodDays || 5}
                onChange={(e) => setForm({ ...form, gracePeriodDays: Number(e.target.value) })}
              />

              <Select
                label="Late Fee Policy"
                value="percentage"
                options={[
                  { value: 'percentage', label: '2% after grace period' },
                  { value: 'fixed', label: '₹100 flat fee per week' },
                  { value: 'none', label: 'No late fee penalty' },
                ]}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowPartialPayments !== false}
                  onChange={(e) => setForm({ ...form, allowPartialPayments: e.target.checked })}
                  className="rounded border-slate-300 text-navy-900 focus:ring-navy-800"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Allow Partial Payment Collections</span>
                  <span className="text-xs text-slate-500">Allow members to pay tuition and membership fees in installments.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoGenerateReceipts !== false}
                  onChange={(e) => setForm({ ...form, autoGenerateReceipts: e.target.checked })}
                  className="rounded border-slate-300 text-navy-900 focus:ring-navy-800"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Auto-generate Receipt on Payment</span>
                  <span className="text-xs text-slate-500">Automatically produce an official payment voucher upon every settlement.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: Tax & GST */}
        {activeTab === 'tax' && (
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">GST & Tax Invoicing Compliance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure Goods & Services Tax (GST) parameters for Indian tax filing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Gym Club GSTIN"
                required
                placeholder="07AAAAA0000A1Z5"
                value={form.gstNumber || '07AAAAA0000A1Z5'}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              />

              <Input
                label="HSN / SAC Code (Fitness Services)"
                required
                placeholder="999723"
                value={form.sacCode || '999723'}
                onChange={(e) => setForm({ ...form, sacCode: e.target.value })}
              />

              <Input
                label="CGST Surcharge (%)"
                type="number"
                value={form.cgstRate || 9}
                onChange={(e) => setForm({ ...form, cgstRate: Number(e.target.value) })}
              />

              <Input
                label="SGST Surcharge (%)"
                type="number"
                value={form.sgstRate || 9}
                onChange={(e) => setForm({ ...form, sgstRate: Number(e.target.value) })}
              />
            </div>

            <div className="p-3 bg-navy-50 rounded-lg border border-navy-100 text-xs text-navy-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-navy-700 mt-0.5" />
              <span>
                Standard GST rate on gym memberships in India is <strong>18% (9% CGST + 9% SGST)</strong>. Invoices produced will itemize these tax breakdowns automatically.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Payment Methods */}
        {activeTab === 'payments' && (
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">Payment Gateways & Counter Accounts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define your UPI VPA, QR codes, and bank account for collections.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Gym Official UPI VPA / ID"
                placeholder="mygymclub@okhdfcbank"
                value={form.upiId || 'mygymclub@okhdfcbank'}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              />

              <Input
                label="Account Beneficiary Name"
                placeholder="MY GYM FITNESS PRIVATE LIMITED"
                value={form.bankAccountName || 'MY GYM FITNESS PRIVATE LIMITED'}
                onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
              />

              <Input
                label="Bank Account Number"
                placeholder="50200012345678"
                value={form.bankAccountNumber || '50200012345678'}
                onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
              />

              <Input
                label="Bank IFSC Code"
                placeholder="HDFC0000123"
                value={form.bankIfsc || 'HDFC0000123'}
                onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })}
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Accepted Payment Modes</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {['UPI / QR', 'Credit / Debit Card', 'Net Banking', 'Cash at Counter'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-navy-800" />
                    <span className="font-medium text-slate-800">{mode}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Invoices & Receipts */}
        {activeTab === 'invoices' && (
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">Invoice & Receipt Template Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize serial numbering prefixes and legal disclaimer copy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Invoice Number Prefix"
                placeholder="INV-2026-"
                value={form.invoicePrefix || 'INV-2026-'}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
              />

              <Input
                label="Receipt Number Prefix"
                placeholder="REC-2026-"
                value={form.receiptPrefix || 'REC-2026-'}
                onChange={(e) => setForm({ ...form, receiptPrefix: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Authorized Signatory Title"
                  placeholder="Club Director / Accounts Head"
                  value={form.signatory || 'Club Accounts Lead'}
                  onChange={(e) => setForm({ ...form, signatory: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Terms & Conditions Printed on Invoice
                </label>
                <textarea
                  rows={3}
                  value={form.termsConditions || '1. Fees once paid are non-refundable and non-transferable.\n2. Access card must be presented for turnstile entry.\n3. Club rules and safety protocols apply at all times.'}
                  onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Reminders */}
        {activeTab === 'reminders' && (
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">Automated Payment Reminders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure automated notification triggers for upcoming and overdue fees.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded text-navy-800"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Upcoming Expiry Nudge (3 Days Prior)</span>
                  <span className="text-xs text-slate-500">Send an automated reminder to members 3 days prior to membership expiration.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded text-navy-800"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Due Date Reminder</span>
                  <span className="text-xs text-slate-500">Send an urgent payment request with instant UPI payment link on the due date.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded text-navy-800"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Overdue Escalation (5 Days Overdue)</span>
                  <span className="text-xs text-slate-500">Notify the member that biometric access will be paused if dues remain unpaid.</span>
                </div>
              </label>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Delivery Channels</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                {['WhatsApp Business API', 'SMS Gateway', 'Email Notification', 'Mobile App Push'].map((ch) => (
                  <label key={ch} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-navy-800" />
                    <span className="font-medium text-slate-800">{ch}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" type="submit" leftIcon={Save}>
            Save All Financial Settings
          </Button>
        </div>
      </form>
    </div>
  );
}