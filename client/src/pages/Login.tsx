import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "../const";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { getDashboardUrl } from "@/lib/permissions";
import { getOrgSubdomainSlug, getOrgSubdomainUrl } from "@/lib/organizationUrl";
import { saveAuthUser } from "@/lib/authStorage";

/**
 * Login component with proper authentication flow
 * 
 * Features:
 * - Stores auth token in localStorage for Docker/HTTP environments
 * - Redirects to role-based dashboard after successful login
 * - Handles authentication errors gracefully
 * - Persists login state across page reloads
 */
export default function Login() {
  const [, setLocation] = useLocation();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const nextPath = searchParams.get("next") || "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { user, isAuthenticated, loading: authLoading } = useAuthWithPersistence();
  const utils = trpc.useUtils();

  const getUserDashboardUrl = async (identity: any, path = "/dashboard") => {
    const tenantHostSlug = getOrgSubdomainSlug();
    let resolvedIdentity = identity;
    if (!identity.organizationId && !identity.organizationSlug && !tenantHostSlug) {
      try {
        const authIdentity = await utils.auth.me.fetch();
        if (authIdentity) {
          resolvedIdentity = { ...identity, ...authIdentity };
          saveAuthUser(resolvedIdentity);
        }
      } catch {
        // Continue with the login response if current-user refresh is unavailable.
      }
    }

    let organizationSlug = resolvedIdentity.organizationSlug;
    if (resolvedIdentity.organizationId && !organizationSlug) {
      try {
        const organizationData = await utils.multiTenancy.getMyOrg.fetch();
        organizationSlug = organizationData?.organization?.slug;
      } catch {
        organizationSlug = getOrgSubdomainSlug();
      }
    }
    organizationSlug ||= tenantHostSlug;
    if (organizationSlug) {
      return getOrgSubdomainUrl(organizationSlug, path, resolvedIdentity.organizationUrlMode || "subdomain");
    }
    if (resolvedIdentity.organizationId) return null;
    return path === "/dashboard" ? getDashboardUrl(resolvedIdentity.role || identity.role) : path;
  };

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const centralLogin = new URL(getLoginUrl(), window.location.href);
      if (window.location.origin !== centralLogin.origin) {
        if (nextPath && !centralLogin.searchParams.has("next")) {
          centralLogin.searchParams.set("next", nextPath);
        }
        window.location.replace(centralLogin.toString());
        return;
      }
    }
    if (authLoading || !isAuthenticated || !user) return;
    let cancelled = false;
    void getUserDashboardUrl(user, nextPath || "/dashboard").then((dashboardUrl) => {
      if (cancelled) return;
      if (!dashboardUrl) {
        setError("We couldn't determine your organization's workspace. Please try signing in again.");
        return;
      }
      if (user.organizationId) localStorage.setItem("organization-url-mode", user.organizationUrlMode || "subdomain");
      window.location.replace(dashboardUrl);
    });
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, nextPath, user]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if ((data as any).requires2FA) {
        setRequires2FA(true);
        setError("");
        setLoading(false);
        toast.info("Two-factor authentication is required to continue.");
        return;
      }

      // Store token in localStorage for fallback when cookies fail
      if (data.token) {
        localStorage.setItem("auth-token", data.token);
        console.log('[Login] Token stored to localStorage:', data.token.substring(0, 20) + '...');
      }
      
      // Store user data in localStorage
      saveAuthUser(data.user);
      console.log('[Login] User stored to localStorage:', data.user.email);
      
      toast.success("Login successful!");
      
      // Check if user needs to change password on first login
      if ("requiresPasswordChange" in data.user && data.user.requiresPasswordChange) {
        localStorage.setItem("requiresPasswordChange", "true");
        window.location.replace("/change-password");
        return;
      }
      
      const dashboardUrl = await getUserDashboardUrl(data.user, nextPath || "/dashboard");
      if (!dashboardUrl) {
        setError("Your organization was found, but its workspace URL couldn't be resolved. Please try again shortly.");
        return;
      }
      if (data.user.organizationId) localStorage.setItem("organization-url-mode", data.user.organizationUrlMode || "subdomain");
      window.location.replace(`${dashboardUrl}${dashboardUrl.includes("?") ? "&" : "?"}v=${Date.now()}`);
    },
    onError: (error) => {
      setError(error.message || "Login failed. Please check your credentials.");
      toast.error(error.message || "Login failed");
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const verify2FAMutation = trpc.auth.verifyLogin2FA.useMutation({
    onSuccess: async (data) => {
      localStorage.setItem("auth-token", data.token);
      saveAuthUser(data.user);
      toast.success("Two-factor authentication verified.");
      const dashboardUrl = await getUserDashboardUrl(data.user);
      if (!dashboardUrl) {
        setError("Your organization was found, but its workspace URL couldn't be resolved. Please try again shortly.");
        return;
      }
      window.location.replace(`${dashboardUrl}?v=${Date.now()}`);
    },
    onError: (error) => {
      setError(error.message || "Verification failed");
      toast.error(error.message || "Verification failed");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (requires2FA) {
      if (!twoFACode || twoFACode.length !== 6) {
        setError("Enter the 6-digit code from your authenticator app.");
        return;
      }
      setLoading(true);
      verify2FAMutation.mutate({ email: formData.email, code: twoFACode });
      return;
    }
    setLoading(true);

    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="Kiini-auth-shell Kiini-login-page flex flex-col">
      {/* Top bar */}
      <div className="p-4 sm:p-6">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); setLocation("/"); }}
          className="Kiini-auth-back Kiini-login-back inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="Kiini-auth-card Kiini-login-card w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); setLocation("/"); }}
                className="flex items-center gap-2.5 no-underline"
              >
                <div className="Kiini-auth-brand-icon Kiini-login-brand-icon flex h-10 w-10 items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="Kiini-auth-brand Kiini-login-brand text-2xl font-bold tracking-tight">
                  Kiini
                </span>
              </a>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </div>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
                  <Label className="Kiini-login-label" htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="Kiini-login-input pl-10"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {!requires2FA && (
              <div className="space-y-2">
                  <Label className="Kiini-login-label" htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="Kiini-login-input pl-10 pr-10"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {requires2FA && (
              <div className="space-y-2">
                <Label className="Kiini-login-label" htmlFor="twofa-code">Authentication Code</Label>
                <Input
                  className="Kiini-login-input"
                  id="twofa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">Open your authenticator app and enter the current 6-digit code.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="Kiini-auth-submit Kiini-login-submit w-full" disabled={loading}>
              {loading ? (requires2FA ? "Verifying..." : "Signing in...") : requires2FA ? "Verify Code" : "Sign In"}
            </Button>
            <div className="flex items-center justify-between w-full">
              <a
                href="/forgot-password"
                onClick={(e) => { e.preventDefault(); setLocation("/forgot-password"); }}
                className="Kiini-auth-link Kiini-login-link text-xs hover:underline"
              >
                Forgot password?
              </a>
              <span className="text-xs text-muted-foreground">
                No account?{" "}
                <a
                  href="/signup"
                  onClick={(e) => { e.preventDefault(); setLocation("/signup"); }}
                  className="Kiini-auth-link Kiini-login-link hover:underline font-medium"
                >
                  Sign up
                </a>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
