import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatDate } from '../../../utils/formatters';
import { exportRowsToCsv } from '../../../utils/membershipCalculations';

export function MembershipHistoryPage() {
  const navigate = useNavigate();
  const { scopedMemberships } = useMembershipManagement();

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const events = useMemo(() => {
    const all = scopedMemberships.flatMap((m) =>
      (m.activityHistory || []).map((act) => ({
        id: `${m.id}-${act.id}`,
        membershipId: m.id,
        memberId: m.memberId,
        memberName: m.memberName,
        branchName: m.branchName,
        planName: m.planName,
        type: act.type || 'assignment',
        title: act.title,
        detail: act.detail,
        timestamp: act.timestamp,
      }))
    );

    const q = search.trim().toLowerCase();
    return all
      .filter((e) => {
        if (eventFilter !== 'all' && e.type !== eventFilter) return false;
        if (q) {
          const hit =
            e.memberName.toLowerCase().includes(q) ||
            e.memberId.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.planName.toLowerCase().includes(q);
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [scopedMemberships, search, eventFilter]);

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = events.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleExport = () => {
    exportRowsToCsv(
      ['Date', 'Member', 'Member ID', 'Plan', 'Branch', 'Event Type', 'Action', 'Details'],
      events.map((e) => [
        e.timestamp,
        e.memberName,
        e.memberId,
        e.planName,
        e.branchName,
        e.type,
        e.title,
        e.detail,
      ]),
      'membership_history.csv'
    );
    toast.success(`Exported ${events.length} lifecycle records`);
  };

  const columns = [
    {
      key: 'timestamp',
      header: 'Date',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.timestamp)}</span>,
    },
    {
      key: 'memberName',
      header: 'Member',
      render: (row) => (
        <div>
          <Link
            to={`/gym/membership/${row.membershipId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-slate-900 hover:text-emerald-700"
          >
            {row.memberName}
          </Link>
          <p className="text-xs font-mono text-slate-500">{row.memberId}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Event',
      render: (row) => {
        const map = {
          renewal: 'renewed',
          upgrade: 'upgraded',
          downgrade: 'downgraded',
          freeze: 'frozen',
          cancellation: 'cancelled',
          reminder: 'sent',
          assignment: 'active',
          resume: 'active',
        };
        return <StatusBadge status={map[row.type] || 'active'} label={row.type} />;
      },
    },
    {
      key: 'title',
      header: 'Summary',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500">{row.detail}</p>
        </div>
      ),
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-xs text-slate-600">{row.branchName}</span>,
    },
    {
      key: 'actions',
      header: 'View',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/gym/membership/${row.membershipId}`);
          }}
          className="px-2"
        >
          <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership History"
        description="Immutable audit ledger of assignments, renewals, upgrades, freezes, and cancellations."
        actions={
          <Button variant="outline" leftIcon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search member, ID, or lifecycle event..."
        hasActiveFilters={Boolean(search.trim()) || eventFilter !== 'all'}
        onReset={() => {
          setSearch('');
          setEventFilter('all');
          setPage(1);
        }}
      >
        <Select
          aria-label="Filter by event type"
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-44"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'All Events' },
            { value: 'assignment', label: 'Assignments' },
            { value: 'renewal', label: 'Renewals' },
            { value: 'upgrade', label: 'Upgrades' },
            { value: 'downgrade', label: 'Downgrades' },
            { value: 'freeze', label: 'Freezes' },
            { value: 'cancellation', label: 'Cancellations' },
          ]}
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        onRowClick={(row) => navigate(`/gym/membership/${row.membershipId}`)}
        emptyTitle="No lifecycle history matches"
        emptyDescription="Adjust filters to view historical membership events."
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: events.length,
          pageSize,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

export default MembershipHistoryPage;
