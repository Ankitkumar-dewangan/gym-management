import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { exportCsvFile, formatCurrency } from '../../../utils/payrollCalculations';

export function PayrollHistoryPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { payroll } = useTrainerStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return payroll.filter((p) => {
      const matchQ =
        !q ||
        p.employeeName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q);
      const matchBranch = branchFilter === 'all' || p.branchId === branchFilter;
      const matchStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
      return matchQ && matchBranch && matchStatus;
    });
  }, [payroll, searchQuery, branchFilter, statusFilter]);

  const handleExportAll = () => {
    exportCsvFile(
      'payroll-history.csv',
      ['Slip ID', 'Employee', 'Role', 'Branch', 'Month', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Method', 'Date', 'Status'],
      filtered.map((p) => [
        p.id,
        p.employeeName,
        p.role,
        p.branchName,
        p.salaryMonthLabel,
        p.basicSalary,
        p.allowances,
        p.deductions,
        p.netSalary,
        p.paymentMethod,
        p.paymentDate,
        p.paymentStatus,
      ])
    );
    toast.success('Payroll ledger exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Payment History"
        description="Complete historical ledger of trainer and staff salary disbursements across payroll cycles."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/payroll')}>
              Payroll Overview
            </Button>
            <Button variant="primary" icon={Download} onClick={handleExportAll}>
              Export Ledger CSV
            </Button>
          </div>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or slip ID..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
          </div>
          <Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No payroll history matches"
            description="Adjust search criteria or generate a new payroll slip."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Slip ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4 font-medium">
                      <Link to={`/gym/payroll/${p.id}`} className="text-navy-800 hover:underline">
                        {p.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900">{p.employeeName}</p>
                      <p className="text-xs text-slate-500">{p.role}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{p.branchName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{p.salaryMonthLabel}</td>
                    <td className="py-3.5 px-4 font-semibold tabular-nums text-slate-900">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-600">{p.paymentDate}</td>
                    <td className="py-3.5 pl-4">
                      <StatusBadge status={p.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PayrollHistoryPage;
