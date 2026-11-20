import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Dumbbell,
  Eye,
  FileBarChart2,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  UserPlus,
  Wallet,
} from 'lucide-react';
import NavIcon from '../common/NavIcon';
import StatusBadge from '../common/StatusBadge';
import UserAvatar from '../common/UserAvatar';
import DataTable from '../tables/DataTable';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function GymQuickActionsBar({
  onAddMember,
  onCollectPayment,
  onRegisterAttendance,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500">
            Execute frequent front-desk and management tasks in one click
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={UserPlus} onClick={onAddMember}>
            Add New Member
          </Button>
          <Button variant="emerald" size="sm" leftIcon={Receipt} onClick={onCollectPayment}>
            Collect Payment
          </Button>
          <Button variant="outline" size="sm" leftIcon={CalendarCheck} onClick={onRegisterAttendance}>
            Register Attendance
          </Button>
          <Link to="/gym/membership">
            <Button variant="outline" size="sm" leftIcon={Plus}>
              Create Plan
            </Button>
          </Link>
          <Link to="/gym/trainers">
            <Button variant="outline" size="sm" leftIcon={Dumbbell}>
              Add Trainer
            </Button>
          </Link>
          <Link to="/gym/finance/expenses">
            <Button variant="outline" size="sm" leftIcon={Wallet}>
              Add Expense
            </Button>
          </Link>
          <Link to="/gym/reports">
            <Button variant="ghost" size="sm" leftIcon={FileBarChart2}>
              View Reports
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function UpcomingExpiriesSection({
  expiries,
  onViewMember,
  onRenewMembership,
  onSendReminder,
}) {
  const [windowDays, setWindowDays] = useState(30);

  const filtered = useMemo(
    () => expiries.filter((item) => item.remainingDays <= windowDays),
    [expiries, windowDays]
  );

  const filterTabs = [
    { days: 7, label: 'Expiring in 7 days' },
    { days: 15, label: 'Expiring in 15 days' },
    { days: 30, label: 'Expiring in 30 days' },
  ];

  const columns = [
    {
      key: 'memberName',
      header: 'Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={row.avatar} name={row.memberName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.memberName}</p>
            <p className="text-xs font-mono text-slate-500">{row.memberId}</p>
          </div>
        </div>
      ),
    },
    { key: 'plan', header: 'Membership Plan' },
    { key: 'branch', header: 'Branch' },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      numeric: true,
      render: (row) => formatDate(row.expiryDate),
    },
    {
      key: 'remainingDays',
      header: 'Remaining',
      render: (row) => {
        const urgent = row.remainingDays <= 7;
        return (
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums',
              urgent
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            )}
          >
            {row.remainingDays}d left
          </span>
        );
      },
    },
    {
      key: 'renewalStatus',
      header: 'Renewal Status',
      render: (row) => {
        if (row.renewalStatus === 'reminder_sent') {
          return <StatusBadge status="sent" label="Reminder Sent" />;
        }
        if (row.renewalStatus === 'auto_renew') {
          return <StatusBadge status="active" label="Auto-Renew" />;
        }
        if (row.renewalStatus === 'renewed') {
          return <StatusBadge status="confirmed" label="Renewed" />;
        }
        return <StatusBadge status="pending" label="Pending" />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onViewMember(row)}
            title="View Member"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">View</span>
          </button>
          <button
            type="button"
            onClick={() => onRenewMembership(row)}
            disabled={row.renewalStatus === 'renewed'}
            title="Renew Membership"
            className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Renew</span>
          </button>
          <button
            type="button"
            onClick={() => onSendReminder(row)}
            title="Send Reminder"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-navy-900 hover:bg-slate-50 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">Remind</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Membership Expiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritize renewal outreach and prevent member churn
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start overflow-x-auto max-w-full">
          {filterTabs.map((tab) => (
            <button
              key={tab.days}
              type="button"
              onClick={() => setWindowDays(tab.days)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                windowDays === tab.days
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No memberships expiring in this window"
        emptyDescription="Try switching to a wider expiry horizon to inspect upcoming renewals."
      />
    </section>
  );
}

export function TrainerOverviewSection({ trainers }) {
  const totalSessions = trainers.reduce((sum, t) => sum + t.sessionsToday, 0);
  const assignedMembers = trainers.reduce((sum, t) => sum + t.assignedMembers, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Trainer Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active coaching roster, client assignments, and daily sessions
          </p>
        </div>
        <Link to="/gym/trainers">
          <Button variant="outline" size="sm">
            View All Trainers
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">Total Trainers</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums font-display">
            {trainers.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">Active Trainers</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-700 tabular-nums font-display">
            {trainers.filter((t) => t.status === 'active').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">Assigned Members</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums font-display">
            {assignedMembers}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">Today&apos;s Sessions</p>
          <p className="mt-0.5 text-lg font-bold text-navy-900 tabular-nums font-display">
            {totalSessions}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar src={trainer.avatar} name={trainer.name} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {trainer.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {trainer.specialization}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {trainer.branch} · <span className="font-mono">{trainer.assignedMembers}</span> members
                </p>
              </div>
            </div>
            <StatusBadge status={trainer.status} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinancialOverviewSection({ financialOverview, transactions }) {
  const finCards = [
    { label: 'Total Collection', value: financialOverview.totalCollection, tone: 'text-slate-900' },
    { label: 'Cash Collection', value: financialOverview.cashCollection, tone: 'text-slate-800' },
    { label: 'UPI Collection', value: financialOverview.upiCollection, tone: 'text-emerald-700' },
    { label: 'Online Payments', value: financialOverview.onlinePayments, tone: 'text-navy-900' },
    { label: 'Pending Dues', value: financialOverview.pendingDues, tone: 'text-amber-700' },
    { label: 'Total Expenses', value: financialOverview.totalExpenses, tone: 'text-red-700' },
  ];

  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.id}</span>,
    },
    { key: 'memberName', header: 'Member Name' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      numeric: true,
      render: (row) => formatCurrency(row.amount),
    },
    { key: 'method', header: 'Payment Method' },
    {
      key: 'date',
      header: 'Date',
      numeric: true,
      render: (row) => formatDate(row.date),
    },
    { key: 'branch', header: 'Branch' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Financial Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fee collection mix by payment channel and recent member transactions
          </p>
        </div>
        <Link
          to="/gym/finance/transactions"
          className="text-xs font-medium text-navy-900 hover:text-emerald-700"
        >
          View All Transactions &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {finCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-3"
          >
            <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
            <p className={cn('mt-1 text-base sm:text-lg font-bold tabular-nums font-display', card.tone)}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        emptyTitle="No transactions for this branch"
        emptyDescription="Fee collections for the selected branch will appear here."
      />
    </section>
  );
}

export function GymRecentActivitiesSection({ activities }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Activities</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live branch activity feed across registrations, billing, and check-ins
          </p>
        </div>
        <Link
          to="/gym/notifications"
          className="text-xs font-medium text-navy-900 hover:text-emerald-700"
        >
          View Feed
        </Link>
      </div>

      <ol className="divide-y divide-slate-100">
        {activities.map((item) => (
          <li key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-navy-900 shrink-0 mt-0.5">
              <NavIcon name={item.icon} className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {item.person} · {item.branch}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
