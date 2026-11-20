import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  Upload,
  Calendar,
  Building2,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/ui/Modal';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';
import { useTenant } from '../../../contexts/TenantContext';

export default function CreateAnnouncementPage() {
  const navigate = useNavigate();
  const { createAnnouncement } = useGymAnalyticsNotifications();
  const { branches } = useTenant();

  const [form, setForm] = useState({
    title: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60',
    targetAudience: 'All Members',
    branch: 'All Branches',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Published',
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;

    createAnnouncement(form);
    navigate('/gym/notifications/announcements');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create Facility Announcement"
        description="Draft and broadcast announcements to member portals, trainer feeds, or specific branch locations."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/notifications/announcements">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to List
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Eye}
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base">Announcement Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">Specify headline, content copy, target group, and schedule.</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Announcement Title"
              required
              placeholder="e.g. Winter Strength Challenge 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Announcement Message / Body <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide clear details regarding timings, registration instructions, or guidelines..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target Audience"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                options={[
                  { value: 'All Members', label: 'All Registered Members' },
                  { value: 'Active Members', label: 'Active Regular Members' },
                  { value: 'Trainers', label: 'Fitness Trainers & Coaches' },
                  { value: 'Staff', label: 'Facility Staff' },
                  { value: 'Selected Branch', label: 'Specific Branch Only' },
                ]}
              />

              <Select
                label="Target Branch"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                options={[
                  { value: 'All Branches', label: 'All Branches' },
                  ...(branches || []).map((b) => ({ value: b.name, label: b.name })),
                ]}
              />

              <Input
                type="date"
                label="Publish Date"
                value={form.publishDate}
                onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
              />

              <Input
                type="date"
                label="Expiry Date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />

              <Select
                label="Priority Surcharge"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                options={[
                  { value: 'High', label: 'High Priority (Prominent Banner)' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low / Information' },
                ]}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'Published', label: 'Publish Immediately' },
                  { value: 'Scheduled', label: 'Schedule for Later' },
                  { value: 'Draft', label: 'Save as Draft' },
                ]}
              />
            </div>

            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/gym/notifications/announcements">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" leftIcon={Megaphone}>
            Broadcast Announcement
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewOpen && (
        <Modal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Announcement Live Card Preview"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-800">
            {form.coverImage && (
              <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100">
                <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900">{form.title || 'Untitled Announcement'}</h3>
            <p className="text-slate-600 leading-relaxed">{form.description || 'No description provided yet.'}</p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
              <span>Audience: <strong>{form.targetAudience}</strong></span>
              <span>Branch: <strong>{form.branch}</strong></span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
