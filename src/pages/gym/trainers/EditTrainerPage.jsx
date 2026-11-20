import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import TrainerForm from '../../../components/gym/trainers/TrainerForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function EditTrainerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { getTrainerById, updateTrainer } = useTrainerStaff();

  const trainer = getTrainerById(id);

  if (!trainer) {
    return (
      <EmptyState
        title="Trainer not found"
        description="This trainer profile does not exist in the active gym tenant."
        actionLabel="Return to Trainers"
        onAction={() => navigate('/gym/trainers')}
      />
    );
  }

  const handleUpdate = (formData) => {
    updateTrainer(trainer.id, formData);
    toast.success(`${formData.fullName}'s profile updated`);
    navigate(`/gym/trainers/${trainer.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Trainer · ${trainer.fullName}`}
        description={`Update coaching specializations, assigned branches, shift timing, and compensation for ${trainer.id}.`}
        actions={
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(`/gym/trainers/${trainer.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <TrainerForm
        mode="edit"
        initialValues={trainer}
        branches={tenantBranches}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/gym/trainers/${trainer.id}`)}
      />
    </div>
  );
}

export default EditTrainerPage;
