import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileUp, Plus, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import ImageUpload from '../../ui/ImageUpload';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import {
  EMPLOYMENT_TYPES,
  PAYMENT_FREQUENCIES,
  SALARY_TYPES,
  TRAINER_SPECIALIZATIONS,
  WORKING_DAYS_OPTIONS,
} from '../../../constants/trainerStaffData';
import { calculateNetSalary, formatCurrency } from '../../../utils/payrollCalculations';

export function TrainerForm({
  initialValues = {},
  branches = [],
  mode = 'create',
  onSubmit,
  onSaveDraft,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: initialValues.fullName || '',
      dob: initialValues.dob || '1993-05-15',
      gender: initialValues.gender || 'Male',
      phone: initialValues.phone || '',
      altPhone: initialValues.altPhone || '',
      email: initialValues.email || '',
      address: initialValues.address || '',
      emergencyContactName: initialValues.emergencyContactName || '',
      emergencyContactPhone: initialValues.emergencyContactPhone || '',
      experienceYears: initialValues.experienceYears ?? 3,
      certifications: initialValues.certifications || '',
      qualifications: initialValues.qualifications || '',
      bio: initialValues.bio || '',
      languages: Array.isArray(initialValues.languages)
        ? initialValues.languages.join(', ')
        : initialValues.languages || 'English',
      joiningDate: initialValues.joiningDate || '2026-11-19',
      employmentType: initialValues.employmentType || 'Full-time',
      branchId: initialValues.branchId || branches[0]?.id || '',
      shiftStart: initialValues.shiftStart || '06:00',
      shiftEnd: initialValues.shiftEnd || '14:30',
      maxClients: initialValues.maxClients ?? 18,
      status: initialValues.status || 'active',
      salaryType: initialValues.salaryType || 'Monthly',
      basicSalary: initialValues.basicSalary ?? 4500,
      allowances: initialValues.allowances ?? 350,
      deductions: initialValues.deductions ?? 150,
      perSessionRate: initialValues.perSessionRate ?? 65,
      commissionPercent: initialValues.commissionPercent ?? 18,
      paymentFrequency: initialValues.paymentFrequency || 'Monthly',
      bankName: initialValues.bankName || 'Chase Commercial Bank',
      accountHolderName: initialValues.accountHolderName || initialValues.fullName || '',
      accountLast4: initialValues.accountLast4 || '',
      taxId: initialValues.taxId || '',
      notes: initialValues.notes || '',
    },
  });

  const [avatar, setAvatar] = useState(initialValues.avatar || '');
  const [selectedSpecs, setSelectedSpecs] = useState(
    initialValues.specializations || ['Strength & Conditioning']
  );
  const [selectedBranches, setSelectedBranches] = useState(
    initialValues.assignedBranches || (branches[0]?.id ? [branches[0].id] : [])
  );
  const [workingDays, setWorkingDays] = useState(
    initialValues.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  );
  const [documents, setDocuments] = useState(initialValues.documents || []);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Certification');

  useEffect(() => {
    if (!watch('branchId') && branches[0]?.id) {
      setValue('branchId', branches[0].id);
    }
  }, [branches, setValue, watch]);

  const salaryType = watch('salaryType');
  const basicSalary = watch('basicSalary');
  const allowances = watch('allowances');
  const deductions = watch('deductions');
  const perSessionRate = watch('perSessionRate');
  const commissionPercent = watch('commissionPercent');

  const previewPay = calculateNetSalary({
    salaryType,
    basicSalary,
    allowances,
    deductions,
    perSessionRate,
    sessionsCompleted: salaryType === 'Per Session' ? 40 : 0,
    commissionPercent,
    sessionRevenue: salaryType === 'Commission-Based' ? 4000 : 0,
  });

  const toggleFromList = (list, setter, item) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      {
        name: newDocName.trim(),
        type: newDocType,
        uploadedAt: '2026-11-19',
      },
    ]);
    setNewDocName('');
  };

  const buildPayload = (data) => ({
    ...data,
    avatar,
    specializations: selectedSpecs.length > 0 ? selectedSpecs : ['Strength & Conditioning'],
    assignedBranches: selectedBranches.length > 0 ? selectedBranches : [data.branchId],
    workingDays: workingDays.length > 0 ? workingDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    documents,
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit?.(buildPayload(data)))}
      className="space-y-6"
    >
      {/* Section 1: Personal Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">1. Personal Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Trainer identity, contact coordinates, and emergency point of contact.
        </p>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <ImageUpload
              label="Trainer Profile Photo"
              value={avatar}
              onChange={setAvatar}
              hint="Square portrait recommended (PNG/JPG up to 2MB)"
            />
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g., Mateo Diaz"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="trainer@ironworksclub.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email address is required' })}
            />
            <Input
              label="Phone Number *"
              placeholder="+1 (206) 555-0148"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
            />
            <Input
              label="Alternate Phone"
              placeholder="+1 (206) 555-0181"
              {...register('altPhone')}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...register('dob')}
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
            <Input
              label="Emergency Contact Name"
              placeholder="e.g., Elena Diaz"
              {...register('emergencyContactName')}
            />
            <Input
              label="Emergency Contact Phone"
              placeholder="+1 (206) 555-0192"
              {...register('emergencyContactPhone')}
            />
            <div className="sm:col-span-2">
              <Input
                label="Residential Address"
                placeholder="Street, city, state, postal code"
                {...register('address')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Professional Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">2. Professional Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Coaching specializations, credentials, and bio displayed to gym staff and members.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Specializations
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAINER_SPECIALIZATIONS.map((spec) => {
                const active = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleFromList(selectedSpecs, setSelectedSpecs, spec)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Years of Experience *"
              type="number"
              min="0"
              max="50"
              error={errors.experienceYears?.message}
              {...register('experienceYears', { required: 'Experience is required' })}
            />
            <Input
              label="Certifications"
              placeholder="e.g., NSCA-CSCS, NASM-CPT"
              {...register('certifications')}
            />
            <Input
              label="Qualifications"
              placeholder="e.g., B.S. Kinesiology"
              {...register('qualifications')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Languages Known"
              placeholder="English, Spanish"
              {...register('languages')}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Trainer Bio
              </label>
              <textarea
                rows={3}
                placeholder="Brief coaching background and methodology..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
                {...register('bio')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Gym Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">3. Gym &amp; Schedule Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Primary branch, multi-branch access, working days, shift window, and client capacity.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Primary Branch *"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            {...register('branchId', { required: 'Primary branch is required' })}
          />
          <Select
            label="Employment Type"
            options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('employmentType')}
          />
          <Input
            label="Joining Date"
            type="date"
            {...register('joiningDate')}
          />
          <Input
            label="Shift Start"
            type="time"
            {...register('shiftStart')}
          />
          <Input
            label="Shift End"
            type="time"
            {...register('shiftEnd')}
          />
          <Input
            label="Max Client Capacity"
            type="number"
            min="1"
            max="100"
            {...register('maxClients')}
          />
          <Select
            label="Trainer Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'on_leave', label: 'On Leave' },
            ]}
            {...register('status')}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assigned Branches
            </label>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => {
                const active = selectedBranches.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleFromList(selectedBranches, setSelectedBranches, b.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAYS_OPTIONS.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleFromList(workingDays, setWorkingDays, day)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Salary Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">4. Compensation &amp; Payroll Setup</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Salary structure and disbursement details (demo payroll ledger only).
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <span className="text-slate-500">Estimated Monthly Net: </span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {formatCurrency(previewPay.netSalary)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Salary Type"
            options={SALARY_TYPES.map((s) => ({ value: s, label: s }))}
            {...register('salaryType')}
          />
          <Select
            label="Payment Frequency"
            options={PAYMENT_FREQUENCIES.map((f) => ({ value: f, label: f }))}
            {...register('paymentFrequency')}
          />
          <Input
            label="Base Monthly Salary (₹)"
            type="number"
            min="0"
            step="10"
            {...register('basicSalary')}
          />
          <Input
            label="Allowances (₹)"
            type="number"
            min="0"
            step="10"
            {...register('allowances')}
          />
          <Input
            label="Deductions (₹)"
            type="number"
            min="0"
            step="10"
            {...register('deductions')}
          />
          <Input
            label="Per Session Rate (₹)"
            type="number"
            min="0"
            step="1"
            {...register('perSessionRate')}
          />
          <Input
            label="Commission (%)"
            type="number"
            min="0"
            max="100"
            step="1"
            {...register('commissionPercent')}
          />
          <Input
            label="Bank Name"
            placeholder="Chase Commercial Bank"
            {...register('bankName')}
          />
          <Input
            label="Account Holder Name"
            placeholder="Account holder"
            {...register('accountHolderName')}
          />
          <Input
            label="Account Last 4 Digits"
            maxLength={4}
            placeholder="4821"
            {...register('accountLast4')}
          />
          <Input
            label="Tax ID / Reference"
            placeholder="US-TX-90412"
            {...register('taxId')}
          />
        </div>
      </section>

      {/* Section 5: Documents */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">5. Documents &amp; Compliance Files</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Attach ID proof, fitness certification, and trainer employment agreements.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Document filename (e.g., CPR_AED_Certificate_2026.pdf)"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              options={[
                { value: 'Certification', label: 'Certification' },
                { value: 'Identity Proof', label: 'Identity Proof' },
                { value: 'Agreement', label: 'Agreement' },
              ]}
            />
          </div>
          <Button type="button" variant="outline" icon={Plus} onClick={handleAddDocument}>
            Attach File
          </Button>
        </div>

        {documents.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {documents.map((doc, idx) => (
              <li key={`${doc.name}-${idx}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileUp className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                  <span className="text-xs text-slate-500 shrink-0">· {doc.type}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                  aria-label="Remove document"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-500">No compliance files attached yet.</p>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Notes</label>
          <textarea
            rows={2}
            placeholder="Operational notes or shift preferences..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            {...register('notes')}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {onSaveDraft && mode === 'create' && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit((data) => onSaveDraft(buildPayload(data)))}
          >
            Save Draft
          </Button>
        )}
        <Button type="submit" variant="primary">
          {mode === 'edit' ? 'Save Trainer Changes' : 'Register Trainer'}
        </Button>
      </div>
    </form>
  );
}

export default TrainerForm;
