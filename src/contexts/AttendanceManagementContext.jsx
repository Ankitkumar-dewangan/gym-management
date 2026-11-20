import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ATTENDANCE_SETTINGS,
  INITIAL_CORRECTION_REQUESTS,
} from '../constants/attendanceManagementData';
import {
  ATTENDANCE_TODAY,
  calculateDurationMinutes,
  getCurrentFormattedTime,
  parseQrAttendanceInput,
} from '../utils/attendanceUtils';
import { useBranchManagement } from './BranchManagementContext';
import { useMemberManagement } from './MemberManagementContext';
import { useMembershipManagement } from './MembershipManagementContext';
import { useTenant } from './TenantContext';

const RECORDS_STORAGE_KEY = 'GymPilot_attendance_records_v2';
const CORRECTIONS_STORAGE_KEY = 'GymPilot_attendance_corrections_v2';
const SETTINGS_STORAGE_KEY = 'GymPilot_attendance_settings_v2';

function readStorageArray(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readStorageObject(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

const AttendanceManagementContext = createContext(null);

export function AttendanceManagementProvider({ children }) {
  const { activeTenant, activeBranch } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const { tenantMemberships } = useMembershipManagement();

  const [records, setRecords] = useState(() =>
    readStorageArray(RECORDS_STORAGE_KEY, [])
  );
  const [corrections, setCorrections] = useState(() =>
    readStorageArray(CORRECTIONS_STORAGE_KEY, [])
  );
  const [settingsByTenant, setSettingsByTenant] = useState(() =>
    readStorageObject(SETTINGS_STORAGE_KEY, INITIAL_ATTENDANCE_SETTINGS)
  );
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Ignore storage quota errors
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(CORRECTIONS_STORAGE_KEY, JSON.stringify(corrections));
    } catch {
      // Ignore storage quota errors
    }
  }, [corrections]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsByTenant));
    } catch {
      // Ignore storage quota errors
    }
  }, [settingsByTenant]);

  const tenantSettings = useMemo(() => {
    const base =
      settingsByTenant[activeTenant.id] || {
        qrAttendanceEnabled: true,
        manualAttendanceEnabled: true,
        requireMembershipValidation: true,
        requireCheckout: true,
        preventDuplicateCheckin: true,
        allowedStartTime: '05:00',
        allowedEndTime: '23:00',
        gracePeriodMinutes: 15,
        capacityWarningThreshold: 85,
        notifyOnCheckin: true,
        notifyOnExpiryDeny: true,
        notifyManagerOnCorrection: true,
        branchCapacities: {},
      };
    return base;
  }, [settingsByTenant, activeTenant.id]);

  const tenantRecords = useMemo(
    () => records.filter((r) => r.tenantId === activeTenant.id),
    [records, activeTenant.id]
  );

  const scopedRecords = useMemo(() => {
    if (!activeBranch || activeBranch.id === 'all') return tenantRecords;
    return tenantRecords.filter(
      (r) => r.branchId === activeBranch.id || r.branchName === activeBranch.name
    );
  }, [tenantRecords, activeBranch]);

  const todayRecords = useMemo(
    () => scopedRecords.filter((r) => r.date === ATTENDANCE_TODAY),
    [scopedRecords]
  );

  const currentlyInsideRecords = useMemo(
    () => scopedRecords.filter((r) => r.status === 'checked_in'),
    [scopedRecords]
  );

  const tenantCorrections = useMemo(
    () => corrections.filter((c) => c.tenantId === activeTenant.id),
    [corrections, activeTenant.id]
  );

  const scopedCorrections = useMemo(() => {
    if (!activeBranch || activeBranch.id === 'all') return tenantCorrections;
    return tenantCorrections.filter(
      (c) => c.branchId === activeBranch.id || c.branchName === activeBranch.name
    );
  }, [tenantCorrections, activeBranch]);

  const getBranchCapacity = useCallback(
    (branchId) => {
      if (branchId && tenantSettings.branchCapacities?.[branchId]) {
        return Number(tenantSettings.branchCapacities[branchId]);
      }
      const branch = tenantBranches.find((b) => b.id === branchId);
      if (branch?.maxCapacity) {
        return Math.min(180, Math.max(40, Math.round(branch.maxCapacity / 6)));
      }
      return 85;
    },
    [tenantSettings.branchCapacities, tenantBranches]
  );

  const totalScopedCapacity = useMemo(() => {
    if (activeBranch && activeBranch.id !== 'all') {
      return getBranchCapacity(activeBranch.id);
    }
    if (!tenantBranches || tenantBranches.length === 0) return 0;
    return tenantBranches.reduce((sum, b) => sum + getBranchCapacity(b.id), 0);
  }, [activeBranch, tenantBranches, getBranchCapacity]);

  const pushScanLog = useCallback((entry) => {
    setRecentScans((prev) => [
      {
        id: `SCN-${Date.now()}`,
        timestamp: getCurrentFormattedTime(),
        ...entry,
      },
      ...prev.slice(0, 14),
    ]);
  }, []);

  /**
   * Resolves effective membership validity for a member using Step 9 + Step 8 records.
   */
  const resolveMemberValidity = useCallback(
    (member) => {
      const linkedMembership =
        tenantMemberships.find((ms) => ms.memberId === member.id) || null;
      const effectiveStatus = linkedMembership?.status || member.status || 'inactive';
      const effectivePlan = linkedMembership?.planName || member.plan || 'Standard Plan';
      const effectiveExpiry = linkedMembership?.expiryDate || member.expiryDate || '';
      const isExpired =
        effectiveStatus === 'expired' ||
        (effectiveExpiry && effectiveExpiry < ATTENDANCE_TODAY && effectiveStatus !== 'active');
      const isInactive = ['inactive', 'suspended', 'on_hold', 'frozen', 'cancelled'].includes(
        effectiveStatus
      );

      return {
        linkedMembership,
        effectiveStatus: isExpired ? 'expired' : effectiveStatus,
        effectivePlan,
        effectiveExpiry,
        isExpired,
        isInactive,
        isEligible: !isExpired && !isInactive,
      };
    },
    [tenantMemberships]
  );

  /**
   * Verifies a QR payload or Member ID without recording attendance yet.
   * Modes: 'auto' | 'checkin' | 'checkout'
   */
  const verifyMemberForAttendance = useCallback(
    (rawInput, mode = 'auto') => {
      const parsed = parseQrAttendanceInput(rawInput);
      if (!parsed.valid) {
        return {
          outcome: 'invalid_qr',
          statusTone: 'error',
          headline: 'Invalid QR Code',
          message: parsed.error,
          rawInput,
          member: null,
          membership: null,
          activeSession: null,
          canConfirmCheckin: false,
          canConfirmCheckout: false,
        };
      }

      const member = tenantMembers.find(
        (m) => m.id.toUpperCase() === parsed.memberId.toUpperCase()
      );
      if (!member) {
        return {
          outcome: 'member_not_found',
          statusTone: 'error',
          headline: 'Member Not Found',
          message: `No member record (${parsed.memberId}) exists in ${activeTenant.name}.`,
          rawInput,
          member: null,
          membership: null,
          activeSession: null,
          canConfirmCheckin: false,
          canConfirmCheckout: false,
        };
      }

      const validity = resolveMemberValidity(member);
      const activeSession =
        tenantRecords.find(
          (r) => r.memberId === member.id && r.status === 'checked_in'
        ) || null;

      // Active inside session checks
      if (mode === 'checkout') {
        if (!activeSession) {
          return {
            outcome: 'no_active_checkin',
            statusTone: 'warning',
            headline: 'No Active Check-in Session',
            message: `${member.fullName} does not have an open check-in session to check out from.`,
            rawInput,
            member,
            membership: validity,
            activeSession: null,
            canConfirmCheckin: false,
            canConfirmCheckout: false,
          };
        }
        const nowTime = getCurrentFormattedTime();
        const estimatedDuration =
          calculateDurationMinutes(activeSession.checkInTime, nowTime) ?? 45;
        return {
          outcome: 'ready_checkout',
          statusTone: 'success',
          headline: 'Active Session Verified — Ready for Check-out',
          message: `Checked in at ${activeSession.checkInTime} (${activeSession.branchName}). Confirm check-out to calculate session duration.`,
          rawInput,
          member,
          membership: validity,
          activeSession,
          estimatedDurationMinutes: estimatedDuration,
          canConfirmCheckin: false,
          canConfirmCheckout: true,
        };
      }

      if (mode === 'auto' && activeSession) {
        const nowTime = getCurrentFormattedTime();
        const estimatedDuration =
          calculateDurationMinutes(activeSession.checkInTime, nowTime) ?? 45;
        return {
          outcome: 'ready_checkout',
          statusTone: 'warning',
          headline: 'Already Checked In — Check-out Available',
          message: `${member.fullName} is currently inside ${activeSession.branchName} since ${activeSession.checkInTime}. Confirm check-out to end session.`,
          rawInput,
          member,
          membership: validity,
          activeSession,
          estimatedDurationMinutes: estimatedDuration,
          canConfirmCheckin: false,
          canConfirmCheckout: true,
        };
      }

      if (mode === 'checkin' && activeSession && tenantSettings.preventDuplicateCheckin) {
        return {
          outcome: 'already_checked_in',
          statusTone: 'warning',
          headline: 'Already Checked In',
          message: `Duplicate check-in blocked: ${member.fullName} checked in at ${activeSession.checkInTime} (${activeSession.branchName}).`,
          rawInput,
          member,
          membership: validity,
          activeSession,
          canConfirmCheckin: false,
          canConfirmCheckout: true,
        };
      }

      // QR Attendance toggle check
      if (!tenantSettings.qrAttendanceEnabled && mode !== 'manual') {
        return {
          outcome: 'qr_disabled',
          statusTone: 'warning',
          headline: 'QR Attendance Disabled',
          message: 'QR scanning check-in is disabled in Attendance Settings. Use Manual Attendance or re-enable QR.',
          rawInput,
          member,
          membership: validity,
          activeSession,
          canConfirmCheckin: false,
          canConfirmCheckout: false,
        };
      }

      // Membership validation checks
      if (tenantSettings.requireMembershipValidation) {
        if (validity.isExpired) {
          return {
            outcome: 'membership_expired',
            statusTone: 'error',
            headline: 'Membership Expired',
            message: `${validity.effectivePlan} expired on ${validity.effectiveExpiry || 'record'}. Renew membership before allowing check-in.`,
            rawInput,
            member,
            membership: validity,
            activeSession,
            canConfirmCheckin: false,
            canConfirmCheckout: false,
          };
        }
        if (validity.isInactive) {
          return {
            outcome: 'membership_inactive',
            statusTone: 'error',
            headline: `Membership ${validity.effectiveStatus.replace('_', ' ')}`,
            message: `Access paused: member status is currently ${validity.effectiveStatus.replace('_', ' ')}.`,
            rawInput,
            member,
            membership: validity,
            activeSession,
            canConfirmCheckin: false,
            canConfirmCheckout: false,
          };
        }
      }

      return {
        outcome: 'ready_checkin',
        statusTone: 'success',
        headline: 'Membership Verified — Ready to Check In',
        message: `${validity.effectivePlan} is active through ${validity.effectiveExpiry || 'current cycle'}.`,
        rawInput,
        member,
        membership: validity,
        activeSession,
        canConfirmCheckin: true,
        canConfirmCheckout: false,
      };
    },
    [
      tenantMembers,
      activeTenant.name,
      resolveMemberValidity,
      tenantRecords,
      tenantSettings.preventDuplicateCheckin,
      tenantSettings.qrAttendanceEnabled,
      tenantSettings.requireMembershipValidation,
    ]
  );

  const confirmCheckIn = useCallback(
    ({ memberId, branchId, source = 'QR Code', sessionLabel = 'Open Gym Session', note = '' }) => {
      const member = tenantMembers.find((m) => m.id === memberId);
      if (!member) {
        return { ok: false, outcome: 'member_not_found', message: 'Member not found.' };
      }

      const existingInside = tenantRecords.find(
        (r) => r.memberId === memberId && r.status === 'checked_in'
      );
      if (existingInside && tenantSettings.preventDuplicateCheckin) {
        pushScanLog({
          memberId: member.id,
          memberName: member.fullName,
          action: 'Duplicate Blocked',
          statusTone: 'warning',
          source,
        });
        return {
          ok: false,
          outcome: 'already_checked_in',
          message: `${member.fullName} is already checked in at ${existingInside.branchName} (${existingInside.checkInTime}).`,
        };
      }

      const targetBranch =
        tenantBranches.find((b) => b.id === (branchId || member.branchId)) ||
        tenantBranches.find((b) => b.id === activeBranch?.id) ||
        tenantBranches[0];

      const checkInTime = getCurrentFormattedTime();
      const newRecord = {
        id: `ATT-${Math.floor(9100 + Math.random() * 899)}`,
        tenantId: activeTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        memberAvatar: member.avatar,
        branchId: targetBranch?.id || member.branchId,
        branchName: targetBranch?.name || member.branchName,
        date: ATTENDANCE_TODAY,
        checkInTime,
        checkOutTime: null,
        durationMinutes: null,
        source,
        status: 'checked_in',
        sessionLabel,
        isManualCorrection: false,
        notes: note.trim(),
      };

      setRecords((prev) => [newRecord, ...prev]);
      pushScanLog({
        memberId: member.id,
        memberName: member.fullName,
        action: 'Check-in Successful',
        statusTone: 'success',
        source,
        branchName: newRecord.branchName,
      });

      return { ok: true, outcome: 'checkin_success', record: newRecord };
    },
    [
      tenantMembers,
      tenantRecords,
      tenantSettings.preventDuplicateCheckin,
      tenantBranches,
      activeBranch,
      activeTenant.id,
      pushScanLog,
    ]
  );

  const confirmCheckOut = useCallback(
    ({ memberId, attendanceId, source = 'QR Code', note = '' }) => {
      const target = tenantRecords.find((r) =>
        attendanceId
          ? r.id === attendanceId
          : r.memberId === memberId && r.status === 'checked_in'
      );
      if (!target) {
        return {
          ok: false,
          outcome: 'no_active_checkin',
          message: 'No active check-in session found for this member.',
        };
      }

      const checkOutTime = getCurrentFormattedTime();
      const durationMinutes =
        calculateDurationMinutes(target.checkInTime, checkOutTime) ?? 48;

      const updatedRecord = {
        ...target,
        checkOutTime,
        durationMinutes: Math.max(1, durationMinutes),
        status: 'checked_out',
        notes: note.trim() ? note.trim() : target.notes,
      };

      setRecords((prev) =>
        prev.map((r) => (r.id === target.id ? updatedRecord : r))
      );

      pushScanLog({
        memberId: target.memberId,
        memberName: target.memberName,
        action: 'Check-out Successful',
        statusTone: 'success',
        source,
        branchName: target.branchName,
      });

      return { ok: true, outcome: 'checkout_success', record: updatedRecord };
    },
    [tenantRecords, pushScanLog]
  );

  const saveManualAttendance = useCallback(
    ({ id, memberId, branchId, date, checkInTime, checkOutTime, status, notes }) => {
      const member = tenantMembers.find((m) => m.id === memberId);
      const branch = tenantBranches.find((b) => b.id === branchId) || tenantBranches[0];
      if (!member) return null;

      const computedDuration =
        checkInTime && checkOutTime
          ? calculateDurationMinutes(checkInTime, checkOutTime)
          : null;

      if (id) {
        let updated = null;
        setRecords((prev) =>
          prev.map((r) => {
            if (r.id !== id || r.tenantId !== activeTenant.id) return r;
            updated = {
              ...r,
              memberId: member.id,
              memberName: member.fullName,
              memberAvatar: member.avatar,
              branchId: branch?.id || member.branchId,
              branchName: branch?.name || member.branchName,
              date: date || r.date,
              checkInTime: status === 'absent' ? '—' : checkInTime || r.checkInTime,
              checkOutTime:
                status === 'checked_in' || status === 'absent'
                  ? null
                  : checkOutTime || r.checkOutTime,
              durationMinutes:
                status === 'checked_in' || status === 'absent' ? null : computedDuration,
              source: 'Manual',
              status: status || r.status,
              isManualCorrection: true,
              correctionNote: notes?.trim() || 'Updated manually by gym staff.',
              notes: notes?.trim() || r.notes,
            };
            return updated;
          })
        );
        return updated;
      }

      const created = {
        id: `ATT-${Math.floor(9200 + Math.random() * 799)}`,
        tenantId: activeTenant.id,
        memberId: member.id,
        memberName: member.fullName,
        memberAvatar: member.avatar,
        branchId: branch?.id || member.branchId,
        branchName: branch?.name || member.branchName,
        date: date || ATTENDANCE_TODAY,
        checkInTime: status === 'absent' ? '—' : checkInTime || '08:00 AM',
        checkOutTime:
          status === 'checked_in' || status === 'absent' ? null : checkOutTime || null,
        durationMinutes:
          status === 'checked_in' || status === 'absent' ? null : computedDuration,
        source: 'Manual',
        status: status || 'checked_in',
        sessionLabel: 'Front-Desk Manual Entry',
        isManualCorrection: true,
        correctionNote: notes?.trim() || 'Recorded via Manual Attendance console.',
        notes: notes?.trim() || '',
      };

      setRecords((prev) => [created, ...prev]);
      return created;
    },
    [tenantMembers, tenantBranches, activeTenant.id]
  );

  const approveCorrectionRequest = useCallback(
    (requestId, reviewNote = 'Approved by branch administrator.') => {
      const target = corrections.find(
        (c) => c.id === requestId && c.tenantId === activeTenant.id
      );
      if (!target) return;

      setCorrections((prev) =>
        prev.map((c) =>
          c.id === requestId
            ? { ...c, status: 'approved', reviewNote: reviewNote.trim() || c.reviewNote }
            : c
        )
      );

      // Apply correction cleanly to attendance log
      const nextDuration = calculateDurationMinutes(
        target.requestedCorrection.checkInTime,
        target.requestedCorrection.checkOutTime
      );
      if (target.attendanceId) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === target.attendanceId
              ? {
                ...r,
                checkInTime: target.requestedCorrection.checkInTime,
                checkOutTime: target.requestedCorrection.checkOutTime,
                durationMinutes: nextDuration,
                status: target.requestedCorrection.status || 'checked_out',
                isManualCorrection: true,
                correctionNote: `Correction ${target.id} approved: ${reviewNote}`,
              }
              : r
          )
        );
      } else {
        const createdFromCorrection = {
          id: `ATT-${Math.floor(9400 + Math.random() * 599)}`,
          tenantId: activeTenant.id,
          memberId: target.memberId,
          memberName: target.memberName,
          memberAvatar: target.memberAvatar,
          branchId: target.branchId,
          branchName: target.branchName,
          date: target.requestedDate,
          checkInTime: target.requestedCorrection.checkInTime,
          checkOutTime: target.requestedCorrection.checkOutTime,
          durationMinutes: nextDuration,
          source: 'Manual',
          status: target.requestedCorrection.status || 'checked_out',
          sessionLabel: 'Approved Correction',
          isManualCorrection: true,
          correctionNote: `Correction ${target.id} approved: ${reviewNote}`,
          notes: target.reason,
        };
        setRecords((prev) => [createdFromCorrection, ...prev]);
      }
    },
    [corrections, activeTenant.id]
  );

  const rejectCorrectionRequest = useCallback(
    (requestId, reviewNote = 'Declined after front-desk log review.') => {
      setCorrections((prev) =>
        prev.map((c) =>
          c.id === requestId && c.tenantId === activeTenant.id
            ? { ...c, status: 'rejected', reviewNote: reviewNote.trim() || c.reviewNote }
            : c
        )
      );
    },
    [activeTenant.id]
  );

  const submitCorrectionRequest = useCallback(
    ({ memberId, branchId, requestedDate, origCheckIn, origCheckOut, reqCheckIn, reqCheckOut, reason }) => {
      const member = tenantMembers.find((m) => m.id === memberId);
      const branch = tenantBranches.find((b) => b.id === branchId) || tenantBranches[0];
      if (!member) return null;

      const created = {
        id: `COR-${Math.floor(210 + Math.random() * 700)}`,
        tenantId: activeTenant.id,
        attendanceId: null,
        memberId: member.id,
        memberName: member.fullName,
        memberAvatar: member.avatar,
        branchId: branch?.id || member.branchId,
        branchName: branch?.name || member.branchName,
        requestedDate: requestedDate || ATTENDANCE_TODAY,
        submittedAt: `${ATTENDANCE_TODAY} · ${getCurrentFormattedTime()}`,
        originalAttendance: {
          checkInTime: origCheckIn || 'Not Recorded',
          checkOutTime: origCheckOut || '—',
          status: 'absent',
        },
        requestedCorrection: {
          checkInTime: reqCheckIn || '07:30 AM',
          checkOutTime: reqCheckOut || '08:45 AM',
          status: 'checked_out',
        },
        reason: reason.trim(),
        status: 'pending',
        reviewNote: '',
      };

      setCorrections((prev) => [created, ...prev]);
      return created;
    },
    [tenantMembers, tenantBranches, activeTenant.id]
  );

  const updateSettings = useCallback(
    (patch) => {
      setSettingsByTenant((prev) => ({
        ...prev,
        [activeTenant.id]: {
          ...tenantSettings,
          ...patch,
        },
      }));
    },
    [activeTenant.id, tenantSettings]
  );

  const updateBranchCapacity = useCallback(
    (branchId, capacity) => {
      setSettingsByTenant((prev) => ({
        ...prev,
        [activeTenant.id]: {
          ...tenantSettings,
          branchCapacities: {
            ...(tenantSettings.branchCapacities || {}),
            [branchId]: Math.max(10, Number(capacity) || 50),
          },
        },
      }));
    },
    [activeTenant.id, tenantSettings]
  );

  const resetSettings = useCallback(() => {
    const defaults = INITIAL_ATTENDANCE_SETTINGS[activeTenant.id] || INITIAL_ATTENDANCE_SETTINGS.ten_ironworks;
    setSettingsByTenant((prev) => ({
      ...prev,
      [activeTenant.id]: defaults,
    }));
  }, [activeTenant.id]);

  const value = useMemo(
    () => ({
      tenantRecords,
      scopedRecords,
      todayRecords,
      currentlyInsideRecords,
      tenantCorrections,
      scopedCorrections,
      tenantSettings,
      totalScopedCapacity,
      recentScans,
      getBranchCapacity,
      resolveMemberValidity,
      verifyMemberForAttendance,
      confirmCheckIn,
      confirmCheckOut,
      saveManualAttendance,
      approveCorrectionRequest,
      rejectCorrectionRequest,
      submitCorrectionRequest,
      updateSettings,
      updateBranchCapacity,
      resetSettings,
      pushScanLog,
    }),
    [
      tenantRecords,
      scopedRecords,
      todayRecords,
      currentlyInsideRecords,
      tenantCorrections,
      scopedCorrections,
      tenantSettings,
      totalScopedCapacity,
      recentScans,
      getBranchCapacity,
      resolveMemberValidity,
      verifyMemberForAttendance,
      confirmCheckIn,
      confirmCheckOut,
      saveManualAttendance,
      approveCorrectionRequest,
      rejectCorrectionRequest,
      submitCorrectionRequest,
      updateSettings,
      updateBranchCapacity,
      resetSettings,
      pushScanLog,
    ]
  );

  return (
    <AttendanceManagementContext.Provider value={value}>
      {children}
    </AttendanceManagementContext.Provider>
  );
}

export function useAttendanceManagement() {
  const ctx = useContext(AttendanceManagementContext);
  if (!ctx) {
    throw new Error('useAttendanceManagement must be used within an AttendanceManagementProvider');
  }
  return ctx;
}
