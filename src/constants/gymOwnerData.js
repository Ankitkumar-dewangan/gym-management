export const GYM_COVER_IMAGE = '/src/assets/images/gym_club_cover_1795083656208.jpg';

export const GYM_AVATARS = {
  owner: '/src/assets/images/avatar_gym_owner_1795083189927.jpg',
  memberMale: '/src/assets/images/avatar_member_man_1795083654977.jpg',
  trainerFemale: '/src/assets/images/avatar_trainer_coach_1795083655515.jpg',
  coachMember: '/src/assets/images/avatar_coach_member_1795083190439.jpg',
  portrait: '/src/assets/images/avatar_admin_portrait_1795083189519.jpg',
};

export const DATE_RANGE_OPTIONS = [
  { key: 'today', label: 'Today', scale: 0.08, periodLabel: 'vs yesterday' },
  { key: '7d', label: 'Last 7 Days', scale: 0.27, periodLabel: 'vs prior 7 days' },
  { key: '30d', label: 'Last 30 Days', scale: 1, periodLabel: 'vs prior 30 days' },
  { key: 'month', label: 'This Month', scale: 0.94, periodLabel: 'vs last month' },
  { key: 'custom', label: 'Custom Range', scale: 1.15, periodLabel: 'vs previous period' },
];

export const REVENUE_PERIOD_DATA = {
  daily: [],
  weekly: [],
  monthly: [],
  yearly: [],
};

export const MEMBERSHIP_TIER_DISTRIBUTION = [];

export const WEEKLY_ATTENDANCE_DATA = [];

export const DAILY_ATTENDANCE_TREND = [];

export const PEAK_GYM_HOURS_DATA = [];

export const GYM_MEMBERS_ROSTER = [];

export const GYM_TRAINERS_DATA = [];

export const GYM_RECENT_TRANSACTIONS = [];

export const GYM_RECENT_ACTIVITIES = [];

export const RECENT_ATTENDANCE_LOGS = [];

export const UPCOMING_EXPIRIES_DATA = [];

export const GYM_GLOBAL_SEARCH_INDEX = [];

export function buildGymDashboardSnapshot(activeTenant, activeBranch, dateRangeKey = '30d') {
  const tenant = activeTenant || { id: 'default', name: 'My Gym Club', totalMembers: 0, branches: [] };
  const branches = tenant.branches || [];
  const rangeConfig = DATE_RANGE_OPTIONS.find((r) => r.key === dateRangeKey) || DATE_RANGE_OPTIONS[2];

  const totalMembers = 0;
  const activeMembers = 0;
  const newMembers = 0;
  const expiredMembers = 0;
  const todaysAttendance = 0;
  const monthlyRevenue = 0;
  const pendingPayments = 0;
  const monthlyExpenses = 0;

  const branchPerformance = branches.map((b) => ({
    id: b.id,
    name: b.name,
    city: b.city,
    totalMembers: b.members || 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    todaysAttendance: 0,
    expenses: 0,
    status: 'active',
  }));

  const kpis = [
    {
      key: 'total_members',
      label: 'Total Members',
      value: '0',
      change: '0%',
      trend: 'neutral',
      previousLabel: rangeConfig.periodLabel,
      icon: 'Users',
    },
    {
      key: 'active_members',
      label: 'Active Members',
      value: '0',
      change: '0%',
      trend: 'neutral',
      previousLabel: '0% active ratio',
      icon: 'UserCheck',
    },
    {
      key: 'new_members',
      label: 'New Members',
      value: '0',
      change: '0%',
      trend: 'neutral',
      previousLabel: rangeConfig.periodLabel,
      icon: 'UserPlus',
    },
    {
      key: 'expired_memberships',
      label: 'Expired Memberships',
      value: '0',
      change: '0%',
      trend: 'neutral',
      previousLabel: 'awaiting renewal',
      icon: 'UserX',
    },
    {
      key: 'todays_attendance',
      label: "Today's Attendance",
      value: '0',
      change: '0%',
      trend: 'neutral',
      previousLabel: '0% capacity',
      icon: 'CalendarCheck',
    },
    {
      key: 'monthly_revenue',
      label: dateRangeKey === 'today' ? "Today's Revenue" : 'Monthly Revenue',
      value: '₹0',
      change: '0%',
      trend: 'neutral',
      previousLabel: rangeConfig.periodLabel,
      icon: 'IndianRupee',
    },
    {
      key: 'pending_payments',
      label: 'Pending Payments',
      value: '₹0',
      change: '0%',
      trend: 'neutral',
      previousLabel: '0 overdue invoices',
      icon: 'Clock',
    },
    {
      key: 'monthly_expenses',
      label: 'Monthly Expenses',
      value: '₹0',
      change: '0%',
      trend: 'neutral',
      previousLabel: 'rent & utilities',
      icon: 'Wallet',
    },
  ];

  const membershipMetrics = {
    active: 0,
    expired: 0,
    expiringSoon: 0,
    freeTrials: 0,
    renewals: 0,
  };

  const membershipDonut = [];

  const membershipByTier = [];

  const attendanceSummary = {
    todayCheckIns: 0,
    currentlyInside: 0,
    totalCheckOuts: 0,
    avgDaily: 0,
  };

  const financialOverview = {
    totalCollection: 0,
    cashCollection: 0,
    upiCollection: 0,
    onlinePayments: 0,
    pendingDues: 0,
    totalExpenses: 0,
  };

  return {
    kpis,
    rangeConfig,
    membershipMetrics,
    membershipDonut,
    membershipByTier,
    attendanceSummary,
    attendanceWeekly: [],
    attendanceDaily: [],
    peakHours: [],
    financialOverview,
    branchPerformance,
    revenueSeriesByTab: {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
    },
  };
}
