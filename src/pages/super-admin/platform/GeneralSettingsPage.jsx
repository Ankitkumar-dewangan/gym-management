import { useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../../../components/common/BrandLogo';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';
import { cn } from '../../../utils/cn';

const SETTINGS_TABS = [
  { id: 'platform', label: 'Platform Information' },
  { id: 'branding', label: 'Branding' },
  { id: 'localization', label: 'Localization' },
  { id: 'currency', label: 'Currency' },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'notifications', label: 'Notification Settings' },
  { id: 'security', label: 'Security Settings' },
  { id: 'maintenance', label: 'Maintenance Mode' },
];

export function GeneralSettingsPage() {
  const { settings, updateSettings } = usePlatformManagement();
  const [activeTab, setActiveTab] = useState('platform');
  const [form, setForm] = useState(settings);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    toast.success('Platform settings saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        description="Configure platform identity, AGP Empire branding, localization, currency, security, and maintenance controls."
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tab Rail */}
        <aside className="lg:col-span-3 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-left rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-navy-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Right Form Panel */}
        <section className="lg:col-span-9 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
          {activeTab === 'platform' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Platform Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Name"
                  value={form.platformName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, platformName: e.target.value }))
                  }
                />
                <Input
                  label="Legal Entity"
                  value={form.companyLegalName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyLegalName: e.target.value }))
                  }
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supportEmail: e.target.value }))
                  }
                />
                <Input
                  label="Support Phone"
                  value={form.supportPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supportPhone: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Branding Configuration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enterprise identity and Powered by AGP Empire attribution
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-3">
                  <BrandLogo variant="dark" />
                  <span className="text-xs text-slate-500">· Powered by AGP Empire</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform Name"
                  value={form.platformName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, platformName: e.target.value }))
                  }
                />
                <Input
                  label="Footer Attribution"
                  value={form.poweredByText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, poweredByText: e.target.value }))
                  }
                  hint="Displayed across sidebar and portal footers"
                />
                <Input
                  label="Platform Logo URL"
                  placeholder="https://cdn.example.com/logo.svg"
                  value={form.platformLogoUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, platformLogoUrl: e.target.value }))
                  }
                />
                <Input
                  label="Favicon URL"
                  placeholder="https://cdn.example.com/favicon.ico"
                  value={form.faviconUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, faviconUrl: e.target.value }))
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, primaryColor: e.target.value }))
                      }
                      className="h-10 w-12 rounded-lg border border-slate-300 bg-white p-1 cursor-pointer"
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, primaryColor: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, secondaryColor: e.target.value }))
                      }
                      className="h-10 w-12 rounded-lg border border-slate-300 bg-white p-1 cursor-pointer"
                    />
                    <Input
                      value={form.secondaryColor}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, secondaryColor: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Localization</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Default Language"
                  value={form.defaultLanguage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, defaultLanguage: e.target.value }))
                  }
                  options={[
                    { value: 'English (US)', label: 'English (US)' },
                    { value: 'English (UK)', label: 'English (UK)' },
                    { value: 'English (IN)', label: 'English (India)' },
                  ]}
                />
                <Select
                  label="Default Operating Region"
                  value={form.defaultCountry}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, defaultCountry: e.target.value }))
                  }
                  options={[
                    { value: 'United States', label: 'United States' },
                    { value: 'India', label: 'India' },
                    { value: 'United Kingdom', label: 'United Kingdom' },
                    { value: 'Canada', label: 'Canada' },
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Currency</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Default Billing Currency"
                  value={form.currencyCode}
                  onChange={(e) => {
                    const map = { INR: '₹', USD: '$', GBP: '£', EUR: '€' };
                    setForm((p) => ({
                      ...p,
                      currencyCode: e.target.value,
                      currencySymbol: map[e.target.value] || '₹',
                    }));
                  }}
                  options={[
                    { value: 'INR', label: 'INR — Indian Rupee (₹)' },
                    { value: 'USD', label: 'USD — US Dollar ($)' },
                    { value: 'GBP', label: 'GBP — British Pound (£)' },
                    { value: 'EUR', label: 'EUR — Euro (€)' },
                  ]}
                />
                <Input
                  label="Currency Symbol"
                  value={form.currencySymbol}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currencySymbol: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {activeTab === 'datetime' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Date & Time</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Platform Timezone"
                  value={form.timezone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, timezone: e.target.value }))
                  }
                  options={[
                    { value: 'America/Los_Angeles (UTC-08:00)', label: 'America/Los_Angeles (UTC-08:00)' },
                    { value: 'America/New_York (UTC-05:00)', label: 'America/New_York (UTC-05:00)' },
                    { value: 'Asia/Kolkata (UTC+05:30)', label: 'Asia/Kolkata (UTC+05:30)' },
                    { value: 'UTC', label: 'UTC' },
                  ]}
                />
                <Select
                  label="Date Format"
                  value={form.dateFormat}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dateFormat: e.target.value }))
                  }
                  options={[
                    { value: 'MMM DD, YYYY', label: 'Nov 19, 2026' },
                    { value: 'DD/MM/YYYY', label: '19/11/2026' },
                    { value: 'YYYY-MM-DD', label: '2026-11-19' },
                  ]}
                />
                <Select
                  label="Time Format"
                  value={form.timeFormat}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, timeFormat: e.target.value }))
                  }
                  options={[
                    { value: '12-hour', label: '12-hour (AM/PM)' },
                    { value: '24-hour', label: '24-hour' },
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Notification Settings
              </h2>
              <div className="divide-y divide-slate-100">
                {[
                  { key: 'emailAlertsEnabled', label: 'Email Billing & Renewal Alerts' },
                  { key: 'smsAlertsEnabled', label: 'SMS Urgent Payment Notifications' },
                  { key: 'whatsappAlertsEnabled', label: 'WhatsApp Gym Owner Reminders' },
                  { key: 'billingDigestDaily', label: 'Daily Executive Revenue Digest' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between py-3 text-sm cursor-pointer"
                  >
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(form[item.key])}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [item.key]: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-navy-700"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Security Settings
              </h2>
              <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm cursor-pointer">
                <span className="font-medium text-slate-800">
                  Enforce Two-Factor Authentication for Super Admins
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(form.enforce2FAForAdmins)}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      enforce2FAForAdmins: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-navy-700"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Session Idle Timeout (Minutes)"
                  type="number"
                  min="15"
                  value={form.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      sessionTimeoutMinutes: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Minimum Password Length"
                  type="number"
                  min="8"
                  value={form.passwordMinLength}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, passwordMinLength: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Maintenance Mode
              </h2>
              <label className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-sm cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">
                    Enable Platform Maintenance Banner
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Displays scheduled maintenance notice across tenant portals.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.maintenanceMode)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, maintenanceMode: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-navy-700"
                />
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Maintenance Notice Message
                </label>
                <textarea
                  rows={3}
                  value={form.maintenanceMessage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, maintenanceMessage: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">Powered by AGP Empire</span>
            <Button type="submit" variant="emerald" leftIcon={Save}>
              Save Settings
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}

export default GeneralSettingsPage;
