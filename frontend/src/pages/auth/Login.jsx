"use client";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (result.user.role === "admin") {
      navigate("/admin");
      return;
    }
    navigate("/account");
  };
  return <LayoutWrapper>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          {
    /* Header */
  }
          <div className="text-center mb-12">
            <p className="text-primary font-mono text-sm font-bold tracking-widest mb-4">[ LOGIN ]</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your account and orders</p>
          </div>

          {
    /* Form */
  }
          <div className="bg-secondary border border-border rounded-lg p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    className="bg-background text-foreground border-border"
    required
  />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Password</label>
                <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="bg-background text-foreground border-border"
    required
  />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/auth/forgot" className="text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>

              {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>}

              <Button
    type="submit"
    disabled={isLoading}
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
  >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          {
    /* Divider */
  }
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/signup" className="text-primary hover:text-primary/80 font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  LoginPage as default
};


