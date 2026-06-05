"use client";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    const result = await signup({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password
    });
    setIsLoading(false);
    if (!result.ok) {
      setError(result.message);
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
            <p className="text-primary font-mono text-sm font-bold tracking-widest mb-4">[ CREATE ACCOUNT ]</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Join TechVortex</h1>
            <p className="text-muted-foreground">Create your account to start shopping</p>
          </div>

          {
    /* Form */
  }
          <div className="bg-secondary border border-border rounded-lg p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                  <Input
    type="text"
    name="firstName"
    value={formData.firstName}
    onChange={handleChange}
    placeholder="John"
    className="bg-background text-foreground border-border"
    required
  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                  <Input
    type="text"
    name="lastName"
    value={formData.lastName}
    onChange={handleChange}
    placeholder="Doe"
    className="bg-background text-foreground border-border"
    required
  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                <Input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="you@example.com"
    className="bg-background text-foreground border-border"
    required
  />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Password</label>
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

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required className="rounded" />
                <span className="text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>}

              <Button
    type="submit"
    disabled={isLoading}
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
  >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>

          {
    /* Sign In Link */
  }
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  SignupPage as default
};


