import { ArrowLeft, Building2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import BranchForm from '../../../components/gym/branches/BranchForm';
import Button from '../../../components/ui/Button';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';

export function EditBranchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBranchById, tenantManagers, updateBranch } = useBranchManagement();

  const branch = getBranchById(id);

  if (!branch) {
    return (
      <EmptyState
        icon={Building2}
        title="Branch not found"
        description="The branch you are trying to edit could not be located."
        actionLabel="Back to All Branches"
        onAction={() => navigate('/gym/branches')}
      />
    );
  }

  const handleSave = (formData) => {
    updateBranch(branch.id, formData);
    toast.success(`Updated "${formData.name}" branch details`);
    navigate(`/gym/branches/${branch.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Branch: ${branch.name}`}
        description={`${branch.code} · Update branch details, facility configuration, operating hours, and manager assignment.`}
        actions={
          <Link to={`/gym/branches/${branch.id}`}>
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Branch Profile
            </Button>
          </Link>
        }
      />

      <BranchForm
        mode="edit"
        initialData={branch}
        managers={tenantManagers}
        onSubmit={handleSave}
        onCancel={() => navigate(`/gym/branches/${branch.id}`)}
      />
    </div>
  );
}

export default EditBranchPage;
