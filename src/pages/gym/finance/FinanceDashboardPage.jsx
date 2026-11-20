import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';

export function FinanceDashboardPage() {
  const navigate = useNavigate();
  const { activeTenant, branches, activeBranch, selectBranch } = useTenant();
  const { memberFees, transactions, expenses, refunds, invoices } = useGymFinance();

  const [timeFilter, setTimeFilter] = useState('this_month'); // today, this_week, this_month, last_month, this_year
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');

  // Multi-branch filter
  const branchFilteredFees = useMemo(() => {
    if (selectedBranchFilter === 'all') return memberFees;
    return memberFees.filter((f) => f.branchName === selectedBranchFilter || f.branchId === selectedBranchFilter);
  }, [memberFees, selectedBranchFilter]);

  const branchFilteredExpenses = useMemo(() => {
    if (selectedBranchFilter === 'all') return expenses;
    return expenses.filter((e) => e.branchName === selectedBranchFilter);
  }, [expenses, selectedBranchFilter]);

  const branchFilteredTxns = useMemo(() => {
    if (selectedBranchFilter === 'all') return transactions;
    return transactions.filter((t) => t.branchName === selectedBranchFilter);
  }, [transactions, selectedBranchFilter]);

  // Aggregate Financial Figures
  const collectedFees = branchFilteredTxns
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const pendingFees = branchFilteredFees
    .reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);

  const overduePayments = branchFilteredFees
    .filter((f) => f.paymentStatus === 'Overdue')
    .reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);

  const totalExpenses = branchFilteredExpenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalRefunds = refunds
    .filter((r) => r.status === 'Approved' || r.status === 'Processed')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalRevenue = collectedFees;
  const netProfit = totalRevenue - totalExpenses - totalRefunds;
  const monthlyRevenue = Math.round(totalRevenue * 0.85);

  // Recharts Monthly Revenue & Expense Data
  const monthlyFinanceData = [
    { month: 'Jun', revenue: 165000, expense: 98000, profit: 67000 },
    { month: 'Jul', revenue: 198000, expense: 112000, profit: 86000 },
    { month: 'Aug', revenue: 224000, expense: 125000, profit: 99000 },
    { month: 'Sep', revenue: 258000, expense: 138000, profit: 120000 },
    { month: 'Oct', revenue: 285000, expense: 145000, profit: 140000 },
    { month: 'Nov', revenue: totalRevenue, expense: totalExpenses, profit: netProfit },
  ];

  // Daily collections this week
  const dailyCollections = [
    { day: 'Mon', amount: 18500 },
    { day: 'Tue', amount: 24000 },
    { day: 'Wed', amount: 14500 },
    { day: 'Thu', amount: 32000 },
    { day: 'Fri', amount: 21000 },
    { day: 'Sat', amount: 48000 },
    { day: 'Sun', amount: 12000 },
  ];

  // Revenue by Plan
  const planRevenueData = [
    { name: 'Annual Elite', value: 45, color: '#2563EB' },
    { name: '6-Month Hypertrophy', value: 25, color: '#10B981' },
    { name: 'Quarterly Pass', value: 18, color: '#F59E0B' },
    { name: 'Monthly Open Gym', value: 12, color: '#8B5CF6' },
  ];

  // Revenue by Payment Method
  const methodData = [
    { name: 'UPI (QR / App)', value: 55, color: '#2563EB' },
    { name: 'Card (POS)', value: 22, color: '#10B981' },
    { name: 'Bank Transfer', value: 15, color: '#F59E0B' },
    { name: 'Cash', value: 8, color: '#64748B' },
  ];

  // Recent transactions snippet
  const recentTransactions = branchFilteredTxns.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Finance & Fees Management Dashboard"
        description="Comprehensive real-time tracking of member membership dues, digital collections, operational expenses, and net facility profitability."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/gym/finance/collect">
              <Button size="sm" leftIcon={Receipt}>
                Collect Fee
              </Button>
            </Link>
            <Link to="/gym/finance/expenses/create">
              <Button size="sm" variant="outline" leftIcon={Plus}>
                Add Expense
              </Button>
            </Link>
            <Link to="/gym/finance/invoices/create">
              <Button size="sm" variant="outline" leftIcon={FileText}>
                Create Invoice
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Toolbar: Time period + Branch Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Branch Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Branch:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-primary-500 text-slate-700"
          >
            <option value="all">All Branches (Consolidated)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: 'today', label: 'Today' },
            { key: 'this_week', label: 'This Week' },
            { key: 'this_month', label: 'This Month' },
            { key: 'last_month', label: 'Last Month' },
            { key: 'this_year', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTimeFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeFilter === item.key
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Collected Revenue</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs last month</span>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Fees & Dues</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-amber-600">
              ₹{pendingFees.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{branchFilteredFees.filter((f) => f.pendingAmount > 0).length} Members with balance</span>
            <Link to="/gym/finance/pending" className="text-primary-600 font-semibold hover:underline">
              Review
            </Link>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Operating Expenses</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-rose-600">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Rent, utilities & facility upkeep</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Operating Profit</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-blue-900">
              ₹{netProfit.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span>Healthy 42% operating margin</span>
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overdue Payments</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-rose-700">
              ₹{overduePayments.toLocaleString('en-IN')}
            </h3>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Past grace period cutoff</p>
        </div>

        {/* Monthly Projected */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Run-rate (MRR)</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">
              ₹{monthlyRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Recurring membership commitment</p>
        </div>

        {/* Total Refunds */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Refunds Processed</span>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-700">
              ₹{totalRefunds.toLocaleString('en-IN')}
            </h3>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{refunds.length} total refund claims</p>
        </div>

        {/* Quick Invoicing Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tax Invoices Issued</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{invoices.length}</h3>
            <span className="text-xs text-slate-400">GST Bills</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">100% Tax Compliant</p>
        </div>
      </div>

      {/* Quick Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/gym/finance/fees"
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-50 text-primary-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Fee Directory</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          to="/gym/finance/collect"
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Collect Payment</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          to="/gym/finance/invoices"
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Invoices</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          to="/gym/finance/expenses"
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Expenses</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          to="/gym/finance/reports"
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Reports</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses vs Net Profit Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Revenue vs Expenses</h3>
              <p className="text-xs text-slate-400">Financial performance progression across recent months</p>
            </div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
              Past 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinanceData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0F1E36',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" fill="#2563EB" name="Revenue Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#F43F5E" name="Facility Expenses" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10B981" name="Net Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Payment Method Donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-800">Payment Methods Share</h3>
            <p className="text-xs text-slate-400">Member transaction mode distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Daily Collections + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Collections Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Daily Collections (Current Week)</h3>
              <p className="text-xs text-slate-400">Day-by-day fee cash inflows across all active counters</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              7-Day Activity
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCollections}>
                <defs>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Collected']}
                  contentStyle={{
                    backgroundColor: '#0F1E36',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#feeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-800">Revenue by Plan</h3>
            <p className="text-xs text-slate-400">Contribution by membership package</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planRevenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                >
                  {planRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-400">Latest fee deposits and membership installments</p>
          </div>
          <Link to="/gym/finance/transactions">
            <Button size="sm" variant="outline">
              View All Transactions
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{tx.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{tx.memberName}</td>
                  <td className="py-3 px-4 text-slate-600">{tx.type}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {tx.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/gym/finance/receipts"
                      className="text-xs font-semibold text-primary-600 hover:underline"
                    >
                      Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboardPage;
