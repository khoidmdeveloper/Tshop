"use client";
import { Link } from "react-router-dom";
import { Bell, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
function AdminHeader() {
  return <header className="bg-secondary border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-[180px]">
          <p className="text-primary font-mono text-xs font-bold tracking-widest">[ ADMIN ]</p>
          <p className="text-lg font-bold text-foreground">Control Panel</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-primary/10 bg-transparent gap-2">
              <Store className="w-4 h-4" />
              View Store
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-foreground hover:text-primary relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30">
            <span className="text-lg">👤</span>
          </div>
        </div>
      </div>
    </header>;
}
export {
  AdminHeader
};
