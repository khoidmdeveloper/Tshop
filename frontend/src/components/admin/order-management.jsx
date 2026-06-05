"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Download } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
const ORDERS = [
  { id: "ORD-001", customer: "John Doe", total: 2499, status: "delivered", date: /* @__PURE__ */ new Date() },
  { id: "ORD-002", customer: "Jane Smith", total: 1299, status: "shipped", date: new Date(Date.now() - 864e5) },
  { id: "ORD-003", customer: "Bob Johnson", total: 749, status: "pending", date: new Date(Date.now() - 1728e5) }
];
function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders] = useState(ORDERS);
  const filtered = orders.filter(
    (o) => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
    type="text"
    placeholder="Search orders..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="bg-secondary text-foreground border-border"
  />
        </div>
      </div>

      {
    /* Table */
  }
      <div className="bg-secondary border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Total</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => <tr key={order.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-bold">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(order.date)}</td>
                  <td className="px-6 py-4 text-sm text-primary font-bold">${order.total}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
    className={`px-3 py-1 rounded text-xs font-bold ${order.status === "delivered" ? "bg-primary/20 text-primary" : order.status === "shipped" ? "bg-accent/20 text-accent" : "bg-background text-muted-foreground"}`}
  >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button
    size="sm"
    variant="outline"
    className="border-border text-foreground hover:bg-primary/10 bg-transparent"
  >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
    size="sm"
    variant="outline"
    className="border-border text-foreground hover:bg-primary/10 bg-transparent"
  >
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}
export {
  OrderManagement
};

