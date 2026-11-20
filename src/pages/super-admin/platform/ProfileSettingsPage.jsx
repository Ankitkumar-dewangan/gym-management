import { useState } from 'react';
import { KeyRound, Laptop, LogOut, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import UserAvatar from '../../../components/common/UserAvatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { usePlatformManagement } from '../../../contexts/PlatformManagementContext';

export function ProfileSettingsPage() {
  const { adminProfile, sessions, updateAdminProfile, revokeSession } =
    usePlatformManagement();

  const [profileForm, setProfileForm] = useState({
    fullName: adminProfile.fullName,
    email: adminProfile.email,
    mobile: adminProfile.mobile,
    title: adminProfile.title,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      toast.error('Full name and email are required');
      return;
    }
    updateAdminProfile({
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
      mobile: profileForm.mobile.trim(),
      title: profileForm.title.trim(),
    });
    toast.success('Admin profile updated');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Enter your current and new password');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Password updated in demo session');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your Super Admin identity, password, two-factor authentication, and active sessions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Admin Profile & Password */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <UserAvatar
                src={adminProfile.avatar}
                name={profileForm.fullName}
                size="xl"
              />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {profileForm.fullName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{profileForm.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Super Admin · Powered by AGP Empire
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, fullName: e.target.value }))
                }
                required
              />
              <Input
                label="Role Title"
                value={profileForm.title}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
              <Input
                label="Mobile Number"
                value={profileForm.mobile}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, mobile: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="emerald" leftIcon={Save}>
                Save Profile
              </Button>
            </div>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-navy-900" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
            </div>

            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm">
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Right: 2FA & Active Sessions */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <h2 className="text-base font-semibold text-slate-900">
                  Two-Factor Authentication
                </h2>
              </div>
              <StatusBadge
                status={adminProfile.twoFactorEnabled ? 'active' : 'inactive'}
                label={adminProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Protect Super Admin access using {adminProfile.twoFactorMethod} verification codes for sensitive billing and role actions.
            </p>

            <Button
              variant={adminProfile.twoFactorEnabled ? 'outline' : 'emerald'}
              size="sm"
              onClick={() => {
                const next = !adminProfile.twoFactorEnabled;
                updateAdminProfile({ twoFactorEnabled: next });
                toast.success(
                  next
                    ? 'Two-factor authentication enabled'
                    : 'Two-factor authentication disabled'
                );
              }}
            >
              {adminProfile.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-navy-900" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900">Active Sessions</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{ses.device}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ses.location} · <span className="font-mono">{ses.ip}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">{ses.lastActive}</p>
                  </div>
                  {!ses.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={LogOut}
                      onClick={() => {
                        revokeSession(ses.id);
                        toast.success('Revoked device session');
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
