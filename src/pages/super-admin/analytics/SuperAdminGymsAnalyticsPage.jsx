import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import { useGymManagement } from '../../../contexts/GymManagementContext';

export default function SuperAdminGymsAnalyticsPage() {
  const { gyms } = useGymManagement();

  const cityDistribution = [
    { city: 'Mumbai', gyms: 8, activeMembers: 1950 },
    { city: 'Delhi NCR', gyms: 7, activeMembers: 1720 },
    { city: 'Bengaluru', gyms: 5, activeMembers: 1240 },
    { city: 'Pune', gyms: 4, activeMembers: 890 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Organizations Analytics"
        description="Tenant distribution by geography, tier adoption, and member density per facility."
        actions={
          <div className="flex gap-2">
            <Link to="/super-admin/analytics">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Platform Overview
              </Button>
            </Link>
            <Button variant="primary" size="sm" leftIcon={Download} onClick={() => alert('Exporting gym metrics...')}>
              Export Gym Data
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Total Gym Organizations</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">24 Gyms</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Multi-Branch Gyms</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">16 Gyms</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Avg Members / Gym</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">350 Members</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-medium">Avg Branches / Tenant</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">2.4 Branches</div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          City-wise Gym Cluster Distribution
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="city" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="gyms" name="Gym Centers" fill="#14213D" radius={[3, 3, 0, 0]} />
              <Bar dataKey="activeMembers" name="Total Members Enrolled" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
