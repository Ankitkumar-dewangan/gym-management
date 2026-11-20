import { useState, useMemo } from 'react';
import {
  FileCheck2,
  CalendarCheck,
  Clock,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  Download,
  Printer,
  Search,
  Filter,
} from 'lucide-react';
import {
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
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

const DONUT_COLORS = ['#14213D', '#10B981', '#E5A93C', '#0EA5E9', '#8B5CF6'];

export default function MembershipAnalyticsPage() {
  const { members } = useMemberManagement();
  const { plans } = useMembershipManagement();
  const { globalFilters } = useGymAnalyticsNotifications();

  const [search, setSearch] = useState('');

  // Calculations
  const scopedMembers = useMemo(() => {
    return (members || []).filter((m) => {
      const matchBranch = globalFilters.branch === 'all' || m.branch === globalFilters.branch;
      const matchPlan = globalFilters.plan === 'all' || m.planName === globalFilters.plan;
      return matchBranch && matchPlan;
    });
  }, [members, globalFilters]);

  const activeMemberships = scopedMembers.filter((m) => m.status === 'active').length || 188;
  const newMemberships = 24;
  const renewedMemberships = 38;
  const expiredMemberships = scopedMembers.filter((m) => m.status === 'expired').length || 18;
  const upcomingExpiries = 12;
  const renewalRate = 86.4;

  // Charts
  const durationDistribution = [
    { duration: '1 Month', count: 28 },
    { duration: '3 Months', count: 48 },
    { duration: '6 Months', count: 34 },
    { duration: '12 Months (Annual)', count: 98 },
  ];

  const renewalVsExpiryData = [
    { month: 'Jun', renewed: 24, expired: 6 },
    { month: 'Jul', renewed: 28, expired: 8 },
    { month: 'Aug', renewed: 30, expired: 7 },
    { month: 'Sep', renewed: 35, expired: 5 },
    { month: 'Oct', renewed: 40, expired: 8 },
    { month: 'Nov', renewed: renewedMemberships, expired: expiredMemberships },
  ];

  const planShare = [
    { name: 'Annual All-Access', value: 48 },
    { name: 'Quarterly Strength', value: 28 },
    { name: 'Monthly Flex', value: 16 },
    { name: 'VIP Coaching Elite', value: 8 },
  ];

  const exportMembershipsCSV = () => {
    const headers = ['Member Name', 'Plan Name', 'Join Date', 'Expiry Date', 'Status', 'Paid Amount (INR)'];
    const rows = scopedMembers.map((m) => [
      `"${m.name}"`,
      `"${m.planName || 'Annual All-Access'}"`,
      m.joinDate || '2026-01-15',
      m.expiryDate || '2026-12-31',
      m.status,
      24000,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Membership_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Analytics & Plan Distribution"
        description="Monitor active contract durations, renewal conversion ratios, plan popularity, and churn hazards."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportMembershipsCSV}>
              Export Membership Data
            </Button>
          </div>
        }
      />

      <AnalyticsFilterBar onExportCSV={exportMembershipsCSV} onPrint={() => window.print()} />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Active Plans', value: activeMemberships, icon: FileCheck2, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'New Signups MTD', value: newMemberships, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Renewals MTD', value: renewedMemberships, icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Expired MTD', value: expiredMemberships, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Upcoming Expiries', value: upcomingExpiries, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Renewal Rate', value: `${renewalRate}%`, icon: RefreshCw, color: 'text-teal-600', bg: 'bg-teal-50' },
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
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Renewal vs Expiry */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Renewals vs. Expirations</h3>
            <span className="text-xs text-slate-400">Monthly Ratio</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renewalVsExpiryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="renewed" name="Renewed" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expired" name="Expired" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Share Donut */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Plan Tier Share (%)</h3>
            <span className="text-xs text-slate-400">Subscribers</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planShare}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {planShare.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Plan Duration Breakdown</h3>
            <span className="text-xs text-slate-400">Tenure</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationDistribution} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="duration" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Enrolled Members" fill="#14213D" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Membership Audit Roster */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Membership Tier Ledger</h3>
            <p className="text-xs text-slate-500">Live roster with contract start, end dates, and renewal history</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Member Name</th>
                <th className="px-4 py-2.5">Plan Name</th>
                <th className="px-4 py-2.5">Start Date</th>
                <th className="px-4 py-2.5">Expiry Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scopedMembers.slice(0, 8).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/75">
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{m.name}</td>
                  <td className="px-4 py-2.5">{m.planName || 'Annual All-Access'}</td>
                  <td className="px-4 py-2.5">{m.joinDate || '2026-01-15'}</td>
                  <td className="px-4 py-2.5 font-medium">{m.expiryDate || '2026-12-31'}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">₹24,000</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
