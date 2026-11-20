import { useMemo, useState } from 'react';
import { History, Table2 } from 'lucide-react';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import DataTable from '../../../components/tables/DataTable';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { cn } from '../../../utils/cn';

export function AuditLogsPage() {
  const { auditLogs } = usePlatformManagement();

  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const userOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((l) => l.user))).sort(),
    [auditLogs]
  );

  const moduleOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((l) => l.module))).sort(),
    [auditLogs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const logDate = log.timestamp.slice(0, 10);
      const matchesUser = userFilter === 'all' || log.user === userFilter;
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
      const matchesActionType =
        actionTypeFilter === 'all' || log.actionType === actionTypeFilter;
      const matchesFrom = !fromDate || logDate >= fromDate;
      const matchesTo = !toDate || logDate <= toDate;
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q);
      return (
        matchesUser &&
        matchesModule &&
        matchesActionType &&
        matchesFrom &&
        matchesTo &&
        matchesSearch
      );
    });
  }, [auditLogs, search, userFilter, moduleFilter, actionTypeFilter, fromDate, toDate]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    userFilter !== 'all' ||
    moduleFilter !== 'all' ||
    actionTypeFilter !== 'all' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const resetFilters = () => {
    setSearch('');
    setUserFilter('all');
    setModuleFilter('all');
    setActionTypeFilter('all');
    setFromDate('');
    setToDate('');
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row) => <span className="font-semibold text-slate-900">{row.user}</span>,
    },
    { key: 'role', header: 'Role' },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <span className="font-medium text-navy-900">{row.action}</span>,
    },
    { key: 'module', header: 'Module' },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">
          {row.description}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address (Demo)',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.ipAddress}</span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
          {row.timestamp}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable security, financial, role, and platform configuration event trail."
        actions={
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Data Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                viewMode === 'timeline'
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Activity Timeline</span>
            </button>
          </div>
        }
      />

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search user, action, module, or description..."
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      >
        <Select
          aria-label="Filter by user"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Users' },
            ...userOptions.map((u) => ({ value: u, label: u })),
          ]}
          containerClassName="sm:w-40"
        />
        <Select
          aria-label="Filter by module"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Modules' },
            ...moduleOptions.map((m) => ({ value: m, label: m })),
          ]}
          containerClassName="sm:w-40"
        />
        <Select
          aria-label="Filter by action type"
          value={actionTypeFilter}
          onChange={(e) => setActionTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Actions' },
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
            { value: 'security', label: 'Security' },
          ]}
          containerClassName="sm:w-36"
        />
        <Input
          type="date"
          aria-label="From date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          containerClassName="sm:w-36"
        />
        <Input
          type="date"
          aria-label="To date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          containerClassName="sm:w-36"
        />
      </FilterToolbar>

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No audit events match your filters"
          emptyDescription="Reset your filters or date range to inspect all platform audit events."
          emptyActionLabel="Reset filters"
          onEmptyAction={resetFilters}
        />
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No audit events match your filters.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <li
                  key={log.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-900">{log.user}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-medium text-navy-900">{log.action}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-600">{log.module}</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.description}</p>
                    <p className="font-mono text-[11px] text-slate-400">
                      {log.id} · IP {log.ipAddress} · {log.timestamp}
                    </p>
                  </div>
                  <StatusBadge status={log.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default AuditLogsPage;
