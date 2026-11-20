import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import { useTenant } from '../../../contexts/TenantContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { exportCsvFile, formatCurrency } from '../../../utils/payrollCalculations';

export function PayrollDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { getPayrollById, markPayrollPaid } = useTrainerStaff();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const record = getPayrollById(id);

  if (!record) {
    return (
      <EmptyState
        title="Payroll slip not found"
        description="This salary record does not exist in the active gym tenant."
        actionLabel="Back to Payroll"
        onAction={() => navigate('/gym/payroll')}
      />
    );
  }

  const handleDownloadSlip = () => {
    exportCsvFile(
      `payslip-${record.id}.csv`,
      ['Slip ID', 'Gym', 'Employee', 'Role', 'Branch', 'Month', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Payment Date'],
      [[
        record.id,
        activeTenant.name,
        record.employeeName,
        record.role,
        record.branchName,
        record.salaryMonthLabel,
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
        title={`Salary Details · ${record.id}`}
        description={`${record.employeeName} — ${record.salaryMonthLabel} payslip breakdown`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/payroll')}>
              Back to Payroll
            </Button>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              Print Payslip
            </Button>
            <Button variant="outline" icon={Download} onClick={handleDownloadSlip}>
              Download Slip
            </Button>
            {record.paymentStatus !== 'paid' && (
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => setConfirmOpen(true)}
              >
                Mark as Paid (Demo)
              </Button>
            )}
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {activeTenant.name} · Payslip Statement
            </p>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{record.employeeName}</h2>
            <p className="text-sm text-slate-600">
              {record.employeeId} · {record.role} · {record.branchName}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusBadge status={record.paymentStatus} />
            <p className="text-xs text-slate-500">
              Cycle: {record.salaryMonthLabel} · Date: {record.paymentDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Earnings Breakdown
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Basic Salary ({record.salaryType})</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {formatCurrency(record.basicSalary)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Allowances &amp; Stipends</span>
              <span className="font-semibold tabular-nums text-emerald-700">
                +{formatCurrency(record.allowances)}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deductions &amp; Settlement
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tax &amp; Withholding Deductions</span>
              <span className="font-semibold tabular-nums text-red-700">
                -{formatCurrency(record.deductions)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Settlement Method</span>
              <span className="font-medium text-slate-800">{record.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">Net Salary Payable (Basic + Allowances - Deductions)</p>
            <p className="text-xs text-slate-500 mt-0.5">{record.notes || 'Standard monthly payroll disbursement.'}</p>
          </div>
          <p className="text-2xl font-bold text-navy-900 tabular-nums">
            {formatCurrency(record.netSalary)}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Demo payroll ledger slip — no real bank disbursement executed</span>
          <span>Powered by AGP Empire</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Demo Salary Settlement"
        description={`Mark ${record.employeeName}'s salary (${formatCurrency(record.netSalary)}) as Paid in the demo ledger?`}
        confirmLabel="Mark as Paid (Demo)"
        variant="primary"
        onConfirm={() => {
          markPayrollPaid(record.id);
          toast.success('Salary marked as paid (demo)');
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default PayrollDetailsPage;
