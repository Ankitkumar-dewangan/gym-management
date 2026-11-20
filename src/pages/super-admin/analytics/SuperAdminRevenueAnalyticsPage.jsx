import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
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

export default function SuperAdminRevenueAnalyticsPage() {
  const mrrSeries = [
    { month: 'Jun', mrr: 185000, newMrr: 24000, churnMrr: 4000 },
    { month: 'Jul', mrr: 198000, newMrr: 20000, churnMrr: 7000 },
    { month: 'Aug', mrr: 212000, newMrr: 22000, churnMrr: 8000 },
    { month: 'Sep', mrr: 228000, newMrr: 25000, churnMrr: 9000 },
    { month: 'Oct', mrr: 239000, newMrr: 18000, churnMrr: 7000 },
    { month: 'Nov', mrr: 248000, newMrr: 16000, churnMrr: 7000 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Revenue & MRR Growth Analytics"
        description="Platform subscription billing, net revenue retention (NRR), churn loss, and customer lifetime value (LTV)."
        actions={
          <div className="flex gap-2">
            <Link to="/super-admin/analytics">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Platform Overview
              </Button>
            </Link>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={() => alert('Exporting SaaS revenue metrics...')}>
              Export SaaS Financials
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Monthly Recurring Revenue</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹2,48,000</div>
          <span className="text-xs text-emerald-600 mt-0.5 block font-medium">+11.4% vs last month</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Annualized Run-Rate (ARR)</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">₹29,76,000</div>
          <span className="text-xs text-slate-400 mt-0.5 block">12x projected run-rate</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Net Revenue Retention (NRR)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">114.2%</div>
          <span className="text-xs text-emerald-700 mt-0.5 block">Expansion outpaces churn</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Avg Revenue Per Gym (ARPU)</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">₹13,770 / mo</div>
          <span className="text-xs text-slate-400 mt-0.5 block">Across 18 paying tenants</span>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          MRR Expansion vs. Churn Breakdown (INR)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mrrSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="newMrr" name="New Expansion MRR" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="churnMrr" name="Lost Churn MRR" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
