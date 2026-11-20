import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
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
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { useGymManagement } from '../../../contexts/GymManagementContext';
import { SUPER_ADMIN_PLATFORM_STATS } from '../../../constants/gymAnalyticsNotificationsData';

const COLORS = ['#14213D', '#10B981', '#E5A93C', '#0EA5E9', '#8B5CF6'];

export default function SuperAdminAnalyticsPage() {
  const { subscriptions } = useSubscriptions();
  const { gyms } = useGymManagement();

  const stats = SUPER_ADMIN_PLATFORM_STATS;

  // Charts
  const mrrGrowthData = [
    { month: 'Jun', mrr: 185000, arr: 2220000 },
    { month: 'Jul', mrr: 198000, arr: 2376000 },
    { month: 'Aug', mrr: 212000, arr: 2544000 },
    { month: 'Sep', mrr: 228000, arr: 2736000 },
    { month: 'Oct', mrr: 239000, arr: 2868000 },
    { month: 'Nov', mrr: 248000, arr: 2976000 },
  ];

  const gymRegGrowth = [
    { month: 'Jun', total: 14, active: 13 },
    { month: 'Jul', total: 16, active: 15 },
    { month: 'Aug', total: 18, active: 17 },
    { month: 'Sep', total: 20, active: 19 },
    { month: 'Oct', total: 22, active: 20 },
    { month: 'Nov', total: 24, active: 21 },
  ];

  const planShare = [
    { name: 'Enterprise Pro', value: 42 },
    { name: 'Growth Club', value: 38 },
    { name: 'Starter Tier', value: 20 },
  ];

  const gymTable = (gyms || []).slice(0, 6).map((g, i) => ({
    name: g.name || 'Iron Paradise Gym Club',
    owner: g.ownerName || 'Rajiv Singhania',
    regDate: g.createdDate || '2026-02-10',
    plan: ['Enterprise Pro', 'Growth Club', 'Starter Tier'][i % 3],
    branches: g.branchCount || 3,
    members: [280, 195, 142, 98][i % 4] || 150,
    status: g.status || 'Active',
    revenue: ['₹84,000', '₹52,000', '₹36,000'][i % 3] || '₹45,000',
  }));

  const exportPlatformCSV = () => {
    const headers = ['Gym Name', 'Owner', 'Reg Date', 'Plan', 'Branches', 'Members', 'Status', 'SaaS Billing'];
    const rows = gymTable.map((g) => [
      `"${g.name}"`,
      `"${g.owner}"`,
      g.regDate,
      `"${g.plan}"`,
      g.branches,
      g.members,
      g.status,
      `"${g.revenue}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Platform_Overview_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Platform Analytics"
        description="Global multi-tenant platform intelligence, SaaS subscription growth, MRR expansion, and tenant usage metrics."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportPlatformCSV}>
              Export Platform CSV
            </Button>
          </div>
        }
      />

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Registered Gyms', value: stats.totalGyms, sub: `${stats.activeGyms} Active`, icon: Building2, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Platform Users', value: stats.totalUsers.toLocaleString(), sub: 'Across all gyms', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Subscribers', value: stats.activeSubscriptions, sub: `${stats.totalSubscribers} Total`, icon: FileCheck2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly ARR (MRR)', value: `₹${(stats.mrr / 1000).toFixed(0)}k`, sub: '+12.4% MoM', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Annual Run-Rate', value: `₹${(stats.arr / 100000).toFixed(1)}L`, sub: 'Projected ARR', icon: TrendingUp, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Platform Revenue', value: `₹${(stats.platformRevenue / 100000).toFixed(1)}L`, sub: 'Cumulative GMV', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'SaaS Churn Rate', value: `${stats.churnRate}%`, sub: 'Low industry benchmark', icon: TrendingDown, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Trial Gyms', value: '4 Gyms', sub: '14-day evaluation', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Inactive / Frozen', value: stats.inactiveGyms, sub: 'Payment past due', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Platform Health', value: '99.98%', sub: 'Zero outage SLA', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  {k.label}
                </span>
                <div className={`p-1 rounded ${k.bg} ${k.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">{k.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main SaaS MRR & Gym Expansion Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Recurring Revenue (MRR) Expansion</h3>
              <p className="text-xs text-slate-500">Subscription revenue growth trajectory in INR (₹)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700">₹{stats.mrr.toLocaleString('en-IN')}/mo</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="mrr" name="MRR (INR)" stroke="#14213D" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tenant Gym Onboarding Growth</h3>
              <p className="text-xs text-slate-500">Cumulative registered vs. active gyms</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gymRegGrowth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Onboarded" fill="#14213D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="active" name="Active Paid" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tenant Gyms Performance Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Top Registered Gym Organizations</h3>
            <p className="text-xs text-slate-500">SaaS subscription status, branch expansion, and member base</p>
          </div>
          <Link to="/super-admin/gyms" className="text-xs font-semibold text-navy-800 hover:underline">
            View All Gyms ({stats.totalGyms})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Gym Organization</th>
                <th className="px-4 py-2.5">Owner / Contact</th>
                <th className="px-4 py-2.5">Subscription Plan</th>
                <th className="px-4 py-2.5">Branches</th>
                <th className="px-4 py-2.5">Total Members</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Annual SaaS Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gymTable.map((g, idx) => (
                <tr key={idx} className="hover:bg-slate-50/75">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{g.name}</td>
                  <td className="px-4 py-2.5">{g.owner}</td>
                  <td className="px-4 py-2.5 font-medium text-navy-900">{g.plan}</td>
                  <td className="px-4 py-2.5">{g.branches} Centers</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{g.members}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700">{g.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-modules Navigation Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/super-admin/analytics/gyms"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-navy-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-semibold text-slate-900 text-xs block">Gym Analytics</span>
            <span className="text-[11px] text-slate-500">Cohort & branches</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/super-admin/analytics/revenue"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-navy-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-semibold text-slate-900 text-xs block">SaaS Revenue</span>
            <span className="text-[11px] text-slate-500">MRR, ARR & billing</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/super-admin/analytics/subscriptions"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-navy-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-semibold text-slate-900 text-xs block">Subscriptions</span>
            <span className="text-[11px] text-slate-500">Plans & trials</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/super-admin/analytics/usage"
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-navy-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-semibold text-slate-900 text-xs block">Platform Usage</span>
            <span className="text-[11px] text-slate-500">Feature adoption</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
