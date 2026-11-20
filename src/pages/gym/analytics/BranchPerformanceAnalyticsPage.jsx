import { useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Award,
  Download,
  Printer,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import AnalyticsFilterBar from '../../../components/gym/analytics/AnalyticsFilterBar';
import { useTenant } from '../../../contexts/TenantContext';

export default function BranchPerformanceAnalyticsPage() {
  const { branches } = useTenant();
  const [selectedBranchModal, setSelectedBranchModal] = useState(null);

  // Branch data matrix
  const branchData = (branches || []).map((b, idx) => ({
    id: b.id,
    name: b.name,
    manager: ['Kavita Reddy', 'Arjun Saxena', 'Pooja Bhatt'][idx] || 'Branch Manager',
    members: [84, 62, 54][idx] || 45,
    activeMembers: [74, 52, 46][idx] || 38,
    newMembers: [12, 8, 6][idx] || 4,
    revenue: [245000, 165000, 110000][idx] || 85000,
    expenses: [68000, 44000, 30000][idx] || 25000,
    netProfit: ([245000, 165000, 110000][idx] || 85000) - ([68000, 44000, 30000][idx] || 25000),
    attendance: [82, 58, 48][idx] || 40,
    performance: ['Top Performer ⭐', 'High Growth 🚀', 'Stable Operations'][idx] || 'Operating',
  }));

  const totalBranches = branchData.length;
  const totalMembers = branchData.reduce((s, b) => s + b.members, 0);
  const totalRevenue = branchData.reduce((s, b) => s + b.revenue, 0);
  const totalExpenses = branchData.reduce((s, b) => s + b.expenses, 0);
  const avgAttendance = 68;

  const exportBranchCSV = () => {
    const headers = ['Branch Name', 'Manager', 'Total Members', 'Active Members', 'Revenue (INR)', 'Expenses (INR)', 'Net Profit (INR)', 'Avg Attendance', 'Status'];
    const rows = branchData.map((b) => [
      `"${b.name}"`,
      `"${b.manager}"`,
      b.members,
      b.activeMembers,
      b.revenue,
      b.expenses,
      b.netProfit,
      b.attendance,
      `"${b.performance}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Branch_Performance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Branch Performance Analytics"
        description="Comparative branch-level revenue realizations, membership density, footfall traffic, and profitability matrices."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportBranchCSV}>
              Export Branch CSV
            </Button>
          </div>
        }
      />

      <AnalyticsFilterBar onExportCSV={exportBranchCSV} onPrint={() => window.print()} />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Branches', value: totalBranches, icon: Building2, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Active Facilities', value: totalBranches, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Platform Members', value: totalMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Consolidated Rev', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Facility Costs', value: `₹${totalExpenses.toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg Daily Footfall', value: `${avgAttendance} Check-ins`, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
              <div className="mt-2 text-xl font-bold text-slate-900 truncate">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Profit by Branch */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Revenue vs. Net Surplus by Center</h3>
            <span className="text-xs text-slate-400">Financial P&L</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#14213D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="netProfit" name="Net Profit" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Members & Attendance */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Active Members vs. Daily Visits</h3>
            <span className="text-xs text-slate-400">Capacity Load</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeMembers" name="Active Members" fill="#0EA5E9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="attendance" name="Daily Check-ins" fill="#E5A93C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Branch Comparative Performance Matrix</h3>
            <p className="text-xs text-slate-500">Cross-center analysis of revenue generation, member volume, and margins</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Branch Name</th>
                <th className="px-4 py-2.5">Branch Manager</th>
                <th className="px-4 py-2.5">Members (Active)</th>
                <th className="px-4 py-2.5">Revenue</th>
                <th className="px-4 py-2.5">Expenses</th>
                <th className="px-4 py-2.5">Net Profit</th>
                <th className="px-4 py-2.5">Attendance</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchData.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/75">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{b.name}</td>
                  <td className="px-4 py-2.5">{b.manager}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    {b.members} <span className="text-emerald-700">({b.activeMembers})</span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">₹{b.revenue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 text-red-500 font-medium">₹{b.expenses.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700">₹{b.netProfit.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 font-medium">{b.attendance} / day</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[11px]">
                      {b.performance}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      leftIcon={Eye}
                      onClick={() => setSelectedBranchModal(b)}
                    >
                      Audit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Audit Modal */}
      {selectedBranchModal && (
        <Modal
          isOpen={Boolean(selectedBranchModal)}
          onClose={() => setSelectedBranchModal(null)}
          title={`Branch Performance Audit: ${selectedBranchModal.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Center Lead:</span>
                <span className="font-semibold text-slate-900">{selectedBranchModal.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Membership Base:</span>
                <span className="font-bold text-navy-800">{selectedBranchModal.activeMembers} Members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">New Members (30d):</span>
                <span className="font-semibold text-emerald-700">+{selectedBranchModal.newMembers} Signups</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Net Margin:</span>
                <span className="font-bold text-emerald-700">
                  {Math.round((selectedBranchModal.netProfit / selectedBranchModal.revenue) * 100)}% Profit Margin
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">Performance Grade: A+</span>
                <span className="text-emerald-700 text-[11px]">Zero customer dispute escalations recorded</span>
              </div>
              <Award className="w-6 h-6 text-emerald-600" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedBranchModal(null)}
            >
              Close Audit
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
