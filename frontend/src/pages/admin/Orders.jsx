"use client";
import { OrderManagement } from "@/components/admin/order-management";
function AdminOrdersPage() {
  return <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <OrderManagement />
    </div>;
}
export {
  AdminOrdersPage as default
};

