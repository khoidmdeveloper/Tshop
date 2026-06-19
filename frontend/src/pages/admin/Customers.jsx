"use client";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Mail } from "lucide-react";
import { getCustomersApi } from "@/lib/api/auth-api";

function CustomersContent() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomersApi();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không kết nối được backend. Vui lòng reload hoặc quay lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground font-mono">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-secondary border border-border rounded-lg">
        <p className="text-destructive font-bold mb-4 font-mono">{error}</p>
        <Button onClick={loadData} variant="default">Reload</Button>
      </div>
    );
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ CUSTOMERS ]</p>
        <h1 className="text-4xl font-bold text-foreground mb-2">Quản lý Khách Hàng</h1>
      </div>

      <div className="mb-8 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
    placeholder="Search customers..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 bg-secondary border-border text-foreground"
  />
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Orders</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Total Spent</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Join Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.map((customer) => <tr key={customer.id} className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{customer.name}</td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{customer.email}</td>
                <td className="px-6 py-4 text-foreground">{customer.totalOrders || 0}</td>
                <td className="px-6 py-4 font-bold text-primary">${(customer.totalSpent || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : "N/A"}</td>
                <td className="px-6 py-4">
                  <span
    className={`px-3 py-1 rounded-full text-xs font-bold ${customer.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
  >
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border hover:bg-primary/10 bg-transparent">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-primary/10 bg-transparent">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
function CustomersPage() {
  return <div className="p-8">
      <Suspense fallback={null}>
        <CustomersContent />
      </Suspense>
    </div>;
}
export {
  CustomersPage as default
};
