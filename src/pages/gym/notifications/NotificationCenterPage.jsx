import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  Settings,
  Megaphone,
  CreditCard,
  Users,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useGymAnalyticsNotifications } from '../../../contexts/GymAnalyticsNotificationsContext';

const CATEGORIES = [
  { id: 'all', label: 'All Notifications' },
  { id: 'members', label: 'Members' },
  { id: 'membership_expiry', label: 'Membership Expiry' },
  { id: 'payments', label: 'Payments' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'system', label: 'System' },
  { id: 'announcements', label: 'Announcements' },
];

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  } = useGymAnalyticsNotifications();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Filtered
  const filtered = useMemo(() => {
    return (notifications || []).filter((n) => {
      const matchSearch =
        !search ||
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.description?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = activeCategory === 'all' || n.category === activeCategory;
      const matchPriority = activePriority === 'all' || n.priority === activePriority;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [notifications, search, activeCategory, activePriority]);

  const totalCount = (notifications || []).length;
  const readCount = totalCount - unreadCount;
  const criticalCount = (notifications || []).filter(
    (n) => n.priority === 'critical' || n.priority === 'high'
  ).length;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'membership_expiry':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'payments':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'attendance':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'expenses':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'members':
        return <Users className="w-4 h-4 text-indigo-500" />;
      case 'announcements':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Notification Center"
        description="Real-time operational alerts, member contract milestones, payment receipts, and critical facility events."
        actions={
          <div className="flex gap-2">
            <Link to="/gym/notifications/settings">
              <Button variant="outline" size="sm" leftIcon={Settings}>
                Preferences
              </Button>
            </Link>
            <Link to="/gym/notifications/announcements">
              <Button variant="outline" size="sm" leftIcon={Megaphone}>
                Announcements
              </Button>
            </Link>
            {unreadCount > 0 && (
              <Button variant="primary" size="sm" leftIcon={CheckCircle2} onClick={markAllAsRead}>
                Mark All as Read ({unreadCount})
              </Button>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Alerts
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Logged notifications</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">
            Unread Notifications
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{unreadCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Require attention</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block">
            Acknowledged / Read
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{readCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Audited alerts</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block">
            Critical & Urgent
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{criticalCount}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">High priority tasks</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800/10 focus:border-navy-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={activePriority}
              onChange={(e) => setActivePriority(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Categories Tab Strip */}
        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                activeCategory === c.id
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-200 bg-white shadow-2xs">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="font-semibold text-slate-800 text-sm">No Notifications Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are no notifications matching the selected filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const isUnread = n.unread;
            const isCritical = n.priority === 'critical' || n.priority === 'high';

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'border-navy-200 bg-navy-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                    {getCategoryIcon(n.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      {isUnread && (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          n.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : n.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {n.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>{n.time}</span>
                      <span>•</span>
                      <span className="capitalize">{n.category.replace('_', ' ')}</span>
                      {n.link && (
                        <>
                          <span>•</span>
                          <Link
                            to={n.link}
                            className="font-semibold text-navy-800 hover:underline inline-flex items-center gap-1"
                          >
                            Open Link <ExternalLink className="w-3 h-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      if (isUnread) markAsRead(n.id);
                      else markAsUnread(n.id);
                    }}
                  >
                    {isUnread ? 'Mark Read' : 'Unread'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
