"use client";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1e3);
  };
  return <LayoutWrapper>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-mono text-sm font-bold tracking-widest mb-4">[ RESET PASSWORD ]</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">We'll send you an email to reset your password</p>
          </div>

          {!submitted ? <div className="bg-secondary border border-border rounded-lg p-8 mb-6">
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

                <Button
    type="submit"
    disabled={isLoading}
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
  >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div> : <div className="bg-secondary border border-border rounded-lg p-8 mb-6">
              <div className="flex gap-4 items-start text-center flex-col">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
                  <p className="text-muted-foreground">
                    We sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>}

          <p className="text-center text-muted-foreground">
            Back to{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  ForgotPasswordPage as default
};


