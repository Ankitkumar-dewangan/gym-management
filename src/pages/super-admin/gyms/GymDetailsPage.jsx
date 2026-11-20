import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import GymDetailsTabs from '../../../components/super-admin/gyms/GymDetailsTabs';
import GymProfileHeader from '../../../components/super-admin/gyms/GymProfileHeader';
import { useGymManagement } from '../../../contexts/GymManagementContext';

export function GymDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGymById, updateGymStatus, updateGymPlan } = useGymManagement();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const gym = getGymById(id);

  if (!gym) {
    return (
      <EmptyState
        icon={Building2}
        title="Gym not found"
        description={`No gym record exists for ID "${id}". It may have been removed or the URL is incorrect.`}
        actionLabel="Return to All Gyms"
        onAction={() => navigate('/super-admin/gyms')}
      />
    );
  }

  const isSuspendedOrInactive =
    gym.status === 'suspended' || gym.status === 'inactive';

  const handleConfirmToggle = () => {
    const nextStatus = isSuspendedOrInactive ? 'active' : 'suspended';
    updateGymStatus(
      gym.id,
      nextStatus,
      `Workspace ${isSuspendedOrInactive ? 'activated' : 'suspended'} from profile header`
    );
    toast.success(`${gym.name} ${isSuspendedOrInactive ? 'activated' : 'suspended'}`);
    setConfirmOpen(false);
  };

  const handlePlanChange = (planName) => {
    updateGymPlan(gym.id, planName);
    toast.success(`Updated subscription plan to ${planName}`);
  };

  return (
    <div className="space-y-6">
      <GymProfileHeader
        gym={gym}
        onToggleStatus={() => setConfirmOpen(true)}
      />

      <GymDetailsTabs gym={gym} onChangePlan={handlePlanChange} />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={isSuspendedOrInactive ? `Activate ${gym.name}?` : `Suspend ${gym.name}?`}
        description={
          isSuspendedOrInactive
            ? 'Activating restores portal access for the gym owner and all branches.'
            : 'Suspending immediately pauses gym owner and branch operations.'
        }
        confirmLabel={isSuspendedOrInactive ? 'Activate Gym' : 'Suspend Gym'}
        variant={isSuspendedOrInactive ? 'emerald' : 'danger'}
      />
    </div>
  );
}

export default GymDetailsPage;
