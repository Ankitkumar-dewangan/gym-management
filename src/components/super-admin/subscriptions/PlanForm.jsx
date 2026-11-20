import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Eye } from 'lucide-react';
import { SUBSCRIPTION_FEATURE_LIST } from '../../../constants/subscriptionData';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

export function PlanForm({
  mode = 'create',
  initialData = null,
  onSubmitPlan,
  onSaveDraft,
  onCancel,
}) {
  const isEdit = mode === 'edit';
  const [previewOpen, setPreviewOpen] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState(
    initialData?.features || ['member_management', 'attendance_management', 'payment_management']
  );

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      code: initialData?.code || '',
      displayOrder: String(initialData?.displayOrder ?? 4),
      badge: initialData?.badge || '',

      monthlyPrice: String(initialData?.monthlyPrice ?? 3999),
      yearlyPrice: String(initialData?.yearlyPrice ?? 39990),
      yearlyDiscount: String(initialData?.yearlyDiscount ?? 17),
      setupFee: String(initialData?.setupFee ?? 0),
      trialDays: String(initialData?.trialDays ?? 14),

      maxBranches: String(
        initialData?.limits?.unlimitedBranches ? 999 : initialData?.limits?.maxBranches ?? 3
      ),
      maxMembers: String(
        initialData?.limits?.unlimitedMembers ? 99999 : initialData?.limits?.maxMembers ?? 500
      ),
      maxTrainers: String(
        initialData?.limits?.unlimitedTrainers ? 999 : initialData?.limits?.maxTrainers ?? 10
      ),
      maxStaff: String(initialData?.limits?.maxStaff ?? 15),
      storageGb: String(initialData?.limits?.storageGb ?? 25),
      unlimitedBranches: Boolean(initialData?.limits?.unlimitedBranches),
      unlimitedMembers: Boolean(initialData?.limits?.unlimitedMembers),
      unlimitedTrainers: Boolean(initialData?.limits?.unlimitedTrainers),

      status: initialData?.status || 'active',
      isFeatured: Boolean(initialData?.isFeatured),
      isPublic: initialData?.isPublic !== false,
    },
  });

  const unlimitedBranches = watch('unlimitedBranches');
  const unlimitedMembers = watch('unlimitedMembers');
  const unlimitedTrainers = watch('unlimitedTrainers');
  const previewValues = watch();

  const toggleFeature = (key) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const buildPayload = (values) => ({
    ...values,
    features: selectedFeatures,
  });

  const handleCreateOrUpdate = (values) => {
    onSubmitPlan?.(buildPayload(values));
  };

  const handleDraft = () => {
    const values = getValues();
    onSaveDraft?.(
      buildPayload({
        ...values,
        name: values.name || 'Untitled Draft Plan',
        code: values.code || `DRAFT-${Date.now().toString().slice(-4)}`,
      })
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6" noValidate>
        {/* Basic Information */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Basic Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan name, code, display ordering, and optional promotional badge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Plan Name"
              required
              placeholder="e.g. Growth Plus"
              error={errors.name?.message}
              {...register('name', { required: 'Plan name is required' })}
            />
            <Input
              label="Plan Code"
              required
              placeholder="e.g. GROWTH-04"
              error={errors.code?.message}
              {...register('code', { required: 'Plan code is required' })}
            />
            <Input
              label="Plan Display Order"
              type="number"
              min="1"
              required
              error={errors.displayOrder?.message}
              {...register('displayOrder', { required: 'Display order is required' })}
            />
            <Input
              label="Plan Badge"
              placeholder="e.g. Best Value"
              {...register('badge')}
            />
          </div>

          <div>
            <label
              htmlFor="plan-desc"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Plan Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="plan-desc"
              rows={2}
              placeholder="Describe the target gym profile for this subscription plan..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
              {...register('description', { required: 'Plan description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Pricing & Trial</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configurable monthly and annual pricing, setup fees, and free trial duration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Monthly Price (₹)"
              type="number"
              min="0"
              required
              error={errors.monthlyPrice?.message}
              {...register('monthlyPrice', { required: 'Monthly price is required' })}
            />
            <Input
              label="Yearly Price (₹)"
              type="number"
              min="0"
              required
              error={errors.yearlyPrice?.message}
              {...register('yearlyPrice', { required: 'Yearly price is required' })}
            />
            <Input
              label="Yearly Discount (%)"
              type="number"
              min="0"
              max="100"
              {...register('yearlyDiscount')}
            />
            <Input
              label="Setup Fee (₹)"
              type="number"
              min="0"
              {...register('setupFee')}
            />
            <Input
              label="Trial Period (Days)"
              type="number"
              min="0"
              {...register('trialDays')}
            />
          </div>
        </section>

        {/* Limits */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Usage Limits</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set maximum branch, member, trainer, staff, and storage thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Input
                label="Maximum Branches"
                type="number"
                min="1"
                disabled={unlimitedBranches}
                {...register('maxBranches')}
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" {...register('unlimitedBranches')} className="rounded border-slate-300" />
                <span>Unlimited branches</span>
              </label>
            </div>

            <div className="space-y-2">
              <Input
                label="Maximum Members"
                type="number"
                min="1"
                disabled={unlimitedMembers}
                {...register('maxMembers')}
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" {...register('unlimitedMembers')} className="rounded border-slate-300" />
                <span>Unlimited members</span>
              </label>
            </div>

            <div className="space-y-2">
              <Input
                label="Maximum Trainers"
                type="number"
                min="1"
                disabled={unlimitedTrainers}
                {...register('maxTrainers')}
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" {...register('unlimitedTrainers')} className="rounded border-slate-300" />
                <span>Unlimited trainers</span>
              </label>
            </div>

            <Input
              label="Maximum Staff Accounts"
              type="number"
              min="1"
              {...register('maxStaff')}
            />
            <Input
              label="Storage Limit (GB)"
              type="number"
              min="1"
              {...register('storageGb')}
            />
          </div>
        </section>

        {/* Feature Permissions */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Feature Permissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle capabilities included in this plan ({selectedFeatures.length} selected).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedFeatures(SUBSCRIPTION_FEATURE_LIST.map((f) => f.key))}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeatures([])}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBSCRIPTION_FEATURE_LIST.map((feat) => {
              const checked = selectedFeatures.includes(feat.key);
              return (
                <label
                  key={feat.key}
                  className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'border-emerald-300 bg-emerald-50/50 text-slate-900 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFeature(feat.key)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>{feat.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Other Settings */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Other Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <Select label="Plan Status" options={STATUS_OPTIONS} {...register('status')} />

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer pt-4 sm:pt-5">
              <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-slate-300" />
              <span>Featured Plan (highlight on pricing page)</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer pt-4 sm:pt-5">
              <input type="checkbox" {...register('isPublic')} className="h-4 w-4 rounded border-slate-300" />
              <span>Public Visibility</span>
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              leftIcon={Eye}
              onClick={() => setPreviewOpen(true)}
            >
              Preview Plan
            </Button>
            {!isEdit && onSaveDraft && (
              <Button type="button" variant="secondary" onClick={handleDraft}>
                Save as Draft
              </Button>
            )}
            <Button type="submit" variant="emerald" isLoading={isSubmitting}>
              {isEdit ? 'Save Plan Changes' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Plan Card Preview"
        description="How this plan renders in the Subscription Plans catalog."
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {previewValues.name || 'Plan Name'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {previewValues.description || 'Plan description'}
              </p>
            </div>
            {previewValues.badge && (
              <span className="rounded-md bg-navy-50 border border-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-900">
                {previewValues.badge}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(previewValues.monthlyPrice || 0)}
            </span>
            <span className="text-xs text-slate-500">/ month</span>
            <span className="text-xs text-emerald-700 font-medium ml-auto tabular-nums">
              {formatCurrency(previewValues.yearlyPrice || 0)}/yr
            </span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <li>
              Branches: {previewValues.unlimitedBranches ? 'Unlimited' : previewValues.maxBranches}
            </li>
            <li>
              Members: {previewValues.unlimitedMembers ? 'Unlimited' : previewValues.maxMembers}
            </li>
            <li>
              Trainers: {previewValues.unlimitedTrainers ? 'Unlimited' : previewValues.maxTrainers}
            </li>
          </ul>

          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            {SUBSCRIPTION_FEATURE_LIST.filter((f) => selectedFeatures.includes(f.key)).map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-xs text-slate-700">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PlanForm;
