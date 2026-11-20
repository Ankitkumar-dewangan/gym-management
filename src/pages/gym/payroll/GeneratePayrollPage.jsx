import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { SALARY_TYPES } from '../../../constants/trainerStaffData';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { calculateNetSalary, formatCurrency } from '../../../utils/payrollCalculations';

export function GeneratePayrollPage() {
  const navigate = useNavigate();
  const { allTenantTrainers, allTenantStaff, generatePayrollRecord } = useTrainerStaff();

  const employees = useMemo(() => {
    const tList = allTenantTrainers.map((t) => ({
      id: t.id,
      name: t.fullName,
      employeeType: 'Trainer',
      role: t.specializations?.[0] || 'Trainer',
      branchId: t.branchId,
      branchName: t.branchName,
      salaryType: t.salaryType || 'Monthly',
      basicSalary: t.basicSalary || 0,
      allowances: t.allowances || 0,
      deductions: t.deductions || 0,
      perSessionRate: t.perSessionRate || 65,
      sessionsCompleted: t.completedSessionsMonth || 0,
      commissionPercent: t.commissionPercent || 18,
      sessionRevenue: t.sessionRevenueMonth || 0,
    }));
    const sList = allTenantStaff.map((s) => ({
      id: s.id,
      name: s.fullName,
      employeeType: 'Staff',
      role: s.role,
      branchId: s.branchId,
      branchName: s.branchName,
      salaryType: s.salaryType || 'Monthly',
      basicSalary: s.basicSalary || 0,
      allowances: s.allowances || 0,
      deductions: s.deductions || 0,
      perSessionRate: 0,
      sessionsCompleted: 0,
      commissionPercent: 0,
      sessionRevenue: 0,
    }));
    return [...tList, ...sList];
  }, [allTenantTrainers, allTenantStaff]);

  const initialEmp = employees[0];
  const [selectedId, setSelectedId] = useState(initialEmp?.id || '');
  const [salaryMonth, setSalaryMonth] = useState('2026-11');
  const [salaryType, setSalaryType] = useState(initialEmp?.salaryType || 'Monthly');
  const [basicSalary, setBasicSalary] = useState(initialEmp?.basicSalary ?? 5200);
  const [allowances, setAllowances] = useState(initialEmp?.allowances ?? 650);
  const [deductions, setDeductions] = useState(initialEmp?.deductions ?? 280);
  const [perSessionRate, setPerSessionRate] = useState(initialEmp?.perSessionRate ?? 65);
  const [sessionsCompleted, setSessionsCompleted] = useState(initialEmp?.sessionsCompleted ?? 0);
  const [commissionPercent, setCommissionPercent] = useState(initialEmp?.commissionPercent ?? 0);
  const [sessionRevenue, setSessionRevenue] = useState(initialEmp?.sessionRevenue ?? 0);
  const [paymentDate, setPaymentDate] = useState('2026-11-28');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  const selectedEmployee = employees.find((e) => e.id === selectedId) || initialEmp;

  const handleEmployeeChange = (empId) => {
    setSelectedId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setSalaryType(emp.salaryType);
      setBasicSalary(emp.basicSalary);
      setAllowances(emp.allowances);
      setDeductions(emp.deductions);
      setPerSessionRate(emp.perSessionRate);
      setSessionsCompleted(emp.sessionsCompleted);
      setCommissionPercent(emp.commissionPercent);
      setSessionRevenue(emp.sessionRevenue);
    }
  };

  const calculation = calculateNetSalary({
    salaryType,
    basicSalary,
    allowances,
    deductions,
    perSessionRate,
    sessionsCompleted,
    commissionPercent,
    sessionRevenue,
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    const monthLabel =
      salaryMonth === '2026-11'
        ? 'November 2026'
        : salaryMonth === '2026-10'
          ? 'October 2026'
          : salaryMonth;

    const record = generatePayrollRecord({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeType: selectedEmployee.employeeType,
      role: selectedEmployee.role,
      branchId: selectedEmployee.branchId,
      branchName: selectedEmployee.branchName,
      salaryMonth,
      salaryMonthLabel: monthLabel,
      salaryType,
      basicSalary,
      allowances,
      deductions,
      perSessionRate,
      sessionsCompleted,
      commissionPercent,
      sessionRevenue,
      paymentDate,
      paymentStatus,
      notes,
    });

    toast.success(`Salary slip ${record.id} generated for ${selectedEmployee.name}`);
    navigate(`/gym/payroll/${record.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Salary Slip"
        description="Compute Monthly, Per Session, or Commission-Based pay using Net Salary = Basic Salary + Allowances - Deductions."
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/payroll')}>
            Back to Payroll
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Employee *"
              value={selectedId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.name} (${emp.employeeType} · ${emp.role})`,
              }))}
            />
            <Select
              label="Salary Month *"
              value={salaryMonth}
              onChange={(e) => setSalaryMonth(e.target.value)}
              options={[
                { value: '2026-11', label: 'November 2026' },
                { value: '2026-10', label: 'October 2026' },
                { value: '2026-12', label: 'December 2026' },
              ]}
            />
            <Select
              label="Salary Model"
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              options={SALARY_TYPES.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="Initial Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid (Demo)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Basic Salary (₹)"
              type="number"
              min="0"
              step="10"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
            />
            <Input
              label="Allowances (₹)"
              type="number"
              min="0"
              step="10"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
            />
            <Input
              label="Deductions (₹)"
              type="number"
              min="0"
              step="10"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
            />
          </div>

          {salaryType === 'Per Session' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Input
                label="Per Session Rate (₹)"
                type="number"
                min="0"
                value={perSessionRate}
                onChange={(e) => setPerSessionRate(e.target.value)}
              />
              <Input
                label="Sessions Completed"
                type="number"
                min="0"
                value={sessionsCompleted}
                onChange={(e) => setSessionsCompleted(e.target.value)}
              />
            </div>
          )}

          {salaryType === 'Commission-Based' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Input
                label="Session / Sales Revenue (₹)"
                type="number"
                min="0"
                value={sessionRevenue}
                onChange={(e) => setSessionRevenue(e.target.value)}
              />
              <Input
                label="Commission Rate (%)"
                type="number"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <Input
              label="Payroll Notes"
              placeholder="Bonus or deduction explanation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/gym/payroll')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Calculator}>
              Generate Payslip
            </Button>
          </div>
        </form>

        {/* Live Calculation Breakdown */}
        <aside className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-slate-900">Live Payroll Calculation</h2>
          {selectedEmployee && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="font-semibold text-slate-900">{selectedEmployee.name}</p>
              <p className="text-slate-500 mt-0.5">
                {selectedEmployee.role} · {selectedEmployee.branchName}
              </p>
            </div>
          )}
          <div className="space-y-3 text-sm pt-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Computed Base Pay</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {formatCurrency(calculation.basicSalary)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">+ Allowances</span>
              <span className="font-semibold tabular-nums text-emerald-700">
                +{formatCurrency(calculation.allowances)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">- Deductions</span>
              <span className="font-semibold tabular-nums text-red-700">
                -{formatCurrency(calculation.deductions)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Net Salary</span>
              <span className="text-xl font-bold tabular-nums text-navy-900">
                {formatCurrency(calculation.netSalary)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default GeneratePayrollPage;
