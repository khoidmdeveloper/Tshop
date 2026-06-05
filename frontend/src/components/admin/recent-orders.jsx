"use client";
const RECENT_ORDERS = [
  {
    id: "ORD-001",
    customer: "John Doe",
    total: "$2,499",
    status: "delivered",
    date: /* @__PURE__ */ new Date()
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    total: "$1,299",
    status: "shipped",
    date: new Date(Date.now() - 864e5)
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    total: "$749",
    status: "pending",
    date: new Date(Date.now() - 1728e5)
  }
];
function RecentOrders() {
  return <div className="bg-secondary border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Recent Orders</h3>

      <div className="space-y-4">
        {RECENT_ORDERS.map((order) => <div key={order.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
            <div>
              <p className="font-bold text-foreground text-sm">{order.id}</p>
              <p className="text-xs text-muted-foreground">{order.customer}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-sm">{order.total}</p>
              <p
    className={`text-xs font-bold ${order.status === "delivered" ? "text-primary" : order.status === "shipped" ? "text-accent" : "text-muted-foreground"}`}
  >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>)}
      </div>
    </div>;
}
export {
  RecentOrders
};

