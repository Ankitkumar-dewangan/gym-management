import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import {
  PlanDistributionChart,
  SubscriptionGrowthChart,
  SubscriptionRevenueChart,
  SubscriptionStatusChart,
} from '../../../components/super-admin/subscriptions/SubscriptionCharts';
import Button from '../../../components/ui/Button';
import {
  SUBSCRIPTION_GROWTH_SERIES,
  SUBSCRIPTION_REVENUE_12M,
} from '../../../constants/subscriptionData';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency } from '../../../utils/formatters';

export function SubscriptionDashboardPage() {
  const { subscriptions, transactions } = useSubscriptions();

  const metrics = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((s) => s.status === 'active').length;
    const expired = subscriptions.filter((s) => s.status === 'expired').length;
    const trials = subscriptions.filter((s) => s.status === 'trial').length;
    const cancelled = subscriptions.filter((s) => s.status === 'cancelled').length;

    const mrr = subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        const monthly = s.billingCycle === 'Yearly' ? Math.round(s.amount / 12) : s.amount;
        return sum + monthly;
      }, 0);

    const arr = mrr * 12;

    const upcomingRenewals = subscriptions.filter((s) => {
      if (s.status !== 'active') return false;
      const diff = (new Date(s.expiryDate) - new Date('2026-11-19')) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;

    const pendingPayments = transactions
      .filter((t) => t.status === 'pending' || t.status === 'failed')
      .reduce((sum, t) => sum + t.amount, 0);

    const planDistribution = [
      {
        name: 'Starter',
        value: subscriptions.filter((s) => s.planName === 'Starter').length,
        color: '#64748B',
      },
      {
        name: 'Pro',
        value: subscriptions.filter((s) => s.planName === 'Pro').length,
        color: '#10B981',
      },
      {
        name: 'Enterprise',
        value: subscriptions.filter((s) => s.planName === 'Enterprise').length,
        color: '#14213D',
      },
    ];

    const statusDistribution = [
      { name: 'Active', value: active, color: '#10B981' },
      { name: 'Trial', value: trials, color: '#0EA5E9' },
      { name: 'Expired', value: expired, color: '#EF4444' },
      { name: 'Cancelled', value: cancelled, color: '#64748B' },
    ];

    return {
      total,
      active,
      expired,
      trials,
      mrr,
      arr,
      upcomingRenewals,
      pendingPayments,
      planDistribution,
      statusDistribution,
    };
  }, [subscriptions, transactions]);

  const kpiCards = [
    {
      label: 'Total Subscriptions',
      value: String(metrics.total),
      change: '+11.2%',
      trend: 'up',
      previousLabel: 'vs prior 30d',
      icon: 'FileCheck2',
    },
    {
      label: 'Active Subscriptions',
      value: String(metrics.active),
      change: '+9.4%',
      trend: 'up',
      previousLabel: 'vs prior 30d',
      icon: 'BadgeCheck',
    },
    {
      label: 'Expired Subscriptions',
      value: String(metrics.expired),
      change: '-12.0%',
      trend: 'up',
      previousLabel: 'vs prior 30d',
      icon: 'Clock',
    },
    {
      label: 'Free Trial Accounts',
      value: String(metrics.trials),
      change: '+15.0%',
      trend: 'up',
      previousLabel: 'active evaluations',
      icon: 'Activity',
    },
    {
      label: 'Monthly Recurring Revenue (MRR)',
      value: formatCurrency(metrics.mrr),
      change: '+10.8%',
      trend: 'up',
      previousLabel: 'vs last month',
      icon: 'TrendingUp',
    },
    {
      label: 'Annual Recurring Revenue (ARR)',
      value: formatCurrency(metrics.arr),
      change: '+14.1%',
      trend: 'up',
      previousLabel: 'run rate',
      icon: 'CreditCard',
    },
    {
      label: 'Upcoming Renewals',
      value: String(metrics.upcomingRenewals),
      change: 'Next 30d',
      trend: 'neutral',
      previousLabel: 'scheduled invoices',
      icon: 'CalendarCheck',
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(metrics.pendingPayments),
      change: '-4.2%',
      trend: 'down',
      previousLabel: 'awaiting settlement',
      icon: 'Wallet',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Manage gym subscription plans, billing cycles and renewals."
        actions={
          <>
            <Link to="/super-admin/subscription-plans">
              <Button variant="outline" leftIcon={Sparkles}>
                Manage Plans
              </Button>
            </Link>
            <Link to="/super-admin/subscription-plans/create">
              <Button variant="emerald" leftIcon={Plus}>
                Create Plan
              </Button>
            </Link>
          </>
        }
      />

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            change={card.change}
            trend={card.trend}
            previousLabel={card.previousLabel}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Quick Module Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Subscriptions', to: '/super-admin/active-subscriptions', count: metrics.active },
          { label: 'Upcoming Expiries', to: '/super-admin/upcoming-expiries', count: metrics.upcomingRenewals },
          { label: 'Free Trials', to: '/super-admin/free-trials', count: metrics.trials },
          { label: 'Payments & Billing', to: '/super-admin/billing', count: transactions.length },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-navy-700/40 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="font-mono text-xs text-slate-500 tabular-nums mt-0.5">
                {item.count} records
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <SubscriptionRevenueChart data={SUBSCRIPTION_REVENUE_12M} />
        </div>
        <div className="xl:col-span-5">
          <SubscriptionGrowthChart data={SUBSCRIPTION_GROWTH_SERIES} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanDistributionChart data={metrics.planDistribution} />
        <SubscriptionStatusChart data={metrics.statusDistribution} />
      </div>
    </div>
  );
}

export default SubscriptionDashboardPage;
