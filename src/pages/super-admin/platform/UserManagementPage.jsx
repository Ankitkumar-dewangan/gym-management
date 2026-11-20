import { useMemo, useState } from 'react';
import { Ban, Edit3, Eye, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { USER_CATEGORIES } from '../../../constants/platformData';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { cn } from '../../../utils/cn';
import { formatDate } from '../../../utils/formatters';

export function UserManagementPage() {
  const { users, roles, updateUser, updateUserStatus } = usePlatformManagement();

  const [categoryTab, setCategoryTab] = useState('All');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [gymFilter, setGymFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', mobile: '', role: '' });
  const [userToSuspend, setUserToSuspend] = useState(null);

  const pageSize = 6;

  const kpis = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
    }),
    [users]
  );

  const gymOptions = useMemo(
    () => Array.from(new Set(users.map((u) => u.associatedGym))).sort(),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesCategory = categoryTab === 'All' || u.category === categoryTab;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesGym = gymFilter === 'all' || u.associatedGym === gymFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.associatedGym.toLowerCase().includes(q) ||
        u.mobile.toLowerCase().includes(q);
      return (
        matchesCategory &&
        matchesRole &&
        matchesGym &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [users, categoryTab, search, roleFilter, gymFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters =
    categoryTab !== 'All' ||
    Boolean(search.trim()) ||
    roleFilter !== 'all' ||
    gymFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setCategoryTab('All');
    setSearch('');
    setRoleFilter('all');
    setGymFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser || !editForm.fullName.trim() || !editForm.email.trim()) {
      toast.error('Full name and email are required');
      return;
    }
    updateUser(editingUser.id, {
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      mobile: editForm.mobile.trim(),
      role: editForm.role,
    });
    toast.success(`Updated profile for ${editForm.fullName.trim()}`);
    setEditingUser(null);
  };

  const columns = [
    {
      key: 'profile',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={row.avatar} name={row.fullName} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{row.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
          {row.mobile}
        </span>
      ),
    },
    { key: 'associatedGym', header: 'Associated Gym' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{row.role}</p>
          <p className="text-[11px] text-slate-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'registeredAt',
      header: 'Registration Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.registeredAt)}
        </span>
      ),
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
      render: (row) => {
        const isActive = row.status === 'active';
        return (
          <div className="inline-flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setViewingUser(row)}
              title="View Profile"
              aria-label={`View profile for ${row.fullName}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => openEditModal(row)}
              title="Edit User"
              aria-label={`Edit ${row.fullName}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                const nextStatus = isActive ? 'inactive' : 'active';
                updateUserStatus(row.id, nextStatus);
                toast.success(
                  `${row.fullName} marked as ${nextStatus}`
                );
              }}
              title={isActive ? 'Deactivate User' : 'Activate User'}
              aria-label={isActive ? `Deactivate ${row.fullName}` : `Activate ${row.fullName}`}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border cursor-pointer',
                isActive
                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              )}
            >
              <Power className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {row.status !== 'suspended' && (
              <button
                type="button"
                onClick={() => setUserToSuspend(row)}
                title="Suspend Account"
                aria-label={`Suspend ${row.fullName}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Directory of SaaS administrators, gym owners, branch staff, trainers, and registered members."
      />

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Users"
          value={String(kpis.total)}
          change="+12.4%"
          trend="up"
          previousLabel="across all gyms"
          icon="Users"
        />
        <AdminStatCard
          label="Active Users"
          value={String(kpis.active)}
          change="Healthy"
          trend="up"
          previousLabel="verified accounts"
          icon="UserCheck"
        />
        <AdminStatCard
          label="Inactive Users"
          value={String(kpis.inactive)}
          change="Dormant"
          trend="neutral"
          previousLabel="awaiting sign-in"
          icon="Clock"
        />
        <AdminStatCard
          label="Suspended Users"
          value={String(kpis.suspended)}
          change="Flagged"
          trend="down"
          previousLabel="access restricted"
          icon="Shield"
        />
      </section>

      {/* User Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...USER_CATEGORIES].map((cat) => {
          const isActive = categoryTab === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryTab(cat);
                setCurrentPage(1);
              }}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0',
                isActive
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search name, email, mobile, or gym..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Roles' },
            ...roles.map((r) => ({ value: r.name, label: r.name })),
          ]}
          containerClassName="sm:w-40"
        />
        <Select
          aria-label="Filter by gym"
          value={gymFilter}
          onChange={(e) => {
            setGymFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: 'all', label: 'All Gyms' },
            ...gymOptions.map((g) => ({ value: g, label: g })),
          ]}
          containerClassName="sm:w-48"
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
            { value: 'suspended', label: 'Suspended' },
          ]}
          containerClassName="sm:w-36"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        emptyTitle="No users match your filters"
        emptyDescription="Clear your search or category filter to view registered accounts."
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

      {/* View Profile Modal */}
      <Modal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        title="User Profile"
        description={`Account ${viewingUser?.id || ''}`}
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingUser(null)}>
            Close
          </Button>
        }
      >
        {viewingUser && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <UserAvatar src={viewingUser.avatar} name={viewingUser.fullName} size="lg" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {viewingUser.fullName}
                </h3>
                <p className="text-xs text-slate-500 truncate">{viewingUser.email}</p>
                <div className="mt-1.5">
                  <StatusBadge status={viewingUser.status} />
                </div>
              </div>
            </div>
            <dl className="space-y-2.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Associated Gym</dt>
                <dd className="font-medium text-slate-900">{viewingUser.associatedGym}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Role</dt>
                <dd className="text-slate-900">{viewingUser.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Category</dt>
                <dd className="text-slate-700">{viewingUser.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Mobile</dt>
                <dd className="font-mono text-slate-800">{viewingUser.mobile}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Registered</dt>
                <dd className="tabular-nums text-slate-800">
                  {formatDate(viewingUser.registeredAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Last Active</dt>
                <dd className="font-mono text-xs text-slate-600">{viewingUser.lastActive}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit User · ${editingUser?.fullName || ''}`}
        description="Update contact information or assigned platform role."
        size="sm"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
          <Input
            label="Mobile Number"
            value={editForm.mobile}
            onChange={(e) => setEditForm((p) => ({ ...p, mobile: e.target.value }))}
          />
          <Select
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
            options={roles.map((r) => ({ value: r.name, label: r.name }))}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(userToSuspend)}
        onClose={() => setUserToSuspend(null)}
        onConfirm={() => {
          if (!userToSuspend) return;
          updateUserStatus(userToSuspend.id, 'suspended');
          toast.error(`Suspended account for ${userToSuspend.fullName}`);
          setUserToSuspend(null);
        }}
        title={`Suspend ${userToSuspend?.fullName}?`}
        description="Suspending restricts portal sign-in for this user until reactivated."
        confirmLabel="Suspend Account"
        variant="danger"
      />
    </div>
  );
}

export default UserManagementPage;
