export const INITIAL_GYMS_DATA = [];

export const SUBSCRIPTION_PLAN_PRESETS = {
  Starter: {
    plan: 'Starter',
    billingCycle: 'Monthly',
    trialPeriod: '14 Days',
    maxMembers: 200,
    maxBranches: 1,
    monthlyFee: 2999,
  },
  Growth: {
    plan: 'Growth',
    billingCycle: 'Quarterly',
    trialPeriod: '14 Days',
    maxMembers: 1000,
    maxBranches: 3,
    monthlyFee: 6999,
  },
  Pro: {
    plan: 'Pro',
    billingCycle: 'Monthly',
    trialPeriod: '14 Days',
    maxMembers: 2500,
    maxBranches: 5,
    monthlyFee: 9999,
  },
  Enterprise: {
    plan: 'Enterprise',
    billingCycle: 'Annual',
    trialPeriod: '14 Days',
    maxMembers: 10000,
    maxBranches: 25,
    monthlyFee: 14999,
  },
};
