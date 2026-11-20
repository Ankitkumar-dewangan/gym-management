import { useMemo, useState } from 'react';
import { ArrowUpDown, Check, Eye, X } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import DataTable from '../tables/DataTable';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import SearchBar from '../ui/SearchBar';
import Select from '../ui/Select';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'trial', label: 'Trial' },
  { value: 'rejected', label: 'Rejected' },
];

const PLAN_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Pro', label: 'Pro' },
  { value: 'Enterprise', label: 'Enterprise' },
];

export function RecentGymsTable({ gyms = [], onApprove, onReject }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortField, setSortField] = useState('registeredAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGym, setSelectedGym] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const pageSize = 5;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = gyms.filter((gym) => {
      const matchesStatus = statusFilter === 'all' || gym.status === statusFilter;
      const matchesPlan = planFilter === 'all' || gym.plan === planFilter;
      const matchesSearch =
        !q ||
        gym.name.toLowerCase().includes(q) ||
        gym.ownerName.toLowerCase().includes(q) ||
        gym.email.toLowerCase().includes(q) ||
        gym.city.toLowerCase().includes(q);
      return matchesStatus && matchesPlan && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [gyms, search, statusFilter, planFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageData = filteredAndSorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const renderSortHeader = (label, field) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
    >
      <span>{label}</span>
      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  const columns = [
    {
      key: 'logo',
      header: 'Gym Logo',
      render: (row) => (
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: row.logoColor || '#14213D' }}
        >
          {row.initials}
        </span>
      ),
    },
    {
      key: 'name',
      header: renderSortHeader('Gym Name', 'name'),
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-500">
            {row.city} · {row.branches} {row.branches === 1 ? 'branch' : 'branches'}
          </p>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner Name',
      render: (row) => <span className="text-slate-700">{row.ownerName}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-slate-600 text-xs">{row.email}</span>,
    },
    {
      key: 'registeredAt',
      header: renderSortHeader('Registration Date', 'registeredAt'),
      render: (row) => (
        <span className="text-slate-600 tabular-nums whitespace-nowrap">
          {formatDate(row.registeredAt)}
        </span>
      ),
    },
    {
      key: 'plan',
      header: renderSortHeader('Subscription Plan', 'plan'),
      render: (row) => (
        <span className="font-medium text-slate-700">{row.plan}</span>
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
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedGym(row)}
            aria-label={`View details for ${row.name}`}
            title="View details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => setConfirmAction({ type: 'approve', gym: row })}
                aria-label={`Approve ${row.name}`}
                title="Approve gym"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction({ type: 'reject', gym: row })}
                aria-label={`Reject ${row.name}`}
                title="Reject gym"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      onApprove?.(confirmAction.gym);
    } else {
      onReject?.(confirmAction.gym);
    }
    setConfirmAction(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Recent Gym Registrations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review onboarding requests, subscription tiers, and account approvals
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search gym, owner, email..."
            className="sm:w-64"
          />
          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={STATUS_OPTIONS}
            containerClassName="sm:w-36"
          />
          <Select
            aria-label="Filter by plan"
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={PLAN_OPTIONS}
            containerClassName="sm:w-36"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pageData}
        emptyTitle="No gym registrations match your filters"
        emptyDescription="Clear search or filter selections to view all registered gym organizations."
        emptyActionLabel="Reset filters"
        onEmptyAction={() => {
          setSearch('');
          setStatusFilter('all');
          setPlanFilter('all');
        }}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalItems: filteredAndSorted.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />

      {/* View Gym Details Modal */}
      <Modal
        isOpen={Boolean(selectedGym)}
        onClose={() => setSelectedGym(null)}
        title={selectedGym?.name || 'Gym Details'}
        description={
          selectedGym ? `${selectedGym.id} · Registered ${formatDate(selectedGym.registeredAt)}` : ''
        }
        footer={
          selectedGym?.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = selectedGym;
                  setSelectedGym(null);
                  setConfirmAction({ type: 'reject', gym: target });
                }}
              >
                Reject
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  const target = selectedGym;
                  setSelectedGym(null);
                  onApprove?.(target);
                }}
              >
                Approve Gym
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelectedGym(null)}>
              Close
            </Button>
          )
        }
      >
        {selectedGym && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Owner Name</dt>
              <dd className="mt-1 font-medium text-slate-900">{selectedGym.ownerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Contact Email</dt>
              <dd className="mt-1 font-medium text-slate-900">{selectedGym.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Primary City</dt>
              <dd className="mt-1 font-medium text-slate-900">{selectedGym.city}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Subscription Plan</dt>
              <dd className="mt-1 font-medium text-slate-900">{selectedGym.plan}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Branches Requested</dt>
              <dd className="mt-1 font-mono font-medium text-slate-900 tabular-nums">
                {selectedGym.branches}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Current Status</dt>
              <dd className="mt-1">
                <StatusBadge status={selectedGym.status} />
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* Approve / Reject Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        title={
          confirmAction?.type === 'approve'
            ? `Approve ${confirmAction?.gym?.name}?`
            : `Reject ${confirmAction?.gym?.name}?`
        }
        description={
          confirmAction?.type === 'approve'
            ? 'This will activate the gym workspace and enable branch operations for the owner.'
            : 'This will mark the registration request as rejected in the preview roster.'
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        variant={confirmAction?.type === 'approve' ? 'emerald' : 'danger'}
      />
    </section>
  );
}

export default RecentGymsTable;
