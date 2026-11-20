import { useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  Eye,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { SUBSCRIPTION_FEATURE_LIST } from '../../../constants/subscriptionData';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';

export function SubscriptionPlansPage() {
  const {
    plans,
    subscriptions,
    duplicatePlan,
    togglePlanStatus,
    deletePlan,
  } = useSubscriptions();

  const [viewingPlan, setViewingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  const getGymCountForPlan = (plan) =>
    subscriptions.filter(
      (s) => s.planId === plan.id || s.planName.toLowerCase() === plan.name.toLowerCase()
    ).length;

  const formatLimit = (val, unlimited, unit) =>
    unlimited || val < 0 ? `Unlimited ${unit}` : `${formatNumber(val)} ${unit}`;

  const getFeatureLabels = (featureKeys = []) =>
    SUBSCRIPTION_FEATURE_LIST.filter((f) => featureKeys.includes(f.key)).map(
      (f) => f.label
    );

  const handleDuplicate = (plan) => {
    duplicatePlan(plan.id);
    toast.success(`Duplicated "${plan.name}" as draft`);
  };

  const handleToggle = (plan) => {
    togglePlanStatus(plan.id);
    toast.success(
      `${plan.name} ${plan.status === 'active' ? 'deactivated' : 'activated'}`
    );
  };

  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    deletePlan(planToDelete.id);
    toast.success(`Deleted "${planToDelete.name}"`);
    setPlanToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Configure pricing tiers, branch/member limits, and feature permissions across your SaaS."
        actions={
          <Link to="/super-admin/subscription-plans/create">
            <Button variant="emerald" leftIcon={Plus}>
              Create Custom Plan
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const gymCount = getGymCountForPlan(plan);
          const featureLabels =
            plan.highlights?.length > 0
              ? plan.highlights
              : getFeatureLabels(plan.features);

          return (
            <article
              key={plan.id}
              className={`rounded-xl border bg-white p-6 shadow-2xs flex flex-col justify-between transition-colors ${
                plan.isFeatured ? 'border-emerald-400' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-900">
                        {plan.name}
                      </h2>
                      {plan.badge && (
                        <span className="rounded-md bg-navy-50 border border-navy-100 px-2 py-0.5 text-[11px] font-semibold text-navy-900">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {plan.code} · Created {formatDate(plan.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-5 pb-5 border-b border-slate-100 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-display text-3xl font-bold text-slate-900 tabular-nums">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    <span className="text-xs text-slate-500"> / month</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-emerald-700 tabular-nums">
                      {formatCurrency(plan.yearlyPrice)}/yr
                    </span>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {gymCount} {gymCount === 1 ? 'gym' : 'gyms'} using plan
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branch Quota</span>
                    <span className="font-medium tabular-nums">
                      {formatLimit(
                        plan.limits?.maxBranches,
                        plan.limits?.unlimitedBranches,
                        'Branches'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Member Quota</span>
                    <span className="font-medium tabular-nums">
                      {formatLimit(
                        plan.limits?.maxMembers,
                        plan.limits?.unlimitedMembers,
                        'Members'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trainer Quota</span>
                    <span className="font-medium tabular-nums">
                      {formatLimit(
                        plan.limits?.maxTrainers,
                        plan.limits?.unlimitedTrainers,
                        'Trainers'
                      )}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {featureLabels.slice(0, 6).map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <Check
                        className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingPlan(plan)}
                    title="View Plan"
                    aria-label={`View ${plan.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <Link
                    to={`/super-admin/subscription-plans/${plan.id}/edit`}
                    title="Edit Plan"
                    aria-label={`Edit ${plan.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(plan)}
                    title="Duplicate Plan"
                    aria-label={`Duplicate ${plan.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Power}
                    onClick={() => handleToggle(plan)}
                  >
                    {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPlanToDelete(plan)}
                    title="Delete Plan"
                    aria-label={`Delete ${plan.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* View Plan Details Modal */}
      <Modal
        isOpen={Boolean(viewingPlan)}
        onClose={() => setViewingPlan(null)}
        title={viewingPlan?.name || 'Plan Details'}
        description={viewingPlan ? `${viewingPlan.code} · ${viewingPlan.description}` : ''}
        size="md"
        footer={
          viewingPlan ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setViewingPlan(null)}>
                Close
              </Button>
              <Link to={`/super-admin/subscription-plans/${viewingPlan.id}/edit`}>
                <Button variant="primary" size="sm">
                  Edit Plan
                </Button>
              </Link>
            </>
          ) : null
        }
      >
        {viewingPlan && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <p className="text-xs text-slate-500">Monthly</p>
                <p className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingPlan.monthlyPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Yearly</p>
                <p className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(viewingPlan.yearlyPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Trial Days</p>
                <p className="font-mono font-semibold text-slate-900 tabular-nums">
                  {viewingPlan.trialDays} days
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Storage</p>
                <p className="font-mono font-semibold text-slate-900 tabular-nums">
                  {viewingPlan.limits?.storageGb || 10} GB
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Enabled Feature Permissions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getFeatureLabels(viewingPlan.features).map((label) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${planToDelete?.name}?`}
        description="This removes the subscription tier from the catalog. Existing gyms will retain their historical record."
        confirmLabel="Delete Plan"
        variant="danger"
      />
    </div>
  );
}

export default SubscriptionPlansPage;
