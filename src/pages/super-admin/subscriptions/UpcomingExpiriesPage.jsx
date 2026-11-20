import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, Eye, Mail, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const REFERENCE_DATE = new Date('2026-11-19T00:00:00Z');

function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
}

const WINDOW_TABS = [
  { id: 'all', label: 'All (30d)', maxDays: 30 },
  { id: '7', label: 'Within 7 Days', maxDays: 7 },
  { id: '15', label: 'Within 15 Days', maxDays: 15 },
  { id: '30', label: 'Within 30 Days', maxDays: 30 },
];

export function UpcomingExpiriesPage() {
  const { subscriptions, sendRenewalReminder, renewSubscription } = useSubscriptions();
  const [windowTab, setWindowTab] = useState('all');
  const [search, setSearch] = useState('');

  const upcomingItems = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active' || sub.status === 'trial')
      .map((sub) => ({
        ...sub,
        daysRemaining: getDaysRemaining(sub.expiryDate),
      }))
      .filter((sub) => sub.daysRemaining !== null && sub.daysRemaining >= 0 && sub.daysRemaining <= 30)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [subscriptions]);

  const counts = useMemo(
    () => ({
      all: upcomingItems.length,
      7: upcomingItems.filter((s) => s.daysRemaining <= 7).length,
      15: upcomingItems.filter((s) => s.daysRemaining <= 15).length,
      30: upcomingItems.filter((s) => s.daysRemaining <= 30).length,
    }),
    [upcomingItems]
  );

  const filtered = useMemo(() => {
    const activeTab = WINDOW_TABS.find((t) => t.id === windowTab) || WINDOW_TABS[0];
    const q = search.trim().toLowerCase();
    return upcomingItems.filter((sub) => {
      const withinWindow = sub.daysRemaining <= activeTab.maxDays;
      const matchesSearch =
        !q ||
        sub.gymName.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q);
      return withinWindow && matchesSearch;
    });
  }, [upcomingItems, windowTab, search]);

  const getUrgencyBadge = (days) => {
    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 tabular-nums">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {days}d left
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 tabular-nums">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {days}d left
      </span>
    );
  };

  const columns = [
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => (
        <div>
          <Link
            to={`/super-admin/subscriptions/${row.id}`}
            className="font-semibold text-slate-800 hover:text-navy-800 hover:underline"
          >
            {row.gymName}
          </Link>
          <p className="font-mono text-[11px] text-slate-400">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Plan Name',
      render: (row) => <SubscriptionBadge plan={row.planName} />,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (row) => (
        <span className="tabular-nums text-slate-700 whitespace-nowrap">
          {formatDate(row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'daysRemaining',
      header: 'Remaining Days',
      render: (row) => getUrgencyBadge(row.daysRemaining),
    },
    {
      key: 'amount',
      header: 'Renewal Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'reminderSent',
      header: 'Reminder Status',
      render: (row) =>
        row.reminderSent ? (
          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            Reminder Sent
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
            Not Sent
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Mail}
            onClick={() => {
              sendRenewalReminder(row.id);
              toast.success(`Renewal reminder sent to ${row.gymName}`);
            }}
          >
            {row.reminderSent ? 'Resend' : 'Send Reminder'}
          </Button>
          <Link
            to={`/super-admin/subscriptions/${row.id}`}
            title="View Subscription"
            aria-label={`View ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Button
            variant="emerald"
            size="sm"
            leftIcon={RotateCw}
            onClick={() => {
              renewSubscription(row.id);
              toast.success(`Renewed subscription for ${row.gymName}`);
            }}
          >
            Renew
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Expiries"
        description="Track gym subscriptions and trials expiring within the next 7, 15, or 30 days."
      />

      {/* Window Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {WINDOW_TABS.map((tab) => {
          const isActive = windowTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWindowTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                isActive
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[11px] tabular-nums',
                  isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by gym name or plan..."
        hasActiveFilters={Boolean(search.trim()) || windowTab !== 'all'}
        onReset={() => {
          setSearch('');
          setWindowTab('all');
        }}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No upcoming expiries in this window"
        emptyDescription="No active subscriptions or trials are scheduled to expire within this timeframe."
        emptyActionLabel="View all 30 days"
        onEmptyAction={() => {
          setSearch('');
          setWindowTab('all');
        }}
      />
    </div>
  );
}

export default UpcomingExpiriesPage;
