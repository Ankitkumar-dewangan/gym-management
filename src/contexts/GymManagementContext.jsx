import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_GYMS_DATA,
  SUBSCRIPTION_PLAN_PRESETS,
} from '../constants/gymManagementData';

const STORAGE_KEY = 'GymPilot_super_admin_gyms_v2';

const GymManagementContext = createContext(null);

function loadInitialGyms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

export function GymManagementProvider({ children }) {
  const [gyms, setGyms] = useState(loadInitialGyms);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gyms));
    } catch {
      // Ignore storage write errors (e.g. quota exceeded on large base64 images)
    }
  }, [gyms]);

  const getGymById = useCallback(
    (id) => gyms.find((g) => g.id === id) || null,
    [gyms]
  );

  const createGym = useCallback((payload, options = { asDraft: false }) => {
    const id = `GYM-${Math.floor(2050 + Math.random() * 900)}`;
    const words = (payload.name || 'New Gym').trim().split(/\s+/);
    const initials = (
      (words[0]?.[0] || 'G') + (words[1]?.[0] || words[0]?.[1] || 'M')
    ).toUpperCase();

    const planPreset =
      SUBSCRIPTION_PLAN_PRESETS[payload.plan] || SUBSCRIPTION_PLAN_PRESETS.Pro;
    const today = new Date().toISOString().slice(0, 10);

    const newGym = {
      id,
      name: payload.name.trim(),
      initials,
      logoColor: '#14213D',
      logoUrl: payload.logoUrl || '',
      coverUrl: payload.coverUrl || '',
      businessEmail: payload.businessEmail.trim(),
      contactNumber: payload.contactNumber.trim(),
      alternateContact: payload.alternateContact?.trim() || '',
      website: payload.website?.trim() || '',
      gstNumber: payload.gstNumber?.trim() || '',
      owner: {
        fullName: payload.ownerFullName.trim(),
        email: payload.ownerEmail.trim(),
        mobile: payload.ownerMobile.trim(),
      },
      address: {
        country: payload.country.trim(),
        state: payload.state.trim(),
        city: payload.city.trim(),
        fullAddress: payload.fullAddress.trim(),
        pinCode: payload.pinCode.trim(),
      },
      subscription: {
        plan: payload.plan,
        billingCycle: 'Monthly',
        startDate: payload.startDate || today,
        endDate: payload.endDate || today,
        trialPeriod: payload.trialPeriod || '14 Days',
        maxMembers: Number(payload.maxMembers) || planPreset.maxMembers,
        maxBranches: Number(payload.maxBranches) || planPreset.maxBranches,
        monthlyFee: planPreset.monthlyFee,
      },
      status: options.asDraft ? 'draft' : 'pending',
      registeredAt: today,
      monthlyRevenue: 0,
      activeMembers: 0,
      totalMembers: 0,
      branches: [
        {
          id: `BR-${Math.floor(900 + Math.random() * 99)}`,
          name: payload.branchName.trim(),
          manager: payload.branchManager.trim(),
          city: payload.city.trim(),
          contact: payload.branchContact.trim(),
          address: payload.branchAddress.trim(),
          totalMembers: 0,
          status: options.asDraft ? 'inactive' : 'pending',
          openedAt: today,
        },
      ],
      members: [],
      transactions: [],
      activityLogs: [
        {
          id: `LOG-${Date.now()}`,
          action: options.asDraft
            ? 'Gym registration saved as draft'
            : 'New gym created and queued for approval',
          actor: 'Elena Vance (Super Admin)',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          type: 'status',
        },
      ],
      documents: [
        { name: 'Onboarding_Submission.pdf', size: '620 KB', verified: false },
      ],
    };

    setGyms((prev) => [newGym, ...prev]);
    return newGym;
  }, []);

  const updateGym = useCallback((id, payload) => {
    setGyms((prev) =>
      prev.map((gym) => {
        if (gym.id !== id) return gym;
        const planPreset =
          SUBSCRIPTION_PLAN_PRESETS[payload.plan] || SUBSCRIPTION_PLAN_PRESETS.Pro;
        const words = (payload.name || gym.name).trim().split(/\s+/);
        const initials = (
          (words[0]?.[0] || 'G') + (words[1]?.[0] || words[0]?.[1] || 'M')
        ).toUpperCase();

        const updatedBranches = [...gym.branches];
        if (updatedBranches.length > 0) {
          updatedBranches[0] = {
            ...updatedBranches[0],
            name: payload.branchName?.trim() || updatedBranches[0].name,
            contact: payload.branchContact?.trim() || updatedBranches[0].contact,
            address: payload.branchAddress?.trim() || updatedBranches[0].address,
            manager: payload.branchManager?.trim() || updatedBranches[0].manager,
            city: payload.city?.trim() || updatedBranches[0].city,
          };
        }

        return {
          ...gym,
          name: payload.name.trim(),
          initials,
          logoUrl: payload.logoUrl ?? gym.logoUrl,
          coverUrl: payload.coverUrl ?? gym.coverUrl,
          businessEmail: payload.businessEmail.trim(),
          contactNumber: payload.contactNumber.trim(),
          alternateContact: payload.alternateContact?.trim() || '',
          website: payload.website?.trim() || '',
          gstNumber: payload.gstNumber?.trim() || '',
          owner: {
            ...gym.owner,
            fullName: payload.ownerFullName.trim(),
            email: payload.ownerEmail.trim(),
            mobile: payload.ownerMobile.trim(),
          },
          address: {
            country: payload.country.trim(),
            state: payload.state.trim(),
            city: payload.city.trim(),
            fullAddress: payload.fullAddress.trim(),
            pinCode: payload.pinCode.trim(),
          },
          subscription: {
            ...gym.subscription,
            plan: payload.plan,
            startDate: payload.startDate,
            endDate: payload.endDate,
            trialPeriod: payload.trialPeriod,
            maxMembers: Number(payload.maxMembers) || planPreset.maxMembers,
            maxBranches: Number(payload.maxBranches) || planPreset.maxBranches,
            monthlyFee: planPreset.monthlyFee,
          },
          branches: updatedBranches,
          activityLogs: [
            {
              id: `LOG-${Date.now()}`,
              action: 'Gym profile & subscription details updated',
              actor: 'Elena Vance (Super Admin)',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
              type: 'edit',
            },
            ...(gym.activityLogs || []),
          ],
        };
      })
    );
  }, []);

  const updateGymStatus = useCallback((id, nextStatus, note) => {
    setGyms((prev) =>
      prev.map((gym) => {
        if (gym.id !== id) return gym;
        const actionMsg =
          note ||
          `Status changed from ${gym.status} to ${nextStatus}`;
        return {
          ...gym,
          status: nextStatus,
          branches: gym.branches.map((b) => ({
            ...b,
            status: nextStatus === 'active' ? 'active' : nextStatus === 'suspended' ? 'suspended' : b.status,
          })),
          activityLogs: [
            {
              id: `LOG-${Date.now()}`,
              action: actionMsg,
              actor: 'Elena Vance (Super Admin)',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
              type: 'status',
            },
            ...(gym.activityLogs || []),
          ],
        };
      })
    );
  }, []);

  const updateGymPlan = useCallback((id, planName) => {
    setGyms((prev) =>
      prev.map((gym) => {
        if (gym.id !== id) return gym;
        const preset =
          SUBSCRIPTION_PLAN_PRESETS[planName] || SUBSCRIPTION_PLAN_PRESETS.Pro;
        return {
          ...gym,
          subscription: {
            ...gym.subscription,
            plan: planName,
            maxMembers: preset.maxMembers,
            maxBranches: preset.maxBranches,
            monthlyFee: preset.monthlyFee,
          },
          activityLogs: [
            {
              id: `LOG-${Date.now()}`,
              action: `Subscription plan updated to ${planName} (₹${preset.monthlyFee}/mo)`,
              actor: 'Elena Vance (Super Admin)',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
              type: 'subscription',
            },
            ...(gym.activityLogs || []),
          ],
        };
      })
    );
  }, []);

  const deleteGym = useCallback((id) => {
    setGyms((prev) => prev.filter((gym) => gym.id !== id));
  }, []);

  const allBranches = useMemo(() => {
    return gyms.flatMap((gym) =>
      (gym.branches || []).map((branch) => ({
        ...branch,
        gymId: gym.id,
        gymName: gym.name,
        gymPlan: gym.subscription?.plan,
      }))
    );
  }, [gyms]);

  const value = useMemo(
    () => ({
      gyms,
      allBranches,
      getGymById,
      createGym,
      updateGym,
      updateGymStatus,
      updateGymPlan,
      deleteGym,
    }),
    [
      gyms,
      allBranches,
      getGymById,
      createGym,
      updateGym,
      updateGymStatus,
      updateGymPlan,
      deleteGym,
    ]
  );

  return (
    <GymManagementContext.Provider value={value}>
      {children}
    </GymManagementContext.Provider>
  );
}

export function useGymManagement() {
  const ctx = useContext(GymManagementContext);
  if (!ctx) {
    throw new Error('useGymManagement must be used within a GymManagementProvider');
  }
  return ctx;
}
