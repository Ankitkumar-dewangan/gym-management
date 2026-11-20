import { useState } from 'react';
import {
  UserCog,
  Users,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Printer,
  CalendarCheck,
  Building2,
  DollarSign,
} from 'lucide-react';
import {
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
import { useTrainerStaff } from '../../../contexts/TrainerStaffContext';
import { useGymFinance } from '../../../contexts/GymFinanceContext';

const COLORS = ['#14213D', '#10B981', '#E5A93C', '#0EA5E9', '#8B5CF6'];

export default function TrainerStaffAnalyticsPage() {
  const { trainers, staff } = useTrainerStaff();
  const { payrollSalaries } = useGymFinance();

  // Metrics
  const totalTrainers = (trainers || []).length || 6;
  const activeTrainers = totalTrainers;
  const assignedMembersTotal = 84;
  const totalSessions = 160;
  const completedSessions = 148;
  const avgPerformance = 92.5;

  // Chart 1: Trainer Clients
  const trainerClientsData = [
    { name: 'Vikram Singh', clients: 28, completedSessions: 52 },
    { name: 'Rahul Deshmukh', clients: 22, completedSessions: 42 },
    { name: 'Maya Patel', clients: 18, completedSessions: 34 },
    { name: 'Simran Kaur', clients: 16, completedSessions: 20 },
  ];

  // Chart 2: Payroll Distribution
  const payrollDist = [
    { name: 'Strength Coaches', value: 45 },
    { name: 'Floor Trainers', value: 25 },
    { name: 'Front Desk', value: 18 },
    { name: 'Operations & Housekeeping', value: 12 },
  ];

  const exportTrainerCSV = () => {
    const headers = ['Trainer Name', 'Role', 'Branch', 'Assigned Members', 'Sessions Scheduled', 'Sessions Completed', 'Completion Rate', 'Rating'];
    const rows = trainerClientsData.map((t) => [
      `"${t.name}"`,
      '"Fitness Coach"',
      '"Downtown Main Arena"',
      t.clients,
      t.clients * 2,
      t.completedSessions,
      `${Math.round((t.completedSessions / (t.clients * 2)) * 100)}%`,
      '4.9',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Trainer_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainer & Staff Performance Analytics"
        description="Personal training engagement tracking, completed workout sessions, client retention ratios, and staff payroll allocation."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={exportTrainerCSV}>
              Export Performance CSV
            </Button>
          </div>
        }
      />

      <AnalyticsFilterBar onExportCSV={exportTrainerCSV} onPrint={() => window.print()} />

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Trainers', value: totalTrainers, icon: UserCog, color: 'text-navy-900', bg: 'bg-navy-50' },
          { label: 'Active on Floor', value: activeTrainers, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Assigned Clients', value: assignedMembersTotal, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Scheduled Sessions', value: totalSessions, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed Hours', value: completedSessions, icon: Award, color: 'text-gold-600', bg: 'bg-amber-50' },
          { label: 'Completion Rate', value: `${avgPerformance}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sessions Completed by Coach */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">PT Client Volume & Completed Sessions</h3>
            <span className="text-xs text-slate-400">Current Cycle</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainerClientsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" name="Assigned Clients" fill="#14213D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completedSessions" name="Sessions Completed" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Payroll Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Staff Compensation Allocation (%)</h3>
            <span className="text-xs text-slate-400">Monthly Budget</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                >
                  {payrollDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trainer Performance Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Trainer Productivity & Feedback Matrix</h3>
            <p className="text-xs text-slate-500">Live trainer attendance, member assignment count, and ratings</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Trainer Name</th>
                <th className="px-4 py-2.5">Branch</th>
                <th className="px-4 py-2.5">Active Clients</th>
                <th className="px-4 py-2.5">Scheduled Sessions</th>
                <th className="px-4 py-2.5">Completed Sessions</th>
                <th className="px-4 py-2.5">Fulfillment Rate</th>
                <th className="px-4 py-2.5">Member Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainerClientsData.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/75">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{t.name}</td>
                  <td className="px-4 py-2.5">Downtown Main Arena</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{t.clients} Members</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.clients * 2} Hrs</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-700">{t.completedSessions} Hrs</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                      {Math.round((t.completedSessions / (t.clients * 2)) * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-amber-500">⭐ 4.9 / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
