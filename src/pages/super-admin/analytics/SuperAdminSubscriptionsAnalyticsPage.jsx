import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Sparkles,
  ArrowLeft,
  Clock,
  Activity,
  CheckCircle2,
  Download,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
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

const COLORS = ['#14213D', '#10B981', '#E5A93C'];

export default function SuperAdminSubscriptionsAnalyticsPage() {
  const planDistribution = [
    { name: 'Enterprise Pro (₹39,990/yr)', value: 8 },
    { name: 'Growth Club (₹24,990/yr)', value: 7 },
    { name: 'Starter Tier (₹14,990/yr)', value: 3 },
  ];

  const renewalsNext90Days = [
    { month: 'December 2026', count: 3, value: 89000 },
    { month: 'January 2027', count: 5, value: 145000 },
    { month: 'February 2027', count: 4, value: 112000 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Subscriptions & Tier Distribution"
        description="Subscriber renewal schedules, trial conversion rates, plan tier popularity, and contract tenures."
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
          <span className="text-xs text-slate-500 uppercase font-medium">Active Paid Plans</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">16 Gyms</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Active Free Trials</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">4 Gyms</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Trial Conversion Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">78.5%</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Expired / Not Renewed</span>
          <div className="text-2xl font-bold text-rose-500 mt-1">2 Gyms</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            SaaS Tier Share by Paying Tenants
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                >
                  {planDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Upcoming SaaS Renewals (Next 90 Days)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renewalsNext90Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="value" name="Renewal Value (INR)" fill="#14213D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
