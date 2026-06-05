"use client";

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { UserProfile } from "@/components/account/user-profile";
import { OrderHistory } from "@/components/account/order-history";
import { useAuthStore } from "@/lib/store";
import {
  LogOut,
  Package,
  User
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
];

function getValidTab(value) {
  return tabs.some((tab) => tab.id === value) ? value : "profile";
}

function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState(getValidTab(searchParams.get("tab")));

  useEffect(() => {
    setActiveTab(getValidTab(searchParams.get("tab")));
  }, [searchParams]);

  const handleChangeTab = (tabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tabId);
    setSearchParams(nextParams);
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (!currentUser) {
    return <LayoutWrapper>
        <div className="tv-page-shell">
          <div className="max-w-4xl mx-auto px-4 py-24 text-center">
            <p className="tv-section-label mb-4">[ Account ]</p>
            <h1 className="mb-4 font-display text-4xl font-bold text-foreground">Please sign in</h1>
            <p className="mb-8 text-muted-foreground">
              You need an account to view your profile.
            </p>
            <Link to="/auth/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Go to Login</Button>
            </Link>
          </div>
        </div>
      </LayoutWrapper>;
  }

  return <LayoutWrapper>
      <div className="tv-page-shell min-h-screen">
        <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="hidden w-72 shrink-0 flex-col gap-6 lg:flex">
            <div className="tv-panel border-l-4 border-l-primary p-6 shadow-[0_0_16px_rgba(14,165,233,0.12)]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-lg font-black text-primary">
                  {(currentUser.firstName || currentUser.email || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Profile Status</p>
                  <h3 className="truncate text-lg font-black uppercase tracking-tight text-foreground">
                    {currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "TechVortex User"}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleChangeTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "border-r-2 border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-[0.18em]">{tab.label}</span>
                    </button>;
                })}

                <div className="my-2 h-px bg-primary/10" />

                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex items-center gap-3 px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-[0.18em]">Sign Out</span>
                </button>
              </nav>
            </div>
          </aside>

          <section className="flex-1">
            <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleChangeTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/60 text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>;
              })}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-card/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            {activeTab === "profile" && <UserProfile onSignOut={handleSignOut} />}
            {activeTab === "orders" && <OrderHistory />}
          </section>
        </div>
      </div>
    </LayoutWrapper>;
}

export {
  AccountPage as default
};
