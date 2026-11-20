import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Copy,
  Edit3,
  Eye,
  Plus,
  Power,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { PLAN_FEATURE_OPTIONS } from '../../../constants/membershipManagementData';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { cn } from '../../../utils/cn';
import { calculatePlanPricing } from '../../../utils/membershipCalculations';

export function MembershipPlansPage() {
  const navigate = useNavigate();
  const {
    tenantPlans,
    tenantMemberships,
    duplicatePlan,
    togglePlanStatus,
    deletePlan,
  } = useMembershipManagement();

  const [statusFilter, setStatusFilter] = useState('all');
  const [viewPlan, setViewPlan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredPlans = useMemo(() => {
    if (statusFilter === 'all') return tenantPlans;
    return tenantPlans.filter((p) => p.status === statusFilter);
  }, [tenantPlans, statusFilter]);

  const getAssignedCount = (planId) =>
    tenantMemberships.filter((m) => m.planId === planId && m.status !== 'cancelled').length;

  const handleDuplicate = (plan) => {
    duplicatePlan(plan.id);
    toast.success(`Duplicated ${plan.name} as draft`);
  };

  const handleToggle = (plan) => {
    togglePlanStatus(plan.id);
    toast.success(
      `${plan.name} ${plan.status === 'active' ? 'deactivated' : 'activated'}`
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deletePlan(deleteTarget.id);
    toast.success(`Deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Plans"
        description="Configure pricing tiers, duration cycles, inclusions, and freeze policies."
        actions={
          <Button
            variant="emerald"
            leftIcon={Plus}
            onClick={() => navigate('/gym/membership/plans/create')}
          >
            Create Membership Plan
          </Button>
        }
      />

      {/* Filter Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 gap-1">
          {[
            { key: 'all', label: `All Plans (${tenantPlans.length})` },
            {
              key: 'active',
              label: `Active (${tenantPlans.filter((p) => p.status === 'active').length})`,
            },
            {
              key: 'inactive',
              label: `Inactive (${tenantPlans.filter((p) => p.status === 'inactive').length})`,
            },
            {
              key: 'draft',
              label: `Draft (${tenantPlans.filter((p) => p.status === 'draft').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                statusFilter === tab.key
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/gym/membership/assign')}
        >
          Assign Plan to Member
        </Button>
      </div>

      {filteredPlans.length === 0 ? (
        <EmptyState
          title="No membership plans found"
          description="Create a configurable membership tier for your gym branches."
          actionLabel="Create Membership Plan"
          onAction={() => navigate('/gym/membership/plans/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const pricing = calculatePlanPricing(plan);
            const assignedCount = getAssignedCount(plan.id);
            const featuresList = PLAN_FEATURE_OPTIONS.filter((f) => plan.features?.[f.key]).map(
              (f) => f.label
            );

            return (
              <div
                key={plan.id}
                className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {plan.category} · <span className="font-mono">{plan.code}</span>
                      </p>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5 truncate">
                        {plan.name}
                      </h2>
                    </div>
                    <StatusBadge status={plan.status} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Pricing Block */}
                  <div className="border-y border-slate-100 py-4 flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-mono text-3xl font-bold text-navy-900 tabular-nums">
                        ${pricing.finalPlanPrice.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">
                        / {plan.durationDays} days
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      {plan.discountPercent > 0 ? (
                        <span className="font-semibold text-emerald-700">
                          {plan.discountPercent}% discount applied
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard rate</span>
                      )}
                      {plan.registrationFee > 0 && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          +${plan.registrationFee} reg. fee
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-xs text-slate-700">
                    {featuresList.slice(0, 5).map((label) => (
                      <li key={label} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                      </li>
                    ))}
                    {plan.otherFacilities && (
                      <li className="text-slate-500 pl-5 truncate">{plan.otherFacilities}</li>
                    )}
                  </ul>
                </div>

                {/* Footer Meta + Actions */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-mono tabular-nums">{assignedCount}</span> assigned members
                    </span>
                    <span className="text-slate-500">{plan.branchAccess}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={Eye}
                        onClick={() => setViewPlan(plan)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={Edit3}
                        onClick={() => navigate(`/gym/membership/plans/${plan.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate plan"
                        aria-label={`Duplicate ${plan.name}`}
                        onClick={() => handleDuplicate(plan)}
                        className="px-2"
                      >
                        <Copy className="h-4 w-4 text-slate-600" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={plan.status === 'active' ? 'Deactivate plan' : 'Activate plan'}
                        aria-label={`Toggle status for ${plan.name}`}
                        onClick={() => handleToggle(plan)}
                        className="px-2"
                      >
                        <Power
                          className={cn(
                            'h-4 w-4',
                            plan.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                          )}
                          aria-hidden="true"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete plan"
                        aria-label={`Delete ${plan.name}`}
                        onClick={() => setDeleteTarget(plan)}
                        className="px-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Detail Preview Modal */}
      <Modal
        isOpen={Boolean(viewPlan)}
        onClose={() => setViewPlan(null)}
        title={viewPlan?.name || 'Plan Details'}
        description={viewPlan ? `${viewPlan.category} · Code ${viewPlan.code}` : ''}
        size="md"
        footer={
          viewPlan && (
            <>
              <Button variant="outline" size="sm" onClick={() => setViewPlan(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = viewPlan.id;
                  setViewPlan(null);
                  navigate(`/gym/membership/plans/${id}/edit`);
                }}
              >
                Edit Plan
              </Button>
            </>
          )
        }
      >
        {viewPlan && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600">{viewPlan.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs">
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{viewPlan.durationDays} days</p>
              </div>
              <div>
                <p className="text-slate-500">Regular Price</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">${viewPlan.regularPrice}</p>
              </div>
              <div>
                <p className="text-slate-500">Discount / Tax</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">
                  {viewPlan.discountPercent}% / {viewPlan.taxPercent}%
                </p>
              </div>
              <div>
                <p className="text-slate-500">Branch Access</p>
                <p className="font-medium text-slate-900 mt-0.5">{viewPlan.branchAccess}</p>
              </div>
              <div>
                <p className="text-slate-500">Daily Entry Limit</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{viewPlan.dailyEntryLimit} / day</p>
              </div>
              <div>
                <p className="text-slate-500">Max Freeze Days</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">
                  {viewPlan.freezeAllowed ? `${viewPlan.maxFreezeDays} days` : 'Not allowed'}
                </p>
              </div>
            </div>
            {viewPlan.notes && (
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Plan Notes:</span> {viewPlan.notes}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Plan Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Membership Plan"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" from the plan catalog? Existing member records will retain their historical plan snapshots.`
            : ''
        }
        confirmLabel="Delete Plan"
      />
    </div>
  );
}

export default MembershipPlansPage;
