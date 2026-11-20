import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  FileText,
  Percent,
  QrCode,
  Save,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export function GymSettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    gstRate: '18',
    memberIdPrefix: 'MEM-',
    trainerIdPrefix: 'TRN-',
    defaultGracePeriodDays: '5',
    qrValidityMinutes: '10',
    maxDailyCheckins: '2',
    allowGuestPasses: true,
    autoInvoiceGeneration: true,
    autoSmsRenewals: true,
    whatsappReminders: true,
    biometricSyncInterval: '15',
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Gym operational settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Operational & Billing Settings"
        description="Configure tax computation, membership prefix conventions, check-in rules, and automated workflow triggers."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Billing & Tax Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary-600" /> Billing, Currency & Tax Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Operational Currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={[
                { value: 'INR', label: 'INR — Indian Rupee (₹)' },
              ]}
            />
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol}
              disabled
            />
            <Input
              label="Standard GST / Tax Rate (%)"
              type="number"
              value={settings.gstRate}
              onChange={(e) => setSettings({ ...settings, gstRate: e.target.value })}
              required
            />
            <Input
              label="Membership Grace Period (Days)"
              type="number"
              value={settings.defaultGracePeriodDays}
              onChange={(e) => setSettings({ ...settings, defaultGracePeriodDays: e.target.value })}
            />
          </div>
        </div>

        {/* Member & Attendance Rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" /> Member ID Prefix & Check-in Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Member ID Prefix"
              value={settings.memberIdPrefix}
              onChange={(e) => setSettings({ ...settings, memberIdPrefix: e.target.value })}
            />
            <Input
              label="Trainer ID Prefix"
              value={settings.trainerIdPrefix}
              onChange={(e) => setSettings({ ...settings, trainerIdPrefix: e.target.value })}
            />
            <Input
              label="QR Code Expiry Window (Min)"
              type="number"
              value={settings.qrValidityMinutes}
              onChange={(e) => setSettings({ ...settings, qrValidityMinutes: e.target.value })}
            />
            <Input
              label="Max Check-ins Per Day"
              type="number"
              value={settings.maxDailyCheckins}
              onChange={(e) => setSettings({ ...settings, maxDailyCheckins: e.target.value })}
            />
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" /> Automation & Communication Toggles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoInvoiceGeneration}
                onChange={(e) => setSettings({ ...settings, autoInvoiceGeneration: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Automatic GST Tax Invoices</p>
                <p className="text-xs text-slate-500">Auto-generate PDF receipt upon successful fee capture via Cash, UPI, or Card.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSmsRenewals}
                onChange={(e) => setSettings({ ...settings, autoSmsRenewals: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">SMS Renewal Broadcast</p>
                <p className="text-xs text-slate-500">Send automatic payment link 5 days before plan expiration date.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappReminders}
                onChange={(e) => setSettings({ ...settings, whatsappReminders: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">WhatsApp Nudge on Inactivity</p>
                <p className="text-xs text-slate-500">Trigger motivation message when member misses gym check-ins for 7 consecutive days.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowGuestPasses}
                onChange={(e) => setSettings({ ...settings, allowGuestPasses: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Permit 1-Day Guest Trial Passes</p>
                <p className="text-xs text-slate-500">Allow front-desk staff to issue single complimentary day passes for walk-in leads.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" leftIcon={Save}>
            Save Operational Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GymSettingsPage;
