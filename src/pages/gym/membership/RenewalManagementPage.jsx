import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  calculateExpiryDate,
  calculateOfferDiscountAmount,
  calculatePlanPricing,
  REFERENCE_TODAY,
} from '../../../utils/membershipCalculations';

export function RenewalManagementPage() {
  const {
    tenantPlans,
    tenantOffers,
    scopedMemberships,
    renewMembershipRecord,
  } = useMembershipManagement();

  const renewableMemberships = useMemo(
    () => scopedMemberships.filter((m) => m.status !== 'cancelled'),
    [scopedMemberships]
  );

  const [selectedMembershipId, setSelectedMembershipId] = useState(
    renewableMemberships[0]?.id || ''
  );
  const [renewalMode, setRenewalMode] = useState('same'); // 'same' | 'change'
  const [nextPlanId, setNextPlanId] = useState(tenantPlans[0]?.id || '');
  const [renewalDate, setRenewalDate] = useState(REFERENCE_TODAY);
  const [offerId, setOfferId] = useState('');
  const [customDiscount, setCustomDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Online Card');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeMembership = useMemo(
    () =>
      renewableMemberships.find((m) => m.id === selectedMembershipId) ||
      renewableMemberships[0] ||
      null,
    [renewableMemberships, selectedMembershipId]
  );

  const targetPlan = useMemo(() => {
    if (!activeMembership) return tenantPlans[0] || null;
    if (renewalMode === 'same') {
      return tenantPlans.find((p) => p.id === activeMembership.planId) || tenantPlans[0];
    }
    return tenantPlans.find((p) => p.id === nextPlanId) || tenantPlans[0];
  }, [activeMembership, renewalMode, nextPlanId, tenantPlans]);

  const activeOffers = useMemo(
    () => tenantOffers.filter((o) => o.status === 'active'),
    [tenantOffers]
  );
  const selectedOffer = activeOffers.find((o) => o.id === offerId) || null;

  const calculation = useMemo(() => {
    if (!targetPlan) {
      return { newExpiry: renewalDate, basePrice: 0, discountTotal: 0, finalAmount: 0 };
    }
    const pricing = calculatePlanPricing({
      ...targetPlan,
      registrationFee: 0,
      joiningFee: 0,
    });
    const offerDisc = selectedOffer
      ? calculateOfferDiscountAmount(pricing.finalPlanPrice, selectedOffer, targetPlan.id)
      : 0;
    const extraDisc = Math.max(0, Number(customDiscount) || 0);
    const finalAmount = Math.max(
      0,
      Number((pricing.finalPlanPrice - offerDisc - extraDisc).toFixed(2))
    );
    const newExpiry = calculateExpiryDate(renewalDate, {
      durationType: targetPlan.durationType,
      durationDays: targetPlan.durationDays,
    });

    return {
      newExpiry,
      basePrice: pricing.finalPlanPrice,
      discountTotal: Number((offerDisc + extraDisc).toFixed(2)),
      finalAmount,
    };
  }, [targetPlan, renewalDate, selectedOffer, customDiscount]);

  const allRenewalHistory = useMemo(
    () =>
      scopedMemberships.flatMap((m) =>
        (m.renewalHistory || []).map((r) => ({
          ...r,
          membershipId: m.id,
          memberName: m.memberName,
          memberId: m.memberId,
        }))
      ),
    [scopedMemberships]
  );

  const handleConfirmRenewal = () => {
    if (!activeMembership || !targetPlan) return;
    renewMembershipRecord(activeMembership.id, {
      planId: targetPlan.id,
      renewalDate,
      offerId,
      customDiscount,
      paymentMethod,
    });
    toast.success(`Renewed ${activeMembership.memberName} through ${formatDate(calculation.newExpiry)}`);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Renewal Management"
        description="Renew existing memberships or switch tiers during renewal while preserving full cycle history."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Renewal Builder */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Configure Membership Renewal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Member Membership"
              value={activeMembership?.id || ''}
              onChange={(e) => {
                setSelectedMembershipId(e.target.value);
                const found = renewableMemberships.find((m) => m.id === e.target.value);
                if (found) setNextPlanId(found.planId);
              }}
              options={renewableMemberships.map((m) => ({
                value: m.id,
                label: `${m.memberName} (${m.memberId}) — ${m.planName}`,
              }))}
            />

            <Select
              label="Renewal Option"
              value={renewalMode}
              onChange={(e) => setRenewalMode(e.target.value)}
              options={[
                { value: 'same', label: 'Renew Existing Plan' },
                { value: 'change', label: 'Change Plan During Renewal' },
              ]}
            />

            {renewalMode === 'change' && (
              <Select
                label="New Plan Tier"
                value={nextPlanId}
                onChange={(e) => setNextPlanId(e.target.value)}
                options={tenantPlans.map((p) => ({
                  value: p.id,
                  label: `${p.name} — ₹${p.regularPrice} (${p.durationDays}d)`,
                }))}
              />
            )}

            <Input
              label="Renewal Date"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />

            <Select
              label="Apply Offer / Coupon"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              options={[
                { value: '', label: 'None' },
                ...activeOffers.map((o) => ({
                  value: o.id,
                  label: `${o.code} — ${o.name}`,
                })),
              ]}
            />

            <Input
              label="Additional Discount (₹)"
              type="number"
              min="0"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
            />

            <Select
              label="Payment Recording Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'Online Card', label: 'Online Card' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
              ]}
            />
          </div>
        </div>

        {/* Right: Previous vs New Preview Card */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Renewal Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Old cycle snapshot will be archived inside renewal history.
            </p>
          </div>

          {activeMembership && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div>
                  <p className="text-slate-500">Previous Plan</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{activeMembership.planName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Previous Expiry</p>
                  <p className="font-mono text-slate-800 mt-0.5">{formatDate(activeMembership.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500">New Plan</p>
                  <p className="font-semibold text-emerald-700 mt-0.5">{targetPlan?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">New Expiry</p>
                  <p className="font-mono font-semibold text-emerald-700 mt-0.5">
                    {formatDate(calculation.newExpiry)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Plan Price (incl. tax)</span>
                  <span className="font-mono text-slate-800">${calculation.basePrice.toFixed(2)}</span>
                </div>
                {calculation.discountTotal > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Applied Discounts</span>
                    <span className="font-mono">-${calculation.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                  <span className="text-sm font-semibold text-slate-900">Final Renewal Amount</span>
                  <span className="font-mono text-xl font-bold text-navy-900 tabular-nums">
                    ${calculation.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="emerald"
            fullWidth
            leftIcon={RefreshCw}
            disabled={!activeMembership}
            onClick={() => setConfirmOpen(true)}
          >
            Review & Confirm Renewal
          </Button>
        </div>
      </div>

      {/* Renewal History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Renewal History Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preserved log of all prior plans, expiry dates, and renewal extensions
          </p>
        </div>
        {allRenewalHistory.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No renewals recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Previous Plan</th>
                  <th className="px-4 py-3 font-medium">New Plan</th>
                  <th className="px-4 py-3 font-medium">Renewal Date</th>
                  <th className="px-4 py-3 font-medium">Previous Expiry</th>
                  <th className="px-4 py-3 font-medium">New Expiry</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRenewalHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/gym/membership/${item.membershipId}`}
                        className="font-medium text-slate-900 hover:text-emerald-700"
                      >
                        {item.memberName}
                      </Link>
                      <p className="text-xs font-mono text-slate-500">{item.memberId}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status="renewed" label={item.type} /></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.previousPlan}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{item.newPlan}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDate(item.renewalDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{formatDate(item.previousExpiry)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{formatDate(item.newExpiry)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Membership Renewal"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="emerald" size="sm" leftIcon={CheckCircle2} onClick={handleConfirmRenewal}>
              Confirm Renewal
            </Button>
          </>
        }
      >
        {activeMembership && (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Renew <span className="font-semibold text-slate-900">{activeMembership.memberName}</span> on{' '}
              <span className="font-semibold text-emerald-700">{targetPlan?.name}</span>?
            </p>
            <p className="text-xs text-slate-500">
              New Expiry: <span className="font-mono font-semibold">{formatDate(calculation.newExpiry)}</span> · Amount:{' '}
              <span className="font-mono font-semibold">${calculation.finalAmount.toFixed(2)}</span>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RenewalManagementPage;
