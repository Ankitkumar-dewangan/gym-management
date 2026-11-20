import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import PlanForm from '../../../components/super-admin/subscriptions/PlanForm';
import Button from '../../../components/ui/Button';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';

export function CreatePlanPage() {
  const navigate = useNavigate();
  const { createPlan } = useSubscriptions();

  const handleCreate = (payload) => {
    const created = createPlan(payload, { asDraft: false });
    toast.success(`Created subscription plan "${created.name}"`);
    navigate('/super-admin/subscription-plans');
  };

  const handleDraft = (payload) => {
    const created = createPlan(payload, { asDraft: true });
    toast.success(`Saved "${created.name}" as draft`);
    navigate('/super-admin/subscription-plans');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Subscription Plan"
        description="Define pricing, usage quotas, and granular feature permissions for a new gym plan."
        actions={
          <Link to="/super-admin/subscription-plans">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Plans
            </Button>
          </Link>
        }
      />

      <PlanForm
        mode="create"
        onSubmitPlan={handleCreate}
        onSaveDraft={handleDraft}
        onCancel={() => navigate('/super-admin/subscription-plans')}
      />
    </div>
  );
}

export default CreatePlanPage;
