import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { calculateNetSalary, formatCurrency } from '../../../utils/payrollCalculations';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'personal', label: 'Personal Information' },
  { id: 'professional', label: 'Professional Info' },
  { id: 'members', label: 'Assigned Members' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'salary', label: 'Salary' },
  { id: 'documents', label: 'Documents' },
  { id: 'activity', label: 'Activity History' },
];

export function TrainerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const {
    getTrainerById,
    allTenantAssignments,
    allTenantSessions,
    allTenantPayroll,
    toggleTrainerStatus,
  } = useTrainerStaff();

  const [activeTab, setActiveTab] = useState('overview');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const trainer = getTrainerById(id);

  const trainerAssignments = useMemo(
    () => allTenantAssignments.filter((a) => a.trainerId === id),
    [allTenantAssignments, id]
  );

  const trainerSessions = useMemo(
    () => allTenantSessions.filter((s) => s.trainerId === id),
    [allTenantSessions, id]
  );

  const trainerPayroll = useMemo(
    () => allTenantPayroll.filter((p) => p.employeeId === id),
    [allTenantPayroll, id]
  );

  if (!trainer) {
    return (
      <EmptyState
        title="Trainer profile not found"
        description="The requested coach profile could not be located for this gym."
        actionLabel="Back to Trainers"
        onAction={() => navigate('/gym/trainers')}
      />
    );
  }

  const salarySummary = calculateNetSalary({
    salaryType: trainer.salaryType,
    basicSalary: trainer.basicSalary,
    allowances: trainer.allowances,
    deductions: trainer.deductions,
    perSessionRate: trainer.perSessionRate,
    sessionsCompleted: trainer.completedSessionsMonth,
    commissionPercent: trainer.commissionPercent,
    sessionRevenue: trainer.sessionRevenueMonth,
  });

  const branchNames = (trainer.assignedBranches || [trainer.branchId])
    .map((bid) => tenantBranches.find((b) => b.id === bid)?.name || bid)
    .join(', ');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer Profile"
        description="Comprehensive coaching record, member load, schedule, payroll, and compliance documents."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/trainers')}>
              All Trainers
            </Button>
            <Button
              variant="outline"
              icon={ClipboardCheck}
              onClick={() => navigate(`/gym/trainers/assignments?trainer=${trainer.id}`)}
            >
              Assign Member
            </Button>
            <Button
              variant="outline"
              icon={CalendarDays}
              onClick={() => navigate('/gym/trainers/schedules')}
            >
              Schedule Session
            </Button>
            <Button
              variant="primary"
              icon={Edit3}
              onClick={() => navigate(`/gym/trainers/${trainer.id}/edit`)}
            >
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Profile Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <UserAvatar src={trainer.avatar} name={trainer.fullName} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{trainer.fullName}</h2>
                <StatusBadge status={trainer.status} />
                <StatusBadge status={trainer.availabilityStatus} />
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {trainer.id} · {trainer.specializations?.join(' · ')}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {trainer.branchName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {trainer.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {trainer.email}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" aria-hidden="true" />
                  {trainer.rating} / 5.0 (Demo)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <div>
                <p className="text-[11px] text-slate-500">Experience</p>
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {trainer.experienceYears} yrs
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Clients</p>
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {trainer.assignedClients}/{trainer.maxClients}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Retention</p>
                <p className="text-base font-bold text-emerald-700 tabular-nums">
                  {trainer.retentionRate}%
                </p>
              </div>
            </div>

            <Button
              variant={trainer.status === 'active' ? 'danger' : 'primary'}
              onClick={() => setConfirmOpen(true)}
            >
              {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-t border-slate-200 pt-3 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Coaching Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {trainer.bio || 'No coaching bio provided yet.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Assigned Branches</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{branchNames}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Shift &amp; Working Days</p>
                <p className="text-sm font-medium text-slate-900 mt-1 tabular-nums">
                  {trainer.shiftStart} – {trainer.shiftEnd} · {trainer.workingDays?.join(', ')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Certifications</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{trainer.certifications || '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Employment &amp; Joining</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {trainer.employmentType} · Joined {trainer.joiningDate}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Monthly Snapshot (Demo)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed Sessions</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {trainer.completedSessionsMonth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cancelled Sessions</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {trainer.cancelledSessionsMonth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Session Revenue</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(trainer.sessionRevenueMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">Estimated Net Pay</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(salarySummary.netSalary)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal &amp; Emergency Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Full Name</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Date of Birth</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.dob}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Gender</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Primary Phone</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Alternate Phone</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.altPhone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.email}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Address</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Emergency Contact</dt>
              <dd className="font-medium text-slate-900 mt-0.5">
                {trainer.emergencyContactName || '—'} · {trainer.emergencyContactPhone || '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'professional' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Professional Credentials</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Specializations</dt>
              <dd className="font-medium text-slate-900 mt-0.5">
                {trainer.specializations?.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Years of Experience</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.experienceYears} years</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Certifications</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.certifications || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Qualifications</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.qualifications || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Languages Known</dt>
              <dd className="font-medium text-slate-900 mt-0.5">
                {trainer.languages?.join(', ') || 'English'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Internal Notes</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{trainer.notes || '—'}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Assigned Members</h3>
            <Link
              to={`/gym/trainers/assignments?trainer=${trainer.id}`}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              + Assign New Member
            </Link>
          </div>
          {trainerAssignments.length === 0 ? (
            <p className="text-sm text-slate-500">No members currently assigned to this trainer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 pr-4">Member</th>
                    <th className="py-2.5 px-4">Program</th>
                    <th className="py-2.5 px-4">Schedule</th>
                    <th className="py-2.5 px-4">Progress</th>
                    <th className="py-2.5 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainerAssignments.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 pr-4">
                        <Link
                          to={`/gym/members/${a.memberId}`}
                          className="font-medium text-navy-800 hover:underline"
                        >
                          {a.memberName}
                        </Link>
                        <p className="text-xs text-slate-500">{a.memberId}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{a.planType}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {a.scheduleDays?.join(', ')} · {a.timeSlot}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700">
                        {a.sessionsCompleted}/{a.sessionsTotal} sessions
                      </td>
                      <td className="py-3 pl-4">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Training Schedule</h3>
            <Link
              to="/gym/trainers/schedules"
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Open Full Calendar
            </Link>
          </div>
          {trainerSessions.length === 0 ? (
            <p className="text-sm text-slate-500">No training sessions logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 pr-4">Date &amp; Time</th>
                    <th className="py-2.5 px-4">Member</th>
                    <th className="py-2.5 px-4">Session Type</th>
                    <th className="py-2.5 px-4">Branch</th>
                    <th className="py-2.5 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainerSessions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 pr-4 tabular-nums font-medium text-slate-900">
                        {s.date} · {s.startTime}–{s.endTime}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.memberName}</td>
                      <td className="py-3 px-4 text-slate-700">{s.sessionType}</td>
                      <td className="py-3 px-4 text-slate-600">{s.branchName}</td>
                      <td className="py-3 pl-4">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Compensation &amp; Payroll History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Salary Model: {trainer.salaryType} · Frequency: {trainer.paymentFrequency} · Bank: {trainer.bankName} (•••• {trainer.accountLast4 || '4012'})
              </p>
            </div>
            <Link
              to="/gym/payroll"
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Open Payroll Module
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Computed Base / Session Pay</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-1">
                {formatCurrency(salarySummary.basicSalary)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Allowances</p>
              <p className="text-lg font-bold text-emerald-700 tabular-nums mt-1">
                +{formatCurrency(salarySummary.allowances)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Deductions</p>
              <p className="text-lg font-bold text-red-700 tabular-nums mt-1">
                -{formatCurrency(salarySummary.deductions)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Net Monthly Pay</p>
              <p className="text-lg font-bold text-navy-900 tabular-nums mt-1">
                {formatCurrency(salarySummary.netSalary)}
              </p>
            </div>
          </div>

          {trainerPayroll.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 pr-4">Slip ID</th>
                    <th className="py-2.5 px-4">Month</th>
                    <th className="py-2.5 px-4">Net Salary</th>
                    <th className="py-2.5 px-4">Payment Date</th>
                    <th className="py-2.5 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainerPayroll.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-medium">
                        <Link to={`/gym/payroll/${p.id}`} className="text-navy-800 hover:underline">
                          {p.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.salaryMonthLabel}</td>
                      <td className="py-3 px-4 font-semibold tabular-nums text-slate-900">
                        {formatCurrency(p.netSalary)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 tabular-nums">{p.paymentDate}</td>
                      <td className="py-3 pl-4">
                        <StatusBadge status={p.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Uploaded Compliance Documents</h3>
          {trainer.documents?.length ? (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {trainer.documents.map((doc, idx) => (
                <li key={`${doc.name}-${idx}`} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-500">
                        {doc.type} · Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="approved" label="Verified" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No documents attached yet.</p>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity Timeline</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="font-medium text-slate-900">Completed personal training block</p>
                <p className="text-xs text-slate-500">{trainer.completedSessionsMonth} sessions logged this month</p>
              </div>
              <span className="text-xs text-slate-400">Nov 2026</span>
            </li>
            <li className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="font-medium text-slate-900">Assigned to {branchNames}</p>
                <p className="text-xs text-slate-500">Shift {trainer.shiftStart} – {trainer.shiftEnd}</p>
              </div>
              <span className="text-xs text-slate-400">{trainer.joiningDate}</span>
            </li>
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title={trainer.status === 'active' ? 'Deactivate Trainer?' : 'Activate Trainer?'}
        description={`Confirm status update for ${trainer.fullName}.`}
        confirmLabel={trainer.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={trainer.status === 'active' ? 'danger' : 'primary'}
        onConfirm={() => {
          const next = trainer.status === 'active' ? 'inactive' : 'active';
          toggleTrainerStatus(trainer.id, next);
          toast.success(`${trainer.fullName} marked as ${next}`);
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default TrainerProfilePage;
