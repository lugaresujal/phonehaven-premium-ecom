import type { ReactNode } from "react";
import { AdminHeader } from "../components/layout/AdminHeader";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { SidebarProvider } from "../contexts/SidebarContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          <AdminHeader />

          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
