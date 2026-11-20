export const ATTENDANCE_TODAY = '2026-11-19';

/**
 * Generates a deterministic non-sensitive opaque QR token for a member.
 * Never embeds emails, phone numbers, passwords, or documents.
 */
export function generateMemberQrToken(memberOrId) {
  const memberId = typeof memberOrId === 'string' ? memberOrId : memberOrId?.id || '';
  if (!memberId) return '';

  let hash = 2166136261;
  for (let i = 0; i < memberId.length; i += 1) {
    hash ^= memberId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padEnd(6, '0');
  return `GymPilot:PASS:${memberId}:${suffix}`;
}

/**
 * Parses either an opaque GymPilot:PASS:<MEMBER_ID>:<TOKEN> QR string
 * or a direct member identifier (e.g. MEM-4094) for manual lookup.
 */
export function parseQrAttendanceInput(rawInput) {
  const cleaned = String(rawInput || '').trim();
  if (!cleaned) {
    return { valid: false, memberId: null, error: 'QR payload or Member ID is empty.' };
  }

  if (cleaned.toUpperCase().startsWith('GymPilot:PASS:')) {
    const parts = cleaned.split(':');
    if (parts.length !== 4 || !parts[2]) {
      return { valid: false, memberId: null, error: 'Malformed gym pass QR token.' };
    }
    const candidateId = parts[2].trim().toUpperCase();
    const expectedToken = generateMemberQrToken(candidateId);
    if (expectedToken.toUpperCase() !== cleaned.toUpperCase()) {
      return {
        valid: false,
        memberId: null,
        error: 'QR verification signature mismatch. Please regenerate the member pass.',
      };
    }
    return { valid: true, memberId: candidateId, token: expectedToken, error: null };
  }

  // Allow direct opaque Member ID entry (e.g. MEM-4094)
  if (/^MEM-\d{3,6}$/i.test(cleaned)) {
    return {
      valid: true,
      memberId: cleaned.toUpperCase(),
      token: generateMemberQrToken(cleaned.toUpperCase()),
      error: null,
    };
  }

  return {
    valid: false,
    memberId: null,
    error: 'Unrecognized QR code format. Scan an official GymPilot Member QR Pass.',
  };
}

/**
 * Converts "HH:MM" (24h) or "06:42 AM" (12h) to minutes since midnight.
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const trimmed = String(timeStr).trim().toUpperCase();

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const mins = Number(amPmMatch[2]);
    const period = amPmMatch[3];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    return Number(h24Match[1]) * 60 + Number(h24Match[2]);
  }

  return null;
}

export function formatMinutesTo12h(totalMins) {
  if (totalMins === null || totalMins === undefined || Number.isNaN(totalMins)) return '—';
  const normalized = ((Math.round(totalMins) % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export function getCurrentFormattedTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return formatMinutesTo12h(h * 60 + m);
}

export function calculateDurationMinutes(checkInStr, checkOutStr) {
  const start = parseTimeToMinutes(checkInStr);
  const end = parseTimeToMinutes(checkOutStr);
  if (start === null || end === null) return null;
  if (end >= start) return end - start;
  return 1440 - start + end;
}

export function formatDurationLabel(minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) {
    return '—';
  }
  const mins = Math.max(0, Math.round(Number(minutes)));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function isTimeWithinAllowedWindow(timeStr, startWindow, endWindow, graceMinutes = 0) {
  const target = parseTimeToMinutes(timeStr);
  const start = parseTimeToMinutes(startWindow);
  const end = parseTimeToMinutes(endWindow);
  if (target === null || start === null || end === null) return true;
  return target >= start - Number(graceMinutes || 0) && target <= end + Number(graceMinutes || 0);
}

export function exportAttendanceCsv(rows, filename = 'attendance_report.csv') {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
