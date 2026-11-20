import { useMemo, useState } from 'react';
import { Bell, CalendarClock, Check, Edit3, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_TYPES,
} from '../../../constants/platformData';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { cn } from '../../../utils/cn';

const EMPTY_FORM = {
  title: '',
  type: NOTIFICATION_TYPES[0],
  audience: 'All Gym Owners',
  channels: ['In-App', 'Email'],
  isScheduled: false,
  scheduledFor: '2026-11-25 09:00',
  message: '',
};

export function NotificationsManagementPage() {
  const {
    notifications,
    createNotification,
    updateNotification,
    toggleNotificationRead,
  } = usePlatformManagement();

  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesType = typeFilter === 'all' || n.type === typeFilter;
      const matchesRead =
        readFilter === 'all' ||
        (readFilter === 'unread' && !n.read) ||
        (readFilter === 'read' && n.read);
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.audience.toLowerCase().includes(q);
      return matchesType && matchesRead && matchesSearch;
    });
  }, [notifications, typeFilter, readFilter, search]);

  const openCreateModal = (template = null) => {
    setEditingItem(null);
    if (template) {
      setForm({
        title: template.name,
        type: template.type,
        audience: 'All Gym Owners',
        channels: Array.isArray(template.channels)
          ? template.channels
          : template.channels
            ? [template.channels]
            : ['In-App', 'Email'],
        isScheduled: false,
        scheduledFor: '2026-11-25 09:00',
        message: template.body,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      type: item.type,
      audience: item.audience,
      channels: item.channels || ['In-App'],
      isScheduled: item.status === 'scheduled',
      scheduledFor: item.scheduledFor,
      message: item.message,
    });
    setModalOpen(true);
  };

  const toggleChannel = (channel) => {
    setForm((prev) => {
      const exists = prev.channels.includes(channel);
      return {
        ...prev,
        channels: exists
          ? prev.channels.filter((c) => c !== channel)
          : [...prev.channels, channel],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Notification title and message are required');
      return;
    }
    if (editingItem) {
      updateNotification(editingItem.id, {
        title: form.title.trim(),
        type: form.type,
        audience: form.audience,
        channels: form.channels,
        scheduledFor: form.isScheduled ? form.scheduledFor : editingItem.scheduledFor,
        status: form.isScheduled ? 'scheduled' : 'sent',
        message: form.message.trim(),
      });
      toast.success(`Updated notification "${form.title.trim()}"`);
    } else {
      createNotification(form);
      toast.success(
        form.isScheduled
          ? `Scheduled notification "${form.title.trim()}"`
          : `Sent notification "${form.title.trim()}"`
      );
    }
    setModalOpen(false);
  };

  const columns = [
    {
      key: 'title',
      header: 'Notification',
      render: (row) => (
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <p className={cn('text-sm text-slate-900', !row.read ? 'font-semibold' : 'font-medium')}>
              {row.title}
            </p>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.message}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type' },
    {
      key: 'channels',
      header: 'Channels',
      render: (row) => (
        <span className="text-xs text-slate-700">{(row.channels || []).join(' · ')}</span>
      ),
    },
    { key: 'audience', header: 'Audience' },
    {
      key: 'scheduledFor',
      header: 'Schedule / Sent',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
          {row.scheduledFor}
        </span>
      ),
    },
    {
      key: 'read',
      header: 'Read Status',
      render: (row) => <StatusBadge status={row.read ? 'read' : 'unread'} />,
    },
    {
      key: 'status',
      header: 'Delivery',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              toggleNotificationRead(row.id);
              toast.success(row.read ? 'Marked as unread' : 'Marked as read');
            }}
            title={row.read ? 'Mark Unread' : 'Mark Read'}
            aria-label={`Toggle read status for ${row.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            title="Edit Notification"
            aria-label={`Edit ${row.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Management"
        description="Broadcast system announcements, configure delivery channels, schedule alerts, and reuse templates."
        actions={
          <Button variant="emerald" leftIcon={Plus} onClick={() => openCreateModal()}>
            Create Notification
          </Button>
        }
      />

      {/* Notification Templates */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-800">Notification Templates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NOTIFICATION_TEMPLATES.map((tpl) => (
            <article
              key={tpl.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{tpl.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tpl.type} · {(Array.isArray(tpl.channels) ? tpl.channels : (tpl.channel ? [tpl.channel] : ['In-App'])).join(', ')}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{tpl.body}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreateModal(tpl)}
              >
                Use Template
              </Button>
            </article>
          ))}
        </div>
      </section>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notification title, message, or audience..."
        hasActiveFilters={Boolean(search.trim()) || typeFilter !== 'all' || readFilter !== 'all'}
        onReset={() => {
          setSearch('');
          setTypeFilter('all');
          setReadFilter('all');
        }}
      >
        <Select
          aria-label="Filter by notification type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            ...NOTIFICATION_TYPES.map((t) => ({ value: t, label: t })),
          ]}
          containerClassName="sm:w-52"
        />
        <Select
          aria-label="Filter by read status"
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Read States' },
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' },
          ]}
          containerClassName="sm:w-40"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No notifications found"
        emptyDescription="Create a new broadcast notification or reset filters to view history."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Notification' : 'Create Notification'}
        description="Configure alert category, delivery channels, audience, and scheduling."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Notification Title"
            placeholder="e.g. Scheduled Maintenance Notice"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Notification Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              options={NOTIFICATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Target Audience"
              value={form.audience}
              onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
              options={[
                { value: 'All Gym Owners', label: 'All Gym Owners' },
                { value: 'Expiring Within 7 Days', label: 'Expiring Within 7 Days' },
                { value: 'Free Trial Accounts', label: 'Free Trial Accounts' },
                { value: 'Super Admins', label: 'Super Admins' },
              ]}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Delivery Channels</p>
            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_CHANNELS.map((ch) => {
                const active = form.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                      active
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{ch}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                <CalendarClock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Schedule for later delivery
              </span>
              <input
                type="checkbox"
                checked={form.isScheduled}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isScheduled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-navy-700"
              />
            </label>
            {form.isScheduled && (
              <Input
                label="Scheduled Timestamp"
                value={form.scheduledFor}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledFor: e.target.value }))
                }
                placeholder="YYYY-MM-DD HH:MM"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Message Content <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write notification message..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              {editingItem
                ? 'Save Notification'
                : form.isScheduled
                ? 'Schedule Notification'
                : 'Send Notification'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default NotificationsManagementPage;
