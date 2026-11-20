import { Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import UserAvatar from '../../common/UserAvatar';
import { generateMemberQrToken } from '../../../utils/attendanceUtils';
import { formatDate, getInitials } from '../../../utils/formatters';

function buildDeterministicQrMatrix(seedStr) {
  const size = 9;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const cells = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3);
      if (isCorner) {
        const border =
          r === 0 ||
          r === 2 ||
          r === size - 1 ||
          r === size - 3 ||
          c === 0 ||
          c === 2 ||
          c === size - 1 ||
          c === size - 3 ||
          (r === 1 && c === 1) ||
          (r === 1 && c === size - 2) ||
          (r === size - 2 && c === 1);
        cells.push({ r, c, filled: border });
      } else {
        const bit = ((hash >> ((r * size + c) % 24)) + r * 3 + c * 7) % 3 !== 0;
        cells.push({ r, c, filled: bit });
      }
    }
  }
  return { size, cells };
}

export function MemberIdCardModal({ isOpen, onClose, member, tenantName = 'Ironworks Club' }) {
  if (!member) return null;

  const qrToken = generateMemberQrToken(member);

  const handleDownloadCard = () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="380" viewBox="0 0 640 380">
  <rect width="640" height="380" rx="20" fill="#14213D"/>
  <rect x="24" y="24" width="592" height="332" rx="14" fill="#1B2B4D" stroke="#334155" stroke-width="1"/>
  <text x="48" y="68" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2">OFFICIAL GYM MEMBER PASS</text>
  <text x="48" y="96" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${tenantName}</text>
  <text x="48" y="156" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="12">MEMBER NAME</text>
  <text x="48" y="182" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${member.fullName}</text>
  <text x="48" y="222" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="12">MEMBER ID</text>
  <text x="48" y="246" fill="#10B981" font-family="monospace" font-size="18" font-weight="700">${member.id}</text>
  <text x="240" y="222" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="12">MEMBERSHIP PLAN</text>
  <text x="240" y="246" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600">${member.plan}</text>
  <text x="48" y="294" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="12">HOME BRANCH</text>
  <text x="48" y="316" fill="#E2E8F0" font-family="Inter, Arial, sans-serif" font-size="14">${member.branchName}</text>
  <text x="240" y="294" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="12">VALID UNTIL</text>
  <text x="240" y="316" fill="#FFFFFF" font-family="monospace" font-size="14">${formatDate(member.expiryDate)}</text>
  <rect x="466" y="156" width="112" height="112" rx="10" fill="#FFFFFF"/>
  <text x="522" y="218" text-anchor="middle" fill="#14213D" font-family="monospace" font-size="12" font-weight="700">${member.id}</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${member.id}_Digital_ID_Card.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ID Card for ${member.fullName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Gym Member ID Card"
      description="Front-desk check-in pass and printable membership credential."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" size="sm" leftIcon={Printer} onClick={handlePrint}>
            Print ID Card
          </Button>
          <Button variant="emerald" size="sm" leftIcon={Download} onClick={handleDownloadCard}>
            Download ID Card
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-navy-900 text-white p-6 border border-navy-800 shadow-lg space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-navy-950 font-display font-bold text-sm shrink-0">
              {getInitials(tenantName)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                Digital Member Pass
              </p>
              <h3 className="text-base font-bold text-white truncate">{tenantName}</h3>
            </div>
          </div>
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-300">
            {member.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              src={member.avatar}
              name={member.fullName}
              size="xl"
              className="border-2 border-emerald-400/60"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-bold text-white truncate">{member.fullName}</p>
              <p className="text-xs font-mono font-semibold text-emerald-400">{member.id}</p>
              <p className="text-xs text-slate-300 truncate">{member.branchName}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-2.5 shrink-0 self-end sm:self-center">
            <QRCodeSVG
              value={qrToken}
              size={84}
              bgColor="#FFFFFF"
              fgColor="#14213D"
              level="M"
              aria-label={`QR verification code for ${member.id}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 pt-4 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Membership Plan</p>
            <p className="font-semibold text-white mt-0.5 truncate">{member.plan}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Valid Until</p>
            <p className="font-mono font-semibold text-white mt-0.5 tabular-nums">
              {formatDate(member.expiryDate)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Member Since</p>
            <p className="font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
              {formatDate(member.joiningDate)}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MemberIdCardModal;
