import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Receipt,
  Trash2,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useGymFinance();
  const { branches } = useTenant();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      const matchSearch =
        !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.id?.toLowerCase().includes(search.toLowerCase()) ||
        e.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || e.category === selectedCategory;
      const matchBranch = selectedBranch === 'all' || e.branchName === selectedBranch;
      const matchStatus = selectedStatus === 'all' || e.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchCategory && matchBranch && matchStatus;
    });
  }, [expenses, search, selectedCategory, selectedBranch, selectedStatus]);

  // Metrics
  const totalApproved = (expenses || [])
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const pendingApprovalsCount = (expenses || []).filter((e) => e.status === 'Pending').length;
  const pendingApprovalsSum = (expenses || [])
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Group by category to find top expense
  const categoryMap = (expenses || []).reduce((acc, e) => {
    if (e.status === 'Approved') {
      acc[e.category] = (acc[e.category] || 0) + (Number(e.amount) || 0);
    }
    return acc;
  }, {});

  const topCategory = Object.keys(categoryMap).reduce(
    (top, cat) => (!top || categoryMap[cat] > categoryMap[top] ? cat : top),
    ''
  );

  const exportCSV = () => {
    const headers = ['Expense ID', 'Title', 'Category', 'Branch', 'Amount (INR)', 'Mode', 'Vendor', 'Date', 'Status'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      `"${e.title}"`,
      `"${e.category}"`,
      `"${e.branchName}"`,
      e.amount,
      e.paymentMethod,
      `"${e.vendor || '—'}"`,
      e.date,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Track operational outflows, utility bills, facility overheads, and vendor disbursements."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" leftIcon={Download} onClick={exportCSV}>
              Export CSV
            </Button>
            <Link to="/gym/finance/expenses/approvals">
              <Button variant="outline" size="sm" leftIcon={CheckSquare}>
                Approvals Queue ({pendingApprovalsCount})
              </Button>
            </Link>
            <Link to="/gym/finance/expenses/create">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Record Expense
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Expenses</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalApproved.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">Total settled operational spend</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Audit</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">{pendingApprovalsCount} Bills</div>
          <p className="mt-1 text-xs text-slate-500">₹{pendingApprovalsSum.toLocaleString('en-IN')} awaiting review</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Category</span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-slate-900 truncate">{topCategory || 'Rent & Facilities'}</div>
          <p className="mt-1 text-xs text-slate-500">₹{(categoryMap[topCategory] || 0).toLocaleString('en-IN')} allocated</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Claims</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{expenses.length} Records</div>
          <p className="mt-1 text-xs text-slate-500">Logged vouchers & vendor bills</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses, vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
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
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...(branches || []).map((b) => ({ value: b.name, label: b.name })),
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending Approval' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <TrendingDown className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No expenses found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isApproved = exp.status === 'Approved';
                  const isPending = exp.status === 'Pending';
                  const isRejected = exp.status === 'Rejected';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-navy-800">
                        {exp.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        <div className="text-xs text-slate-400">
                          {exp.category} {exp.vendor ? `• ${exp.vendor}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {exp.branchName}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {exp.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {exp.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700'
                              : isRejected
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            leftIcon={Eye}
                            onClick={() => setViewingReceipt(exp)}
                          >
                            Bill
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteExpense(exp.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Bill Preview Modal */}
      {viewingReceipt && (
        <Modal
          isOpen={Boolean(viewingReceipt)}
          onClose={() => setViewingReceipt(null)}
          title={`Expense Voucher: ${viewingReceipt.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs uppercase font-medium text-slate-500 tracking-wider">Disbursement Amount</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                ₹{Number(viewingReceipt.amount).toLocaleString('en-IN')}
              </div>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  viewingReceipt.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : viewingReceipt.status === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {viewingReceipt.status}
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Expense Title:</span>
                <span className="font-semibold text-slate-900">{viewingReceipt.title}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Category:</span>
                <span className="font-medium text-slate-700">{viewingReceipt.category}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Branch:</span>
                <span className="text-slate-700">{viewingReceipt.branchName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Vendor / Payee:</span>
                <span className="text-slate-700">{viewingReceipt.vendor || 'Vendor Partner'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Date Logged:</span>
                <span className="text-slate-700">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="text-slate-700">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Submitted By:</span>
                <span className="text-slate-700">{viewingReceipt.submittedBy || 'Front Desk'}</span>
              </div>
              {viewingReceipt.approvalRemarks && (
                <div className="py-2">
                  <span className="text-slate-500 block mb-1">Audit Remarks:</span>
                  <p className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                    {viewingReceipt.approvalRemarks}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-navy-50 rounded-lg border border-navy-100 text-xs text-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-navy-700" />
                <span>Supporting Bill Receipt: <strong className="font-mono">bill_attachment.pdf</strong></span>
              </div>
              <Button variant="ghost" size="xs" onClick={() => alert('Simulated receipt download')}>
                View
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setViewingReceipt(null)}
            >
              Close Voucher
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}