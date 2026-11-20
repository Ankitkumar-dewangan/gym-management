import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  calculatePlanChangeAdjustment,
  REFERENCE_TODAY,
} from '../../../utils/membershipCalculations';

export function UpgradeDowngradePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { tenantPlans, getMembershipById, changeMembershipPlan } = useMembershipManagement();
  const membership = getMembershipById(id);

  const alternativePlans = useMemo(
    () => tenantPlans.filter((p) => p.id !== membership?.planId && p.status === 'active'),
    [tenantPlans, membership?.planId]
  );

  const preferredMode = searchParams.get('mode');
  const defaultPlan = useMemo(() => {
    if (!alternativePlans.length) return tenantPlans[0]?.id || '';
    if (preferredMode === 'downgrade') {
      const lower = alternativePlans.find((p) => p.regularPrice < (membership?.regularPrice || 0));
      return lower?.id || alternativePlans[0]?.id || '';
    }
    const higher = alternativePlans.find((p) => p.regularPrice > (membership?.regularPrice || 0));
    return higher?.id || alternativePlans[0]?.id || '';
  }, [alternativePlans, preferredMode, membership?.regularPrice, tenantPlans]);

  const [newPlanId, setNewPlanId] = useState(defaultPlan);
  const [effectiveDate, setEffectiveDate] = useState(REFERENCE_TODAY);
  const [paymentMethod, setPaymentMethod] = useState('Online Card');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedPlan = useMemo(
    () => tenantPlans.find((p) => p.id === newPlanId) || alternativePlans[0] || null,
    [tenantPlans, newPlanId, alternativePlans]
  );

  const adjustment = useMemo(
    () =>
      calculatePlanChangeAdjustment({
        currentMembership: membership,
        newPlan: selectedPlan,
        effectiveDate,
      }),
    [membership, selectedPlan, effectiveDate]
  );

  if (!membership) {
    return (
      <EmptyState
        title="Membership not found"
        description="Unable to load this membership record for upgrade or downgrade."
        actionLabel="Active Memberships"
        onAction={() => navigate('/gym/membership/active')}
      />
    );
  }

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    changeMembershipPlan(membership.id, {
      newPlanId: selectedPlan.id,
      effectiveDate,
      paymentMethod,
    });
    toast.success(
      `${adjustment.changeType === 'upgrade' ? 'Upgraded' : 'Changed'} ${membership.memberName} to ${selectedPlan.name}`
    );
    setConfirmOpen(false);
    navigate(`/gym/membership/${membership.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Upgrade / Downgrade · ${membership.memberName}`}
        description={`Adjust active tier for ${membership.memberId} with prorated credit calculation.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/gym/membership/${membership.id}`)}
          >
            Back to Membership
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Current Plan Card */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Current Plan</h2>
            <StatusBadge status={membership.status} />
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Plan Name</dt>
              <dd className="font-semibold text-slate-900">{membership.planName}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Cycle Rate</dt>
              <dd className="font-mono font-semibold text-slate-900">
                {formatCurrency(membership.finalAmount)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Duration</dt>
              <dd className="font-mono text-slate-700">{membership.durationDays} days</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Current Expiry</dt>
              <dd className="font-mono text-slate-700">{formatDate(membership.expiryDate)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <dt className="text-slate-500">Unused Days Credit</dt>
              <dd className="font-mono font-semibold text-emerald-700">
                -{formatCurrency(adjustment.proratedCredit)} ({adjustment.remainingDays}d left)
              </dd>
            </div>
          </dl>
        </div>

        {/* New Plan Selection & Adjustment */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">New Plan Selection</h2>
            <StatusBadge
              status={adjustment.changeType === 'upgrade' ? 'upgraded' : adjustment.changeType === 'downgrade' ? 'downgraded' : 'active'}
              label={
                adjustment.changeType === 'upgrade'
                  ? 'Plan Upgrade'
                  : adjustment.changeType === 'downgrade'
                    ? 'Plan Downgrade'
                    : 'Plan Switch'
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select New Plan"
              value={selectedPlan?.id || ''}
              onChange={(e) => setNewPlanId(e.target.value)}
              options={alternativePlans.map((p) => ({
                value: p.id,
                label: `${p.name} — ₹${p.regularPrice} (${p.durationDays}d)`,
              }))}
            />
            <Input
              label="Effective Date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
            <Select
              label="Payment Method (if payable)"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'Online Card', label: 'Online Card' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
              ]}
            />
          </div>

          {selectedPlan && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">New Plan Rate (incl. tax)</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{adjustment.newPrice.toFixed(2)} ({selectedPlan.durationDays} days)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Price Difference vs. Previous Plan</span>
                <span className="font-mono font-semibold text-slate-900">
                  {adjustment.priceDifference >= 0 ? '+' : '-'}₹
                  {Math.abs(adjustment.priceDifference).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Prorated Unused Credit Applied</span>
                <span className="font-mono text-emerald-700">
                  -₹{adjustment.proratedCredit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                <span className="text-sm font-semibold text-slate-900">
                  {adjustment.adjustmentAmount >= 0 ? 'Net Payable Adjustment' : 'Account Credit Balance'}
                </span>
                <span className="font-mono text-lg font-bold text-navy-900 tabular-nums">
                  ₹{Math.abs(adjustment.adjustmentAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>New Expiry Date</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {formatDate(adjustment.newExpiryDate)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/gym/membership/${membership.id}`)}
            >
              Cancel
            </Button>
            <Button
              variant="emerald"
              leftIcon={adjustment.changeType === 'upgrade' ? ArrowUpRight : ArrowDownRight}
              disabled={!selectedPlan}
              onClick={() => setConfirmOpen(true)}
            >
              {adjustment.changeType === 'upgrade' ? 'Review Upgrade' : 'Review Downgrade'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirm Plan ${adjustment.changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" leftIcon={CheckCircle2} onClick={handleConfirmChange}>
              Confirm Change
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            Switch <span className="font-semibold text-slate-900">{membership.memberName}</span> from{' '}
            <span className="font-semibold">{membership.planName}</span> to{' '}
            <span className="font-semibold text-emerald-700">{selectedPlan?.name}</span>?
          </p>
          <p className="text-xs text-slate-500">
            Effective {formatDate(effectiveDate)} · New expiry {formatDate(adjustment.newExpiryDate)}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default UpgradeDowngradePage;
