export const PREVIEW_USERS = {
  super_admin: {
    id: 'usr_sa_01',
    name: 'Super Admin',
    email: 'admin@gympilot.fit',
    role: 'super_admin',
    title: 'Platform Administrator',
  },
  gym_owner: {
    id: 'usr_go_01',
    name: 'Gym Owner',
    email: 'owner@gymclub.com',
    role: 'gym_owner',
    title: 'Gym Owner',
  },
  member: {
    id: 'usr_mb_01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    role: 'member',
    title: 'Gym Member',
    memberId: 'MEM-4094',
    branch: 'Downtown Arena',
    plan: 'Annual Elite Unlimited Access',
    planStatus: 'Active',
    expiryDate: '14 Jan 2027',
    monthlyAttendance: 14,
    totalAttendance: 48,
    trainingBlock: 'Hypertrophy Phase 2',
    fitnessGoal: 'Muscle Hypertrophy & Fat Loss',
    trainer: 'Vikram Singh',
    calories: 2400,
    protein: 160,
    carbs: 240,
    fats: 65,
    weight: 78.5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
};

export const PREVIEW_TENANTS = [];

export const PLATFORM_REVENUE_SERIES = [];

export const GYM_REVENUE_SERIES = [];

export const GYM_ATTENDANCE_SERIES = [];

export const GYM_RECENT_MEMBERS = [];

export const MEMBER_UPCOMING_SESSIONS = [];

export const NOTIFICATIONS_BY_ROLE = {
  super_admin: [],
  gym_owner: [],
  member: [],
};
