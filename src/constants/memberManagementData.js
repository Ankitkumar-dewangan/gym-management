import { BRANCH_MEDIA } from './branchManagementData';

export const MEMBER_MEDIA = {
  avatarMale1: BRANCH_MEDIA?.memberMaleAvatar || '',
  avatarFemale1: '',
  avatarSeniorMale: '',
  avatarCoachMember: BRANCH_MEDIA?.coachMemberAvatar || '',
  avatarTrainerFemale: BRANCH_MEDIA?.trainerAvatar || '',
  avatarPortrait: BRANCH_MEDIA?.portraitAvatar || '',
  progressAfter: '',
  progressBefore: '',
};

export const MEMBERSHIP_PLAN_CATALOG = [
  { name: 'Annual Unlimited', durationMonths: 12, price: 165, billing: 'Monthly Auto-Pay' },
  { name: 'Strength + Recovery', durationMonths: 6, price: 195, billing: '6-Month Commitment' },
  { name: 'Coaching Tier 2', durationMonths: 3, price: 290, billing: 'Quarterly Coaching' },
  { name: 'Quarterly Performance', durationMonths: 3, price: 150, billing: 'Quarterly' },
  { name: 'Monthly Open Gym', durationMonths: 1, price: 120, billing: 'Month-to-Month' },
];

export const MEMBER_GROWTH_SERIES = [];

export const MEMBER_DATE_RANGES = [
  { key: '7d', label: 'Last 7 Days', scale: 0.28 },
  { key: '30d', label: 'Last 30 Days', scale: 1 },
  { key: '90d', label: 'Last 3 Months', scale: 2.6 },
  { key: '1y', label: 'This Year', scale: 9.5 },
];

export const INITIAL_MEMBERS = [];
