import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ACTIVE_SESSIONS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_AUDIT_LOGS,
  INITIAL_GENERAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLATFORM_USERS,
  INITIAL_ROLES,
  INITIAL_TICKETS,
} from '../constants/platformData';

const STORAGE_KEY = 'GymPilot_platform_management_v2';

const PlatformManagementContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : INITIAL_ROLES,
          tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          settings: parsed.settings || INITIAL_GENERAL_SETTINGS,
          adminProfile: parsed.adminProfile || INITIAL_ADMIN_PROFILE,
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    users: [],
    roles: INITIAL_ROLES,
    tickets: [],
    notifications: [],
    auditLogs: [],
    settings: INITIAL_GENERAL_SETTINGS,
    adminProfile: INITIAL_ADMIN_PROFILE,
    sessions: [],
  };
}

function nowTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function PlatformManagementProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write errors
    }
  }, [state]);

  const appendLog = useCallback((prev, action, actionType, moduleName, description, status = 'success') => {
    const entry = {
      id: `AUD-${Math.floor(5511 + Math.random() * 4000)}`,
      user: prev.adminProfile?.fullName || 'Elena Vance',
      role: 'Super Admin',
      action,
      actionType,
      module: moduleName,
      description,
      ipAddress: '198.51.100.42',
      timestamp: nowTimestamp(),
      status,
    };
    return [entry, ...(prev.auditLogs || [])];
  }, []);

  // --- Users ---
  const updateUser = useCallback(
    (userId, updates) => {
      setState((prev) => {
        const target = prev.users.find((u) => u.id === userId);
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          auditLogs: appendLog(
            prev,
            'Updated User',
            'update',
            'Users',
            `Updated profile details for ${target?.fullName || userId}`
          ),
        };
      });
    },
    [appendLog]
  );

  const updateUserStatus = useCallback(
    (userId, nextStatus) => {
      setState((prev) => {
        const target = prev.users.find((u) => u.id === userId);
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)),
          auditLogs: appendLog(
            prev,
            nextStatus === 'suspended' ? 'Suspended User' : 'Changed User Status',
            nextStatus === 'suspended' ? 'security' : 'update',
            'Users',
            `Set ${target?.fullName || userId} status to ${nextStatus}`,
            nextStatus === 'suspended' ? 'warning' : 'success'
          ),
        };
      });
    },
    [appendLog]
  );

  // --- Roles & Permissions ---
  const createRole = useCallback(
    (payload) => {
      const created = {
        id: `role_${Date.now()}`,
        name: payload.name.trim(),
        description: payload.description.trim(),
        userCount: 0,
        isSystem: false,
        permissions: payload.permissions,
      };
      setState((prev) => ({
        ...prev,
        roles: [...prev.roles, created],
        auditLogs: appendLog(
          prev,
          'Created Role',
          'create',
          'Roles & Permissions',
          `Created custom role "${created.name}"`
        ),
      }));
      return created;
    },
    [appendLog]
  );

  const updateRole = useCallback(
    (roleId, updates) => {
      setState((prev) => {
        const target = prev.roles.find((r) => r.id === roleId);
        return {
          ...prev,
          roles: prev.roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)),
          auditLogs: appendLog(
            prev,
            'Modified Role',
            'security',
            'Roles & Permissions',
            `Updated role & permission matrix for ${updates.name || target?.name || roleId}`
          ),
        };
      });
    },
    [appendLog]
  );

  const deleteRole = useCallback(
    (roleId) => {
      setState((prev) => {
        const target = prev.roles.find((r) => r.id === roleId);
        return {
          ...prev,
          roles: prev.roles.filter((r) => r.id !== roleId),
          auditLogs: appendLog(
            prev,
            'Deleted Role',
            'delete',
            'Roles & Permissions',
            `Deleted custom role "${target?.name || roleId}"`,
            'warning'
          ),
        };
      });
    },
    [appendLog]
  );

  // --- Support Tickets ---
  const updateTicket = useCallback(
    (ticketId, updates, logAction = 'Updated Ticket') => {
      setState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)),
        auditLogs: appendLog(
          prev,
          logAction,
          'update',
          'Support',
          `${logAction} on ticket ${ticketId}`
        ),
      }));
    },
    [appendLog]
  );

  const addTicketReply = useCallback(
    (ticketId, body, isInternal = false) => {
      const stamp = nowTimestamp().slice(0, 16);
      setState((prev) => {
        const senderName = prev.adminProfile?.fullName || 'Elena Vance';
        return {
          ...prev,
          tickets: prev.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            if (isInternal) {
              return {
                ...t,
                internalNotes: [
                  ...(t.internalNotes || []),
                  { id: `note_${Date.now()}`, author: senderName, text: body, date: stamp },
                ],
              };
            }
            return {
              ...t,
              status: t.status === 'open' ? 'in_progress' : t.status,
              messages: [
                ...(t.messages || []),
                {
                  id: `msg_${Date.now()}`,
                  sender: senderName,
                  role: 'Super Admin',
                  body,
                  date: stamp,
                },
              ],
            };
          }),
          auditLogs: appendLog(
            prev,
            isInternal ? 'Added Internal Note' : 'Replied to Ticket',
            'create',
            'Support',
            `${isInternal ? 'Internal note' : 'Reply'} posted on ${ticketId}`
          ),
        };
      });
    },
    [appendLog]
  );

  // --- Notifications ---
  const createNotification = useCallback(
    (payload) => {
      const today = new Date().toISOString().slice(0, 10);
      const item = {
        id: `NTF-${Math.floor(906 + Math.random() * 900)}`,
        title: payload.title.trim(),
        type: payload.type,
        channels: payload.channels?.length ? payload.channels : ['In-App'],
        audience: payload.audience || 'All Gym Owners',
        scheduledFor: payload.scheduledFor || `${today} Immediate`,
        createdAt: today,
        status: payload.isScheduled ? 'scheduled' : 'sent',
        read: false,
        message: payload.message.trim(),
      };
      setState((prev) => ({
        ...prev,
        notifications: [item, ...prev.notifications],
        auditLogs: appendLog(
          prev,
          payload.isScheduled ? 'Scheduled Notification' : 'Sent Notification',
          'create',
          'Notifications',
          `Dispatched "${item.title}" via ${(item.channels || []).join(', ')}`
        ),
      }));
      return item;
    },
    [appendLog]
  );

  const updateNotification = useCallback((id, updates) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const toggleNotificationRead = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      ),
    }));
  }, []);

  // --- Settings & Profile ---
  const updateSettings = useCallback(
    (updates) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
        auditLogs: appendLog(
          prev,
          'Updated Settings',
          'update',
          'Settings',
          'Saved platform configuration updates'
        ),
      }));
    },
    [appendLog]
  );

  const updateAdminProfile = useCallback(
    (updates) => {
      setState((prev) => ({
        ...prev,
        adminProfile: { ...prev.adminProfile, ...updates },
        auditLogs: appendLog(
          prev,
          'Updated Profile',
          'update',
          'Profile',
          'Updated Super Admin profile preferences'
        ),
      }));
    },
    [appendLog]
  );

  const revokeSession = useCallback(
    (sessionId) => {
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sessionId),
        auditLogs: appendLog(
          prev,
          'Revoked Session',
          'security',
          'Profile',
          `Terminated active device session ${sessionId}`,
          'warning'
        ),
      }));
    },
    [appendLog]
  );

  const value = useMemo(
    () => ({
      users: state.users,
      roles: state.roles,
      tickets: state.tickets,
      notifications: state.notifications,
      auditLogs: state.auditLogs,
      settings: state.settings,
      adminProfile: state.adminProfile,
      sessions: state.sessions,
      updateUser,
      updateUserStatus,
      createRole,
      updateRole,
      deleteRole,
      updateTicket,
      addTicketReply,
      createNotification,
      updateNotification,
      toggleNotificationRead,
      updateSettings,
      updateAdminProfile,
      revokeSession,
    }),
    [
      state,
      updateUser,
      updateUserStatus,
      createRole,
      updateRole,
      deleteRole,
      updateTicket,
      addTicketReply,
      createNotification,
      updateNotification,
      toggleNotificationRead,
      updateSettings,
      updateAdminProfile,
      revokeSession,
    ]
  );

  return (
    <PlatformManagementContext.Provider value={value}>
      {children}
    </PlatformManagementContext.Provider>
  );
}

export function usePlatformManagement() {
  const ctx = useContext(PlatformManagementContext);
  if (!ctx) {
    throw new Error('usePlatformManagement must be used within a PlatformManagementProvider');
  }
  return ctx;
}
