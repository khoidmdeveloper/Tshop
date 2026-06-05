"use client";
import { Link, Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
function AdminLayout() {
  const { currentUser } = useAuthStore();
  if (!currentUser || currentUser.role !== "admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-secondary border border-border rounded-lg p-8 text-center">
          <p className="text-primary font-mono text-sm font-bold tracking-widest mb-4">[ ADMIN ACCESS ]</p>
          <h1 className="text-3xl font-bold text-foreground mb-4">Access restricted</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in with an admin account to view the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                Go to Login
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-primary text-foreground hover:bg-primary/10 w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="flex h-screen bg-background">
      {
    /* Sidebar */
  }
      <AdminSidebar />

      {
    /* Main Content */
  }
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>;
}
export {
  AdminLayout as default
};

