import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  DollarSign,
  IdCard,
  PauseCircle,
  Plus,
  RefreshCw,
  UserCheck,
  XCircle,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import {
  ExpiryTrendsChart,
  MembershipGrowthChart,
  MonthlyRenewalsChart,
  PlanDistributionChart,
} from '../../../components/gym/membership/MembershipCharts';
import { MEMBERSHIP_MEDIA } from '../../../constants/membershipManagementData';
import { useMembershipManagement } from '../../../contexts/MembershipManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';
import { calculateRemainingDays } from '../../../utils/membershipCalculations';

export function MembershipDashboardPage() {
  const navigate = useNavigate();
  const { activeTenant, activeBranch } = useTenant();
  const { tenantPlans, scopedMemberships } = useMembershipManagement();

  const metrics = useMemo(() => {
    const total = scopedMemberships.length;
    const active = scopedMemberships.filter((m) => m.status === 'active').length;
    const expired = scopedMemberships.filter((m) => m.status === 'expired').length;
    const frozen = scopedMemberships.filter((m) => m.status === 'frozen').length;
    const cancelled = scopedMemberships.filter((m) => m.status === 'cancelled').length;

    const expiringSoon = scopedMemberships.filter((m) => {
      if (m.status !== 'active') return false;
      const days = calculateRemainingDays(m.expiryDate);
      return days >= 0 && days <= 30;
    }).length;

    const renewedThisMonth = scopedMemberships.reduce((count, m) => {
      const novRenewals = (m.renewalHistory || []).filter((r) =>
        (r.renewalDate || '').startsWith('2026-11')
      ).length;
      return count + novRenewals;
    }, 0);

    const revenue = scopedMemberships.reduce((sum, m) => sum + (Number(m.paidAmount) || 0), 0);

    return {
      total,
      active,
      expiringSoon,
      expired,
      renewedThisMonth,
      frozen,
      cancelled,
      revenue,
    };
  }, [scopedMemberships]);

  const urgentExpiries = useMemo(
    () =>
      scopedMemberships
        .filter((m) => m.status === 'active')
        .map((m) => ({ ...m, remainingDays: calculateRemainingDays(m.expiryDate) }))
        .filter((m) => m.remainingDays >= 0 && m.remainingDays <= 30)
        .sort((a, b) => a.remainingDays - b.remainingDays)
        .slice(0, 5),
    [scopedMemberships]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Management"
        description={`Manage gym plans, subscriptions, renewals and member memberships · ${activeTenant.name} (${activeBranch.name})`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={IdCard}
              onClick={() => navigate('/gym/membership/plans')}
            >
              Membership Plans
            </Button>
            <Button
              variant="emerald"
              leftIcon={Plus}
              onClick={() => navigate('/gym/membership/assign')}
            >
              Assign Membership
            </Button>
          </>
        }
      />

      {/* Quick Module Shortcuts */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
            <img
              src={MEMBERSHIP_MEDIA.passCardBanner}
              alt="Gym membership pass"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {tenantPlans.filter((p) => p.status === 'active').length} Active Plans Configured
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Manage plan tiers, upcoming renewals, upgrades, freezes, and promotional coupons.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-700 shrink-0">
          <Link to="/gym/membership/active" className="hover:text-emerald-700">Active Memberships →</Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to="/gym/membership/upcoming-expiries" className="hover:text-emerald-700">Upcoming Expiries →</Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to="/gym/membership/renewals" className="hover:text-emerald-700">Renewals →</Link>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <Link to="/gym/membership/offers" className="hover:text-emerald-700">Offers →</Link>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Memberships"
          value={formatNumber(metrics.total)}
          helperText="scoped assignments"
          icon={IdCard}
        />
        <StatCard
          label="Active Memberships"
          value={formatNumber(metrics.active)}
          trend="up"
          change={`${metrics.total ? Math.round((metrics.active / metrics.total) * 100) : 0}%`}
          helperText="currently active"
          icon={UserCheck}
        />
        <StatCard
          label="Expiring Soon"
          value={formatNumber(metrics.expiringSoon)}
          trend={metrics.expiringSoon > 0 ? 'down' : 'neutral'}
          helperText="within 30 days"
          icon={Clock}
        />
        <StatCard
          label="Expired Memberships"
          value={formatNumber(metrics.expired)}
          trend={metrics.expired > 0 ? 'down' : 'neutral'}
          helperText="awaiting renewal"
          icon={AlertCircle}
        />
        <StatCard
          label="Renewed This Month"
          value={formatNumber(metrics.renewedThisMonth)}
          trend="up"
          change="+14.8%"
          helperText="Nov renewals"
          icon={RefreshCw}
        />
        <StatCard
          label="Frozen Memberships"
          value={formatNumber(metrics.frozen)}
          helperText="on approved hold"
          icon={PauseCircle}
        />
        <StatCard
          label="Cancelled Memberships"
          value={formatNumber(metrics.cancelled)}
          helperText="terminated plans"
          icon={XCircle}
        />
        <StatCard
          label="Membership Revenue"
          value={formatCurrency(metrics.revenue)}
          trend="up"
          change="+11.2%"
          helperText="collected fees"
          icon={DollarSign}
        />
      </div>

      {/* 4 Recharts Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MembershipGrowthChart />
        <PlanDistributionChart plans={tenantPlans} memberships={scopedMemberships} />
        <MonthlyRenewalsChart />
        <ExpiryTrendsChart />
      </div>

      {/* Upcoming Renewal Attention Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Priority Renewal Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active memberships expiring within the next 30 days
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/gym/membership/upcoming-expiries')}
          >
            View All Expiries
          </Button>
        </div>

        {urgentExpiries.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No memberships are expiring in the next 30 days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">Expiry Date</th>
                  <th className="px-4 py-3 font-medium">Remaining</th>
                  <th className="px-4 py-3 font-medium">Reminder</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentExpiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={item.memberAvatar} name={item.memberName} size="sm" />
                        <div>
                          <Link
                            to={`/gym/membership/${item.id}`}
                            className="font-medium text-slate-900 hover:text-emerald-700"
                          >
                            {item.memberName}
                          </Link>
                          <p className="text-xs font-mono text-slate-500">{item.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800">{item.planName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.branchName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{formatDate(item.expiryDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold tabular-nums text-amber-700">
                      {item.remainingDays === 0 ? 'Today' : `${item.remainingDays} days`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.reminderStatus === 'Sent' ? 'sent' : 'pending'} label={item.reminderStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => navigate(`/gym/membership/${item.id}`)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MembershipDashboardPage;
