import { useMemo, useState } from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useGymManagement } from '../../../contexts/GymManagementContext';
import { formatDate, formatNumber } from '../../../utils/formatters';

export function BranchOverviewPage() {
  const { gyms, allBranches } = useGymManagement();

  const [search, setSearch] = useState('');
  const [gymFilter, setGymFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const pageSize = 6;

  const gymOptions = useMemo(
    () => [
      { value: 'all', label: 'All Gyms' },
      ...gyms.map((g) => ({ value: g.id, label: g.name })),
    ],
    [gyms]
  );

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(allBranches.map((b) => b.city).filter(Boolean))).sort();
    return [
      { value: 'all', label: 'All Cities' },
      ...cities.map((c) => ({ value: c, label: c })),
    ];
  }, [allBranches]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const hasActiveFilters =
    Boolean(search.trim()) ||
    gymFilter !== 'all' ||
    cityFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setGymFilter('all');
    setCityFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBranches.filter((branch) => {
      const matchesGym = gymFilter === 'all' || branch.gymId === gymFilter;
      const matchesCity = cityFilter === 'all' || branch.city === cityFilter;
      const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
      const matchesSearch =
        !q ||
        branch.name.toLowerCase().includes(q) ||
        branch.gymName.toLowerCase().includes(q) ||
        branch.manager.toLowerCase().includes(q) ||
        branch.city.toLowerCase().includes(q);
      return matchesGym && matchesCity && matchesStatus && matchesSearch;
    });
  }, [allBranches, search, gymFilter, cityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="font-mono text-[11px] text-slate-400">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => (
        <Link
          to={`/super-admin/gyms/${row.gymId}`}
          className="font-medium text-navy-800 hover:underline"
        >
          {row.gymName}
        </Link>
      ),
    },
    { key: 'manager', header: 'Branch Manager' },
    { key: 'city', header: 'City' },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 tabular-nums">
          {row.contact}
        </span>
      ),
    },
    {
      key: 'totalMembers',
      header: 'Total Members',
      align: 'right',
      numeric: true,
      render: (row) => formatNumber(row.totalMembers),
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
        <Button
          variant="outline"
          size="sm"
          leftIcon={Eye}
          onClick={() => setSelectedBranch(row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Overview"
        description="Monitor all physical club locations, branch managers, and member distribution across registered gyms."
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search branch, gym, manager, or city..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by gym"
          value={gymFilter}
          onChange={(e) => {
            setGymFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={gymOptions}
          containerClassName="sm:w-48"
        />
        <Select
          aria-label="Filter by city"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={cityOptions}
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={statusOptions}
          containerClassName="sm:w-36"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No branches match these filters"
        emptyDescription="Clear your filters or add a new gym branch to see locations here."
        emptyActionLabel="Reset filters"
        onEmptyAction={resetFilters}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Branch Details Modal */}
      <Modal
        isOpen={Boolean(selectedBranch)}
        onClose={() => setSelectedBranch(null)}
        title={selectedBranch?.name || 'Branch Details'}
        description={
          selectedBranch ? `${selectedBranch.id} · ${selectedBranch.gymName}` : ''
        }
        size="sm"
        footer={
          selectedBranch ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedBranch(null)}>
                Close
              </Button>
              <Link to={`/super-admin/gyms/${selectedBranch.gymId}`}>
                <Button variant="primary" size="sm" rightIcon={ExternalLink}>
                  Open Gym Profile
                </Button>
              </Link>
            </>
          ) : null
        }
      >
        {selectedBranch && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Parent Gym</dt>
              <dd className="font-semibold text-slate-900">{selectedBranch.gymName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Branch Manager</dt>
              <dd className="font-medium text-slate-900">{selectedBranch.manager}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">City</dt>
              <dd className="font-medium text-slate-900">{selectedBranch.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Contact</dt>
              <dd className="font-mono text-slate-900">{selectedBranch.contact}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Total Members</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatNumber(selectedBranch.totalMembers)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Opened On</dt>
              <dd className="tabular-nums text-slate-800">
                {formatDate(selectedBranch.openedAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={selectedBranch.status} />
              </dd>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <dt className="text-xs text-slate-500 mb-1">Full Address</dt>
              <dd className="text-slate-800">{selectedBranch.address}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}

export default BranchOverviewPage;
