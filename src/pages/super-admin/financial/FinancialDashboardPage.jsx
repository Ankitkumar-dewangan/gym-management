import { useMemo } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import AdminStatCard from '../../../components/super-admin/AdminStatCard';
import {
  PaymentMethodsChart,
  RevenueByPlanChart,
  RevenueTrendYoYChart,
} from '../../../components/super-admin/financial/FinancialCharts';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/ui/Button';
import {
  GATEWAY_SUMMARY,
  PAYMENT_METHOD_BREAKDOWN,
  REVENUE_BY_PLAN,
  REVENUE_TREND_YOY,
} from '../../../constants/financialData';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export function FinancialDashboardPage() {
  const { subscriptions, transactions, refunds } = useSubscriptions();

  const metrics = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const mrr = activeSubs.reduce(
      (sum, s) => sum + (s.billingCycle === 'Yearly' ? Math.round(s.amount / 12) : s.amount),
      0
    );
    const totalRevenue = REVENUE_TREND_YOY.reduce((sum, r) => sum + r.currentYear, 0);
    const monthlyRevenue = REVENUE_TREND_YOY[REVENUE_TREND_YOY.length - 1]?.currentYear || 84650;
    const arr = (mrr + 78200) * 12;
    const paidCount = transactions.filter((t) => t.status === 'paid').length;
    const pendingCount = transactions.filter((t) => t.status === 'pending').length;
    const failedCount = transactions.filter((t) => t.status === 'failed').length;
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalRevenue,
      monthlyRevenue,
      mrr: mrr + 78200,
      arr,
      paidCount: 148 + paidCount,
      pendingCount: 9 + pendingCount,
      failedCount: 3 + failedCount,
      totalRefunds,
    };
  }, [subscriptions, transactions, refunds]);

  const recentColumns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-800">{row.id}</span>
      ),
    },
    {
      key: 'gymName',
      header: 'Gym Name',
      render: (row) => <span className="font-medium text-slate-800">{row.gymName}</span>,
    },
    { key: 'method', header: 'Method' },
    { key: 'gateway', header: 'Gateway' },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="tabular-nums text-slate-600">{formatDate(row.date)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
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
        title="Financial Overview"
        description="Monitor platform revenue, transactions, collections and financial performance."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/super-admin/financial/reports">
              <Button variant="outline" size="sm" leftIcon={Download}>
                Financial Reports
              </Button>
            </Link>
            <Link to="/super-admin/financial/revenue">
              <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                Revenue Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* 8 Financial KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change="+28.7%"
          trend="up"
          previousLabel="trailing 12 months"
          icon="DollarSign"
        />
        <AdminStatCard
          label="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          change="+3.5%"
          trend="up"
          previousLabel="vs ₹81,800 last month"
          icon="Wallet"
        />
        <AdminStatCard
          label="Monthly Recurring Revenue (MRR)"
          value={formatCurrency(metrics.mrr)}
          change="+6.4%"
          trend="up"
          previousLabel="active recurring base"
          icon="TrendingUp"
        />
        <AdminStatCard
          label="Annual Recurring Revenue (ARR)"
          value={formatCurrency(metrics.arr)}
          change="+24.1%"
          trend="up"
          previousLabel="annualized run rate"
          icon="BarChart3"
        />
        <AdminStatCard
          label="Successful Transactions"
          value={String(metrics.paidCount)}
          change="96.8%"
          trend="up"
          previousLabel="settlement rate"
          icon="CheckCircle2"
        />
        <AdminStatCard
          label="Pending Payments"
          value={String(metrics.pendingCount)}
          change="Due"
          trend="neutral"
          previousLabel="awaiting clearing"
          icon="Clock"
        />
        <AdminStatCard
          label="Failed Payments"
          value={String(metrics.failedCount)}
          change="-2"
          trend="down"
          previousLabel="vs 6 last cycle"
          icon="AlertTriangle"
        />
        <AdminStatCard
          label="Total Refunds"
          value={formatCurrency(metrics.totalRefunds)}
          change="1.1%"
          trend="neutral"
          previousLabel="of monthly gross"
          icon="RotateCcw"
        />
      </section>

      {/* Primary Charts */}
      <RevenueTrendYoYChart data={REVENUE_TREND_YOY} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueByPlanChart data={REVENUE_BY_PLAN} />
        <PaymentMethodsChart data={PAYMENT_METHOD_BREAKDOWN} />
      </div>

      {/* Gateway & Recent Ledger */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-4 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Gateway Health</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active settlement channels</p>
            </div>
            <Link
              to="/super-admin/financial/payments"
              className="text-xs font-semibold text-navy-900 hover:text-emerald-700"
            >
              Manage &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {GATEWAY_SUMMARY.map((gw) => (
              <div key={gw.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{gw.gateway}</p>
                  <p className="text-xs text-slate-500">{gw.methods}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(gw.processedVolume)}
                  </p>
                  <p className="text-[11px] text-emerald-700 tabular-nums">
                    {gw.successRate} success
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Recent Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest subscription settlements across payment gateways
              </p>
            </div>
            <Link
              to="/super-admin/financial/transactions"
              className="text-xs font-semibold text-navy-900 hover:text-emerald-700"
            >
              Full Ledger &rarr;
            </Link>
          </div>
          <DataTable columns={recentColumns} data={transactions.slice(0, 5)} />
        </section>
      </div>
    </div>
  );
}

export default FinancialDashboardPage;
