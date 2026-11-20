import { ArrowLeft, Building2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import GymForm from '../../../components/super-admin/gyms/GymForm';
import Button from '../../../components/ui/Button';
import { useGymManagement } from '../../../contexts/GymManagementContext';

export function EditGymPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGymById, updateGym } = useGymManagement();

  const gym = getGymById(id);

  if (!gym) {
    return (
      <EmptyState
        icon={Building2}
        title="Gym not found"
        description={`Cannot edit gym "${id}" because it does not exist.`}
        actionLabel="Back to All Gyms"
        onAction={() => navigate('/super-admin/gyms')}
      />
    );
  }

  const handleUpdate = (values) => {
    updateGym(gym.id, values);
    toast.success(`Updated ${values.name}`);
    navigate(`/super-admin/gyms/${gym.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${gym.name}`}
        description={`Gym ID ${gym.id} · Update organization details, owner profile, subscription limits, and flagship branch.`}
        actions={
          <Link to={`/super-admin/gyms/${gym.id}`}>
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Profile
            </Button>
          </Link>
        }
      />

      <GymForm
        mode="edit"
        initialData={gym}
        onSubmitForm={handleUpdate}
        onCancel={() => navigate(`/super-admin/gyms/${gym.id}`)}
      />
    </div>
  );
}

export default EditGymPage;
