import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import GymForm from '../../../components/super-admin/gyms/GymForm';
import Button from '../../../components/ui/Button';
import { useGymManagement } from '../../../contexts/GymManagementContext';

export function AddGymPage() {
  const navigate = useNavigate();
  const { createGym } = useGymManagement();

  const handleCreate = (values) => {
    const created = createGym(values, { asDraft: false });
    toast.success(`${created.name} created and queued for approval`);
    navigate(`/super-admin/gyms/${created.id}`);
  };

  const handleSaveDraft = (values) => {
    const created = createGym(values, { asDraft: true });
    toast.success(`Saved "${created.name}" as draft`);
    navigate('/super-admin/gyms');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Gym"
        description="Register a new gym organization, owner credentials, subscription tier, and initial branch."
        actions={
          <Link to="/super-admin/gyms">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to All Gyms
            </Button>
          </Link>
        }
      />

      <GymForm
        mode="create"
        onSubmitForm={handleCreate}
        onSaveDraft={handleSaveDraft}
        onCancel={() => navigate('/super-admin/gyms')}
      />
    </div>
  );
}

export default AddGymPage;
