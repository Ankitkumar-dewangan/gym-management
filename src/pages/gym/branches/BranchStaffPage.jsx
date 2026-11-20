import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { STAFF_CATEGORIES } from '../../../constants/branchManagementData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { cn } from '../../../utils/cn';
import { formatDate } from '../../../utils/formatters';

export function BranchStaffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBranchById, getBranchStaff, addBranchStaff, toggleStaffStatus } =
    useBranchManagement();

  const branch = getBranchById(id);
  const staffList = useMemo(
    () => (branch ? getBranchStaff(branch.id) : []),
    [branch, getBranchStaff]
  );

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const addStaffModal = useDisclosure(false);
  const [formState, setFormState] = useState({
    name: '',
    role: 'Trainer',
    contact: '',
    email: '',
    joiningDate: '2026-11-19',
  });

  const pageSize = 6;

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of STAFF_CATEGORIES) counts[cat] = 0;
    for (const member of staffList) {
      counts[member.role] = (counts[member.role] || 0) + 1;
    }
    return counts;
  }, [staffList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffList.filter((s) => {
      const roleOk = roleFilter === 'all' || s.role === roleFilter;
      const statusOk = statusFilter === 'all' || s.status === statusFilter;
      const queryOk =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q);
      return roleOk && statusOk && queryOk;
    });
  }, [staffList, search, roleFilter, statusFilter]);

  if (!branch) {
    return (
      <EmptyState
        icon={Building2}
        title="Branch not found"
        description="Unable to load staff overview for this branch."
        actionLabel="Back to Branches"
        onAction={() => navigate('/gym/branches')}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters =
    Boolean(search.trim()) || roleFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.contact.trim()) {
      toast.error('Please enter staff name and contact number');
      return;
    }
    addBranchStaff(branch.id, formState);
    toast.success(`Added ${formState.name.trim()} (${formState.role}) to ${branch.name}`);
    setFormState({
      name: '',
      role: 'Trainer',
      contact: '',
      email: '',
      joiningDate: '2026-11-19',
    });
    addStaffModal.close();
  };

  const columns = [
    {
      key: 'name',
      header: 'Staff Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={row.avatar} name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.name}</p>
            <p className="text-xs text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role' },
    {
      key: 'contact',
      header: 'Contact',
      numeric: true,
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.contact}</span>,
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      numeric: true,
      render: (row) => formatDate(row.joiningDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            toggleStaffStatus(row.id);
            toast.success(
              `${row.name} marked ${row.status === 'active' ? 'inactive' : 'active'}`
            );
          }}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Power className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{row.status === 'active' ? 'Deactivate' : 'Activate'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Branch Staff: ${branch.name}`}
        description={`${branch.code} · Staff roster across managers, trainers, dietitians, receptionists, and finance.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/gym/branches/${branch.id}`}>
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Branch
              </Button>
            </Link>
            <Button variant="emerald" size="sm" leftIcon={Plus} onClick={addStaffModal.open}>
              Add Staff Member
            </Button>
          </div>
        }
      />

      {/* 6 Staff Categories Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAFF_CATEGORIES.map((category) => {
          const isSelected = roleFilter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setRoleFilter(isSelected ? 'all' : category);
                setCurrentPage(1);
              }}
              className={cn(
                'rounded-xl border p-3.5 text-left transition-colors cursor-pointer',
                isSelected
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <p
                className={cn(
                  'text-xs font-medium truncate',
                  isSelected ? 'text-slate-200' : 'text-slate-500'
                )}
              >
                {category}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums font-display">
                {categoryCounts[category] || 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters & Table */}
      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search staff by name, role, or contact..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by staff role"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Roles' },
            ...STAFF_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          containerClassName="sm:w-44"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          containerClassName="sm:w-36"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No staff members match these filters"
        emptyDescription="Clear role filters or add a new team member to this branch."
        emptyActionLabel={hasActiveFilters ? 'Reset Filters' : 'Add Staff Member'}
        onEmptyAction={hasActiveFilters ? resetFilters : addStaffModal.open}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={addStaffModal.isOpen}
        onClose={addStaffModal.close}
        title={`Add Staff to ${branch.name}`}
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Jordan Blake"
            value={formState.name}
            onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role Category"
              value={formState.role}
              onChange={(e) => setFormState((p) => ({ ...p, role: e.target.value }))}
              options={STAFF_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Joining Date"
              type="date"
              value={formState.joiningDate}
              onChange={(e) => setFormState((p) => ({ ...p, joiningDate: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              required
              placeholder="+1 (206) 555-0190"
              value={formState.contact}
              onChange={(e) => setFormState((p) => ({ ...p, contact: e.target.value }))}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="staff@ironworksclub.com"
              value={formState.email}
              onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={addStaffModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Add Staff
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BranchStaffPage;
