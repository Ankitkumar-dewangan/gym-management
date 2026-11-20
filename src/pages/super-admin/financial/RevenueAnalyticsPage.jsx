import { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import {
  PaymentMethodsChart,
  RevenueByPlanChart,
  RevenueGrowthChart,
  RevenueTrendYoYChart,
} from '../../../components/super-admin/financial/FinancialCharts';
import Select from '../../../components/ui/Select';
import {
  PAYMENT_METHOD_BREAKDOWN,
  REVENUE_BY_PLAN,
  REVENUE_GROWTH_SERIES,
  REVENUE_TREND_YOY,
} from '../../../constants/financialData';
import { formatCurrency } from '../../../utils/formatters';

const RANGE_OPTIONS = [
  { value: '12m', label: 'Last 12 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '3m', label: 'Last 90 Days' },
];

export function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState('12m');

  const trendSlice = useMemo(() => {
    if (dateRange === '3m') return REVENUE_TREND_YOY.slice(-3);
    if (dateRange === '6m') return REVENUE_TREND_YOY.slice(-6);
    return REVENUE_TREND_YOY;
  }, [dateRange]);

  const growthSlice = useMemo(() => {
    if (dateRange === '3m') return REVENUE_GROWTH_SERIES.slice(-3);
    return REVENUE_GROWTH_SERIES;
  }, [dateRange]);

  const windowTotal = useMemo(
    () => trendSlice.reduce((sum, item) => sum + item.currentYear, 0),
    [trendSlice]
  );

  const prevWindowTotal = useMemo(
    () => trendSlice.reduce((sum, item) => sum + item.previousYear, 0),
    [trendSlice]
  );

  const yoyLift = Math.round(((windowTotal - prevWindowTotal) / Math.max(1, prevWindowTotal)) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Analytics"
        description="Analyze YoY recurring revenue trends, plan distribution, payment method mix, and growth velocity."
        actions={
          <div className="relative flex items-center">
            <Calendar
              className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <Select
              aria-label="Filter revenue window"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={RANGE_OPTIONS}
              className="pl-9 w-44"
            />
          </div>
        }
      />

      {/* Period Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Selected Window Revenue</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(windowTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Prior Year Equivalent</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-700 tabular-nums">
            {formatCurrency(prevWindowTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">YoY Expansion Rate</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-emerald-700 tabular-nums">
            +{yoyLift}%
          </p>
        </div>
      </section>

      <RevenueTrendYoYChart data={trendSlice} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueByPlanChart data={REVENUE_BY_PLAN} />
        <PaymentMethodsChart data={PAYMENT_METHOD_BREAKDOWN} />
      </div>

      <RevenueGrowthChart data={growthSlice} />
    </div>
  );
}

export default RevenueAnalyticsPage;
