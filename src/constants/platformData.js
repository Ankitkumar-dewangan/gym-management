export const GENERATED_ASSETS = {
  ADMIN_AVATAR: '',
  OWNER_AVATAR: '',
  COACH_AVATAR: '',
  SUPPORT_ILLUSTRATION: '',
};

export const USER_CATEGORIES = [
  'SaaS Admins',
  'Gym Owners',
  'Branch Managers',
  'Receptionists',
  'Trainers',
  'Members',
];

export const INITIAL_PLATFORM_USERS = [];

export const PERMISSION_GROUPS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'gym_management', label: 'Gym Management' },
  { key: 'branch_management', label: 'Branch Management' },
  { key: 'members', label: 'Members' },
  { key: 'membership', label: 'Membership' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'payments', label: 'Payments' },
  { key: 'trainers', label: 'Trainers' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'diet', label: 'Diet' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];

const buildMatrix = (ruleFn) =>
  PERMISSION_GROUPS.reduce((acc, group) => {
    acc[group.key] = ruleFn(group.key);
    return acc;
  }, {});

export const INITIAL_ROLES = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    description: 'Full SaaS platform control across tenants, billing, compliance, and settings.',
    userCount: 0,
    isSystem: true,
    permissions: buildMatrix(() => ({ view: true, create: true, edit: true, delete: true })),
  },
  {
    id: 'role_gym_owner',
    name: 'Gym Owner',
    description: 'Complete authority over owned gym tenant, branches, staff, and financials.',
    userCount: 0,
    isSystem: true,
    permissions: buildMatrix((k) =>
      k === 'gym_management'
        ? { view: true, create: false, edit: true, delete: false }
        : { view: true, create: true, edit: true, delete: true }
    ),
  },
  {
    id: 'role_branch_manager',
    name: 'Branch Manager',
    description: 'Manages daily operations, memberships, trainers, and attendance for assigned branches.',
    userCount: 0,
    isSystem: true,
    permissions: buildMatrix((k) =>
      ['gym_management', 'expenses', 'reports'].includes(k)
        ? { view: true, create: false, edit: false, delete: false }
        : { view: true, create: true, edit: true, delete: false }
    ),
  },
  {
    id: 'role_trainer',
    name: 'Personal Trainer',
    description: 'Access to assigned members, workout regimens, attendance logs, and diets.',
    userCount: 0,
    isSystem: true,
    permissions: buildMatrix((k) =>
      ['workouts', 'diet', 'attendance'].includes(k)
        ? { view: true, create: true, edit: true, delete: false }
        : { view: false, create: false, edit: false, delete: false }
    ),
  },
  {
    id: 'role_member',
    name: 'Club Member',
    description: 'Member self-service portal for QR passes, workouts, diets, and plan status.',
    userCount: 0,
    isSystem: true,
    permissions: buildMatrix((k) =>
      ['dashboard', 'workouts', 'diet', 'attendance', 'membership'].includes(k)
        ? { view: true, create: false, edit: false, delete: false }
        : { view: false, create: false, edit: false, delete: false }
    ),
  },
];

export const TICKET_CATEGORIES = [
  'Billing & Subscriptions',
  'QR Scanner & Hardware',
  'Multi-Branch Sync',
  'Member App Access',
  'Payroll Calculation',
  'Feature Request',
  'Account & Security',
];

export const SUPPORT_AGENTS = [
  'Elena Vance (Tier 3)',
  'Kavita Rao (Tier 2)',
  'Marcus Sterling (Account Exec)',
  'Alex Chen (DevOps)',
];

export const INITIAL_TICKETS = [];

export const NOTIFICATION_TYPES = [
  'Subscription Alert',
  'Payment Reminder',
  'System Maintenance',
  'Compliance Notice',
  'Feature Announcement',
  'Security Warning',
];

export const NOTIFICATION_CHANNELS = ['In-App', 'Email', 'SMS', 'WhatsApp'];

export const INITIAL_NOTIFICATIONS = [];

export const NOTIFICATION_TEMPLATES = [
  {
    id: 'tmpl_1',
    name: 'Subscription Expiry (3 Days)',
    type: 'Subscription Alert',
    channels: ['Email', 'In-App'],
    channel: 'Email + In-App',
    subject: 'Action Required: Your GymPilot subscription expires in 3 days',
    body: 'Dear {{ownerName}}, your {{planName}} plan for {{gymName}} will expire on {{expiryDate}}. Please review billing to prevent service interruption.',
    variables: ['ownerName', 'planName', 'gymName', 'expiryDate'],
  },
  {
    id: 'tmpl_2',
    name: 'Payment Overdue Notification',
    type: 'Payment Reminder',
    channels: ['WhatsApp', 'In-App'],
    channel: 'WhatsApp + In-App',
    subject: 'Invoice overdue for {{gymName}}',
    body: 'Invoice #{{invoiceId}} for ₹{{amount}} is overdue. Please retry your payment method or update card details.',
    variables: ['gymName', 'invoiceId', 'amount'],
  },
  {
    id: 'tmpl_3',
    name: 'Scheduled Maintenance Notice',
    type: 'System Maintenance',
    channels: ['In-App', 'Email'],
    channel: 'In-App + Email',
    subject: 'Upcoming Platform Maintenance',
    body: 'We will be conducting scheduled system updates on {{date}} at {{time}}. Platform access may be briefly interrupted for up to 30 minutes.',
    variables: ['date', 'time'],
  },
];

export const INITIAL_AUDIT_LOGS = [];

export const INITIAL_GENERAL_SETTINGS = {
  platformName: 'GymPilot SaaS',
  supportEmail: 'support@gympilot.fit',
  systemTimeZone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  sessionTimeoutMinutes: 60,
  require2FAForSuperAdmins: true,
  require2FAForGymOwners: false,
  maintenanceMode: false,
  allowNewRegistrations: true,
  enableWhatsAppAlerts: true,
  enableAutoBackups: true,
  backupFrequency: 'Daily (02:00 AM UTC)',
  dataRetentionMonths: 24,
  maxBranchesDefault: 3,
  maxMembersDefault: 1000,
  freeTrialDaysDefault: 14,
};

export const INITIAL_ADMIN_PROFILE = {
  fullName: 'Super Admin',
  email: 'admin@gympilot.fit',
  mobile: '+1 (415) 555-0101',
  role: 'Super Admin',
  title: 'Platform Administrator',
  timezone: 'PST (UTC-8)',
  twoFactorEnabled: true,
  lastPasswordChange: '2026-10-15',
};

export const INITIAL_ACTIVE_SESSIONS = [];
