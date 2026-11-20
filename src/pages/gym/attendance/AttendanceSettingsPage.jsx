import { useState } from 'react';
import { Bell, Building2, Clock, QrCode, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAttendanceManagement } from '../../../contexts/AttendanceManagementContext';
import { useBranchManagement } from '../../../contexts/BranchManagementContext';
import { cn } from '../../../utils/cn';

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer',
          checked ? 'bg-emerald-600' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

export function AttendanceSettingsPage() {
  const { tenantBranches } = useBranchManagement();
  const {
    tenantSettings,
    getBranchCapacity,
    updateSettings,
    updateBranchCapacity,
    resetSettings,
  } = useAttendanceManagement();

  const [draft, setDraft] = useState(tenantSettings);
  const [capacities, setCapacities] = useState(() => {
    const map = {};
    tenantBranches.forEach((b) => {
      map[b.id] = getBranchCapacity(b.id);
    });
    return map;
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(draft);
    Object.entries(capacities).forEach(([branchId, cap]) => {
      updateBranchCapacity(branchId, cap);
    });
    toast.success('Attendance settings saved to browser demo state');
  };

  const handleReset = () => {
    resetSettings();
    toast.success('Attendance settings restored to defaults');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <PageHeader
        title="Attendance Settings"
        subtitle="Configure QR check-in rules, duplicate prevention, allowed hours, branch capacities, and alerts."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" leftIcon={RotateCcw} onClick={handleReset}>
              Reset Defaults
            </Button>
            <Button type="submit" variant="emerald" size="sm" leftIcon={Save}>
              Save Settings
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access & Validation Rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <QrCode className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">QR & Front-Desk Rules</h2>
          </div>

          <SettingToggle
            label="QR Attendance"
            description="Allow members and kiosks to check in and out via camera QR pass scanning."
            checked={Boolean(draft.qrAttendanceEnabled)}
            onChange={(val) => setDraft((p) => ({ ...p, qrAttendanceEnabled: val }))}
          />
          <SettingToggle
            label="Manual Attendance"
            description="Allow front-desk staff and managers to record or adjust entries manually."
            checked={Boolean(draft.manualAttendanceEnabled)}
            onChange={(val) => setDraft((p) => ({ ...p, manualAttendanceEnabled: val }))}
          />
          <SettingToggle
            label="Membership Validation on Check-in"
            description="Block QR check-in automatically if a membership is expired, frozen, or inactive."
            checked={Boolean(draft.requireMembershipValidation)}
            onChange={(val) => setDraft((p) => ({ ...p, requireMembershipValidation: val }))}
          />
          <SettingToggle
            label="Check-out Requirement"
            description="Track active floor occupancy until members check out or are closed out by staff."
            checked={Boolean(draft.requireCheckout)}
            onChange={(val) => setDraft((p) => ({ ...p, requireCheckout: val }))}
          />
          <SettingToggle
            label="Duplicate Check-in Restriction"
            description="Prevent checking in a member who already has an active inside-gym session."
            checked={Boolean(draft.preventDuplicateCheckin)}
            onChange={(val) => setDraft((p) => ({ ...p, preventDuplicateCheckin: val }))}
          />
        </div>

        {/* Operating Hours & Grace Period */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="h-4 w-4 text-navy-900" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">Allowed Attendance Time & Grace Period</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Opening Check-in Time"
                type="time"
                value={draft.allowedStartTime || '05:00'}
                onChange={(e) => setDraft((p) => ({ ...p, allowedStartTime: e.target.value }))}
              />
              <Input
                label="Closing Cut-off Time"
                type="time"
                value={draft.allowedEndTime || '23:00'}
                onChange={(e) => setDraft((p) => ({ ...p, allowedEndTime: e.target.value }))}
              />
              <Input
                label="Grace Period (Minutes)"
                type="number"
                min="0"
                max="120"
                value={draft.gracePeriodMinutes ?? 15}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, gracePeriodMinutes: Number(e.target.value) || 0 }))
                }
              />
            </div>

            <p className="text-xs text-slate-500">
              Grace period applies to late class entries and post-closing check-out exits without triggering compliance alerts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <Bell className="h-4 w-4 text-navy-900" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">Attendance Notifications</h2>
            </div>

            <SettingToggle
              label="Check-in Confirmation Alerts"
              description="Show instant kiosk toast and session logs when a member checks in."
              checked={Boolean(draft.notifyOnCheckin)}
              onChange={(val) => setDraft((p) => ({ ...p, notifyOnCheckin: val }))}
            />
            <SettingToggle
              label="Expired Membership Alert"
              description="Flag front desk immediately when an expired pass is scanned."
              checked={Boolean(draft.notifyOnExpiryDeny)}
              onChange={(val) => setDraft((p) => ({ ...p, notifyOnExpiryDeny: val }))}
            />
            <SettingToggle
              label="Correction Request Escalations"
              description="Notify branch managers when members submit attendance correction requests."
              checked={Boolean(draft.notifyManagerOnCorrection)}
              onChange={(val) => setDraft((p) => ({ ...p, notifyManagerOnCorrection: val }))}
            />
          </div>
        </div>
      </div>

      {/* Branch-Specific Floor Capacity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">Branch-Specific Gym Capacity</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Used for Live Gym Occupancy percentage calculations</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tenantBranches.map((branch) => (
            <div key={branch.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900 truncate">{branch.name}</p>
              <p className="text-xs text-slate-500">{branch.city}</p>
              <Input
                label="Max Concurrent Members"
                type="number"
                min="10"
                max="1000"
                value={capacities[branch.id] ?? getBranchCapacity(branch.id)}
                onChange={(e) =>
                  setCapacities((prev) => ({
                    ...prev,
                    [branch.id]: Number(e.target.value) || 10,
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

export default AttendanceSettingsPage;
