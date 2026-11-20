import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Save,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

const PREFERENCE_CATEGORIES = [
  { id: 'member_registration', label: 'Member Registration', desc: 'Alerts when a new member enrolls or signs contract' },
  { id: 'membership_expiry', label: 'Membership Expiry', desc: 'Upcoming 3-day and same-day contract expirations' },
  { id: 'payment_received', label: 'Payment Received', desc: 'Instant confirmations of dues collections and receipts' },
  { id: 'pending_payment', label: 'Pending & Overdue Dues', desc: 'Overdue balance alerts and auto-debit failure notices' },
  { id: 'attendance_alerts', label: 'Attendance & Gate Reader', desc: 'Peak capacity thresholds and turnstile offline events' },
  { id: 'trainer_updates', label: 'Trainer & Staff Sessions', desc: 'PT hour completions and trainer schedule logs' },
  { id: 'expense_approvals', label: 'Expense Approvals', desc: 'New facility bills and vendor disbursements requiring sign-off' },
  { id: 'system_updates', label: 'System & Security', desc: 'Software patch releases, backups, and security audits' },
  { id: 'announcements', label: 'Club Announcements', desc: 'Broadcasted tournament notices and holiday closures' },
];

export default function NotificationSettingsPage() {
  const { preferences, saveAllPreferences, resetPreferences } = useGymAnalyticsNotifications();
  const [form, setForm] = useState(preferences || {});

  const handleToggle = (category, channel) => {
    setForm((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [channel]: !prev[category]?.[channel],
      },
    }));
  };

  const handleToggleAll = (val) => {
    const updated = {};
    PREFERENCE_CATEGORIES.forEach((c) => {
      updated[c.id] = { inApp: val, email: val, whatsapp: val };
    });
    setForm(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveAllPreferences(form);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Notification Preferences & Channels"
        description="Configure automated alert triggers, multi-channel dispatch policies, and urgent notifications."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/notifications">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Notifications
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={() => {
                resetPreferences();
                setForm(preferences);
              }}
            >
              Reset Defaults
            </Button>
            <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        }
      />

      {/* Global Actions Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">Bulk Channel Toggles</h4>
          <p className="text-xs text-slate-500">Quickly enable or disable all notification dispatches.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="xs" onClick={() => handleToggleAll(true)}>
            Enable All Channels
          </Button>
          <Button variant="outline" size="xs" onClick={() => handleToggleAll(false)}>
            Disable All
          </Button>
        </div>
      </div>

      {/* Preferences Matrix */}
      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Event Trigger Category</th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5 font-bold text-navy-900">
                    <Bell className="w-3.5 h-3.5" /> In-App Alert
                  </span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                    <Mail className="w-3.5 h-3.5" /> Email Digest
                  </span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp API
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PREFERENCE_CATEGORIES.map((cat) => {
                const p = form[cat.id] || { inApp: true, email: true, whatsapp: false };

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900 text-sm">{cat.label}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{cat.desc}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(p.inApp)}
                        onChange={() => handleToggle(cat.id, 'inApp')}
                        className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(p.email)}
                        onChange={() => handleToggle(cat.id, 'email')}
                        className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(p.whatsapp)}
                        onChange={() => handleToggle(cat.id, 'whatsapp')}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Preferences are automatically stored in browser local state for live simulation.</span>
          <Button variant="primary" size="sm" type="submit" leftIcon={Save}>
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
