import { Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';

export function GymModulePlaceholder({ title, description }) {
  const { activeTenant, activeBranch } = useTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`${activeTenant.name} · ${activeBranch.name} — ${description}`}
        actions={
          <Link to="/gym/dashboard">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
          <FolderKanban className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{title} Workspace</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {description}
          </p>
        </div>
        <div className="pt-2">
          <Link to="/gym/dashboard">
            <Button size="sm">
              Return to Gym Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GymModulePlaceholder;
