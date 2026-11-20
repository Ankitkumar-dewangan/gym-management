import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  MoreHorizontal,
  PauseCircle,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { formatDate } from '../../../utils/formatters';
import {
  calculateExpiryDate,
  calculateRemainingDays,
  exportRowsToCsv,
  REFERENCE_TODAY,
} from '../../../utils/membershipCalculations';

export function ActiveMembershipsPage() {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const {
    tenantPlans,
    scopedMemberships,
    renewMembershipRecord,
    cancelMembership,
  } = useMembershipManagement();

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [expiryBefore, setExpiryBefore] = useState('');
  const [sortBy, setSortBy] = useState('expiry_asc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('Member requested cancellation');

  const activeRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = scopedMemberships
      .filter((m) => m.status === 'active' || m.status === 'frozen')
      .map((m) => ({
        ...m,
        remainingDays: calculateRemainingDays(m.expiryDate),
      }))
      .filter((m) => {
        if (q) {
          const match =
            m.memberName.toLowerCase().includes(q) ||
            m.memberId.toLowerCase().includes(q) ||
            m.planName.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (branchFilter !== 'all' && m.branchId !== branchFilter) return false;
        if (planFilter !== 'all' && m.planId !== planFilter) return false;
        if (expiryBefore && m.expiryDate > expiryBefore) return false;
        return true;
      });

    list.sort((a, b) => {
      if (sortBy === 'expiry_asc') return a.expiryDate.localeCompare(b.expiryDate);
      if (sortBy === 'start_desc') return b.startDate.localeCompare(a.startDate);
      if (sortBy === 'name_asc') return a.memberName.localeCompare(b.memberName);
      return 0;
    });

    return list;
  }, [scopedMemberships, search, branchFilter, planFilter, expiryBefore, sortBy]);

  const totalPages = Math.max(1, Math.ceil(activeRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = activeRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasFilters =
    Boolean(search.trim()) ||
    branchFilter !== 'all' ||
    planFilter !== 'all' ||
    Boolean(expiryBefore);

  const handleReset = () => {
    setSearch('');
    setBranchFilter('all');
    setPlanFilter('all');
    setExpiryBefore('');
    setPage(1);
  };

  const handleExport = () => {
    exportRowsToCsv(
      ['Membership ID', 'Member Name', 'Member ID', 'Plan', 'Branch', 'Start Date', 'Expiry Date', 'Remaining Days', 'Payment Status', 'Status'],
      activeRows.map((r) => [
        r.id,
        r.memberName,
        r.memberId,
        r.planName,
        r.branchName,
        r.startDate,
        r.expiryDate,
        r.remainingDays,
        r.paymentStatus,
        r.status,
      ]),
      'active_memberships.csv'
    );
    toast.success(`Exported ${activeRows.length} active memberships`);
  };

  const handleConfirmRenew = () => {
    if (!renewTarget) return;
    renewMembershipRecord(renewTarget.id, {
      planId: renewPlanId || renewTarget.planId,
      renewalDate: REFERENCE_TODAY,
    });
    toast.success(`Renewed membership for ${renewTarget.memberName}`);
    setRenewTarget(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelMembership(cancelTarget.id, cancelReason);
    toast.success(`Cancelled membership for ${cancelTarget.memberName}`);
    setCancelTarget(null);
  };

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
      header: 'Membership Plan',
      render: (row) => <span className="text-xs font-semibold text-slate-800">{row.planName}</span>,
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-xs text-slate-600">{row.branchName}</span>,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.startDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-700">{formatDate(row.expiryDate)}</span>,
    },
    {
      key: 'remainingDays',
      header: 'Remaining',
      numeric: true,
      render: (row) => (
        <span
          className={
            row.remainingDays <= 7
              ? 'text-xs font-semibold text-amber-700'
              : 'text-xs font-medium text-slate-700'
          }
        >
          {row.remainingDays <= 0 ? 'Today' : `${row.remainingDays}d`}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.paymentStatus} />,
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/gym/membership/${row.id}`)}
            aria-label={`View ${row.memberName}`}
            className="px-2"
          >
            <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
          <Dropdown
            align="right"
            widthClass="w-52"
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${row.memberName}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            items={[
              {
                key: 'details',
                label: 'View Details',
                icon: Eye,
                onClick: () => navigate(`/gym/membership/${row.id}`),
              },
              {
                key: 'renew',
                label: 'Renew',
                icon: RefreshCw,
                onClick: () => {
                  setRenewTarget(row);
                  setRenewPlanId(row.planId);
                },
              },
              {
                key: 'upgrade',
                label: 'Upgrade Plan',
                icon: ArrowUpRight,
                onClick: () => navigate(`/gym/membership/${row.id}/upgrade?mode=upgrade`),
              },
              {
                key: 'downgrade',
                label: 'Downgrade Plan',
                icon: ArrowDownRight,
                onClick: () => navigate(`/gym/membership/${row.id}/upgrade?mode=downgrade`),
              },
              {
                key: 'freeze',
                label: row.status === 'frozen' ? 'Resume Membership' : 'Freeze Membership',
                icon: PauseCircle,
                onClick: () => navigate(`/gym/membership/${row.id}/freeze`),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel Membership',
                icon: XCircle,
                danger: true,
                onClick: () => {
                  setCancelTarget(row);
                  setCancelReason('Member requested cancellation');
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const previewRenewPlan = tenantPlans.find((p) => p.id === renewPlanId);
  const previewRenewExpiry = previewRenewPlan
    ? calculateExpiryDate(REFERENCE_TODAY, {
        durationType: previewRenewPlan.durationType,
        durationDays: previewRenewPlan.durationDays,
      })
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Memberships"
        description="Monitor active and frozen member plans, remaining validity days, and lifecycle controls."
        actions={
          <>
            <Button variant="outline" leftIcon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              variant="emerald"
              leftIcon={Plus}
              onClick={() => navigate('/gym/membership/assign')}
            >
              Assign Membership
            </Button>
          </>
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search member, ID, or plan..."
        hasActiveFilters={hasFilters}
        onReset={handleReset}
        rightContent={
          <Select
            aria-label="Sort memberships"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            containerClassName="w-40"
            className="h-9 text-xs"
            options={[
              { value: 'expiry_asc', label: 'Expiring Soonest' },
              { value: 'start_desc', label: 'Newest Assigned' },
              { value: 'name_asc', label: 'Member Name (A–Z)' },
            ]}
          />
        }
      >
        <Select
          aria-label="Filter by branch"
          value={branchFilter}
          onChange={(e) => {
            setBranchFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-44"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'All Branches' },
            ...tenantBranches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <Select
          aria-label="Filter by plan"
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-44"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'All Plans' },
            ...tenantPlans.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <Input
          type="date"
          aria-label="Expiry before date"
          value={expiryBefore}
          onChange={(e) => {
            setExpiryBefore(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-40"
          className="h-9 text-xs"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={paginated}
        onRowClick={(row) => navigate(`/gym/membership/${row.id}`)}
        emptyTitle="No active memberships match filters"
        emptyDescription="Clear filters or assign a membership plan to a member."
        emptyActionLabel="Assign Membership"
        onEmptyAction={() => navigate('/gym/membership/assign')}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: activeRows.length,
          pageSize,
          onPageChange: setPage,
        }}
      />

      {/* Quick Renew Modal */}
      <Modal
        isOpen={Boolean(renewTarget)}
        onClose={() => setRenewTarget(null)}
        title="Renew Membership"
        description={
          renewTarget
            ? `${renewTarget.memberName} · Current expiry ${formatDate(renewTarget.expiryDate)}`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>Confirm Renewal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Plan to Renew"
            value={renewPlanId}
            onChange={(e) => setRenewPlanId(e.target.value)}
            options={tenantPlans.map((p) => ({
              value: p.id,
              label: `${p.name} — ₹${p.regularPrice} (${p.durationDays}d)`,
            }))}
          />
          {previewRenewExpiry && (
            <p className="text-xs text-slate-600">
              New Expiry Date: <span className="font-mono font-semibold text-emerald-700">{formatDate(previewRenewExpiry)}</span>
            </p>
          )}
        </div>
      </Modal>

      {/* Cancel Membership Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Membership"
        description={
          cancelTarget
            ? `Terminate ${cancelTarget.planName} for ${cancelTarget.memberName}?`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>Keep Plan</Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>Confirm Cancellation</Button>
          </>
        }
      >
        <Input
          label="Cancellation Reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default ActiveMembershipsPage;
