export function formatCurrency(value, currency = 'INR') {
  const numeric = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Computes payroll amounts using the standard formula:
 * Net Salary = Basic Salary + Allowances - Deductions
 * For Per Session or Commission-Based models, base earned pay maps cleanly to basicSalary
 * or can be computed from session counts/revenue before applying allowances & deductions.
 */
export function calculateNetSalary({
  basicSalary = 0,
  allowances = 0,
  deductions = 0,
  salaryType = 'Monthly',
  sessionsCompleted = 0,
  perSessionRate = 0,
  sessionRevenue = 0,
  commissionPercent = 0,
}) {
  const safeAllowances = Math.max(0, Number(allowances) || 0);
  const safeDeductions = Math.max(0, Number(deductions) || 0);

  let effectiveBasic = Math.max(0, Number(basicSalary) || 0);

  if (salaryType === 'Per Session' && Number(perSessionRate) > 0 && Number(sessionsCompleted) > 0) {
    effectiveBasic = Math.round(Number(perSessionRate) * Number(sessionsCompleted) * 100) / 100;
  } else if (
    salaryType === 'Commission-Based' &&
    Number(commissionPercent) > 0 &&
    Number(sessionRevenue) > 0
  ) {
    const commissionEarned = (Number(sessionRevenue) * Number(commissionPercent)) / 100;
    effectiveBasic = Math.round((effectiveBasic + commissionEarned) * 100) / 100;
  }

  const grossSalary = Math.round((effectiveBasic + safeAllowances) * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossSalary - safeDeductions) * 100) / 100);

  return {
    basicSalary: effectiveBasic,
    allowances: safeAllowances,
    deductions: safeDeductions,
    grossSalary,
    netSalary,
  };
}

export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function calculateWorkingHours(checkIn, checkOut) {
  const start = timeToMinutes(checkIn);
  const end = timeToMinutes(checkOut);
  if (start === null || end === null || end <= start) return '0.0 hrs';
  const diff = (end - start) / 60;
  return `${diff.toFixed(1)} hrs`;
}

export function hasTrainerScheduleConflict(
  sessions = [],
  { trainerId, date, startTime, endTime, excludeSessionId = null }
) {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);
  if (!trainerId || !date || newStart === null || newEnd === null || newEnd <= newStart) {
    return null;
  }

  return (
    sessions.find((session) => {
      if (excludeSessionId && session.id === excludeSessionId) return false;
      if (session.trainerId !== trainerId) return false;
      if (session.date !== date) return false;
      if (session.status === 'cancelled') return false;
      const existingStart = timeToMinutes(session.startTime);
      const existingEnd = timeToMinutes(session.endTime);
      if (existingStart === null || existingEnd === null) return false;
      return newStart < existingEnd && newEnd > existingStart;
    }) || null
  );
}

export function exportCsvFile(filename, headers = [], rows = []) {
  const escapeCell = (cell) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
