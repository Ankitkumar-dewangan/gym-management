import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

export default function AnnouncementsPage() {
  const { announcements, deleteAnnouncement } = useGymAnalyticsNotifications();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Club Announcements & Broadcasts"
        description="Publish facility bulletins, holiday hours, upcoming fitness tournaments, and promotional announcements."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/notifications">
              <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                Back to Notifications
              </Button>
            </Link>
            <Link to="/gym/notifications/announcements/create">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Create Announcement
              </Button>
            </Link>
          </div>
        }
      />

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(announcements || []).map((ann) => {
          const isPublished = ann.status === 'Published';
          const isScheduled = ann.status === 'Scheduled';
          const isExpired = ann.status === 'Expired';

          return (
            <div
              key={ann.id}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700'
                          : isScheduled
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ann.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {ann.id}</span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {ann.publishDate}
                  </span>
                </div>

                {ann.coverImage && (
                  <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={ann.coverImage}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{ann.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {ann.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-navy-900">
                    <Users className="w-3.5 h-3.5 text-navy-800" />
                    {ann.targetAudience}
                  </span>
                  <span>•</span>
                  <span>{ann.branch}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={Eye}
                    onClick={() => setSelectedAnnouncement(ann)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteAnnouncement(ann.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {selectedAnnouncement && (
        <Modal
          isOpen={Boolean(selectedAnnouncement)}
          onClose={() => setSelectedAnnouncement(null)}
          title="Announcement Live Preview"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-slate-800">
            {selectedAnnouncement.coverImage && (
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedAnnouncement.coverImage}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {selectedAnnouncement.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Valid: {selectedAnnouncement.publishDate} to {selectedAnnouncement.expiryDate}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedAnnouncement.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedAnnouncement.description}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex justify-between">
              <div>Audience: <strong className="text-slate-900">{selectedAnnouncement.targetAudience}</strong></div>
              <div>Facility: <strong className="text-slate-900">{selectedAnnouncement.branch}</strong></div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedAnnouncement(null)}
            >
              Close Preview
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
