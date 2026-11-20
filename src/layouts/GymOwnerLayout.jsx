import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../components/common/BrandLogo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import NavIcon from '../components/common/NavIcon';
import UserAvatar from '../components/common/UserAvatar';
import Dropdown from '../components/ui/Dropdown';
import { GYM_AVATARS, GYM_GLOBAL_SEARCH_INDEX } from '../constants/gymOwnerData';
import { NOTIFICATIONS_BY_ROLE, PREVIEW_USERS } from '../constants/mockPreviewData';
import { GYM_OWNER_NAV } from '../constants/navigation';
import { ROLES } from '../constants/roles';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { useGymAnalyticsNotifications } from '../contexts/GymAnalyticsNotificationsContext';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/formatters';

const ROUTE_TITLES = {
  '/gym/dashboard': 'Dashboard',
  '/gym/branches': 'Branch Management',
  '/gym/branches/add': 'Add New Branch',
  '/gym/branches/performance': 'Branch Performance',
  '/gym/branches/comparison': 'Branch Comparison',
  '/gym/members': 'Member Management',
  '/gym/members/add': 'Add New Member',
  '/gym/members/active': 'Active Members',
  '/gym/members/inactive': 'Inactive Members',
  '/gym/members/expired': 'Expired Members',
  '/gym/membership': 'Membership Overview',
  '/gym/membership/plans': 'Membership Plans',
  '/gym/membership/plans/create': 'Create Membership Plan',
  '/gym/membership/assign': 'Assign Membership',
  '/gym/membership/active': 'Active Memberships',
  '/gym/membership/upcoming-expiries': 'Upcoming Expiries',
  '/gym/membership/expired': 'Expired Memberships',
  '/gym/membership/renewals': 'Renewal Management',
  '/gym/membership/history': 'Membership History',
  '/gym/membership/cancelled': 'Cancelled Memberships',
  '/gym/membership/offers': 'Discounts & Offers',
  '/gym/renewals': 'Renewal Management',
  '/gym/attendance': 'Attendance Management',
  '/gym/attendance/scanner': 'QR Code Scanner',
  '/gym/attendance/manual': 'Manual Attendance',
  '/gym/attendance/check-ins': 'Check-in Management',
  '/gym/attendance/check-outs': 'Check-out Management',
  '/gym/attendance/live': 'Live Gym Occupancy',
  '/gym/attendance/history': 'Attendance History',
  '/gym/attendance/branches': 'Branch-wise Attendance',
  '/gym/attendance/reports': 'Attendance Reports',
  '/gym/attendance/settings': 'Attendance Settings',
  '/gym/attendance/corrections': 'Correction Requests',
  '/gym/enquiries': 'Enquiries',
  '/gym/followups': 'Follow-ups',
  '/gym/finance/collections': 'Fee Collection',
  '/gym/finance/transactions': 'Transactions',
  '/gym/finance/pending-payments': 'Pending Payments',
  '/gym/finance/expenses': 'Expenses',
  '/gym/trainers': 'Trainer Management',
  '/gym/trainers/add': 'Add Trainer',
  '/gym/trainers/assignments': 'Trainer Assignments',
  '/gym/trainers/schedules': 'Trainer Schedules',
  '/gym/trainers/sessions': 'Training Sessions',
  '/gym/trainers/performance': 'Trainer Performance',
  '/gym/staff': 'Staff Management',
  '/gym/staff/add': 'Add Staff',
  '/gym/staff/attendance': 'Staff Attendance',
  '/gym/payroll': 'Salary & Payroll',
  '/gym/payroll/generate': 'Generate Salary',
  '/gym/payroll/history': 'Payment History',
  '/gym/trainer-assignments': 'Trainer Assignments',
  '/gym/workouts': 'Workout Dashboard',
  '/gym/workouts/plans': 'Workout Plans',
  '/gym/workouts/create': 'Create Workout Plan',
  '/gym/workouts/exercises': 'Exercise Library',
  '/gym/workouts/assign': 'Assign Workout',
  '/gym/workouts/schedule': 'Workout Schedule',
  '/gym/workouts/progress': 'Workout Analytics',
  '/gym/progress': 'Body Measurements',
  '/gym/diet': 'Diet Dashboard',
  '/gym/diet/plans': 'Diet Plans',
  '/gym/diet/create': 'Create Diet Plan',
  '/gym/diet/foods': 'Food Library',
  '/gym/diet/assign': 'Assign Diet',
  '/gym/reports': 'Reports',
  '/gym/reports/revenue': 'Revenue Reports',
  '/gym/reports/attendance': 'Attendance Reports',
  '/gym/reports/members': 'Member Reports',
  '/gym/reports/expenses': 'Expense Reports',
  '/gym/gym-profile': 'Gym Profile',
  '/gym/settings': 'Gym Settings',
  '/gym/notifications': 'Notifications',
  '/gym/profile': 'My Profile',
};

