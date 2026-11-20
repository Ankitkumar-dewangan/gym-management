import { Link } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';

export function SuperAdminPlaceholder({ title, description }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link to="/super-admin/dashboard">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Overview
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={Layers}
        title={`${title} Module Ready`}
        description="This Super Admin section is routed and connected to the platform shell. Business logic and API integration will be added in upcoming steps."
      />
    </div>
  );
}

export default SuperAdminPlaceholder;
