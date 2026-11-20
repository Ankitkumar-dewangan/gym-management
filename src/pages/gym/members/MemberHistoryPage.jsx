import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, CalendarCheck, CreditCard, RefreshCw } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function MemberHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemberById } = useMemberManagement();

  const member = getMemberById(id);

  if (!member) {
    return (
      <EmptyState
        title="Member history not found"
        description="Unable to locate this member record in the active gym organization."
        actionLabel="Back to Members"
        onAction={() => navigate('/gym/members')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Membership History · ${member.fullName}`}
        description={`Plan renewals, cycle changes, and branch transfer log for ${member.id}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/gym/members/${member.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Membership Cycles"
          value={String((member.membershipHistory || []).length)}
          helperText="recorded enrollments"
          icon={RefreshCw}
        />
        <StatCard
          label="Branch Transfers"
          value={String((member.transferHistory || []).length)}
          helperText="same-tenant transfers"
          icon={ArrowLeftRight}
        />
        <StatCard
          label="Lifetime Paid"
          value={formatCurrency(member.totalPaid || 0)}
          helperText="total membership fees"
          icon={CreditCard}
        />
        <StatCard
          label="Member Since"
          value={formatDate(member.joiningDate)}
          helperText={member.branchName}
          icon={CalendarCheck}
        />
      </div>

      {/* Plan History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Membership & Renewal Cycles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Cycle ID</th>
                <th className="px-4 py-3 font-medium">Membership Plan</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">End Date</th>
                <th className="px-4 py-3 font-medium">Monthly Fee</th>
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
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                    {formatCurrency(cycle.fee)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={cycle.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Transfer Log */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Branch Transfer History
        </h2>
        {(member.transferHistory || []).length === 0 ? (
          <p className="text-sm text-slate-500">
            No branch transfers recorded. Member remains enrolled at {member.branchName}.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {member.transferHistory.map((trf) => (
              <div key={trf.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {trf.fromBranch} → {trf.toBranch}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{trf.reason}</p>
                </div>
                <span className="font-mono text-xs text-slate-500">{formatDate(trf.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberHistoryPage;
