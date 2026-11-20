import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import AnalyticsFilterBar from '../../../components/gym/analytics/AnalyticsFilterBar';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

const COLORS = ['#14213D', '#10B981', '#E5A93C', '#0EA5E9', '#8B5CF6', '#EC4899', '#EF4444'];

export default function RevenueAnalyticsDashboardPage() {
  const { memberFees, transactions, expenses, refunds } = useGymFinance();
  const { branches } = useTenant();
  const { globalFilters } = useGymAnalyticsNotifications();

  const [activeTableTab, setActiveTableTab] = useState('monthly'); // 'monthly' | 'branches' | 'plans' | 'pending' | 'refunds'

  // Calculations
  const scopedTxns = useMemo(() => {
    return (transactions || []).filter((t) => {
      const matchBranch = globalFilters.branch === 'all' || t.branchName === globalFilters.branch;
      return matchBranch && t.status === 'Completed';
    });
  }, [transactions, globalFilters]);

  const scopedExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      const matchBranch = globalFilters.branch === 'all' || e.branchName === globalFilters.branch;
      return matchBranch && e.status === 'Approved';
    });
  }, [expenses, globalFilters]);

  const totalRevenue = scopedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 520000;
  const monthlyRevenue = 460000;
  const totalCollections = totalRevenue;
  const pendingFees = (memberFees || []).reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);
  const overdueFees = (memberFees || []).filter((f) => f.daysOverdue > 0).reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);
  const totalExpenses = scopedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 142000;
  const netProfit = totalRevenue - totalExpenses;
  const totalRefunds = (refunds || []).filter((r) => r.status === 'Processed').reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 4500;

  // Charts
  const monthlyRevenueData = [
    { month: 'Jun', revenue: 310000, collections: 295000, pending: 28000 },
    { month: 'Jul', revenue: 345000, collections: 330000, pending: 24000 },
    { month: 'Aug', revenue: 390000, collections: 375000, pending: 30000 },
    { month: 'Sep', revenue: 420000, collections: 405000, pending: 25000 },
    { month: 'Oct', revenue: 480000, collections: 462000, pending: 28000 },
    { month: 'Nov', revenue: totalRevenue, collections: totalCollections, pending: pendingFees },
  ];

  const planRevenueData = [
    { name: 'Annual All-Access', amount: 240000 },
    { name: 'Quarterly Strength', amount: 145000 },
    { name: 'Monthly Flex', amount: 68000 },
    { name: 'VIP Coaching Elite', amount: 52000 },
    { name: 'Weekend Warrior', amount: 15000 },
  ];

  const branchRevenue = (branches || []).map((b, i) => ({
    branch: b.name.replace(' Branch', '').replace(' Fitness Hub', ''),
    revenue: [245000, 165000, 110000][i] || 85000,
    expenses: [68000, 44000, 30000][i] || 25000,
  }));

  const expenseCategoryBreakdown = [
    { name: 'Facility Rent', value: 65000 },
    { name: 'Staff Salaries', value: 50500 },
    { name: 'Electricity & Utilities', value: 18500 },
    { name: 'Equipment Maintenance', value: 12000 },
    { name: 'Marketing & Software', value: 8000 },
  ];

  const exportFinancialsCSV = () => {
    const headers = ['Month', 'Gross Revenue (INR)', 'Collections (INR)', 'Pending (INR)'];
    const rows = monthlyRevenueData.map((d) => [d.month, d.revenue, d.collections, d.pending]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Financial_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Financial Performance Analytics"
        description="Comprehensive cash flow auditing, gross collection trajectories, overdue balances, and operational profitability."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportFinancialsCSV}>
              Export Finance CSV
            </Button>
          </div>
        }
      />

      <AnalyticsFilterBar onExportCSV={exportFinancialsCSV} onPrint={() => window.print()} />

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Monthly Realized', value: `₹${monthlyRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Collected Dues', value: `₹${totalCollections.toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending Dues', value: `₹${pendingFees.toLocaleString('en-IN')}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Overdue >5d', value: `₹${overdueFees.toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Net Profit', value: `₹${netProfit.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Refunds Settled', value: `₹${totalRefunds.toLocaleString('en-IN')}`, icon: RotateCcw, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {k.label}
                </span>
                <div className={`p-1 rounded ${k.bg} ${k.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 truncate">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Revenue & Collections Trajectory */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue vs. Collections Trajectory (INR)</h3>
            <p className="text-xs text-slate-500">Billed membership receivables compared with actual banked realizations</p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700">₹{totalRevenue.toLocaleString('en-IN')} MTD</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Billed Revenue" stroke="#14213D" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="collections" name="Actual Banked" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plans & Branches Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Revenue by Membership Plan</h3>
            <span className="text-xs text-slate-400">Contribution</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planRevenueData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill="#14213D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Operational Burn by Category</h3>
            <span className="text-xs text-slate-400">Expense Audit</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                >
                  {expenseCategoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial Reports Audit Table with Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'monthly', label: 'Monthly Financials' },
              { id: 'branches', label: 'Branch Comparison' },
              { id: 'plans', label: 'Plan Contribution' },
              { id: 'pending', label: 'Overdue Dues Ledger' },
              { id: 'refunds', label: 'Refund Audit' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTableTab(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTableTab === t.id ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="xs" leftIcon={Download} onClick={exportFinancialsCSV}>
            Export Active Tab CSV
          </Button>
        </div>

        {/* Tab 1: Monthly */}
        {activeTableTab === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Month</th>
                  <th className="px-4 py-2.5">Billed Revenue</th>
                  <th className="px-4 py-2.5">Banked Collections</th>
                  <th className="px-4 py-2.5">Pending Balance</th>
                  <th className="px-4 py-2.5">Collection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyRevenueData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/75">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{d.month} 2026</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">₹{d.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">₹{d.collections.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-amber-600 font-medium">₹{d.pending.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-700">
                      {Math.round((d.collections / d.revenue) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Branches */}
        {activeTableTab === 'branches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Branch Location</th>
                  <th className="px-4 py-2.5">Realized Revenue</th>
                  <th className="px-4 py-2.5">Operating Cost</th>
                  <th className="px-4 py-2.5">Net Contribution</th>
                  <th className="px-4 py-2.5">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchRevenue.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/75">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{b.branch}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">₹{b.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-red-500 font-medium">₹{b.expenses.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-700">₹{(b.revenue - b.expenses).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-semibold text-navy-800">
                      {Math.round(((b.revenue - b.expenses) / b.revenue) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Plans */}
        {activeTableTab === 'plans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Plan Name</th>
                  <th className="px-4 py-2.5">Total Revenue Realized</th>
                  <th className="px-4 py-2.5">% of Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planRevenueData.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/75">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">
                      {Math.round((p.amount / totalRevenue) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Pending */}
        {activeTableTab === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Member Name</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5">Pending Amount</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Overdue Days</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(memberFees || []).filter((f) => f.pendingAmount > 0).map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/75">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{f.memberName}</td>
                    <td className="px-4 py-2.5">{f.planName}</td>
                    <td className="px-4 py-2.5 font-bold text-red-600">₹{f.pendingAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5">{f.dueDate}</td>
                    <td className="px-4 py-2.5 font-mono text-red-500">{f.daysOverdue || 0}d</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                        {f.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Refunds */}
        {activeTableTab === 'refunds' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Refund ID</th>
                  <th className="px-4 py-2.5">Member</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Reason</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(refunds || []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75">
                    <td className="px-4 py-2.5 font-mono font-medium text-navy-800">{r.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{r.memberName}</td>
                    <td className="px-4 py-2.5 font-bold text-red-600">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.reason}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
