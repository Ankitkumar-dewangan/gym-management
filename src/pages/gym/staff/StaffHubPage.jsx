import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ClipboardCheck,
  DollarSign,
  Edit3,
  Eye,
  LayoutGrid,
  List,
  Plus,
  Search,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';
import Select from '../../../components/ui/Select';
import { STAFF_CATEGORIES } from '../../../constants/trainerStaffData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { calculateNetSalary, formatCurrency } from '../../../utils/payrollCalculations';

export function StaffHubPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { staff, staffAttendance, toggleStaffStatus } = useTrainerStaff();

  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const pageSize = 8;

  // Staff Dashboard KPIs
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === 'active').length;
  const inactiveStaff = staff.filter((s) => s.status !== 'active').length;

  const todayStaffAttendance = staffAttendance.filter(
    (a) => a.date === '2026-11-19' && a.personType === 'staff'
  );
  const presentToday = todayStaffAttendance.filter(
    (a) => a.status === 'present' || a.status === 'late' || a.status === 'half_day'
  ).length;
  const absentToday = todayStaffAttendance.filter((a) => a.status === 'absent').length;

  const monthlySalaryExpense = staff
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + calculateNetSalary(s).netSalary, 0);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staff
      .filter((s) => {
        const matchSearch =
          !q ||
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q);
        const matchRole = roleFilter === 'all' || s.role === roleFilter;
        const matchBranch = branchFilter === 'all' || s.branchId === branchFilter;
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchRole && matchBranch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'salary') {
          return calculateNetSalary(b).netSalary - calculateNetSalary(a).netSalary;
        }
        if (sortBy === 'joining') {
          return b.joiningDate.localeCompare(a.joiningDate);
        }
        return a.fullName.localeCompare(b.fullName);
      });
  }, [staff, searchQuery, roleFilter, branchFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStaff = filteredStaff.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage branch managers, front desk, finance, sales, housekeeping, and facility security staff."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              icon={ClipboardCheck}
              onClick={() => navigate('/gym/staff/attendance')}
            >
              Staff Attendance
            </Button>
            <Button
              variant="outline"
              icon={DollarSign}
              onClick={() => navigate('/gym/payroll')}
            >
              Salary &amp; Payroll
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => navigate('/gym/staff/add')}>
              Add Staff
            </Button>
          </div>
        }
      />

      {/* 6 Staff KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Staff" value={totalStaff} icon={Users} />
        <StatCard label="Active Staff" value={activeStaff} icon={UserCheck} />
        <StatCard label="Inactive Staff" value={inactiveStaff} icon={UserMinus} />
        <StatCard label="Present Today" value={presentToday} icon={ClipboardCheck} />
        <StatCard label="Absent Today" value={absentToday} icon={Briefcase} />
        <StatCard
          label="Monthly Staff Payroll"
          value={formatCurrency(monthlySalaryExpense)}
          icon={DollarSign}
        />
      </div>

      {/* Staff Directory */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">All Staff Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by operational role, branch location, and active roster status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                viewMode === 'grid'
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                viewMode === 'table'
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search staff name, ID, role or phone..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Roles' },
              ...STAFF_CATEGORIES.map((r) => ({ value: r, label: r })),
            ]}
          />

          <Select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Branches' },
              ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'name', label: 'Name A–Z' },
                { value: 'salary', label: 'Net Salary' },
                { value: 'joining', label: 'Newest' },
              ]}
            />
          </div>
        </div>

        {paginatedStaff.length === 0 ? (
          <EmptyState
            title="No staff members found"
            description="Adjust filters or register a new team member."
            actionLabel="Add Staff"
            onAction={() => navigate('/gym/staff/add')}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedStaff.map((person) => {
              const netPay = calculateNetSalary(person).netSalary;
              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar src={person.avatar} name={person.fullName} size="lg" />
                        <div className="min-w-0">
                          <Link
                            to={`/gym/staff/${person.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-navy-800 truncate block"
                          >
                            {person.fullName}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">
                            {person.role} · {person.id}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={person.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs">
                      <div>
                        <span className="text-slate-500">Branch</span>
                        <p className="font-medium text-slate-900 truncate mt-0.5">
                          {person.branchName}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Net Salary</span>
                        <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                          {formatCurrency(netPay)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/gym/staff/${person.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Profile
                      </Link>
                      <Link
                        to={`/gym/staff/${person.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(person)}
                      className="font-medium text-slate-500 hover:text-red-700 cursor-pointer"
                    >
                      {person.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-3 pr-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Monthly Net</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStaff.map((person) => {
                  const netPay = calculateNetSalary(person).netSalary;
                  return (
                    <tr key={person.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={person.avatar} name={person.fullName} size="md" />
                          <div>
                            <Link
                              to={`/gym/staff/${person.id}`}
                              className="font-semibold text-slate-900 hover:text-navy-800"
                            >
                              {person.fullName}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {person.id} · {person.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{person.role}</td>
                      <td className="py-3.5 px-4 text-slate-700">{person.branchName}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                        {person.shiftTiming}
                      </td>
                      <td className="py-3.5 px-4 font-semibold tabular-nums text-slate-900">
                        {formatCurrency(netPay)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={person.status} />
                      </td>
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 text-xs font-medium">
                          <Link
                            to={`/gym/staff/${person.id}`}
                            className="text-navy-800 hover:underline"
                          >
                            View
                          </Link>
                          <Link
                            to={`/gym/staff/${person.id}/edit`}
                            className="text-slate-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmTarget(person)}
                            className="text-slate-500 hover:text-red-700 cursor-pointer"
                          >
                            {person.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredStaff.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </section>

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        title={confirmTarget?.status === 'active' ? 'Deactivate Staff Member?' : 'Activate Staff Member?'}
        description={
          confirmTarget
            ? `Toggle active roster status for ${confirmTarget.fullName}?`
            : ''
        }
        confirmLabel={confirmTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.status === 'active' ? 'danger' : 'primary'}
        onConfirm={() => {
          toggleStaffStatus(confirmTarget.id);
          toast.success(`${confirmTarget.fullName} status updated`);
          setConfirmTarget(null);
        }}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}

export default StaffHubPage;
