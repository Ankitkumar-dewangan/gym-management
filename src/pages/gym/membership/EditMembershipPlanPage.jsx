import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import MembershipPlanForm from '../../../components/gym/membership/MembershipPlanForm';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';

export function EditMembershipPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlanById, updatePlan } = useMembershipManagement();

  const plan = getPlanById(id);

  if (!plan) {
    return (
      <EmptyState
        title="Membership plan not found"
        description="This plan may have been deleted or belongs to another gym business."
        actionLabel="Back to Plans"
        onAction={() => navigate('/gym/membership/plans')}
      />
    );
  }

  const handleSave = (data) => {
    updatePlan(plan.id, data);
    toast.success(`Saved changes to ${data.name}`);
    navigate('/gym/membership/plans');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Plan · ${plan.name}`}
        description={`Adjust pricing, inclusions, and freeze policy for ${plan.code}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/gym/membership/plans')}
          >
            Back to Plans
          </Button>
        }
      />

      <MembershipPlanForm
        mode="edit"
        initialData={plan}
        onSubmit={handleSave}
        onCancel={() => navigate('/gym/membership/plans')}
      />
    </div>
  );
}

export default EditMembershipPlanPage;
