import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import StatusBadge from '../../common/StatusBadge';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';

export function ChangePlanModal({
  isOpen,
  onClose,
  subscription,
  plans = [],
  onConfirm,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(
    subscription?.planId || plans[0]?.id || ''
  );
  const [billingCycle, setBillingCycle] = useState(
    subscription?.billingCycle || 'Monthly'
  );

  useEffect(() => {
    if (subscription) {
      setSelectedPlanId(subscription.planId || plans[0]?.id || '');
      setBillingCycle(subscription.billingCycle || 'Monthly');
    }
  }, [subscription, plans]);

  const activePlan = plans.find((p) => p.id === selectedPlanId);
  const nextPrice = activePlan
    ? billingCycle === 'Yearly'
      ? activePlan.yearlyPrice
      : activePlan.monthlyPrice
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Plan · ${subscription?.gymName || ''}`}
      description="Switch subscription tier or billing GymPilot."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => onConfirm?.(subscription, selectedPlanId, billingCycle)}
          >
            Update Subscription
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Subscription Plan"
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          options={plans.map((p) => ({
            value: p.id,
            label: `${p.name} (${formatCurrency(p.monthlyPrice)}/mo)`,
          }))}
        />
        <Select
          label="Billing Cycle"
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value)}
          options={[
            { value: 'Monthly', label: 'Monthly Billing' },
            { value: 'Yearly', label: 'Yearly Billing' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 flex items-center justify-between text-sm">
          <span className="text-slate-600">Updated rate</span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {formatCurrency(nextPrice)} / {billingCycle === 'Yearly' ? 'yr' : 'mo'}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export function ExtendSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  title = 'Extend Subscription',
  onConfirm,
}) {
  const [days, setDays] = useState('30');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} · ${subscription?.gymName || ''}`}
      description="Add complimentary or manual extension days to the current expiry date."
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => onConfirm?.(subscription, Number(days))}
          >
            Extend by {days} Days
          </Button>
        </>
      }
    >
      <Select
        label="Extension Duration"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        options={[
          { value: '7', label: '7 Days' },
          { value: '14', label: '14 Days' },
          { value: '30', label: '30 Days (1 Month)' },
          { value: '90', label: '90 Days (1 Quarter)' },
        ]}
      />
    </Modal>
  );
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${transaction.invoiceNo || transaction.id}`}
      description={`Transaction ${transaction.id} · ${transaction.gymName}`}
      size="sm"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <StatusBadge status={transaction.status} />
        </div>

        <dl className="space-y-2.5">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Gym Organization</dt>
            <dd className="font-medium text-slate-900">{transaction.gymName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Subscription Plan</dt>
            <dd className="font-medium text-slate-900">{transaction.planName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Payment Date</dt>
            <dd className="tabular-nums text-slate-900">{formatDate(transaction.date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Payment Method</dt>
            <dd className="text-slate-900">{transaction.method}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Gateway</dt>
            <dd className="text-slate-900">{transaction.gateway}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
