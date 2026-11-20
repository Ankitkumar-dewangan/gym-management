import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_PLANS,
  INITIAL_REFUNDS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from '../constants/subscriptionData';

const STORAGE_KEY = 'GymPilot_super_admin_subscriptions_v2';

const SubscriptionContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          plans: Array.isArray(parsed.plans) ? parsed.plans : [],
          subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          refunds: Array.isArray(parsed.refunds) ? parsed.refunds : [],
        };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    plans: [],
    subscriptions: [],
    transactions: [],
    refunds: [],
  };
}

export function SubscriptionProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write errors
    }
  }, [state]);

  const { plans, subscriptions, transactions, refunds } = state;

  // --- Plans CRUD ---
  const getPlanById = useCallback(
    (id) => plans.find((p) => p.id === id) || null,
    [plans]
  );

  const createPlan = useCallback((payload, options = { asDraft: false }) => {
    const id = `plan_${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const newPlan = {
      id,
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      description: payload.description.trim(),
      badge: payload.badge?.trim() || '',
      displayOrder: Number(payload.displayOrder) || 99,
      monthlyPrice: Number(payload.monthlyPrice) || 0,
      yearlyPrice: Number(payload.yearlyPrice) || 0,
      yearlyDiscount: Number(payload.yearlyDiscount) || 0,
      setupFee: Number(payload.setupFee) || 0,
      trialDays: Number(payload.trialDays) || 0,
      limits: {
        maxBranches: payload.unlimitedBranches ? -1 : Number(payload.maxBranches) || 1,
        maxMembers: payload.unlimitedMembers ? -1 : Number(payload.maxMembers) || 100,
        maxTrainers: payload.unlimitedTrainers ? -1 : Number(payload.maxTrainers) || 3,
        maxStaff: Number(payload.maxStaff) || 5,
        storageGb: Number(payload.storageGb) || 10,
        unlimitedBranches: Boolean(payload.unlimitedBranches),
        unlimitedMembers: Boolean(payload.unlimitedMembers),
        unlimitedTrainers: Boolean(payload.unlimitedTrainers),
      },
      features: payload.features || [],
      highlights: payload.highlights || [],
      status: options.asDraft ? 'draft' : payload.status || 'active',
      isFeatured: Boolean(payload.isFeatured),
      isPublic: payload.isPublic !== false,
      createdAt: today,
    };

    setState((prev) => ({
      ...prev,
      plans: [...prev.plans, newPlan].sort((a, b) => a.displayOrder - b.displayOrder),
    }));
    return newPlan;
  }, []);

  const updatePlan = useCallback((id, payload) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans
        .map((p) =>
          p.id === id
            ? {
              ...p,
              name: payload.name.trim(),
              code: payload.code.trim().toUpperCase(),
              description: payload.description.trim(),
              badge: payload.badge?.trim() || '',
              displayOrder: Number(payload.displayOrder) || p.displayOrder,
              monthlyPrice: Number(payload.monthlyPrice) || 0,
              yearlyPrice: Number(payload.yearlyPrice) || 0,
              yearlyDiscount: Number(payload.yearlyDiscount) || 0,
              setupFee: Number(payload.setupFee) || 0,
              trialDays: Number(payload.trialDays) || 0,
              limits: {
                maxBranches: payload.unlimitedBranches ? -1 : Number(payload.maxBranches) || 1,
                maxMembers: payload.unlimitedMembers ? -1 : Number(payload.maxMembers) || 100,
                maxTrainers: payload.unlimitedTrainers ? -1 : Number(payload.maxTrainers) || 3,
                maxStaff: Number(payload.maxStaff) || 5,
                storageGb: Number(payload.storageGb) || 10,
                unlimitedBranches: Boolean(payload.unlimitedBranches),
                unlimitedMembers: Boolean(payload.unlimitedMembers),
                unlimitedTrainers: Boolean(payload.unlimitedTrainers),
              },
              features: payload.features || [],
              status: payload.status || p.status,
              isFeatured: Boolean(payload.isFeatured),
              isPublic: payload.isPublic !== false,
            }
            : p
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  }, []);

  const duplicatePlan = useCallback((planId) => {
    setState((prev) => {
      const source = prev.plans.find((p) => p.id === planId);
      if (!source) return prev;
      const copy = {
        ...source,
        id: `plan_${Date.now()}`,
        name: `${source.name} Copy`,
        code: `${source.code}-COPY`,
        status: 'draft',
        isFeatured: false,
        displayOrder: prev.plans.length + 1,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...prev, plans: [...prev.plans, copy] };
    });
  }, []);

  const togglePlanStatus = useCallback((planId) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans.map((p) =>
        p.id === planId
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      ),
    }));
  }, []);

  const deletePlan = useCallback((planId) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== planId),
    }));
  }, []);

  // --- Subscription Lifecycle Actions ---
  const getSubscriptionById = useCallback(
    (id) => subscriptions.find((s) => s.id === id) || null,
    [subscriptions]
  );

  const changeSubscriptionPlan = useCallback((subId, planId, billingCycle) => {
    setState((prev) => {
      const plan = prev.plans.find((p) => p.id === planId || p.name === planId);
      if (!plan) return prev;
      const today = new Date().toISOString().slice(0, 10);

      return {
        ...prev,
        subscriptions: prev.subscriptions.map((sub) => {
          if (sub.id !== subId) return sub;
          const cycle = billingCycle || sub.billingCycle || 'Monthly';
          const amount = cycle === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          return {
            ...sub,
            planId: plan.id,
            planName: plan.name,
            billingCycle: cycle,
            amount,
            activityHistory: [
              {
                id: `sa_${Date.now()}`,
                action: `Plan changed to ${plan.name} (${cycle} · ₹${amount})`,
                actor: 'Elena Vance (Super Admin)',
                date: today,
              },
              ...(sub.activityHistory || []),
            ],
          };
        }),
      };
    });
  }, []);

  const extendSubscription = useCallback((subId, extraDays = 30) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub;
        const base = new Date(sub.expiryDate || Date.now());
        base.setDate(base.getDate() + Number(extraDays));
        const nextDate = base.toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);

        return {
          ...sub,
          nextRenewalDate: nextDate,
          expiryDate: nextDate,
          activityHistory: [
            {
              id: `sa_${Date.now()}`,
              action: `Subscription extended by ${extraDays} days (until ${nextDate})`,
              actor: 'Elena Vance (Super Admin)',
              date: today,
            },
            ...(sub.activityHistory || []),
          ],
        };
      }),
    }));
  }, []);

  const renewSubscription = useCallback((subId) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub;
        const base = new Date(Math.max(Date.now(), new Date(sub.expiryDate || Date.now()).getTime()));
        base.setDate(base.getDate() + (sub.billingCycle === 'Yearly' ? 365 : 30));
        const nextDate = base.toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);

        return {
          ...sub,
          status: 'active',
          paymentStatus: 'paid',
          outstandingAmount: 0,
          lastPaymentDate: today,
          nextRenewalDate: nextDate,
          expiryDate: nextDate,
          activityHistory: [
            {
              id: `sa_${Date.now()}`,
              action: `Subscription renewed (${sub.planName} · next renewal ${nextDate})`,
              actor: 'Elena Vance (Super Admin)',
              date: today,
            },
            ...(sub.activityHistory || []),
          ],
        };
      }),
    }));
  }, []);

  const cancelSubscription = useCallback((subId, reason = 'Cancelled by Super Admin') => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) =>
        sub.id === subId
          ? {
            ...sub,
            status: 'cancelled',
            activityHistory: [
              {
                id: `sa_${Date.now()}`,
                action: `Subscription cancelled — ${reason}`,
                actor: 'Elena Vance (Super Admin)',
                date: today,
              },
              ...(sub.activityHistory || []),
            ],
          }
          : sub
      ),
    }));
  }, []);

  const sendRenewalReminder = useCallback((subId) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) =>
        sub.id === subId
          ? {
            ...sub,
            reminderSent: true,
            activityHistory: [
              {
                id: `sa_${Date.now()}`,
                action: 'Renewal reminder notification sent to gym owner',
                actor: 'Notification Service',
                date: today,
              },
              ...(sub.activityHistory || []),
            ],
          }
          : sub
      ),
    }));
  }, []);

  const extendTrial = useCallback((subId, extraDays = 7) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub;
        const base = new Date(sub.expiryDate || Date.now());
        base.setDate(base.getDate() + Number(extraDays));
        const nextDate = base.toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);

        return {
          ...sub,
          nextRenewalDate: nextDate,
          expiryDate: nextDate,
          activityHistory: [
            {
              id: `sa_${Date.now()}`,
              action: `Free trial extended by ${extraDays} days (ends ${nextDate})`,
              actor: 'Elena Vance (Super Admin)',
              date: today,
            },
            ...(sub.activityHistory || []),
          ],
        };
      }),
    }));
  }, []);

  const convertTrialToPaid = useCallback((subId) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub;
        const next = new Date();
        next.setDate(next.getDate() + (sub.billingCycle === 'Yearly' ? 365 : 30));
        const nextDate = next.toISOString().slice(0, 10);
        return {
          ...sub,
          status: 'active',
          paymentStatus: 'paid',
          conversionStatus: 'Converted',
          lastPaymentDate: today,
          nextRenewalDate: nextDate,
          expiryDate: nextDate,
          activityHistory: [
            {
              id: `sa_${Date.now()}`,
              action: `Trial converted to paid ${sub.planName} subscription`,
              actor: 'Elena Vance (Super Admin)',
              date: today,
            },
            ...(sub.activityHistory || []),
          ],
        };
      }),
    }));
  }, []);

  const endTrial = useCallback((subId) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) =>
        sub.id === subId
          ? {
            ...sub,
            status: 'expired',
            conversionStatus: 'Ended',
            expiryDate: today,
            activityHistory: [
              {
                id: `sa_${Date.now()}`,
                action: 'Free trial ended early by Super Admin',
                actor: 'Elena Vance (Super Admin)',
                date: today,
              },
              ...(sub.activityHistory || []),
            ],
          }
          : sub
      ),
    }));
  }, []);

  // --- Refunds ---
  const updateRefundStatus = useCallback((refundId, nextStatus) => {
    setState((prev) => ({
      ...prev,
      refunds: prev.refunds.map((r) =>
        r.id === refundId ? { ...r, status: nextStatus } : r
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      plans,
      subscriptions,
      transactions,
      refunds,
      getPlanById,
      createPlan,
      updatePlan,
      duplicatePlan,
      togglePlanStatus,
      deletePlan,
      getSubscriptionById,
      changeSubscriptionPlan,
      extendSubscription,
      renewSubscription,
      cancelSubscription,
      sendRenewalReminder,
      extendTrial,
      convertTrialToPaid,
      endTrial,
      updateRefundStatus,
    }),
    [
      plans,
      subscriptions,
      transactions,
      refunds,
      getPlanById,
      createPlan,
      updatePlan,
      duplicatePlan,
      togglePlanStatus,
      deletePlan,
      getSubscriptionById,
      changeSubscriptionPlan,
      extendSubscription,
      renewSubscription,
      cancelSubscription,
      sendRenewalReminder,
      extendTrial,
      convertTrialToPaid,
      endTrial,
      updateRefundStatus,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return ctx;
}
