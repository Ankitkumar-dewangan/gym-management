import { useState } from 'react';
import {
  Bell,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function MemberSettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Preference toggles
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsCheckin: true,
    whatsappWorkouts: true,
    promoOffers: false,
    publicLeaderboard: true,
    shareTrainerLogs: true,
    weightUnit: 'kg',
  });

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference updated!');
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Successfully signed out');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Member Account & Preferences"
        description="Configure your security credentials, notification channels, visual themes, and personal privacy settings."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'account', label: 'Security & Password', icon: KeyRound },
          { id: 'notifications', label: 'Alert Preferences', icon: Bell },
          { id: 'privacy', label: 'Privacy & Sharing', icon: Shield },
          { id: 'actions', label: 'Account Actions', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Security & Password */}
      {activeTab === 'account' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">Password & Authentication</h3>
            <p className="text-xs text-slate-500">Protect your gym member profile with multi-factor authentication.</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Account Password</h4>
              <p className="text-xs text-slate-500">Last updated 3 months ago</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-500">Require an SMS OTP when logging into new browsers</p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              Enabled
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">Notification Channels</h3>
            <p className="text-xs text-slate-500">Choose how and when you receive club alerts.</p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'emailAlerts', title: 'Email Invoices & Membership Alerts', desc: 'Receive tax receipts, renewals, and expiration warnings.' },
              { key: 'smsCheckin', title: 'SMS Check-in Receipts', desc: 'Instant text notification each time you scan through the entrance kiosk.' },
              { key: 'whatsappWorkouts', title: 'WhatsApp Workout & Diet Reminders', desc: 'Daily nutrition logs and coach updates via verified WhatsApp business.' },
              { key: 'promoOffers', title: 'Club Promotions & Merchandise Discounts', desc: 'Occasional promotional updates and guest pass discounts.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prefs[item.key] ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Privacy & Sharing */}
      {activeTab === 'privacy' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">Privacy & Community Settings</h3>
            <p className="text-xs text-slate-500">Control who can see your workout stats and attendance records.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <h4 className="font-bold text-xs text-slate-800">Show on Gym Attendance Leaderboard</h4>
                <p className="text-[11px] text-slate-500">Display your attendance streak on the Downtown Arena lobby screen.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('publicLeaderboard')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  prefs.publicLeaderboard ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <h4 className="font-bold text-xs text-slate-800">Share Progress with Assigned Trainer</h4>
                <p className="text-[11px] text-slate-500">Permit Coach Vikram Singh to inspect your weight charts and diet logs.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('shareTrainerLogs')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  prefs.shareTrainerLogs ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Account Actions */}
      {activeTab === 'actions' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">Session & Membership Actions</h3>
            <p className="text-xs text-slate-500">Manage your active portal session or request member deactivation.</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Log Out of Portal</h4>
              <p className="text-[11px] text-slate-500">End your current authenticated session.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={LogOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-rose-50/70 rounded-xl border border-rose-200">
            <div>
              <h4 className="font-bold text-xs text-rose-900">Request Membership Cancellation</h4>
              <p className="text-[11px] text-rose-700">Submit a formal cancellation request to club administration.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Request Cancellation
            </Button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Account Password"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success('Account password updated successfully!');
            setShowPasswordModal(false);
          }}
          className="p-6 space-y-4"
        >
          <Input label="Current Password" type="password" required />
          <Input label="New Password" type="password" required />
          <Input label="Confirm New Password" type="password" required />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Membership Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Membership Cancellation Request"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <p>
            You currently have <strong>55 days remaining</strong> on your Annual Elite Unlimited Access plan. Early termination is subject to club refund terms.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Keep My Membership
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toast.success('Cancellation request submitted to front desk.');
                setShowDeleteModal(false);
              }}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberSettingsPage;
