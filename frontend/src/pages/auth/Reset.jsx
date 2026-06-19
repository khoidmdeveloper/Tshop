"use client";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset successfully!");
    }, 1e3);
  };
  return <LayoutWrapper>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-mono text-sm font-bold tracking-widest mb-4">[ NEW PASSWORD ]</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">Create a new password for your account</p>
          </div>

          <div className="bg-secondary border border-border rounded-lg p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">New Password</label>
                <Input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder="••••••••"
    className="bg-background text-foreground border-border"
    required
  />
                <p className="text-xs text-muted-foreground mt-1">Min. 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Confirm Password</label>
                <Input
    type="password"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    placeholder="••••••••"
    className="bg-background text-foreground border-border"
    required
  />
              </div>

              <Button
    type="submit"
    disabled={isLoading}
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
  >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>

          <p className="text-center text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  ResetPasswordPage as default
};


