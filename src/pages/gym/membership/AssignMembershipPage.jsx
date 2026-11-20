import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatDate } from '../../../utils/formatters';
import {
  calculateExpiryDate,
  calculateOfferDiscountAmount,
  calculatePlanPricing,
  REFERENCE_TODAY,
} from '../../../utils/membershipCalculations';

export function AssignMembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { tenantBranches } = useBranchManagement();
  const { tenantMembers } = useMemberManagement();
  const { tenantPlans, tenantOffers, assignMembership } = useMembershipManagement();

  const preselectedMember = searchParams.get('memberId');

  const [memberId, setMemberId] = useState(
    preselectedMember || tenantMembers[0]?.id || ''
  );
  const [branchId, setBranchId] = useState(tenantBranches[0]?.id || '');
  const [planId, setPlanId] = useState(
    tenantPlans.find((p) => p.status === 'active')?.id || tenantPlans[0]?.id || ''
  );
  const [startDate, setStartDate] = useState(REFERENCE_TODAY);
  const [offerId, setOfferId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [partialAmount, setPartialAmount] = useState('150');
  const [paymentMethod, setPaymentMethod] = useState('Online Card');

  const selectedMember = useMemo(
    () => tenantMembers.find((m) => m.id === memberId) || tenantMembers[0],
    [tenantMembers, memberId]
  );

  const selectedPlan = useMemo(
    () => tenantPlans.find((p) => p.id === planId) || tenantPlans[0],
    [tenantPlans, planId]
  );

  const activeOffers = useMemo(
    () => tenantOffers.filter((o) => o.status === 'active'),
    [tenantOffers]
  );

  const selectedOffer = useMemo(
    () => activeOffers.find((o) => o.id === offerId) || null,
    [activeOffers, offerId]
  );

  const calculatedExpiry = useMemo(() => {
    if (!selectedPlan) return REFERENCE_TODAY;
    return calculateExpiryDate(startDate, {
      durationType: selectedPlan.durationType,
      durationDays: selectedPlan.durationDays,
    });
  }, [selectedPlan, startDate]);

  const summary = useMemo(() => {
    if (!selectedPlan) {
      return {
        regularPrice: 0,
        planDiscount: 0,
        offerDiscount: 0,
        taxAmount: 0,
        fees: 0,
        totalPayable: 0,
        paidNow: 0,
        pendingBalance: 0,
      };
    }
    const base = calculatePlanPricing(selectedPlan);
    const offerDisc = selectedOffer
      ? calculateOfferDiscountAmount(base.totalUpfrontPayable, selectedOffer, selectedPlan.id)
      : 0;
    const totalPayable = Math.max(0, Number((base.totalUpfrontPayable - offerDisc).toFixed(2)));
    const paidNow =
      paymentStatus === 'paid'
        ? totalPayable
        : paymentStatus === 'partially_paid'
          ? Math.min(totalPayable, Math.max(0, Number(partialAmount) || 0))
          : 0;
    const pendingBalance = Math.max(0, Number((totalPayable - paidNow).toFixed(2)));

    return {
      regularPrice: base.regularPrice,
      planDiscount: base.discountAmount,
      offerDiscount: offerDisc,
      taxAmount: base.taxAmount,
      fees: base.registrationFee + base.joiningFee,
      totalPayable,
      paidNow,
      pendingBalance,
    };
  }, [selectedPlan, selectedOffer, paymentStatus, partialAmount]);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!memberId || !planId) {
      toast.error('Select both a member and a membership plan');
      return;
    }
    const created = assignMembership({
      memberId,
      branchId,
      planId,
      startDate,
      offerId,
      paymentStatus,
      paidAmount: partialAmount,
      paymentMethod,
    });
    if (created) {
      toast.success(`Assigned ${created.planName} to ${created.memberName}`);
      navigate(`/gym/membership/${created.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Membership"
        description="Assign a membership plan to an enrolled member with automatic expiry and offer calculation."
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/gym/membership/active')}
          >
            Active Memberships
          </Button>
        }
      />

      <form onSubmit={handleConfirm} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Guided Assignment Steps */}
        <div className="xl:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              01. Member & Branch Selection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Step 1 · Select Member"
                required
                value={memberId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setMemberId(nextId);
                  const found = tenantMembers.find((m) => m.id === nextId);
                  if (found?.branchId) setBranchId(found.branchId);
                }}
                options={tenantMembers.map((m) => ({
                  value: m.id,
                  label: `${m.fullName} (${m.id})`,
                }))}
              />
              <Select
                label="Step 2 · Select Branch"
                required
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                options={tenantBranches.map((b) => ({
                  value: b.id,
                  label: `${b.name} (${b.city})`,
                }))}
              />
            </div>

            {selectedMember && (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
                <UserAvatar src={selectedMember.avatar} name={selectedMember.fullName} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{selectedMember.fullName}</p>
                  <p className="text-slate-500 truncate">
                    {selectedMember.email} · {selectedMember.mobile}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              02. Membership Plan, Schedule & Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Step 3 · Select Membership Plan"
                required
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                options={tenantPlans.map((p) => ({
                  value: p.id,
                  label: `${p.name} — ₹${p.regularPrice} (${p.durationDays}d)`,
                }))}
              />
              <Input
                label="Step 4 · Start Date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Step 5 · Calculated Expiry Date"
                value={calculatedExpiry}
                readOnly
                className="font-mono bg-slate-50"
                hint={`Automatically computed from ${selectedPlan?.durationDays || 30}-day cycle`}
              />
              <Select
                label="Step 6 · Apply Discount / Coupon Offer"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                options={[
                  { value: '', label: 'No additional coupon offer' },
                  ...activeOffers.map((o) => ({
                    value: o.id,
                    label: `${o.code} — ${o.name} (${
                      o.discountType === 'percentage'
                        ? `${o.percentageDiscount}% off`
                        : `₹${o.fixedDiscount} off`
                    })`,
                  })),
                ]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              03. Payment Recording Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Step 8 · Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                options={[
                  { value: 'paid', label: 'Paid in Full' },
                  { value: 'partially_paid', label: 'Partially Paid' },
                  { value: 'pending', label: 'Pending Payment' },
                ]}
              />
              {paymentStatus === 'partially_paid' && (
                <Input
                  label="Initial Paid Amount (₹)"
                  type="number"
                  step="0.01"
                  min="1"
                  max={summary.totalPayable}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                />
              )}
              {paymentStatus !== 'pending' && (
                <Select
                  label="Recording Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'Online Card', label: 'Online Card' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                  ]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Step 7 & 9 Review & Payment Summary */}
        <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 xl:sticky xl:top-24">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Assignment & Payment Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review cycle dates and payable breakdown before confirming.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Selected Member</span>
              <span className="font-semibold text-slate-900">{selectedMember?.fullName || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Plan Tier</span>
              <span className="font-semibold text-slate-900">{selectedPlan?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cycle Window</span>
              <span className="font-mono text-slate-800">
                {formatDate(startDate)} → {formatDate(calculatedExpiry)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Regular Plan Rate</span>
              <span className="font-mono text-slate-800">${summary.regularPrice.toFixed(2)}</span>
            </div>
            {summary.planDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Built-in Plan Discount</span>
                <span className="font-mono">-${summary.planDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tax & Onboarding Fees</span>
              <span className="font-mono text-slate-800">
                +${(summary.taxAmount + summary.fees).toFixed(2)}
              </span>
            </div>
            {summary.offerDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>Coupon ({selectedOffer?.code})</span>
                <span className="font-mono">-${summary.offerDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Total Payable</span>
              <span className="font-mono text-xl font-bold text-navy-900 tabular-nums">
                ${summary.totalPayable.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Recorded Paid Now</span>
              <span className="font-mono font-semibold text-emerald-700">
                ${summary.paidNow.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Remaining Balance</span>
              <span className="font-mono font-semibold text-amber-700">
                ${summary.pendingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button type="submit" variant="emerald" fullWidth leftIcon={CheckCircle2}>
              Confirm Assignment
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate('/gym/membership')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AssignMembershipPage;
