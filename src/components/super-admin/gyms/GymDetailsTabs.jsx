import { useState } from 'react';
import { Building2, CreditCard, Eye, Globe, Mail, MapPin, Phone, Users } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import DataTable from '../../tables/DataTable';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';
import GymStatusBadge from './GymStatusBadge';
import SubscriptionBadge from './SubscriptionBadge';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'info', label: 'Gym Information' },
  { key: 'branches', label: 'Branches' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'members', label: 'Members' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'logs', label: 'Activity Logs' },
];

export function GymDetailsTabs({ gym, onChangePlan }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [nextPlan, setNextPlan] = useState(gym?.subscription?.plan || 'Pro');

  if (!gym) return null;

  const branchColumns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="text-xs font-mono text-slate-400">{row.id}</p>
        </div>
      ),
    },
    { key: 'manager', header: 'Branch Manager' },
    { key: 'city', header: 'City' },
    {
      key: 'totalMembers',
      header: 'Members',
      align: 'right',
      numeric: true,
      render: (row) => formatNumber(row.totalMembers),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={Eye}
          onClick={() => setSelectedBranch(row)}
        >
          Details
        </Button>
      ),
    },
  ];

  const memberColumns = [
    {
      key: 'id',
      header: 'Member ID',
      numeric: true,
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: 'name',
      header: 'Member Name',
      render: (row) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    { key: 'plan', header: 'Membership Plan' },
    { key: 'branch', header: 'Branch' },
    {
      key: 'joinedAt',
      header: 'Joined',
      render: (row) => formatDate(row.joinedAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const transactionColumns = [
    {
      key: 'id',
      header: 'Transaction ID',
      numeric: true,
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    { key: 'description', header: 'Description' },
    {
      key: 'date',
      header: 'Date',
      render: (row) => formatDate(row.date),
    },
    { key: 'method', header: 'Payment Method' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      numeric: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Gym details tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: formatNumber(gym.totalMembers), icon: Users },
              { label: 'Active Members', value: formatNumber(gym.activeMembers), icon: Users },
              { label: 'Total Branches', value: String(gym.branches?.length || 0), icon: Building2 },
              { label: 'Monthly Revenue', value: formatCurrency(gym.monthlyRevenue), icon: CreditCard },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-1.5 font-display text-2xl font-bold text-slate-800 tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-900">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              );
            })}
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
            <h2 className="text-base font-semibold text-slate-800">Recent Activities</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Latest administrative and billing updates for {gym.name}
            </p>
            {gym.activityLogs?.length ? (
              <ul className="divide-y divide-slate-100">
                {gym.activityLogs.slice(0, 5).map((log) => (
                  <li key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{log.action}</p>
                      <p className="text-xs text-slate-500">By {log.actor}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {log.timestamp}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recent activities recorded.</p>
            )}
          </section>
        </div>
      )}

      {/* 2. Gym Information */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Gym & Contact Information
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> Business Email
                </dt>
                <dd className="font-medium text-slate-800">{gym.businessEmail}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> Contact Number
                </dt>
                <dd className="font-mono text-slate-800">{gym.contactNumber}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> Alternate Number
                </dt>
                <dd className="font-mono text-slate-800">{gym.alternateContact || '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" /> Website
                </dt>
                <dd className="font-medium text-navy-800">{gym.website || '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">GST Number</dt>
                <dd className="font-mono text-slate-800">{gym.gstNumber || 'Not Provided'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Owner & Registered Address
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Owner Full Name</dt>
                <dd className="font-medium text-slate-800">{gym.owner?.fullName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Owner Email</dt>
                <dd className="font-medium text-slate-800">{gym.owner?.email}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Owner Mobile</dt>
                <dd className="font-mono text-slate-800">{gym.owner?.mobile}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100">
                <dt className="text-slate-500 flex items-center gap-2 shrink-0">
                  <MapPin className="h-4 w-4 text-slate-400" /> Address
                </dt>
                <dd className="text-right text-slate-800">
                  {gym.address?.fullAddress}, {gym.address?.city}, {gym.address?.state}{' '}
                  {gym.address?.pinCode}, {gym.address?.country}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {/* 3. Branches */}
      {activeTab === 'branches' && (
        <DataTable
          columns={branchColumns}
          data={gym.branches || []}
          emptyTitle="No branches configured"
          emptyDescription="Add a branch or edit this gym to configure club locations."
        />
      )}

      {/* 4. Subscription */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-slate-800">
                  Current Subscription
                </h2>
                <SubscriptionBadge plan={gym.subscription?.plan} />
                <GymStatusBadge status={gym.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="font-medium text-slate-800 tabular-nums mt-0.5">
                    {formatDate(gym.subscription?.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expiry Date</p>
                  <p className="font-medium text-slate-800 tabular-nums mt-0.5">
                    {formatDate(gym.subscription?.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Billing Cycle</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {gym.subscription?.billingCycle} ({formatCurrency(gym.subscription?.monthlyFee)}/mo)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Quotas</p>
                  <p className="font-mono text-xs font-medium text-slate-800 tabular-nums mt-1">
                    {formatNumber(gym.subscription?.maxMembers)} members · {gym.subscription?.maxBranches} branches
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNextPlan(gym.subscription?.plan || 'Pro');
                setPlanModalOpen(true);
              }}
            >
              Upgrade / Downgrade Plan
            </Button>
          </section>

          <DataTable
            columns={transactionColumns}
            data={gym.transactions || []}
            emptyTitle="No subscription payments yet"
            emptyDescription="Subscription invoices and payment attempts will appear here."
          />
        </div>
      )}

      {/* 5. Members */}
      {activeTab === 'members' && (
        <DataTable
          columns={memberColumns}
          data={gym.members || []}
          emptyTitle="No members synced in preview"
          emptyDescription="Members enrolled across this gym's branches will appear here."
        />
      )}

      {/* 6. Transactions */}
      {activeTab === 'transactions' && (
        <DataTable
          columns={transactionColumns}
          data={gym.transactions || []}
          emptyTitle="No transactions recorded"
          emptyDescription="Platform subscription settlements and billing records will appear here."
        />
      )}

      {/* 7. Activity Logs */}
      {activeTab === 'logs' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Administrative Activity Logs
          </h2>
          {gym.activityLogs?.length ? (
            <ol className="relative space-y-4 border-l border-slate-200 ml-2 pl-5">
              {gym.activityLogs.map((log) => (
                <li key={log.id} className="relative">
                  <span
                    className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-navy-800"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-sm font-medium text-slate-800">{log.action}</p>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Actor: {log.actor}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">No activity logs recorded.</p>
          )}
        </section>
      )}

      {/* Branch Details Modal */}
      <Modal
        isOpen={Boolean(selectedBranch)}
        onClose={() => setSelectedBranch(null)}
        title={selectedBranch?.name || 'Branch Details'}
        description={selectedBranch ? `${selectedBranch.id} · ${gym.name}` : ''}
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedBranch(null)}>
            Close
          </Button>
        }
      >
        {selectedBranch && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Branch Manager</dt>
              <dd className="font-medium text-slate-900">{selectedBranch.manager}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">City</dt>
              <dd className="font-medium text-slate-900">{selectedBranch.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Contact</dt>
              <dd className="font-mono text-slate-900">{selectedBranch.contact}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Members</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatNumber(selectedBranch.totalMembers)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={selectedBranch.status} />
              </dd>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <dt className="text-xs text-slate-500 mb-1">Address</dt>
              <dd className="text-slate-800">{selectedBranch.address}</dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* Upgrade / Downgrade Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Change Subscription Plan"
        description={`Select a new plan tier for ${gym.name}.`}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                onChangePlan?.(nextPlan);
                setPlanModalOpen(false);
              }}
            >
              Confirm Plan Change
            </Button>
          </>
        }
      >
        <Select
          label="Subscription Tier"
          value={nextPlan}
          onChange={(e) => setNextPlan(e.target.value)}
          options={[
            { value: 'Starter', label: 'Starter (₹2,999/mo)' },
            { value: 'Pro', label: 'Pro (₹5,999/mo)' },
            { value: 'Enterprise', label: 'Enterprise (₹14,999/mo)' },
          ]}
        />
      </Modal>
    </div>
  );
}

export default GymDetailsTabs;
