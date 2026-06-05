"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore, useStore } from "@/lib/store";

function Header() {
  const navigate = useNavigate();
  const cartCount = useStore((state) =>
    (Array.isArray(state.cartItems) ? state.cartItems : []).reduce((total, item) => total + item.quantity, 0)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, logout } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      return;
    }
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 -skew-x-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_0_18px_rgba(14,165,233,0.35)]">
              <span className="skew-x-12 text-lg font-black">T</span>
            </div>
            <span className="hidden font-display text-xl font-bold tracking-[0.18em] text-foreground sm:inline">
              TechVortex
            </span>
          </Link>

          <div className="hidden flex-1 md:flex md:max-w-2xl md:mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 rounded-full border-border bg-card/80 pl-5 pr-12 text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link to="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Shop
            </Link>
            {isAdmin && <Link to="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Admin
              </Link>}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {cartCount}
                  </span>}
              </Button>
            </Link>
            {currentUser ? <>
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-primary sm:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleLogout()}
                  className="hidden text-sm font-medium text-muted-foreground hover:text-primary sm:flex"
                >
                  Sign out
                </Button>
              </> : <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-primary sm:flex">
                  <User className="h-5 w-5" />
                  <span>Sign in</span>
                </Button>
              </Link>}
          </div>
        </div>
      </div>
    </header>;
}

export {
  Header
};
