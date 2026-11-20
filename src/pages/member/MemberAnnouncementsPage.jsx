import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Megaphone,
  Pin,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { MEMBER_ANNOUNCEMENTS_DATA } from '../../constants/memberPortalData';

export function MemberAnnouncementsPage() {
  const [announcements] = useState(MEMBER_ANNOUNCEMENTS_DATA);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenDetail = (item) => {
    setSelectedAnnouncement(item);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Club Bulletins & Announcements"
        description="Official gym updates, holiday scheduling, upcoming tournaments, and fitness facility notices."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {announcements.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-900">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.priority === 'High'
                        ? 'bg-rose-600 text-white'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 backdrop-blur-xs text-white">
                    {item.branch}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.date}</span>
                  <span>{item.author}</span>
                </div>
                <h3 className="font-bold text-base text-slate-800 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => handleOpenDetail(item)}
              >
                Read Full Bulletin
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Announcement Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedAnnouncement?.title || 'Bulletin'}
        maxWidth="max-w-lg"
      >
        {selectedAnnouncement && (
          <div className="p-6 space-y-4 text-xs text-slate-600">
            <div className="h-48 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={selectedAnnouncement.coverImage}
                alt={selectedAnnouncement.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-2">
              <span>Posted by: <strong>{selectedAnnouncement.author}</strong></span>
              <span>Date: <strong>{selectedAnnouncement.date}</strong></span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500">
              📍 Applicable Scope: <strong>{selectedAnnouncement.branch}</strong> ({selectedAnnouncement.category})
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MemberAnnouncementsPage;
