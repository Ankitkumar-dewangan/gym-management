import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import BranchForm from '../../../components/gym/branches/BranchForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useTenant } from '../../../contexts/TenantContext';

export function AddBranchPage() {
  const navigate = useNavigate();
  const { activeTenant } = useTenant();
  const { tenantManagers, createBranch } = useBranchManagement();

  const handleCreate = (formData) => {
    const created = createBranch(formData, false);
    toast.success(`Branch "${created.name}" created for ${activeTenant.name}`);
    navigate(`/gym/branches/${created.id}`);
  };

  const handleSaveDraft = (formData) => {
    const draft = createBranch(formData, true);
    toast.success(`Saved "${draft.name}" as draft`);
    navigate('/gym/branches');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Branch"
        description={`Register a new club location, facilities, hours, and manager under ${activeTenant.name}.`}
        actions={
          <Link to="/gym/branches">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Branches
            </Button>
          </Link>
        }
      />

      <BranchForm
        mode="create"
        managers={tenantManagers}
        onSubmit={handleCreate}
        onSaveDraft={handleSaveDraft}
        onCancel={() => navigate('/gym/branches')}
      />
    </div>
  );
}

export default AddBranchPage;
