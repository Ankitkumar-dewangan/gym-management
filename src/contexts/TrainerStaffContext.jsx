import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_PAYROLL_RECORDS,
  INITIAL_STAFF,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_TRAINERS,
  INITIAL_TRAINER_ASSIGNMENTS,
  INITIAL_TRAINING_SESSIONS,
  TRAINER_STAFF_MEDIA,
} from '../constants/trainerStaffData';
import { calculateNetSalary, hasTrainerScheduleConflict } from '../utils/payrollCalculations';
import { useBranchManagement } from './BranchManagementContext';
import { useTenant } from './TenantContext';

const STORAGE_KEYS = {
  TRAINERS: 'GymPilot_trainers_v2',
  ASSIGNMENTS: 'GymPilot_trainer_assignments_v2',
  SESSIONS: 'GymPilot_training_sessions_v2',
  STAFF: 'GymPilot_staff_v2',
  STAFF_ATTENDANCE: 'GymPilot_staff_attendance_v2',
  PAYROLL: 'GymPilot_payroll_v2',
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

const TrainerStaffContext = createContext(null);

export function TrainerStaffProvider({ children }) {
  const { activeTenant, activeBranch } = useTenant();
  const { tenantBranches } = useBranchManagement();

  const [trainers, setTrainers] = useState(() =>
    readStorage(STORAGE_KEYS.TRAINERS, [])
  );
  const [assignments, setAssignments] = useState(() =>
    readStorage(STORAGE_KEYS.ASSIGNMENTS, [])
  );
  const [sessions, setSessions] = useState(() =>
    readStorage(STORAGE_KEYS.SESSIONS, [])
  );
  const [staffList, setStaffList] = useState(() =>
    readStorage(STORAGE_KEYS.STAFF, [])
  );
  const [staffAttendance, setStaffAttendance] = useState(() =>
    readStorage(STORAGE_KEYS.STAFF_ATTENDANCE, [])
  );
  const [payrollRecords, setPayrollRecords] = useState(() =>
    readStorage(STORAGE_KEYS.PAYROLL, [])
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
    } catch {
      // Ignore quota errors
    }
  }, [trainers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch {
      // Ignore quota errors
    }
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch {
      // Ignore quota errors
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
    } catch {
      // Ignore quota errors
    }
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_ATTENDANCE, JSON.stringify(staffAttendance));
    } catch {
      // Ignore quota errors
    }
  }, [staffAttendance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payrollRecords));
    } catch {
      // Ignore quota errors
    }
  }, [payrollRecords]);

  // Tenant-level scopes
  const tenantTrainers = useMemo(
    () => trainers.filter((t) => t.tenantId === activeTenant.id),
    [trainers, activeTenant.id]
  );

  const tenantAssignments = useMemo(
    () => assignments.filter((a) => a.tenantId === activeTenant.id),
    [assignments, activeTenant.id]
  );

  const tenantSessions = useMemo(
    () => sessions.filter((s) => s.tenantId === activeTenant.id),
    [sessions, activeTenant.id]
  );

  const tenantStaff = useMemo(
    () => staffList.filter((s) => s.tenantId === activeTenant.id),
    [staffList, activeTenant.id]
  );

  const tenantStaffAttendance = useMemo(
    () => staffAttendance.filter((a) => a.tenantId === activeTenant.id),
    [staffAttendance, activeTenant.id]
  );

  const tenantPayroll = useMemo(
    () => payrollRecords.filter((p) => p.tenantId === activeTenant.id),
    [payrollRecords, activeTenant.id]
  );

  // Branch-filtered scopes
  const isBranchFiltered = activeBranch && activeBranch.id !== 'all';

  const scopedTrainers = useMemo(() => {
    if (!isBranchFiltered) return tenantTrainers;
    return tenantTrainers.filter(
      (t) =>
        t.branchId === activeBranch.id ||
        (Array.isArray(t.assignedBranches) && t.assignedBranches.includes(activeBranch.id))
    );
  }, [tenantTrainers, isBranchFiltered, activeBranch]);

  const scopedAssignments = useMemo(() => {
    if (!isBranchFiltered) return tenantAssignments;
    return tenantAssignments.filter((a) => a.branchId === activeBranch.id);
  }, [tenantAssignments, isBranchFiltered, activeBranch]);

  const scopedSessions = useMemo(() => {
    if (!isBranchFiltered) return tenantSessions;
    return tenantSessions.filter((s) => s.branchId === activeBranch.id);
  }, [tenantSessions, isBranchFiltered, activeBranch]);

  const scopedStaff = useMemo(() => {
    if (!isBranchFiltered) return tenantStaff;
    return tenantStaff.filter((s) => s.branchId === activeBranch.id);
  }, [tenantStaff, isBranchFiltered, activeBranch]);

  const scopedStaffAttendance = useMemo(() => {
    if (!isBranchFiltered) return tenantStaffAttendance;
    return tenantStaffAttendance.filter((a) => a.branchId === activeBranch.id);
  }, [tenantStaffAttendance, isBranchFiltered, activeBranch]);

  const scopedPayroll = useMemo(() => {
    if (!isBranchFiltered) return tenantPayroll;
    return tenantPayroll.filter((p) => p.branchId === activeBranch.id);
  }, [tenantPayroll, isBranchFiltered, activeBranch]);

  // Lookups
  const getTrainerById = useCallback(
    (id) => trainers.find((t) => t.id === id && t.tenantId === activeTenant.id) || null,
    [trainers, activeTenant.id]
  );

  const getStaffById = useCallback(
    (id) => staffList.find((s) => s.id === id && s.tenantId === activeTenant.id) || null,
    [staffList, activeTenant.id]
  );

  const getPayrollById = useCallback(
    (id) => payrollRecords.find((p) => p.id === id && p.tenantId === activeTenant.id) || null,
    [payrollRecords, activeTenant.id]
  );

  // Trainer CRUD
  const registerTrainer = useCallback(
    (formData, { asDraft = false } = {}) => {
      const primaryBranchId = formData.branchId || formData.assignedBranches?.[0] || tenantBranches[0]?.id || 'br_downtown';
      const branchMeta = tenantBranches.find((b) => b.id === primaryBranchId) || tenantBranches[0];
      const trainerId = `TRN-${Math.floor(110 + Math.random() * 880)}`;

      const newTrainer = {
        id: trainerId,
        tenantId: activeTenant.id,
        branchId: primaryBranchId,
        branchName: branchMeta?.name || 'Main Branch',
        fullName: formData.fullName.trim(),
        avatar: formData.avatar || TRAINER_STAFF_MEDIA.strengthCoach,
        dob: formData.dob || '1993-05-15',
        gender: formData.gender || 'Male',
        phone: formData.phone.trim(),
        altPhone: formData.altPhone?.trim() || '',
        email: formData.email.trim(),
        address: formData.address?.trim() || '',
        emergencyContactName: formData.emergencyContactName?.trim() || '',
        emergencyContactPhone: formData.emergencyContactPhone?.trim() || '',
        specializations: Array.isArray(formData.specializations) && formData.specializations.length > 0
          ? formData.specializations
          : ['Strength & Conditioning'],
        experienceYears: Number(formData.experienceYears) || 1,
        certifications: formData.certifications?.trim() || '',
        qualifications: formData.qualifications?.trim() || '',
        bio: formData.bio?.trim() || '',
        languages: typeof formData.languages === 'string'
          ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
          : formData.languages || ['English'],
        joiningDate: formData.joiningDate || '2026-11-19',
        employmentType: formData.employmentType || 'Full-time',
        assignedBranches:
          Array.isArray(formData.assignedBranches) && formData.assignedBranches.length > 0
            ? formData.assignedBranches
            : [primaryBranchId],
        workingDays:
          Array.isArray(formData.workingDays) && formData.workingDays.length > 0
            ? formData.workingDays
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        shiftStart: formData.shiftStart || '06:00',
        shiftEnd: formData.shiftEnd || '14:30',
        maxClients: Number(formData.maxClients) || 15,
        assignedClients: 0,
        availabilityStatus: asDraft ? 'on_leave' : 'available',
        status: asDraft ? 'inactive' : formData.status || 'active',
        salaryType: formData.salaryType || 'Monthly',
        basicSalary: Number(formData.basicSalary) || 0,
        allowances: Number(formData.allowances) || 0,
        deductions: Number(formData.deductions) || 0,
        perSessionRate: Number(formData.perSessionRate) || 60,
        commissionPercent: Number(formData.commissionPercent) || 15,
        paymentFrequency: formData.paymentFrequency || 'Monthly',
        bankName: formData.bankName?.trim() || 'Chase Commercial Bank',
        accountHolderName: formData.accountHolderName?.trim() || formData.fullName.trim(),
        accountLast4: formData.accountLast4?.trim() || '4012',
        taxId: formData.taxId?.trim() || '',
        documents: formData.documents || [],
        rating: 4.8,
        completedSessionsMonth: 0,
        cancelledSessionsMonth: 0,
        retentionRate: 92,
        sessionRevenueMonth: 0,
        notes: formData.notes?.trim() || '',
      };

      setTrainers((prev) => [newTrainer, ...prev]);
      return newTrainer;
    },
    [activeTenant.id, tenantBranches]
  );

  const updateTrainer = useCallback(
    (trainerId, formData) => {
      const primaryBranchId = formData.branchId || formData.assignedBranches?.[0];
      const branchMeta = tenantBranches.find((b) => b.id === primaryBranchId);

      setTrainers((prev) =>
        prev.map((t) => {
          if (t.id !== trainerId) return t;
          return {
            ...t,
            ...formData,
            branchId: primaryBranchId || t.branchId,
            branchName: branchMeta?.name || t.branchName,
            experienceYears: Number(formData.experienceYears ?? t.experienceYears),
            maxClients: Number(formData.maxClients ?? t.maxClients),
            basicSalary: Number(formData.basicSalary ?? t.basicSalary),
            allowances: Number(formData.allowances ?? t.allowances),
            deductions: Number(formData.deductions ?? t.deductions),
            perSessionRate: Number(formData.perSessionRate ?? t.perSessionRate),
            commissionPercent: Number(formData.commissionPercent ?? t.commissionPercent),
            languages:
              typeof formData.languages === 'string'
                ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
                : formData.languages || t.languages,
          };
        })
      );
    },
    [tenantBranches]
  );

  const toggleTrainerStatus = useCallback((trainerId, nextStatus) => {
    setTrainers((prev) =>
      prev.map((t) => {
        if (t.id !== trainerId) return t;
        const status = nextStatus || (t.status === 'active' ? 'inactive' : 'active');
        return {
          ...t,
          status,
          availabilityStatus: status === 'active' ? 'available' : 'on_leave',
        };
      })
    );
  }, []);

  // Assignments CRUD
  const createAssignment = useCallback(
    (payload) => {
      const trainer = trainers.find((t) => t.id === payload.trainerId);
      const branch = tenantBranches.find((b) => b.id === payload.branchId) || tenantBranches[0];
      if (!trainer) return { ok: false, error: 'Selected trainer not found.' };
      if (trainer.status !== 'active') {
        return { ok: false, error: `${trainer.fullName} is currently ${trainer.status} and cannot take new assignments.` };
      }
      if ((trainer.assignedClients || 0) >= (trainer.maxClients || 20)) {
        return { ok: false, error: `${trainer.fullName} has reached maximum client capacity (${trainer.maxClients}).` };
      }

      const conflict = assignments.find(
        (a) =>
          a.trainerId === payload.trainerId &&
          a.status === 'active' &&
          a.timeSlot === payload.timeSlot &&
          Array.isArray(a.scheduleDays) &&
          Array.isArray(payload.scheduleDays) &&
          a.scheduleDays.some((d) => payload.scheduleDays.includes(d))
      );

      if (conflict) {
        return {
          ok: false,
          error: `Schedule conflict with ${conflict.memberName} (${conflict.timeSlot}).`,
        };
      }

      const newAssignment = {
        id: `ASN-${Math.floor(510 + Math.random() * 480)}`,
        tenantId: activeTenant.id,
        trainerId: trainer.id,
        trainerName: trainer.fullName,
        memberId: payload.memberId,
        memberName: payload.memberName,
        branchId: branch?.id || payload.branchId || trainer.branchId,
        branchName: branch?.name || trainer.branchName,
        planType: payload.planType || 'Personal Training Block',
        startDate: payload.startDate,
        endDate: payload.endDate,
        scheduleDays: payload.scheduleDays || ['Mon', 'Wed', 'Fri'],
        timeSlot: payload.timeSlot,
        goal: payload.goal || 'Strength & Conditioning',
        notes: payload.notes || '',
        status: 'active',
        sessionsCompleted: 0,
        sessionsTotal: Number(payload.sessionsTotal) || 24,
      };

      setAssignments((prev) => [newAssignment, ...prev]);
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainer.id
            ? { ...t, assignedClients: (t.assignedClients || 0) + 1 }
            : t
        )
      );
      return { ok: true, assignment: newAssignment };
    },
    [trainers, tenantBranches, assignments, activeTenant.id]
  );

  const reassignTrainer = useCallback(
    (assignmentId, newTrainerId) => {
      const targetAssignment = assignments.find((a) => a.id === assignmentId);
      const nextTrainer = trainers.find((t) => t.id === newTrainerId);
      if (!targetAssignment || !nextTrainer) return { ok: false, error: 'Record not found.' };
      if (nextTrainer.status !== 'active') {
        return { ok: false, error: `${nextTrainer.fullName} is not active.` };
      }

      const oldTrainerId = targetAssignment.trainerId;

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, trainerId: nextTrainer.id, trainerName: nextTrainer.fullName }
            : a
        )
      );

      if (oldTrainerId !== newTrainerId) {
        setTrainers((prev) =>
          prev.map((t) => {
            if (t.id === oldTrainerId) {
              return { ...t, assignedClients: Math.max(0, (t.assignedClients || 1) - 1) };
            }
            if (t.id === newTrainerId) {
              return { ...t, assignedClients: (t.assignedClients || 0) + 1 };
            }
            return t;
          })
        );
      }

      return { ok: true };
    },
    [assignments, trainers]
  );

  const endAssignment = useCallback(
    (assignmentId) => {
      const target = assignments.find((a) => a.id === assignmentId);
      if (!target) return;

      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: 'completed' } : a))
      );

      if (target.status === 'active') {
        setTrainers((prev) =>
          prev.map((t) =>
            t.id === target.trainerId
              ? { ...t, assignedClients: Math.max(0, (t.assignedClients || 1) - 1) }
              : t
          )
        );
      }
    },
    [assignments]
  );

  // Training Sessions CRUD
  const createTrainingSession = useCallback(
    (payload) => {
      const conflict = hasTrainerScheduleConflict(sessions, {
        trainerId: payload.trainerId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });

      if (conflict) {
        return {
          ok: false,
          error: `Trainer already has "${conflict.sessionType}" with ${conflict.memberName} (${conflict.startTime}–${conflict.endTime}).`,
        };
      }

      const trainer = trainers.find((t) => t.id === payload.trainerId);
      const branch = tenantBranches.find((b) => b.id === payload.branchId) || tenantBranches[0];

      const newSession = {
        id: `SES-${Math.floor(710 + Math.random() * 280)}`,
        tenantId: activeTenant.id,
        trainerId: payload.trainerId,
        trainerName: trainer?.fullName || payload.trainerName,
        memberId: payload.memberId,
        memberName: payload.memberName,
        branchId: branch?.id || payload.branchId || trainer?.branchId,
        branchName: branch?.name || trainer?.branchName || 'Main Branch',
        sessionType: payload.sessionType || 'Personal Training',
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: 'scheduled',
        rating: null,
        notes: payload.notes || '',
      };

      setSessions((prev) => [newSession, ...prev]);
      return { ok: true, session: newSession };
    },
    [sessions, trainers, tenantBranches, activeTenant.id]
  );

  const updateTrainingSession = useCallback(
    (sessionId, updates) => {
      if (updates.date || updates.startTime || updates.endTime || updates.trainerId) {
        const current = sessions.find((s) => s.id === sessionId);
        if (current) {
          const conflict = hasTrainerScheduleConflict(sessions, {
            trainerId: updates.trainerId || current.trainerId,
            date: updates.date || current.date,
            startTime: updates.startTime || current.startTime,
            endTime: updates.endTime || current.endTime,
            excludeSessionId: sessionId,
          });
          if (conflict) {
            return {
              ok: false,
              error: `Overlaps with ${conflict.memberName}'s session (${conflict.startTime}–${conflict.endTime}).`,
            };
          }
        }
      }

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
      );
      return { ok: true };
    },
    [sessions]
  );

  // Staff CRUD
  const registerStaff = useCallback(
    (formData, { asDraft = false } = {}) => {
      const branch = tenantBranches.find((b) => b.id === formData.branchId) || tenantBranches[0];
      const staffId = `EMP-${Math.floor(210 + Math.random() * 780)}`;

      const newStaff = {
        id: staffId,
        tenantId: activeTenant.id,
        branchId: branch?.id || formData.branchId || 'br_downtown',
        branchName: branch?.name || 'Main Branch',
        fullName: formData.fullName.trim(),
        avatar: formData.avatar || TRAINER_STAFF_MEDIA.operationsStaff,
        role: formData.role || 'Receptionist',
        department: formData.department?.trim() || 'Operations',
        gender: formData.gender || 'Male',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address?.trim() || '',
        emergencyContactName: formData.emergencyContactName?.trim() || '',
        emergencyContactPhone: formData.emergencyContactPhone?.trim() || '',
        joiningDate: formData.joiningDate || '2026-11-19',
        employmentType: formData.employmentType || 'Full-time',
        shiftTiming: formData.shiftTiming || '09:00 - 17:30',
        workingDays:
          Array.isArray(formData.workingDays) && formData.workingDays.length > 0
            ? formData.workingDays
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        status: asDraft ? 'inactive' : formData.status || 'active',
        salaryType: formData.salaryType || 'Monthly',
        basicSalary: Number(formData.basicSalary) || 3500,
        allowances: Number(formData.allowances) || 0,
        deductions: Number(formData.deductions) || 0,
        paymentFrequency: formData.paymentFrequency || 'Monthly',
        bankName: formData.bankName?.trim() || 'Chase Commercial Bank',
        accountLast4: formData.accountLast4?.trim() || '1204',
        responsibilities:
          typeof formData.responsibilities === 'string'
            ? formData.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
            : formData.responsibilities || ['Branch floor support'],
        documents: formData.documents || [],
        notes: formData.notes?.trim() || '',
      };

      setStaffList((prev) => [newStaff, ...prev]);
      return newStaff;
    },
    [activeTenant.id, tenantBranches]
  );

  const updateStaff = useCallback(
    (staffId, formData) => {
      const branch = tenantBranches.find((b) => b.id === formData.branchId);
      setStaffList((prev) =>
        prev.map((s) => {
          if (s.id !== staffId) return s;
          return {
            ...s,
            ...formData,
            branchName: branch?.name || s.branchName,
            basicSalary: Number(formData.basicSalary ?? s.basicSalary),
            allowances: Number(formData.allowances ?? s.allowances),
            deductions: Number(formData.deductions ?? s.deductions),
            responsibilities:
              typeof formData.responsibilities === 'string'
                ? formData.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
                : formData.responsibilities || s.responsibilities,
          };
        })
      );
    },
    [tenantBranches]
  );

  const toggleStaffStatus = useCallback((staffId) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  }, []);

  // Staff Attendance
  const markStaffAttendance = useCallback(
    (payload) => {
      setStaffAttendance((prev) => {
        const existingIndex = prev.findIndex(
          (a) =>
            a.tenantId === activeTenant.id &&
            a.personId === payload.personId &&
            a.date === payload.date
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...payload,
          };
          return updated;
        }
        return [
          {
            id: `SAT-${Math.floor(920 + Math.random() * 80)}`,
            tenantId: activeTenant.id,
            ...payload,
          },
          ...prev,
        ];
      });
    },
    [activeTenant.id]
  );

  // Payroll CRUD (Demo-only frontend ledger)
  const generatePayrollRecord = useCallback(
    (payload) => {
      const computed = calculateNetSalary(payload);
      const newRecord = {
        id: `PAY-${Math.floor(410 + Math.random() * 580)}`,
        tenantId: activeTenant.id,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        employeeType: payload.employeeType || 'Staff',
        role: payload.role,
        branchId: payload.branchId,
        branchName: payload.branchName,
        salaryMonth: payload.salaryMonth || '2026-11',
        salaryMonthLabel: payload.salaryMonthLabel || 'November 2026',
        salaryType: payload.salaryType || 'Monthly',
        basicSalary: computed.basicSalary,
        allowances: computed.allowances,
        deductions: computed.deductions,
        netSalary: computed.netSalary,
        paymentDate: payload.paymentDate || '2026-11-28',
        paymentMethod: payload.paymentMethod || 'ACH Payroll (Demo)',
        paymentStatus: payload.paymentStatus || 'pending',
        notes: payload.notes || '',
      };

      setPayrollRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    },
    [activeTenant.id]
  );

  const markPayrollPaid = useCallback((payrollId, paymentMethod = 'ACH Payroll (Demo)') => {
    const today = '2026-11-19';
    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.id === payrollId
          ? {
            ...p,
            paymentStatus: 'paid',
            paymentDate: today,
            paymentMethod,
          }
          : p
      )
    );
  }, []);

  const value = {
    trainers: scopedTrainers,
    allTenantTrainers: tenantTrainers,
    assignments: scopedAssignments,
    allTenantAssignments: tenantAssignments,
    sessions: scopedSessions,
    allTenantSessions: tenantSessions,
    staff: scopedStaff,
    allTenantStaff: tenantStaff,
    staffAttendance: scopedStaffAttendance,
    allTenantStaffAttendance: tenantStaffAttendance,
    payroll: scopedPayroll,
    allTenantPayroll: tenantPayroll,
    getTrainerById,
    getStaffById,
    getPayrollById,
    registerTrainer,
    updateTrainer,
    toggleTrainerStatus,
    createAssignment,
    reassignTrainer,
    endAssignment,
    createTrainingSession,
    updateTrainingSession,
    registerStaff,
    updateStaff,
    toggleStaffStatus,
    markStaffAttendance,
    generatePayrollRecord,
    markPayrollPaid,
  };

  return (
    <TrainerStaffContext.Provider value={value}>
      {children}
    </TrainerStaffContext.Provider>
  );
}

export function useTrainerStaff() {
  const ctx = useContext(TrainerStaffContext);
  if (!ctx) {
    throw new Error('useTrainerStaff must be used inside TrainerStaffProvider');
  }
  return ctx;
}
