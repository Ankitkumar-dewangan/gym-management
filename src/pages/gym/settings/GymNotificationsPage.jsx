import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  Info,
  Trash2,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    category: 'renewals',
    title: 'Membership Expiring Soon',
    message: 'Aarav Sharma (MEM-4094) has 4 days remaining on "Quarterly Strength Plan".',
    time: '15 mins ago',
    unread: true,
    priority: 'high',
    actionLabel: 'Send Renewal Link',
  },
  {
    id: 'n-2',
    category: 'payments',
    title: 'Fee Collection Received',
    message: '₹14,500 collected via UPI from Rohan Mehra for Annual All-Access renewal.',
    time: '1 hour ago',
    unread: true,
    priority: 'normal',
    actionLabel: 'View Receipt',
  },
  {
    id: 'n-3',
    category: 'attendance',
    title: 'Peak Occupancy Milestone',
    message: 'Downtown Branch exceeded 85 active concurrent check-ins at 07:30 PM.',
    time: 'Yesterday',
    unread: false,
    priority: 'info',
  },
  {
    id: 'n-4',
    category: 'system',
    title: 'Biometric Scanner Sync Complete',
    message: 'Access gate reader #02 at West Arena synced 142 check-in logs successfully.',
    time: '2 days ago',
    unread: false,
    priority: 'info',
  },
  {
    id: 'n-5',
    category: 'renewals',
    title: 'Overdue Dues Reminder',
    message: '3 members have dues pending over 5 days. Total overdue amount: ₹18,000.',
    time: '3 days ago',
    unread: false,
    priority: 'high',
    actionLabel: 'Send Reminder',
  },
];

export function GymNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    if (activeFilter !== 'all') return n.category === activeFilter;
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const markSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification dismissed');
  };

  const getIcon = (category) => {
    switch (category) {
      case 'renewals':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'payments':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'attendance':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Club Notifications Center"
        description="Monitor automated payment triggers, membership expiration alerts, peak attendance milestones, and system notices."
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark All as Read
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Notifications' },
          { key: 'unread', label: 'Unread Only' },
          { key: 'renewals', label: 'Renewals & Expiries' },
          { key: 'payments', label: 'Payments' },
          { key: 'attendance', label: 'Attendance' },
          { key: 'system', label: 'System' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this filter"
          description="You are completely caught up! New alerts and member notifications will appear here in real time."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                item.unread
                  ? 'bg-primary-50/40 border-primary-200 shadow-2xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-100 flex-shrink-0">
                {getIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                  {item.priority === 'high' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                      High Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                  {item.actionLabel && (
                    <button
                      onClick={() => toast.success(`Action taken: ${item.actionLabel}`)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {item.unread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markSingleRead(item.id)}
                    title="Mark read"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-400 hover:text-emerald-600" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(item.id)}
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GymNotificationsPage;
