import { useRef, useState } from 'react';
import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';
import ImageUpload from '../../ui/ImageUpload';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { BRANCH_MEDIA, BRANCH_TYPES } from '../../../constants/branchManagementData';
import { cn } from '../../../utils/cn';

const COVER_PRESETS = [
  { label: 'Industrial Club', src: BRANCH_MEDIA.downtownCover },
  { label: 'Boutique Studio', src: BRANCH_MEDIA.bellevueCover },
  { label: 'Reception Lounge', src: BRANCH_MEDIA.receptionCover },
  { label: 'Conditioning Lab', src: BRANCH_MEDIA.studioCover },
];

const WEEKLY_OFF_OPTIONS = [
  { value: 'Open All 7 Days', label: 'Open All 7 Days' },
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Wednesday', label: 'Wednesday' },
];

const FACILITY_FLAGS = [
  { key: 'lockerFacility', label: 'Locker Facility' },
  { key: 'showerFacility', label: 'Shower Facility' },
  { key: 'parkingFacility', label: 'Parking Facility' },
  { key: 'acFacility', label: 'AC Facility' },
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

export function BranchForm({
  initialData = null,
  managers = [],
  mode = 'create',
  onSubmit,
  onSaveDraft,
  onCancel,
}) {
  const docInputRef = useRef(null);

  const [form, setForm] = useState(() => ({
    name: initialData?.name || '',
    code: initialData?.code || '',
    logo: initialData?.logo || '',
    coverImage: initialData?.coverImage || BRANCH_MEDIA.downtownCover,
    branchType: initialData?.branchType || 'Flagship Club',
    openingDate: initialData?.openingDate || '2026-11-19',
    status: initialData?.status || 'active',
    contactPerson: initialData?.contactPerson || '',
    contactNumber: initialData?.contactNumber || '',
    alternateNumber: initialData?.alternateNumber || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    country: initialData?.country || 'United States',
    state: initialData?.state || '',
    city: initialData?.city || '',
    area: initialData?.area || '',
    fullAddress: initialData?.fullAddress || '',
    pinCode: initialData?.pinCode || '',
    mapsUrl: initialData?.mapsUrl || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    totalArea: initialData?.totalArea || '',
    floors: String(initialData?.floors ?? '1'),
    workoutZones: String(initialData?.workoutZones ?? '3'),
    lockerFacility: initialData?.lockerFacility ?? true,
    showerFacility: initialData?.showerFacility ?? true,
    parkingFacility: initialData?.parkingFacility ?? true,
    acFacility: initialData?.acFacility ?? true,
    equipmentSummary: initialData?.equipmentSummary || '',
    openingTime: initialData?.openingTime || '05:30',
    closingTime: initialData?.closingTime || '22:00',
    weeklyOff: initialData?.weeklyOff || 'Open All 7 Days',
    weekendTimings: initialData?.weekendTimings || '07:00 AM – 08:30 PM',
    managerMode: initialData?.managerId ? 'existing' : managers.length > 0 ? 'existing' : 'new',
    managerId: initialData?.managerId || managers[0]?.id || '',
    newManagerName: '',
    newManagerEmail: '',
    newManagerPhone: '',
    maxCapacity: String(initialData?.maxCapacity ?? '400'),
    notes: initialData?.notes || '',
    documents: initialData?.documents || [],
  }));

  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Branch name is required';
    if (!form.code.trim()) nextErrors.code = 'Branch code is required';
    if (!form.city.trim()) nextErrors.city = 'City is required';
    if (!form.contactPerson.trim()) nextErrors.contactPerson = 'Contact person is required';
    if (!form.contactNumber.trim()) nextErrors.contactNumber = 'Contact number is required';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = 'Valid email address is required';
    }
    if (!form.fullAddress.trim()) nextErrors.fullAddress = 'Full address is required';
    if (form.managerMode === 'new') {
      if (!form.newManagerName.trim()) nextErrors.newManagerName = 'Manager name is required';
      if (!form.newManagerEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.newManagerEmail.trim())) {
        nextErrors.newManagerEmail = 'Valid manager email is required';
      }
      if (!form.newManagerPhone.trim()) nextErrors.newManagerPhone = 'Manager mobile number is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please review the highlighted form fields');
      return;
    }
    onSubmit?.(form);
  };

  const handleDraft = () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Enter at least a branch name to save a draft' });
      toast.error('Branch name is required to save a draft');
      return;
    }
    onSaveDraft?.(form);
  };

  const handleDocumentPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const names = files.map((f) => f.name);
    updateField('documents', Array.from(new Set([...form.documents, ...names])));
    toast.success(`${files.length} document${files.length > 1 ? 's' : ''} attached`);
    e.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* SECTION A: BASIC INFORMATION */}
      <SectionCard
        title="Section A: Basic Information"
        subtitle="Identity, branding imagery, classification, and operational status."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Branch Name"
            required
            placeholder="e.g. Westlake Performance Hub"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label="Branch Code"
            required
            placeholder="e.g. IWC-WL-05"
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            error={errors.code}
          />
          <Select
            label="Branch Type"
            value={form.branchType}
            onChange={(e) => updateField('branchType', e.target.value)}
            options={BRANCH_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="Opening Date"
            type="date"
            value={form.openingDate}
            onChange={(e) => updateField('openingDate', e.target.value)}
          />
          <Select
            label="Branch Status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          <ImageUpload
            label="Branch Logo"
            value={form.logo}
            onChange={(val) => updateField('logo', val)}
            aspect="square"
            hint="Square PNG, JPG or WEBP up to 2MB"
          />

          <div className="space-y-2.5">
            <ImageUpload
              label="Branch Cover Image"
              value={form.coverImage}
              onChange={(val) => updateField('coverImage', val)}
              aspect="wide"
              hint="16:9 facility photograph up to 2MB"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Quick presets:</span>
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateField('coverImage', preset.src)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs font-medium transition-colors cursor-pointer',
                    form.coverImage === preset.src
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION B: CONTACT INFORMATION */}
      <SectionCard
        title="Section B: Contact Information"
        subtitle="Primary reception and front-desk escalation details."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Contact Person"
            required
            placeholder="e.g. Nathaniel Cole"
            value={form.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            error={errors.contactPerson}
          />
          <Input
            label="Contact Number"
            required
            placeholder="+1 (206) 555-0142"
            value={form.contactNumber}
            onChange={(e) => updateField('contactNumber', e.target.value)}
            error={errors.contactNumber}
          />
          <Input
            label="Alternate Number"
            placeholder="+1 (206) 555-0100"
            value={form.alternateNumber}
            onChange={(e) => updateField('alternateNumber', e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="branch@ironworksclub.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Website"
            placeholder="https://ironworksclub.com/branch"
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>
      </SectionCard>

      {/* SECTION C: ADDRESS INFORMATION */}
      <SectionCard
        title="Section C: Address Information"
        subtitle="Physical street coordinates, city, PIN/ZIP code, and map reference."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => updateField('country', e.target.value)}
          />
          <Input
            label="State"
            placeholder="e.g. Washington"
            value={form.state}
            onChange={(e) => updateField('state', e.target.value)}
          />
          <Input
            label="City"
            required
            placeholder="e.g. Seattle"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            error={errors.city}
          />
          <Input
            label="Area / Locality"
            placeholder="e.g. South Lake Union"
            value={form.area}
            onChange={(e) => updateField('area', e.target.value)}
          />
          <Input
            label="PIN / ZIP Code"
            placeholder="e.g. 98109"
            value={form.pinCode}
            onChange={(e) => updateField('pinCode', e.target.value)}
          />
          <Input
            label="Google Maps Location URL"
            placeholder="https://maps.google.com/?q=..."
            value={form.mapsUrl}
            onChange={(e) => updateField('mapsUrl', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <Input
              label="Full Address"
              required
              placeholder="Street number, suite, and landmark"
              value={form.fullAddress}
              onChange={(e) => updateField('fullAddress', e.target.value)}
              error={errors.fullAddress}
            />
          </div>
          <div className="md:col-span-3">
            <Input
              label="Latitude (Optional)"
              placeholder="47.6205"
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Input
              label="Longitude (Optional)"
              placeholder="-122.3493"
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION D: FACILITY INFORMATION */}
      <SectionCard
        title="Section D: Facility Information"
        subtitle="Floor dimensions, workout zones, amenities, and training equipment."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Total Gym Area"
            placeholder="e.g. 12,500 sq ft"
            value={form.totalArea}
            onChange={(e) => updateField('totalArea', e.target.value)}
          />
          <Input
            label="Number of Floors"
            type="number"
            min="1"
            value={form.floors}
            onChange={(e) => updateField('floors', e.target.value)}
          />
          <Input
            label="Number of Workout Zones"
            type="number"
            min="1"
            value={form.workoutZones}
            onChange={(e) => updateField('workoutZones', e.target.value)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Available Facilities</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FACILITY_FLAGS.map((item) => {
              const checked = Boolean(form[item.key]);
              return (
                <label
                  key={item.key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors',
                    checked
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="equipment-summary"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Equipment Availability
          </label>
          <textarea
            id="equipment-summary"
            rows={2}
            placeholder="Describe power racks, cardio fleet, turf lanes, and recovery suites..."
            value={form.equipmentSummary}
            onChange={(e) => updateField('equipmentSummary', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
          />
        </div>
      </SectionCard>

      {/* SECTION E: OPERATING HOURS */}
      <SectionCard
        title="Section E: Operating Hours"
        subtitle="Weekday floor hours, weekly holiday schedule, and weekend timings."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Opening Time"
            type="time"
            value={form.openingTime}
            onChange={(e) => updateField('openingTime', e.target.value)}
          />
          <Input
            label="Closing Time"
            type="time"
            value={form.closingTime}
            onChange={(e) => updateField('closingTime', e.target.value)}
          />
          <Select
            label="Weekly Off"
            value={form.weeklyOff}
            onChange={(e) => updateField('weeklyOff', e.target.value)}
            options={WEEKLY_OFF_OPTIONS}
          />
          <Input
            label="Weekend Timings"
            placeholder="07:00 AM – 08:30 PM"
            value={form.weekendTimings}
            onChange={(e) => updateField('weekendTimings', e.target.value)}
          />
        </div>
      </SectionCard>

      {/* SECTION F: BRANCH MANAGER */}
      <SectionCard
        title="Section F: Branch Manager"
        subtitle="Assign an existing club manager or onboard a new primary manager."
      >
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => updateField('managerMode', 'existing')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
              form.managerMode === 'existing'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Select Existing Manager
          </button>
          <button
            type="button"
            onClick={() => updateField('managerMode', 'new')}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
              form.managerMode === 'new'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add New Manager
          </button>
        </div>

        {form.managerMode === 'existing' ? (
          <div className="max-w-md">
            <Select
              label="Assigned Primary Manager"
              value={form.managerId}
              onChange={(e) => updateField('managerId', e.target.value)}
              options={
                managers.length > 0
                  ? managers.map((m) => ({
                      value: m.id,
                      label: `${m.name} (${m.email})`,
                    }))
                  : [{ value: '', label: 'No existing managers — switch to Add New Manager' }]
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Manager Name"
              required
              placeholder="e.g. Jordan Hayes"
              value={form.newManagerName}
              onChange={(e) => updateField('newManagerName', e.target.value)}
              error={errors.newManagerName}
            />
            <Input
              label="Manager Email"
              type="email"
              required
              placeholder="jordan.h@ironworksclub.com"
              value={form.newManagerEmail}
              onChange={(e) => updateField('newManagerEmail', e.target.value)}
              error={errors.newManagerEmail}
            />
            <Input
              label="Mobile Number"
              required
              placeholder="+1 (206) 555-0195"
              value={form.newManagerPhone}
              onChange={(e) => updateField('newManagerPhone', e.target.value)}
              error={errors.newManagerPhone}
            />
          </div>
        )}
      </SectionCard>

      {/* SECTION G: ADDITIONAL SETTINGS */}
      <SectionCard
        title="Section G: Additional Settings"
        subtitle="Member capacity limits, operational notes, and compliance documents."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Maximum Member Capacity"
            type="number"
            min="20"
            value={form.maxCapacity}
            onChange={(e) => updateField('maxCapacity', e.target.value)}
          />
          <div className="md:col-span-2">
            <label
              htmlFor="branch-notes"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Branch Notes
            </label>
            <textarea
              id="branch-notes"
              rows={2}
              placeholder="Internal notes regarding lease, parking validation, or class rollout..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Documents Upload</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => docInputRef.current?.click()}
            >
              Attach Documents
            </Button>
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="sr-only"
              onChange={handleDocumentPick}
            />
          </div>

          {form.documents.length > 0 ? (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50">
              {form.documents.map((doc) => (
                <li key={doc} className="flex items-center justify-between px-3.5 py-2 text-xs">
                  <span className="flex items-center gap-2 text-slate-700 truncate">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{doc}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'documents',
                        form.documents.filter((d) => d !== doc)
                      )
                    }
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              No compliance permits or lease files attached yet.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Form Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {mode === 'create' && onSaveDraft && (
          <Button type="button" variant="secondary" onClick={handleDraft}>
            Save as Draft
          </Button>
        )}
        <Button type="submit" variant="emerald">
          {mode === 'edit' ? 'Save Branch Changes' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}

export default BranchForm;
