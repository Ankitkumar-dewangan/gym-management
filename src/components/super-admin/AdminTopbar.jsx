import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import Dropdown from '../ui/Dropdown';
import { PREVIEW_USERS } from '../../constants/mockPreviewData';
import { SUPER_ADMIN_NAV } from '../../constants/navigation';
import { ROLES } from '../../constants/roles';
import {
  RECENT_GYM_REGISTRATIONS,
  SUPER_ADMIN_NOTIFICATIONS,
} from '../../constants/superAdminData';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/formatters';

export function AdminTopbar({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}) {
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadIds, setUnreadIds] = useState(
    SUPER_ADMIN_NOTIFICATIONS.slice(0, 3).map((n) => n.id)
  );
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithPreviewRole, signOut } = useAuth();

  const currentUser =
    user?.role === ROLES.SUPER_ADMIN ? user : PREVIEW_USERS.super_admin;

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const breadcrumbs = useMemo(() => {
    const trail = [{ label: 'Super Admin', to: '/super-admin/dashboard' }];

    if (/^\/super-admin\/gyms\/[^/]+\/edit$/.test(location.pathname)) {
      trail.push({ label: 'All Gyms', to: '/super-admin/gyms' });
      trail.push({ label: 'Edit Gym' });
      return trail;
    }

    if (
      /^\/super-admin\/gyms\/[^/]+$/.test(location.pathname) &&
      location.pathname !== '/super-admin/gyms/add'
    ) {
      trail.push({ label: 'All Gyms', to: '/super-admin/gyms' });
      trail.push({ label: 'Gym Details' });
      return trail;
    }

    if (location.pathname === '/super-admin/subscription-plans/create') {
      trail.push({ label: 'Subscription Plans', to: '/super-admin/subscription-plans' });
      trail.push({ label: 'Create Plan' });
      return trail;
    }

    if (/^\/super-admin\/subscription-plans\/[^/]+\/edit$/.test(location.pathname)) {
      trail.push({ label: 'Subscription Plans', to: '/super-admin/subscription-plans' });
      trail.push({ label: 'Edit Plan' });
      return trail;
    }

    if (/^\/super-admin\/subscriptions\/[^/]+$/.test(location.pathname)) {
      trail.push({ label: 'Active Subscriptions', to: '/super-admin/active-subscriptions' });
      trail.push({ label: 'Subscription Details' });
      return trail;
    }

    if (/^\/super-admin\/support\/[^/]+$/.test(location.pathname)) {
      trail.push({ label: 'Support Tickets', to: '/super-admin/support' });
      trail.push({ label: 'Ticket Details' });
      return trail;
    }

    let activeSection = null;
    let activeItem = null;

    for (const group of SUPER_ADMIN_NAV) {
      const match = group.items.find((item) => item.path === location.pathname);
      if (match) {
        activeSection = group.section;
        activeItem = match.label;
        break;
      }
    }

    if (activeSection && activeItem !== 'Dashboard') {
      trail.push({
        label: activeSection
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
    trail.push({ label: activeItem || 'Dashboard' });
    return trail;
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { gyms: [], pages: [] };

    const gyms = RECENT_GYM_REGISTRATIONS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.ownerName.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q)
    ).slice(0, 3);

    const pages = SUPER_ADMIN_NAV.flatMap((group) => group.items)
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 4);

    return { gyms, pages };
  }, [globalQuery]);

  const handleMarkAllRead = () => {
    setUnreadIds([]);
    toast.success('All notifications marked as read');
  };

  const handleSwitchPortal = (role, path, label) => {
    signInWithPreviewRole(role);
    toast.success(`Switched to ${label} preview`);
    navigate(path);
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Drawer Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <Breadcrumbs items={breadcrumbs} className="hidden sm:flex min-w-0" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search */}
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={globalQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setGlobalQuery(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search gyms, owners, or pages..."
            aria-label="Global search"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/15 transition-colors"
          />
          {globalQuery && (
            <button
              type="button"
              onClick={() => setGlobalQuery('')}
              aria-label="Clear global search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {searchFocused && globalQuery.trim() && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
              {searchResults.gyms.length === 0 && searchResults.pages.length === 0 ? (
                <p className="px-4 py-3 text-xs text-slate-500">
                  No matches for &ldquo;{globalQuery}&rdquo;
                </p>
              ) : (
                <>
                  {searchResults.gyms.length > 0 && (
                    <div className="px-2 pb-1">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Gyms
                      </p>
                      {searchResults.gyms.map((gym) => (
                        <button
                          key={gym.id}
                          type="button"
                          onClick={() => {
                            setSearchFocused(false);
                            setGlobalQuery('');
                            navigate(`/super-admin/gyms/${gym.id}`);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50 cursor-pointer"
                        >
                          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{gym.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {gym.ownerName} · {gym.city}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.pages.length > 0 && (
                    <div className="px-2 pt-1 border-t border-slate-100 first:border-t-0">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Navigation
                      </p>
                      {searchResults.pages.map((page) => (
                        <button
                          key={page.path}
                          type="button"
                          onClick={() => {
                            setSearchFocused(false);
                            setGlobalQuery('');
                            navigate(page.path);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <span>{page.label}</span>
                          <span className="text-xs text-slate-400">Open</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <Dropdown
          align="right"
          widthClass="w-80"
          header={
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">Notifications</span>
              {unreadIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
          }
          trigger={
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadIds.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                  {unreadIds.length}
                </span>
              )}
            </button>
          }
          items={[
            ...SUPER_ADMIN_NOTIFICATIONS.map((n) => ({
              key: n.id,
              label: n.title,
              description: `${n.detail} · ${n.time}`,
              onClick: () => {
                setUnreadIds((prev) => prev.filter((id) => id !== n.id));
                toast(n.title);
              },
            })),
            { type: 'divider' },
            {
              key: 'view-all-notifs',
              label: 'View all notifications',
              icon: Bell,
              onClick: () => navigate('/super-admin/notifications'),
            },
          ]}
        />

        {/* Profile Dropdown */}
        <Dropdown
          align="right"
          widthClass="w-64"
          header={
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            </div>
          }
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2.5 h-9 rounded-lg border border-slate-200 bg-white px-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-navy-900 text-[11px] font-semibold text-white shrink-0">
                {getInitials(currentUser.name)}
              </span>
              <span className="hidden sm:inline text-sm font-medium text-slate-700 whitespace-nowrap">
                {currentUser.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          }
          items={[
            {
              key: 'profile-settings',
              label: 'Profile Settings',
              icon: Settings,
              onClick: () => navigate('/super-admin/profile'),
            },
            {
              key: 'switch-gym',
              label: 'Preview Gym Owner Portal',
              icon: UserCheck,
              onClick: () => handleSwitchPortal(ROLES.GYM_OWNER, '/gym/dashboard', 'Gym Owner'),
            },
            {
              key: 'switch-member',
              label: 'Preview Member Portal',
              icon: UserCheck,
              onClick: () => handleSwitchPortal(ROLES.MEMBER, '/member/dashboard', 'Member'),
            },
            { type: 'divider' },
            {
              key: 'logout',
              label: 'Logout',
              icon: LogOut,
              danger: true,
              onClick: handleSignOut,
            },
          ]}
        />
      </div>
    </header>
  );
}

export default AdminTopbar;
