import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import PlanForm from '../../../components/super-admin/subscriptions/PlanForm';
import Button from '../../../components/ui/Button';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';

export function EditPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlanById, updatePlan } = useSubscriptions();

  const plan = getPlanById(id);

  if (!plan) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Subscription plan not found"
        description={`No plan found with ID "${id}".`}
        actionLabel="Back to Plans"
        onAction={() => navigate('/super-admin/subscription-plans')}
      />
    );
  }

  const handleUpdate = (payload) => {
    updatePlan(plan.id, payload);
    toast.success(`Updated plan "${payload.name}"`);
    navigate('/super-admin/subscription-plans');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Plan · ${plan.name}`}
        description={`Code ${plan.code} · Modify pricing, quotas, or enabled feature permissions.`}
        actions={
          <Link to="/super-admin/subscription-plans">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Plans
            </Button>
          </Link>
        }
      />

      <PlanForm
        mode="edit"
        initialData={plan}
        onSubmitPlan={handleUpdate}
        onCancel={() => navigate('/super-admin/subscription-plans')}
      />
    </div>
  );
}

export default EditPlanPage;
