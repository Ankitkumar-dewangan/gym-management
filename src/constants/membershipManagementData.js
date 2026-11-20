import { BRANCH_MEDIA } from './branchManagementData';

export const MEMBERSHIP_MEDIA = {
  passCardBanner: '/src/assets/images/membership_pass_card_1795084857823.jpg',
  clubLounge: '',
  emptyGraphic: '',
  studioCover: BRANCH_MEDIA?.downtownCover || '',
};

export const DURATION_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly (30 Days)', defaultDays: 30 },
  { value: 'quarterly', label: 'Quarterly (90 Days)', defaultDays: 90 },
  { value: 'half_yearly', label: 'Half-Yearly (180 Days)', defaultDays: 180 },
  { value: 'yearly', label: 'Yearly (365 Days)', defaultDays: 365 },
  { value: 'custom', label: 'Custom Duration (Days)', defaultDays: 45 },
];

export const PLAN_CATEGORY_OPTIONS = [
  { value: 'Standard Access', label: 'Standard Access' },
  { value: 'Strength & Conditioning', label: 'Strength & Conditioning' },
  { value: 'Personal Coaching', label: 'Personal Coaching' },
  { value: 'All-Access VIP', label: 'All-Access VIP' },
  { value: 'Corporate Wellness', label: 'Corporate Wellness' },
];

export const PLAN_FEATURE_OPTIONS = [
  { key: 'gymAccess', label: 'Gym Access' },
  { key: 'personalTraining', label: 'Personal Training' },
  { key: 'groupClasses', label: 'Group Classes' },
  { key: 'lockerAccess', label: 'Locker Access' },
  { key: 'cardioAccess', label: 'Cardio Access' },
  { key: 'workoutPlans', label: 'Workout Plans' },
  { key: 'dietConsultation', label: 'Diet Consultation' },
];

export const INITIAL_MEMBERSHIP_PLANS = [];

export const INITIAL_MEMBERSHIP_OFFERS = [];

export const INITIAL_MEMBERSHIPS = [];

export const MEMBERSHIP_CHART_SERIES = [];
