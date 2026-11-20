import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_MEMBERS,
  MEMBER_MEDIA,
  MEMBERSHIP_PLAN_CATALOG,
} from '../constants/memberManagementData';
import { useBranchManagement } from './BranchManagementContext';
import { useTenant } from './TenantContext';

const STORAGE_KEY = 'GymPilot_members_v2';

function readStoredMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addMonthsToDate(dateStr, months) {
  const base = dateStr ? new Date(dateStr) : new Date('2026-11-19');
  if (Number.isNaN(base.getTime())) return '2027-11-19';
  const copy = new Date(base);
  copy.setMonth(copy.getMonth() + months);
  return copy.toISOString().slice(0, 10);
}

const MemberManagementContext = createContext(null);

export function MemberManagementProvider({ children }) {
  const { activeTenant, activeBranch } = useTenant();
  const { tenantBranches } = useBranchManagement();

  const [members, setMembers] = useState(readStoredMembers);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      // Ignore storage quota errors
    }
  }, [members]);

  const tenantMembers = useMemo(
    () => members.filter((m) => m.tenantId === activeTenant.id),
    [members, activeTenant.id]
  );

  const scopedMembers = useMemo(() => {
    if (!activeBranch || activeBranch.id === 'all') return tenantMembers;
    return tenantMembers.filter(
      (m) => m.branchId === activeBranch.id || m.branchName === activeBranch.name
    );
  }, [tenantMembers, activeBranch]);

  const getMemberById = useCallback(
    (id) => members.find((m) => m.id === id && m.tenantId === activeTenant.id) || null,
    [members, activeTenant.id]
  );

  const registerMember = useCallback(
    (formData, options = { asDraft: false, collectPayment: false }) => {
      const selectedBranch =
        tenantBranches.find((b) => b.id === formData.branchId) || tenantBranches[0];
      const planMeta =
        MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === formData.plan) ||
        MEMBERSHIP_PLAN_CATALOG[0];

      const memberId = formData.memberId?.trim() || `MEM-${Math.floor(4100 + Math.random() * 899)}`;
      const status = options.asDraft ? 'inactive' : 'active';
      const paidNow = Boolean(options.collectPayment);

      const newMember = {
        id: memberId,
        tenantId: activeTenant.id,
        branchId: selectedBranch?.id || formData.branchId || 'br_downtown',
        branchName: selectedBranch?.name || 'Downtown Flagship',
        fullName: formData.fullName.trim(),
        avatar: formData.avatar || MEMBER_MEDIA.avatarMale1,
        dob: formData.dob || '1995-01-15',
        gender: formData.gender || 'Male',
        bloodGroup: formData.bloodGroup || 'O+',
        mobile: formData.mobile.trim(),
        altMobile: formData.altMobile?.trim() || '',
        email: formData.email.trim(),
        country: formData.country || 'United States',
        state: formData.state?.trim() || '',
        city: formData.city?.trim() || '',
        area: formData.area?.trim() || '',
        fullAddress: formData.fullAddress?.trim() || '',
        pinCode: formData.pinCode?.trim() || '',
        emergencyName: formData.emergencyName?.trim() || '',
        emergencyRelation: formData.emergencyRelation?.trim() || '',
        emergencyMobile: formData.emergencyMobile?.trim() || '',
        emergencyAltMobile: formData.emergencyAltMobile?.trim() || '',
        heightCm: formData.heightCm ? Number(formData.heightCm) : null,
        weightKg: formData.weightKg ? Number(formData.weightKg) : null,
        fitnessGoal: formData.fitnessGoal?.trim() || 'General Fitness',
        experienceLevel: formData.experienceLevel || 'Beginner',
        medicalNotes: formData.medicalNotes?.trim() || '',
        preferences: formData.preferences?.trim() || '',
        joiningDate: formData.joiningDate || '2026-11-19',
        plan: planMeta.name,
        startDate: formData.startDate || '2026-11-19',
        expiryDate:
          formData.expiryDate || addMonthsToDate(formData.startDate || '2026-11-19', planMeta.durationMonths),
        monthlyFee: planMeta.price,
        status,
        paymentStatus: paidNow ? 'paid' : 'pending',
        referralSource: formData.referralSource || 'Walk-in',
        referredBy: formData.referredBy?.trim() || '',
        notes: formData.notes?.trim() || '',
        termsAccepted: Boolean(formData.termsAccepted),
        documents: {
          profilePhoto: formData.avatar ? 'profile_photo.jpg' : '',
          identityProof: formData.identityProof || '',
          addressProof: formData.addressProof || '',
          medicalCertificate: formData.medicalCertificate || '',
          otherDocs: formData.otherDocs || [],
        },
        lastVisit: 'Not checked in yet',
        totalVisits: 0,
        monthlyAttendance: 0,
        totalPaid: paidNow ? planMeta.price : 0,
        pendingDues: paidNow ? 0 : planMeta.price,
        membershipHistory: [
          {
            id: `MH-${Date.now()}`,
            plan: planMeta.name,
            startDate: formData.startDate || '2026-11-19',
            endDate:
              formData.expiryDate ||
              addMonthsToDate(formData.startDate || '2026-11-19', planMeta.durationMonths),
            fee: planMeta.price,
            status,
          },
        ],
        attendanceHistory: [],
        payments: paidNow
          ? [
            {
              id: `INV-${Math.floor(10000 + Math.random() * 89999)}`,
              date: '2026-11-19',
              amount: planMeta.price,
              method: 'UPI',
              plan: planMeta.name,
              status: 'paid',
            },
          ]
          : [],
        progressHistory: formData.weightKg
          ? [
            {
              month: 'Nov',
              weight: Number(formData.weightKg),
              bmi: formData.heightCm
                ? Number(
                  (
                    Number(formData.weightKg) /
                    Math.pow(Number(formData.heightCm) / 100, 2)
                  ).toFixed(1)
                )
                : null,
              bodyFat: null,
              chest: null,
              waist: null,
              hip: null,
              arm: null,
            },
          ]
          : [],
        transferHistory: [],
        activityHistory: [
          {
            id: `ACT-${Date.now()}`,
            type: 'registration',
            title: options.asDraft ? 'Member saved as draft' : 'Member registered',
            detail: `Enrolled in ${planMeta.name} at ${selectedBranch?.name || 'Branch'}`,
            timestamp: 'Just now',
          },
        ],
      };

      setMembers((prev) => [newMember, ...prev]);
      return newMember;
    },
    [activeTenant.id, tenantBranches]
  );

  const updateMember = useCallback(
    (id, formData) => {
      const selectedBranch =
        tenantBranches.find((b) => b.id === formData.branchId) || tenantBranches[0];
      const planMeta =
        MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === formData.plan) ||
        MEMBERSHIP_PLAN_CATALOG[0];

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            fullName: formData.fullName.trim(),
            avatar: formData.avatar || m.avatar,
            dob: formData.dob || m.dob,
            gender: formData.gender || m.gender,
            bloodGroup: formData.bloodGroup || m.bloodGroup,
            mobile: formData.mobile.trim(),
            altMobile: formData.altMobile?.trim() || '',
            email: formData.email.trim(),
            country: formData.country || m.country,
            state: formData.state?.trim() || '',
            city: formData.city?.trim() || '',
            area: formData.area?.trim() || '',
            fullAddress: formData.fullAddress?.trim() || '',
            pinCode: formData.pinCode?.trim() || '',
            emergencyName: formData.emergencyName?.trim() || '',
            emergencyRelation: formData.emergencyRelation?.trim() || '',
            emergencyMobile: formData.emergencyMobile?.trim() || '',
            emergencyAltMobile: formData.emergencyAltMobile?.trim() || '',
            heightCm: formData.heightCm ? Number(formData.heightCm) : null,
            weightKg: formData.weightKg ? Number(formData.weightKg) : null,
            fitnessGoal: formData.fitnessGoal?.trim() || '',
            experienceLevel: formData.experienceLevel || m.experienceLevel,
            medicalNotes: formData.medicalNotes?.trim() || '',
            preferences: formData.preferences?.trim() || '',
            branchId: selectedBranch?.id || m.branchId,
            branchName: selectedBranch?.name || m.branchName,
            joiningDate: formData.joiningDate || m.joiningDate,
            plan: planMeta.name,
            startDate: formData.startDate || m.startDate,
            expiryDate: formData.expiryDate || m.expiryDate,
            monthlyFee: planMeta.price,
            referralSource: formData.referralSource || m.referralSource,
            referredBy: formData.referredBy?.trim() || '',
            notes: formData.notes?.trim() || '',
            documents: {
              profilePhoto: formData.avatar ? 'profile_photo.jpg' : m.documents?.profilePhoto || '',
              identityProof: formData.identityProof ?? m.documents?.identityProof ?? '',
              addressProof: formData.addressProof ?? m.documents?.addressProof ?? '',
              medicalCertificate: formData.medicalCertificate ?? m.documents?.medicalCertificate ?? '',
              otherDocs: formData.otherDocs ?? m.documents?.otherDocs ?? [],
            },
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'profile',
                title: 'Profile details updated',
                detail: 'Updated personal, contact, or fitness records.',
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id, tenantBranches]
  );

  const updateMemberStatus = useCallback(
    (id, nextStatus) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            status: nextStatus,
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'membership',
                title: `Member status changed to ${nextStatus.replace('_', ' ')}`,
                detail: `Previous status: ${m.status}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const renewMembership = useCallback(
    (id, { planName, durationMonths = 12, amount, method = 'Online Card' }) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          const start = '2026-11-19';
          const end = addMonthsToDate(start, Number(durationMonths) || 12);
          const fee = Number(amount) || m.monthlyFee || 165;
          return {
            ...m,
            plan: planName || m.plan,
            startDate: start,
            expiryDate: end,
            monthlyFee: fee,
            status: 'active',
            paymentStatus: 'paid',
            pendingDues: 0,
            totalPaid: (m.totalPaid || 0) + fee,
            membershipHistory: [
              {
                id: `MH-${Date.now()}`,
                plan: planName || m.plan,
                startDate: start,
                endDate: end,
                fee,
                status: 'active',
              },
              ...(m.membershipHistory || []),
            ],
            payments: [
              {
                id: `INV-${Math.floor(10000 + Math.random() * 89999)}`,
                date: start,
                amount: fee,
                method,
                plan: planName || m.plan,
                status: 'paid',
              },
              ...(m.payments || []),
            ],
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'membership',
                title: `Membership renewed (${planName || m.plan})`,
                detail: `Valid until ${end} · Paid ₹${fee} via ${method}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const collectMemberPayment = useCallback(
    (id, { amount, method = 'UPI' }) => {
      const amt = Number(amount) || 0;
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          const nextPending = Math.max(0, (m.pendingDues || 0) - amt);
          return {
            ...m,
            totalPaid: (m.totalPaid || 0) + amt,
            pendingDues: nextPending,
            paymentStatus: nextPending === 0 ? 'paid' : 'pending',
            payments: [
              {
                id: `INV-${Math.floor(10000 + Math.random() * 89999)}`,
                date: '2026-11-19',
                amount: amt,
                method,
                plan: m.plan,
                status: 'paid',
              },
              ...(m.payments || []),
            ],
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'payment',
                title: `Payment collected (₹${amt.toFixed(2)})`,
                detail: `Settled via ${method}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const markMemberAttendance = useCallback(
    (id) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...m,
            lastVisit: `2026-11-19 · ${nowTime}`,
            totalVisits: (m.totalVisits || 0) + 1,
            monthlyAttendance: (m.monthlyAttendance || 0) + 1,
            attendanceHistory: [
              {
                id: `A-${Date.now()}`,
                date: '2026-11-19',
                checkIn: nowTime,
                checkOut: 'Inside',
                branch: m.branchName,
                session: 'Front-Desk Check-in',
              },
              ...(m.attendanceHistory || []),
            ],
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'attendance',
                title: `Checked in at ${m.branchName}`,
                detail: `Front-desk check-in recorded at ${nowTime}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const sendMemberNotification = useCallback(
    (id, { title, message }) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'notification',
                title: `Notification sent: ${title}`,
                detail: message,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const transferMemberBranch = useCallback(
    (id, { destinationBranchId, transferDate, reason }) => {
      // Strictly enforce same-tenant branch transfer
      const destBranch = tenantBranches.find(
        (b) => b.id === destinationBranchId && b.tenantId === activeTenant.id
      );
      if (!destBranch) return false;

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            branchId: destBranch.id,
            branchName: destBranch.name,
            transferHistory: [
              {
                id: `TRF-${Date.now()}`,
                fromBranch: m.branchName,
                toBranch: destBranch.name,
                date: transferDate || '2026-11-19',
                reason: reason?.trim() || 'Authorized branch transfer',
              },
              ...(m.transferHistory || []),
            ],
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'profile',
                title: `Transferred to ${destBranch.name}`,
                detail: `From ${m.branchName} · ${reason?.trim() || 'Branch transfer'}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
      return true;
    },
    [activeTenant.id, tenantBranches]
  );

  const addMemberProgressEntry = useCallback(
    (id, entry) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          return {
            ...m,
            weightKg: entry.weight ?? m.weightKg,
            progressHistory: [...(m.progressHistory || []), entry],
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'profile',
                title: 'Fitness progress log added',
                detail: `${entry.month}: ${entry.weight ? `${entry.weight} kg` : 'Measurements updated'}`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const updateMemberDocument = useCallback(
    (id, fieldKey, docValue) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id || m.tenantId !== activeTenant.id) return m;
          const nextDocs = { ...(m.documents || {}), [fieldKey]: docValue };
          return {
            ...m,
            documents: nextDocs,
            activityHistory: [
              {
                id: `ACT-${Date.now()}`,
                type: 'profile',
                title: docValue ? 'Document uploaded' : 'Document removed',
                detail: `${fieldKey} updated in member vault`,
                timestamp: 'Just now',
              },
              ...(m.activityHistory || []),
            ],
          };
        })
      );
    },
    [activeTenant.id]
  );

  const deleteMember = useCallback(
    (id) => {
      setMembers((prev) =>
        prev.filter((m) => !(m.id === id && m.tenantId === activeTenant.id))
      );
    },
    [activeTenant.id]
  );

  const value = useMemo(
    () => ({
      tenantMembers,
      scopedMembers,
      getMemberById,
      registerMember,
      updateMember,
      updateMemberStatus,
      renewMembership,
      collectMemberPayment,
      markMemberAttendance,
      sendMemberNotification,
      transferMemberBranch,
      addMemberProgressEntry,
      updateMemberDocument,
      deleteMember,
    }),
    [
      tenantMembers,
      scopedMembers,
      getMemberById,
      registerMember,
      updateMember,
      updateMemberStatus,
      renewMembership,
      collectMemberPayment,
      markMemberAttendance,
      sendMemberNotification,
      transferMemberBranch,
      addMemberProgressEntry,
      updateMemberDocument,
      deleteMember,
    ]
  );

  return (
    <MemberManagementContext.Provider value={value}>
      {children}
    </MemberManagementContext.Provider>
  );
}

export function useMemberManagement() {
  const ctx = useContext(MemberManagementContext);
  if (!ctx) {
    throw new Error('useMemberManagement must be used within a MemberManagementProvider');
  }
  return ctx;
}
