import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Power,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import { BranchMonthlyRevenueAreaChart } from '../../../components/gym/branches/BranchCharts';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import {
  GYM_MEMBERS_ROSTER,
  PEAK_GYM_HOURS_DATA,
  WEEKLY_ATTENDANCE_DATA,
} from '../../../constants/gymOwnerData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate, getInitials } from '../../../utils/formatters';

const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'information', label: 'Branch Information' },
  { key: 'manager', label: 'Branch Manager' },
  { key: 'staff', label: 'Staff' },
  { key: 'members', label: 'Members' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'financial', label: 'Financial' },
  { key: 'logs', label: 'Activity Logs' },
];

export function BranchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getBranchById,
    getManagerForBranch,
    getBranchStaff,
    getBranchLogs,
    toggleBranchStatus,
    deleteBranch,
  } = useBranchManagement();

  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const branch = getBranchById(id);

  const manager = useMemo(() => getManagerForBranch(branch), [branch, getManagerForBranch]);
  const branchStaff = useMemo(
    () => (branch ? getBranchStaff(branch.id) : []),
    [branch, getBranchStaff]
  );
  const branchLogs = useMemo(
    () => (branch ? getBranchLogs(branch.id) : []),
    [branch, getBranchLogs]
  );

  const branchMembers = useMemo(() => {
    if (!branch) return [];
    const matched = GYM_MEMBERS_ROSTER.filter(
      (m) => m.branchId === branch.id || m.branch === branch.name
    );
    return matched.length > 0 ? matched : GYM_MEMBERS_ROSTER.slice(0, 4);
  }, [branch]);

  if (!branch) {
    return (
      <EmptyState
        icon={Building2}
        title="Branch not found"
        description="This branch record could not be found in your gym portfolio."
        actionLabel="Back to Branches"
        onAction={() => navigate('/gym/branches')}
      />
    );
  }

  const staffColumns = [
    {
      key: 'name',
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role' },
    { key: 'contact', header: 'Contact', numeric: true },
    {
      key: 'joiningDate',
      header: 'Joined',
      numeric: true,
      render: (row) => formatDate(row.joiningDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const memberColumns = [
    {
      key: 'name',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs font-mono text-slate-500">{row.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'plan', header: 'Membership Plan' },
    {
      key: 'monthlyFee',
      header: 'Monthly Fee',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.monthlyFee),
    },
    {
      key: 'expiryAt',
      header: 'Expiry Date',
      numeric: true,
      render: (row) => formatDate(row.expiryAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleDeleteConfirm = () => {
    deleteBranch(branch.id);
    toast.success(`Deleted branch ${branch.name}`);
    setConfirmDeleteOpen(false);
    navigate('/gym/branches');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/gym/branches">
          <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
            All Branches
          </Button>
        </Link>
      </div>

      {/* Premium Branch Profile Header */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="relative h-48 sm:h-56 w-full bg-slate-900">
          {branch.coverImage ? (
            <img
              src={branch.coverImage}
              alt={branch.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-90"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
        </div>

        <div className="px-5 sm:px-6 pb-5 pt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            {branch.logo ? (
              <img
                src={branch.logo}
                alt={`${branch.name} logo`}
                className="h-16 w-16 rounded-xl object-cover border-2 border-white shadow-sm bg-white -mt-10 relative z-10 shrink-0"
              />
            ) : (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-navy-900 text-lg font-bold text-white border-2 border-white shadow-sm -mt-10 relative z-10 shrink-0">
                {getInitials(branch.name)}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 truncate">
                  {branch.name}
                </h1>
                <span className="font-mono text-xs text-slate-500">
                  {branch.code}
                </span>
                <StatusBadge status={branch.status} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {branch.fullAddress || `${branch.city}, ${branch.state}`}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link to={`/gym/branches/${branch.id}/edit`}>
              <Button variant="primary" size="sm" leftIcon={Edit}>
                Edit Branch
              </Button>
            </Link>

            <Dropdown
              align="right"
              widthClass="w-56"
              trigger={
                <Button variant="outline" size="sm" rightIcon={MoreVertical}>
                  More Actions
                </Button>
              }
              items={[
                {
                  key: 'manager',
                  label: 'Manage Branch Manager',
                  icon: UserCog,
                  onClick: () => navigate(`/gym/branches/${branch.id}/manager`),
                },
                {
                  key: 'staff',
                  label: 'Branch Staff Overview',
                  icon: Users,
                  onClick: () => navigate(`/gym/branches/${branch.id}/staff`),
                },
                {
                  key: 'toggle',
                  label: branch.status === 'active' ? 'Deactivate Branch' : 'Activate Branch',
                  icon: Power,
                  onClick: () => {
                    toggleBranchStatus(branch.id);
                    toast.success(
                      `${branch.name} ${branch.status === 'active' ? 'deactivated' : 'activated'}`
                    );
                  },
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete Branch',
                  icon: Trash2,
                  danger: true,
                  onClick: () => setConfirmDeleteOpen(true),
                },
              ]}
            />
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-t border-slate-200 px-4 sm:px-6 overflow-x-auto">
          <nav className="flex items-center gap-1" aria-label="Branch detail tabs">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3.5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer',
                  activeTab === tab.key
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AdminStatCard
              label="Total Members"
              value={(branch.totalMembers || 0).toLocaleString()}
              change="+5.8%"
              trend="up"
              previousLabel={`Cap: ${branch.maxCapacity}`}
              icon="Users"
            />
            <AdminStatCard
              label="Active Members"
              value={(branch.activeMembers || 0).toLocaleString()}
              change={`${branch.totalMembers ? Math.round((branch.activeMembers / branch.totalMembers) * 100) : 0}%`}
              trend="up"
              previousLabel="active standing"
              icon="UserCheck"
            />
            <AdminStatCard
              label="Today's Attendance"
              value={(branch.todaysAttendance || 0).toLocaleString()}
              change="+7.2%"
              trend="up"
              previousLabel="check-ins today"
              icon="CalendarCheck"
            />
            <AdminStatCard
              label="Monthly Revenue"
              value={formatCurrency(branch.monthlyRevenue || 0)}
              change="+8.4%"
              trend="up"
              previousLabel="gross collections"
              icon="DollarSign"
            />
            <AdminStatCard
              label="Monthly Expenses"
              value={formatCurrency(branch.monthlyExpenses || 0)}
              change="+1.9%"
              trend="neutral"
              previousLabel="operating costs"
              icon="Wallet"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                6-Month Revenue vs Expenses
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Historical financial trajectory for {branch.name}
              </p>
              <BranchMonthlyRevenueAreaChart history={branch.revenueHistory || []} />
            </div>

            <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Activities</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-medium text-navy-900 hover:text-emerald-700 cursor-pointer"
                >
                  All Logs &rarr;
                </button>
              </div>
              {branchLogs.length === 0 ? (
                <p className="text-xs text-slate-500">No recent activities logged yet.</p>
              ) : (
                <ol className="divide-y divide-slate-100">
                  {branchLogs.slice(0, 4).map((log) => (
                    <li key={log.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{log.title}</p>
                        <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{log.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {log.category} · {log.actor}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH INFORMATION */}
      {activeTab === 'information' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Basic & Contact Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Branch Type</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{branch.branchType}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Opening Date</dt>
                <dd className="font-mono text-slate-900 mt-0.5">{formatDate(branch.openingDate)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Contact Person</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{branch.contactPerson}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Primary Phone</dt>
                <dd className="font-mono text-slate-900 mt-0.5">{branch.contactNumber}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-xs text-slate-500">Email & Website</dt>
                <dd className="font-medium text-slate-900 mt-0.5">
                  {branch.email} {branch.website ? `· ${branch.website}` : ''}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Address & Operating Hours</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-xs text-slate-500">Address</dt>
                <dd className="font-medium text-slate-900 mt-0.5">
                  {branch.fullAddress}, {branch.city}, {branch.state} {branch.pinCode}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Weekday Hours</dt>
                <dd className="font-mono text-slate-900 mt-0.5">
                  {branch.openingTime} – {branch.closingTime}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Weekend Timings</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{branch.weekendTimings}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Weekly Off</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{branch.weeklyOff}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Max Capacity</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  {branch.maxCapacity} members
                </dd>
              </div>
            </dl>
          </section>

          <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Facilities & Equipment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Area</p>
                <p className="font-semibold text-slate-900 mt-0.5">{branch.totalArea}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Floors</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{branch.floors}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Zones</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{branch.workoutZones}</p>
              </div>
              {[
                { label: 'Lockers', ok: branch.lockerFacility },
                { label: 'Showers', ok: branch.showerFacility },
                { label: 'Parking', ok: branch.parkingFacility },
                { label: 'AC Climate', ok: branch.acFacility },
              ].map((fac) => (
                <div key={fac.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{fac.label}</p>
                  <p className={cn('font-medium mt-0.5', fac.ok ? 'text-emerald-700' : 'text-slate-400')}>
                    {fac.ok ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              ))}
            </div>
            {branch.equipmentSummary && (
              <p className="text-sm text-slate-600">{branch.equipmentSummary}</p>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: BRANCH MANAGER */}
      {activeTab === 'manager' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Primary Branch Manager</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Leadership accountability and direct contact details
              </p>
            </div>
            <Link to={`/gym/branches/${branch.id}/manager`}>
              <Button variant="primary" size="sm" leftIcon={UserCog}>
                Manage / Reassign Manager
              </Button>
            </Link>
          </div>

          {manager ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <UserAvatar src={manager.avatar} name={manager.name} size="lg" />
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{manager.name}</h3>
                    <StatusBadge status={manager.status} />
                  </div>
                  <p className="text-xs font-medium text-emerald-700">Primary Branch Manager</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {manager.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {manager.phone}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    Joined {formatDate(manager.joiningDate)}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Assigned Responsibilities
                </h3>
                <ul className="space-y-2">
                  {(manager.responsibilities || []).map((resp) => (
                    <li key={resp} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={UserCog}
              title="No primary manager assigned"
              description="Assign an existing manager or appoint a new branch manager for this location."
              actionLabel="Assign Manager"
              onAction={() => navigate(`/gym/branches/${branch.id}/manager`)}
            />
          )}
        </section>
      )}

      {/* TAB 4: STAFF */}
      {activeTab === 'staff' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Branch Staff ({branchStaff.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Trainers, receptionists, dietitians, and operations personnel
              </p>
            </div>
            <Link to={`/gym/branches/${branch.id}/staff`}>
              <Button variant="primary" size="sm" leftIcon={Users}>
                Open Staff Overview
              </Button>
            </Link>
          </div>
          <DataTable
            columns={staffColumns}
            data={branchStaff}
            emptyTitle="No staff assigned yet"
            emptyDescription="Add trainers, receptionists, or branch staff in the Staff Overview workspace."
          />
        </section>
      )}

      {/* TAB 5: MEMBERS */}
      {activeTab === 'members' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-xs text-slate-500">Branch Members</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums font-display">
                {branch.totalMembers}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-xs text-slate-500">Active Memberships</p>
              <p className="mt-1 text-xl font-bold text-emerald-700 tabular-nums font-display">
                {branch.activeMembers}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-xs text-slate-500">Expired Memberships</p>
              <p className="mt-1 text-xl font-bold text-red-700 tabular-nums font-display">
                {branch.expiredMembers}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-xs text-slate-500">Monthly Renewals</p>
              <p className="mt-1 text-xl font-bold text-navy-900 tabular-nums font-display">
                {branch.renewals}
              </p>
            </div>
          </div>

          <DataTable columns={memberColumns} data={branchMembers} />
        </section>
      )}

      {/* TAB 6: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Weekly Branch Check-ins
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Daily & weekly attendance volume across {branch.name}
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_ATTENDANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="checkIns" name="Check-ins" fill="#10B981" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Peak Hours</h2>
            <p className="text-xs text-slate-500 mb-4">
              Average floor occupancy by time of day
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PEAK_GYM_HOURS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="occupancy" name="Occupancy" fill="#14213D" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* TAB 7: FINANCIAL */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              label="Monthly Revenue"
              value={formatCurrency(branch.monthlyRevenue)}
              change="+8.4%"
              trend="up"
              previousLabel="billed volume"
              icon="DollarSign"
            />
            <AdminStatCard
              label="Collections"
              value={formatCurrency(branch.collections)}
              change="95% settled"
              trend="up"
              previousLabel="cash, UPI & card"
              icon="Receipt"
            />
            <AdminStatCard
              label="Pending Payments"
              value={formatCurrency(branch.pendingPayments)}
              change="Due"
              trend="neutral"
              previousLabel="awaiting settlement"
              icon="Clock"
            />
            <AdminStatCard
              label="Monthly Expenses"
              value={formatCurrency(branch.monthlyExpenses)}
              change="Controlled"
              trend="neutral"
              previousLabel="rent, payroll & utilities"
              icon="Wallet"
            />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Revenue & Expense Trend
            </h2>
            <BranchMonthlyRevenueAreaChart history={branch.revenueHistory || []} />
          </section>
        </div>
      )}

      {/* TAB 8: ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Branch Activity Logs</h2>
          {branchLogs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity logs yet"
              description="Branch updates, staff changes, and membership milestones will be recorded here."
            />
          ) : (
            <ol className="divide-y divide-slate-100">
              {branchLogs.map((log) => (
                <li key={log.id} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-navy-900 shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{log.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{log.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {log.category} · Updated by {log.actor}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {log.timestamp}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete this branch?"
        description={`Confirm removing ${branch.name} (${branch.code}) from ${branch.city}.`}
        confirmLabel="Delete Branch"
        variant="danger"
      />
    </div>
  );
}

export default BranchDetailsPage;
