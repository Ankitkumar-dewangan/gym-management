import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Eye,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function FinancePayrollPage() {
  const { payrollSalaries, processSalaryPayment } = useGymFinance();
  const { branches } = useTenant();

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('November 2026');

  // Modals
  const [payModalItem, setPayModalItem] = useState(null);
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [payslipModalItem, setPayslipModalItem] = useState(null);

  const filteredSalaries = useMemo(() => {
    return (payrollSalaries || []).filter((s) => {
      const matchSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
        s.role?.toLowerCase().includes(search.toLowerCase());

      const matchBranch = selectedBranch === 'all' || s.branch === selectedBranch;
      const matchType = selectedType === 'all' || s.type === selectedType;
      const matchStatus = selectedStatus === 'all' || s.paymentStatus.toLowerCase() === selectedStatus.toLowerCase();
      const matchMonth = !selectedMonth || s.month === selectedMonth;

      return matchSearch && matchBranch && matchType && matchStatus && matchMonth;
    });
  }, [payrollSalaries, search, selectedBranch, selectedType, selectedStatus, selectedMonth]);

  // Metrics
  const totalPayroll = filteredSalaries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const totalDisbursed = filteredSalaries
    .filter((s) => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const totalPending = filteredSalaries
    .filter((s) => s.paymentStatus === 'Pending')
    .reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0);
  const pendingCount = filteredSalaries.filter((s) => s.paymentStatus === 'Pending').length;

  const handlePayConfirm = () => {
    if (payModalItem) {
      processSalaryPayment(payModalItem.id, payMethod, payRef);
      setPayModalItem(null);
      setPayRef('');
    }
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Type', 'Branch', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Month', 'Status', 'Paid Date'];
    const rows = filteredSalaries.map((s) => [
      s.employeeId,
      `"${s.name}"`,
      `"${s.role}"`,
      s.type,
      `"${s.branch}"`,
      s.basicSalary,
      s.allowances,
      s.deductions,
      s.netSalary,
      s.month,
      s.paymentStatus,
      s.paidDate || '—',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer & Staff Salary Management"
        description="Oversee monthly payroll, trainer commissions, staff stipends, and salary disbursement slips."
        actions={
          <Button variant="outline" size="sm" leftIcon={Download} onClick={exportCSV}>
            Export Payroll Sheet
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Monthly Payroll</span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalPayroll.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">{filteredSalaries.length} staff & trainers ({selectedMonth})</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Disbursed (Settled)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalDisbursed.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Bank transfer settlements complete</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Payouts</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">{pendingCount} payouts ready to release</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pay Cycle</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-slate-900 truncate">{selectedMonth}</div>
          <p className="mt-1 text-xs text-slate-500">Regular 1st of month cycle</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, role, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>

          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={[
              { value: 'November 2026', label: 'November 2026' },
              { value: 'October 2026', label: 'October 2026' },
              { value: 'September 2026', label: 'September 2026' },
            ]}
          />

          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles / Types' },
              { value: 'Trainer', label: 'Trainers' },
              { value: 'Staff', label: 'Operations & Staff' },
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending Payout' },
            ]}
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Basic (₹)</th>
                <th className="px-4 py-3">Allowances (₹)</th>
                <th className="px-4 py-3">Deductions (₹)</th>
                <th className="px-4 py-3">Net Pay (₹)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No payroll entries found for this period.
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((sal) => {
                  const isPaid = sal.paymentStatus === 'Paid';

                  return (
                    <tr key={sal.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{sal.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="font-mono text-slate-400">{sal.employeeId}</span>
                          <span>•</span>
                          <span>{sal.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {sal.branch}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        ₹{Number(sal.basicSalary).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">
                        +₹{Number(sal.allowances || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        -₹{Number(sal.deductions || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{Number(sal.netSalary).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {sal.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/gym/finance/payroll/${sal.id}`}>
                            <Button variant="ghost" size="xs">
                              Details
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="xs"
                            leftIcon={FileText}
                            onClick={() => setPayslipModalItem(sal)}
                          >
                            Slip
                          </Button>

                          {!isPaid ? (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => {
                                setPayModalItem(sal);
                                setPayRef(`NEFT-${Date.now().toString().slice(-4)}`);
                              }}
                            >
                              Disburse
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono pr-1">
                              {sal.paidDate}
                            </span>
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

      {/* Disburse Modal */}
      {payModalItem && (
        <Modal
          isOpen={Boolean(payModalItem)}
          onClose={() => setPayModalItem(null)}
          title={`Disburse Salary: ${payModalItem.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs uppercase font-medium text-slate-500 tracking-wider">Net Payable Salary</span>
              <div className="text-3xl font-extrabold text-navy-900 mt-1">
                ₹{Number(payModalItem.netSalary).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {payModalItem.role} • {payModalItem.month}
              </p>
            </div>

            <Select
              label="Disbursement Mode"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              options={[
                { value: 'Bank Transfer', label: 'Direct Bank Transfer (NEFT/RTGS)' },
                { value: 'UPI', label: 'UPI Payout' },
                { value: 'Cheque', label: 'Account Payee Cheque' },
                { value: 'Cash', label: 'Cash in Hand' },
              ]}
            />

            <Input
              label="Bank Transaction / UTR Reference"
              required
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="e.g. UTR-982410948"
            />

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPayModalItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handlePayConfirm}
              >
                Confirm Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payslip Modal */}
      {payslipModalItem && (
        <Modal
          isOpen={Boolean(payslipModalItem)}
          onClose={() => setPayslipModalItem(null)}
          title="Official Employee Payslip"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-slate-800" id="payslip-print">
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-lg text-slate-900">MY GYM CLUB</h3>
              <p className="text-xs text-slate-500 font-medium">SALARY DISBURSEMENT SLIP</p>
              <p className="text-xs text-slate-400 mt-0.5">{payslipModalItem.month}</p>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Employee:</span>
                <span className="font-semibold text-slate-800">{payslipModalItem.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ID:</span>
                <span className="font-mono text-slate-800">{payslipModalItem.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Designation:</span>
                <span className="text-slate-800">{payslipModalItem.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Branch:</span>
                <span className="text-slate-800">{payslipModalItem.branch}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-slate-100 font-semibold text-slate-700 p-2.5 border-b border-slate-200">
                <div>Earnings</div>
                <div className="text-right">Deductions</div>
              </div>
              <div className="grid grid-cols-2 p-3 gap-3 divide-x divide-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Pay:</span>
                    <span className="font-medium">₹{Number(payslipModalItem.basicSalary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowances:</span>
                    <span className="font-medium text-emerald-600">+₹{Number(payslipModalItem.allowances).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pl-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">TDS / Advance:</span>
                    <span className="font-medium text-red-500">-₹{Number(payslipModalItem.deductions).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                <span>Net Pay Transfer:</span>
                <span className="text-navy-900 text-base">₹{Number(payslipModalItem.netSalary).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Settlement Status: <strong className="text-slate-700">{payslipModalItem.paymentStatus}</strong>
              {payslipModalItem.paidDate && ` on ${payslipModalItem.paidDate}`}
              <div className="mt-1">Powered by AGP Empire</div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                leftIcon={Printer}
                onClick={() => window.print()}
              >
                Print Slip
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setPayslipModalItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}