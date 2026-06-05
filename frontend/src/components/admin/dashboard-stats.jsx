"use client";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
const STATS = [
  {
    label: "Total Revenue",
    value: "$48,250",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-primary"
  },
  {
    label: "Total Orders",
    value: "1,248",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "text-accent"
  },
  {
    label: "Total Customers",
    value: "842",
    change: "+5.1%",
    icon: Users,
    color: "text-primary"
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    change: "+2.3%",
    icon: TrendingUp,
    color: "text-accent"
  }
];
function DashboardStats() {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat, idx) => <div key={idx} className="bg-secondary border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary text-sm font-bold">{stat.change} from last month</p>
        </div>)}
    </div>;
}
export {
  DashboardStats
};

