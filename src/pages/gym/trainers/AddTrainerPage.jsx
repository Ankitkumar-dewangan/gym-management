import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import TrainerForm from '../../../components/gym/trainers/TrainerForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function AddTrainerPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { registerTrainer } = useTrainerStaff();

  const handleRegister = (formData) => {
    const created = registerTrainer(formData, { asDraft: false });
    toast.success(`${created.fullName} (${created.id}) registered as trainer`);
    navigate(`/gym/trainers/${created.id}`);
  };

  const handleDraft = (formData) => {
    const draft = registerTrainer(formData, { asDraft: true });
    toast.success(`${draft.fullName} saved as inactive draft`);
    navigate('/gym/trainers');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Trainer"
        description="Onboard a personal trainer or strength coach with branch access, shift schedule, and payroll structure."
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/gym/trainers')}>
            Back to Trainers
          </Button>
        }
      />

      <TrainerForm
        mode="create"
        branches={tenantBranches}
        onSubmit={handleRegister}
        onSaveDraft={handleDraft}
        onCancel={() => navigate('/gym/trainers')}
      />
    </div>
  );
}

export default AddTrainerPage;
