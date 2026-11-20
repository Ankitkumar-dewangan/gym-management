import { useState } from 'react';
import {
  Building2,
  Clock,
  Dumbbell,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useTenant } from '../../../contexts/TenantContext';

export function GymBusinessProfilePage() {
  const { activeTenant, activeBranch } = useTenant();

  const [form, setForm] = useState({
    businessName: activeTenant?.name || 'Pulse Fitness Studio',
    tagline: 'Transforming Lives Through Elite Fitness, Strength & Community',
    gstin: '27AABCU9603R1ZM',
    regNumber: 'MH-MUM-2024-FIT-889',
    foundedYear: '2021',
    email: 'info@mygymclub.com',
    phone: '+91 22 2844 9011',
    website: 'https://mygymclub.in',
    instagram: '@pulsefitness_india',
    address: 'Plot 42, Link Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    openingWeekdays: '06:00 AM - 11:00 PM',
    openingSundays: '07:00 AM - 08:00 PM',
  });

  const [amenities, setAmenities] = useState([
    { id: '1', label: 'Heavy Strength & Powerlifting Zone', checked: true },
    { id: '2', label: 'Functional Crossfit Turf', checked: true },
    { id: '3', label: 'Cardio Deck with TV & Heart Rate Sync', checked: true },
    { id: '4', label: 'Steam & Dry Sauna Bath', checked: true },
    { id: '5', label: 'Nutrition & Protein Shake Cafe', checked: true },
    { id: '6', label: 'Luxury Locker Rooms & Showers', checked: true },
    { id: '7', label: 'In-Body 570 Body Composition Scanner', checked: true },
    { id: '8', label: 'Free Covered Valet Parking', checked: false },
  ]);

  const toggleAmenity = (id) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Gym business profile saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Business Profile & Branding"
        description="Configure your official gym legal entity details, operational hours, facilities, and contact points."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Legal Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" /> Organization & Legal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Business / Brand Name"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
            <Input
              label="GSTIN Number"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="e.g. 27AABCU9603R1ZM"
            />
            <Input
              label="Registration / CIN"
              value={form.regNumber}
              onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
            />
            <Input
              label="Official Contact Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Public Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Website URL"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Brand Tagline / Slogan"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>
        </div>

        {/* Operating Hours & Physical Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> Operational Hours
            </h3>
            <div className="space-y-4">
              <Input
                label="Monday to Saturday"
                value={form.openingWeekdays}
                onChange={(e) => setForm({ ...form, openingWeekdays: e.target.value })}
              />
              <Input
                label="Sunday & Public Holidays"
                value={form.openingSundays}
                onChange={(e) => setForm({ ...form, openingSundays: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                These timings appear on automated member welcome emails and Google Business snippets.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Headquarters Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Input
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <Input
                label="Instagram Handle"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Club Amenities */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" /> Club Amenities & Equipment Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {amenities.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleAmenity(item.id)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" leftIcon={Save}>
            Save Gym Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GymBusinessProfilePage;