export function GymOwnerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadIds, setUnreadIds] = useState(['n4', 'n5']);
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithPreviewRole, signOut } = useAuth();
  const {
    tenants,
    activeTenant,
    branches,
    activeBranch,
    selectTenant,
    selectBranch,
  } = useTenant();

  const {
    notifications: globalNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useGymAnalyticsNotifications();

  const currentUser = user?.role === ROLES.GYM_OWNER ? user : PREVIEW_USERS.gym_owner;

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    for (const group of GYM_OWNER_NAV) {
      const hasActive = group.items.some((item) => item.path === location.pathname);
      initial[group.id] = group.defaultOpen || hasActive;
    }
    return initial;
  });

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of GYM_OWNER_NAV) {
        if (group.items.some((item) => item.path === location.pathname) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const breadcrumbs = useMemo(() => {
    const trail = [{ label: activeTenant.name, to: '/gym/dashboard' }];
    const path = location.pathname;

    if (
      path === '/gym/branches/add' ||
      path === '/gym/branches/performance' ||
      path === '/gym/branches/comparison'
    ) {
      trail.push({ label: 'Branches', to: '/gym/branches' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/branches\/[^/]+\/edit$/.test(path)) {
      trail.push({ label: 'Branches', to: '/gym/branches' });
      trail.push({ label: 'Edit Branch' });
      return trail;
    }

    if (/^\/gym\/branches\/[^/]+\/manager$/.test(path)) {
      trail.push({ label: 'Branches', to: '/gym/branches' });
      trail.push({ label: 'Branch Manager' });
      return trail;
    }

    if (/^\/gym\/branches\/[^/]+\/staff$/.test(path)) {
      trail.push({ label: 'Branches', to: '/gym/branches' });
      trail.push({ label: 'Branch Staff' });
      return trail;
    }

    if (/^\/gym\/branches\/[^/]+$/.test(path)) {
      trail.push({ label: 'Branches', to: '/gym/branches' });
      trail.push({ label: 'Branch Details' });
      return trail;
    }

    if (
      path === '/gym/members/add' ||
      path === '/gym/members/active' ||
      path === '/gym/members/inactive' ||
      path === '/gym/members/expired'
    ) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/members\/[^/]+\/edit$/.test(path)) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: 'Edit Member' });
      return trail;
    }

    if (/^\/gym\/members\/[^/]+\/history$/.test(path)) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: 'Membership History' });
      return trail;
    }

    if (/^\/gym\/members\/[^/]+\/documents$/.test(path)) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: 'Member Documents' });
      return trail;
    }

    if (/^\/gym\/members\/[^/]+\/progress$/.test(path)) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: 'Progress Overview' });
      return trail;
    }

    if (/^\/gym\/members\/[^/]+$/.test(path)) {
      trail.push({ label: 'Members', to: '/gym/members' });
      trail.push({ label: 'Member Profile' });
      return trail;
    }

    if (path === '/gym/membership/plans/create') {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: 'Membership Plans', to: '/gym/membership/plans' });
      trail.push({ label: 'Create Plan' });
      return trail;
    }

    if (/^\/gym\/membership\/plans\/[^/]+\/edit$/.test(path)) {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: 'Membership Plans', to: '/gym/membership/plans' });
      trail.push({ label: 'Edit Plan' });
      return trail;
    }

    if (
      path === '/gym/membership/plans' ||
      path === '/gym/membership/assign' ||
      path === '/gym/membership/active' ||
      path === '/gym/membership/upcoming-expiries' ||
      path === '/gym/membership/expired' ||
      path === '/gym/membership/renewals' ||
      path === '/gym/membership/history' ||
      path === '/gym/membership/cancelled' ||
      path === '/gym/membership/offers'
    ) {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/membership\/[^/]+\/upgrade$/.test(path)) {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: 'Upgrade / Downgrade Plan' });
      return trail;
    }

    if (/^\/gym\/membership\/[^/]+\/freeze$/.test(path)) {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: 'Freeze / Resume Membership' });
      return trail;
    }

    if (/^\/gym\/membership\/[^/]+$/.test(path)) {
      trail.push({ label: 'Membership', to: '/gym/membership' });
      trail.push({ label: 'Membership Details' });
      return trail;
    }

    if (
      path === '/gym/attendance/scanner' ||
      path === '/gym/attendance/manual' ||
      path === '/gym/attendance/check-ins' ||
      path === '/gym/attendance/check-outs' ||
      path === '/gym/attendance/live' ||
      path === '/gym/attendance/history' ||
      path === '/gym/attendance/branches' ||
      path === '/gym/attendance/reports' ||
      path === '/gym/attendance/settings' ||
      path === '/gym/attendance/corrections'
    ) {
      trail.push({ label: 'Attendance', to: '/gym/attendance' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/attendance\/member\/[^/]+$/.test(path)) {
      trail.push({ label: 'Attendance', to: '/gym/attendance' });
      trail.push({ label: 'Member Attendance' });
      return trail;
    }

    if (
      path === '/gym/trainers/add' ||
      path === '/gym/trainers/assignments' ||
      path === '/gym/trainers/schedules' ||
      path === '/gym/trainers/sessions' ||
      path === '/gym/trainers/performance'
    ) {
      trail.push({ label: 'Trainers', to: '/gym/trainers' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/trainers\/[^/]+\/edit$/.test(path)) {
      trail.push({ label: 'Trainers', to: '/gym/trainers' });
      trail.push({ label: 'Edit Trainer' });
      return trail;
    }

    if (/^\/gym\/trainers\/[^/]+$/.test(path)) {
      trail.push({ label: 'Trainers', to: '/gym/trainers' });
      trail.push({ label: 'Trainer Profile' });
      return trail;
    }

    if (path === '/gym/staff/add' || path === '/gym/staff/attendance') {
      trail.push({ label: 'Staff', to: '/gym/staff' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/staff\/[^/]+\/edit$/.test(path)) {
      trail.push({ label: 'Staff', to: '/gym/staff' });
      trail.push({ label: 'Edit Staff' });
      return trail;
    }

    if (/^\/gym\/staff\/[^/]+$/.test(path)) {
      trail.push({ label: 'Staff', to: '/gym/staff' });
      trail.push({ label: 'Staff Profile' });
      return trail;
    }

    if (path === '/gym/payroll/generate' || path === '/gym/payroll/history') {
      trail.push({ label: 'Payroll', to: '/gym/payroll' });
      trail.push({ label: ROUTE_TITLES[path] });
      return trail;
    }

    if (/^\/gym\/payroll\/[^/]+$/.test(path)) {
      trail.push({ label: 'Payroll', to: '/gym/payroll' });
      trail.push({ label: 'Salary Details' });
      return trail;
    }

    const pageTitle = ROUTE_TITLES[path] || 'Dashboard';
    trail.push({ label: activeBranch.name, to: '/gym/branches' });
    trail.push({ label: pageTitle });
    return trail;
  }, [location.pathname, activeTenant.name, activeBranch.name]);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { items: [], pages: [] };

    const items = GYM_GLOBAL_SEARCH_INDEX.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
    ).slice(0, 4);

    const pages = GYM_OWNER_NAV.flatMap((group) => group.items)
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 4);

    return { items, pages };
  }, [globalQuery]);

  const notifications = NOTIFICATIONS_BY_ROLE.gym_owner;

  const handleMarkAllRead = () => {
    setUnreadIds([]);
    toast.success('All notifications marked as read');
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const handleSwitchPortal = (role, path, label) => {
    signInWithPreviewRole(role);
    toast.success(`Switched to ${label} preview`);
    navigate(path);
  };

  const renderNav = (collapsed, onItemClick) => (
    <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto" aria-label="Gym navigation">
      {GYM_OWNER_NAV.map((group) => {
        const isOpen = collapsed ? true : Boolean(openSections[group.id]);

        return (
          <div key={group.id}>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span>{group.section}</span>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                )}
              </button>
            ) : (
              <div className="my-2 border-t border-white/10 first:hidden" />
            )}

            {isOpen && (
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.path} className="relative group/nav">
                    <NavLink
                      to={item.path}
                      end
                      title={collapsed ? item.label : undefined}
                      onClick={onItemClick}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        )
                      }
                    >
                      <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    </NavLink>

                    {collapsed && (
                      <div
                        role="tooltip"
                        className="pointer-events-none invisible opacity-0 group-hover/nav:visible group-hover/nav:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg border border-white/10"
                      >
                        {item.label}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen flex bg-[#F5F7FB] text-slate-800 overflow-hidden">
      {/* Desktop Fixed Collapsible LEFT Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-navy-900 text-white border-r border-navy-800 transition-all duration-200 z-40',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/10 shrink-0',
            sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-5'
          )}
        >
          <BrandLogo variant="light" collapsed={sidebarCollapsed} />
        </div>

        {renderNav(sidebarCollapsed)}

        <div className="border-t border-white/10 px-4 py-3.5 shrink-0">
          {sidebarCollapsed ? (
            <div
              title="Powered by AGP Empire"
              className="text-center font-display text-[10px] font-semibold tracking-wider text-slate-400"
            >
              AGP
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400">Powered by</span>
              <span className="font-display text-xs font-semibold tracking-wide text-white">
                AGP Empire
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Left-Side Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-5 border-b border-white/10 shrink-0">
              <BrandLogo variant="light" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderNav(false, () => setMobileOpen(false))}
            <div className="border-t border-white/10 px-4 py-3.5 shrink-0">
              <p className="text-[11px] text-slate-400">Powered by</p>
              <p className="font-display text-xs font-semibold tracking-wide text-white">
                AGP Empire
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area (Right of Sidebar) */}
      <div
        className={cn(
          'flex-1 flex flex-col h-screen min-w-0 transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        )}
      >
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <Breadcrumbs items={breadcrumbs} className="hidden xl:flex min-w-0" />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Global Search */}
            <div ref={searchRef} className="relative hidden md:block w-52 lg:w-64">
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
                placeholder="Search members, trainers, plans..."
                aria-label="Global gym search"
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
                  {searchResults.items.length === 0 && searchResults.pages.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-500">
                      No matches for &ldquo;{globalQuery}&rdquo;
                    </p>
                  ) : (
                    <>
                      {searchResults.items.length > 0 && (
                        <div className="px-2 pb-1">
                          <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Records
                          </p>
                          {searchResults.items.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setGlobalQuery('');
                                navigate(entry.path);
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate">{entry.title}</p>
                                <p className="text-xs text-slate-500 truncate">{entry.subtitle}</p>
                              </div>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
                                {entry.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.pages.length > 0 && (
                        <div className="px-2 pt-1 border-t border-slate-100 first:border-t-0">
                          <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Pages
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

            {/* Gym / Tenant Selector (Switchable only when multiple gyms exist) */}
            {tenants.length > 1 ? (
              <Dropdown
                align="right"
                widthClass="w-64"
                header={
                  <span className="text-xs font-semibold text-slate-500">
                    Switch Gym Business
                  </span>
                }
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer max-w-[165px] sm:max-w-[200px]"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-navy-900 text-[10px] font-semibold text-white shrink-0">
                      {getInitials(activeTenant.name)}
                    </span>
                    <span className="truncate">{activeTenant.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  </button>
                }
                items={tenants.map((tenant) => ({
                  key: tenant.id,
                  label: tenant.name,
                  description: `${tenant.branches.length} ${tenant.branches.length === 1 ? 'branch' : 'branches'} · ${tenant.plan}`,
                  active: tenant.id === activeTenant.id,
                  onClick: () => {
                    selectTenant(tenant.id);
                    toast.success(`Switched gym to ${tenant.name}`);
                  },
                }))}
              />
            ) : (
              <div className="inline-flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-medium text-slate-700">
                <Building2 className="h-4 w-4 text-navy-900 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[150px]">{activeTenant.name}</span>
              </div>
            )}

            {/* Branch Selector */}
            <Dropdown
              align="right"
              widthClass="w-60"
              header={
                <span className="text-xs font-semibold text-slate-500">
                  Filter by Branch
                </span>
              }
              trigger={
                <button
                  type="button"
                  className="hidden sm:inline-flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap max-w-[140px] truncate">{activeBranch.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              }
              items={[
                {
                  key: 'all',
                  label: 'All Branches',
                  description: `${branches.length} locations combined`,
                  active: activeBranch.id === 'all',
                  onClick: () => {
                    selectBranch('all');
                    toast.success('Viewing all branches');
                  },
                },
                { type: 'divider' },
                ...branches.map((branch) => ({
                  key: branch.id,
                  label: branch.name,
                  description: `${branch.city} · ${branch.members} members`,
                  active: branch.id === activeBranch.id,
                  onClick: () => {
                    selectBranch(branch.id);
                    toast.success(`Branch: ${branch.name}`);
                  },
                })),
              ]}
            />

            {/* Notifications */}
            <Dropdown
              align="right"
              widthClass="w-80"
              header={
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    Notifications ({unreadCount} Unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>
              }
              items={[
                ...(globalNotifications || []).slice(0, 5).map((n) => ({
                  key: n.id,
                  label: n.title,
                  description: `${n.description?.slice(0, 48)}... · ${n.time}`,
                  onClick: () => {
                    markAsRead(n.id);
                    if (n.link) navigate(n.link);
                    else navigate('/gym/notifications');
                  },
                })),
                { type: 'divider' },
                {
                  key: 'view-all-notifs',
                  label: 'View all notifications',
                  icon: Bell,
                  onClick: () => navigate('/gym/notifications'),
                },
              ]}
            />

            {/* User Profile */}
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
                  className="inline-flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-white px-2 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <UserAvatar
                    src={GYM_AVATARS.owner}
                    name={currentUser.name}
                    size="sm"
                    className="h-6 w-6"
                  />
                  <span className="hidden xl:inline text-sm font-medium text-slate-700 whitespace-nowrap">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              }
              items={[
                {
                  key: 'my-profile',
                  label: 'My Profile',
                  icon: UserCheck,
                  onClick: () => navigate('/gym/profile'),
                },
                {
                  key: 'gym-settings',
                  label: 'Gym Settings',
                  icon: Settings,
                  onClick: () => navigate('/gym/settings'),
                },
                { type: 'divider' },
                {
                  key: 'switch-sa',
                  label: 'Preview Super Admin Portal',
                  icon: UserCheck,
                  onClick: () => handleSwitchPortal(ROLES.SUPER_ADMIN, '/super-admin/dashboard', 'Super Admin'),
                },
                {
                  key: 'switch-member',
                  label: 'Preview Member Portal',
                  icon: UserCheck,
                  onClick: () => handleSwitchPortal(ROLES.MEMBER, '/member/dashboard', 'Member'),
                },
                { type: 'divider' },
                {
                  key: 'sign-out',
                  label: 'Sign out',
                  icon: LogOut,
                  danger: true,
                  onClick: handleSignOut,
                },
              ]}
            />
          </div>
        </header>

        {/* Scrollable Content Container (Topbar Header remains strictly fixed above) */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
            <Outlet />
          </main>

          <footer className="border-t border-slate-200/80 bg-white/70 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>{activeTenant.name} · {activeBranch.name}</span>
              <span className="font-medium text-slate-600">Powered by AGP Empire</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default GymOwnerLayout;
