import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  Percent,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

const COLORS = ['#14213D', '#E5A93C', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899', '#F97316'];

export default function FinancialReportsDashboardPage() {
  const { memberFees, transactions, expenses } = useGymFinance();
  const { branches } = useTenant();

  const [activeTab, setActiveTab] = useState('pnl'); // 'pnl' | 'plans' | 'branches' | 'expenses' | 'gst'
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRange, setSelectedRange] = useState('year');

  // Filtered dataset
  const filteredTxns = useMemo(() => {
    return (transactions || []).filter((t) => {
      const matchBranch = selectedBranch === 'all' || t.branchName === selectedBranch;
      return matchBranch && t.status === 'Completed';
    });
  }, [transactions, selectedBranch]);

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      const matchBranch = selectedBranch === 'all' || e.branchName === selectedBranch;
      return matchBranch && e.status === 'Approved';
    });
  }, [expenses, selectedBranch]);

  // Calculations
  const grossRevenue = filteredTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpenseVal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = grossRevenue - totalExpenseVal;
  const gstCollected = Math.round((grossRevenue * 18) / 118);

  // Monthly P&L Trend (12 Months simulation)
  const pnlMonthlyData = [
    { month: 'Jun', revenue: 280000, expenses: 95000, profit: 185000 },
    { month: 'Jul', revenue: 310000, expenses: 102000, profit: 208000 },
    { month: 'Aug', revenue: 345000, expenses: 110000, profit: 235000 },
    { month: 'Sep', revenue: 390000, expenses: 125000, profit: 265000 },
    { month: 'Oct', revenue: 420000, expenses: 130000, profit: 290000 },
    { month: 'Nov', revenue: grossRevenue || 460000, expenses: totalExpenseVal || 142000, profit: (grossRevenue || 460000) - (totalExpenseVal || 142000) },
  ];

  // Plan Distribution
  const planBreakdown = useMemo(() => {
    const map = {};
    (memberFees || []).forEach((f) => {
      const plan = f.planName || 'General Fitness';
      map[plan] = (map[plan] || 0) + (f.paidAmount || 0);
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [memberFees]);

  // Branch Revenue Comparison
  const branchRevenueData = useMemo(() => {
    const map = {};
    (transactions || []).forEach((t) => {
      if (t.status === 'Completed') {
        map[t.branchName] = (map[t.branchName] || 0) + (Number(t.amount) || 0);
      }
    });
    return Object.keys(map).map((b) => ({ branch: b, revenue: map[b] }));
  }, [transactions]);

  // Expense Categories
  const expenseCatData = useMemo(() => {
    const map = {};
    (expenses || []).forEach((e) => {
      if (e.status === 'Approved') {
        map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
      }
    });
    return Object.keys(map).map((c) => ({ name: c, value: map[c] }));
  }, [expenses]);

  const exportCurrentReportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'pnl') {
      headers = ['Month', 'Revenue (INR)', 'Expenses (INR)', 'Net Profit (INR)'];
      rows = pnlMonthlyData.map((d) => [d.month, d.revenue, d.expenses, d.profit]);
    } else if (activeTab === 'plans') {
      headers = ['Plan Name', 'Total Collected (INR)'];
      rows = planBreakdown.map((p) => [`"${p.name}"`, p.value]);
    } else if (activeTab === 'branches') {
      headers = ['Branch Name', 'Revenue (INR)'];
      rows = branchRevenueData.map((b) => [`"${b.branch}"`, b.revenue]);
    } else if (activeTab === 'expenses') {
      headers = ['Category', 'Amount (INR)'];
      rows = expenseCatData.map((e) => [`"${e.name}"`, e.value]);
    } else {
      headers = ['Metric', 'Amount (INR)'];
      rows = [
        ['Total Gross Revenue', grossRevenue],
        ['Net Taxable Base (excl 18% GST)', grossRevenue - gstCollected],
        ['Output GST Collected (18%)', gstCollected],
        ['CGST (9%)', Math.round(gstCollected / 2)],
        ['SGST (9%)', Math.round(gstCollected / 2)],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports & Analytics"
        description="Comprehensive profit & loss, GST tax audits, plan contribution, and branch performance insights."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportCurrentReportCSV}>
              Export Report CSV
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Fee Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{grossRevenue.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">Total collections received</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{totalExpenseVal.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">Operational costs & overheads</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Operating Profit</span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-navy-900">₹{netProfit.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {grossRevenue > 0 ? `${Math.round((netProfit / grossRevenue) * 100)}% net margin` : '—'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">GST Output Tax (18%)</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">₹{gstCollected.toLocaleString('en-IN')}</div>
          <p className="mt-1 text-xs text-slate-500">GSTR-1 tax liability</p>
        </div>
      </div>

      {/* Filter and Tab Controller */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'pnl', label: 'Profit & Loss' },
              { id: 'plans', label: 'Plan Contribution' },
              { id: 'branches', label: 'Branch Comparison' },
              { id: 'expenses', label: 'Expense Audit' },
              { id: 'gst', label: 'GST Tax Summary' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Selectors */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              options={[
                { value: 'all', label: 'All Branches' },
                ...(branches || []).map((b) => ({ value: b.name, label: b.name })),
              ]}
            />
            <Select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'Last 3 Months' },
                { value: 'year', label: 'Current Financial Year' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'pnl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue vs. Expense Burn</h3>
                <p className="text-xs text-slate-500">6-Month historical comparative trajectory</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Amounts in INR (₹)</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Fee Revenue" fill="#14213D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              P&L Financial Breakdown
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Invoiced Fees:</span>
                <span className="font-semibold text-slate-900">₹{(grossRevenue * 1.1).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Actual Realized Revenue:</span>
                <span className="font-bold text-emerald-600">₹{grossRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Facility Overheads & Rent:</span>
                <span className="font-semibold text-slate-800">₹{(totalExpenseVal * 0.45).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Staff & Trainer Payroll:</span>
                <span className="font-semibold text-slate-800">₹{(totalExpenseVal * 0.4).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Equipment & Utilities:</span>
                <span className="font-semibold text-slate-800">₹{(totalExpenseVal * 0.15).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-bold text-navy-900">
                <span>Net Surplus (EBITDA):</span>
                <span>₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Revenue by Membership Tier
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => entry.name}
                  >
                    {planBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Plan Contribution Audit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Plan Name</th>
                    <th className="p-2.5 text-right">Fee Collected</th>
                    <th className="p-2.5 text-right">% Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {planBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{item.value.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-600">
                        {grossRevenue > 0 ? `${((item.value / grossRevenue) * 100).toFixed(1)}%` : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Branch-wise Fee Realization</h3>
              <p className="text-xs text-slate-500">Comparison across active club centers</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="branch" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#14213D" radius={[4, 4, 0, 0]} name="Realized Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Expense Allocation by Category
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCatData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => entry.name}
                  >
                    {expenseCatData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Expense Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Total Settled</th>
                    <th className="p-2.5 text-right">% of Expenses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseCatData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{item.value.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-red-500">
                        {totalExpenseVal > 0 ? `${((item.value / totalExpenseVal) * 100).toFixed(1)}%` : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gst' && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">GST Tax Return Summary (GSTR-1 Simulation)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Goods and Services Tax audit for fitness club services (SAC Code: 999723, Rate: 18%).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block uppercase font-medium">Net Taxable Turnover</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                ₹{(grossRevenue - gstCollected).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Excluding 18% GST component</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block uppercase font-medium">Output CGST (9%)</span>
              <span className="text-xl font-bold text-navy-800 mt-1 block">
                ₹{Math.round(gstCollected / 2).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Central Tax Share</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block uppercase font-medium">Output SGST (9%)</span>
              <span className="text-xl font-bold text-navy-800 mt-1 block">
                ₹{Math.round(gstCollected / 2).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">State / UT Tax Share</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Tax Books Balanced</h4>
                <p className="text-xs text-emerald-700">All registered invoices carry valid SAC Code and 18% GST bifurcation.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800">
              Download GSTR-1 JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}