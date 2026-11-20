import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

export default function FinancePayrollDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { payrollSalaries, processSalaryPayment } = useGymFinance();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payRef, setPayRef] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  const salary = (payrollSalaries || []).find((s) => s.id === id) || payrollSalaries?.[0];

  if (!salary) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-bold text-slate-900">Payroll Record Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">The requested salary disbursement slip does not exist.</p>
        <Link to="/gym/finance/payroll" className="mt-4 inline-block">
          <Button variant="outline">Back to Payroll</Button>
        </Link>
      </div>
    );
  }

  const isPaid = salary.paymentStatus === 'Paid';

  const handleDisburse = () => {
    processSalaryPayment(salary.id, payMethod, payRef);
    setPayModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Salary Statement: ${salary.name}`}
        description={`Detailed earnings statement, tax withholdings, and disbursement voucher for ${salary.month}.`}
        actions={
          <div className="flex gap-2">
            <Link to="/gym/finance/payroll">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Payroll
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Printer}
              onClick={() => window.print()}
            >
              Print Payslip
            </Button>
            {!isPaid && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setPayRef(`NEFT-${Date.now().toString().slice(-4)}`);
                  setPayModalOpen(true);
                }}
              >
                Disburse Now
              </Button>
            )}
          </div>
        }
      />

      {/* Main Statement Paper Layout */}
      <div className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-navy-800">My Gym Club Management</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Salary & Remuneration Voucher</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pay Period: {salary.month}</p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {salary.paymentStatus}
            </span>
            <div className="text-xs text-slate-400 font-mono mt-1">Slip Ref: SLIP-{salary.id.toUpperCase()}</div>
          </div>
        </div>

        {/* Staff & Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Employee Name</span>
            <span className="font-bold text-slate-900 text-sm">{salary.name}</span>
            <div className="text-slate-500 font-mono mt-0.5">ID: {salary.employeeId}</div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Designation & Role</span>
            <span className="font-semibold text-slate-800 text-sm">{salary.role}</span>
            <div className="text-slate-500 mt-0.5">{salary.type} Department</div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Branch Location</span>
            <span className="font-semibold text-slate-800 text-sm">{salary.branch}</span>
            <div className="text-slate-500 mt-0.5">Full-Time Staff</div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Payment Channel</span>
            <span className="font-semibold text-slate-800 text-sm">{salary.paymentMethod || 'Bank Transfer'}</span>
            <div className="text-slate-500 font-mono mt-0.5">{salary.reference || 'HDFC Bank •• 4910'}</div>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 font-semibold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200 flex justify-between">
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Basic Retainer Salary</span>
                <span className="font-semibold">₹{Number(salary.basicSalary).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>House Rent & Conveyance Allowance</span>
                <span className="font-semibold">₹{Number(salary.allowances ? salary.allowances * 0.6 : 3000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>PT Sessions Commission & Performance</span>
                <span className="font-semibold">+₹{Number(salary.allowances ? salary.allowances * 0.4 : 2000).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total Gross Earnings</span>
                <span>₹{(Number(salary.basicSalary) + Number(salary.allowances || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 font-semibold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200 flex justify-between">
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>TDS / Income Tax Withholding</span>
                <span className="font-semibold">₹{Number(salary.deductions ? salary.deductions * 0.7 : 1400).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Professional Tax (PT)</span>
                <span className="font-semibold">₹200</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Provident Fund / Advance Adjustment</span>
                <span className="font-semibold">₹{Number(salary.deductions ? salary.deductions * 0.3 - 200 : 900).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-red-600">
                <span>Total Deductions</span>
                <span>-₹{Number(salary.deductions || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Banner */}
        <div className="p-6 rounded-xl bg-navy-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-300">Net Take-Home Disbursed</span>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              ₹{Number(salary.netSalary).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Transfer Mode: {salary.paymentMethod || 'Direct Bank NEFT/RTGS'} {isPaid && `• Settled on ${salary.paidDate}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={Printer}
              onClick={() => window.print()}
            >
              Print Payslip
            </Button>
          </div>
        </div>

        {/* Authorization Footnote */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Official Document • System Authenticated By Gym Finance Dept</span>
          <span className="font-medium">Powered by AGP Empire</span>
        </div>
      </div>

      {/* Disburse Modal */}
      {payModalOpen && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Disburse Salary: ${salary.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs uppercase font-medium text-slate-500 tracking-wider">Amount to Transfer</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                ₹{Number(salary.netSalary).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                <option value="UPI">UPI Payout</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Cheque">Account Payee Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transaction / UTR Reference</label>
              <input
                type="text"
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setPayModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleDisburse}>
                Confirm Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}