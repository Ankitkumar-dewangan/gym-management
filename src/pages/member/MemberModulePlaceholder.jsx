import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';

export function MemberModulePlaceholder({ title, description }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link to="/member/dashboard">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={ClipboardList}
        title={`${title} Section`}
        description="This member portal view is connected and responsive. Detailed records and interactive tools will be built in upcoming modules."
      />
    </div>
  );
}

export default MemberModulePlaceholder;
