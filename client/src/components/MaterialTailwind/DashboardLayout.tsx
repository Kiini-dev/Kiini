import React from "react";
import { MaterialTailwindControllerProvider } from "@/contexts/MaterialTailwindContext";
import { Sidenav } from "./Sidenav";
import { DashboardNavbar } from "./DashboardNavbar";
import { RightSidebar } from "./RightSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * MaterialTailwind Dashboard Layout
 * 
 * Z-INDEX HIERARCHY (higher number = appears on top):
 * - z-[60]: Hamburger button (DashboardNavbar.tsx) - Always clickable
 * - z-50: Sidenav sidebar (Sidenav.tsx)
 * - z-40: Sidenav overlay/backdrop (Sidenav.tsx)
 * - z-30: Main navbar (DashboardNavbar.tsx)
 * 
 * To modify z-index values, edit the respective component files:
 * - Hamburger: client/src/components/MaterialTailwind/DashboardNavbar.tsx
 * - Sidenav: client/src/components/MaterialTailwind/Sidenav.tsx
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <MaterialTailwindControllerProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Left Sidebar - z-50 */}
        <Sidenav />

        {/* Main Content - Add margin to avoid sidebar overlap */}
        <div className="flex-1 flex flex-col overflow-hidden ml-0 xl:ml-72 lg:ml-72">
          {/* Top Navbar with Hamburger Button - z-[60] for hamburger, z-30 for navbar */}
          <DashboardNavbar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto dark:bg-slate-900">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </MaterialTailwindControllerProvider>
  );
}
