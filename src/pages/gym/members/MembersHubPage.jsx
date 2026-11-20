import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  Plus,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import {
  MemberGrowthChart,
  MembershipStatusDistributionChart,
} from '../../../components/gym/members/MemberCharts';
import MemberDirectorySection from '../../../components/gym/members/MemberDirectorySection';
import { MEMBER_DATE_RANGES } from '../../../constants/memberManagementData';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { cn } from '../../../utils/cn';
import { formatNumber } from '../../../utils/formatters';

const QUICK_TABS = [
  { key: 'all', label: 'All Members' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'expired', label: 'Expired' },
];

export function MembersHubPage() {
  const navigate = useNavigate();
  const { activeTenant, activeBranch } = useTenant();
  const { scopedMembers } = useMemberManagement();

  const [dateRangeKey, setDateRangeKey] = useState('30d');
  const [statusTab, setStatusTab] = useState('all');

  const activeRange = useMemo(
    () => MEMBER_DATE_RANGES.find((r) => r.key === dateRangeKey) || MEMBER_DATE_RANGES[1],
    [dateRangeKey]
  );

  const metrics = useMemo(() => {
    const total = scopedMembers.length;
    const active = scopedMembers.filter((m) => m.status === 'active').length;
    const inactive = scopedMembers.filter((m) => m.status === 'inactive').length;
    const expired = scopedMembers.filter((m) => m.status === 'expired').length;
    const male = scopedMembers.filter((m) => m.gender === 'Male').length;
    const female = scopedMembers.filter((m) => m.gender === 'Female').length;

    const expiringSoon = scopedMembers.filter((m) => {
      if (m.status !== 'active' || !m.expiryDate) return false;
      const diffDays = (new Date(m.expiryDate) - new Date('2026-11-19')) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    const newRegistrations = Math.max(
      1,
      Math.round(
        scopedMembers.filter((m) => (m.joiningDate || '').startsWith('2026-11')).length *
          activeRange.scale
      )
    );

    return {
      total,
      active,
      newRegistrations,
      inactive,
      expired,
      expiringSoon,
      male,
      female,
    };
  }, [scopedMembers, activeRange.scale]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        description={`Manage gym members, registrations, profiles and membership records · ${activeTenant.name} (${activeBranch.name})`}
        actions={
          <>
            <Select
              aria-label="Member analytics date range"
              value={dateRangeKey}
              onChange={(e) => setDateRangeKey(e.target.value)}
              containerClassName="w-40"
              className="h-9 text-xs"
              options={MEMBER_DATE_RANGES.map((r) => ({ value: r.key, label: r.label }))}
            />
            <Button
              variant="emerald"
              leftIcon={Plus}
              onClick={() => navigate('/gym/members/add')}
            >
              Add New Member
            </Button>
          </>
        }
      />

      {/* Quick Filter Tabs + Dedicated Status Page Links */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center rounded-lg border border-slate-200 bg-white p-1 gap-1">
          {QUICK_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                statusTab === tab.key
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <Link to="/gym/members/active" className="hover:text-emerald-700">
            Active View →
          </Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to="/gym/members/inactive" className="hover:text-emerald-700">
            Inactive View →
          </Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to="/gym/members/expired" className="hover:text-emerald-700">
            Expired View →
          </Link>
        </div>
      </div>

      {/* 8 Member KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={formatNumber(metrics.total)}
          change="+8.4%"
          trend="up"
          helperText="scoped roster"
          icon={Users}
        />
        <StatCard
          label="Active Members"
          value={formatNumber(metrics.active)}
          change={`${metrics.total ? Math.round((metrics.active / metrics.total) * 100) : 0}%`}
          trend="up"
          helperText="active passes"
          icon={UserCheck}
        />
        <StatCard
          label="New Registrations"
          value={formatNumber(metrics.newRegistrations)}
          change={activeRange.label}
          trend="up"
          helperText="period signups"
          icon={UserPlus}
        />
        <StatCard
          label="Inactive Members"
          value={formatNumber(metrics.inactive)}
          trend="neutral"
          helperText="draft or dormant"
          icon={UserMinus}
        />
        <StatCard
          label="Expired Members"
          value={formatNumber(metrics.expired)}
          trend={metrics.expired > 0 ? 'down' : 'neutral'}
          helperText="requires renewal"
          icon={UserX}
        />
        <StatCard
          label="Expiring Soon"
          value={formatNumber(metrics.expiringSoon)}
          trend="neutral"
          helperText="within 30 days"
          icon={Clock}
        />
        <StatCard
          label="Male Members"
          value={formatNumber(metrics.male)}
          trend="neutral"
          helperText={`${metrics.total ? Math.round((metrics.male / metrics.total) * 100) : 0}% of roster`}
          icon={Users}
        />
        <StatCard
          label="Female Members"
          value={formatNumber(metrics.female)}
          trend="neutral"
          helperText={`${metrics.total ? Math.round((metrics.female / metrics.total) * 100) : 0}% of roster`}
          icon={AlertCircle}
        />
      </div>

      {/* Member Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <MemberGrowthChart
            dateScale={activeRange.scale}
            activeCount={metrics.active}
            expiredCount={metrics.expired}
          />
        </div>
        <div className="xl:col-span-5">
          <MembershipStatusDistributionChart members={scopedMembers} />
        </div>
      </div>

      {/* All Members Directory */}
      <MemberDirectorySection
        members={scopedMembers}
        statusTab={statusTab}
        onStatusTabChange={setStatusTab}
      />
    </div>
  );
}

export default MembersHubPage;
