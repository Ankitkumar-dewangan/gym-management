import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Download,
  Edit,
  Eye,
  GitCompare,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Power,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import { BranchDashboardComparisonChart } from '../../../components/gym/branches/BranchCharts';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, getInitials } from '../../../utils/formatters';

const SORT_OPTIONS = [
  { value: 'revenue_desc', label: 'Sort: Revenue (High → Low)' },
  { value: 'members_desc', label: 'Sort: Members (High → Low)' },
  { value: 'attendance_desc', label: 'Sort: Attendance (High → Low)' },
  { value: 'name_asc', label: 'Sort: Name (A → Z)' },
];

export function BranchesHubPage() {
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const {
    tenantBranches,
    tenantManagers,
    getManagerForBranch,
    toggleBranchStatus,
    deleteBranch,
  } = useBranchManagement();

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const pageSize = 6;

  const kpiStats = useMemo(() => {
    const total = tenantBranches.length;
    const active = tenantBranches.filter((b) => b.status === 'active').length;
    const inactive = tenantBranches.filter((b) => b.status !== 'active').length;
    const totalMembers = tenantBranches.reduce((sum, b) => sum + (b.totalMembers || 0), 0);
    const totalManagers = new Set(
      tenantBranches.map((b) => b.managerId).filter(Boolean)
    ).size;
    const combinedRevenue = tenantBranches.reduce((sum, b) => sum + (b.monthlyRevenue || 0), 0);

    return [
      {
        label: 'Total Branches',
        value: String(total),
        change: `${active} live`,
        trend: 'up',
        previousLabel: activeTenant.name,
        icon: 'Building2',
      },
      {
        label: 'Active Branches',
        value: String(active),
        change: total ? `${Math.round((active / total) * 100)}%` : '0%',
        trend: 'up',
        previousLabel: 'operational locations',
        icon: 'CheckCircle2',
      },
      {
        label: 'Inactive Branches',
        value: String(inactive),
        change: inactive > 0 ? 'Paused / Draft' : 'All clear',
        trend: inactive > 0 ? 'neutral' : 'up',
        previousLabel: 'off-schedule or setup',
        icon: 'XCircle',
      },
      {
        label: 'Total Members',
        value: totalMembers.toLocaleString(),
        change: '+6.4%',
        trend: 'up',
        previousLabel: 'across all branches',
        icon: 'Users',
      },
      {
        label: 'Total Branch Managers',
        value: String(Math.max(totalManagers, tenantManagers.length)),
        change: '100% assigned',
        trend: 'up',
        previousLabel: 'primary leads',
        icon: 'UserCheck',
      },
      {
        label: 'Combined Monthly Revenue',
        value: formatCurrency(combinedRevenue),
        change: '+8.9%',
        trend: 'up',
        previousLabel: 'consolidated gross',
        icon: 'DollarSign',
      },
    ];
  }, [tenantBranches, tenantManagers.length, activeTenant.name]);

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(tenantBranches.map((b) => b.city).filter(Boolean))).sort();
    return [{ value: 'all', label: 'All Cities' }, ...cities.map((c) => ({ value: c, label: c }))];
  }, [tenantBranches]);

  const managerOptions = useMemo(
    () => [
      { value: 'all', label: 'All Managers' },
      ...tenantManagers.map((m) => ({ value: m.id, label: m.name })),
    ],
    [tenantManagers]
  );

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tenantBranches.filter((branch) => {
      const mgr = getManagerForBranch(branch);
      const cityOk = cityFilter === 'all' || branch.city === cityFilter;
      const statusOk = statusFilter === 'all' || branch.status === statusFilter;
      const mgrOk = managerFilter === 'all' || branch.managerId === managerFilter;
      const queryOk =
        !q ||
        branch.name.toLowerCase().includes(q) ||
        branch.code.toLowerCase().includes(q) ||
        branch.city.toLowerCase().includes(q) ||
        (mgr?.name || '').toLowerCase().includes(q);
      return cityOk && statusOk && mgrOk && queryOk;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'revenue_desc') return (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0);
      if (sortBy === 'members_desc') return (b.totalMembers || 0) - (a.totalMembers || 0);
      if (sortBy === 'attendance_desc') return (b.todaysAttendance || 0) - (a.todaysAttendance || 0);
      return a.name.localeCompare(b.name);
    });
  }, [tenantBranches, search, cityFilter, statusFilter, managerFilter, sortBy, getManagerForBranch]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    cityFilter !== 'all' ||
    statusFilter !== 'all' ||
    managerFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setCityFilter('all');
    setStatusFilter('all');
    setManagerFilter('all');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBranches = filteredBranches.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleExportCsv = () => {
    const headers = [
      'Branch Name',
      'Branch Code',
      'City',
      'Manager',
      'Contact',
      'Members',
      'Monthly Revenue',
      'Attendance',
      'Expenses',
      'Status',
    ];
    const rows = filteredBranches.map((b) => {
      const mgr = getManagerForBranch(b);
      return [
        `"${b.name}"`,
        `"${b.code}"`,
        `"${b.city}"`,
        `"${mgr?.name || b.contactPerson}"`,
        `"${b.contactNumber}"`,
        b.totalMembers,
        b.monthlyRevenue,
        b.todaysAttendance,
        b.monthlyExpenses,
        b.status,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-branches.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported branch directory CSV');
  };

  const handleConfirmDelete = () => {
    if (!branchToDelete) return;
    deleteBranch(branchToDelete.id);
    toast.success(`Deleted branch ${branchToDelete.name}`);
    setBranchToDelete(null);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.coverImage ? (
            <img
              src={row.coverImage}
              alt={row.name}
              referrerPolicy="no-referrer"
              className="h-9 w-12 rounded-md object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <span className="inline-flex h-9 w-12 items-center justify-center rounded-md bg-navy-900 text-xs font-semibold text-white shrink-0">
              {getInitials(row.name)}
            </span>
          )}
          <div className="min-w-0">
            <Link
              to={`/gym/branches/${row.id}`}
              className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
            >
              {row.name}
            </Link>
            <p className="text-xs text-slate-500 truncate">{row.branchType}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Branch Code',
      numeric: true,
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.code}</span>,
    },
    { key: 'city', header: 'City' },
    {
      key: 'manager',
      header: 'Manager',
      render: (row) => {
        const mgr = getManagerForBranch(row);
        return (
          <div className="flex items-center gap-2">
            <UserAvatar src={mgr?.avatar} name={mgr?.name || row.contactPerson} size="sm" />
            <span className="text-sm text-slate-700">{mgr?.name || row.contactPerson}</span>
          </div>
        );
      },
    },
    {
      key: 'contactNumber',
      header: 'Contact',
      numeric: true,
      render: (row) => <span className="text-xs font-mono text-slate-600">{row.contactNumber}</span>,
    },
    {
      key: 'totalMembers',
      header: 'Members',
      align: 'right',
      numeric: true,
      render: (row) => (row.totalMembers || 0).toLocaleString(),
    },
    {
      key: 'monthlyRevenue',
      header: 'Monthly Revenue',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.monthlyRevenue || 0),
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
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/gym/branches/${row.id}`}
            title="View Details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy-900"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link
            to={`/gym/branches/${row.id}/edit`}
            title="Edit Branch"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy-900"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => {
              toggleBranchStatus(row.id);
              toast.success(
                `${row.name} ${row.status === 'active' ? 'deactivated' : 'activated'}`
              );
            }}
            title={row.status === 'active' ? 'Deactivate Branch' : 'Activate Branch'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 cursor-pointer"
          >
            <Power className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setBranchToDelete(row)}
            title="Delete Branch"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Management"
        description="Manage all gym locations, teams and branch performance."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/branches/performance">
              <Button variant="outline" size="sm" leftIcon={BarChart3}>
                Performance Analytics
              </Button>
            </Link>
            <Link to="/gym/branches/comparison">
              <Button variant="outline" size="sm" leftIcon={GitCompare}>
                Compare Branches
              </Button>
            </Link>
            <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Link to="/gym/branches/add">
              <Button variant="emerald" size="sm" leftIcon={Plus}>
                Add New Branch
              </Button>
            </Link>
          </div>
        }
      />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiStats.map((kpi) => (
          <AdminStatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            previousLabel={kpi.previousLabel}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Branch Performance Comparison Charts */}
      {tenantBranches.length > 0 && (
        <BranchDashboardComparisonChart branches={tenantBranches} />
      )}

      {/* Branch-wise Quick Breakdown Strip */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Branches ({filteredBranches.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between architectural grid cards and high-density tabular view
            </p>
          </div>

          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 self-start">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Table View
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <FilterToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search branch name, code, city, or manager..."
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        >
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
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'draft', label: 'Draft' },
            ]}
            containerClassName="sm:w-36"
          />
          <Select
            aria-label="Filter by manager"
            value={managerFilter}
            onChange={(e) => {
              setManagerFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={managerOptions}
            containerClassName="sm:w-44"
          />
          <Select
            aria-label="Sort branches"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
            containerClassName="sm:w-52"
          />
        </FilterToolbar>

        {/* Grid View vs Table View */}
        {paginatedBranches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No branches match your filters"
            description="Adjust your search criteria or add a new branch location for this gym."
            actionLabel={hasActiveFilters ? 'Reset Filters' : 'Add New Branch'}
            onAction={hasActiveFilters ? resetFilters : () => navigate('/gym/branches/add')}
          />
        ) : viewMode === 'grid' ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedBranches.map((branch) => {
                const mgr = getManagerForBranch(branch);
                const isActive = branch.status === 'active';

                return (
                  <article
                    key={branch.id}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
                  >
                    {/* Cover Photo */}
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                      {branch.coverImage ? (
                        <img
                          src={branch.coverImage}
                          alt={branch.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Building2 className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={branch.status} />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                        {branch.logo ? (
                          <img
                            src={branch.logo}
                            alt={`${branch.name} logo`}
                            className="h-10 w-10 rounded-lg object-cover border border-white/40 bg-white shrink-0"
                          />
                        ) : (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white border border-white/25 shrink-0">
                            {getInitials(branch.name)}
                          </span>
                        )}
                        <div className="min-w-0 text-white">
                          <h3 className="text-base font-bold leading-snug truncate">
                            {branch.name}
                          </h3>
                          <p className="text-xs text-slate-200 font-mono">
                            {branch.code} · {branch.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar
                              src={mgr?.avatar}
                              name={mgr?.name || branch.contactPerson}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {mgr?.name || branch.contactPerson}
                              </p>
                              <p className="text-[11px] text-slate-500">Branch Manager</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-slate-500 shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                            {branch.city}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                          <div>
                            <p className="text-[11px] text-slate-500">Members</p>
                            <p className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums font-display">
                              {(branch.totalMembers || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500">Revenue</p>
                            <p className="mt-0.5 text-sm font-bold text-emerald-700 tabular-nums font-display">
                              {formatCurrency(branch.monthlyRevenue || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500">Attendance</p>
                            <p className="mt-0.5 text-sm font-bold text-navy-900 tabular-nums font-display">
                              {branch.todaysAttendance || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <Link to={`/gym/branches/${branch.id}`} className="flex-1">
                          <Button variant="primary" size="sm" leftIcon={Eye} className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Link to={`/gym/branches/${branch.id}/edit`}>
                          <Button variant="outline" size="sm" leftIcon={Edit}>
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/gym/branches/${branch.id}/staff`} title="Manage Staff">
                          <Button variant="outline" size="sm" leftIcon={Users}>
                            Staff
                          </Button>
                        </Link>
                        <Link to={`/gym/branches/${branch.id}/manager`} title="Manage Manager">
                          <Button variant="ghost" size="sm" leftIcon={UserCog}>
                            Manager
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            toggleBranchStatus(branch.id);
                            toast.success(
                              `${branch.name} ${isActive ? 'deactivated' : 'activated'}`
                            );
                          }}
                          className={cn(
                            'inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium cursor-pointer transition-colors',
                            isActive
                              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          )}
                        >
                          <Power className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredBranches.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={paginatedBranches}
            pagination={{
              currentPage: safePage,
              totalPages,
              totalItems: filteredBranches.length,
              pageSize,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(branchToDelete)}
        onClose={() => setBranchToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete gym branch?"
        description={`Are you sure you want to remove ${branchToDelete?.name || 'this branch'} (${branchToDelete?.code || ''})? This removes its branch staff and location record from your local preview.`}
        confirmLabel="Delete Branch"
        variant="danger"
      />
    </div>
  );
}

export default BranchesHubPage;
