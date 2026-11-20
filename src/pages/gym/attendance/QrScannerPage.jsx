import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Flashlight,
  History,
  LogIn,
  LogOut,
  QrCode,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ATTENDANCE_MEDIA } from '../../../constants/attendanceManagementData';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { cn } from '../../../utils/cn';
import { formatDurationLabel, generateMemberQrToken } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

const SCANNER_ELEMENT_ID = 'GymPilot-qr-reader-viewport';

export function QrScannerPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const {
    tenantSettings,
    recentScans,
    verifyMemberForAttendance,
    confirmCheckIn,
    confirmCheckOut,
  } = useAttendanceManagement();

  const scannerRef = useRef(null);
  const [scanMode, setScanMode] = useState('auto'); // 'auto' | 'checkin' | 'checkout'
  const [selectedBranchId, setSelectedBranchId] = useState(
    tenantBranches[0]?.id || 'br_downtown'
  );

  // Camera state
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [scannerStatus, setScannerStatus] = useState('idle'); // 'idle' | 'starting' | 'scanning' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Verification & Lookup state
  const [manualInput, setManualInput] = useState('');
  const [verification, setVerification] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current;
    if (instance) {
      try {
        if (instance.isScanning) {
          await instance.stop();
        }
        await instance.clear();
      } catch {
        // Ignore cleanup errors when stopping unmounted/stopped stream
      }
    }
    setTorchOn(false);
    setTorchSupported(false);
    setScannerStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      const instance = scannerRef.current;
      if (instance) {
        try {
          if (instance.isScanning) {
            instance.stop().catch(() => { });
          }
          instance.clear();
        } catch {
          // Ignore unmount errors
        }
      }
    };
  }, []);

  const handleDecodedPayload = useCallback(
    (decodedText) => {
      setActionResult(null);
      const result = verifyMemberForAttendance(decodedText, scanMode);
      setVerification(result);

      if (result.statusTone === 'success') {
        toast.success(result.headline);
      } else if (result.statusTone === 'warning') {
        toast(result.headline);
      } else {
        toast.error(result.headline);
      }
    },
    [verifyMemberForAttendance, scanMode]
  );

  const handleStartScanner = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScannerStatus('error');
      setCameraError({
        type: 'unavailable',
        title: 'Camera API Unavailable',
        detail:
          'This browser or non-HTTPS context does not expose camera capture. Use Manual Member ID lookup or Simulated Pass verification on the right.',
      });
      return;
    }

    setScannerStatus('starting');
    try {
      const deviceList = await Html5Qrcode.getCameras();
      if (!deviceList || deviceList.length === 0) {
        setScannerStatus('error');
        setCameraError({
          type: 'unavailable',
          title: 'No Camera Hardware Detected',
          detail:
            'No webcam or rear scanner camera was found on this device. Connect a camera or use Manual Member ID lookup below.',
        });
        return;
      }

      setCameras(deviceList);
      const chosenId = selectedCameraId || deviceList[deviceList.length - 1].id;
      setSelectedCameraId(chosenId);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID, false);
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        chosenId,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          handleDecodedPayload(decodedText);
        },
        () => {
          // Per-frame non-match is normal while positioning QR
        }
      );

      setScannerStatus('scanning');

      // Detect torch capability safely if supported by running video track
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities?.();
        setTorchSupported(Boolean(capabilities?.torch));
      } catch {
        setTorchSupported(false);
      }
    } catch (err) {
      const msg = String(err?.message || err || '');
      const isDenied =
        msg.toLowerCase().includes('permission') ||
        msg.toLowerCase().includes('notallowed') ||
        msg.toLowerCase().includes('denied');

      setScannerStatus('error');
      setCameraError({
        type: isDenied ? 'denied' : 'init_error',
        title: isDenied ? 'Camera Permission Denied' : 'Unable to Initialize Camera',
        detail: isDenied
          ? 'Browser camera permission was denied. Allow camera access in your browser site settings and click Start Scanner again, or use Manual Member ID entry.'
          : `Camera initialization failed (${msg || 'device busy or unavailable'}). You can still verify members using Manual Member ID entry.`,
      });
    }
  };

  const handleCameraSwitch = async (nextId) => {
    setSelectedCameraId(nextId);
    if (scannerStatus === 'scanning') {
      await stopScanner();
      setTimeout(() => {
        handleStartScanner();
      }, 150);
    }
  };

  const handleToggleTorch = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const next = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch {
      toast.error('Flashlight control is not supported by this camera.');
      setTorchSupported(false);
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error('Enter a Member ID (e.g. MEM-4094) or QR token');
      return;
    }
    handleDecodedPayload(manualInput.trim());
  };

  const handleConfirmCheckIn = () => {
    if (!verification?.member) return;
    const res = confirmCheckIn({
      memberId: verification.member.id,
      branchId: selectedBranchId || verification.member.branchId,
      source: 'QR Code',
    });
    if (res.ok) {
      setActionResult({
        type: 'checkin_success',
        headline: 'Check-in Successful (Demo State)',
        detail: `${res.record.memberName} checked in at ${res.record.checkInTime} · ${res.record.branchName}`,
        record: res.record,
      });
      toast.success(`Check-in recorded for ${res.record.memberName}`);
      // Refresh verification state to reflect active session
      setVerification(verifyMemberForAttendance(verification.member.id, scanMode));
    } else {
      toast.error(res.message);
      setActionResult({
        type: 'error',
        headline: 'Already Checked In',
        detail: res.message,
      });
    }
  };

  const handleConfirmCheckOut = () => {
    if (!verification?.member) return;
    const res = confirmCheckOut({
      memberId: verification.member.id,
      attendanceId: verification.activeSession?.id,
      source: 'QR Code',
    });
    if (res.ok) {
      setActionResult({
        type: 'checkout_success',
        headline: 'Check-out Successful (Demo State)',
        detail: `${res.record.memberName} checked out at ${res.record.checkOutTime} · Total duration ${formatDurationLabel(
          res.record.durationMinutes
        )}`,
        record: res.record,
      });
      toast.success(
        `Checked out ${res.record.memberName} (${formatDurationLabel(res.record.durationMinutes)})`
      );
      setVerification(verifyMemberForAttendance(verification.member.id, scanMode));
    } else {
      toast.error(res.message);
    }
  };

  const sampleTestCases = [
    {
      label: 'Jordan Mercer (Active)',
      value: generateMemberQrToken('MEM-4094'),
    },
    {
      label: 'Priya Nair (Inside Now)',
      value: generateMemberQrToken('MEM-4093'),
    },
    {
      label: 'Noah Lindholm (Expired)',
      value: generateMemberQrToken('MEM-4088'),
    },
    {
      label: 'Lucas Vance (On Hold)',
      value: generateMemberQrToken('MEM-4092'),
    },
    {
      label: 'Invalid QR Test',
      value: 'UNKNOWN-BAD-QR-999',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Code Attendance Scanner"
        subtitle="Scan member QR passes using your device camera or verify by Member ID. Demo state is saved locally in your browser."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={History}
              onClick={() => navigate('/gym/attendance/history')}
            >
              Attendance Log
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/gym/attendance')}
            >
              Overview
            </Button>
          </div>
        }
      />

      {!tenantSettings.qrAttendanceEnabled && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>QR Attendance is currently disabled in Attendance Settings.</span>
          </div>
          <Link
            to="/gym/attendance/settings"
            className="text-xs font-semibold text-amber-900 underline shrink-0"
          >
            Enable in Settings
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Large Central Camera Scanner Area */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          {/* Scanner Mode & Branch Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1.5">Scanner Mode</p>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  { key: 'auto', label: 'Auto' },
                  { key: 'checkin', label: 'Check-in' },
                  { key: 'checkout', label: 'Check-out' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setScanMode(m.key)}
                    className={cn(
                      'flex-1 rounded-md px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                      scanMode === m.key
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Kiosk Branch"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={tenantBranches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>

          {/* Camera Preview Viewport Container */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-navy-950 min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
            <div
              id={SCANNER_ELEMENT_ID}
              className={cn('w-full h-full', scannerStatus === 'scanning' ? 'block' : 'hidden')}
            />

            {scannerStatus !== 'scanning' && (
              <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white space-y-4">
                <img
                  src={ATTENDANCE_MEDIA.qrKiosk}
                  alt="QR scanning frame preview"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none"
                />
                <div className="relative z-10 flex flex-col items-center space-y-3 max-w-md">
                  {cameraError ? (
                    <div className="rounded-full bg-red-500/20 p-3.5 text-red-300 border border-red-400/30">
                      <CameraOff className="h-7 w-7" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-emerald-400/70 bg-navy-900/70 p-6">
                      <ScanLine className="h-12 w-12 text-emerald-400" aria-hidden="true" />
                    </div>
                  )}

                  {cameraError ? (
                    <>
                      <h3 className="text-base font-semibold text-white">{cameraError.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{cameraError.detail}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-base font-semibold text-white">
                        {scannerStatus === 'starting'
                          ? 'Requesting Camera Permission...'
                          : 'Camera Scanner Standby'}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Position the member&apos;s QR code inside the scanning frame.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Animated Scanner Corner Overlay when active */}
            {scannerStatus === 'scanning' && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4">
                <span className="rounded-md bg-navy-950/80 px-3 py-1.5 text-xs font-medium text-white border border-white/15">
                  Position the member&apos;s QR code inside the scanning frame.
                </span>
                <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                  <span className="absolute top-0 left-0 h-7 w-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <span className="absolute top-0 right-0 h-7 w-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <span className="absolute bottom-0 left-0 h-7 w-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <span className="absolute bottom-0 right-0 h-7 w-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                  <div className="absolute inset-x-2 top-1/2 h-0.5 bg-emerald-400/80 animate-pulse" />
                </div>
                <span className="rounded-md bg-emerald-600/90 px-3 py-1 text-[11px] font-medium text-white">
                  Live Camera Scanning Active
                </span>
              </div>
            )}
          </div>

          {/* Primary Camera Controls (Touch Friendly >=44px on mobile) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {scannerStatus !== 'scanning' ? (
                <Button
                  variant="emerald"
                  size="md"
                  leftIcon={Camera}
                  onClick={handleStartScanner}
                  disabled={scannerStatus === 'starting'}
                  className="min-h-[44px]"
                >
                  {scannerStatus === 'starting' ? 'Starting Camera...' : 'Start Scanner'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={CameraOff}
                  onClick={stopScanner}
                  className="min-h-[44px]"
                >
                  Stop Scanner
                </Button>
              )}

              {torchSupported && (
                <Button
                  variant={torchOn ? 'primary' : 'outline'}
                  size="md"
                  leftIcon={Flashlight}
                  onClick={handleToggleTorch}
                  className="min-h-[44px]"
                >
                  {torchOn ? 'Flashlight On' : 'Flashlight'}
                </Button>
              )}
            </div>

            {cameras.length > 0 && (
              <div className="w-full sm:w-56">
                <Select
                  aria-label="Select camera device"
                  value={selectedCameraId}
                  onChange={(e) => handleCameraSwitch(e.target.value)}
                  options={cameras.map((cam, idx) => ({
                    value: cam.id,
                    label: cam.label || `Camera ${idx + 1}`,
                  }))}
                />
              </div>
            )}
          </div>

          {/* Manual Member ID / Token Fallback + Demo QR Quick Triggers */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1">
                <Input
                  label="Manual Member ID or QR Token Entry"
                  placeholder="Enter Member ID (e.g. MEM-4094) or scan payload..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
              </div>
              <div className="sm:self-end">
                <Button type="submit" variant="primary" size="md" leftIcon={Search} className="w-full sm:w-auto min-h-[42px]">
                  Verify Pass
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">
                Quick Verification Test Scenarios (Simulated QR Payloads):
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleTestCases.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setManualInput(sample.value);
                      handleDecodedPayload(sample.value);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Member Verification Panel & Recent Scans */}
        <div className="xl:col-span-5 space-y-6">
          {/* Action Success Banner */}
          {actionResult && (
            <div
              className={cn(
                'rounded-xl border p-4 flex items-start gap-3',
                actionResult.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-950'
              )}
            >
              {actionResult.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{actionResult.headline}</p>
                <p className="text-xs mt-0.5 opacity-90">{actionResult.detail}</p>
              </div>
            </div>
          )}

          {/* Member Verification Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-navy-900" aria-hidden="true" />
                <h2 className="text-base font-semibold text-slate-900">Member Verification Panel</h2>
              </div>
              {verification && (
                <button
                  type="button"
                  onClick={() => {
                    setVerification(null);
                    setActionResult(null);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {!verification ? (
              <div className="py-6 text-center space-y-3">
                <img
                  src={ATTENDANCE_MEDIA.emptyState}
                  alt="QR verification awaiting scan"
                  referrerPolicy="no-referrer"
                  className="mx-auto h-36 w-52 rounded-xl object-cover border border-slate-200"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">Awaiting Member QR Scan</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Scan a member&apos;s QR pass or enter their Member ID ({tenantMembers[0]?.id || 'MEM-4094'}) to verify membership status and log attendance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Verification Result Alert */}
                <div
                  className={cn(
                    'rounded-lg border px-4 py-3 flex items-start gap-3',
                    verification.statusTone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-950',
                    verification.statusTone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-950',
                    verification.statusTone === 'error' && 'border-red-200 bg-red-50 text-red-950'
                  )}
                >
                  {verification.statusTone === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {verification.statusTone === 'warning' && (
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {verification.statusTone === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{verification.headline}</p>
                    <p className="text-xs mt-0.5">{verification.message}</p>
                  </div>
                </div>

                {/* Verified Member Summary */}
                {verification.member && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        src={verification.member.avatar}
                        name={verification.member.fullName}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {verification.member.fullName}
                          </h3>
                          <StatusBadge status={verification.membership?.effectiveStatus || verification.member.status} />
                        </div>
                        <p className="text-xs font-mono text-slate-600 mt-0.5">
                          {verification.member.id} · {verification.member.branchName}
                        </p>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs">
                      <div>
                        <dt className="text-slate-500">Membership Plan</dt>
                        <dd className="font-semibold text-slate-900 mt-0.5">
                          {verification.membership?.effectivePlan || verification.member.plan}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Home Branch</dt>
                        <dd className="font-medium text-slate-800 mt-0.5">
                          {verification.member.branchName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Membership Expiry</dt>
                        <dd className="font-mono text-slate-800 mt-0.5">
                          {formatDate(verification.membership?.effectiveExpiry || verification.member.expiryDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Current Session</dt>
                        <dd className="font-mono text-slate-800 mt-0.5">
                          {verification.activeSession
                            ? `Inside since ${verification.activeSession.checkInTime}`
                            : 'Not Checked In'}
                        </dd>
                      </div>
                    </dl>

                    {/* Workflow Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {verification.canConfirmCheckin && (
                        <Button
                          variant="emerald"
                          size="md"
                          leftIcon={LogIn}
                          onClick={handleConfirmCheckIn}
                          className="flex-1 min-h-[44px]"
                        >
                          Confirm Check-in
                        </Button>
                      )}
                      {verification.canConfirmCheckout && (
                        <Button
                          variant="primary"
                          size="md"
                          leftIcon={LogOut}
                          onClick={handleConfirmCheckOut}
                          className="flex-1 min-h-[44px]"
                        >
                          Confirm Check-out
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/gym/attendance/member/${verification.member.id}`)}
                      >
                        Attendance Log
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Scan History */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-slate-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-900">Recent Scan History (Session)</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/gym/attendance/check-ins')}
                className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
              >
                Check-ins
              </button>
            </div>

            {recentScans.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No scans logged in this browser session yet. Verify a member pass above to record an event.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentScans.slice(0, 6).map((item) => (
                  <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {item.memberName} <span className="font-mono text-slate-500">({item.memberId})</span>
                      </p>
                      <p className="text-slate-500 truncate">
                        {item.action} · {item.source} {item.branchName ? `· ${item.branchName}` : ''}
                      </p>
                    </div>
                    <span className="font-mono text-slate-500 shrink-0 tabular-nums">{item.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrScannerPage;
