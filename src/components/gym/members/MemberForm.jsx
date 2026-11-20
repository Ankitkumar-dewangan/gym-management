import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import ImageUpload from '../../ui/ImageUpload';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import {
  MEMBER_MEDIA,
  MEMBERSHIP_PLAN_CATALOG,
} from '../../../constants/memberManagementData';
import { cn } from '../../../utils/cn';

const AVATAR_PRESETS = [
  { label: 'Male Portrait', src: MEMBER_MEDIA.avatarMale1 },
  { label: 'Female Portrait', src: MEMBER_MEDIA.avatarFemale1 },
  { label: 'Senior Athlete', src: MEMBER_MEDIA.avatarSeniorMale },
  { label: 'Club Member', src: MEMBER_MEDIA.avatarCoachMember },
];

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3.5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function addMonths(dateStr, months) {
  const base = dateStr ? new Date(dateStr) : new Date('2026-11-19');
  if (Number.isNaN(base.getTime())) return '2027-11-19';
  const copy = new Date(base);
  copy.setMonth(copy.getMonth() + months);
  return copy.toISOString().slice(0, 10);
}

function DocumentRow({ label, fileName, onPick, onRemove }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {fileName ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-700 font-medium truncate">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{fileName}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-400">No file uploaded yet (PDF, JPG, PNG)</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {fileName && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={UploadCloud}
          onClick={() => inputRef.current?.click()}
        >
          {fileName ? 'Replace' : 'Upload'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPick(file.name);
              toast.success(`${file.name} attached`);
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

export function MemberForm({
  initialData = null,
  branches = [],
  mode = 'create',
  onSubmit,
  onSaveDraft,
  onSubmitAndCollect,
  onCancel,
}) {
  const otherDocsRef = useRef(null);

  const defaultBranchId =
    initialData?.branchId || branches[0]?.id || 'br_downtown';
  const defaultPlan =
    initialData?.plan || MEMBERSHIP_PLAN_CATALOG[0].name;
  const defaultStart = initialData?.startDate || '2026-11-19';
  const defaultPlanMeta =
    MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === defaultPlan) ||
    MEMBERSHIP_PLAN_CATALOG[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: initialData?.fullName || '',
      avatar: initialData?.avatar || MEMBER_MEDIA.avatarMale1,
      dob: initialData?.dob || '1995-01-15',
      gender: initialData?.gender || 'Male',
      bloodGroup: initialData?.bloodGroup || 'O+',
      mobile: initialData?.mobile || '',
      altMobile: initialData?.altMobile || '',
      email: initialData?.email || '',
      country: initialData?.country || 'United States',
      state: initialData?.state || 'Washington',
      city: initialData?.city || '',
      area: initialData?.area || '',
      fullAddress: initialData?.fullAddress || '',
      pinCode: initialData?.pinCode || '',
      emergencyName: initialData?.emergencyName || '',
      emergencyRelation: initialData?.emergencyRelation || 'Spouse',
      emergencyMobile: initialData?.emergencyMobile || '',
      emergencyAltMobile: initialData?.emergencyAltMobile || '',
      heightCm: initialData?.heightCm ?? '',
      weightKg: initialData?.weightKg ?? '',
      fitnessGoal: initialData?.fitnessGoal || 'Strength & Conditioning',
      experienceLevel: initialData?.experienceLevel || 'Beginner',
      medicalNotes: initialData?.medicalNotes || '',
      preferences: initialData?.preferences || '',
      memberId:
        initialData?.id || `MEM-${Math.floor(4100 + Math.random() * 899)}`,
      branchId: defaultBranchId,
      joiningDate: initialData?.joiningDate || '2026-11-19',
      plan: defaultPlan,
      startDate: defaultStart,
      expiryDate:
        initialData?.expiryDate ||
        addMonths(defaultStart, defaultPlanMeta.durationMonths),
      identityProof: initialData?.documents?.identityProof || '',
      addressProof: initialData?.documents?.addressProof || '',
      medicalCertificate: initialData?.documents?.medicalCertificate || '',
      otherDocs: initialData?.documents?.otherDocs || [],
      referralSource: initialData?.referralSource || 'Walk-in',
      referredBy: initialData?.referredBy || '',
      notes: initialData?.notes || '',
      termsAccepted: initialData?.termsAccepted ?? (mode === 'edit'),
    },
  });

  const watchedPlan = watch('plan');
  const watchedStartDate = watch('startDate');
  const watchedAvatar = watch('avatar');
  const watchedIdentity = watch('identityProof');
  const watchedAddress = watch('addressProof');
  const watchedMedical = watch('medicalCertificate');
  const watchedOtherDocs = watch('otherDocs') || [];

  useEffect(() => {
    if (mode === 'edit' && initialData) return;
    const planMeta = MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === watchedPlan);
    if (planMeta && watchedStartDate) {
      setValue('expiryDate', addMonths(watchedStartDate, planMeta.durationMonths), {
        shouldValidate: true,
      });
    }
  }, [watchedPlan, watchedStartDate, setValue, mode, initialData]);

  const handlePlanChange = (nextPlan) => {
    setValue('plan', nextPlan);
    const planMeta = MEMBERSHIP_PLAN_CATALOG.find((p) => p.name === nextPlan);
    const currentStart = getValues('startDate');
    if (planMeta && currentStart) {
      setValue('expiryDate', addMonths(currentStart, planMeta.durationMonths), {
        shouldValidate: true,
      });
    }
  };

  const handleValidSubmit = (data) => {
    onSubmit?.(data);
  };

  const handleInvalidSubmit = () => {
    toast.error('Please complete the required member details');
  };

  const handleDraftClick = async () => {
    const validName = await trigger('fullName');
    if (!validName) {
      toast.error('Enter at least the member full name to save a draft');
      return;
    }
    onSaveDraft?.(getValues());
  };

  const handleCollectClick = handleSubmit(
    (data) => {
      onSubmitAndCollect?.(data);
    },
    handleInvalidSubmit
  );

  const handleOtherDocsPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = Array.from(new Set([...watchedOtherDocs, ...files.map((f) => f.name)]));
    setValue('otherDocs', next);
    toast.success(`${files.length} document${files.length > 1 ? 's' : ''} added`);
    e.target.value = '';
  };

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* SECTION A: PERSONAL INFORMATION */}
      <SectionCard
        title="Section A: Personal Information"
        subtitle="Member identity, profile photograph, demographics, and primary contact channels."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-2.5">
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  label="Profile Photograph"
                  value={field.value}
                  onChange={field.onChange}
                  aspect="square"
                  hint="Square headshot up to 2MB"
                />
              )}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">Presets:</span>
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setValue('avatar', preset.src)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                    watchedAvatar === preset.src
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Jordan Mercer"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Enter at least 2 characters' },
              })}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              error={errors.dob?.message}
              {...register('dob', { required: 'Date of birth is required' })}
            />
            <Select
              label="Gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Non-binary', label: 'Non-binary' },
              ]}
              {...register('gender')}
            />
            <Select
              label="Blood Group"
              options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => ({
                value: bg,
                label: bg,
              }))}
              {...register('bloodGroup')}
            />
            <Input
              label="Mobile Number"
              required
              placeholder="+1 (206) 555-0148"
              error={errors.mobile?.message}
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[+\d\s()-]{7,20}$/,
                  message: 'Enter a valid mobile number',
                },
              })}
            />
            <Input
              label="Alternate Mobile Number"
              placeholder="Optional secondary number"
              {...register('altMobile')}
            />
            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="member@email.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION B: ADDRESS INFORMATION */}
      <SectionCard
        title="Section B: Address Information"
        subtitle="Residential address and postal code for billing and emergency verification."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Country" {...register('country')} />
          <Input label="State" placeholder="e.g. Washington" {...register('state')} />
          <Input
            label="City"
            required
            placeholder="e.g. Seattle"
            error={errors.city?.message}
            {...register('city', { required: 'City is required' })}
          />
          <Input label="Area / Locality" placeholder="e.g. Capitol Hill" {...register('area')} />
          <Input label="PIN / ZIP Code" placeholder="e.g. 98104" {...register('pinCode')} />
          <div className="md:col-span-2 lg:col-span-1">
            <Input
              label="Full Address"
              required
              placeholder="Street, apartment, or suite"
              error={errors.fullAddress?.message}
              {...register('fullAddress', { required: 'Full street address is required' })}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION C: EMERGENCY CONTACT */}
      <SectionCard
        title="Section C: Emergency Contact"
        subtitle="Authorized person to contact during facility or training emergencies."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Contact Name"
            required
            placeholder="e.g. Rachel Mercer"
            error={errors.emergencyName?.message}
            {...register('emergencyName', { required: 'Emergency contact name is required' })}
          />
          <Select
            label="Relationship"
            options={[
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Partner', label: 'Partner' },
              { value: 'Friend', label: 'Friend' },
            ]}
            {...register('emergencyRelation')}
          />
          <Input
            label="Mobile Number"
            required
            placeholder="+1 (206) 555-0181"
            error={errors.emergencyMobile?.message}
            {...register('emergencyMobile', {
              required: 'Emergency contact number is required',
              pattern: {
                value: /^[+\d\s()-]{7,20}$/,
                message: 'Enter a valid phone number',
              },
            })}
          />
          <Input
            label="Alternate Number"
            placeholder="Optional backup number"
            {...register('emergencyAltMobile')}
          />
        </div>
      </SectionCard>

      {/* SECTION D: FITNESS INFORMATION */}
      <SectionCard
        title="Section D: Fitness Information"
        subtitle="Optional baseline metrics, training objectives, and coach preferences (non-medical)."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Height (cm)"
            type="number"
            min="100"
            max="250"
            placeholder="e.g. 178"
            {...register('heightCm')}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            min="30"
            max="250"
            placeholder="e.g. 76.5"
            {...register('weightKg')}
          />
          <Input
            label="Fitness Goal"
            placeholder="e.g. Strength & Lean Mass"
            {...register('fitnessGoal')}
          />
          <Select
            label="Experience Level"
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
            {...register('experienceLevel')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fitness Preferences"
            placeholder="e.g. Morning Barbell, Kettlebells, Sauna"
            {...register('preferences')}
          />
          <Input
            label="Medical Notes (Optional)"
            placeholder="Self-disclosed exercise clearance or mobility notes"
            {...register('medicalNotes')}
          />
        </div>
      </SectionCard>

      {/* SECTION E: GYM INFORMATION */}
      <SectionCard
        title="Section E: Gym & Membership Information"
        subtitle="Assign home branch, member ID, joining schedule, and membership tier."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Member ID"
            readOnly={mode === 'edit'}
            className="font-mono"
            {...register('memberId', { required: 'Member ID is required' })}
          />
          <Select
            label="Select Branch"
            required
            error={errors.branchId?.message}
            options={branches.map((b) => ({
              value: b.id,
              label: `${b.name} (${b.city})`,
            }))}
            {...register('branchId', { required: 'Branch selection is required' })}
          />
          <Input
            label="Joining Date"
            type="date"
            required
            error={errors.joiningDate?.message}
            {...register('joiningDate', { required: 'Joining date is required' })}
          />
          <Select
            label="Membership Plan"
            required
            value={watchedPlan}
            onChange={(e) => handlePlanChange(e.target.value)}
            options={MEMBERSHIP_PLAN_CATALOG.map((p) => ({
              value: p.name,
              label: `${p.name} — ₹${p.price}/mo (${p.durationMonths}m)`,
            }))}
          />
          <Input
            label="Membership Start Date"
            type="date"
            required
            error={errors.startDate?.message}
            {...register('startDate', { required: 'Start date is required' })}
          />
          <Input
            label="Membership End Date"
            type="date"
            required
            error={errors.expiryDate?.message}
            {...register('expiryDate', {
              required: 'Expiry date is required',
              validate: (val) => {
                const start = getValues('startDate');
                if (start && val && val < start) {
                  return 'End date cannot be earlier than start date';
                }
                return true;
              },
            })}
          />
        </div>
      </SectionCard>

      {/* SECTION F: DOCUMENTS */}
      <SectionCard
        title="Section F: Member Documents"
        subtitle="Identity proof, address verification, optional fitness certificate, and supporting files."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Profile Photograph</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {watchedAvatar ? 'Attached in Section A above' : 'Pending upload in Section A'}
              </p>
            </div>
            {watchedAvatar && (
              <img
                src={watchedAvatar}
                alt="Member headshot preview"
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}
          </div>

          <DocumentRow
            label="Identity Proof"
            fileName={watchedIdentity}
            onPick={(name) => setValue('identityProof', name)}
            onRemove={() => setValue('identityProof', '')}
          />
          <DocumentRow
            label="Address Proof"
            fileName={watchedAddress}
            onPick={(name) => setValue('addressProof', name)}
            onRemove={() => setValue('addressProof', '')}
          />
          <DocumentRow
            label="Medical Certificate (Optional)"
            fileName={watchedMedical}
            onPick={(name) => setValue('medicalCertificate', name)}
            onRemove={() => setValue('medicalCertificate', '')}
          />
        </div>

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Other Documents</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => otherDocsRef.current?.click()}
            >
              Add Supporting Files
            </Button>
            <input
              ref={otherDocsRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="sr-only"
              onChange={handleOtherDocsPick}
            />
          </div>

          {watchedOtherDocs.length > 0 ? (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/40">
              {watchedOtherDocs.map((doc) => (
                <li key={doc} className="flex items-center justify-between px-3.5 py-2 text-xs">
                  <span className="flex items-center gap-2 text-slate-700 truncate">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{doc}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'otherDocs',
                        watchedOtherDocs.filter((d) => d !== doc)
                      )
                    }
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              No additional waivers or corporate benefit letters attached.
            </p>
          )}
        </div>
      </SectionCard>

      {/* SECTION G: ADDITIONAL INFORMATION */}
      <SectionCard
        title="Section G: Additional Information"
        subtitle="Acquisition channel, member notes, and club agreement acknowledgement."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Referral Source"
            options={[
              { value: 'Walk-in', label: 'Walk-in' },
              { value: 'Member Referral', label: 'Member Referral' },
              { value: 'Website', label: 'Website' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Google Search', label: 'Google Search' },
              { value: 'Corporate Wellness', label: 'Corporate Wellness' },
            ]}
            {...register('referralSource')}
          />
          <Input
            label="Referred By (Optional)"
            placeholder="Existing member or partner name"
            {...register('referredBy')}
          />
        </div>

        <div>
          <label htmlFor="member-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
            Member Notes
          </label>
          <textarea
            id="member-notes"
            rows={2}
            placeholder="Schedule preferences, locker notes, or onboarding remarks..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            {...register('notes')}
          />
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
              {...register('termsAccepted', {
                required: 'Member must accept facility terms and liability waiver',
              })}
            />
            <span>
              Confirm member has reviewed and accepted club Terms &amp; Conditions, facility rules,
              and general liability waiver.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="mt-1.5 text-xs text-red-600">{errors.termsAccepted.message}</p>
          )}
        </div>
      </SectionCard>

      {/* FORM FOOTER ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {mode === 'create' && onSaveDraft && (
          <Button type="button" variant="secondary" onClick={handleDraftClick}>
            Save as Draft
          </Button>
        )}
        <Button type="submit" variant={mode === 'create' ? 'primary' : 'emerald'}>
          {mode === 'edit' ? 'Save Member Changes' : 'Register Member'}
        </Button>
        {mode === 'create' && onSubmitAndCollect && (
          <Button type="button" variant="emerald" onClick={handleCollectClick}>
            Register and Collect Payment
          </Button>
        )}
      </div>
    </form>
  );
}

export default MemberForm;
