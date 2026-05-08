import { useState } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/admin/login";

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {isLoginPage ? (
        <Outlet />
      ) : (
        <div className="min-h-screen bg-background">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:pl-64 transition-all duration-300">
            <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-4 lg:p-6 pb-20 lg:pb-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </>
  );
}
