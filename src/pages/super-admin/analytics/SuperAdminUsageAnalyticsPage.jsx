import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Users,
  Layers,
  ArrowLeft,
  Download,
  CheckCircle2,
  Cpu,
  BarChart2,
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

export default function SuperAdminUsageAnalyticsPage() {
  const moduleAdoption = [
    { module: 'Attendance & Gate Reader', activeTenants: 22, usageScore: 98 },
    { module: 'Fee Collections & UPI', activeTenants: 21, usageScore: 94 },
    { module: 'Member Management', activeTenants: 24, usageScore: 100 },
    { module: 'Workout & Exercise Planner', activeTenants: 18, usageScore: 82 },
    { module: 'Diet & Nutrition Library', activeTenants: 15, usageScore: 70 },
    { module: 'Trainer & Staff Payroll', activeTenants: 16, usageScore: 75 },
    { module: 'Reports & Analytics', activeTenants: 20, usageScore: 90 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Usage & Feature Adoption"
        description="Tenant telemetry, module engagement indexes, concurrent check-in loads, and product utilization."
        actions={
          <div className="flex gap-2">
            <Link to="/super-admin/analytics">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Platform Overview
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Platform End Members</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">8,420 Members</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Monthly Active Users (MAU)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">7,420 Users</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Daily API Telemetry Calls</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">142,000 / day</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Most Adopted Module</span>
          <div className="text-base font-bold text-blue-600 mt-2 truncate">Gate Turnstile Reader</div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Module Adoption & Usage Index across 24 Tenants
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleAdoption} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="module" stroke="#64748B" fontSize={10} width={130} />
              <Tooltip formatter={(val) => `${val}% adoption`} />
              <Bar dataKey="usageScore" name="Utilization Score (%)" fill="#14213D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
