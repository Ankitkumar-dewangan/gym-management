import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  CheckCircle2,
  Eye,
  RotateCw,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
import {
  ChangePlanModal,
  ExtendSubscriptionModal,
  TransactionDetailsModal,
} from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { SUBSCRIPTION_FEATURE_LIST } from '../../../constants/subscriptionData';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Plan Features & Usage' },
  { id: 'billing', label: 'Billing History' },
  { id: 'activity', label: 'Activity History' },
];

export function SubscriptionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    plans,
    transactions,
    getSubscriptionById,
    changeSubscriptionPlan,
    extendSubscription,
    renewSubscription,
    cancelSubscription,
  } = useSubscriptions();

  const subscription = getSubscriptionById(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const plan = useMemo(
    () =>
      plans.find(
        (p) => p.id === subscription?.planId || p.name === subscription?.planName
      ) || plans[0],
    [plans, subscription]
  );

  const billingHistory = useMemo(() => {
    if (!subscription) return [];
    return transactions.filter(
      (t) =>
        t.subscriptionId === subscription.id ||
        t.gymName === subscription.gymName
    );
  }, [transactions, subscription]);

  if (!subscription) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Subscription record not found"
          description="This subscription ID does not exist or may have been removed."
          actionLabel="Back to Subscriptions"
          onAction={() => navigate('/super-admin/active-subscriptions')}
        />
      </div>
    );
  }

  const usageMeters = [
    {
      label: 'Branches',
      used: subscription.usage?.branches ?? 1,
      limit: plan?.limits?.unlimitedBranches ? -1 : plan?.limits?.maxBranches ?? 1,
    },
    {
      label: 'Members',
      used: subscription.usage?.members ?? 0,
      limit: plan?.limits?.unlimitedMembers ? -1 : plan?.limits?.maxMembers ?? 200,
    },
    {
      label: 'Trainers',
      used: subscription.usage?.trainers ?? 0,
      limit: plan?.limits?.unlimitedTrainers ? -1 : plan?.limits?.maxTrainers ?? 3,
    },
  ];

  const billingColumns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800">{row.id}</span>
      ),
    },
    {
      key: 'invoiceNo',
      header: 'Invoice',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.invoiceNo}</span>
      ),
    },
    {
      key: 'date',
      header: 'Payment Date',
      render: (row) => <span className="tabular-nums">{formatDate(row.date)}</span>,
    },
    { key: 'method', header: 'Method' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedTxn(row)}
          aria-label={`View invoice ${row.invoiceNo}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/super-admin/active-subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Subscriptions</span>
        </Link>
      </div>

      {/* Header Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {subscription.gymName}
              </h1>
              <SubscriptionBadge plan={subscription.planName} />
              <StatusBadge status={subscription.status} />
            </div>
            <p className="text-xs text-slate-500">
              Subscription <span className="font-mono font-medium text-slate-700">{subscription.id}</span> · Owner: {subscription.ownerName} ({subscription.ownerEmail})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ArrowUpRight}
              onClick={() => setShowChangePlan(true)}
            >
              Upgrade / Downgrade
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={CalendarPlus}
              onClick={() => setShowExtend(true)}
            >
              Extend
            </Button>
            <Button
              variant="emerald"
              size="sm"
              leftIcon={RotateCw}
              onClick={() => {
                renewSubscription(subscription.id);
                toast.success(`Renewed ${subscription.gymName}`);
              }}
            >
              Renew
            </Button>
            {subscription.status !== 'cancelled' && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={XCircle}
                onClick={() => setShowCancel(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-slate-200 flex flex-wrap gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                activeTab === tab.id
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'overview' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              Subscription Summary
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Current Plan</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {subscription.planName} ({subscription.billingCycle})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Billing Amount</dt>
                <dd className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(subscription.amount)} /{' '}
                  {subscription.billingCycle === 'Yearly' ? 'year' : 'month'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Start Date</dt>
                <dd className="mt-1 text-slate-800 tabular-nums">
                  {formatDate(subscription.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Next Renewal / Expiry</dt>
                <dd className="mt-1 text-slate-800 tabular-nums">
                  {formatDate(subscription.expiryDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Last Payment Date</dt>
                <dd className="mt-1 text-slate-800 tabular-nums">
                  {formatDate(subscription.lastPaymentDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Payment Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={subscription.paymentStatus} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              Tenant Contact & Quota Snapshot
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Owner Name</dt>
                <dd className="mt-1 font-medium text-slate-900">{subscription.ownerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Gym ID</dt>
                <dd className="mt-1 font-mono text-slate-700">{subscription.gymId}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="mt-1 text-slate-700">{subscription.ownerEmail}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Contact Phone</dt>
                <dd className="mt-1 font-mono text-slate-700">{subscription.ownerPhone}</dd>
              </div>
            </dl>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Want to inspect tenant branches and staff?</span>
              <Link
                to={`/super-admin/gyms/${subscription.gymId}`}
                className="font-semibold text-navy-900 hover:text-emerald-700"
              >
                Open Gym Profile &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'features' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              Usage vs Plan Limits
            </h2>
            <div className="space-y-4">
              {usageMeters.map((meter) => {
                const isUnlimited = meter.limit === -1;
                const pct = isUnlimited
                  ? 25
                  : Math.min(100, Math.round((meter.used / Math.max(1, meter.limit)) * 100));
                return (
                  <div key={meter.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{meter.label}</span>
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {meter.used} / {isUnlimited ? 'Unlimited' : meter.limit}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          !isUnlimited && pct >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              Enabled Module Permissions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUBSCRIPTION_FEATURE_LIST.map((feat) => {
                const enabled = plan?.features?.includes(feat.key);
                return (
                  <div
                    key={feat.key}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs',
                      enabled
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        enabled ? 'text-emerald-600' : 'text-slate-300'
                      )}
                      aria-hidden="true"
                    />
                    <span>{feat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <DataTable
          columns={billingColumns}
          data={billingHistory}
          emptyTitle="No invoices recorded yet"
          emptyDescription="Settled invoices and payment attempts for this subscription will appear here."
        />
      )}

      {activeTab === 'activity' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Subscription Activity Timeline
          </h2>
          {!subscription.activityHistory?.length ? (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {subscription.activityHistory.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">{item.action}</p>
                    <p className="text-xs text-slate-500">By {item.actor}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {formatDate(item.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <ChangePlanModal
        isOpen={showChangePlan}
        onClose={() => setShowChangePlan(false)}
        subscription={subscription}
        plans={plans}
        onConfirm={(sub, planId, cycle) => {
          changeSubscriptionPlan(sub.id, planId, cycle);
          toast.success(`Updated plan for ${sub.gymName}`);
          setShowChangePlan(false);
        }}
      />

      <ExtendSubscriptionModal
        isOpen={showExtend}
        onClose={() => setShowExtend(false)}
        subscription={subscription}
        onConfirm={(sub, days) => {
          extendSubscription(sub.id, days);
          toast.success(`Extended ${sub.gymName} by ${days} days`);
          setShowExtend(false);
        }}
      />

      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => {
          cancelSubscription(subscription.id);
          toast.error(`Cancelled subscription for ${subscription.gymName}`);
          setShowCancel(false);
        }}
        title={`Cancel ${subscription.gymName}'s subscription?`}
        description="Cancelling stops automated billing renewals for this gym."
        confirmLabel="Cancel Subscription"
        variant="danger"
      />

      <TransactionDetailsModal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </div>
  );
}

export default SubscriptionDetailsPage;
