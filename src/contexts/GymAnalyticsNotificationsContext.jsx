import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_ANALYTICS_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_SAVED_REPORTS,
} from '../constants/gymAnalyticsNotificationsData';

const STORAGE_KEY = 'gympilot_analytics_notifications_v1';

const GymAnalyticsNotificationsContext = createContext(null);

export function GymAnalyticsNotificationsProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse analytics/notifications data from localStorage', e);
    }
    return {
      notifications: INITIAL_ANALYTICS_NOTIFICATIONS,
      announcements: INITIAL_ANNOUNCEMENTS,
      preferences: INITIAL_NOTIFICATION_PREFERENCES,
      savedReports: INITIAL_SAVED_REPORTS,
    };
  });

  // Global Dashboard Filter State
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: 'month', // 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'quarter' | 'year' | 'custom'
    customStartDate: '',
    customEndDate: '',
    branch: 'all',
    plan: 'all',
  });

  const setGlobalFilter = (key, value) => {
    setGlobalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetGlobalFilters = () => {
    setGlobalFilters({
      dateRange: 'month',
      customStartDate: '',
      customEndDate: '',
      branch: 'all',
      plan: 'all',
    });
    toast.success('Analytics filters reset');
  };

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save analytics/notifications data to localStorage', e);
    }
  }, [data]);

  // Notifications operations
  const unreadCount = (data.notifications || []).filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }));
  };

  const markAsUnread = (id) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, unread: true } : n)),
    }));
    toast('Marked as unread');
  };

  const markAllAsRead = () => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
    }));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
    toast.success('Notification removed');
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      unread: true,
      priority: 'medium',
      category: 'system',
      ...notif,
    };
    setData((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
    return newNotif;
  };

  // Announcements operations
  const createAnnouncement = (ann) => {
    const newAnn = {
      id: `ann-${Date.now().toString().slice(-4)}`,
      createdBy: 'Club Management',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'Published',
      priority: 'Medium',
      ...ann,
    };

    setData((prev) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements],
    }));

    // Also dispatch a system notification
    addNotification({
      category: 'announcements',
      title: `Announcement: ${newAnn.title}`,
      description: newAnn.description.slice(0, 90) + '...',
      link: '/gym/notifications/announcements',
      priority: newAnn.priority.toLowerCase(),
    });

    toast.success('Announcement broadcasted successfully!');
    return newAnn;
  };

  const updateAnnouncement = (id, fields) => {
    setData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => (a.id === id ? { ...a, ...fields } : a)),
    }));
    toast.success('Announcement updated');
  };

  const deleteAnnouncement = (id) => {
    setData((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
    toast.success('Announcement removed');
  };

  // Preferences operations
  const updatePreferences = (category, channel, val) => {
    setData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...(prev.preferences[category] || {}),
          [channel]: val,
        },
      },
    }));
  };

  const saveAllPreferences = (newPrefs) => {
    setData((prev) => ({
      ...prev,
      preferences: newPrefs,
    }));
    toast.success('Notification preferences updated!');
  };

  const resetPreferences = () => {
    setData((prev) => ({
      ...prev,
      preferences: INITIAL_NOTIFICATION_PREFERENCES,
    }));
    toast.success('Notification preferences restored');
  };

  // Saved Reports operations
  const saveReport = (rep) => {
    const newRep = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      createdBy: 'Gym Director',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      type: rep.visualization || 'Table',
      ...rep,
    };

    setData((prev) => ({
      ...prev,
      savedReports: [newRep, ...prev.savedReports],
    }));

    toast.success(`Report "${newRep.name}" saved!`);
    return newRep;
  };

  const updateReport = (id, fields) => {
    setData((prev) => ({
      ...prev,
      savedReports: prev.savedReports.map((r) =>
        r.id === id ? { ...r, ...fields, lastUpdated: new Date().toISOString().split('T')[0] } : r
      ),
    }));
    toast.success('Report configuration updated');
  };

  const deleteReport = (id) => {
    setData((prev) => ({
      ...prev,
      savedReports: prev.savedReports.filter((r) => r.id !== id),
    }));
    toast.success('Report removed');
  };

  const duplicateReport = (id) => {
    const target = data.savedReports.find((r) => r.id === id);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `rep-${Date.now().toString().slice(-4)}`,
      name: `${target.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({
      ...prev,
      savedReports: [duplicated, ...prev.savedReports],
    }));
    toast.success('Report duplicated');
  };

  return (
    <GymAnalyticsNotificationsContext.Provider
      value={{
        notifications: data.notifications,
        unreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        addNotification,
        announcements: data.announcements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        preferences: data.preferences,
        updatePreferences,
        saveAllPreferences,
        resetPreferences,
        savedReports: data.savedReports,
        saveReport,
        updateReport,
        deleteReport,
        duplicateReport,
        globalFilters,
        setGlobalFilter,
        resetGlobalFilters,
      }}
    >
      {children}
    </GymAnalyticsNotificationsContext.Provider>
  );
}

export function useGymAnalyticsNotifications() {
  const ctx = useContext(GymAnalyticsNotificationsContext);
  if (!ctx) {
    throw new Error('useGymAnalyticsNotifications must be used within a GymAnalyticsNotificationsProvider');
  }
  return ctx;
}
