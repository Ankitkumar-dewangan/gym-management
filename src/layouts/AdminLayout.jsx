import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/super-admin/AdminSidebar';
import AdminTopbar from '../components/super-admin/AdminTopbar';
import { cn } from '../utils/cn';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[#F5F7FB] text-slate-800 overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'flex-1 flex flex-col h-screen min-w-0 transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        )}
      >
        <AdminTopbar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Scrollable Content Container (Topbar Header remains strictly fixed above) */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
            <Outlet />
          </main>

          <footer className="border-t border-slate-200/80 bg-white/70 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>GymPilot Multi-Tenant Gym Platform · Super Admin Console</span>
              <span className="font-medium text-slate-600">Powered by AGP Empire</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
