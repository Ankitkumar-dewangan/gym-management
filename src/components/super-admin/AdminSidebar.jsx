import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import NavIcon from '../common/NavIcon';
import { SUPER_ADMIN_NAV } from '../../constants/navigation';
import { cn } from '../../utils/cn';

export function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
}) {
  const location = useLocation();

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    for (const group of SUPER_ADMIN_NAV) {
      const hasActive = group.items.some((item) => item.path === location.pathname);
      initial[group.id] = group.defaultOpen || hasActive;
    }
    return initial;
  });

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of SUPER_ADMIN_NAV) {
        if (group.items.some((item) => item.path === location.pathname) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [location.pathname]);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSidebarBody = (isCollapsed, onItemClick) => (
    <>
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-4"
        aria-label="Super Admin navigation"
      >
        {SUPER_ADMIN_NAV.map((group) => {
          const isOpen = isCollapsed ? true : Boolean(openSections[group.id]);

          return (
            <div key={group.id}>
              {!isCollapsed ? (
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
                        onClick={onItemClick}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                            isCollapsed && 'justify-center px-2',
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          )
                        }
                      >
                        <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[11px] font-medium text-slate-200 tabular-nums">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>

                      {/* Tooltip when collapsed */}
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
              )}
            </div>
          );
        })}
      </nav>

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
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-navy-900 text-white border-r border-navy-800 transition-all duration-200 z-40',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/10 shrink-0',
            collapsed ? 'justify-center px-3' : 'justify-between px-5'
          )}
        >
          <BrandLogo variant="light" collapsed={collapsed} />
        </div>
        {renderSidebarBody(collapsed)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-5 border-b border-white/10 shrink-0">
              <BrandLogo variant="light" />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderSidebarBody(false, onCloseMobile)}
          </aside>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
