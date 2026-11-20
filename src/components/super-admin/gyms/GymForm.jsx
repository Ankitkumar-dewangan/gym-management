import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { SUBSCRIPTION_PLAN_PRESETS } from '../../../constants/gymManagementData';
import {
  COUNTRIES,
  INDIAN_STATES,
  getCitiesForState,
} from '../../../constants/indianLocations';
import Button from '../../ui/Button';
import ImageUpload from '../../ui/ImageUpload';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import SearchableSelect from '../../ui/SearchableSelect';

const PLAN_OPTIONS = [
  { value: 'Starter', label: 'Starter (₹2,999/mo · up to 500 members)' },
  { value: 'Pro', label: 'Pro (₹5,999/mo · up to 1,500 members)' },
  { value: 'Enterprise', label: 'Enterprise (₹14,999/mo · up to 5,000 members)' },
];

const TRIAL_OPTIONS = [
  { value: 'None', label: 'No Trial (Immediate Billing)' },
  { value: '7 Days', label: '7 Days Free Trial' },
  { value: '14 Days', label: '14 Days Free Trial' },
  { value: '30 Days', label: '30 Days Free Trial' },
];

export function GymForm({
  mode = 'create',
  initialData = null,
  onSubmitForm,
  onSaveDraft,
  onCancel,
}) {
  const isEdit = mode === 'edit';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || '');

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const primaryBranch = initialData?.branches?.[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      businessEmail: initialData?.businessEmail || '',
      contactNumber: initialData?.contactNumber || '',
      alternateContact: initialData?.alternateContact || '',
      website: initialData?.website || '',
      gstNumber: initialData?.gstNumber || '',

      ownerFullName: initialData?.owner?.fullName || '',
      ownerEmail: initialData?.owner?.email || '',
      ownerMobile: initialData?.owner?.mobile || '',
      password: '',
      confirmPassword: '',

      country: initialData?.address?.country || 'India',
      state: initialData?.address?.state || '',
      city: initialData?.address?.city || '',
      fullAddress: initialData?.address?.fullAddress || '',
      pinCode: initialData?.address?.pinCode || '',

      plan: initialData?.subscription?.plan || 'Pro',
      startDate: initialData?.subscription?.startDate || today,
      endDate: initialData?.subscription?.endDate || nextMonth,
      trialPeriod: initialData?.subscription?.trialPeriod || '14 Days',
      maxMembers: String(initialData?.subscription?.maxMembers || 1500),
      maxBranches: String(initialData?.subscription?.maxBranches || 5),

      branchName: primaryBranch?.name || '',
      branchContact: primaryBranch?.contact || '',
      branchAddress: primaryBranch?.address || '',
      branchManager: primaryBranch?.manager || '',
    },
  });

  const selectedPlan = watch('plan');
  const passwordValue = watch('password');
  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedCity = watch('city');

  useEffect(() => {
    register('country', { required: 'Country is required' });
    register('state', { required: 'State is required' });
    register('city', { required: 'City is required' });
  }, [register]);

  const stateOptions = useMemo(() => {
    return INDIAN_STATES;
  }, []);

  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    return getCitiesForState(selectedState);
  }, [selectedState]);

  const handleCountryChange = (val) => {
    setValue('country', val || 'India', { shouldValidate: true, shouldDirty: true });
  };

  const handleStateChange = (val) => {
    setValue('state', val, { shouldValidate: true, shouldDirty: true });
    if (val !== selectedState) {
      setValue('city', '', { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleCityChange = (val) => {
    setValue('city', val, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (isEdit && initialData) return;
    const preset = SUBSCRIPTION_PLAN_PRESETS[selectedPlan];
    if (preset) {
      setValue('maxMembers', String(preset.maxMembers));
      setValue('maxBranches', String(preset.maxBranches));
    }
  }, [selectedPlan, setValue, isEdit, initialData]);

  const submitWithMedia = (values) => {
    onSubmitForm?.({
      ...values,
      logoUrl,
      coverUrl,
    });
  };

  const handleDraftClick = () => {
    const values = getValues();
    onSaveDraft?.({
      ...values,
      name: values.name || 'Untitled Draft Gym',
      logoUrl,
      coverUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitWithMedia)} className="space-y-6" noValidate>
      {/* Section A: Gym Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Section A · Gym Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary brand identity, contact channels, and tax details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ImageUpload
            label="Gym Logo Upload"
            value={logoUrl}
            onChange={setLogoUrl}
            aspect="square"
          />
          <ImageUpload
            label="Gym Cover Image"
            value={coverUrl}
            onChange={setCoverUrl}
            aspect="wide"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Gym Name"
            required
            placeholder="e.g. Harbor Strength Club"
            error={errors.name?.message}
            {...register('name', { required: 'Gym name is required' })}
          />
          <Input
            label="Business Email"
            type="email"
            required
            placeholder="hello@gymclub.com"
            error={errors.businessEmail?.message}
            {...register('businessEmail', {
              required: 'Business email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid business email',
              },
            })}
          />
          <Input
            label="Contact Number"
            required
            placeholder="+91 98765 43210"
            error={errors.contactNumber?.message}
            {...register('contactNumber', {
              required: 'Contact number is required',
            })}
          />
          <Input
            label="Alternate Contact Number"
            placeholder="+91 98765 11111"
            {...register('alternateContact')}
          />
          <Input
            label="Website"
            placeholder="https://yourgym.com"
            {...register('website')}
          />
          <Input
            label="GST Number (Optional)"
            placeholder="e.g. 29AABCI1234F1Z5"
            {...register('gstNumber')}
          />
        </div>
      </section>

      {/* Section B: Owner Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Section B · Owner Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary tenant administrator credentials and contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Owner Full Name"
            required
            placeholder="Jordan Blake"
            error={errors.ownerFullName?.message}
            {...register('ownerFullName', {
              required: 'Owner full name is required',
            })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="owner@gymclub.com"
            error={errors.ownerEmail?.message}
            {...register('ownerEmail', {
              required: 'Owner email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          <Input
            label="Mobile Number"
            required
            placeholder="+91 98765 43210"
            error={errors.ownerMobile?.message}
            {...register('ownerMobile', {
              required: 'Owner mobile number is required',
            })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={isEdit ? 'New Password (Optional)' : 'Password'}
            type={showPassword ? 'text' : 'password'}
            required={!isEdit}
            placeholder={isEdit ? 'Leave blank to keep existing' : 'Min 8 characters'}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
            {...register('password', {
              validate: (val) => {
                if (!isEdit && !val) return 'Password is required';
                if (val && val.length < 8) return 'Password must be at least 8 characters';
                return true;
              },
            })}
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            required={!isEdit}
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
            {...register('confirmPassword', {
              validate: (val) => {
                if (!isEdit && !val) return 'Please confirm the password';
                if (passwordValue && val !== passwordValue) {
                  return 'Passwords do not match';
                }
                return true;
              },
            })}
          />
        </div>
      </section>

      {/* Section C: Address Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Section C · Address Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered headquarters address for billing and compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchableSelect
            label="Country"
            required
            value={selectedCountry || 'India'}
            onChange={handleCountryChange}
            options={COUNTRIES}
            placeholder="India"
            searchPlaceholder="India"
            error={errors.country?.message}
            allowCustom={false}
          />
          <SearchableSelect
            label="State"
            required
            value={selectedState || ''}
            onChange={handleStateChange}
            options={stateOptions}
            placeholder="Select State / UT"
            searchPlaceholder="Search state or UT..."
            emptyMessage="No matching state found"
            error={errors.state?.message}
          />
          <SearchableSelect
            label="City"
            required
            value={selectedCity || ''}
            onChange={handleCityChange}
            options={cityOptions}
            placeholder={
              !selectedState
                ? 'Select state first'
                : 'Select City'
            }
            searchPlaceholder={
              cityOptions.length > 0
                ? `Search among ${cityOptions.length} cities...`
                : 'Search city...'
            }
            emptyMessage={
              !selectedState
                ? 'Please select a state first'
                : 'No matching city found'
            }
            error={errors.city?.message}
            disabled={!selectedState}
          />
          <Input
            label="PIN / Postal Code"
            required
            placeholder="e.g. 400001"
            error={errors.pinCode?.message}
            {...register('pinCode', { required: 'PIN / Postal code is required' })}
          />
        </div>

        <Input
          label="Full Address"
          required
          placeholder="e.g. 102, Business Bay, MG Road"
          error={errors.fullAddress?.message}
          {...register('fullAddress', { required: 'Full street address is required' })}
        />
      </section>

      {/* Section D: Subscription Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Section D · Subscription Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign SaaS tier, billing cycle window, and member/branch quotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Select Subscription Plan"
            required
            options={PLAN_OPTIONS}
            error={errors.plan?.message}
            {...register('plan', { required: 'Subscription plan is required' })}
          />
          <Input
            label="Subscription Start Date"
            type="date"
            required
            error={errors.startDate?.message}
            {...register('startDate', { required: 'Start date is required' })}
          />
          <Input
            label="Subscription End Date"
            type="date"
            required
            error={errors.endDate?.message}
            {...register('endDate', { required: 'End date is required' })}
          />
          <Select
            label="Trial Period"
            options={TRIAL_OPTIONS}
            {...register('trialPeriod')}
          />
          <Input
            label="Maximum Allowed Members"
            type="number"
            min="1"
            required
            error={errors.maxMembers?.message}
            {...register('maxMembers', {
              required: 'Member quota is required',
              min: { value: 1, message: 'Must allow at least 1 member' },
            })}
          />
          <Input
            label="Maximum Allowed Branches"
            type="number"
            min="1"
            required
            error={errors.maxBranches?.message}
            {...register('maxBranches', {
              required: 'Branch quota is required',
              min: { value: 1, message: 'Must allow at least 1 branch' },
            })}
          />
        </div>
      </section>

      {/* Section E: Initial Branch Setup */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Section E · {isEdit ? 'Primary Branch Details' : 'Initial Branch Setup'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the flagship club location and branch manager.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Branch Name"
            required
            placeholder="e.g. Downtown Flagship"
            error={errors.branchName?.message}
            {...register('branchName', { required: 'Branch name is required' })}
          />
          <Input
            label="Branch Contact"
            required
            placeholder="+91 98765 43210"
            error={errors.branchContact?.message}
            {...register('branchContact', { required: 'Branch contact is required' })}
          />
          <Input
            label="Branch Manager Name"
            required
            placeholder="Elena Rostova"
            error={errors.branchManager?.message}
            {...register('branchManager', { required: 'Branch manager is required' })}
          />
          <Input
            label="Branch Address"
            required
            placeholder="e.g. 102, MG Road, Central Plaza"
            error={errors.branchAddress?.message}
            {...register('branchAddress', { required: 'Branch address is required' })}
          />
        </div>
      </section>

      {/* Form Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {!isEdit && onSaveDraft && (
            <Button variant="secondary" type="button" onClick={handleDraftClick}>
              Save as Draft
            </Button>
          )}
          <Button type="submit" variant="emerald" isLoading={isSubmitting}>
            {isEdit ? 'Save Gym Changes' : 'Create Gym'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default GymForm;
