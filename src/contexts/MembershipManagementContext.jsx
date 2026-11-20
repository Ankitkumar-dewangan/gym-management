import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_MEMBERSHIP_OFFERS,
  INITIAL_MEMBERSHIP_PLANS,
  INITIAL_MEMBERSHIPS,
} from '../constants/membershipManagementData';
import {
  calculateExpiryDate,
  calculateFreezeDurationDays,
  calculateOfferDiscountAmount,
  calculatePlanChangeAdjustment,
  calculatePlanPricing,
  calculateReviewedFreezeExpiry,
  REFERENCE_TODAY,
} from '../utils/membershipCalculations';
import { useBranchManagement } from './BranchManagementContext';
import { useMemberManagement } from './MemberManagementContext';
import { useTenant } from './TenantContext';

const PLANS_STORAGE_KEY = 'GymPilot_membership_plans_v2';
const MEMBERSHIPS_STORAGE_KEY = 'GymPilot_memberships_v2';
const OFFERS_STORAGE_KEY = 'GymPilot_membership_offers_v2';

function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const MembershipManagementContext = createContext(null);

export function MembershipManagementProvider({ children }) {
  const { activeTenant, activeBranch } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();

  const [plans, setPlans] = useState(() => readStorage(PLANS_STORAGE_KEY, []));
  const [memberships, setMemberships] = useState(() =>
    readStorage(MEMBERSHIPS_STORAGE_KEY, [])
  );
  const [offers, setOffers] = useState(() => readStorage(OFFERS_STORAGE_KEY, []));

  useEffect(() => {
    try {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Ignore storage quota errors
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(MEMBERSHIPS_STORAGE_KEY, JSON.stringify(memberships));
    } catch {
      // Ignore storage quota errors
    }
  }, [memberships]);

  useEffect(() => {
    try {
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    } catch {
      // Ignore storage quota errors
    }
  }, [offers]);

  const tenantPlans = useMemo(
    () => plans.filter((p) => p.tenantId === activeTenant.id),
    [plans, activeTenant.id]
  );

  const tenantOffers = useMemo(
    () => offers.filter((o) => o.tenantId === activeTenant.id),
    [offers, activeTenant.id]
  );

  const tenantMemberships = useMemo(
    () => memberships.filter((m) => m.tenantId === activeTenant.id),
    [memberships, activeTenant.id]
  );

  const scopedMemberships = useMemo(() => {
    if (!activeBranch || activeBranch.id === 'all') return tenantMemberships;
    return tenantMemberships.filter(
      (m) => m.branchId === activeBranch.id || m.branchName === activeBranch.name
    );
  }, [tenantMemberships, activeBranch]);

  const getPlanById = useCallback(
    (id) => plans.find((p) => p.id === id && p.tenantId === activeTenant.id) || null,
    [plans, activeTenant.id]
  );

  const getMembershipById = useCallback(
    (id) => memberships.find((m) => m.id === id && m.tenantId === activeTenant.id) || null,
    [memberships, activeTenant.id]
  );

  // Plan CRUD
  const createPlan = useCallback(
    (formData, asDraft = false) => {
      const created = {
        ...formData,
        id: `plan_${Date.now()}`,
        tenantId: activeTenant.id,
        status: asDraft ? 'draft' : formData.status || 'active',
        regularPrice: Number(formData.regularPrice) || 0,
        discountPercent: Number(formData.discountPercent) || 0,
        taxPercent: Number(formData.taxPercent) || 0,
        registrationFee: Number(formData.registrationFee) || 0,
        joiningFee: Number(formData.joiningFee) || 0,
        durationDays: Number(formData.durationDays) || 30,
        dailyEntryLimit: Number(formData.dailyEntryLimit) || 1,
        allowedWorkoutSessions: Number(formData.allowedWorkoutSessions) || 30,
        personalTrainingSessions: Number(formData.personalTrainingSessions) || 0,
        maxFreezeDays: formData.freezeAllowed ? Number(formData.maxFreezeDays) || 0 : 0,
      };
      setPlans((prev) => [created, ...prev]);
      return created;
    },
    [activeTenant.id]
  );

  const updatePlan = useCallback(
    (id, formData) => {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id && p.tenantId === activeTenant.id
            ? {
              ...p,
              ...formData,
              regularPrice: Number(formData.regularPrice) || 0,
              discountPercent: Number(formData.discountPercent) || 0,
              taxPercent: Number(formData.taxPercent) || 0,
              registrationFee: Number(formData.registrationFee) || 0,
              joiningFee: Number(formData.joiningFee) || 0,
              durationDays: Number(formData.durationDays) || 30,
              dailyEntryLimit: Number(formData.dailyEntryLimit) || 1,
              allowedWorkoutSessions: Number(formData.allowedWorkoutSessions) || 30,
              personalTrainingSessions: Number(formData.personalTrainingSessions) || 0,
              maxFreezeDays: formData.freezeAllowed ? Number(formData.maxFreezeDays) || 0 : 0,
            }
            : p
        )
      );
    },
    [activeTenant.id]
  );

  const duplicatePlan = useCallback(
    (id) => {
      const source = plans.find((p) => p.id === id && p.tenantId === activeTenant.id);
      if (!source) return null;
      const copy = {
        ...source,
        id: `plan_${Date.now()}`,
        name: `${source.name} (Copy)`,
        code: `${source.code}-COPY`,
        status: 'draft',
      };
      setPlans((prev) => [copy, ...prev]);
      return copy;
    },
    [plans, activeTenant.id]
  );

  const togglePlanStatus = useCallback(
    (id) => {
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== id || p.tenantId !== activeTenant.id) return p;
          return { ...p, status: p.status === 'active' ? 'inactive' : 'active' };
        })
      );
    },
    [activeTenant.id]
  );

  const deletePlan = useCallback(
    (id) => {
      setPlans((prev) => prev.filter((p) => !(p.id === id && p.tenantId === activeTenant.id)));
    },
    [activeTenant.id]
  );

  // Membership Assignment (§8)
  const assignMembership = useCallback(
    ({
      memberId,
      branchId,
      planId,
      startDate,
      offerId,
      paymentStatus = 'paid',
      paidAmount,
      paymentMethod = 'Online Card',
    }) => {
      const member = tenantMembers.find((m) => m.id === memberId);
      const branch = tenantBranches.find((b) => b.id === branchId) || tenantBranches[0];
      const plan = tenantPlans.find((p) => p.id === planId) || tenantPlans[0];
      if (!member || !plan) return null;

      const pricing = calculatePlanPricing(plan);
      const offer = tenantOffers.find((o) => o.id === offerId) || null;
      const offerDiscount = offer
        ? calculateOfferDiscountAmount(pricing.totalUpfrontPayable, offer, plan.id)
        : 0;
      const finalAmount = Math.max(
        0,
        Number((pricing.totalUpfrontPayable - offerDiscount).toFixed(2))
      );

      let resolvedPaid = 0;
      if (paymentStatus === 'paid') {
        resolvedPaid = finalAmount;
      } else if (paymentStatus === 'partially_paid') {
        resolvedPaid = Math.min(finalAmount, Math.max(0, Number(paidAmount) || 0));
      }

      const pendingAmount = Math.max(0, Number((finalAmount - resolvedPaid).toFixed(2)));
      const expiryDate = calculateExpiryDate(startDate || REFERENCE_TODAY, {
        durationType: plan.durationType,
        durationDays: plan.durationDays,
      });

      const record = {
        id: `MS-${Math.floor(8100 + Math.random() * 899)}`,
        tenantId: activeTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        memberAvatar: member.avatar,
        memberEmail: member.email,
        memberMobile: member.mobile,
        branchId: branch?.id || member.branchId,
        branchName: branch?.name || member.branchName,
        planId: plan.id,
        planName: plan.name,
        planCategory: plan.category,
        durationType: plan.durationType,
        durationDays: plan.durationDays,
        startDate: startDate || REFERENCE_TODAY,
        expiryDate,
        regularPrice: pricing.regularPrice,
        discountAmount: Number((pricing.discountAmount + offerDiscount).toFixed(2)),
        offerCode: offer?.code || '',
        taxAmount: pricing.taxAmount,
        registrationFee: pricing.registrationFee,
        joiningFee: pricing.joiningFee,
        finalAmount,
        paidAmount: resolvedPaid,
        pendingAmount,
        paymentStatus,
        status: 'active',
        reminderStatus: 'Not Needed',
        allowedFreezeDays: plan.freezeAllowed ? plan.maxFreezeDays : 0,
        usedFreezeDays: 0,
        freezeHistory: [],
        renewalHistory: [],
        paymentHistory:
          resolvedPaid > 0
            ? [
              {
                id: `TXN-${Date.now()}`,
                date: startDate || REFERENCE_TODAY,
                amount: resolvedPaid,
                method: paymentMethod,
                status: 'paid',
                note: `${plan.name} assignment`,
              },
            ]
            : [],
        activityHistory: [
          {
            id: `MA-${Date.now()}`,
            type: 'assignment',
            title: `Assigned ${plan.name}`,
            detail: `${branch?.name || member.branchName} · Valid through ${expiryDate}`,
            timestamp: startDate || REFERENCE_TODAY,
          },
        ],
      };

      setMemberships((prev) => [record, ...prev]);
      if (offer) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, usedCount: (o.usedCount || 0) + 1 } : o))
        );
      }
      return record;
    },
    [activeTenant.id, tenantMembers, tenantBranches, tenantPlans, tenantOffers]
  );

  // Renewal Management (§12 - never overwrite old records; append to renewalHistory)
  const renewMembershipRecord = useCallback(
    (membershipId, { planId, renewalDate = REFERENCE_TODAY, offerId, paymentMethod = 'Online Card', customDiscount = 0 }) => {
      const targetPlan = tenantPlans.find((p) => p.id === planId) || null;
      const offer = tenantOffers.find((o) => o.id === offerId) || null;

      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          const activePlan =
            targetPlan ||
            tenantPlans.find((p) => p.id === m.planId) || {
              id: m.planId,
              name: m.planName,
              category: m.planCategory,
              durationType: m.durationType,
              durationDays: m.durationDays,
              regularPrice: m.regularPrice,
              discountPercent: 0,
              taxPercent: 8,
              registrationFee: 0,
              joiningFee: 0,
              freezeAllowed: m.allowedFreezeDays > 0,
              maxFreezeDays: m.allowedFreezeDays,
            };

          const pricing = calculatePlanPricing({
            ...activePlan,
            registrationFee: 0,
            joiningFee: 0,
          });
          const offerDisc = offer
            ? calculateOfferDiscountAmount(pricing.finalPlanPrice, offer, activePlan.id)
            : 0;
          const extraDisc = Math.max(0, Number(customDiscount) || 0);
          const finalAmount = Math.max(
            0,
            Number((pricing.finalPlanPrice - offerDisc - extraDisc).toFixed(2))
          );

          const newExpiry = calculateExpiryDate(renewalDate, {
            durationType: activePlan.durationType,
            durationDays: activePlan.durationDays,
          });

          const renewalEntry = {
            id: `REN-${Date.now()}`,
            previousPlan: m.planName,
            newPlan: activePlan.name,
            renewalDate,
            previousExpiry: m.expiryDate,
            newExpiry,
            amount: finalAmount,
            type: activePlan.id !== m.planId ? 'Plan Renewal & Change' : 'Renewal',
          };

          const txn = {
            id: `TXN-${Date.now()}`,
            date: renewalDate,
            amount: finalAmount,
            method: paymentMethod,
            status: 'paid',
            note: `Renewed ${activePlan.name}`,
          };

          return {
            ...m,
            planId: activePlan.id,
            planName: activePlan.name,
            planCategory: activePlan.category,
            durationType: activePlan.durationType,
            durationDays: activePlan.durationDays,
            startDate: renewalDate,
            expiryDate: newExpiry,
            regularPrice: pricing.regularPrice,
            discountAmount: Number((pricing.discountAmount + offerDisc + extraDisc).toFixed(2)),
            offerCode: offer?.code || '',
            taxAmount: pricing.taxAmount,
            finalAmount,
            paidAmount: Number(((m.paidAmount || 0) + finalAmount).toFixed(2)),
            pendingAmount: 0,
            paymentStatus: 'paid',
            status: 'active',
            reminderStatus: 'Not Needed',
            allowedFreezeDays: activePlan.freezeAllowed ? activePlan.maxFreezeDays : 0,
            renewalHistory: [renewalEntry, ...(m.renewalHistory || [])],
            paymentHistory: [txn, ...(m.paymentHistory || [])],
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: 'renewal',
                title: `Renewed to ${activePlan.name}`,
                detail: `Previous expiry ${m.expiryDate} → New expiry ${newExpiry}`,
                timestamp: renewalDate,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id, tenantPlans, tenantOffers]
  );

  // Upgrade / Downgrade (§13)
  const changeMembershipPlan = useCallback(
    (membershipId, { newPlanId, effectiveDate = REFERENCE_TODAY, paymentMethod = 'Online Card' }) => {
      const nextPlan = tenantPlans.find((p) => p.id === newPlanId);
      if (!nextPlan) return;

      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          const calc = calculatePlanChangeAdjustment({
            currentMembership: m,
            newPlan: nextPlan,
            effectiveDate,
          });
          const payable = Math.max(0, calc.adjustmentAmount);
          const isUpgrade = calc.changeType === 'upgrade';

          return {
            ...m,
            planId: nextPlan.id,
            planName: nextPlan.name,
            planCategory: nextPlan.category,
            durationType: nextPlan.durationType,
            durationDays: nextPlan.durationDays,
            startDate: effectiveDate,
            expiryDate: calc.newExpiryDate,
            regularPrice: nextPlan.regularPrice,
            finalAmount: calc.newPrice,
            paidAmount: Number(((m.paidAmount || 0) + payable).toFixed(2)),
            pendingAmount: 0,
            paymentStatus: 'paid',
            status: 'active',
            allowedFreezeDays: nextPlan.freezeAllowed ? nextPlan.maxFreezeDays : 0,
            renewalHistory: [
              {
                id: `REN-${Date.now()}`,
                previousPlan: m.planName,
                newPlan: nextPlan.name,
                renewalDate: effectiveDate,
                previousExpiry: m.expiryDate,
                newExpiry: calc.newExpiryDate,
                amount: payable,
                type: isUpgrade ? 'Upgrade' : calc.changeType === 'downgrade' ? 'Downgrade' : 'Plan Switch',
              },
              ...(m.renewalHistory || []),
            ],
            paymentHistory:
              payable > 0
                ? [
                  {
                    id: `TXN-${Date.now()}`,
                    date: effectiveDate,
                    amount: payable,
                    method: paymentMethod,
                    status: 'paid',
                    note: `${isUpgrade ? 'Upgrade' : 'Plan change'} adjustment (${m.planName} → ${nextPlan.name})`,
                  },
                  ...(m.paymentHistory || []),
                ]
                : m.paymentHistory || [],
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: isUpgrade ? 'upgrade' : 'downgrade',
                title: `${isUpgrade ? 'Upgraded' : 'Downgraded'} plan: ${m.planName} → ${nextPlan.name}`,
                detail: `Adjustment ${payable > 0 ? `₹${payable}` : '₹0 credit applied'} · Valid until ${calc.newExpiryDate}`,
                timestamp: effectiveDate,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id, tenantPlans]
  );

  // Freeze / Resume (§14)
  const freezeMembership = useCallback(
    (membershipId, { freezeStartDate, freezeEndDate, reason, applyExpiryExtension = true }) => {
      const days = calculateFreezeDurationDays(freezeStartDate, freezeEndDate);
      if (days <= 0) return false;

      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          const remaining = Math.max(0, (m.allowedFreezeDays || 0) - (m.usedFreezeDays || 0));
          if (days > remaining) return m;

          const adjustedExpiry = applyExpiryExtension
            ? calculateReviewedFreezeExpiry(m.expiryDate, days)
            : m.expiryDate;

          const freezeEntry = {
            id: `FRZ-${Date.now()}`,
            startDate: freezeStartDate,
            endDate: freezeEndDate,
            days,
            reason: reason?.trim() || 'Member requested freeze',
            status: 'active',
            expiryAdjustedTo: adjustedExpiry,
          };

          return {
            ...m,
            status: 'frozen',
            expiryDate: adjustedExpiry,
            usedFreezeDays: (m.usedFreezeDays || 0) + days,
            freezeHistory: [freezeEntry, ...(m.freezeHistory || [])],
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: 'freeze',
                title: `Membership frozen (${days} days)`,
                detail: `${freezeStartDate} to ${freezeEndDate} · ${freezeEntry.reason}`,
                timestamp: REFERENCE_TODAY,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
      return true;
    },
    [activeTenant.id]
  );

  const resumeMembership = useCallback(
    (membershipId) => {
      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          const updatedFreeze = (m.freezeHistory || []).map((f, idx) =>
            idx === 0 && f.status === 'active' ? { ...f, status: 'resumed' } : f
          );
          return {
            ...m,
            status: 'active',
            freezeHistory: updatedFreeze,
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: 'resume',
                title: 'Membership resumed',
                detail: `Active access restored for ${m.planName}`,
                timestamp: REFERENCE_TODAY,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  // Cancel Membership
  const cancelMembership = useCallback(
    (membershipId, reason = 'Member requested cancellation') => {
      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            status: 'cancelled',
            cancellationReason: reason?.trim() || 'Cancelled by owner',
            cancelledAt: REFERENCE_TODAY,
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: 'cancellation',
                title: 'Membership cancelled',
                detail: reason?.trim() || 'Cancelled by gym administration',
                timestamp: REFERENCE_TODAY,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const sendExpiryReminder = useCallback(
    (membershipId) => {
      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            reminderStatus: 'Sent',
            activityHistory: [
              {
                id: `MA-${Date.now()}`,
                type: 'reminder',
                title: 'Renewal reminder sent',
                detail: `Sent reminder to ${m.memberEmail} & ${m.memberMobile}`,
                timestamp: REFERENCE_TODAY,
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  // Offers CRUD (§16)
  const createOffer = useCallback(
    (offerData) => {
      const created = {
        ...offerData,
        id: `off_${Date.now()}`,
        tenantId: activeTenant.id,
        code: offerData.code.trim().toUpperCase(),
        percentageDiscount: Number(offerData.percentageDiscount) || 0,
        fixedDiscount: Number(offerData.fixedDiscount) || 0,
        maxUsage: Number(offerData.maxUsage) || 100,
        limitPerMember: Number(offerData.limitPerMember) || 1,
        usedCount: 0,
      };
      setOffers((prev) => [created, ...prev]);
      return created;
    },
    [activeTenant.id]
  );

  const updateOffer = useCallback(
    (id, offerData) => {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id && o.tenantId === activeTenant.id
            ? {
              ...o,
              ...offerData,
              code: offerData.code.trim().toUpperCase(),
              percentageDiscount: Number(offerData.percentageDiscount) || 0,
              fixedDiscount: Number(offerData.fixedDiscount) || 0,
              maxUsage: Number(offerData.maxUsage) || 100,
              limitPerMember: Number(offerData.limitPerMember) || 1,
            }
            : o
        )
      );
    },
    [activeTenant.id]
  );

  const toggleOfferStatus = useCallback(
    (id) => {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id && o.tenantId === activeTenant.id
            ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' }
            : o
        )
      );
    },
    [activeTenant.id]
  );

  const deleteOffer = useCallback(
    (id) => {
      setOffers((prev) => prev.filter((o) => !(o.id === id && o.tenantId === activeTenant.id)));
    },
    [activeTenant.id]
  );

  const value = useMemo(
    () => ({
      tenantPlans,
      tenantOffers,
      tenantMemberships,
      scopedMemberships,
      getPlanById,
      getMembershipById,
      createPlan,
      updatePlan,
      duplicatePlan,
      togglePlanStatus,
      deletePlan,
      assignMembership,
      renewMembershipRecord,
      changeMembershipPlan,
      freezeMembership,
      resumeMembership,
      cancelMembership,
      sendExpiryReminder,
      createOffer,
      updateOffer,
      toggleOfferStatus,
      deleteOffer,
    }),
    [
      tenantPlans,
      tenantOffers,
      tenantMemberships,
      scopedMemberships,
      getPlanById,
      getMembershipById,
      createPlan,
      updatePlan,
      duplicatePlan,
      togglePlanStatus,
      deletePlan,
      assignMembership,
      renewMembershipRecord,
      changeMembershipPlan,
      freezeMembership,
      resumeMembership,
      cancelMembership,
      sendExpiryReminder,
      createOffer,
      updateOffer,
      toggleOfferStatus,
      deleteOffer,
    ]
  );

  return (
    <MembershipManagementContext.Provider value={value}>
      {children}
    </MembershipManagementContext.Provider>
  );
}

export function useMembershipManagement() {
  const ctx = useContext(MembershipManagementContext);
  if (!ctx) {
    throw new Error('useMembershipManagement must be used within a MembershipManagementProvider');
  }
  return ctx;
}
