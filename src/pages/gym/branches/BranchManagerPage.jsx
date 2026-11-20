import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Mail,
  Phone,
  Power,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { cn } from '../../../utils/cn';
import { formatDate } from '../../../utils/formatters';

export function BranchManagerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getBranchById,
    tenantBranches,
    tenantManagers,
    getManagerForBranch,
    assignManagerToBranch,
    updateManager,
    toggleManagerStatus,
  } = useBranchManagement();

  const branch = getBranchById(id);
  const primaryManager = useMemo(
    () => getManagerForBranch(branch),
    [branch, getManagerForBranch]
  );

  const assignModal = useDisclosure(false);
  const [editingManager, setEditingManager] = useState(null);

  const [assignForm, setAssignForm] = useState({
    mode: 'existing',
    managerId: tenantManagers[0]?.id || '',
    name: '',
    email: '',
    phone: '',
    joiningDate: '2026-11-19',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    joiningDate: '',
  });

  if (!branch) {
    return (
      <EmptyState
        icon={Building2}
        title="Branch not found"
        description="Unable to load branch manager controls for this location."
        actionLabel="Back to Branches"
        onAction={() => navigate('/gym/branches')}
      />
    );
  }

  const handleOpenEdit = (mgr) => {
    setEditingManager(mgr);
    setEditForm({
      name: mgr.name,
      email: mgr.email,
      phone: mgr.phone,
      joiningDate: mgr.joiningDate,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingManager || !editForm.name.trim()) return;
    updateManager(editingManager.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      joiningDate: editForm.joiningDate,
    });
    toast.success(`Updated manager profile for ${editForm.name.trim()}`);
    setEditingManager(null);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (assignForm.mode === 'new' && !assignForm.name.trim()) {
      toast.error('Please enter manager full name');
      return;
    }
    assignManagerToBranch(branch.id, assignForm);
    toast.success(`Updated primary manager for ${branch.name}`);
    assignModal.close();
  };

  const branchLookup = useMemo(() => {
    const map = {};
    for (const b of tenantBranches) map[b.id] = b.name;
    return map;
  }, [tenantBranches]);

  const columns = [
    {
      key: 'name',
      header: 'Manager',
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={row.avatar} name={row.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 truncate">{row.name}</p>
              {row.id === primaryManager?.id && (
                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Primary
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Mobile Number',
      numeric: true,
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.phone}</span>,
    },
    {
      key: 'assignedBranchId',
      header: 'Assigned Branch',
      render: (row) => branchLookup[row.assignedBranchId] || 'Unassigned',
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      numeric: true,
      render: (row) => formatDate(row.joiningDate),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.id !== primaryManager?.id && (
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                assignManagerToBranch(branch.id, { mode: 'existing', managerId: row.id });
                toast.success(`${row.name} assigned as primary manager for ${branch.name}`);
              }}
            >
              Assign to Branch
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={Edit}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
          <button
            type="button"
            onClick={() => {
              toggleManagerStatus(row.id);
              toast.success(
                `${row.name} ${row.status === 'active' ? 'deactivated' : 'activated'}`
              );
            }}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Power className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Branch Manager: ${branch.name}`}
        description={`${branch.code} · Assign or update the primary branch manager and review manager roster.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/gym/branches/${branch.id}`}>
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Branch
              </Button>
            </Link>
            <Button variant="emerald" size="sm" leftIcon={UserPlus} onClick={assignModal.open}>
              {primaryManager ? 'Change / Assign Manager' : 'Assign Manager'}
            </Button>
          </div>
        }
      />

      {/* Primary Manager Spotlight */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">
              Primary Branch Manager
            </h2>
          </div>
          {primaryManager && <StatusBadge status={primaryManager.status} />}
        </div>

        {primaryManager ? (
          <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <UserAvatar src={primaryManager.avatar} name={primaryManager.name} size="xl" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{primaryManager.name}</h3>
                <p className="text-xs font-medium text-emerald-700">
                  Primary Lead · {branch.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {primaryManager.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {primaryManager.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    Joined {formatDate(primaryManager.joiningDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Edit}
                onClick={() => handleOpenEdit(primaryManager)}
              >
                Edit Details
              </Button>
              <Button variant="primary" size="sm" onClick={assignModal.open}>
                Change Manager
              </Button>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <EmptyState
              title="No primary manager assigned"
              description="Assign an existing manager or create a new manager profile for this branch."
              actionLabel="Assign Manager"
              onAction={assignModal.open}
            />
          </div>
        )}
      </section>

      {/* Tenant Manager Directory */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            All Branch Managers ({tenantManagers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Reassign managers across your locations or manage account status
          </p>
        </div>
        <DataTable columns={columns} data={tenantManagers} />
      </section>

      {/* Assign / Change Manager Modal */}
      <Modal
        isOpen={assignModal.isOpen}
        onClose={assignModal.close}
        title={`Assign Manager to ${branch.name}`}
        description="Select an existing club manager or appoint a new primary branch manager."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setAssignForm((p) => ({ ...p, mode: 'existing' }))}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer',
                assignForm.mode === 'existing'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600'
              )}
            >
              Existing Manager
            </button>
            <button
              type="button"
              onClick={() => setAssignForm((p) => ({ ...p, mode: 'new' }))}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer',
                assignForm.mode === 'new'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600'
              )}
            >
              New Manager
            </button>
          </div>

          {assignForm.mode === 'existing' ? (
            <Select
              label="Select Manager"
              value={assignForm.managerId}
              onChange={(e) => setAssignForm((p) => ({ ...p, managerId: e.target.value }))}
              options={tenantManagers.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.email})`,
              }))}
            />
          ) : (
            <>
              <Input
                label="Full Name"
                required
                placeholder="e.g. Morgan Ellis"
                value={assignForm.name}
                onChange={(e) => setAssignForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="morgan@ironworksclub.com"
                value={assignForm.email}
                onChange={(e) => setAssignForm((p) => ({ ...p, email: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  required
                  placeholder="+1 (206) 555-0180"
                  value={assignForm.phone}
                  onChange={(e) => setAssignForm((p) => ({ ...p, phone: e.target.value }))}
                />
                <Input
                  label="Joining Date"
                  type="date"
                  value={assignForm.joiningDate}
                  onChange={(e) => setAssignForm((p) => ({ ...p, joiningDate: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={assignModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Manager Details Modal */}
      <Modal
        isOpen={Boolean(editingManager)}
        onClose={() => setEditingManager(null)}
        title="Edit Manager Details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={editForm.email}
            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              required
              value={editForm.phone}
              onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <Input
              label="Joining Date"
              type="date"
              value={editForm.joiningDate}
              onChange={(e) => setEditForm((p) => ({ ...p, joiningDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setEditingManager(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BranchManagerPage;
