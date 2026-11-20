import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StaffForm from '../../../components/gym/staff/StaffForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function AddStaffPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { registerStaff } = useTrainerStaff();

  const handleSubmit = (formData) => {
    const created = registerStaff(formData, { asDraft: false });
    toast.success(`${created.fullName} (${created.id}) added to staff roster`);
    navigate(`/gym/staff/${created.id}`);
  };

  const handleDraft = (formData) => {
    const draft = registerStaff(formData, { asDraft: true });
    toast.success(`${draft.fullName} saved as inactive draft`);
    navigate('/gym/staff');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Staff Member"
        description="Register a branch manager, receptionist, accountant, sales executive, or support staff member."
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/staff')}>
            Back to Staff
          </Button>
        }
      />

      <StaffForm
        mode="create"
        branches={tenantBranches}
        onSubmit={handleSubmit}
        onSaveDraft={handleDraft}
        onCancel={() => navigate('/gym/staff')}
      />
    </div>
  );
}

export default AddStaffPage;
