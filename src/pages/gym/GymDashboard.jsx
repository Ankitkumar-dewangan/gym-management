import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Download,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import UserAvatar from '../../components/common/UserAvatar';
import AdminStatCard from '../../components/super-admin/AdminStatCard';
import {
  AttendanceAnalyticsSection,
  BranchPerformanceSection,
  GymRevenueAnalyticsSection,
  MembershipAnalyticsSection,
} from '../../components/gym/GymDashboardCharts';
import {
  FinancialOverviewSection,
  GymQuickActionsBar,
  GymRecentActivitiesSection,
  TrainerOverviewSection,
  UpcomingExpiriesSection,
} from '../../components/gym/GymDashboardWidgets';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import {
  buildGymDashboardSnapshot,
  DATE_RANGE_OPTIONS,
  GYM_AVATARS,
  GYM_COVER_IMAGE,
  GYM_MEMBERS_ROSTER,
  GYM_RECENT_ACTIVITIES,
  GYM_RECENT_TRANSACTIONS,
  GYM_TRAINERS_DATA,
  RECENT_ATTENDANCE_LOGS,
  UPCOMING_EXPIRIES_DATA,
} from '../../constants/gymOwnerData';
import { useTenant } from '../../contexts/TenantContext';
import { useDisclosure } from '../../hooks/useDisclosure';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'expired', label: 'Expired' },
];

const PLAN_FILTER_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'Annual Unlimited', label: 'Annual Unlimited' },
  { value: 'Strength + Recovery', label: 'Strength + Recovery' },
  { value: 'Coaching Tier 2', label: 'Coaching Tier 2' },
  { value: 'Monthly Open Gym', label: 'Monthly Open Gym' },
  { value: 'Quarterly Performance', label: 'Quarterly Performance' },
];

