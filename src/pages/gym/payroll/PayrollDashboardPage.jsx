import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  History,
  Plus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { exportCsvFile, formatCurrency } from '../../../utils/payrollCalculations';

export function PayrollDashboardPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { payroll, allTenantTrainers, allTenantStaff, markPayrollPaid } = useTrainerStaff();

  const [monthFilter, setMonthFilter] = useState('2026-11');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payTarget, setPayTarget] = useState(null);

  const monthRecords = useMemo(
    () => payroll.filter((p) => (monthFilter === 'all' ? true : p.salaryMonth === monthFilter)),
    [payroll, monthFilter]
  );

  const filteredRecords = useMemo(() => {
    return monthRecords.filter((p) => {
      const matchBranch = branchFilter === 'all' || p.branchId === branchFilter;
      const matchStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
      return matchBranch && matchStatus;
    });
  }, [monthRecords, branchFilter, statusFilter]);

  const totalMonthlyPayroll = monthRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalPaid = monthRecords
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const pendingSalary = monthRecords
    .filter((p) => p.paymentStatus !== 'paid')
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const upcomingCount = monthRecords.filter((p) => p.paymentStatus === 'pending').length;
  const employeeCount = allTenantTrainers.length + allTenantStaff.length;

  const handleDownloadPayslip = (record) => {
    exportCsvFile(
      `payslip-${record.id}-${record.salaryMonth}.csv`,
      ['Slip ID', 'Employee', 'Role', 'Branch', 'Month', 'Salary Type', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Payment Status', 'Payment Date'],
      [[
        record.id,
        record.employeeName,
        record.role,
        record.branchName,
        record.salaryMonthLabel,
        record.salaryType,
        record.basicSalary,
        record.allowances,
        record.deductions,
        record.netSalary,
        record.paymentStatus,
        record.paymentDate,
      ]]
    );
    toast.success(`Payslip ${record.id} downloaded`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary & Payroll"
        description="Manage trainer and staff monthly salaries, allowances, deductions, and demo payroll settlement."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              icon={History}
              onClick={() => navigate('/gym/payroll/history')}
            >
              Payment History
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/gym/payroll/generate')}
            >
              Generate Salary
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Demo Payroll Notice: Payroll generation and &ldquo;Mark as Paid&rdquo; actions update the local frontend ledger only—no real bank transfers or payment gateway disbursements occur.
      </div>

      {/* 5 Payroll KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Monthly Payroll"
          value={formatCurrency(totalMonthlyPayroll)}
          icon={DollarSign}
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalPaid)}
          trend="up"
          change="Settled"
          icon={CheckCircle2}
        />
        <StatCard
          label="Pending Salary"
          value={formatCurrency(pendingSalary)}
          icon={Clock}
        />
        <StatCard
          label="Total Employees"
          value={employeeCount}
          helperText="Trainers & staff"
          icon={Users}
        />
        <StatCard
          label="Upcoming Payments"
          value={upcomingCount}
          helperText="Due Nov 28"
          icon={CalendarCheck}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Payroll Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            options={[
              { value: '2026-11', label: 'November 2026' },
              { value: '2026-10', label: 'October 2026' },
              { value: 'all', label: 'All Months' },
            ]}
          />
          <Select
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
          <Select
            label="Payment Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            title="No payroll records for this filter"
            description="Generate a salary slip or select another payroll month."
            actionLabel="Generate Salary"
            onAction={() => navigate('/gym/payroll/generate')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Employee</th>
                  <th className="py-3 px-4">Role / Branch</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Basic Salary</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <Link
                        to={`/gym/payroll/${record.id}`}
                        className="font-semibold text-navy-800 hover:underline"
                      >
                        {record.employeeName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {record.id} · {record.salaryType}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800">{record.role}</p>
                      <p className="text-xs text-slate-500">{record.branchName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{record.salaryMonthLabel}</td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-800">
                      {formatCurrency(record.basicSalary)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-emerald-700">
                      +{formatCurrency(record.allowances)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-red-700">
                      -{formatCurrency(record.deductions)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-bold text-slate-900">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-600">{record.paymentDate}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={record.paymentStatus} />
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-xs font-medium">
                        <Link
                          to={`/gym/payroll/${record.id}`}
                          className="text-navy-800 hover:underline"
                        >
                          Details
                        </Link>
                        {record.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => setPayTarget(record)}
                            className="text-emerald-700 hover:underline cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadPayslip(record)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(payTarget)}
        title="Confirm Demo Salary Settlement"
        description={
          payTarget
            ? `Mark ${payTarget.employeeName}'s ${payTarget.salaryMonthLabel} salary (${formatCurrency(payTarget.netSalary)}) as Paid in the local demo payroll ledger?`
            : ''
        }
        confirmLabel="Mark as Paid (Demo)"
        variant="primary"
        onConfirm={() => {
          markPayrollPaid(payTarget.id);
          toast.success(`${payTarget.employeeName}'s payslip marked as paid (demo)`);
          setPayTarget(null);
        }}
        onClose={() => setPayTarget(null)}
      />
    </div>
  );
}

export default PayrollDashboardPage;
