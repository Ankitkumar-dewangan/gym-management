import { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Heart,
  IdCard,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Save,
  Shield,
  Upload,
  User,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { MEMBER_PROFILE_DATA } from '../../constants/memberPortalData';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

export function MemberProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.role === ROLES.MEMBER && user?.name ? user.name : MEMBER_PROFILE_DATA.name,
    memberId: MEMBER_PROFILE_DATA.memberId,
    email: user?.role === ROLES.MEMBER && user?.email ? user.email : MEMBER_PROFILE_DATA.email,
    phone: MEMBER_PROFILE_DATA.phone,
    dob: MEMBER_PROFILE_DATA.dob,
    gender: MEMBER_PROFILE_DATA.gender,
    bloodGroup: MEMBER_PROFILE_DATA.bloodGroup,
    address: MEMBER_PROFILE_DATA.address,
    emergencyContactName: MEMBER_PROFILE_DATA.emergencyContactName,
    emergencyContactPhone: MEMBER_PROFILE_DATA.emergencyContactPhone,
    emergencyRelationship: MEMBER_PROFILE_DATA.emergencyRelationship,
    gymName: MEMBER_PROFILE_DATA.gymName,
    branch: MEMBER_PROFILE_DATA.branch,
    branchAddress: MEMBER_PROFILE_DATA.branchAddress,
    assignedTrainer: MEMBER_PROFILE_DATA.assignedTrainer,
    trainerPhone: MEMBER_PROFILE_DATA.trainerPhone,
    joinDate: MEMBER_PROFILE_DATA.joinDate,
    membershipStatus: MEMBER_PROFILE_DATA.membershipStatus,
    fitnessGoal: MEMBER_PROFILE_DATA.fitnessGoal,
    workoutPreference: MEMBER_PROFILE_DATA.workoutPreference,
    medicalNotes: MEMBER_PROFILE_DATA.medicalNotes,
    avatar: MEMBER_PROFILE_DATA.avatar,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: fakeUrl }));
      toast.success('Photo updated successfully!');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile information saved successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Member Profile"
        description="Manage your personal details, emergency contacts, gym registration records, and physical health preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Pass Card & Quick Gym Info */}
        <div className="space-y-6">
          {/* Digital Pass Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 p-6 text-white shadow-md flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary-400" />
                <span className="font-extrabold text-sm tracking-wider">MY GYM CLUB</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {formData.membershipStatus}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-primary-400 shadow-md"
                />
                <label className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-semibold">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{formData.name}</h3>
                <p className="font-mono text-xs text-primary-300 mt-0.5">{formData.memberId}</p>
                <p className="text-[11px] text-slate-400 mt-1">📍 {formData.branch}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-between">
              <div className="text-[11px]">
                <span className="text-slate-400 block">Digital Check-in</span>
                <strong className="text-white">Scan at Entrance Kiosk</strong>
              </div>
              <div className="p-2 rounded-lg bg-white text-slate-900">
                <QrCode className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Assigned Club & Coach Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Club & Coaching Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">{formData.gymName}</strong>
                  <p className="text-slate-500 text-[11px]">{formData.branchAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">{formData.assignedTrainer}</strong>
                  <p className="text-slate-500 text-[11px]">Head Strength & Conditioning Coach</p>
                  <p className="text-slate-400 text-[11px]">{formData.trainerPhone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Member Since:</span>
                <strong className="text-slate-700">{formData.joinDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Personal, Emergency & Preferences */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Member ID"
                disabled
                value={formData.memberId}
                helperText="System assigned identification number"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Mobile Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other / Prefer not to say' },
                ]}
              />
              <Input
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Residential Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> Emergency Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Contact Person Name"
                required
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />
              <Input
                label="Relationship"
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              />
              <Input
                label="Emergency Phone"
                required
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Fitness Preferences & Medical Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Fitness Preferences & Medical History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Fitness Goal"
                value={formData.fitnessGoal}
                onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
              />
              <Input
                label="Preferred Workout Window"
                value={formData.workoutPreference}
                onChange={(e) => setFormData({ ...formData, workoutPreference: e.target.value })}
              />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Health & Medical Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <Button type="submit" leftIcon={Save} isLoading={isSaving}>
              Save Profile Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberProfilePage;
