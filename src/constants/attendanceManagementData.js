export const ATTENDANCE_MEDIA = {
  scannerGraphic: '',
  emptyQrScan: '',
};

export const INITIAL_ATTENDANCE_SETTINGS = {
  qrRefreshSeconds: 15,
  allowMultipleDailyCheckIns: true,
  cooldownMinutes: 30,
  requireGeofence: false,
  geofenceRadiusMeters: 100,
  enableCheckOutTracking: true,
  autoCheckoutHours: 4,
  allowManualCheckIn: true,
  requireStaffApprovalForManual: false,
  allowCorrectionRequests: true,
  correctionAutoExpiryDays: 7,
  maxDailyVisitsAllowed: 2,
};

export const INITIAL_ATTENDANCE_RECORDS = [];

export const INITIAL_CORRECTION_REQUESTS = [];

export const ATTENDANCE_CHARTS_SERIES = {
  hourlyDistribution: [],
  weeklyTrend: [],
  monthlyPeakDays: [],
  branchComparison: [],
};

export const ATTENDANCE_DATE_RANGES = [
  { key: 'today', label: 'Today', scale: 0.14 },
  { key: '7d', label: 'Last 7 Days', scale: 0.28 },
  { key: '30d', label: 'Last 30 Days', scale: 1 },
  { key: '90d', label: 'Last 3 Months', scale: 2.8 },
];
