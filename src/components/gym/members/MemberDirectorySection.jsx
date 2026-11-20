import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Download,
  Edit3,
  Eye,
  LayoutGrid,
  MoreHorizontal,
  RefreshCw,
  ShieldAlert,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../common/ConfirmDialog';
import EmptyState from '../../common/EmptyState';
import FilterToolbar from '../../common/FilterToolbar';
import StatusBadge from '../../common/StatusBadge';
import UserAvatar from '../../common/UserAvatar';
import DataTable from '../../tables/DataTable';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import Pagination from '../../ui/Pagination';
import Select from '../../ui/Select';
import { MEMBERSHIP_PLAN_CATALOG } from '../../../constants/memberManagementData';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function MemberDirectorySection({
  members = [],
  presetStatus = null,
  statusTab = 'all',
  onStatusTabChange,
}) {
  const navigate = useNavigate();
  const { tenantBranches } = useBranchManagement();
  const { renewMembership, updateMemberStatus, deleteMember } = useMemberManagement();

  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(presetStatus || 'all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [joiningDateFilter, setJoiningDateFilter] = useState('');
  const [expiryDateFilter, setExpiryDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('joining_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Action Modals
  const [renewModalMember, setRenewModalMember] = useState(null);
  const [renewPlan, setRenewPlan] = useState(MEMBERSHIP_PLAN_CATALOG[0].name);
  const [renewMethod, setRenewMethod] = useState('Online Card');

  const [statusModalMember, setStatusModalMember] = useState(null);
  const [nextStatus, setNextStatus] = useState('active');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const effectiveStatus = presetStatus || (statusTab !== 'all' ? statusTab : statusFilter);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = members.filter((m) => {
      if (q) {
        const hit =
          m.fullName.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.mobile.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (branchFilter !== 'all' && m.branchId !== branchFilter) return false;
      if (planFilter !== 'all' && m.plan !== planFilter) return false;
      if (effectiveStatus !== 'all' && m.status !== effectiveStatus) return false;
      if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
      if (paymentFilter !== 'all' && m.paymentStatus !== paymentFilter) return false;
      if (joiningDateFilter && m.joiningDate < joiningDateFilter) return false;
      if (expiryDateFilter && m.expiryDate > expiryDateFilter) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'joining_desc') return (b.joiningDate || '').localeCompare(a.joiningDate || '');
      if (sortBy === 'expiry_asc') return (a.expiryDate || '').localeCompare(b.expiryDate || '');
      if (sortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'fee_desc') return (b.monthlyFee || 0) - (a.monthlyFee || 0);
      return 0;
    });

    return list;
  }, [
    members,
    search,
    branchFilter,
    planFilter,
    effectiveStatus,
    genderFilter,
    paymentFilter,
    joiningDateFilter,
    expiryDateFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const activeChips = useMemo(() => {
    const chips = [];
    if (search.trim()) {
      chips.push({ key: 'search', label: `Search: "${search.trim()}"`, clear: () => setSearch('') });
    }
    if (branchFilter !== 'all') {
      const b = tenantBranches.find((item) => item.id === branchFilter);
      chips.push({
        key: 'branch',
        label: `Branch: ${b?.name || branchFilter}`,
        clear: () => setBranchFilter('all'),
      });
    }
    if (planFilter !== 'all') {
      chips.push({ key: 'plan', label: `Plan: ${planFilter}`, clear: () => setPlanFilter('all') });
    }
    if (!presetStatus && effectiveStatus !== 'all') {
      chips.push({
        key: 'status',
        label: `Status: ${effectiveStatus.replace('_', ' ')}`,
        clear: () => {
          setStatusFilter('all');
          onStatusTabChange?.('all');
        },
      });
    }
    if (genderFilter !== 'all') {
      chips.push({
        key: 'gender',
        label: `Gender: ${genderFilter}`,
        clear: () => setGenderFilter('all'),
      });
    }
    if (paymentFilter !== 'all') {
      chips.push({
        key: 'payment',
        label: `Payment: ${paymentFilter}`,
        clear: () => setPaymentFilter('all'),
      });
    }
    if (joiningDateFilter) {
      chips.push({
        key: 'joined',
        label: `Joined ≥ ${joiningDateFilter}`,
        clear: () => setJoiningDateFilter(''),
      });
    }
    if (expiryDateFilter) {
      chips.push({
        key: 'expiry',
        label: `Expiry ≤ ${expiryDateFilter}`,
        clear: () => setExpiryDateFilter(''),
      });
    }
    return chips;
  }, [
    search,
    branchFilter,
    tenantBranches,
    planFilter,
    presetStatus,
    effectiveStatus,
    genderFilter,
    paymentFilter,
    joiningDateFilter,
    expiryDateFilter,
    onStatusTabChange,
  ]);

  const resetAllFilters = () => {
    setSearch('');
    setBranchFilter('all');
    setPlanFilter('all');
    setStatusFilter(presetStatus || 'all');
    setGenderFilter('all');
    setPaymentFilter('all');
    setJoiningDateFilter('');
    setExpiryDateFilter('');
    onStatusTabChange?.('all');
    setPage(1);
  };

  const handleExportCsv = () => {
    if (!filtered.length) {
      toast.error('No member records to export');
      return;
    }
    const headers = [
      'Member ID',
      'Full Name',
      'Mobile',
      'Email',
      'Branch',
      'Plan',
      'Joining Date',
      'Expiry Date',
      'Status',
      'Payment Status',
    ];
    const rows = filtered.map((m) => [
      m.id,
      m.fullName,
      m.mobile,
      m.email,
      m.branchName,
      m.plan,
      m.joiningDate,
      m.expiryDate,
      m.status,
      m.paymentStatus,
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `members_export_${presetStatus || 'directory'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} member records`);
  };

  const openRenewModal = (member) => {
    setRenewModalMember(member);
    setRenewPlan(member.plan || MEMBERSHIP_PLAN_CATALOG[0].name);
    setRenewMethod('Online Card');
  };

  const handleConfirmRenew = () => {
    if (!renewModalMember) return;
    const planMeta =
      MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === renewPlan) || MEMBERSHIP_PLAN_CATALOG[0];
    renewMembership(renewModalMember.id, {
      planName: planMeta.name,
      durationMonths: planMeta.durationMonths,
      amount: planMeta.price,
      method: renewMethod,
    });
    toast.success(`${renewModalMember.fullName} renewed on ${planMeta.name}`);
    setRenewModalMember(null);
  };

  const openStatusModal = (member) => {
    setStatusModalMember(member);
    setNextStatus(member.status === 'active' ? 'on_hold' : 'active');
  };

  const handleConfirmStatus = () => {
    if (!statusModalMember) return;
    updateMemberStatus(statusModalMember.id, nextStatus);
    toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
    setStatusModalMember(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMember(deleteTarget.id);
    toast.success(`${deleteTarget.fullName} removed from directory`);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <UserAvatar src={row.avatar} name={row.fullName} size="md" />
          <div className="min-w-0">
            <Link
              to={`/gym/members/${row.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
            >
              {row.fullName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <div className="min-w-[155px]">
          <p className="text-xs font-medium text-slate-800 font-mono tabular-nums">{row.mobile}</p>
          <p className="text-xs text-slate-500 truncate max-w-[175px]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-xs font-medium text-slate-700">{row.branchName}</span>,
    },
    {
      key: 'plan',
      header: 'Membership Plan',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.plan}</p>
          <p className="text-[11px] text-slate-500 font-mono tabular-nums">
            {formatCurrency(row.monthlyFee)}/mo
          </p>
        </div>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joined',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-600">{formatDate(row.joiningDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      numeric: true,
      render: (row) => <span className="text-xs text-slate-700">{formatDate(row.expiryDate)}</span>,
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
            onClick={() => navigate(`/gym/members/${row.id}`)}
            aria-label={`View ${row.fullName}`}
            className="px-2"
          >
            <Eye className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/gym/members/${row.id}/edit`)}
            aria-label={`Edit ${row.fullName}`}
            className="px-2"
          >
            <Edit3 className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </Button>
          <Dropdown
            align="right"
            widthClass="w-52"
            trigger={
              <button
                type="button"
                aria-label={`More actions for ${row.fullName}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            }
            items={[
              {
                key: 'view',
                label: 'View Profile',
                icon: Eye,
                onClick: () => navigate(`/gym/members/${row.id}`),
              },
              {
                key: 'edit',
                label: 'Edit Member',
                icon: Edit3,
                onClick: () => navigate(`/gym/members/${row.id}/edit`),
              },
              {
                key: 'renew',
                label: 'Renew Membership',
                icon: RefreshCw,
                onClick: () => openRenewModal(row),
              },
              {
                key: 'payments',
                label: 'View Payments',
                icon: CreditCard,
                onClick: () => navigate(`/gym/members/${row.id}?tab=payments`),
              },
              {
                key: 'status',
                label: row.status === 'inactive' ? 'Restore Member' : 'Change Status',
                icon: ShieldAlert,
                onClick: () => openStatusModal(row),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete Member',
                icon: Trash2,
                danger: true,
                onClick: () => setDeleteTarget(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search name, ID, phone, email..."
        hasActiveFilters={activeChips.length > 0}
        onReset={resetAllFilters}
        rightContent={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              aria-label="Sort members"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              containerClassName="w-40"
              className="h-9 text-xs"
              options={[
                { value: 'joining_desc', label: 'Newest Joined' },
                { value: 'expiry_asc', label: 'Expiring Soonest' },
                { value: 'name_asc', label: 'Name (A–Z)' },
                { value: 'fee_desc', label: 'Highest Plan Fee' },
              ]}
            />

            <Select
              aria-label="Rows per page"
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              containerClassName="w-28"
              className="h-9 text-xs"
              options={[
                { value: '5', label: '5 / page' },
                { value: '8', label: '8 / page' },
                { value: '12', label: '12 / page' },
              ]}
            />

            <Button
              variant="outline"
              size="sm"
              leftIcon={Download}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>

            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors',
                  viewMode === 'table'
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-navy-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                Cards
              </button>
            </div>
          </div>
        }
      >
        <Select
          aria-label="Filter by branch"
          value={branchFilter}
          onChange={(e) => {
            setBranchFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-40"
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
          containerClassName="w-full sm:w-40"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'All Plans' },
            ...MEMBERSHIP_PLAN_CATALOG.map((p) => ({ value: p.name, label: p.name })),
          ]}
        />
        {!presetStatus && (
          <Select
            aria-label="Filter by status"
            value={effectiveStatus}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              onStatusTabChange?.(e.target.value);
              setPage(1);
            }}
            containerClassName="w-full sm:w-36"
            className="h-9 text-xs"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'expired', label: 'Expired' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'on_hold', label: 'On Hold' },
            ]}
          />
        )}
        <Select
          aria-label="Filter by gender"
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-32"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'All Genders' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
          ]}
        />
        <Select
          aria-label="Filter by payment status"
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-36"
          className="h-9 text-xs"
          options={[
            { value: 'all', label: 'Payment: Any' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
          ]}
        />
        <Input
          type="date"
          aria-label="Filter joined from date"
          title="Joined from date"
          value={joiningDateFilter}
          onChange={(e) => {
            setJoiningDateFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-36"
          className="h-9 text-xs"
        />
        <Input
          type="date"
          aria-label="Filter expiry before date"
          title="Expiry before date"
          value={expiryDateFilter}
          onChange={(e) => {
            setExpiryDateFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-36"
          className="h-9 text-xs"
        />
      </FilterToolbar>

      {/* Removable Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active filters:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3 text-slate-400" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={paginated}
          onRowClick={(row) => navigate(`/gym/members/${row.id}`)}
          emptyTitle="No matching members"
          emptyDescription="Adjust your search query or filter criteria, or register a new member."
          emptyActionLabel="Add New Member"
          onEmptyAction={() => navigate('/gym/members/add')}
          pagination={{
            currentPage: safePage,
            totalPages,
            totalItems: filtered.length,
            pageSize,
            onPageChange: setPage,
          }}
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          title="No matching members"
          description="Adjust your search query or filter criteria, or register a new member."
          actionLabel="Add New Member"
          onAction={() => navigate('/gym/members/add')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {paginated.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar src={member.avatar} name={member.fullName} size="lg" />
                      <div className="min-w-0">
                        <Link
                          to={`/gym/members/${member.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
                        >
                          {member.fullName}
                        </Link>
                        <p className="text-xs font-mono text-slate-500">{member.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                    <p className="truncate font-medium text-slate-800">{member.branchName}</p>
                    <p className="truncate">{member.plan} · {formatCurrency(member.monthlyFee)}/mo</p>
                    <p className="font-mono text-slate-500 tabular-nums">{member.mobile}</p>
                    <p className="text-slate-500">
                      Expires <span className="font-mono text-slate-700">{formatDate(member.expiryDate)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/gym/members/${member.id}`)}
                  >
                    View Profile
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/gym/members/${member.id}/edit`)}
                      className="px-2"
                    >
                      <Edit3 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRenewModal(member)}
                      className="px-2"
                    >
                      <RefreshCw className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 pb-4">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Renew Membership Modal */}
      <Modal
        isOpen={Boolean(renewModalMember)}
        onClose={() => setRenewModalMember(null)}
        title="Renew Membership"
        description={
          renewModalMember
            ? `Extend active cycle for ${renewModalMember.fullName} (${renewModalMember.id})`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewModalMember(null)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmRenew}>
              Confirm Renewal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Membership Plan"
            value={renewPlan}
            onChange={(e) => setRenewPlan(e.target.value)}
            options={MEMBERSHIP_PLAN_CATALOG.map((p) => ({
              value: p.name,
              label: `${p.name} — ₹${p.price} (${p.durationMonths} months)`,
            }))}
          />
          <Select
            label="Payment Method"
            value={renewMethod}
            onChange={(e) => setRenewMethod(e.target.value)}
            options={[
              { value: 'Online Card', label: 'Online Card' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
            ]}
          />
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={Boolean(statusModalMember)}
        onClose={() => setStatusModalMember(null)}
        title="Update Member Status"
        description={
          statusModalMember
            ? `Adjust membership status for ${statusModalMember.fullName}`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setStatusModalMember(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmStatus}>
              Update Status
            </Button>
          </>
        }
      >
        <Select
          label="New Status"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'on_hold', label: 'On Hold (Freeze)' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Member Record"
        description={
          deleteTarget
            ? `Permanently remove ${deleteTarget.fullName} (${deleteTarget.id}) from this branch directory?`
            : ''
        }
        confirmLabel="Delete Member"
      />
    </div>
  );
}

export default MemberDirectorySection;
