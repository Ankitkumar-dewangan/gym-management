import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import GymStatsCards from '../../../components/super-admin/gyms/GymStatsCards';
import GymTable from '../../../components/super-admin/gyms/GymTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useGymManagement } from '../../../contexts/GymManagementContext';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
];

const PLAN_FILTER_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Pro', label: 'Pro' },
  { value: 'Enterprise', label: 'Enterprise' },
];

export function AllGymsPage() {
  const { gyms, updateGymStatus, deleteGym } = useGymManagement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState('registeredAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [gymToToggle, setGymToToggle] = useState(null);
  const [gymToDelete, setGymToDelete] = useState(null);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== 'all' ||
    planFilter !== 'all' ||
    Boolean(dateFilter);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPlanFilter('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = gyms.filter((gym) => {
      const matchesStatus =
        statusFilter === 'all' || gym.status === statusFilter;
      const matchesPlan =
        planFilter === 'all' || gym.subscription?.plan === planFilter;
      const matchesDate = !dateFilter || gym.registeredAt >= dateFilter;
      const matchesSearch =
        !q ||
        gym.name.toLowerCase().includes(q) ||
        gym.owner?.fullName?.toLowerCase().includes(q) ||
        gym.businessEmail?.toLowerCase().includes(q) ||
        gym.id.toLowerCase().includes(q);

      return matchesStatus && matchesPlan && matchesDate && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let valA;
      let valB;

      if (sortField === 'branchesCount') {
        valA = a.branches?.length || 0;
        valB = b.branches?.length || 0;
      } else if (sortField === 'totalMembers') {
        valA = a.totalMembers || 0;
        valB = b.totalMembers || 0;
      } else {
        valA = String(a[sortField] || '').toLowerCase();
        valB = String(b[sortField] || '').toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [gyms, search, statusFilter, planFilter, dateFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedGyms = filteredAndSorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleExportCsv = () => {
    const headers = [
      'Gym ID',
      'Gym Name',
      'Owner Name',
      'Email',
      'Contact',
      'Branches',
      'Members',
      'Plan',
      'Registration Date',
      'Status',
    ];
    const rows = filteredAndSorted.map((g) => [
      g.id,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${(g.owner?.fullName || '').replace(/"/g, '""')}"`,
      g.businessEmail,
      `"${g.contactNumber}"`,
      g.branches?.length || 0,
      g.totalMembers || 0,
      g.subscription?.plan || '',
      g.registeredAt,
      g.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'GymPilot_gyms_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredAndSorted.length} gym records`);
  };

  const confirmStatusToggle = () => {
    if (!gymToToggle) return;
    const isActivating =
      gymToToggle.status === 'suspended' || gymToToggle.status === 'inactive';
    const nextStatus = isActivating ? 'active' : 'suspended';
    updateGymStatus(
      gymToToggle.id,
      nextStatus,
      `Gym ${isActivating ? 'activated' : 'suspended'} by Super Admin`
    );
    toast.success(
      `${gymToToggle.name} ${isActivating ? 'activated' : 'suspended'}`
    );
    setGymToToggle(null);
  };

  const confirmDelete = () => {
    if (!gymToDelete) return;
    deleteGym(gymToDelete.id);
    toast.success(`Deleted ${gymToDelete.name}`);
    setGymToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Management"
        description="Manage all registered gyms on your platform."
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={handleExportCsv}>
              Export
            </Button>
            <Link to="/super-admin/gyms/add">
              <Button variant="emerald" leftIcon={Plus}>
                Add New Gym
              </Button>
            </Link>
          </>
        }
      />

      <GymStatsCards gyms={gyms} />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by gym name or owner..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={STATUS_FILTER_OPTIONS}
          containerClassName="sm:w-40"
        />
        <Select
          aria-label="Filter by subscription plan"
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={PLAN_FILTER_OPTIONS}
          containerClassName="sm:w-36"
        />
        <Input
          type="date"
          aria-label="Filter registered from date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          containerClassName="sm:w-40"
        />
      </FilterToolbar>

      <GymTable
        gyms={paginatedGyms}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={safePage}
        pageSize={pageSize}
        totalItems={filteredAndSorted.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onToggleStatus={setGymToToggle}
        onDelete={setGymToDelete}
        onResetFilters={resetFilters}
      />

      {/* Activate / Suspend Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(gymToToggle)}
        onClose={() => setGymToToggle(null)}
        onConfirm={confirmStatusToggle}
        title={
          gymToToggle?.status === 'suspended' || gymToToggle?.status === 'inactive'
            ? `Activate ${gymToToggle?.name}?`
            : `Suspend ${gymToToggle?.name}?`
        }
        description={
          gymToToggle?.status === 'suspended' || gymToToggle?.status === 'inactive'
            ? 'Re-activating this gym restores owner dashboard access and branch operations.'
            : 'Suspending this gym temporarily pauses owner and branch portal access.'
        }
        confirmLabel={
          gymToToggle?.status === 'suspended' || gymToToggle?.status === 'inactive'
            ? 'Activate Gym'
            : 'Suspend Gym'
        }
        variant={
          gymToToggle?.status === 'suspended' || gymToToggle?.status === 'inactive'
            ? 'emerald'
            : 'danger'
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(gymToDelete)}
        onClose={() => setGymToDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete ${gymToDelete?.name}?`}
        description="This permanently removes the gym record, branches, and preview history from local state."
        confirmLabel="Delete Gym"
        variant="danger"
      />
    </div>
  );
}

export default AllGymsPage;
