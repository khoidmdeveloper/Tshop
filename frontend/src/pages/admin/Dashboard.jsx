"use client";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentOrders } from "@/components/admin/recent-orders";
import { SalesChart } from "@/components/admin/sales-chart";
function AdminDashboard() {
  return <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your admin panel</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <RecentOrders />
        </div>
      </div>
    </div>;
}
export {
  AdminDashboard as default
};

