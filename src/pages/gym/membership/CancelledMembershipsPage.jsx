import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Plus, XCircle } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function CancelledMembershipsPage() {
  const navigate = useNavigate();
  const { scopedMemberships } = useMembershipManagement();

  const cancelledRows = useMemo(
    () => scopedMemberships.filter((m) => m.status === 'cancelled'),
    [scopedMemberships]
  );

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[175px]">
          <UserAvatar src={row.memberAvatar} name={row.memberName} size="md" />
          <div className="min-w-0">
            <Link
              to={`/gym/membership/${row.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
            >
              {row.memberName}
            </Link>
            <p className="text-xs font-mono text-slate-500">{row.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Previous Plan',
      render: (row) => <span className="text-xs font-medium text-slate-800">{row.planName}</span>,
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-xs text-slate-600">{row.branchName}</span>,
    },
    {
      key: 'cancelledAt',
      header: 'Cancelled Date',
      numeric: true,
      render: (row) => (
        <span className="text-xs text-slate-700">
          {formatDate(row.cancelledAt || row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'cancellationReason',
      header: 'Cancellation Reason',
      render: (row) => (
        <span className="text-xs text-slate-600 max-w-[220px] truncate block">
          {row.cancellationReason || 'Member requested termination'}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Settled Fees',
      numeric: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-900">
          {formatCurrency(row.paidAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="emerald"
            size="sm"
            leftIcon={Plus}
            onClick={() => navigate(`/gym/membership/assign?memberId=${row.memberId}`)}
          >
            Reassign Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/gym/membership/${row.id}`)}
            className="px-2"
          >
            <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancelled Memberships"
        description="Review terminated memberships, cancellation reasons, and quick reactivation workflows."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/gym/membership/history')}
          >
            View Lifecycle History
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Cancelled Plans"
          value={String(cancelledRows.length)}
          helperText="in current scope"
          icon={XCircle}
        />
        <StatCard
          label="Settled Revenue Before Cancellation"
          value={formatCurrency(
            cancelledRows.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0)
          )}
          helperText="collected prior to exit"
          icon={Plus}
        />
      </div>

      <DataTable
        columns={columns}
        data={cancelledRows}
        onRowClick={(row) => navigate(`/gym/membership/${row.id}`)}
        emptyTitle="No cancelled memberships"
        emptyDescription="No memberships have been cancelled in the current branch scope."
      />
    </div>
  );
}

export default CancelledMembershipsPage;
