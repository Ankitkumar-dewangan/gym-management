import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Dumbbell,
  Filter,
  Megaphone,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { useGymAnalyticsNotifications } from '../../contexts/GymAnalyticsNotificationsContext';

export function MemberNotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useGymAnalyticsNotifications();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Default member-targeted sample notifications if none exists
  const memberNotifications = notifications.length > 0 ? notifications : [
    {
      id: 'notif-m-1',
      title: 'Upcoming Membership Renewal in 55 Days',
      message: 'Your Annual Elite Unlimited Access plan is set to expire on 14 Jan 2027. Early renewal discounts of 10% are currently active.',
      category: 'MEMBERSHIP',
      timestamp: 'Today at 09:00 AM',
      read: false,
    },
    {
      id: 'notif-m-2',
      title: 'Workout Regimen Update by Coach Vikram',
      message: 'Coach Vikram Singh has updated Day 1 Push Focus with new incline dumbbell presses.',
      category: 'WORKOUT',
      timestamp: 'Yesterday at 04:30 PM',
      read: false,
    },
    {
      id: 'notif-m-3',
      title: 'GST Tax Receipt Generated: INV-2026-9021',
      message: 'Your payment of ₹18,500 has been confirmed. The electronic receipt is ready for download.',
      category: 'PAYMENT',
      timestamp: '15 Nov 2026',
      read: true,
    },
    {
      id: 'notif-m-4',
      title: 'New Announcement: Annual Fitness Championship',
      message: 'Intra-club tournament registrations are now open for all active club members.',
      category: 'ANNOUNCEMENT',
      timestamp: '14 Nov 2026',
      read: true,
    },
  ];

  const filtered = memberNotifications.filter((n) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      (activeCategory === 'UNREAD' && !n.read) ||
      n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'MEMBERSHIP':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'WORKOUT':
        return <Dumbbell className="w-4 h-4 text-blue-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Notifications & Updates"
        description="Stay informed about membership renewal dates, trainer notes, payment receipts, and gym bulletins."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={CheckCheck}
            onClick={() => {
              markAllAsRead();
              toast.success('All notifications marked as read');
            }}
          >
            Mark All as Read
          </Button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'UNREAD', 'MEMBERSHIP', 'PAYMENT', 'WORKOUT', 'ANNOUNCEMENT'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search updates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            No notifications match your active filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 bg-white ${
                !item.read
                  ? 'border-primary-300 ring-1 ring-primary-500/20 bg-primary-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <span className="text-[11px] text-slate-400 block pt-0.5">
                    {item.timestamp} · {item.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    title="Mark as Read"
                    onClick={() => {
                      markAsRead(item.id);
                      toast.success('Marked as read');
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-slate-100"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete"
                  onClick={() => {
                    deleteNotification(item.id);
                    toast.success('Notification removed');
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MemberNotificationsPage;
