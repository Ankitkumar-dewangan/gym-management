import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import MembershipPlanForm from '../../../components/gym/membership/MembershipPlanForm';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';

export function CreateMembershipPlanPage() {
  const navigate = useNavigate();
  const { createPlan } = useMembershipManagement();

  const handleCreate = (data) => {
    const plan = createPlan(data, false);
    toast.success(`Created membership plan "${plan.name}"`);
    navigate('/gym/membership/plans');
  };

  const handleSaveDraft = (data) => {
    const plan = createPlan(data, true);
    toast.success(`Saved "${plan.name}" as draft`);
    navigate('/gym/membership/plans');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Membership Plan"
        description="Configure duration, pricing, taxes, member inclusions, and freeze restrictions."
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
        mode="create"
        onSubmit={handleCreate}
        onSaveDraft={handleSaveDraft}
        onCancel={() => navigate('/gym/membership/plans')}
      />
    </div>
  );
}

export default CreateMembershipPlanPage;
