import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import MemberForm from '../../../components/gym/members/MemberForm';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';

export function AddMemberPage() {
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { tenantBranches } = useBranchManagement();
  const { registerMember } = useMemberManagement();

  const handleRegister = (data) => {
    const created = registerMember(data, { asDraft: false, collectPayment: false });
    toast.success(`Registered ${created.fullName} (${created.id})`);
    navigate(`/gym/members/${created.id}`);
  };

  const handleSaveDraft = (data) => {
    const created = registerMember(data, { asDraft: true, collectPayment: false });
    toast.success(`Saved ${created.fullName} as inactive draft`);
    navigate(`/gym/members/${created.id}`);
  };

  const handleRegisterAndCollect = (data) => {
    const created = registerMember(data, { asDraft: false, collectPayment: true });
    toast.success(`Registered ${created.fullName} & recorded initial payment`);
    navigate(`/gym/members/${created.id}?tab=payments`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Member"
        description={`Enroll a new gym member under ${activeTenant.name} and assign branch access.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/gym/members')}
          >
            Back to Members
          </Button>
        }
      />

      <MemberForm
        mode="create"
        branches={tenantBranches}
        onSubmit={handleRegister}
        onSaveDraft={handleSaveDraft}
        onSubmitAndCollect={handleRegisterAndCollect}
        onCancel={() => navigate('/gym/members')}
      />
    </div>
  );
}

export default AddMemberPage;
