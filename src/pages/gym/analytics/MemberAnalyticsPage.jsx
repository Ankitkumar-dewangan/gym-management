import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  PauseCircle,
  RefreshCw,
  TrendingUp,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
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
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import AnalyticsFilterBar from '../../../components/gym/analytics/AnalyticsFilterBar';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { AGE_DISTRIBUTION_DATA } from '../../../constants/gymAnalyticsNotificationsData';

const COLORS = ['#14213D', '#10B981', '#E5A93C', '#EF4444', '#0EA5E9', '#8B5CF6'];

export default function MemberAnalyticsPage() {
  const { members } = useMemberManagement();
  const { branches } = useTenant();
  const { globalFilters } = useGymAnalyticsNotifications();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filter scoped
  const filteredMembers = useMemo(() => {
    return (members || []).filter((m) => {
      const matchSearch =
        !search ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.id?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === 'all' || m.status?.toLowerCase() === selectedStatus.toLowerCase();
      const matchBranch = globalFilters.branch === 'all' || m.branch === globalFilters.branch;
      const matchPlan = globalFilters.plan === 'all' || m.planName === globalFilters.plan;

      return matchSearch && matchStatus && matchBranch && matchPlan;
    });
  }, [members, search, selectedStatus, globalFilters]);

  // Metrics
  const totalCount = filteredMembers.length;
  const activeCount = filteredMembers.filter((m) => m.status === 'active').length;
  const inactiveCount = filteredMembers.filter((m) => m.status === 'inactive').length;
  const newCount = filteredMembers.filter((m) => m.joinDate && m.joinDate.startsWith('2026-11')).length || 14;
  const expiredCount = filteredMembers.filter((m) => m.status === 'expired').length;
  const frozenCount = filteredMembers.filter((m) => m.status === 'suspended' || m.status === 'on_hold').length || 3;
  const renewalRate = 84.5;
  const retentionRate = 91.2;

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize);

  // Charts Data
  const monthlyRegData = [
    { month: 'Jun', signups: 16 },
    { month: 'Jul', signups: 22 },
    { month: 'Aug', signups: 19 },
    { month: 'Sep', signups: 28 },
    { month: 'Oct', signups: 34 },
    { month: 'Nov', signups: newCount },
  ];

  const statusDistribution = [
    { name: 'Active', value: activeCount || 145 },
    { name: 'Inactive', value: inactiveCount || 24 },
    { name: 'Expired', value: expiredCount || 18 },
    { name: 'Frozen / Hold', value: frozenCount || 5 },
  ];

  const genderData = [
    { name: 'Male', value: 58 },
    { name: 'Female', value: 40 },
    { name: 'Other', value: 2 },
  ];

  const branchGrowth = (branches || []).map((b, i) => ({
    branch: b.name.replace(' Branch', '').replace(' Fitness Hub', ''),
    active: [82, 60, 48][i] || 40,
    new: [14, 8, 6][i] || 5,
  }));

  const exportMembersCSV = () => {
    const headers = ['Member ID', 'Name', 'Branch', 'Plan', 'Join Date', 'Expiry Date', 'Status'];
    const rows = filteredMembers.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${m.branch || 'Downtown'}"`,
      `"${m.planName || 'Annual All-Access'}"`,
      m.joinDate || '2026-01-15',
      m.expiryDate || '2026-12-31',
      m.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Member_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Analytics & Demographics"
        description="Comprehensive insights on member acquisition, retention curves, membership tiers, and demographic distributions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportMembersCSV}>
              Export Member Data
            </Button>
          </div>
        }
      />

      {/* Global Filter Bar */}
      <AnalyticsFilterBar onExportCSV={exportMembersCSV} onPrint={() => window.print()} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total', value: totalCount, icon: Users, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', value: inactiveCount, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
          { label: 'New MTD', value: newCount, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Expired', value: expiredCount, icon: UserX, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Frozen', value: frozenCount, icon: PauseCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Renewal %', value: `${renewalRate}%`, icon: RefreshCw, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Retention', value: `${retentionRate}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
              <div className="mt-2 text-lg font-bold text-slate-900">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Registration Trend */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Registration Trend</h3>
            <span className="text-xs text-slate-400">Signups</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRegData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#14213D" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Membership Status Share</h3>
            <span className="text-xs text-slate-400">Breakdown</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={['#10B981', '#64748B', '#EF4444', '#F59E0B'][i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Age Cohort Distribution</h3>
            <span className="text-xs text-slate-400">Demographics</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AGE_DISTRIBUTION_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="group" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Members" fill="#14213D" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Member Directory & Reports Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Member Analytical Directory</h3>
            <p className="text-xs text-slate-500">Filtered member roster with payment records and expiry audit</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member ID, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
              />
            </div>

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Member ID</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Branch</th>
                <th className="px-4 py-2.5">Membership Plan</th>
                <th className="px-4 py-2.5">Join Date</th>
                <th className="px-4 py-2.5">Expiry Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No members found matching filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-medium text-navy-800">{m.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{m.name}</td>
                    <td className="px-4 py-2.5">{m.branch || 'Downtown Main Arena'}</td>
                    <td className="px-4 py-2.5 text-slate-700">{m.planName || 'Annual All-Access'}</td>
                    <td className="px-4 py-2.5">{m.joinDate || '2026-01-15'}</td>
                    <td className="px-4 py-2.5 font-medium">{m.expiryDate || '2026-12-31'}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.status === 'expired'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={Eye}
                        onClick={() => setSelectedMember(m)}
                      >
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredMembers.length)} of{' '}
            {filteredMembers.length} members
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="font-semibold px-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <Modal
          isOpen={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
          title={`Member Profile Analytics: ${selectedMember.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-mono font-bold text-navy-800">{selectedMember.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span>{selectedMember.email || `${selectedMember.name.toLowerCase().replace(' ', '.')}@example.com`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span>{selectedMember.branch || 'Downtown Main Arena'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Plan:</span>
                <span className="font-semibold text-slate-900">{selectedMember.planName || 'Annual All-Access'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Membership Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedMember.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-slate-500 block">Attendance Rate</span>
                <span className="text-base font-bold text-emerald-700">86% Regular</span>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg border border-navy-100">
                <span className="text-slate-500 block">Total Lifetime Paid</span>
                <span className="text-base font-bold text-navy-900">₹28,500</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link to={`/gym/members/${selectedMember.id}`} className="flex-1">
                <Button variant="primary" className="w-full">
                  Full Member Record
                </Button>
              </Link>
              <Button variant="outline" className="flex-1" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
