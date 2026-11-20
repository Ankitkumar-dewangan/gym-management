import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  DollarSign,
  Clock,
  TrendingDown,
  TrendingUp,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  FileBarChart2,
  Bell,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useGymFinance } from '../../../contexts/GymFinanceContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { RETENTION_TREND_DATA } from '../../../constants/gymAnalyticsNotificationsData';

const DONUT_COLORS = ['#14213D', '#E5A93C', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899'];

export default function GymAnalyticsDashboardPage() {
  const { members } = useMemberManagement();
  const { records: attendanceRecords } = useAttendanceManagement();
  const { memberFees, transactions, expenses } = useGymFinance();
  const { branches } = useTenant();
  const { trainers } = useTrainerStaff();
  const { notifications, globalFilters } = useGymAnalyticsNotifications();

  // Filtered dataset calculations based on globalFilters
  const scopedMembers = useMemo(() => {
    return (members || []).filter((m) => {
      const matchBranch = globalFilters.branch === 'all' || m.branch === globalFilters.branch;
      const matchPlan = globalFilters.plan === 'all' || m.planName === globalFilters.plan;
      return matchBranch && matchPlan;
    });
  }, [members, globalFilters]);

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

  // KPIs
  const totalMembers = scopedMembers.length;
  const activeMembers = scopedMembers.filter((m) => m.status === 'active').length;
  const newMembers = scopedMembers.filter((m) => m.joinDate && m.joinDate.startsWith('2026-11')).length || 14;
  const expiredMembers = scopedMembers.filter((m) => m.status === 'expired').length;
  
  const totalRevenue = scopedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 520000;
  const pendingFees = (memberFees || []).reduce((sum, f) => sum + (Number(f.pendingAmount) || 0), 0);
  const totalExpenseVal = scopedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 145000;
  const netProfit = totalRevenue - totalExpenseVal;

  const avgAttendance = 68; // average daily check-ins
  const renewalCount = (memberFees || []).filter((f) => f.isRenewed || f.paymentStatus === 'Paid').length || 38;

  // 10 KPI Cards
  const kpis = [
    { label: 'Total Members', value: totalMembers, change: '+12.5%', trend: 'up', icon: Users, color: 'text-navy-900', bg: 'bg-navy-50' },
    { label: 'Active Members', value: activeMembers, change: '+8.2%', trend: 'up', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'New Members MTD', value: newMembers, change: '+14.0%', trend: 'up', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expired Members', value: expiredMembers, change: '-4.1%', trend: 'down', icon: UserX, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: '+18.4%', trend: 'up', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Pending Dues', value: `₹${pendingFees.toLocaleString('en-IN')}`, change: '-12.0%', trend: 'down', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Expenses', value: `₹${totalExpenseVal.toLocaleString('en-IN')}`, change: '+3.2%', trend: 'up', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Net Profit Margin', value: `₹${netProfit.toLocaleString('en-IN')}`, change: '+22.8%', trend: 'up', icon: TrendingUp, color: 'text-navy-900', bg: 'bg-navy-50' },
    { label: 'Daily Avg Attendance', value: `${avgAttendance} Check-ins`, change: '+6.5%', trend: 'up', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Renewals MTD', value: `${renewalCount} Renewed`, change: '+15.2%', trend: 'up', icon: RefreshCw, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  // Chart 1: Revenue Trend (Line)
  const revenueTrendData = [
    { month: 'Jun', revenue: 310000 },
    { month: 'Jul', revenue: 345000 },
    { month: 'Aug', revenue: 390000 },
    { month: 'Sep', revenue: 420000 },
    { month: 'Oct', revenue: 480000 },
    { month: 'Nov', revenue: totalRevenue },
  ];

  // Chart 2: Membership Growth (Area)
  const growthData = [
    { month: 'Jun', total: 110, active: 98 },
    { month: 'Jul', total: 128, active: 112 },
    { month: 'Aug', total: 145, active: 125 },
    { month: 'Sep', total: 162, active: 140 },
    { month: 'Oct', total: 185, active: 158 },
    { month: 'Nov', total: totalMembers || 215, active: activeMembers || 188 },
  ];

  // Chart 3: Daily Attendance (Bar)
  const dailyAttendanceData = [
    { day: 'Mon', count: 78 },
    { day: 'Tue', count: 82 },
    { day: 'Wed', count: 74 },
    { day: 'Thu', count: 86 },
    { day: 'Fri', count: 70 },
    { day: 'Sat', count: 94 },
    { day: 'Sun', count: 52 },
  ];

  // Chart 4: New vs Renewed Members (Grouped Bar)
  const newVsRenewedData = [
    { month: 'Jul', newMembers: 18, renewed: 24 },
    { month: 'Aug', newMembers: 22, renewed: 28 },
    { month: 'Sep', newMembers: 20, renewed: 32 },
    { month: 'Oct', newMembers: 26, renewed: 35 },
    { month: 'Nov', newMembers: newMembers, renewed: renewalCount },
  ];

  // Chart 5: Plan Distribution (Donut)
  const planDistributionData = [
    { name: 'Annual All-Access', value: 45 },
    { name: 'Quarterly Strength', value: 32 },
    { name: 'Monthly Flex', value: 24 },
    { name: 'VIP Coaching Elite', value: 16 },
    { name: 'Weekend Warrior', value: 8 },
  ];

  // Chart 6: Payment Method Distribution
  const paymentMethodData = [
    { name: 'UPI / QR', value: 58 },
    { name: 'Credit / Debit Card', value: 24 },
    { name: 'Net Banking', value: 12 },
    { name: 'Cash', value: 6 },
  ];

  // Chart 7: Branch Performance (Bar)
  const branchPerfData = (branches || []).map((b, idx) => ({
    name: b.name.replace(' Branch', '').replace(' Fitness Hub', ''),
    members: [84, 62, 54][idx] || 45,
    revenue: [240000, 165000, 115000][idx] || 90000,
  }));

  // Chart 8: Monthly Expenses
  const monthlyExpenseData = [
    { month: 'Jun', amount: 95000 },
    { month: 'Jul', amount: 102000 },
    { month: 'Aug', amount: 110000 },
    { month: 'Sep', amount: 125000 },
    { month: 'Oct', amount: 130000 },
    { month: 'Nov', amount: totalExpenseVal },
  ];

  // Chart 9: Revenue vs Expenses (Comparison)
  const revVsExpData = [
    { month: 'Jun', revenue: 310000, expenses: 95000 },
    { month: 'Jul', revenue: 345000, expenses: 102000 },
    { month: 'Aug', revenue: 390000, expenses: 110000 },
    { month: 'Sep', revenue: 420000, expenses: 125000 },
    { month: 'Oct', revenue: 480000, expenses: 130000 },
    { month: 'Nov', revenue: totalRevenue, expenses: totalExpenseVal },
  ];

  const exportSummaryCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Members', totalMembers],
      ['Active Members', activeMembers],
      ['New Members MTD', newMembers],
      ['Expired Members', expiredMembers],
      ['Gross Revenue (INR)', totalRevenue],
      ['Pending Dues (INR)', pendingFees],
      ['Total Expenses (INR)', totalExpenseVal],
      ['Net Profit (INR)', netProfit],
      ['Average Daily Check-ins', avgAttendance],
      ['Renewals MTD', renewalCount],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Analytics_Overview_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Dashboard"
        description="Enterprise operational intelligence, member growth trends, financial performance, and attendance benchmarks."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/analytics/custom-reports">
              <Button variant="primary" size="sm" leftIcon={Sparkles}>
                Custom Report Builder
              </Button>
            </Link>
          </div>
        }
      />

      {/* Global Filters Bar */}
      <AnalyticsFilterBar
        onExportCSV={exportSummaryCSV}
        onPrint={() => window.print()}
      />

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isUp = kpi.trend === 'up';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2.5">
                <div className="text-xl font-bold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px]">
                  <span
                    className={`inline-flex items-center font-semibold ${
                      isUp ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {kpi.change}
                  </span>
                  <span className="text-slate-400">vs prev</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section 1: Revenue & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Revenue Trajectory */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue Trend (INR)</h3>
              <p className="text-xs text-slate-500">Gross fees realized across 6-month historical curve</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600">₹{totalRevenue.toLocaleString('en-IN')} MTD</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="revenue" name="Fee Revenue" stroke="#14213D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Membership Growth */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Membership Base Growth</h3>
              <p className="text-xs text-slate-500">Total enrolled vs Active regular attendees</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14213D" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14213D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="growthActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total Members" stroke="#14213D" fillOpacity={1} fill="url(#growthTotal)" />
                <Area type="monotone" dataKey="active" name="Active Members" stroke="#10B981" fillOpacity={1} fill="url(#growthActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section 2: Attendance, New vs Renewed, Donut charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 3: Daily Attendance */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Daily Attendance Pattern</h3>
            <span className="text-xs text-slate-400">Weekly Cycle</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyAttendanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Check-ins" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: New vs Renewed */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">New vs. Renewed Members</h3>
            <span className="text-xs text-slate-400">Acquisition vs Retention</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newVsRenewedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="newMembers" name="New Signups" fill="#14213D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="renewed" name="Renewals" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Membership Plan Donut */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Plan Popularity Share</h3>
            <span className="text-xs text-slate-400">By Member Volume</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {planDistributionData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section 3: Branch Performance, Rev vs Exp, Retention */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 6: Payment Methods */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Payment Method Share (%)</h3>
            <span className="text-xs text-slate-400">Checkout Mode</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {paymentMethodData.map((_, i) => (
                    <Cell key={i} fill={['#10B981', '#14213D', '#0EA5E9', '#F59E0B'][i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Revenue vs Expenses */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Revenue vs. Operating Burn</h3>
            <span className="text-xs text-slate-400">P&L Gap</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revVsExpData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" name="Revenue" fill="#14213D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Retention Trend */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Member Retention Rate (%)</h3>
            <span className="text-xs text-emerald-600 font-semibold font-mono">91% Current</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RETENTION_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" domain={[60, 100]} fontSize={11} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Line type="monotone" dataKey="retentionRate" name="Retention %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Detail Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Member Registrations */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-navy-800" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Registrations</h3>
            </div>
            <Link to="/gym/analytics/members" className="text-xs text-navy-800 font-semibold hover:underline">
              View All Members
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {scopedMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-slate-500">{m.planName} • {m.branch}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                    {m.status}
                  </span>
                  <div className="text-slate-400 text-[11px] mt-0.5">Joined {m.joinDate || 'Nov 2026'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Trainers */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-500" />
              <h3 className="font-bold text-slate-900 text-sm">Top Performing Trainers</h3>
            </div>
            <Link to="/gym/analytics/trainers" className="text-xs text-navy-800 font-semibold hover:underline">
              Trainer Analytics
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {(trainers || []).slice(0, 5).map((t, i) => (
              <div key={t.id || i} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-slate-500">{t.role} • {t.branch}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{24 + i * 4} Active Clients</span>
                  <div className="text-emerald-600 font-medium text-[11px] mt-0.5">⭐ 4.9 Rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Report Shortcuts Footer */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Dedicated Analytical Deep Dives
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/gym/analytics/members"
            className="p-3 rounded-lg bg-white border border-slate-200 hover:border-navy-700 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-semibold text-slate-900 text-xs block">Member Analytics</span>
              <span className="text-[11px] text-slate-500">Cohorts & Churn</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900" />
          </Link>

          <Link
            to="/gym/analytics/attendance"
            className="p-3 rounded-lg bg-white border border-slate-200 hover:border-navy-700 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-semibold text-slate-900 text-xs block">Attendance Analytics</span>
              <span className="text-[11px] text-slate-500">Peak hours & traffic</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900" />
          </Link>

          <Link
            to="/gym/analytics/revenue"
            className="p-3 rounded-lg bg-white border border-slate-200 hover:border-navy-700 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-semibold text-slate-900 text-xs block">Financial Analytics</span>
              <span className="text-[11px] text-slate-500">P&L & collections</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900" />
          </Link>

          <Link
            to="/gym/analytics/custom-reports"
            className="p-3 rounded-lg bg-white border border-slate-200 hover:border-navy-700 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-semibold text-slate-900 text-xs block">Custom Report Builder</span>
              <span className="text-[11px] text-slate-500">Create & export</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900" />
          </Link>
        </div>
      </div>
    </div>
  );
}
