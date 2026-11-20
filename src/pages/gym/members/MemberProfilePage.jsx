import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  Bell,
  CalendarCheck,
  CreditCard,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  History,
  IdCard,
  MoreHorizontal,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import MemberIdCardModal from '../../../components/gym/members/MemberIdCardModal';
import MemberQrCodeCard from '../../../components/gym/attendance/MemberQrCodeCard';
import { MEMBERSHIP_PLAN_CATALOG } from '../../../constants/memberManagementData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const PROFILE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'membership', label: 'Membership' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'payments', label: 'Payments' },
  { key: 'fitness', label: 'Fitness Profile' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity History' },
];

export function MemberProfilePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { activeTenant } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const {
    getMemberById,
    renewMembership,
    collectMemberPayment,
    markMemberAttendance,
    sendMemberNotification,
    transferMemberBranch,
    updateMemberStatus,
    deleteMember,
  } = useMemberManagement();

  const member = getMemberById(id);

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    PROFILE_TABS.some((t) => t.key === initialTab) ? initialTab : 'overview'
  );

  useEffect(() => {
    const queryTab = searchParams.get('tab');
    if (queryTab && PROFILE_TABS.some((t) => t.key === queryTab)) {
      setActiveTab(queryTab);
    }
  }, [searchParams]);

  // Modals
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewPlan, setRenewPlan] = useState(MEMBERSHIP_PLAN_CATALOG[0]?.name || 'Standard Plan');
  const [renewMethod, setRenewMethod] = useState('Online Card');

  const [collectOpen, setCollectOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState('165');
  const [collectMethod, setCollectMethod] = useState('UPI');

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('Membership Check-in Reminder');
  const [notifyMsg, setNotifyMsg] = useState('We look forward to seeing you at your next training session.');

  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('active');

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferStep, setTransferStep] = useState('form');
  const [destBranchId, setDestBranchId] = useState('');
  const [transferDate, setTransferDate] = useState('2026-11-19');
  const [transferReason, setTransferReason] = useState('');

  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const eligibleTransferBranches = useMemo(
    () =>
      tenantBranches.filter(
        (b) => b.tenantId === activeTenant.id && member && b.id !== member.branchId
      ),
    [tenantBranches, activeTenant.id, member]
  );

  const bmiValue = useMemo(() => {
    if (!member?.heightCm || !member?.weightKg) return '—';
    const hMeters = member.heightCm / 100;
    return (member.weightKg / (hMeters * hMeters)).toFixed(1);
  }, [member]);

  if (!member) {
    return (
      <EmptyState
        title="Member profile not found"
        description="This member record does not exist under the active gym organization."
        actionLabel="Back to Members"
        onAction={() => navigate('/gym/members')}
      />
    );
  }

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams(tabKey === 'overview' ? {} : { tab: tabKey }, { replace: true });
  };

  const handleOpenRenew = () => {
    setRenewPlan(member.plan || MEMBERSHIP_PLAN_CATALOG[0]?.name || 'Standard Plan');
    setRenewMethod('Online Card');
    setRenewOpen(true);
  };

  const handleConfirmRenew = () => {
    const planMeta =
      MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === renewPlan) ||
      MEMBERSHIP_PLAN_CATALOG[0] || {
        name: 'Standard Plan',
        durationMonths: 1,
        price: 99,
      };
    renewMembership(member.id, {
      planName: planMeta.name,
      durationMonths: planMeta.durationMonths || 1,
      amount: planMeta.price || 0,
      method: renewMethod,
    });
    toast.success(`Membership renewed on ${planMeta.name}`);
    setRenewOpen(false);
  };

  const handleOpenCollect = () => {
    setCollectAmount(String(member.pendingDues > 0 ? member.pendingDues : member.monthlyFee || 165));
    setCollectMethod('UPI');
    setCollectOpen(true);
  };

  const handleConfirmCollect = () => {
    const amt = Number(collectAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    collectMemberPayment(member.id, { amount: amt, method: collectMethod });
    toast.success(`Collected ${formatCurrency(amt)} via ${collectMethod}`);
    setCollectOpen(false);
  };

  const handleMarkAttendance = () => {
    markMemberAttendance(member.id);
    toast.success(`Checked in ${member.fullName} at ${member.branchName}`);
  };

  const handleSendNotification = () => {
    if (!notifyTitle.trim() || !notifyMsg.trim()) {
      toast.error('Enter notification title and message');
      return;
    }
    sendMemberNotification(member.id, {
      title: notifyTitle.trim(),
      message: notifyMsg.trim(),
    });
    toast.success(`Notification sent to ${member.fullName}`);
    setNotifyOpen(false);
  };

  const handleOpenTransfer = () => {
    setDestBranchId(eligibleTransferBranches[0]?.id || '');
    setTransferDate('2026-11-19');
    setTransferReason('');
    setTransferStep('form');
    setTransferOpen(true);
  };

  const handleConfirmTransfer = () => {
    const ok = transferMemberBranch(member.id, {
      destinationBranchId: destBranchId,
      transferDate,
      reason: transferReason,
    });
    if (ok) {
      toast.success(`Transferred ${member.fullName} to new branch`);
      setTransferOpen(false);
    } else {
      toast.error('Transfer denied: destination branch must belong to this gym');
    }
  };

  const handleConfirmStatus = () => {
    updateMemberStatus(member.id, nextStatus);
    toast.success(`Updated status to ${nextStatus.replace('_', ' ')}`);
    setStatusOpen(false);
  };

  const handleDelete = () => {
    deleteMember(member.id);
    toast.success(`${member.fullName} removed`);
    navigate('/gym/members');
  };

  const handleDownloadDocument = (docName) => {
    const blob = new Blob(
      [`Member Document Record\nMember: ${member.fullName} (${member.id})\nFile: ${docName}\nBranch: ${member.branchName}`],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${docName}`);
  };

  const attendanceCalendarDays = Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
    const visited =
      member.attendanceHistory?.some((a) => a.date === dateStr) ||
      (member.status === 'active' && [2, 4, 6, 9, 11, 13, 16, 18].includes(day));
    return { day, dateStr, visited };
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/gym/members')}
        >
          Back to Members
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <Link to={`/gym/members/${member.id}/history`} className="hover:text-emerald-700">
            Membership History
          </Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to={`/gym/members/${member.id}/documents`} className="hover:text-emerald-700">
            Document Vault
          </Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to={`/gym/members/${member.id}/progress`} className="hover:text-emerald-700">
            Progress Overview
          </Link>
        </div>
      </div>

      {/* §8 Profile Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            <UserAvatar src={member.avatar} name={member.fullName} size="xl" />
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {member.fullName}
                </h1>
                <StatusBadge status={member.status} />
                <StatusBadge status={member.paymentStatus} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                <span className="font-mono font-semibold text-navy-900">{member.id}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-medium text-slate-800">{member.branchName}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{member.mobile}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="truncate">{member.email}</span>
              </div>

              <p className="text-xs text-slate-500">
                Joined <span className="font-mono text-slate-700">{formatDate(member.joiningDate)}</span>
                {' · '}
                Plan <span className="font-medium text-slate-800">{member.plan}</span>
                {' · '}
                Valid until <span className="font-mono text-slate-700">{formatDate(member.expiryDate)}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Edit3}
              onClick={() => navigate(`/gym/members/${member.id}/edit`)}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={handleOpenRenew}
            >
              Renew Membership
            </Button>
            <Button
              variant="emerald"
              size="sm"
              leftIcon={CreditCard}
              onClick={handleOpenCollect}
            >
              Collect Payment
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={CalendarCheck}
              onClick={handleMarkAttendance}
            >
              Mark Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Bell}
              onClick={() => setNotifyOpen(true)}
            >
              Notify
            </Button>
            <Dropdown
              align="right"
              widthClass="w-56"
              trigger={
                <Button variant="outline" size="sm" leftIcon={MoreHorizontal}>
                  More
                </Button>
              }
              items={[
                {
                  key: 'idcard',
                  label: 'Digital ID Card',
                  icon: IdCard,
                  onClick: () => setIdCardOpen(true),
                },
                {
                  key: 'transfer',
                  label: 'Branch Transfer',
                  icon: ArrowLeftRight,
                  onClick: handleOpenTransfer,
                },
                {
                  key: 'history',
                  label: 'Membership History',
                  icon: History,
                  onClick: () => navigate(`/gym/members/${member.id}/history`),
                },
                {
                  key: 'documents',
                  label: 'Member Documents',
                  icon: FolderOpen,
                  onClick: () => navigate(`/gym/members/${member.id}/documents`),
                },
                {
                  key: 'progress',
                  label: 'Progress Overview',
                  icon: Activity,
                  onClick: () => navigate(`/gym/members/${member.id}/progress`),
                },
                {
                  key: 'status',
                  label: 'Change Status',
                  icon: ShieldAlert,
                  onClick: () => {
                    setNextStatus(member.status === 'active' ? 'on_hold' : 'active');
                    setStatusOpen(true);
                  },
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete Member',
                  icon: Trash2,
                  danger: true,
                  onClick: () => setDeleteOpen(true),
                },
              ]}
            />
          </div>
        </div>

        {/* 8-Tab Navigation */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto border-t border-slate-200 pt-3">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                activeTab === tab.key
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Visits"
              value={String(member.totalVisits || 0)}
              helperText={`${member.monthlyAttendance || 0} this month`}
              icon={CalendarCheck}
            />
            <StatCard
              label="Total Paid"
              value={formatCurrency(member.totalPaid || 0)}
              helperText="lifetime member spend"
              icon={CreditCard}
            />
            <StatCard
              label="Pending Dues"
              value={formatCurrency(member.pendingDues || 0)}
              trend={member.pendingDues > 0 ? 'down' : 'neutral'}
              helperText={member.pendingDues > 0 ? 'requires collection' : 'account settled'}
              icon={RefreshCw}
            />
            <StatCard
              label="Body Weight / BMI"
              value={member.weightKg ? `${member.weightKg} kg` : '—'}
              helperText={bmiValue !== '—' ? `BMI ${bmiValue}` : 'add metrics in Fitness'}
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Active Plan & Access</h2>
                <Button variant="outline" size="sm" leftIcon={IdCard} onClick={() => setIdCardOpen(true)}>
                  View Digital ID Card
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Current Plan</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{member.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Monthly Fee</p>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {formatCurrency(member.monthlyFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Assigned Branch</p>
                  <p className="font-medium text-slate-800 mt-0.5">{member.branchName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cycle Start</p>
                  <p className="font-mono text-slate-700 mt-0.5">{formatDate(member.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expiry Date</p>
                  <p className="font-mono text-slate-700 mt-0.5">{formatDate(member.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Check-in</p>
                  <p className="font-mono text-slate-700 mt-0.5 text-xs">{member.lastVisit}</p>
                </div>
              </div>

              {member.notes && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Member Notes:</span> {member.notes}
                </div>
              )}
            </div>

            <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                <button
                  type="button"
                  onClick={() => handleTabChange('activity')}
                  className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>
              <ul className="space-y-3">
                {(member.activityHistory || []).slice(0, 4).map((act) => (
                  <li key={act.id} className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-900">{act.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{act.timestamp}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Personal & Contact Details
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Full Name</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{member.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Date of Birth</dt>
                <dd className="font-mono text-slate-800 mt-0.5">{formatDate(member.dob)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Gender</dt>
                <dd className="text-slate-800 mt-0.5">{member.gender}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Blood Group</dt>
                <dd className="font-mono text-slate-800 mt-0.5">{member.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Mobile Number</dt>
                <dd className="font-mono text-slate-800 mt-0.5">{member.mobile}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Alternate Mobile</dt>
                <dd className="font-mono text-slate-800 mt-0.5">{member.altMobile || '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Email Address</dt>
                <dd className="text-slate-800 mt-0.5">{member.email}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Address & Emergency Contact
              </h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Full Address</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {member.fullAddress || '—'} · {member.city}, {member.state} {member.pinCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Emergency Contact</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {member.emergencyName || '—'} ({member.emergencyRelation || 'Contact'})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Emergency Phone</dt>
                  <dd className="font-mono text-slate-800 mt-0.5">{member.emergencyMobile || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Referral Source</dt>
                  <dd className="text-slate-800 mt-0.5">{member.referralSource || 'Walk-in'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Referred By</dt>
                  <dd className="text-slate-800 mt-0.5">{member.referredBy || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Membership & Branch Control</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current branch: <span className="font-semibold text-slate-800">{member.branchName}</span> · Plan: {member.plan}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={ArrowLeftRight} onClick={handleOpenTransfer}>
                Transfer Branch
              </Button>
              <Button variant="emerald" size="sm" leftIcon={RefreshCw} onClick={handleOpenRenew}>
                Renew Plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={History}
                onClick={() => navigate(`/gym/members/${member.id}/history`)}
              >
                Full History Page
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Membership Cycle History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cycle ID</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Start Date</th>
                    <th className="px-4 py-3 font-medium">End Date</th>
                    <th className="px-4 py-3 font-medium">Fee</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(member.membershipHistory || []).map((cycle) => (
                    <tr key={cycle.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{cycle.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{cycle.plan}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(cycle.startDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(cycle.endDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{formatCurrency(cycle.fee)}</td>
                      <td className="px-4 py-3"><StatusBadge status={cycle.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(member.transferHistory || []).length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Branch Transfer Log</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {member.transferHistory.map((trf) => (
                  <div key={trf.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">
                        {trf.fromBranch} → {trf.toBranch}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{trf.reason}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-500">{formatDate(trf.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">November Attendance Grid</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {member.monthlyAttendance || 0} check-ins this month · {member.totalVisits || 0} lifetime visits
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleMarkAttendance}>
                  Check In Now
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {attendanceCalendarDays.map((item) => (
                  <div
                    key={item.day}
                    title={`${item.dateStr}: ${item.visited ? 'Checked in' : 'No visit'}`}
                    className={cn(
                      'h-9 rounded-lg border flex items-center justify-center text-xs font-mono tabular-nums',
                      item.visited
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    )}
                  >
                    {item.day}
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Check-in & Check-out Log</h2>
                <Link
                  to={`/gym/attendance/member/${member.id}`}
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Full Attendance Analytics
                </Link>
              </div>
              {(member.attendanceHistory || []).length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No check-in logs recorded yet. Use &ldquo;Mark Attendance&rdquo; to log a visit.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Check-in</th>
                        <th className="px-4 py-3 font-medium">Check-out</th>
                        <th className="px-4 py-3 font-medium">Branch</th>
                        <th className="px-4 py-3 font-medium">Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.attendanceHistory.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(log.date)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-900 font-medium">{log.checkIn}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{log.checkOut}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{log.branch}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{log.session}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <MemberQrCodeCard
            member={member}
            tenantName={activeTenant.name}
            onOpenIdCard={() => setIdCardOpen(true)}
          />
        </div>
      )}

      {/* TAB 5: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Paid"
              value={formatCurrency(member.totalPaid || 0)}
              helperText="settled receipts"
              icon={CreditCard}
            />
            <StatCard
              label="Pending Dues"
              value={formatCurrency(member.pendingDues || 0)}
              trend={member.pendingDues > 0 ? 'down' : 'neutral'}
              helperText={member.pendingDues > 0 ? 'balance due' : 'all clear'}
              icon={RefreshCw}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Payment Action</p>
                <p className="mt-1 text-xs text-slate-600">Record cash, UPI, or card fee</p>
              </div>
              <Button variant="emerald" size="sm" onClick={handleOpenCollect}>
                Collect Fee
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Member Payment & Receipt History</h2>
            </div>
            {(member.payments || []).length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No payment receipts generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Receipt ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {member.payments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{pay.id}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(pay.date)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-800">{pay.plan}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{pay.method}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                          {formatCurrency(pay.amount)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={pay.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloaded receipt ${pay.id}.pdf`)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-navy-800 hover:underline cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FITNESS PROFILE */}
      {activeTab === 'fitness' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Fitness Profile & Training Goals</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Self-reported training baseline and optional measurements (non-medical).
              </p>
            </div>
            <Button
              variant="emerald"
              size="sm"
              leftIcon={Activity}
              onClick={() => navigate(`/gym/members/${member.id}/progress`)}
            >
              Open Progress Overview
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Height</p>
              <p className="font-mono text-lg font-bold text-slate-900 mt-1">
                {member.heightCm ? `${member.heightCm} cm` : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Weight</p>
              <p className="font-mono text-lg font-bold text-slate-900 mt-1">
                {member.weightKg ? `${member.weightKg} kg` : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Calculated BMI</p>
              <p className="font-mono text-lg font-bold text-slate-900 mt-1">{bmiValue}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Experience Level</p>
              <p className="text-base font-bold text-slate-900 mt-1">{member.experienceLevel || '—'}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <dt className="text-xs text-slate-500">Primary Fitness Goal</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{member.fitnessGoal || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Training Preferences</dt>
              <dd className="text-slate-800 mt-0.5">{member.preferences || '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs text-slate-500">Medical / Clearance Notes (Optional)</dt>
              <dd className="text-slate-700 mt-0.5">{member.medicalNotes || 'None listed'}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* TAB 7: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Member Verification Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identity verification, address proof, and signed waivers.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={FolderOpen}
              onClick={() => navigate(`/gym/members/${member.id}/documents`)}
            >
              Manage Document Vault
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Profile Photograph', value: member.documents?.profilePhoto || 'profile_photo.jpg' },
              { label: 'Identity Proof', value: member.documents?.identityProof },
              { label: 'Address Proof', value: member.documents?.addressProof },
              { label: 'Medical Certificate (Optional)', value: member.documents?.medicalCertificate },
            ].map((doc) => (
              <div
                key={doc.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{doc.label}</p>
                  <p className="text-sm font-medium text-slate-900 truncate mt-0.5">
                    {doc.value || 'Not uploaded'}
                  </p>
                </div>
                {doc.value && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewDoc({ label: doc.label, name: doc.value })}
                      className="px-2"
                    >
                      <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.value)}
                      className="px-2"
                    >
                      <Download className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITY HISTORY */}
      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Complete Activity Timeline
          </h2>
          <ul className="space-y-4">
            {(member.activityHistory || []).map((act) => (
              <li key={act.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{act.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">{act.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Digital ID Card Modal */}
      <MemberIdCardModal
        isOpen={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        member={member}
        tenantName={activeTenant.name}
      />

      {/* Renew Membership Modal */}
      <Modal
        isOpen={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renew Membership"
        description={`Select renewal plan for ${member.fullName}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>Confirm Renewal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Plan"
            value={renewPlan}
            onChange={(e) => setRenewPlan(e.target.value)}
            options={MEMBERSHIP_PLAN_CATALOG.map((p) => ({
              value: p.name,
              label: `${p.name} — ₹${p.price} (${p.durationMonths}m)`,
            }))}
          />
          <Select
            label="Payment Method"
            value={renewMethod}
            onChange={(e) => setRenewMethod(e.target.value)}
            options={[
              { value: 'Online Card', label: 'Online Card' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />
        </div>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={collectOpen}
        onClose={() => setCollectOpen(false)}
        title="Collect Member Payment"
        description={`Record membership fee collection for ${member.fullName}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCollectOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmCollect}>Record Payment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            value={collectAmount}
            onChange={(e) => setCollectAmount(e.target.value)}
          />
          <Select
            label="Payment Method"
            value={collectMethod}
            onChange={(e) => setCollectMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'UPI' },
              { value: 'Online Card', label: 'Online Card' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
            ]}
          />
        </div>
      </Modal>

      {/* Send Notification Modal */}
      <Modal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        title="Send Member Notification"
        description={`Dispatch SMS / email notice to ${member.fullName}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNotifyOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSendNotification}>Send Notice</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={notifyTitle}
            onChange={(e) => setNotifyTitle(e.target.value)}
          />
          <div>
            <label htmlFor="notify-msg" className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              id="notify-msg"
              rows={3}
              value={notifyMsg}
              onChange={(e) => setNotifyMsg(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-navy-700 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* §12 Branch Transfer Modal (Same Tenant + Confirmation Step) */}
      <Modal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transfer Member Branch"
        description={`Authorized branch transfer strictly within ${activeTenant.name}.`}
        size="sm"
        footer={
          transferStep === 'form' ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setTransferOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!destBranchId}
                onClick={() => setTransferStep('confirm')}
              >
                Review Transfer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setTransferStep('form')}>Back</Button>
              <Button variant="emerald" size="sm" onClick={handleConfirmTransfer}>
                Confirm Branch Transfer
              </Button>
            </>
          )
        }
      >
        {eligibleTransferBranches.length === 0 ? (
          <p className="text-sm text-slate-600">
            No other branches exist under {activeTenant.name} to transfer this member into.
          </p>
        ) : transferStep === 'form' ? (
          <div className="space-y-4">
            <Input label="Member Name" value={member.fullName} readOnly />
            <Input label="Current Branch" value={member.branchName} readOnly />
            <Select
              label="Destination Branch"
              value={destBranchId}
              onChange={(e) => setDestBranchId(e.target.value)}
              options={eligibleTransferBranches.map((b) => ({
                value: b.id,
                label: `${b.name} (${b.city})`,
              }))}
            />
            <Input
              label="Transfer Effective Date"
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
            />
            <Input
              label="Transfer Reason"
              placeholder="e.g. Relocated closer to Bellevue Studio"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Confirm transferring <span className="font-semibold text-slate-900">{member.fullName}</span> from{' '}
              <span className="font-semibold text-slate-900">{member.branchName}</span> to{' '}
              <span className="font-semibold text-emerald-700">
                {eligibleTransferBranches.find((b) => b.id === destBranchId)?.name}
              </span>
              ?
            </p>
            <p className="text-xs text-slate-500">
              Effective {formatDate(transferDate)} · Same-tenant transfer only ({activeTenant.name}).
            </p>
          </div>
        )}
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Change Membership Status"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmStatus}>Save Status</Button>
          </>
        }
      >
        <Select
          label="Status"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.label || 'Document Preview'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>Close</Button>
            {previewDoc && (
              <Button
                variant="emerald"
                size="sm"
                leftIcon={Download}
                onClick={() => handleDownloadDocument(previewDoc.name)}
              >
                Download File
              </Button>
            )}
          </>
        }
      >
        {previewDoc && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center space-y-2">
            <FileText className="h-10 w-10 text-navy-900 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900 break-all">{previewDoc.name}</p>
            <p className="text-xs text-slate-500">
              Verified attachment on file for {member.fullName} ({member.id})
            </p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Member Profile"
        description={`Remove ${member.fullName} (${member.id}) permanently from ${activeTenant.name}?`}
        confirmLabel="Delete Member"
      />
    </div>
  );
}

export default MemberProfilePage;
