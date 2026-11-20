import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import MemberForm from '../../../components/gym/members/MemberForm';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';

export function EditMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { getMemberById, updateMember } = useMemberManagement();

  const member = getMemberById(id);

  if (!member) {
    return (
      <EmptyState
        title="Member record not found"
        description="This member profile may have been removed or belongs to another gym tenant."
        actionLabel="Return to Members"
        onAction={() => navigate('/gym/members')}
      />
    );
  }

  const handleSave = (data) => {
    updateMember(member.id, data);
    toast.success(`Updated profile for ${data.fullName}`);
    navigate(`/gym/members/${member.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Member · ${member.fullName}`}
        description={`Update profile, emergency contact, membership assignment, or documents for ${member.id}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => navigate(`/gym/members/${member.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <MemberForm
        mode="edit"
        initialData={member}
        branches={tenantBranches}
        onSubmit={handleSave}
        onCancel={() => navigate(`/gym/members/${member.id}`)}
      />
    </div>
  );
}

export default EditMemberPage;