export function GymDashboard() {
  const { activeTenant, activeBranch, branches, selectBranch } = useTenant();

  const [dateRange, setDateRange] = useState('30d');
  const [customStart, setCustomStart] = useState('2026-10-20');
  const [customEnd, setCustomEnd] = useState('2026-11-19');

  const [members, setMembers] = useState(GYM_MEMBERS_ROSTER);
  const [attendanceLogs, setAttendanceLogs] = useState(RECENT_ATTENDANCE_LOGS);
  const [transactions, setTransactions] = useState(GYM_RECENT_TRANSACTIONS);
  const [expiries, setExpiries] = useState(UPCOMING_EXPIRIES_DATA);
  const [activities, setActivities] = useState(GYM_RECENT_ACTIVITIES);

  const [memberSearch, setMemberSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [memberPage, setMemberPage] = useState(1);

  const [selectedMember, setSelectedMember] = useState(null);

  const addMemberModal = useDisclosure(false);
  const collectPaymentModal = useDisclosure(false);
  const checkInModal = useDisclosure(false);

  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Annual Unlimited',
    branch: branches[0]?.name || '',
  });

  const [paymentForm, setPaymentForm] = useState({
    memberName: GYM_MEMBERS_ROSTER[0]?.name || '',
    amount: '',
    method: 'UPI',
    branch: branches[0]?.name || '',
  });

  const [checkInForm, setCheckInForm] = useState({
    memberId: GYM_MEMBERS_ROSTER[0]?.id || '',
    branch: branches[0]?.name || '',
  });

  const snapshot = useMemo(
    () => buildGymDashboardSnapshot(activeTenant, activeBranch, dateRange),
    [activeTenant, activeBranch, dateRange]
  );

  const isBranchFiltered = activeBranch && activeBranch.id !== 'all';

  const matchesBranchScope = (record) => {
    if (!isBranchFiltered) return true;
    return record.branchId === activeBranch.id || record.branch === activeBranch.name;
  };

  const scopedAttendance = useMemo(
    () => attendanceLogs.filter(matchesBranchScope).slice(0, 6),
    [attendanceLogs, activeBranch]
  );

  const scopedExpiries = useMemo(
    () => expiries.filter(matchesBranchScope),
    [expiries, activeBranch]
  );

  const scopedTrainers = useMemo(() => {
    const list = GYM_TRAINERS_DATA.filter(matchesBranchScope);
    return list.length > 0 ? list : GYM_TRAINERS_DATA;
  }, [activeBranch]);

  const scopedTransactions = useMemo(
    () => transactions.filter(matchesBranchScope),
    [transactions, activeBranch]
  );

  const scopedActivities = useMemo(() => {
    const list = activities.filter(matchesBranchScope);
    return list.length > 0 ? list : activities;
  }, [activities, activeBranch]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return members.filter((m) => {
      const branchOk = matchesBranchScope(m);
      const statusOk = statusFilter === 'all' || m.status === statusFilter;
      const planOk = planFilter === 'all' || m.plan === planFilter;
      const queryOk =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return branchOk && statusOk && planOk && queryOk;
    });
  }, [members, activeBranch, statusFilter, planFilter, memberSearch]);

  const pageSize = 5;
  const totalMemberPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const safeMemberPage = Math.min(memberPage, totalMemberPages);
  const paginatedMembers = filteredMembers.slice(
    (safeMemberPage - 1) * pageSize,
    safeMemberPage * pageSize
  );

  const handleExportReport = () => {
    const headers = ['Metric', 'Value', 'Change', 'Context'];
    const rows = snapshot.kpis.map((k) => [
      `"${k.label}"`,
      `"${k.value}"`,
      `"${k.change}"`,
      `"${k.previousLabel}"`,
    ]);
    const csv = [
      `Gym,${activeTenant.name}`,
      `Branch,${activeBranch.name}`,
      `Period,${snapshot.rangeConfig.label}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-dashboard-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported report for ${activeTenant.name} (${activeBranch.name})`);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
      toast.error('Please enter member name and email');
      return;
    }
    const targetBranch =
      branches.find((b) => b.name === newMemberForm.branch) || branches[0];
    const nextMember = {
      id: `MEM-${Math.floor(4100 + Math.random() * 899)}`,
      name: newMemberForm.name.trim(),
      email: newMemberForm.email.trim(),
      phone: newMemberForm.phone.trim() || '+1 (206) 555-0199',
      avatar: GYM_AVATARS.memberMale,
      plan: newMemberForm.plan,
      branchId: targetBranch?.id || 'br_downtown',
      branch: targetBranch?.name || newMemberForm.branch,
      tenantId: activeTenant.id,
      joinedAt: '2026-11-19',
      expiryAt: '2027-11-19',
      monthlyFee: newMemberForm.plan === 'Coaching Tier 2' ? 290 : 165,
      status: 'active',
    };
    setMembers((prev) => [nextMember, ...prev]);
    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: 'member_registered',
        icon: 'UserPlus',
        title: 'New member registered',
        description: `${nextMember.name} enrolled in ${nextMember.plan}`,
        person: nextMember.name,
        branchId: nextMember.branchId,
        branch: nextMember.branch,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      plan: 'Annual Unlimited',
      branch: branches[0]?.name || 'Downtown Flagship',
    });
    addMemberModal.close();
    toast.success(`${nextMember.name} added to roster`);
  };

  const handleCollectPayment = (e) => {
    e.preventDefault();
    const amountNum = Number(paymentForm.amount) || 0;
    if (amountNum <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    const targetBranch =
      branches.find((b) => b.name === paymentForm.branch) || branches[0];
    const nextTxn = {
      id: `TXN-${Math.floor(88500 + Math.random() * 499)}`,
      memberName: paymentForm.memberName,
      amount: amountNum,
      method: paymentForm.method,
      date: '2026-11-19',
      branchId: targetBranch?.id || 'br_downtown',
      branch: targetBranch?.name || paymentForm.branch,
      status: 'paid',
    };
    setTransactions((prev) => [nextTxn, ...prev]);
    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: 'payment_received',
        icon: 'Receipt',
        title: 'Payment received',
        description: `${formatCurrency(amountNum)} collected via ${paymentForm.method}`,
        person: paymentForm.memberName,
        branchId: nextTxn.branchId,
        branch: nextTxn.branch,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    collectPaymentModal.close();
    toast.success(`Collected ${formatCurrency(amountNum)} from ${paymentForm.memberName}`);
  };

  const handleRegisterAttendance = (e) => {
    e.preventDefault();
    const memberObj = members.find((m) => m.id === checkInForm.memberId) || members[0];
    const targetBranch =
      branches.find((b) => b.name === checkInForm.branch) || branches[0];
    const nextLog = {
      id: `ATT-${Math.floor(910 + Math.random() * 89)}`,
      memberId: memberObj.id,
      memberName: memberObj.name,
      avatar: memberObj.avatar,
      checkIn: 'Just now',
      checkOut: '—',
      branchId: targetBranch?.id || memberObj.branchId,
      branch: targetBranch?.name || checkInForm.branch,
      status: 'inside',
    };
    setAttendanceLogs((prev) => [nextLog, ...prev]);
    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: 'member_checked_in',
        icon: 'CalendarCheck',
        title: 'Member checked in',
        description: `Front-desk check-in logged at ${nextLog.branch}`,
        person: memberObj.name,
        branchId: nextLog.branchId,
        branch: nextLog.branch,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    checkInModal.close();
    toast.success(`${memberObj.name} checked in at ${nextLog.branch}`);
  };

  const handleRenewMembership = (row) => {
    setExpiries((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, renewalStatus: 'renewed' } : item
      )
    );
    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: 'membership_renewed',
        icon: 'RefreshCw',
        title: 'Membership renewed',
        description: `${row.plan} extended for ${row.memberName}`,
        person: row.memberName,
        branchId: row.branchId,
        branch: row.branch,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    toast.success(`Renewed ${row.plan} for ${row.memberName}`);
  };

  const handleSendReminder = (row) => {
    setExpiries((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, renewalStatus: 'reminder_sent' } : item
      )
    );
    toast.success(`Renewal reminder sent to ${row.memberName}`);
  };

  const memberColumns = [
    {
      key: 'name',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={row.avatar} name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.name}</p>
            <p className="text-xs font-mono text-slate-500">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-xs text-slate-800">{row.phone}</p>
          <p className="text-xs text-slate-500 truncate">{row.email}</p>
        </div>
      ),
    },
    { key: 'plan', header: 'Membership Plan' },
    { key: 'branch', header: 'Branch' },
    {
      key: 'joinedAt',
      header: 'Join Date',
      numeric: true,
      render: (row) => formatDate(row.joinedAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedMember(row)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header + Date Range + Export */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">
            Gym Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your gym&apos;s performance, memberships and business activities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-10">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Select dashboard date range"
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 h-10 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                aria-label="Start date"
                className="text-slate-700 focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                aria-label="End date"
                className="text-slate-700 focus:outline-none"
              />
            </div>
          )}

          <Button variant="primary" leftIcon={Download} onClick={handleExportReport}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Tenant & Branch Scope Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={GYM_COVER_IMAGE}
            alt={activeTenant.name}
            className="hidden sm:block h-14 w-24 rounded-lg object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-bold text-slate-900 truncate">
                {activeTenant.name}
              </span>
              <StatusBadge status={activeTenant.status || 'active'} />
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                {activeTenant.plan} Plan
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                Active View: <strong className="text-slate-700">{activeBranch.name}</strong>
                {activeBranch.id === 'all'
                  ? ` (${branches.length} branches consolidated)`
                  : ` · ${activeBranch.city || 'Branch Analytics'}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {branches.map((branch) => {
            const selected = activeBranch.id === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  selectBranch(selected ? 'all' : branch.id);
                  toast.success(selected ? 'Viewing all branches' : `Branch: ${branch.name}`);
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  selected
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {branch.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {snapshot.kpis.map((kpi) => (
          <AdminStatCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            previousLabel={kpi.previousLabel}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <GymQuickActionsBar
        onAddMember={addMemberModal.open}
        onCollectPayment={collectPaymentModal.open}
        onRegisterAttendance={checkInModal.open}
      />

      {/* Revenue Analytics */}
      <GymRevenueAnalyticsSection
        revenueSeriesByTab={snapshot.revenueSeriesByTab}
        branchLabel={activeBranch.name}
      />

      {/* Membership Analytics */}
      <MembershipAnalyticsSection
        membershipMetrics={snapshot.membershipMetrics}
        membershipDonut={snapshot.membershipDonut}
        membershipByTier={snapshot.membershipByTier}
      />

      {/* Attendance Overview + Recent Check-ins */}
      <AttendanceAnalyticsSection
        attendanceSummary={snapshot.attendanceSummary}
        attendanceWeekly={snapshot.attendanceWeekly}
        attendanceDaily={snapshot.attendanceDaily}
        peakHours={snapshot.peakHours}
        branchPerformance={snapshot.branchPerformance}
        recentAttendance={scopedAttendance}
      />

      {/* Recent Member Registrations */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Member Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Newest signups filtered by branch, membership plan, and billing status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={Plus} onClick={addMemberModal.open}>
              Add Member
            </Button>
            <Link to="/gym/members">
              <Button variant="primary" size="sm">
                View All Members
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <SearchBar
              value={memberSearch}
              onChange={(val) => {
                setMemberSearch(val);
                setMemberPage(1);
              }}
              placeholder="Search by member name, ID, email, or phone..."
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setMemberPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
              aria-label="Filter by membership status"
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setMemberPage(1);
              }}
              options={PLAN_FILTER_OPTIONS}
              aria-label="Filter by membership plan"
            />
          </div>
        </div>

        <DataTable
          columns={memberColumns}
          data={paginatedMembers}
          emptyTitle="No member registrations match"
          emptyDescription="Reset the branch filter, plan filter, or search query to inspect member records."
          emptyActionLabel="Reset filters"
          onEmptyAction={() => {
            setMemberSearch('');
            setStatusFilter('all');
            setPlanFilter('all');
          }}
          pagination={{
            currentPage: safeMemberPage,
            totalPages: totalMemberPages,
            totalItems: filteredMembers.length,
            pageSize,
            onPageChange: setMemberPage,
          }}
        />
      </section>

      {/* Upcoming Membership Expiries */}
      <UpcomingExpiriesSection
        expiries={scopedExpiries}
        onViewMember={(row) =>
          setSelectedMember({
            id: row.memberId,
            name: row.memberName,
            email: row.email,
            phone: '+1 (206) 555-0140',
            avatar: row.avatar,
            plan: row.plan,
            branch: row.branch,
            joinedAt: '2025-11-24',
            expiryAt: row.expiryDate,
            monthlyFee: row.renewalFee,
            status: row.remainingDays <= 7 ? 'overdue' : 'pending',
          })
        }
        onRenewMembership={handleRenewMembership}
        onSendReminder={handleSendReminder}
      />

      {/* Trainer Overview & Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7">
          <TrainerOverviewSection trainers={scopedTrainers} />
        </div>
        <div className="xl:col-span-5">
          <GymRecentActivitiesSection activities={scopedActivities} />
        </div>
      </div>

      {/* Financial Overview */}
      <FinancialOverviewSection
        financialOverview={snapshot.financialOverview}
        transactions={scopedTransactions}
      />

      {/* Branch Performance Comparison */}
      <BranchPerformanceSection
        branchPerformance={snapshot.branchPerformance}
        activeBranch={activeBranch}
        onSelectBranch={(id) => {
          selectBranch(id);
          toast.success(id === 'all' ? 'Viewing all branches' : 'Branch view updated');
        }}
      />

      {/* Member Details Modal */}
      <Modal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title="Member Profile Summary"
        description="Membership tier, branch assignment, and billing standing."
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
              <UserAvatar src={selectedMember.avatar} name={selectedMember.name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    {selectedMember.name}
                  </h3>
                  <StatusBadge status={selectedMember.status} />
                </div>
                <p className="text-xs font-mono text-slate-500">{selectedMember.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedMember.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Membership Plan</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedMember.plan}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Branch</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedMember.branch}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Monthly Fee</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  {formatCurrency(selectedMember.monthlyFee)}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Expiry Date</dt>
                <dd className="font-mono text-slate-900 mt-0.5">
                  {formatDate(selectedMember.expiryAt || '2027-01-01')}
                </dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Send}
                onClick={() => {
                  toast.success(`Reminder sent to ${selectedMember.name}`);
                  setSelectedMember(null);
                }}
              >
                Send Reminder
              </Button>
              <Button
                variant="emerald"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => {
                  toast.success(`Opened renewal workflow for ${selectedMember.name}`);
                  setSelectedMember(null);
                }}
              >
                Renew Membership
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModal.isOpen}
        onClose={addMemberModal.close}
        title="Add New Member"
        description="Register a member and assign a membership plan and home branch."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Morgan Ellis"
            value={newMemberForm.name}
            onChange={(e) => setNewMemberForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="morgan.ellis@email.com"
              value={newMemberForm.email}
              onChange={(e) => setNewMemberForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (206) 555-0199"
              value={newMemberForm.phone}
              onChange={(e) => setNewMemberForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Membership Plan"
              value={newMemberForm.plan}
              onChange={(e) => setNewMemberForm((p) => ({ ...p, plan: e.target.value }))}
              options={PLAN_FILTER_OPTIONS.filter((o) => o.value !== 'all')}
            />
            <Select
              label="Home Branch"
              value={newMemberForm.branch}
              onChange={(e) => setNewMemberForm((p) => ({ ...p, branch: e.target.value }))}
              options={branches.map((b) => ({ value: b.name, label: b.name }))}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={addMemberModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={collectPaymentModal.isOpen}
        onClose={collectPaymentModal.close}
        title="Collect Membership Fee"
        description="Record an instant front-desk cash, UPI, or card payment."
      >
        <form onSubmit={handleCollectPayment} className="space-y-4">
          <Select
            label="Select Member"
            value={paymentForm.memberName}
            onChange={(e) => setPaymentForm((p) => ({ ...p, memberName: e.target.value }))}
            options={members.map((m) => ({ value: m.name, label: `${m.name} (${m.id})` }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              min="1"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
            <Select
              label="Payment Method"
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
              options={[
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Online Card', label: 'Online Card' },
              ]}
            />
          </div>
          <Select
            label="Branch"
            value={paymentForm.branch}
            onChange={(e) => setPaymentForm((p) => ({ ...p, branch: e.target.value }))}
            options={branches.map((b) => ({ value: b.name, label: b.name }))}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={collectPaymentModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Register Attendance Modal */}
      <Modal
        isOpen={checkInModal.isOpen}
        onClose={checkInModal.close}
        title="Register Member Check-in"
        description="Log a front-desk gym floor entry for an active member."
      >
        <form onSubmit={handleRegisterAttendance} className="space-y-4">
          <Select
            label="Member"
            value={checkInForm.memberId}
            onChange={(e) => setCheckInForm((p) => ({ ...p, memberId: e.target.value }))}
            options={members.map((m) => ({ value: m.id, label: `${m.name} · ${m.id}` }))}
          />
          <Select
            label="Branch"
            value={checkInForm.branch}
            onChange={(e) => setCheckInForm((p) => ({ ...p, branch: e.target.value }))}
            options={branches.map((b) => ({ value: b.name, label: b.name }))}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={checkInModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Check In Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default GymDashboard;
