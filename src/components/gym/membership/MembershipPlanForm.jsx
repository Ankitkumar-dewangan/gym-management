import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../common/StatusBadge';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import {
  DURATION_TYPE_OPTIONS,
  PLAN_CATEGORY_OPTIONS,
  PLAN_FEATURE_OPTIONS,
} from '../../../constants/membershipManagementData';
import { cn } from '../../../utils/cn';
import { calculatePlanPricing } from '../../../utils/membershipCalculations';

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

export function MembershipPlanForm({
  initialData = null,
  mode = 'create',
  onSubmit,
  onSaveDraft,
  onCancel,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || `IWC-PLN-${Math.floor(10 + Math.random() * 89)}`,
      description: initialData?.description || '',
      category: initialData?.category || 'Standard Access',
      status: initialData?.status || 'active',
      durationType: initialData?.durationType || 'monthly',
      durationDays: initialData?.durationDays ?? 30,
      regularPrice: initialData?.regularPrice ?? 120,
      discountPercent: initialData?.discountPercent ?? 0,
      taxPercent: initialData?.taxPercent ?? 8,
      registrationFee: initialData?.registrationFee ?? 25,
      joiningFee: initialData?.joiningFee ?? 0,
      features: {
        gymAccess: initialData?.features?.gymAccess ?? true,
        personalTraining: initialData?.features?.personalTraining ?? false,
        groupClasses: initialData?.features?.groupClasses ?? false,
        lockerAccess: initialData?.features?.lockerAccess ?? true,
        cardioAccess: initialData?.features?.cardioAccess ?? true,
        workoutPlans: initialData?.features?.workoutPlans ?? false,
        dietConsultation: initialData?.features?.dietConsultation ?? false,
      },
      otherFacilities: initialData?.otherFacilities || '',
      branchAccess: initialData?.branchAccess || 'Home Branch Only',
      dailyEntryLimit: initialData?.dailyEntryLimit ?? 1,
      allowedWorkoutSessions: initialData?.allowedWorkoutSessions ?? 30,
      personalTrainingSessions: initialData?.personalTrainingSessions ?? 0,
      freezeAllowed: initialData?.freezeAllowed ?? true,
      maxFreezeDays: initialData?.maxFreezeDays ?? 14,
      featuredPlan: initialData?.featuredPlan ?? false,
      showOnRegistration: initialData?.showOnRegistration ?? true,
      offerAvailable: initialData?.offerAvailable ?? true,
      notes: initialData?.notes || '',
    },
  });

  const watchedDurationType = watch('durationType');
  const watchedRegularPrice = watch('regularPrice');
  const watchedDiscount = watch('discountPercent');
  const watchedTax = watch('taxPercent');
  const watchedRegFee = watch('registrationFee');
  const watchedJoinFee = watch('joiningFee');
  const watchedFreezeAllowed = watch('freezeAllowed');
  const watchedFeatures = watch('features');

  useEffect(() => {
    if (mode === 'edit' && initialData && watchedDurationType === initialData.durationType) return;
    const match = DURATION_TYPE_OPTIONS.find((opt) => opt.value === watchedDurationType);
    if (match && watchedDurationType !== 'custom') {
      setValue('durationDays', match.defaultDays);
    }
  }, [watchedDurationType, setValue, mode, initialData]);

  const pricing = calculatePlanPricing({
    regularPrice: watchedRegularPrice,
    discountPercent: watchedDiscount,
    taxPercent: watchedTax,
    registrationFee: watchedRegFee,
    joiningFee: watchedJoinFee,
  });

  const handleValid = (data) => {
    onSubmit?.(data);
  };

  const handleInvalid = () => {
    toast.error('Please review required plan fields');
  };

  const handleDraft = async () => {
    const ok = await trigger('name');
    if (!ok) {
      toast.error('Enter a plan name before saving as draft');
      return;
    }
    onSaveDraft?.(getValues());
  };

  const previewValues = getValues();
  const enabledFeatures = PLAN_FEATURE_OPTIONS.filter((f) => watchedFeatures?.[f.key]).map(
    (f) => f.label
  );

  return (
    <>
      <form onSubmit={handleSubmit(handleValid, handleInvalid)} className="space-y-6" noValidate>
        {/* BASIC DETAILS */}
        <SectionCard
          title="Basic Details"
          subtitle="Plan identity, billing code, category, and visibility status."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Plan Name"
              required
              placeholder="e.g. Half-Yearly Performance"
              error={errors.name?.message}
              {...register('name', {
                required: 'Plan name is required',
                minLength: { value: 2, message: 'Enter at least 2 characters' },
              })}
            />
            <Input
              label="Plan Code"
              required
              className="font-mono uppercase"
              error={errors.code?.message}
              {...register('code', { required: 'Plan code is required' })}
            />
            <Select
              label="Plan Category"
              options={PLAN_CATEGORY_OPTIONS}
              {...register('category')}
            />
            <Select
              label="Plan Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'draft', label: 'Draft' },
              ]}
              {...register('status')}
            />
            <div className="md:col-span-2">
              <Input
                label="Description"
                required
                placeholder="Summarize access perks, trainer inclusions, and target member group..."
                error={errors.description?.message}
                {...register('description', { required: 'Plan description is required' })}
              />
            </div>
          </div>
        </SectionCard>

        {/* DURATION */}
        <SectionCard
          title="Duration Configuration"
          subtitle="Billing GymPilot and exact number of active calendar days."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Duration Type"
              options={DURATION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              {...register('durationType')}
            />
            <Input
              label="Number of Days"
              type="number"
              min="1"
              required
              error={errors.durationDays?.message}
              {...register('durationDays', {
                required: 'Duration days required',
                min: { value: 1, message: 'Must be at least 1 day' },
              })}
            />
          </div>
        </SectionCard>

        {/* PRICING */}
        <SectionCard
          title="Pricing & Tax Calculation"
          subtitle="Configure base rate, built-in plan discount, tax percentage, and onboarding fees."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Regular Price (₹)"
              type="number"
              step="0.01"
              min="0"
              required
              error={errors.regularPrice?.message}
              {...register('regularPrice', {
                required: 'Regular price is required',
                min: { value: 1, message: 'Must be greater than ₹0' },
              })}
            />
            <Input
              label="Discount (%)"
              type="number"
              step="0.5"
              min="0"
              max="100"
              {...register('discountPercent')}
            />
            <Input
              label="Tax Percentage (%)"
              type="number"
              step="0.1"
              min="0"
              max="50"
              {...register('taxPercent')}
            />
            <Input
              label="Registration Fee (₹)"
              type="number"
              step="0.01"
              min="0"
              {...register('registrationFee')}
            />
            <Input
              label="Joining Fee (₹)"
              type="number"
              step="0.01"
              min="0"
              {...register('joiningFee')}
            />
          </div>

          {/* Live Calculated Pricing Readout */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Discount Savings</p>
              <p className="font-mono text-sm font-semibold text-emerald-700 mt-0.5 tabular-nums">
                -${pricing.discountAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Estimated Tax</p>
              <p className="font-mono text-sm font-semibold text-slate-800 mt-0.5 tabular-nums">
                +${pricing.taxAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Final Plan Price</p>
              <p className="font-mono text-base font-bold text-navy-900 mt-0.5 tabular-nums">
                ${pricing.finalPlanPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">First-Time Upfront Total</p>
              <p className="font-mono text-base font-bold text-emerald-700 mt-0.5 tabular-nums">
                ${pricing.totalUpfrontPayable.toFixed(2)}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* FEATURES */}
        <SectionCard
          title="Included Features"
          subtitle="Select club amenities and coaching entitlements bundled in this tier."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLAN_FEATURE_OPTIONS.map((feat) => {
              const checked = Boolean(watchedFeatures?.[feat.key]);
              return (
                <label
                  key={feat.key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors',
                    checked
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    {...register(`features.${feat.key}`)}
                  />
                  <span>{feat.label}</span>
                </label>
              );
            })}
          </div>

          <Input
            label="Other Facilities / Benefits"
            placeholder="e.g. Cold Plunge, Infrared Sauna, Priority Booking, Towel Service"
            {...register('otherFacilities')}
          />
        </SectionCard>

        {/* RESTRICTIONS */}
        <SectionCard
          title="Access Rules & Restrictions"
          subtitle="Configure multi-branch access, daily entry limits, coaching credits, and freeze rules."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Branch Access"
              options={[
                { value: 'Home Branch Only', label: 'Home Branch Only' },
                { value: 'Home + 1 Partner Branch', label: 'Home + 1 Partner Branch' },
                { value: 'All Tenant Branches', label: 'All Tenant Branches' },
              ]}
              {...register('branchAccess')}
            />
            <Input
              label="Daily Entry Limit"
              type="number"
              min="1"
              max="10"
              {...register('dailyEntryLimit')}
            />
            <Input
              label="Allowed Workout Sessions"
              type="number"
              min="1"
              {...register('allowedWorkoutSessions')}
            />
            <Input
              label="Personal Training Sessions"
              type="number"
              min="0"
              {...register('personalTrainingSessions')}
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 w-full text-sm font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  {...register('freezeAllowed')}
                />
                <span>Membership Freeze Allowed</span>
              </label>
            </div>
            <Input
              label="Maximum Freeze Days"
              type="number"
              min="0"
              disabled={!watchedFreezeAllowed}
              {...register('maxFreezeDays')}
            />
          </div>
        </SectionCard>

        {/* OTHER SETTINGS */}
        <SectionCard
          title="Other Settings"
          subtitle="Registration showcase flags, promo eligibility, and internal plan notes."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                {...register('featuredPlan')}
              />
              <span>Featured Plan</span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                {...register('showOnRegistration')}
              />
              <span>Display on Registration</span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                {...register('offerAvailable')}
              />
              <span>Offer Availability</span>
            </label>
          </div>

          <div>
            <label htmlFor="plan-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Plan Notes
            </label>
            <textarea
              id="plan-notes"
              rows={2}
              placeholder="Internal billing notes, corporate eligibility, or auto-renewal terms..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
              {...register('notes')}
            />
          </div>
        </SectionCard>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <Button type="button" variant="outline" leftIcon={Eye} onClick={() => setPreviewOpen(true)}>
            Preview Plan
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onSaveDraft && (
              <Button type="button" variant="secondary" onClick={handleDraft}>
                Save Draft
              </Button>
            )}
            <Button type="submit" variant="emerald">
              {mode === 'edit' ? 'Save Plan Changes' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </form>

      {/* Preview Plan Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Membership Plan Preview"
        description="Live pricing card preview as displayed in the catalog."
        size="sm"
        footer={
          <Button variant="primary" size="sm" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-mono text-slate-500">{previewValues.code}</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {previewValues.name || 'Untitled Plan'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{previewValues.description || 'No description'}</p>
            </div>
            <StatusBadge status={previewValues.status} />
          </div>

          <div className="border-y border-slate-100 py-3 flex items-baseline justify-between">
            <div>
              <span className="font-mono text-2xl font-bold text-navy-900 tabular-nums">
                ${pricing.finalPlanPrice.toFixed(0)}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                / {previewValues.durationDays} days
              </span>
            </div>
            {Number(previewValues.discountPercent) > 0 && (
              <span className="text-xs font-semibold text-emerald-700">
                Save {previewValues.discountPercent}%
              </span>
            )}
          </div>

          <ul className="space-y-1.5 text-xs text-slate-700">
            {enabledFeatures.map((label) => (
              <li key={label} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 space-y-1">
            <p>Access: {previewValues.branchAccess}</p>
            <p>
              Freeze: {previewValues.freezeAllowed ? `Up to ${previewValues.maxFreezeDays} days` : 'Not included'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default MembershipPlanForm;
