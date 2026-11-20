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
  STAFF_CATEGORIES,
  WORKING_DAYS_OPTIONS,
} from '../../../constants/trainerStaffData';
import { calculateNetSalary, formatCurrency } from '../../../utils/payrollCalculations';

export function StaffForm({
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
      role: initialValues.role || 'Receptionist',
      department: initialValues.department || 'Front Desk & Member Experience',
      gender: initialValues.gender || 'Male',
      phone: initialValues.phone || '',
      email: initialValues.email || '',
      address: initialValues.address || '',
      emergencyContactName: initialValues.emergencyContactName || '',
      emergencyContactPhone: initialValues.emergencyContactPhone || '',
      branchId: initialValues.branchId || branches[0]?.id || '',
      joiningDate: initialValues.joiningDate || '2026-11-19',
      employmentType: initialValues.employmentType || 'Full-time',
      shiftTiming: initialValues.shiftTiming || '09:00 - 17:30',
      status: initialValues.status || 'active',
      salaryType: initialValues.salaryType || 'Monthly',
      basicSalary: initialValues.basicSalary ?? 3800,
      allowances: initialValues.allowances ?? 300,
      deductions: initialValues.deductions ?? 150,
      paymentFrequency: initialValues.paymentFrequency || 'Monthly',
      bankName: initialValues.bankName || 'Chase Commercial Bank',
      accountLast4: initialValues.accountLast4 || '',
      responsibilities: Array.isArray(initialValues.responsibilities)
        ? initialValues.responsibilities.join('\n')
        : initialValues.responsibilities || '',
      notes: initialValues.notes || '',
    },
  });

  const [avatar, setAvatar] = useState(initialValues.avatar || '');
  const [workingDays, setWorkingDays] = useState(
    initialValues.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  );
  const [documents, setDocuments] = useState(initialValues.documents || []);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Contract');

  useEffect(() => {
    if (!watch('branchId') && branches[0]?.id) {
      setValue('branchId', branches[0].id);
    }
  }, [branches, setValue, watch]);

  const basicSalary = watch('basicSalary');
  const allowances = watch('allowances');
  const deductions = watch('deductions');
  const previewPay = calculateNetSalary({ basicSalary, allowances, deductions });

  const toggleDay = (day) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    setDocuments((prev) => [
      ...prev,
      { name: newDocName.trim(), type: newDocType, uploadedAt: '2026-11-19' },
    ]);
    setNewDocName('');
  };

  const buildPayload = (data) => ({
    ...data,
    avatar,
    workingDays: workingDays.length > 0 ? workingDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    documents,
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit?.(buildPayload(data)))}
      className="space-y-6"
    >
      {/* 1. Personal Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">1. Personal Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Staff member identity, contact coordinates, and emergency contact.
        </p>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <ImageUpload
              label="Staff Photo"
              value={avatar}
              onChange={setAvatar}
              hint="PNG or JPG up to 2MB"
            />
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g., Arthur Reyes"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required' })}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="staff@ironworksclub.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Phone Number *"
              placeholder="+1 (206) 555-0155"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
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
              placeholder="e.g., Sofia Reyes"
              {...register('emergencyContactName')}
            />
            <Input
              label="Emergency Contact Phone"
              placeholder="+1 (206) 555-0130"
              {...register('emergencyContactPhone')}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                placeholder="Street, city, state, ZIP"
                {...register('address')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Employment Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">2. Employment &amp; Role Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Operational role, assigned gym branch, shift hours, and responsibilities.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Role / Category *"
            options={STAFF_CATEGORIES.map((r) => ({ value: r, label: r }))}
            {...register('role', { required: 'Role is required' })}
          />
          <Select
            label="Assigned Branch *"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            {...register('branchId', { required: 'Branch is required' })}
          />
          <Input
            label="Department"
            placeholder="e.g., Operations, Finance"
            {...register('department')}
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
            label="Shift Timing"
            placeholder="e.g., 09:00 - 17:30"
            {...register('shiftTiming')}
          />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>

        <div className="mt-5">
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
                  onClick={() => toggleDay(day)}
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

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Key Responsibilities (one per line)
          </label>
          <textarea
            rows={3}
            placeholder="Front desk QR check-in verification&#10;Locker inventory management"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            {...register('responsibilities')}
          />
        </div>
      </section>

      {/* 3. Salary Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">3. Salary Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly base compensation, allowances, and payroll bank reference.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <span className="text-slate-500">Net Salary Preview: </span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {formatCurrency(previewPay.netSalary)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            label="Basic Salary (₹)"
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
            label="Bank Name"
            placeholder="e.g. State Bank of India / HDFC"
            {...register('bankName')}
          />
          <Input
            label="Account Last 4"
            maxLength={4}
            placeholder="2941"
            {...register('accountLast4')}
          />
        </div>
      </section>

      {/* 4. Documents */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">4. Documents</h2>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Document filename (e.g., Staff_Agreement_2026.pdf)"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              options={[
                { value: 'Contract', label: 'Contract' },
                { value: 'Identity Proof', label: 'Identity Proof' },
                { value: 'Certification', label: 'Certification' },
              ]}
            />
          </div>
          <Button type="button" variant="outline" icon={Plus} onClick={handleAddDocument}>
            Attach File
          </Button>
        </div>

        {documents.length > 0 && (
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
        )}
      </section>

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
          {mode === 'edit' ? 'Save Staff Changes' : 'Add Staff Member'}
        </Button>
      </div>
    </form>
  );
}

export default StaffForm;
