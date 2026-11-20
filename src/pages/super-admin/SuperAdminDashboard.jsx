import { useMemo, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import ActivityTimeline from '../../components/super-admin/ActivityTimeline';
import AdminStatCard from '../../components/super-admin/AdminStatCard';
import GymGrowthChart from '../../components/super-admin/GymGrowthChart';
import PlatformWidgetsRow from '../../components/super-admin/PlatformWidgetsRow';
import QuickActions from '../../components/super-admin/QuickActions';
import RecentGymsTable from '../../components/super-admin/RecentGymsTable';
import RecentTransactionsTable from '../../components/super-admin/RecentTransactionsTable';
import RegistrationChart from '../../components/super-admin/RegistrationChart';
import RevenueChart from '../../components/super-admin/RevenueChart';
import SubscriptionChart from '../../components/super-admin/SubscriptionChart';
import SubscriptionOverview from '../../components/super-admin/SubscriptionOverview';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import {
  GYM_GROWTH_SERIES,
  GYM_REGISTRATION_SERIES,
  RECENT_GYM_REGISTRATIONS,
  RECENT_TRANSACTIONS,
  REVENUE_12M_DATA,
  SUBSCRIPTION_DISTRIBUTION_DATA,
  SUPER_ADMIN_KPIS,
} from '../../constants/superAdminData';
import { useDisclosure } from '../../hooks/useDisclosure';

const DATE_RANGE_OPTIONS = [
  { value: '12m', label: 'Last 12 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '3m', label: 'Last 90 Days' },
];

export function SuperAdminDashboard() {
  const [dateRange, setDateRange] = useState('12m');
  const [gyms, setGyms] = useState(RECENT_GYM_REGISTRATIONS);
  const registerModal = useDisclosure(false);

  const [newGym, setNewGym] = useState({
    name: '',
    ownerName: '',
    email: '',
    city: '',
    plan: 'Pro',
    branches: '1',
  });

  const revenueSlice = useMemo(() => {
    if (dateRange === '3m') return REVENUE_12M_DATA.slice(-3);
    if (dateRange === '6m') return REVENUE_12M_DATA.slice(-6);
    return REVENUE_12M_DATA;
  }, [dateRange]);

  const registrationSlice = useMemo(() => {
    if (dateRange === '3m') return GYM_REGISTRATION_SERIES.slice(-3);
    if (dateRange === '6m') return GYM_REGISTRATION_SERIES.slice(-6);
    return GYM_REGISTRATION_SERIES;
  }, [dateRange]);

  const rangeLabel =
    DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ||
    'Last 12 Months';

  const handleApproveGym = (gym) => {
    setGyms((prev) =>
      prev.map((item) =>
        item.id === gym.id ? { ...item, status: 'active' } : item
      )
    );
    toast.success(`${gym.name} approved and activated`);
  };

  const handleRejectGym = (gym) => {
    setGyms((prev) =>
      prev.map((item) =>
        item.id === gym.id ? { ...item, status: 'rejected' } : item
      )
    );
    toast.error(`${gym.name} registration rejected`);
  };

  const handleCreateGym = (e) => {
    e.preventDefault();
    if (!newGym.name.trim() || !newGym.ownerName.trim() || !newGym.email.trim()) {
      toast.error('Please fill in gym name, owner name, and email');
      return;
    }

    const words = newGym.name.trim().split(/\s+/);
    const initials = (
      (words[0]?.[0] || 'G') + (words[1]?.[0] || words[0]?.[1] || 'M')
    ).toUpperCase();

    const created = {
      id: `GYM-${Math.floor(2050 + Math.random() * 900)}`,
      initials,
      logoColor: '#14213D',
      name: newGym.name.trim(),
      ownerName: newGym.ownerName.trim(),
      email: newGym.email.trim(),
      registeredAt: '2026-11-19',
      plan: newGym.plan,
      branches: Math.max(1, Number(newGym.branches) || 1),
      city: newGym.city.trim() || 'Remote, US',
      status: 'pending',
    };

    setGyms((prev) => [created, ...prev]);
    setNewGym({
      name: '',
      ownerName: '',
      email: '',
      city: '',
      plan: 'Pro',
      branches: '1',
    });
    registerModal.close();
    toast.success(`Registered ${created.name} for approval`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <PageHeader
        title="Platform Dashboard"
        description="Executive overview of registered gyms, recurring revenue, subscriptions, and platform activity."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex items-center">
              <Calendar
                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <Select
                aria-label="Select analytics date range"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  const label = DATE_RANGE_OPTIONS.find(
                    (o) => o.value === e.target.value
                  )?.label;
                  toast.success(`Analytics window: ${label}`);
                }}
                options={DATE_RANGE_OPTIONS}
                className="pl-9 w-44"
              />
            </div>

            <Button variant="emerald" leftIcon={Plus} onClick={registerModal.open}>
              Register New Gym
            </Button>
          </div>
        }
      />

      {/* 8 KPI Cards */}
      <section aria-label="Platform key metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPER_ADMIN_KPIS.map((kpi) => (
            <AdminStatCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              previousLabel={kpi.previousLabel}
              change={kpi.change}
              trend={kpi.trend}
              icon={kpi.icon}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Row 1: Revenue Overview & Gym Registrations */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <RevenueChart data={revenueSlice} rangeLabel={rangeLabel} />
        </div>
        <div className="xl:col-span-5">
          <RegistrationChart data={registrationSlice} />
        </div>
      </div>

      {/* Charts Row 2: Subscription Distribution, Gym Growth & Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <SubscriptionChart data={SUBSCRIPTION_DISTRIBUTION_DATA} />
        </div>
        <div className="lg:col-span-4">
          <GymGrowthChart data={GYM_GROWTH_SERIES} />
        </div>
        <div className="lg:col-span-4">
          <SubscriptionOverview />
        </div>
      </div>

      {/* Operational Widgets: Pending Approvals, Expiries, Support Tickets */}
      <PlatformWidgetsRow
        gyms={gyms}
        onApprove={handleApproveGym}
        onReject={handleRejectGym}
      />

      {/* Recent Gym Registrations Table */}
      <RecentGymsTable
        gyms={gyms}
        onApprove={handleApproveGym}
        onReject={handleRejectGym}
      />

      {/* Recent Transactions & Activity Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <RecentTransactionsTable transactions={RECENT_TRANSACTIONS} />
        </div>
        <div className="xl:col-span-4">
          <ActivityTimeline />
        </div>
      </div>

      {/* Register New Gym Modal */}
      <Modal
        isOpen={registerModal.isOpen}
        onClose={registerModal.close}
        title="Register New Gym"
        description="Add a new gym organization to the platform onboarding queue."
      >
        <form onSubmit={handleCreateGym} className="space-y-4">
          <Input
            label="Gym Name"
            placeholder="e.g. Harbor Strength Club"
            value={newGym.name}
            onChange={(e) => setNewGym((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner Name"
              placeholder="e.g. Jordan Blake"
              value={newGym.ownerName}
              onChange={(e) =>
                setNewGym((p) => ({ ...p, ownerName: e.target.value }))
              }
              required
            />
            <Input
              label="Owner Email"
              type="email"
              placeholder="owner@gymclub.com"
              value={newGym.email}
              onChange={(e) =>
                setNewGym((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="Austin, TX"
              value={newGym.city}
              onChange={(e) => setNewGym((p) => ({ ...p, city: e.target.value }))}
            />
            <Select
              label="Plan"
              value={newGym.plan}
              onChange={(e) => setNewGym((p) => ({ ...p, plan: e.target.value }))}
              options={[
                { value: 'Starter', label: 'Starter (₹2,999/mo)' },
                { value: 'Pro', label: 'Pro (₹5,999/mo)' },
                { value: 'Enterprise', label: 'Enterprise (₹14,999/mo)' },
              ]}
            />
            <Input
              label="Branches"
              type="number"
              min="1"
              value={newGym.branches}
              onChange={(e) =>
                setNewGym((p) => ({ ...p, branches: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={registerModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Create Gym
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
