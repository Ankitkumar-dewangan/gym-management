import { useState } from 'react';
import { Edit3, Eye, Plus, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { PERMISSION_GROUPS } from '../../../constants/platformData';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { cn } from '../../../utils/cn';

const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

function createEmptyPermissions() {
  return PERMISSION_GROUPS.reduce((acc, g) => {
    acc[g.key] = { view: false, create: false, edit: false, delete: false };
    return acc;
  }, {});
}

export function RolesPermissionsPage() {
  const { roles, createRole, updateRole, deleteRole } = usePlatformManagement();
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [viewingRole, setViewingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (groupKey, actionKey) => {
    if (!activeRole) return;
    const currentGroup = activeRole.permissions?.[groupKey] || {
      view: false,
      create: false,
      edit: false,
      delete: false,
    };
    const nextPermissions = {
      ...activeRole.permissions,
      [groupKey]: {
        ...currentGroup,
        [actionKey]: !currentGroup[actionKey],
      },
    };
    updateRole(activeRole.id, { permissions: nextPermissions });
    toast.success(`Updated ${activeRole.name} permissions`);
  };

  const handleToggleRowAll = (groupKey) => {
    if (!activeRole) return;
    const current = activeRole.permissions?.[groupKey] || {};
    const allChecked = ACTIONS.every((a) => Boolean(current[a.key]));
    const nextPermissions = {
      ...activeRole.permissions,
      [groupKey]: {
        view: !allChecked,
        create: !allChecked,
        edit: !allChecked,
        delete: !allChecked,
      },
    };
    updateRole(activeRole.id, { permissions: nextPermissions });
    toast.success(`Updated ${groupKey.replace('_', ' ')} row for ${activeRole.name}`);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '' });
    setRoleModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, description: role.description });
    setRoleModalOpen(true);
  };

  const handleSubmitRole = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (editingRole) {
      updateRole(editingRole.id, {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
      });
      toast.success(`Updated role "${roleForm.name.trim()}"`);
    } else {
      const created = createRole({
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || 'Custom platform role',
        permissions: createEmptyPermissions(),
      });
      setSelectedRoleId(created.id);
      toast.success(`Created role "${created.name}"`);
    }
    setRoleModalOpen(false);
  };

  const countEnabledPermissions = (role) => {
    if (!role?.permissions) return 0;
    return Object.values(role.permissions).reduce(
      (sum, row) => sum + ACTIONS.filter((a) => row[a.key]).length,
      0
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Configure role definitions and granular view, create, edit, and delete permissions across all SaaS modules."
        actions={
          <Button variant="emerald" leftIcon={Plus} onClick={openCreateModal}>
            Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Directory */}
        <aside className="lg:col-span-4 space-y-2.5">
          {roles.map((role) => {
            const isActive = role.id === activeRole?.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRoleId(role.id);
                  }
                }}
                className={cn(
                  'rounded-xl border p-4 transition-colors cursor-pointer',
                  isActive
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Shield
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-emerald-300' : 'text-navy-900'
                        )}
                        aria-hidden="true"
                      />
                      <h2 className="text-sm font-semibold truncate">{role.name}</h2>
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-xs line-clamp-2',
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      )}
                    >
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-white/10">
                  <span
                    className={cn(
                      'text-[11px] tabular-nums',
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {role.userCount.toLocaleString()} users · {countEnabledPermissions(role)} permissions
                  </span>

                  <div
                    className="inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setViewingRole(role)}
                      aria-label={`View details for ${role.name}`}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                        isActive
                          ? 'text-slate-200 hover:bg-white/10'
                          : 'text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(role)}
                      aria-label={`Edit ${role.name}`}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                        isActive
                          ? 'text-slate-200 hover:bg-white/10'
                          : 'text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => setRoleToDelete(role)}
                        aria-label={`Delete ${role.name}`}
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                          isActive
                            ? 'text-red-300 hover:bg-white/10'
                            : 'text-red-600 hover:bg-red-50'
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Permission Matrix */}
        <section className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="border-b border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Permission Matrix · {activeRole?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign granular view, create, edit, and delete access by module
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {countEnabledPermissions(activeRole)} / {PERMISSION_GROUPS.length * 4} enabled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="px-5 py-3">Permission Module</th>
                  {ACTIONS.map((action) => (
                    <th key={action.key} className="px-4 py-3 text-center">
                      {action.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Row</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_GROUPS.map((group) => {
                  const rowPerms = activeRole?.permissions?.[group.key] || {};
                  const allRowChecked = ACTIONS.every((a) => Boolean(rowPerms[a.key]));

                  return (
                    <tr key={group.key} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {group.label}
                      </td>
                      {ACTIONS.map((action) => {
                        const checked = Boolean(rowPerms[action.key]);
                        return (
                          <td key={action.key} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleTogglePermission(group.key, action.key)
                              }
                              aria-label={`${activeRole?.name} ${group.label} ${action.label}`}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-navy-700 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRowAll(group.key)}
                          className="text-xs font-medium text-navy-900 hover:text-emerald-700 cursor-pointer"
                        >
                          {allRowChecked ? 'Clear' : 'All'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Create / Edit Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRole ? `Edit Role · ${editingRole.name}` : 'Create Custom Role'}
        description="Define the role name and summary, then configure its permissions in the matrix."
        size="sm"
      >
        <form onSubmit={handleSubmitRole} className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g. Regional Operations Lead"
            value={roleForm.name}
            onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={roleForm.description}
              onChange={(e) =>
                setRoleForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe what responsibilities this role holds..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              {editingRole ? 'Save Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Details Modal */}
      <Modal
        isOpen={Boolean(viewingRole)}
        onClose={() => setViewingRole(null)}
        title={`Role Details · ${viewingRole?.name || ''}`}
        description={viewingRole?.description}
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingRole(null)}>
            Close
          </Button>
        }
      >
        {viewingRole && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Accounts</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {viewingRole.userCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role Type</span>
              <span className="font-medium text-slate-800">
                {viewingRole.isSystem ? 'System Default' : 'Custom Role'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Enabled Permissions</span>
              <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                {countEnabledPermissions(viewingRole)} / {PERMISSION_GROUPS.length * 4}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => {
          if (!roleToDelete) return;
          deleteRole(roleToDelete.id);
          if (selectedRoleId === roleToDelete.id) {
            setSelectedRoleId(roles[0]?.id || '');
          }
          toast.success(`Deleted role "${roleToDelete.name}"`);
          setRoleToDelete(null);
        }}
        title={`Delete role "${roleToDelete?.name}"?`}
        description="Custom role permissions will be removed immediately."
        confirmLabel="Delete Role"
        variant="danger"
      />
    </div>
  );
}

export default RolesPermissionsPage;
