import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Eye,
  LayoutGrid,
  List,
  Plus,
  Search,
  Star,
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
import {
  BranchTrainerDistributionChart,
  TrainerAssignmentsChart,
  TrainerPerformanceChart,
  WeeklyTrainingSessionsChart,
} from '../../../components/gym/trainers/TrainerCharts';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';
import Select from '../../../components/ui/Select';
import {
  TRAINER_SPECIALIZATIONS,
  TRAINER_STAFF_MEDIA,
  WEEKLY_TRAINING_SESSIONS_SERIES,
} from '../../../constants/trainerStaffData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function TrainersHubPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { trainers, sessions, toggleTrainerStatus } = useTrainerStaff();

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('clients');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const pageSize = 6;

  // KPI calculations
  const totalTrainers = trainers.length;
  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const onLeaveTrainers = trainers.filter((t) => t.status === 'on_leave').length;
  const totalAssignedMembers = trainers.reduce((sum, t) => sum + (t.assignedClients || 0), 0);
  const sessionsToday = sessions.filter((s) => s.date === '2026-11-19' && s.status !== 'cancelled').length;
  const monthlySessions = trainers.reduce((sum, t) => sum + (t.completedSessionsMonth || 0), 0);
  const avgRating =
    trainers.length > 0
      ? (trainers.reduce((sum, t) => sum + (t.rating || 4.7), 0) / trainers.length).toFixed(1)
      : '0.0';
  const avgRetention =
    trainers.length > 0
      ? Math.round(trainers.reduce((sum, t) => sum + (t.retentionRate || 90), 0) / trainers.length)
      : 0;

  // Filtered + sorted directory
  const filteredTrainers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trainers
      .filter((t) => {
        const matchesSearch =
          !q ||
          t.fullName.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q);
        const matchesBranch =
          branchFilter === 'all' ||
          t.branchId === branchFilter ||
          (Array.isArray(t.assignedBranches) && t.assignedBranches.includes(branchFilter));
        const matchesSpec =
          specFilter === 'all' ||
          (Array.isArray(t.specializations) && t.specializations.includes(specFilter));
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesBranch && matchesSpec && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.assignedClients || 0) - (a.assignedClients || 0);
      });
  }, [trainers, searchQuery, branchFilter, specFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTrainers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTrainers = filteredTrainers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleConfirmToggle = () => {
    if (!confirmTarget) return;
    const nextStatus = confirmTarget.status === 'active' ? 'inactive' : 'active';
    toggleTrainerStatus(confirmTarget.id, nextStatus);
    toast.success(`${confirmTarget.fullName} marked as ${nextStatus}`);
    setConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Management"
        description="Manage trainers, member coaching assignments, session schedules, and performance."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              icon={ClipboardCheck}
              onClick={() => navigate('/gym/trainers/assignments')}
            >
              Assignments
            </Button>
            <Button
              variant="outline"
              icon={CalendarDays}
              onClick={() => navigate('/gym/trainers/schedules')}
            >
              Schedules
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/gym/trainers/add')}
            >
              Add Trainer
            </Button>
          </div>
        }
      />

      {/* Quick Banner Summary */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Coaching Operations · Demo Analytics
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Personal Training &amp; Floor Coach Capacity
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Track trainer certifications, client load balancing across branches, and weekly session completion.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/gym/trainers/sessions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <CalendarClock className="h-3.5 w-3.5 text-navy-900" aria-hidden="true" />
              Training Sessions
            </Link>
            <Link
              to="/gym/trainers/performance"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Award className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Performance Insights
            </Link>
            <Link
              to="/gym/payroll"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Payroll &amp; Commissions
            </Link>
          </div>
        </div>
        <div className="lg:col-span-4 relative min-h-[160px] bg-slate-100">
          <img
            src={TRAINER_STAFF_MEDIA.coachingBanner}
            alt="Personal trainer coaching member on gym floor"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Trainers"
          value={totalTrainers}
          helperText="Registered across branches"
          icon={Users}
        />
        <StatCard
          label="Active Trainers"
          value={activeTrainers}
          change={`${onLeaveTrainers} on leave`}
          trend="neutral"
          icon={UserCheck}
        />
        <StatCard
          label="Assigned Members"
          value={totalAssignedMembers}
          change="+6 this month"
          trend="up"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Training Sessions Today"
          value={sessionsToday}
          helperText="Scheduled & completed"
          icon={CalendarClock}
        />
        <StatCard
          label="Monthly Completed Sessions"
          value={monthlySessions}
          change="+11%"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          label="Average Trainer Rating"
          value={`${avgRating} / 5.0`}
          helperText="Simulated feedback score"
          icon={Star}
        />
        <StatCard
          label="Client Retention Rate"
          value={`${avgRetention}%`}
          change="+2.4%"
          trend="up"
          icon={Award}
        />
        <StatCard
          label="Trainers On Leave"
          value={onLeaveTrainers}
          helperText="Temporary cover active"
          icon={UserMinus}
        />
      </div>

      {/* 4 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainerAssignmentsChart trainers={trainers} />
        <WeeklyTrainingSessionsChart data={WEEKLY_TRAINING_SESSIONS_SERIES} />
        <TrainerPerformanceChart trainers={trainers} />
        <BranchTrainerDistributionChart trainers={trainers} branches={tenantBranches} />
      </div>

      {/* Directory Filter Bar & View Toggle */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">All Trainers Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search, filter, inspect profiles, assign members, and manage coach availability.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto">
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
              placeholder="Search trainer name, ID, email or phone..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
          </div>

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

          <Select
            value={specFilter}
            onChange={(e) => {
              setSpecFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Specializations' },
              ...TRAINER_SPECIALIZATIONS.map((s) => ({ value: s, label: s })),
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
                { value: 'on_leave', label: 'On Leave' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'clients', label: 'Most Clients' },
                { value: 'experience', label: 'Experience' },
                { value: 'rating', label: 'Top Rated' },
                { value: 'name', label: 'Name A–Z' },
              ]}
            />
          </div>
        </div>

        {/* Listing */}
        {paginatedTrainers.length === 0 ? (
          <EmptyState
            title="No trainers match your filters"
            description="Adjust search criteria or register a new coach for this branch."
            actionLabel="Add Trainer"
            onAction={() => navigate('/gym/trainers/add')}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar src={trainer.avatar} name={trainer.fullName} size="lg" />
                      <div className="min-w-0">
                        <Link
                          to={`/gym/trainers/${trainer.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-navy-800 truncate block"
                        >
                          {trainer.fullName}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {trainer.id} · {trainer.branchName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trainer.status} />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {trainer.specializations?.join(' · ')}
                  </p>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-center">
                    <div>
                      <p className="text-[11px] text-slate-500">Experience</p>
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {trainer.experienceYears} yrs
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Clients</p>
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {trainer.assignedClients}/{trainer.maxClients}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Rating</p>
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {trainer.rating} ★
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/gym/trainers/${trainer.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      to={`/gym/trainers/${trainer.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/gym/trainers/assignments?trainer=${trainer.id}`}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Assign
                    </Link>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(trainer)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pr-4">Trainer</th>
                  <th className="py-3 px-4">Specializations</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Clients</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedTrainers.map((trainer) => (
                  <tr key={trainer.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={trainer.avatar} name={trainer.fullName} size="md" />
                        <div>
                          <Link
                            to={`/gym/trainers/${trainer.id}`}
                            className="font-semibold text-slate-900 hover:text-navy-800"
                          >
                            {trainer.fullName}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {trainer.id} · {trainer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[220px]">
                      {trainer.specializations?.slice(0, 2).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{trainer.branchName}</td>
                    <td className="py-3.5 px-4 font-medium tabular-nums text-slate-900">
                      {trainer.assignedClients}/{trainer.maxClients}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                      {trainer.shiftStart}–{trainer.shiftEnd}
                    </td>
                    <td className="py-3.5 px-4 font-medium tabular-nums text-slate-900">
                      {trainer.rating} ★
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={trainer.status} />
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/gym/trainers/${trainer.id}`}
                          className="text-xs font-medium text-navy-800 hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          to={`/gym/trainers/${trainer.id}/edit`}
                          className="text-xs font-medium text-slate-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmTarget(trainer)}
                          className="text-xs font-medium text-slate-500 hover:text-red-700 cursor-pointer"
                        >
                          {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredTrainers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </section>

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        title={confirmTarget?.status === 'active' ? 'Deactivate Trainer?' : 'Activate Trainer?'}
        description={
          confirmTarget
            ? `Are you sure you want to change ${confirmTarget.fullName}'s roster status?`
            : ''
        }
        confirmLabel={confirmTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.status === 'active' ? 'danger' : 'primary'}
        onConfirm={handleConfirmToggle}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}

export default TrainersHubPage;
