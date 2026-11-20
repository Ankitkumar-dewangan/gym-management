import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BRANCH_MEDIA,
  INITIAL_BRANCHES,
  INITIAL_BRANCH_ACTIVITY_LOGS,
  INITIAL_BRANCH_MANAGERS,
  INITIAL_BRANCH_STAFF,
} from '../constants/branchManagementData';
import { useTenant } from './TenantContext';

const STORAGE_KEYS = {
  BRANCHES: 'GymPilot_branches_v2',
  MANAGERS: 'GymPilot_branch_managers_v2',
  STAFF: 'GymPilot_branch_staff_v2',
  LOGS: 'GymPilot_branch_logs_v2',
};

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

const BranchManagementContext = createContext(null);

export function BranchManagementProvider({ children }) {
  const { activeTenant } = useTenant();

  const [branches, setBranches] = useState(() =>
    readStorage(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES || [])
  );
  const [managers, setManagers] = useState(() =>
    readStorage(STORAGE_KEYS.MANAGERS, INITIAL_BRANCH_MANAGERS || [])
  );
  const [staff, setStaff] = useState(() =>
    readStorage(STORAGE_KEYS.STAFF, INITIAL_BRANCH_STAFF || [])
  );
  const [logs, setLogs] = useState(() =>
    readStorage(STORAGE_KEYS.LOGS, INITIAL_BRANCH_ACTIVITY_LOGS || [])
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    } catch {
      // Ignore storage quota errors
    }
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(managers));
    } catch {
      // Ignore storage quota errors
    }
  }, [managers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch {
      // Ignore storage quota errors
    }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {
      // Ignore storage quota errors
    }
  }, [logs]);

  const tenantBranches = useMemo(
    () => branches.filter((b) => !activeTenant?.id || b.tenantId === activeTenant.id || !b.tenantId),
    [branches, activeTenant?.id]
  );

  const scopedBranches = useMemo(
    () => tenantBranches || [],
    [tenantBranches]
  );

  const tenantManagers = useMemo(
    () => managers.filter((m) => m.tenantId === activeTenant.id),
    [managers, activeTenant.id]
  );

  const appendLog = useCallback((branchId, category, title, detail, actor = 'Gym Owner') => {
    setLogs((prev) => [
      {
        id: `blog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        branchId,
        category,
        title,
        detail,
        actor,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  }, []);

  const getBranchById = useCallback(
    (id) => branches.find((b) => b.id === id) || null,
    [branches]
  );

  const getManagerForBranch = useCallback(
    (branch) => {
      if (!branch) return null;
      return (
        managers.find((m) => m.id === branch.managerId) ||
        managers.find((m) => m.assignedBranchId === branch.id) ||
        null
      );
    },
    [managers]
  );

  const getBranchStaff = useCallback(
    (branchId) => staff.filter((s) => s.branchId === branchId),
    [staff]
  );

  const getBranchLogs = useCallback(
    (branchId) => logs.filter((l) => l.branchId === branchId),
    [logs]
  );

  const createBranch = useCallback(
    (formData, asDraft = false) => {
      const newBranchId = `br_${Date.now()}`;
      let resolvedManagerId = formData.managerId || '';

      if (formData.managerMode === 'new' && formData.newManagerName?.trim()) {
        const newMgrId = `mgr_${Date.now()}`;
        const newManager = {
          id: newMgrId,
          tenantId: activeTenant.id,
          name: formData.newManagerName.trim(),
          email: formData.newManagerEmail?.trim() || 'manager@club.com',
          phone: formData.newManagerPhone?.trim() || '+1 (206) 555-0190',
          avatar: BRANCH_MEDIA.managerLeadAvatar,
          assignedBranchId: newBranchId,
          joiningDate: formData.openingDate || '2026-11-19',
          status: 'active',
          isPrimary: true,
          responsibilities: [
            'Branch daily operations & team leadership',
            'Member onboarding & renewal tracking',
          ],
        };
        setManagers((prev) => [newManager, ...prev]);
        setStaff((prev) => [
          {
            id: `stf_${Date.now()}`,
            branchId: newBranchId,
            tenantId: activeTenant.id,
            name: newManager.name,
            avatar: newManager.avatar,
            role: 'Branch Manager',
            contact: newManager.phone,
            email: newManager.email,
            joiningDate: newManager.joiningDate,
            status: 'active',
          },
          ...prev,
        ]);
        resolvedManagerId = newMgrId;
      } else if (resolvedManagerId) {
        setManagers((prev) =>
          prev.map((m) =>
            m.id === resolvedManagerId ? { ...m, assignedBranchId: newBranchId } : m
          )
        );
      }

      const nextBranch = {
        id: newBranchId,
        tenantId: activeTenant.id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        logo: formData.logo || '',
        coverImage: formData.coverImage || BRANCH_MEDIA.downtownCover,
        branchType: formData.branchType || 'Boutique Studio',
        openingDate: formData.openingDate || '2026-11-19',
        status: asDraft ? 'draft' : formData.status || 'active',
        contactPerson: formData.contactPerson?.trim() || formData.newManagerName || 'Operations Desk',
        contactNumber: formData.contactNumber?.trim() || '',
        alternateNumber: formData.alternateNumber?.trim() || '',
        email: formData.email?.trim() || '',
        website: formData.website?.trim() || '',
        country: formData.country || 'United States',
        state: formData.state || '',
        city: formData.city?.trim() || '',
        area: formData.area?.trim() || '',
        fullAddress: formData.fullAddress?.trim() || '',
        pinCode: formData.pinCode?.trim() || '',
        mapsUrl: formData.mapsUrl?.trim() || '',
        latitude: formData.latitude?.trim() || '',
        longitude: formData.longitude?.trim() || '',
        totalArea: formData.totalArea?.trim() || '8,000 sq ft',
        floors: Number(formData.floors) || 1,
        workoutZones: Number(formData.workoutZones) || 3,
        lockerFacility: Boolean(formData.lockerFacility),
        showerFacility: Boolean(formData.showerFacility),
        parkingFacility: Boolean(formData.parkingFacility),
        acFacility: Boolean(formData.acFacility),
        equipmentSummary: formData.equipmentSummary?.trim() || 'Strength & conditioning suite',
        openingTime: formData.openingTime || '05:30',
        closingTime: formData.closingTime || '22:00',
        weeklyOff: formData.weeklyOff || 'Open All 7 Days',
        weekendTimings: formData.weekendTimings || '07:00 AM – 08:00 PM',
        managerId: resolvedManagerId,
        maxCapacity: Number(formData.maxCapacity) || 350,
        notes: formData.notes?.trim() || '',
        documents: formData.documents || [],
        totalMembers: 0,
        activeMembers: 0,
        expiredMembers: 0,
        newMembers: 0,
        todaysAttendance: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        collections: 0,
        pendingPayments: 0,
        renewals: 0,
        expenseBreakdown: {
          rent: 0,
          salaries: 0,
          electricity: 0,
          maintenance: 0,
          other: 0,
        },
        revenueHistory: [
          { month: 'Jun', revenue: 0, expenses: 0 },
          { month: 'Jul', revenue: 0, expenses: 0 },
          { month: 'Aug', revenue: 0, expenses: 0 },
          { month: 'Sep', revenue: 0, expenses: 0 },
          { month: 'Oct', revenue: 0, expenses: 0 },
          { month: 'Nov', revenue: 0, expenses: 0 },
        ],
      };

      setBranches((prev) => [nextBranch, ...prev]);
      appendLog(
        newBranchId,
        'Branch Creation',
        `${nextBranch.name} ${asDraft ? 'saved as draft' : 'created'}`,
        `Branch code ${nextBranch.code} added in ${nextBranch.city || 'tenant portfolio'}.`
      );
      return nextBranch;
    },
    [activeTenant.id, appendLog]
  );

  const updateBranch = useCallback(
    (id, updates) => {
      let resolvedManagerId = updates.managerId;
      if (updates.managerMode === 'new' && updates.newManagerName?.trim()) {
        const newMgrId = `mgr_${Date.now()}`;
        const newManager = {
          id: newMgrId,
          tenantId: activeTenant.id,
          name: updates.newManagerName.trim(),
          email: updates.newManagerEmail?.trim() || 'manager@club.com',
          phone: updates.newManagerPhone?.trim() || '+1 (206) 555-0190',
          avatar: BRANCH_MEDIA.managerLeadAvatar,
          assignedBranchId: id,
          joiningDate: '2026-11-19',
          status: 'active',
          isPrimary: true,
          responsibilities: ['Branch daily operations & team leadership'],
        };
        setManagers((prev) => [newManager, ...prev]);
        resolvedManagerId = newMgrId;
      }

      setBranches((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
              ...b,
              ...updates,
              managerId: resolvedManagerId ?? b.managerId,
              floors: Number(updates.floors ?? b.floors) || 1,
              workoutZones: Number(updates.workoutZones ?? b.workoutZones) || 1,
              maxCapacity: Number(updates.maxCapacity ?? b.maxCapacity) || 200,
            }
            : b
        )
      );
      appendLog(
        id,
        'Important Update',
        'Branch profile updated',
        `Updated configuration and details for ${updates.name || 'branch'}.`
      );
    },
    [activeTenant.id, appendLog]
  );

  const toggleBranchStatus = useCallback(
    (id) => {
      setBranches((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const nextStatus = b.status === 'active' ? 'inactive' : 'active';
          appendLog(
            id,
            'Important Update',
            `Branch ${nextStatus === 'active' ? 'activated' : 'deactivated'}`,
            `${b.name} status changed from ${b.status} to ${nextStatus}.`
          );
          return { ...b, status: nextStatus };
        })
      );
    },
    [appendLog]
  );

  const deleteBranch = useCallback((id) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    setStaff((prev) => prev.filter((s) => s.branchId !== id));
  }, []);

  const assignManagerToBranch = useCallback(
    (branchId, payload) => {
      if (payload.mode === 'existing' && payload.managerId) {
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? { ...b, managerId: payload.managerId } : b))
        );
        setManagers((prev) =>
          prev.map((m) =>
            m.id === payload.managerId
              ? { ...m, assignedBranchId: branchId, isPrimary: true, status: 'active' }
              : m.assignedBranchId === branchId
                ? { ...m, isPrimary: false }
                : m
          )
        );
        const mgr = managers.find((m) => m.id === payload.managerId);
        appendLog(
          branchId,
          'Staff Change',
          'Primary branch manager assigned',
          `${mgr?.name || 'Manager'} assigned as primary branch manager.`
        );
      } else if (payload.mode === 'new' && payload.name?.trim()) {
        const newMgrId = `mgr_${Date.now()}`;
        const newMgr = {
          id: newMgrId,
          tenantId: activeTenant.id,
          name: payload.name.trim(),
          email: payload.email?.trim() || '',
          phone: payload.phone?.trim() || '',
          avatar: BRANCH_MEDIA.managerLeadAvatar,
          assignedBranchId: branchId,
          joiningDate: payload.joiningDate || '2026-11-19',
          status: 'active',
          isPrimary: true,
          responsibilities: [
            'Primary branch operations & P&L oversight',
            'Staff roster & member retention',
          ],
        };
        setManagers((prev) => [
          newMgr,
          ...prev.map((m) =>
            m.assignedBranchId === branchId ? { ...m, isPrimary: false } : m
          ),
        ]);
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? { ...b, managerId: newMgrId } : b))
        );
        setStaff((prev) => [
          {
            id: `stf_${Date.now()}`,
            branchId,
            tenantId: activeTenant.id,
            name: newMgr.name,
            avatar: newMgr.avatar,
            role: 'Branch Manager',
            contact: newMgr.phone,
            email: newMgr.email,
            joiningDate: newMgr.joiningDate,
            status: 'active',
          },
          ...prev,
        ]);
        appendLog(
          branchId,
          'Staff Change',
          'New branch manager appointed',
          `${newMgr.name} added and assigned as primary branch manager.`
        );
      }
    },
    [activeTenant.id, appendLog, managers]
  );

  const updateManager = useCallback((managerId, updates) => {
    setManagers((prev) =>
      prev.map((m) => (m.id === managerId ? { ...m, ...updates } : m))
    );
  }, []);

  const toggleManagerStatus = useCallback((managerId) => {
    setManagers((prev) =>
      prev.map((m) =>
        m.id === managerId
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
          : m
      )
    );
  }, []);

  const addBranchStaff = useCallback(
    (branchId, staffMember) => {
      const nextStaff = {
        id: `stf_${Date.now()}`,
        branchId,
        tenantId: activeTenant.id,
        name: staffMember.name.trim(),
        avatar: staffMember.avatar || BRANCH_MEDIA.memberMaleAvatar,
        role: staffMember.role,
        contact: staffMember.contact.trim(),
        email: staffMember.email?.trim() || '',
        joiningDate: staffMember.joiningDate || '2026-11-19',
        status: staffMember.status || 'active',
      };
      setStaff((prev) => [nextStaff, ...prev]);
      appendLog(
        branchId,
        'Staff Change',
        `New ${nextStaff.role} added`,
        `${nextStaff.name} joined branch roster as ${nextStaff.role}.`
      );
      return nextStaff;
    },
    [activeTenant.id, appendLog]
  );

  const toggleStaffStatus = useCallback((staffId) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      allBranches: branches,
      tenantBranches,
      scopedBranches,
      tenantManagers,
      allManagers: managers,
      allStaff: staff,
      getBranchById,
      getManagerForBranch,
      getBranchStaff,
      getBranchLogs,
      createBranch,
      updateBranch,
      toggleBranchStatus,
      deleteBranch,
      assignManagerToBranch,
      updateManager,
      toggleManagerStatus,
      addBranchStaff,
      toggleStaffStatus,
    }),
    [
      branches,
      tenantBranches,
      scopedBranches,
      tenantManagers,
      managers,
      staff,
      getBranchById,
      getManagerForBranch,
      getBranchStaff,
      getBranchLogs,
      createBranch,
      updateBranch,
      toggleBranchStatus,
      deleteBranch,
      assignManagerToBranch,
      updateManager,
      toggleManagerStatus,
      addBranchStaff,
      toggleStaffStatus,
    ]
  );

  return (
    <BranchManagementContext.Provider value={value}>
      {children}
    </BranchManagementContext.Provider>
  );
}

export function useBranchManagement() {
  const ctx = useContext(BranchManagementContext);
  if (!ctx) {
    throw new Error('useBranchManagement must be used within a BranchManagementProvider');
  }
  return ctx;
}
