import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Receipt,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { PAYMENT_STATUSES } from '../../../constants/gymFinanceData';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export function MemberFeesPage() {
  const navigate = useNavigate();
  const { branches } = useTenant();
  const { memberFees, recordFollowupReminder } = useGymFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortField, setSortField] = useState('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredFees = useMemo(() => {
    let result = memberFees.filter((fee) => {
      const matchSearch =
        fee.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.membershipPlan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || fee.paymentStatus === statusFilter;
      const matchBranch = branchFilter === 'all' || fee.branchName === branchFilter;
      return matchSearch && matchStatus && matchBranch;
    });

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });

    return result;
  }, [memberFees, searchQuery, statusFilter, branchFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredFees.length / pageSize) || 1;
  const paginatedFees = filteredFees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Paid in Full
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Partially Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
            Overdue
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            Pending Dues
          </span>
        );
      case 'Waived':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            Waived
          </span>
        );
      default:
        return null;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Member Fee Directory & Balances"
        description="Inspect member fee settlements, track pending installments, follow up on overdue amounts, and collect payments."
        actions={
          <Link to="/gym/finance/collect">
            <Button size="sm" leftIcon={Receipt}>
              Collect Fee
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search member by name, ID, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={PAYMENT_STATUSES}
          />

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:border-primary-500 focus:outline-hidden"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Showing {filteredFees.length} Fee Records
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total Pending:{' '}
              <strong className="text-amber-600 font-mono">
                ₹
                {filteredFees
                  .reduce((sum, f) => sum + (f.pendingAmount || 0), 0)
                  .toLocaleString('en-IN')}
              </strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => handleSort('finalAmount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Total Fee</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Paid</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => handleSort('pendingAmount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Pending</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No member fee records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedFees.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.memberPhoto}
                          alt={row.memberName}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{row.memberName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{row.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{row.membershipPlan}</p>
                      <p className="text-[10px] text-slate-400">{row.branchName}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      ₹{row.finalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      ₹{row.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {row.pendingAmount > 0 ? (
                        <span className="text-amber-600">
                          ₹{row.pendingAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{row.dueDate}</span>
                      {row.daysOverdue > 0 && (
                        <span className="block text-[10px] text-rose-600 font-bold">
                          {row.daysOverdue} days late
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(row.paymentStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {row.pendingAmount > 0 && (
                          <Link to={`/gym/finance/collect?memberId=${row.memberId}`}>
                            <Button size="sm" variant="outline" className="text-emerald-700">
                              Collect
                            </Button>
                          </Link>
                        )}
                        <Link to={`/gym/finance/fees/${row.memberId}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberFeesPage;
