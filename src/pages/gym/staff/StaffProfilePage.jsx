import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, FileText, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import {
  calculateNetSalary,
  calculateWorkingHours,
  formatCurrency,
} from '../../../utils/payrollCalculations';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'personal', label: 'Personal Information' },
  { id: 'employment', label: 'Employment Details' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'salary', label: 'Salary' },
  { id: 'documents', label: 'Documents' },
  { id: 'activity', label: 'Activity History' },
];

export function StaffProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getStaffById,
    allTenantStaffAttendance,
    allTenantPayroll,
    toggleStaffStatus,
  } = useTrainerStaff();

  const [activeTab, setActiveTab] = useState('overview');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const person = getStaffById(id);

  const attendanceHistory = useMemo(
    () => allTenantStaffAttendance.filter((a) => a.personId === id),
    [allTenantStaffAttendance, id]
  );

  const payrollHistory = useMemo(
    () => allTenantPayroll.filter((p) => p.employeeId === id),
    [allTenantPayroll, id]
  );

  if (!person) {
    return (
      <EmptyState
        title="Staff profile not found"
        description="The requested staff profile does not exist in this gym tenant."
        actionLabel="Back to Staff"
        onAction={() => navigate('/gym/staff')}
      />
    );
  }

  const salarySummary = calculateNetSalary(person);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Profile"
        description="Role responsibilities, attendance logs, salary setup, and compliance records."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/staff')}>
              All Staff
            </Button>
            <Button
              variant="primary"
              icon={Edit3}
              onClick={() => navigate(`/gym/staff/${person.id}/edit`)}
            >
              Edit Staff
            </Button>
          </div>
        }
      />

      {/* Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <UserAvatar src={person.avatar} name={person.fullName} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{person.fullName}</h2>
                <StatusBadge status={person.status} />
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {person.id} · {person.role} · {person.department}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {person.branchName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {person.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {person.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-[11px] text-slate-500">Monthly Net Salary</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(salarySummary.netSalary)}
              </p>
            </div>
            <Button
              variant={person.status === 'active' ? 'danger' : 'primary'}
              onClick={() => setConfirmOpen(true)}
            >
              {person.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

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

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Key Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
              {(person.responsibilities || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Shift &amp; Roster Info</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Employment Type</dt>
                <dd className="font-medium text-slate-900">{person.employmentType}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Joining Date</dt>
                <dd className="font-medium text-slate-900">{person.joiningDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Shift Window</dt>
                <dd className="font-medium text-slate-900 tabular-nums">{person.shiftTiming}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Working Days</dt>
                <dd className="font-medium text-slate-900">{person.workingDays?.join(', ')}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Full Name</dt>
              <dd className="font-medium text-slate-900">{person.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Gender</dt>
              <dd className="font-medium text-slate-900">{person.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">{person.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{person.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Address</dt>
              <dd className="font-medium text-slate-900">{person.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Emergency Contact</dt>
              <dd className="font-medium text-slate-900">
                {person.emergencyContactName || '—'} · {person.emergencyContactPhone || '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'employment' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Employment Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{person.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Department</dt>
              <dd className="font-medium text-slate-900">{person.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Assigned Branch</dt>
              <dd className="font-medium text-slate-900">{person.branchName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Shift Timing</dt>
              <dd className="font-medium text-slate-900 tabular-nums">{person.shiftTiming}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Working Days</dt>
              <dd className="font-medium text-slate-900">{person.workingDays?.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Notes</dt>
              <dd className="font-medium text-slate-900">{person.notes || '—'}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Attendance Records</h3>
            <Link to="/gym/staff/attendance" className="text-xs font-medium text-emerald-700 hover:underline">
              Open Attendance Sheet
            </Link>
          </div>
          {attendanceHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance entries logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 pr-4">Date</th>
                    <th className="py-2.5 px-4">Check In</th>
                    <th className="py-2.5 px-4">Check Out</th>
                    <th className="py-2.5 px-4">Working Hours</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 pl-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceHistory.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 tabular-nums font-medium">{row.date}</td>
                      <td className="py-3 px-4 tabular-nums">{row.checkIn || '—'}</td>
                      <td className="py-3 px-4 tabular-nums">{row.checkOut || '—'}</td>
                      <td className="py-3 px-4 tabular-nums">
                        {calculateWorkingHours(row.checkIn, row.checkOut)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-3 pl-4 text-slate-600">{row.remarks || '—'}</td>
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Basic Salary</p>
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
              <p className="text-xs text-slate-500">Net Salary</p>
              <p className="text-lg font-bold text-navy-900 tabular-nums mt-1">
                {formatCurrency(salarySummary.netSalary)}
              </p>
            </div>
          </div>

          {payrollHistory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 pr-4">Slip ID</th>
                    <th className="py-2.5 px-4">Month</th>
                    <th className="py-2.5 px-4">Net Salary</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollHistory.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-medium">
                        <Link to={`/gym/payroll/${p.id}`} className="text-navy-800 hover:underline">
                          {p.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{p.salaryMonthLabel}</td>
                      <td className="py-3 px-4 font-semibold tabular-nums">
                        {formatCurrency(p.netSalary)}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-600">{p.paymentDate}</td>
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
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Staff Documents</h3>
          {person.documents?.length ? (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {person.documents.map((doc, idx) => (
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
            <p className="text-sm text-slate-500">No files attached yet.</p>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity History</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Assigned as {person.role} at {person.branchName}</span>
              <span className="text-xs text-slate-400">{person.joiningDate}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Salary structure verified ({person.salaryType})</span>
              <span className="text-xs text-slate-400">Nov 2026</span>
            </li>
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title={person.status === 'active' ? 'Deactivate Staff Member?' : 'Activate Staff Member?'}
        description={`Confirm status toggle for ${person.fullName}.`}
        confirmLabel={person.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={person.status === 'active' ? 'danger' : 'primary'}
        onConfirm={() => {
          toggleStaffStatus(person.id);
          toast.success(`${person.fullName} status updated`);
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default StaffProfilePage;
