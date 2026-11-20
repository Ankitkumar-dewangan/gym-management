import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../components/common/BrandLogo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import NavIcon from '../components/common/NavIcon';
import Dropdown from '../components/ui/Dropdown';
import { MEMBER_NAV } from '../constants/navigation';
import { PREVIEW_USERS } from '../constants/mockPreviewData';
import { ROLES } from '../constants/roles';
import { useAuth } from '../contexts/AuthContext';
import { useGymAnalyticsNotifications } from '../contexts/GymAnalyticsNotificationsContext';
import { getInitials } from '../utils/formatters';
import { cn } from '../utils/cn';

const MEMBER_ROUTE_TITLES = {
  '/member/dashboard': 'Dashboard',
  '/member/profile': 'My Profile',
  '/member/membership': 'My Membership',
  '/member/payments': 'Payments & Invoices',
  '/member/attendance': 'Attendance History',
  '/member/workouts': 'My Workouts',
  '/member/workout': 'My Workouts',
  '/member/diet': 'My Diet Plan',
  '/member/progress': 'Fitness Progress',
  '/member/notifications': 'Notifications',
  '/member/announcements': 'Announcements',
  '/member/settings': 'Settings',
};

export function MemberLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithPreviewRole, signOut } = useAuth();
  const { unreadCount, notifications, markAsRead } = useGymAnalyticsNotifications();

  const currentUser = user?.role === ROLES.MEMBER ? user : PREVIEW_USERS.member;

  const breadcrumbs = useMemo(() => {
    const trail = [{ label: 'Member Portal', to: '/member/dashboard' }];
    const title = MEMBER_ROUTE_TITLES[location.pathname] || 'Dashboard';
    if (location.pathname !== '/member/dashboard') {
      trail.push({ label: title });
    }
    return trail;
  }, [location.pathname]);

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

  const renderNavItems = (isCollapsed, onItemClick) => (
    <>
      <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto" aria-label="Member navigation">
        <div>
          {!isCollapsed ? (
            <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Member Portal
            </p>
          ) : (
            <div className="my-2 border-t border-white/10" />
          )}

          <ul className="mt-1 space-y-0.5">
            {MEMBER_NAV.map((item) => (
              <li key={item.path} className="relative group/nav">
                <NavLink
                  to={item.path}
                  end
                  onClick={onItemClick}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                      isCollapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                </NavLink>

                {isCollapsed && (
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
        </div>
      </nav>

      {/* Member mini card in sidebar */}
      {!isCollapsed && currentUser && (
        <div className="mx-3 my-2 rounded-xl bg-white/5 p-3 border border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shrink-0">
              {getInitials(currentUser.name || 'Member')}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              {currentUser.memberId && (
                <p className="text-[11px] text-emerald-300 font-mono truncate">
                  {currentUser.memberId}
                </p>
              )}
            </div>
          </div>
          {currentUser.plan && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Plan</span>
              <span className="font-medium text-emerald-400 truncate">{currentUser.plan}</span>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Footer Branding */}
      <div className="border-t border-white/10 px-4 py-3.5 shrink-0">
        {isCollapsed ? (
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
    </>
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

        {renderNavItems(sidebarCollapsed)}
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
            {renderNavItems(false, () => setMobileOpen(false))}
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
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Desktop sidebar toggle button */}
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

            <Breadcrumbs items={breadcrumbs} className="hidden sm:flex min-w-0" />
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Gym Center Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>My Gym Club · Downtown</span>
            </div>

            {/* Member ID Badge */}
            {currentUser?.memberId && (
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-medium text-navy-800">
                <span>{currentUser.memberId}</span>
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <Dropdown
              align="right"
              widthClass="w-80"
              header={
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    Notifications ({unreadCount})
                  </span>
                  <Link
                    to="/member/notifications"
                    className="text-xs font-medium text-emerald-700 hover:underline"
                  >
                    View all
                  </Link>
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
                ...(notifications || []).slice(0, 4).map((n) => ({
                  key: n.id,
                  label: n.title,
                  description: `${n.description?.slice(0, 42)}... · ${n.time}`,
                  onClick: () => {
                    markAsRead(n.id);
                    navigate('/member/notifications');
                  },
                })),
                { type: 'divider' },
                {
                  key: 'view-all',
                  label: 'Open Notification Center',
                  icon: Bell,
                  onClick: () => navigate('/member/notifications'),
                },
              ]}
            />

            {/* Member Profile Dropdown */}
            <Dropdown
              align="right"
              widthClass="w-64"
              header={
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser.memberId ? `${currentUser.memberId} · ` : ''}{currentUser.email}
                  </p>
                </div>
              }
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2.5 h-9 rounded-lg border border-slate-200 bg-white px-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-[11px] font-semibold text-white shrink-0">
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
                  key: 'profile',
                  label: 'My Profile',
                  icon: User,
                  onClick: () => navigate('/member/profile'),
                },
                {
                  key: 'settings',
                  label: 'Account Settings',
                  icon: Settings,
                  onClick: () => navigate('/member/settings'),
                },
                { type: 'divider' },
                {
                  key: 'switch-gym',
                  label: 'Preview Gym Owner Portal',
                  icon: UserCheck,
                  onClick: () => handleSwitchPortal(ROLES.GYM_OWNER, '/gym/dashboard', 'Gym Owner'),
                },
                {
                  key: 'switch-sa',
                  label: 'Preview Super Admin Portal',
                  icon: UserCheck,
                  onClick: () => handleSwitchPortal(ROLES.SUPER_ADMIN, '/super-admin/dashboard', 'Super Admin'),
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

          {/* Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>GymPilot Multi-Tenant Gym Platform · Member Portal</span>
              <span className="font-medium text-slate-600">Powered by AGP Empire</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default MemberLayout;
