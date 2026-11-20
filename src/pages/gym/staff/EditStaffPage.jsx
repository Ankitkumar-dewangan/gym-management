import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StaffForm from '../../../components/gym/staff/StaffForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';

export function EditStaffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { getStaffById, updateStaff } = useTrainerStaff();

  const person = getStaffById(id);

  if (!person) {
    return (
      <EmptyState
        title="Staff member not found"
        description="This employee profile could not be found in the active gym."
        actionLabel="Back to Staff"
        onAction={() => navigate('/gym/staff')}
      />
    );
  }

  const handleUpdate = (formData) => {
    updateStaff(person.id, formData);
    toast.success(`${formData.fullName}'s details updated`);
    navigate(`/gym/staff/${person.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Staff · ${person.fullName}`}
        description={`Modify role, branch assignment, shift timing, and salary setup for ${person.id}.`}
        actions={
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(`/gym/staff/${person.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <StaffForm
        mode="edit"
        initialValues={person}
        branches={tenantBranches}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/gym/staff/${person.id}`)}
      />
    </div>
  );
}

export default EditStaffPage;
