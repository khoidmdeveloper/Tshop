"use client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Settings, label: "Settings", href: "/admin/settings" }
];
function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };
  return <>
      <aside className="w-64 bg-secondary border-r border-border flex flex-col">
        {
    /* Logo */
  }
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="text-lg font-bold text-foreground tracking-wide">
            Admin
          </Link>
        </div>

        {
    /* Menu */
  }
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
    const isActive = pathname === item.href;
    return <Link
      key={item.href}
      to={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background"}`}
    >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>;
  })}
        </nav>

        {
    /* Footer */
  }
        <div className="p-6 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-primary/10 bg-transparent"
            onClick={() => void handleLogout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

    </>;
}
export {
  AdminSidebar
};
