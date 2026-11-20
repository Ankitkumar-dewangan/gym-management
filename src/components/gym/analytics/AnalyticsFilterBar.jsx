import { useState } from 'react';
import { Filter, Calendar, Building2, Layers, RotateCcw, Download, Printer } from 'lucide-react';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function AnalyticsFilterBar({ onExportCSV, onPrint, extraActions }) {
  const { globalFilters, setGlobalFilter, resetGlobalFilters } = useGymAnalyticsNotifications();
  const { branches } = useTenant();

  const isCustomDate = globalFilters.dateRange === 'custom';

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Filter className="w-4 h-4 text-navy-800" />
          <span>Analytics Scope & Filters</span>
        </div>

        <div className="flex items-center gap-2">
          {extraActions}
          {onExportCSV && (
            <Button variant="outline" size="xs" leftIcon={Download} onClick={onExportCSV}>
              Export Data CSV
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="xs" leftIcon={Printer} onClick={onPrint}>
              Print Report
            </Button>
          )}
          <Button variant="ghost" size="xs" leftIcon={RotateCcw} onClick={resetGlobalFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Date Presets */}
        <div>
          <Select
            label="Time Period"
            value={globalFilters.dateRange}
            onChange={(e) => setGlobalFilter('dateRange', e.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'last_month', label: 'Last Month' },
              { value: 'quarter', label: 'Last 3 Months' },
              { value: 'year', label: 'This Year (FY 2026-27)' },
              { value: 'custom', label: 'Custom Date Range' },
            ]}
          />
        </div>

        {/* Branch Filter */}
        <div>
          <Select
            label="Branch"
            value={globalFilters.branch}
            onChange={(e) => setGlobalFilter('branch', e.target.value)}
            options={[
              { value: 'all', label: 'All Branches' },
              ...(branches || []).map((b) => ({ value: b.name, label: b.name })),
            ]}
          />
        </div>

        {/* Plan Filter */}
        <div>
          <Select
            label="Membership Plan"
            value={globalFilters.plan}
            onChange={(e) => setGlobalFilter('plan', e.target.value)}
            options={[
              { value: 'all', label: 'All Membership Plans' },
              { value: 'Annual All-Access Pass', label: 'Annual All-Access Pass' },
              { value: 'Quarterly Strength & Conditioning', label: 'Quarterly Strength' },
              { value: 'Monthly Functional Fitness', label: 'Monthly Functional' },
              { value: 'VIP Personal Coaching Elite', label: 'VIP Personal Coaching' },
              { value: 'Weekend Warrior Flex', label: 'Weekend Warrior Flex' },
            ]}
          />
        </div>

        {/* Custom Date Range if selected */}
        {isCustomDate ? (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              label="Start Date"
              value={globalFilters.customStartDate}
              onChange={(e) => setGlobalFilter('customStartDate', e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={globalFilters.customEndDate}
              onChange={(e) => setGlobalFilter('customEndDate', e.target.value)}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-end">
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
              <span>Filter Status:</span>
              <span className="font-semibold text-emerald-700">Active (Live Sync)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
