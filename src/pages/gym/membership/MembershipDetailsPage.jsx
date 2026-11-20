import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  PauseCircle,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { REFERENCE_TODAY } from '../../../utils/membershipCalculations';

const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'payments', label: 'Payment History' },
  { key: 'renewals', label: 'Renewal History' },
  { key: 'freezes', label: 'Freeze History' },
  { key: 'activity', label: 'Activity' },
];

export function MembershipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tenantPlans,
    getMembershipById,
    renewMembershipRecord,
    resumeMembership,
    cancelMembership,
  } = useMembershipManagement();

  const membership = getMembershipById(id);

  const [activeTab, setActiveTab] = useState('overview');
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState(membership?.planId || '');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Member requested cancellation');

  if (!membership) {
    return (
      <EmptyState
        title="Membership record not found"
        description="This membership ID does not exist under the active gym organization."
        actionLabel="Active Memberships"
        onAction={() => navigate('/gym/membership/active')}
      />
    );
  }

  const handleConfirmRenew = () => {
    renewMembershipRecord(membership.id, {
      planId: renewPlanId || membership.planId,
      renewalDate: REFERENCE_TODAY,
    });
    toast.success(`Renewed ${membership.memberName}'s membership`);
    setRenewOpen(false);
  };

  const handleConfirmCancel = () => {
    cancelMembership(membership.id, cancelReason);
    toast.success(`Cancelled membership ${membership.id}`);
    setCancelOpen(false);
  };

  const handleResume = () => {
    resumeMembership(membership.id);
    toast.success(`Resumed active membership for ${membership.memberName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/gym/membership/active')}
        >
          Back to Active Memberships
        </Button>
        <Link
          to={`/gym/members/${membership.memberId}`}
          className="text-xs font-medium text-emerald-700 hover:underline"
        >
          Open Member Profile →
        </Link>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar src={membership.memberAvatar} name={membership.memberName} size="xl" />
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {membership.memberName}
                </h1>
                <StatusBadge status={membership.status} />
                <StatusBadge status={membership.paymentStatus} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-mono font-semibold text-navy-900">{membership.memberId}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-semibold text-slate-800">{membership.planName}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>{membership.branchName}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-mono text-slate-500">{membership.id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="emerald"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => {
                setRenewPlanId(membership.planId);
                setRenewOpen(true);
              }}
            >
              Renew
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={ArrowUpRight}
              onClick={() => navigate(`/gym/membership/${membership.id}/upgrade`)}
            >
              Upgrade / Downgrade
            </Button>
            {membership.status === 'frozen' ? (
              <Button variant="primary" size="sm" leftIcon={Play} onClick={handleResume}>
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                leftIcon={PauseCircle}
                onClick={() => navigate(`/gym/membership/${membership.id}/freeze`)}
              >
                Freeze
              </Button>
            )}
            {membership.status !== 'cancelled' && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={XCircle}
                onClick={() => setCancelOpen(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* 5 Tabs */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto border-t border-slate-200 pt-3">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
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
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Plan & Cycle Details
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Plan Name</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{membership.planName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Start Date</dt>
              <dd className="font-mono text-slate-800 mt-0.5">{formatDate(membership.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Expiry Date</dt>
              <dd className="font-mono text-slate-800 mt-0.5">{formatDate(membership.expiryDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Cycle Amount</dt>
              <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                {formatCurrency(membership.finalAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Payment Status</dt>
              <dd className="mt-1"><StatusBadge status={membership.paymentStatus} /></dd>
            </div>
          </dl>

          {membership.cancellationReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              <span className="font-semibold">Cancelled ({formatDate(membership.cancelledAt)}):</span>{' '}
              {membership.cancellationReason}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Paid Amount"
              value={formatCurrency(membership.paidAmount || 0)}
              icon={CreditCard}
            />
            <StatCard
              label="Pending Amount"
              value={formatCurrency(membership.pendingAmount || 0)}
              trend={membership.pendingAmount > 0 ? 'down' : 'neutral'}
              icon={CreditCard}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Transactions</h2>
            </div>
            {(membership.paymentHistory || []).length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No transactions logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Transaction ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Note</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {membership.paymentHistory.map((txn) => (
                      <tr key={txn.id}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{txn.id}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(txn.date)}</td>
                        <td className="px-4 py-3 text-xs text-slate-700">{txn.method}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{txn.note}</td>
                        <td className="px-4 py-3"><StatusBadge status={txn.status} /></td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 text-right">
                          {formatCurrency(txn.amount)}
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

      {/* TAB 3: RENEWAL HISTORY */}
      {activeTab === 'renewals' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Renewal & Plan Change History</h2>
          </div>
          {(membership.renewalHistory || []).length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No renewals or plan changes recorded on this membership yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Previous Plan</th>
                    <th className="px-4 py-3 font-medium">New Plan</th>
                    <th className="px-4 py-3 font-medium">Renewal Date</th>
                    <th className="px-4 py-3 font-medium">New Expiry</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {membership.renewalHistory.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3"><StatusBadge status="renewed" label={r.type} /></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.previousPlan}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{r.newPlan}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(r.renewalDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-700 font-semibold">{formatDate(r.newExpiry)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 text-right">
                        {formatCurrency(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FREEZE HISTORY */}
      {activeTab === 'freezes' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Freeze History</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/gym/membership/${membership.id}/freeze`)}
            >
              Manage Freeze
            </Button>
          </div>
          {(membership.freezeHistory || []).length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No freeze intervals logged for this membership.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Freeze Start</th>
                    <th className="px-4 py-3 font-medium">Freeze End</th>
                    <th className="px-4 py-3 font-medium">Days</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {membership.freezeHistory.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(f.startDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(f.endDate)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{f.days} days</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{f.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={f.status === 'active' ? 'frozen' : 'active'} label={f.status === 'active' ? 'Frozen' : 'Resumed'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Membership Lifecycle Activity
          </h2>
          {(membership.activityHistory || []).length === 0 ? (
            <p className="text-sm text-slate-500">No lifecycle events recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {membership.activityHistory.map((act) => (
                <li key={act.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{act.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-400 shrink-0">{act.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Renew Modal */}
      <Modal
        isOpen={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renew Membership"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>Confirm Renewal</Button>
          </>
        }
      >
        <Select
          label="Renewal Plan"
          value={renewPlanId}
          onChange={(e) => setRenewPlanId(e.target.value)}
          options={tenantPlans.map((p) => ({
            value: p.id,
            label: `${p.name} — ₹${p.regularPrice}`,
          }))}
        />
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Membership"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(false)}>Keep Plan</Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>Confirm Cancellation</Button>
          </>
        }
      >
        <Input
          label="Cancellation Reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default MembershipDetailsPage;
