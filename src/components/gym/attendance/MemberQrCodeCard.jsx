import { useRef } from 'react';
import { Download, Printer, QrCode, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import StatusBadge from '../../common/StatusBadge';
import UserAvatar from '../../common/UserAvatar';
import Button from '../../ui/Button';
import { generateMemberQrToken } from '../../../utils/attendanceUtils';
import { formatDate } from '../../../utils/formatters';

export function MemberQrCodeCard({
  member,
  tenantName = 'Ironworks Club',
  onOpenIdCard,
  compact = false,
}) {
  const canvasWrapRef = useRef(null);

  if (!member) return null;

  const qrToken = generateMemberQrToken(member);

  const handleDownloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR canvas unavailable');
      return;
    }
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${member.id}_Attendance_QR.png`;
    link.click();
    toast.success(`Downloaded QR pass for ${member.fullName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900">Member Attendance QR Pass</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Opaque access token · No personal phone, email, or document data encoded
          </p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shrink-0">
          <QRCodeSVG
            value={qrToken}
            size={compact ? 118 : 148}
            bgColor="#FFFFFF"
            fgColor="#14213D"
            level="M"
          />
          {/* Hidden high-resolution canvas for PNG download */}
          <div ref={canvasWrapRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={qrToken}
              size={320}
              bgColor="#FFFFFF"
              fgColor="#14213D"
              level="M"
              includeMargin
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <UserAvatar src={member.avatar} name={member.fullName} size="md" className="mx-auto sm:mx-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{member.fullName}</p>
              <p className="text-xs text-slate-500 truncate">
                {tenantName} · {member.branchName}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Member ID</span>
              <span className="font-mono font-semibold text-navy-900">{member.id}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">QR Pass Token</span>
              <span className="font-mono text-[11px] text-slate-700 truncate">{qrToken}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Plan Validity</span>
              <span className="font-mono text-slate-700">{formatDate(member.expiryDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Scannable at any authorized {tenantName} kiosk</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Button variant="emerald" size="sm" leftIcon={Download} onClick={handleDownloadPng}>
          Download QR Code
        </Button>
        <Button variant="outline" size="sm" leftIcon={Printer} onClick={handlePrint}>
          Print QR Pass
        </Button>
        {onOpenIdCard && (
          <Button variant="outline" size="sm" onClick={onOpenIdCard}>
            Open Member ID Card
          </Button>
        )}
      </div>
    </div>
  );
}

export default MemberQrCodeCard;
