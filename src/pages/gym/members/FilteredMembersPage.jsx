import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, Plus, UserCheck, UserMinus, UserX } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/ui/Button';
import MemberDirectorySection from '../../../components/gym/members/MemberDirectorySection';
import { useMemberManagement } from '../../../contexts/MemberManagementContext';
import { useTenant } from '../../../contexts/TenantContext';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

const PRESET_CONFIG = {
  active: {
    title: 'Active Members',
    description: 'Members holding an active gym pass with floor and coaching access.',
    icon: UserCheck,
  },
  inactive: {
    title: 'Inactive Members',
    description: 'Draft enrollments and dormant member accounts pending reactivation.',
    icon: UserMinus,
  },
  expired: {
    title: 'Expired Members',
    description: 'Members whose plan cycle has ended and require renewal follow-up.',
    icon: UserX,
  },
};

export function FilteredMembersPage({ presetStatus = 'active' }) {
  const navigate = useNavigate();
  const { activeTenant, activeBranch } = useTenant();
  const { scopedMembers } = useMemberManagement();

  const meta = PRESET_CONFIG[presetStatus] || PRESET_CONFIG.active;

  const matching = useMemo(
    () => scopedMembers.filter((m) => m.status === presetStatus),
    [scopedMembers, presetStatus]
  );

  const summary = useMemo(() => {
    const monthlyValue = matching.reduce((sum, m) => sum + (m.monthlyFee || 0), 0);
    const pendingDues = matching.reduce((sum, m) => sum + (m.pendingDues || 0), 0);
    const avgVisits = matching.length
      ? Math.round(matching.reduce((sum, m) => sum + (m.monthlyAttendance || 0), 0) / matching.length)
      : 0;
    return { count: matching.length, monthlyValue, pendingDues, avgVisits };
  }, [matching]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description={`${meta.description} · ${activeTenant.name} (${activeBranch.name})`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/gym/members')}
            >
              All Members
            </Button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`${meta.title} Count`}
          value={formatNumber(summary.count)}
          helperText="in current scope"
          icon={meta.icon}
        />
        <StatCard
          label="Plan Value"
          value={formatCurrency(summary.monthlyValue)}
          helperText="monthly recurring"
          icon={CreditCard}
        />
        <StatCard
          label="Pending Dues"
          value={formatCurrency(summary.pendingDues)}
          trend={summary.pendingDues > 0 ? 'down' : 'neutral'}
          helperText="open balances"
          icon={Clock}
        />
        <StatCard
          label="Avg Monthly Visits"
          value={formatNumber(summary.avgVisits)}
          helperText="check-ins per member"
          icon={UserCheck}
        />
      </div>

      <MemberDirectorySection members={matching} presetStatus={presetStatus} />
    </div>
  );
}

export default FilteredMembersPage;
