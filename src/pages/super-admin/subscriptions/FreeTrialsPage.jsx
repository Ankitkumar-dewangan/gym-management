import { useMemo, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import FilterToolbar from '../../../components/common/FilterToolbar';
import PageHeader from '../../../components/common/PageHeader';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import SubscriptionBadge from '../../../components/super-admin/gyms/SubscriptionBadge';
import {
  ChangePlanModal,
  ExtendSubscriptionModal,
} from '../../../components/super-admin/subscriptions/SubscriptionModals';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatDate } from '../../../utils/formatters';

const REFERENCE_DATE = new Date('2026-11-19T00:00:00Z');

function getRemainingTrialDays(endDate) {
  if (!endDate) return 0;
  const target = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return 0;
  return Math.max(
    0,
    Math.ceil((target.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function FreeTrialsPage() {
  const {
    plans,
    subscriptions,
    extendTrial,
    convertTrialToPaid,
    changeSubscriptionPlan,
    endTrial,
  } = useSubscriptions();

  const [search, setSearch] = useState('');
  const [trialToExtend, setTrialToExtend] = useState(null);
  const [trialToConvert, setTrialToConvert] = useState(null);
  const [trialForPlan, setTrialForPlan] = useState(null);
  const [trialToEnd, setTrialToEnd] = useState(null);

  const trialAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscriptions
      .filter((s) => s.status === 'trial')
      .filter(
        (s) =>
          !q ||
          s.gymName.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q)
      );
  }, [subscriptions, search]);

  const totalTrials = subscriptions.filter((s) => s.status === 'trial').length;
  const highIntentCount = subscriptions.filter(
    (s) => s.status === 'trial' && s.conversionStatus === 'High Intent'
  ).length;
  const convertedCount = subscriptions.filter(
    (s) => s.conversionStatus === 'Converted'
  ).length;
  const conversionRate = Math.round(((18 + convertedCount) / (44 + convertedCount)) * 100);

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
          <p className="text-xs text-slate-500">{row.ownerName}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Trial Start Date',
      render: (row) => (
        <span className="tabular-nums text-slate-600 whitespace-nowrap">
          {formatDate(row.startDate)}
        </span>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Trial End Date',
      render: (row) => (
        <span className="tabular-nums text-slate-700 whitespace-nowrap">
          {formatDate(row.expiryDate)}
        </span>
      ),
    },
    {
      key: 'remainingDays',
      header: 'Remaining Trial Days',
      render: (row) => {
        const days = getRemainingTrialDays(row.expiryDate);
        return (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${
              days <= 3
                ? 'border-red-200 bg-red-50 text-red-700'
                : days <= 7
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-sky-200 bg-sky-50 text-sky-800'
            }`}
          >
            {days}d remaining
          </span>
        );
      },
    },
    {
      key: 'planName',
      header: 'Selected Plan',
      render: (row) => <SubscriptionBadge plan={row.planName} />,
    },
    {
      key: 'conversionStatus',
      header: 'Conversion Status',
      render: (row) => (
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
          {row.conversionStatus || 'Evaluating'}
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
            variant="emerald"
            size="sm"
            leftIcon={CheckCircle2}
            onClick={() => setTrialToConvert(row)}
          >
            Convert to Paid
          </Button>
          <button
            type="button"
            onClick={() => setTrialToExtend(row)}
            title="Extend Trial"
            aria-label={`Extend trial for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setTrialForPlan(row)}
            title="Change Plan"
            aria-label={`Change plan for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setTrialToEnd(row)}
            title="End Trial"
            aria-label={`End trial for ${row.gymName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Free Trials"
        description="Monitor onboarding momentum, extend evaluation windows, and convert trial gyms to paid plans."
      />

      {/* Trial Conversion Analytics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Active Free Trials"
          value={String(totalTrials)}
          change="+3"
          trend="up"
          previousLabel="in 14–30d window"
          icon="Activity"
        />
        <AdminStatCard
          label="High-Intent Trials"
          value={String(highIntentCount)}
          change="Ready"
          trend="up"
          previousLabel="active coaching setup"
          icon="Sparkles"
        />
        <AdminStatCard
          label="Trial-to-Paid Conversion"
          value={`${conversionRate}%`}
          change="+4.2%"
          trend="up"
          previousLabel="vs 36.7% last month"
          icon="TrendingUp"
        />
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Cohort Conversion Progress
            </span>
            <p className="mt-2 font-display text-2xl font-bold text-slate-800 tabular-nums">
              {18 + convertedCount} / {44 + convertedCount}
            </p>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Trailing 30-day trial cohorts converted
            </p>
          </div>
        </div>
      </section>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search trial accounts by gym or owner..."
        hasActiveFilters={Boolean(search.trim())}
        onReset={() => setSearch('')}
      />

      <DataTable
        columns={columns}
        data={trialAccounts}
        emptyTitle="No active free trials"
        emptyDescription="All recent trial gyms have either converted to paid plans or completed their window."
      />

      <ExtendSubscriptionModal
        isOpen={Boolean(trialToExtend)}
        onClose={() => setTrialToExtend(null)}
        subscription={trialToExtend}
        title="Extend Free Trial"
        onConfirm={(sub, days) => {
          extendTrial(sub.id, days);
          toast.success(`Extended trial for ${sub.gymName} by ${days} days`);
          setTrialToExtend(null);
        }}
      />

      <ChangePlanModal
        isOpen={Boolean(trialForPlan)}
        onClose={() => setTrialForPlan(null)}
        subscription={trialForPlan}
        plans={plans}
        onConfirm={(sub, planId, cycle) => {
          changeSubscriptionPlan(sub.id, planId, cycle);
          toast.success(`Updated selected plan for ${sub.gymName}`);
          setTrialForPlan(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(trialToConvert)}
        onClose={() => setTrialToConvert(null)}
        onConfirm={() => {
          if (!trialToConvert) return;
          convertTrialToPaid(trialToConvert.id);
          toast.success(`Converted ${trialToConvert.gymName} to paid subscription`);
          setTrialToConvert(null);
        }}
        title={`Convert ${trialToConvert?.gymName} to Paid?`}
        description={`This activates their ${trialToConvert?.planName} subscription immediately and initiates standard billing cycles.`}
        confirmLabel="Convert to Paid"
        variant="emerald"
      />

      <ConfirmDialog
        isOpen={Boolean(trialToEnd)}
        onClose={() => setTrialToEnd(null)}
        onConfirm={() => {
          if (!trialToEnd) return;
          endTrial(trialToEnd.id);
          toast.error(`Ended free trial for ${trialToEnd.gymName}`);
          setTrialToEnd(null);
        }}
        title={`End trial for ${trialToEnd?.gymName}?`}
        description="Ending the trial early marks the subscription as expired."
        confirmLabel="End Trial"
        variant="danger"
      />
    </div>
  );
}

export default FreeTrialsPage;
