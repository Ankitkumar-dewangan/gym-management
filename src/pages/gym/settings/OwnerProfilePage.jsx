import { useState } from 'react';
import {
  Bell,
  Building,
  Camera,
  CheckCircle2,
  Key,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Smartphone,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';

export function OwnerProfilePage() {
  const { user } = useAuth();
  const { activeTenant, activeBranch } = useTenant();

  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({
    name: user?.name || 'Vikram Malhotra',
    email: user?.email || 'vikram@mygymclub.com',
    phone: '+91 98201 44521',
    role: 'Gym Owner & Director',
    organization: activeTenant?.name || 'Pulse Fitness Studio',
    branch: activeBranch?.name || 'Downtown Main Arena',
    bio: 'Founder and managing director overseeing premium fitness facilities across Mumbai and Pune.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailRenewals: true,
    emailDailyReport: true,
    smsPaymentAlerts: true,
    whatsappEnquiries: true,
    soundAlerts: false,
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success('Profile details updated successfully!');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match or are empty');
      return;
    }
    toast.success('Security password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Profile & Account Settings"
        description="Manage your executive account credentials, communication preferences, and security settings."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" /> Personal Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Password
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleProfileSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card: Photo & Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 text-center">
            <div className="relative inline-block mx-auto">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-sm"
              />
              <button
                type="button"
                onClick={() => toast('Profile photo upload dialog')}
                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow hover:bg-primary-700"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-800">{profile.name}</h3>
              <p className="text-sm text-slate-500">{profile.role}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Gym Owner
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-left space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{profile.organization}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Branch: {profile.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Executive Profile Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
              <Input
                label="Official Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
              <Input
                label="Designation / Role"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                required
              />
              <Input
                label="Gym Brand"
                value={profile.organization}
                disabled
              />
              <Input
                label="Primary Base Branch"
                value={profile.branch}
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Professional Bio</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-hidden"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" leftIcon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handlePasswordSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary-600" /> Change Security Password
            </h3>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <div className="pt-2">
              <Button type="submit" leftIcon={Lock}>
                Update Password
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" /> Multi-Factor Authentication
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enhance login security across all gym branches by requiring an SMS or authenticator code when signing into the executive dashboard.
            </p>
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900">2FA Status: Enabled</p>
                <p className="text-xs text-emerald-700">Protected via Authenticator App</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success('2FA configuration refreshed')}>
                Configure
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Active Session</h4>
              <div className="text-xs text-slate-500 space-y-1">
                <p>📍 Current device: Windows PC · Chrome 124</p>
                <p>🕒 IP: 103.24.188.10 · Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 max-w-3xl">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">
            Communication & Alert Preferences
          </h3>
          <div className="space-y-4 divide-y divide-slate-100">
            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Membership Expiry Alerts</p>
                <p className="text-xs text-slate-500">Receive instant email digests when member plans expire within 7 days.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailRenewals}
                onChange={(e) => setNotifications({ ...notifications, emailRenewals: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between pt-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Daily Revenue & Check-in Summary</p>
                <p className="text-xs text-slate-500">End-of-day revenue breakdown, new enrolments, and branch footfall.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailDailyReport}
                onChange={(e) => setNotifications({ ...notifications, emailDailyReport: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between pt-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">SMS / UPI Payment Receipts</p>
                <p className="text-xs text-slate-500">Real-time alerts for member fee collections and direct deposits.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsPaymentAlerts}
                onChange={(e) => setNotifications({ ...notifications, smsPaymentAlerts: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between pt-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">WhatsApp Lead & Enquiry Notifications</p>
                <p className="text-xs text-slate-500">Notify trainers and front-desk coordinators upon new walk-in trials.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.whatsappEnquiries}
                onChange={(e) => setNotifications({ ...notifications, whatsappEnquiries: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={() => toast.success('Notification preferences updated!')} leftIcon={Save}>
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerProfilePage;
