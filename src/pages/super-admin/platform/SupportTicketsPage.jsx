import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import {
  GENERATED_ASSETS,
  SUPPORT_AGENTS,
  TICKET_CATEGORIES,
} from '../../../constants/platformData';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { formatDate } from '../../../utils/formatters';

export function SupportTicketsPage() {
  const { tickets, updateTicket } = usePlatformManagement();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(SUPPORT_AGENTS[0]);
  const [illustrationError, setIllustrationError] = useState(false);

  const kpis = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
      highPriority: tickets.filter((t) => t.priority === 'high').length,
    }),
    [tickets]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.gymName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.assignedAgent.toLowerCase().includes(q);
      return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [tickets, search, categoryFilter, priorityFilter, statusFilter]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  const columns = [
    {
      key: 'id',
      header: 'Ticket ID',
      numeric: true,
      render: (row) => (
        <Link
          to={`/super-admin/support/${row.id}`}
          className="font-mono text-xs font-semibold text-navy-900 hover:underline"
        >
          {row.id}
        </Link>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <Link
          to={`/super-admin/support/${row.id}`}
          className="text-sm text-slate-800 hover:text-navy-900 font-medium line-clamp-1 max-w-xs"
        >
          {row.subject}
        </Link>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <StatusBadge status={row.priority} />,
    },
    { key: 'assignedAgent', header: 'Assigned Agent' },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.createdAt)}
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
        <div className="inline-flex items-center justify-end gap-1.5">
          <Link
            to={`/super-admin/support/${row.id}`}
            title="View Ticket Details"
            aria-label={`Open ticket ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setAssigningTicket(row);
              setSelectedAgent(row.assignedAgent || SUPPORT_AGENTS[0]);
            }}
            title="Assign Ticket"
            aria-label={`Assign ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {row.status !== 'resolved' && row.status !== 'closed' && (
            <button
              type="button"
              onClick={() => {
                updateTicket(row.id, { status: 'resolved' }, 'Resolved Ticket');
                toast.success(`Resolved ticket ${row.id}`);
              }}
              title="Resolve Ticket"
              aria-label={`Resolve ${row.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Manage tenant escalations, billing inquiries, and SLA resolution across gyms."
      />

      {/* Support KPIs + Illustration Banner */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <section className="xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Tickets"
            value={String(kpis.total)}
            change="All"
            trend="neutral"
            previousLabel="active queue"
            icon="LifeBuoy"
          />
          <AdminStatCard
            label="Open Tickets"
            value={String(kpis.open)}
            change="New"
            trend="neutral"
            previousLabel="awaiting triage"
            icon="AlertTriangle"
          />
          <AdminStatCard
            label="In Progress"
            value={String(kpis.inProgress)}
            change="Active"
            trend="up"
            previousLabel="being investigated"
            icon="Clock"
          />
          <AdminStatCard
            label="Resolved"
            value={String(kpis.resolved)}
            change="18m SLA"
            trend="up"
            previousLabel="avg first reply"
            icon="CheckCircle2"
          />
          <AdminStatCard
            label="High Priority"
            value={String(kpis.highPriority)}
            change="Urgent"
            trend="down"
            previousLabel="priority escalations"
            icon="Shield"
          />
        </section>

        <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs flex items-center justify-center p-3">
          {!illustrationError ? (
            <img
              src={GENERATED_ASSETS.SUPPORT_ILLUSTRATION}
              alt="GymPilot Support Desk workflow illustration"
              referrerPolicy="no-referrer"
              onError={() => setIllustrationError(true)}
              className="h-32 w-full object-cover rounded-lg"
            />
          ) : (
            <div className="h-32 w-full rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Support Operations Desk
            </div>
          )}
        </div>
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ticket ID, gym, subject, or agent..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            ...TICKET_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          containerClassName="sm:w-44"
        />
        <Select
          aria-label="Filter by priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
          containerClassName="sm:w-36"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
          containerClassName="sm:w-36"
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No support tickets found"
        emptyDescription="Clear your search or filters to inspect all support cases."
        emptyActionLabel="Reset filters"
        onEmptyAction={resetFilters}
      />

      <Modal
        isOpen={Boolean(assigningTicket)}
        onClose={() => setAssigningTicket(null)}
        title={`Assign Ticket · ${assigningTicket?.id || ''}`}
        description={assigningTicket?.subject}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssigningTicket(null)}>
              Cancel
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                if (!assigningTicket) return;
                updateTicket(
                  assigningTicket.id,
                  { assignedAgent: selectedAgent },
                  `Assigned Ticket to ${selectedAgent}`
                );
                toast.success(`Assigned ${assigningTicket.id} to ${selectedAgent}`);
                setAssigningTicket(null);
              }}
            >
              Assign Agent
            </Button>
          </>
        }
      >
        <Select
          label="Support Agent"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          options={SUPPORT_AGENTS.map((a) => ({ value: a, label: a }))}
        />
      </Modal>
    </div>
  );
}

export default SupportTicketsPage;
