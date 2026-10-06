import { useState } from "react";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, User, Mail, Building, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getOrgBaseDomain, getOrgSubdomainHost } from "@/lib/organizationUrl";

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const planParam = searchParams.get("plan");
  const requestedNextPath = searchParams.get("next");
  const nextPath = requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
    ? requestedNextPath
    : planParam ? `/checkout/${encodeURIComponent(planParam)}` : "/checkout";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    company: "",
    slug: "",
    urlMode: "subdomain" as "path" | "subdomain",
    password: "",
    confirmPassword: "",
  });

  const orgHostPreview = formData.slug
    ? formData.urlMode === "subdomain"
      ? getOrgSubdomainHost(formData.slug)
      : `/${formData.slug}`
    : formData.urlMode === "subdomain"
      ? `your-company.${getOrgBaseDomain()}`
      : "/your-company";
  const { data: clientsGeneralData } = trpc.settings.getByCategory.useQuery({ category: "clients_general" }, { staleTime: 60_000 });
  const registerMutation = trpc.auth.register.useMutation();
  const clientRegistrationEnabled = (() => {
    const raw = clientsGeneralData?.allowRegistration;
    if (raw === undefined || raw === null || raw === "") return true;
    if (typeof raw === "boolean") return raw;
    const normalized = String(raw).trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
    return true;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.company.trim()) {
      setError("Company name is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      setError("Organization URL slug must use lowercase letters, numbers, and hyphens only");
      return;
    }

    setLoading(true);
    try {
      const registration = await mutateAsync(registerMutation, {
        email: formData.email,
        password: formData.password,
        name: formData.username,
        company: formData.company,
        slug: formData.slug || undefined,
        urlMode: formData.urlMode,
      });

      toast.success("Account created. Check your email for the verification code.");
      window.location.replace(`/verify-email?email=${encodeURIComponent(formData.email)}&next=${encodeURIComponent(nextPath)}`);
    } catch (err: any) {
      setError(err?.message || "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientRegistrationEnabled) {
    return (
      <div className="Kiini-auth-shell flex flex-col">
        <div className="p-4 sm:p-6">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="Kiini-auth-back inline-flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="Kiini-auth-card w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Registration Closed</CardTitle>
              <CardDescription>
                New client sign-ups are currently disabled by your organization settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Please contact your administrator if you need access or want this feature enabled.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="Kiini-auth-shell flex flex-col">
      {/* Top bar */}
      <div className="p-4 sm:p-6">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); setLocation("/"); }}
          className="Kiini-auth-back inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="Kiini-auth-card w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); setLocation("/"); }}
              className="flex items-center gap-2.5 no-underline"
            >
              <div className="Kiini-auth-brand-icon flex h-10 w-10 items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="Kiini-auth-brand text-2xl font-bold tracking-tight">
                Kiini
              </span>
            </a>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to get started with Kiini
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
<Label htmlFor="company">Company Name *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Organization URL</Label>
              <div className="relative">
                <Input
                  id="slug"
                  type="text"
                  placeholder="your-company"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") })}
                  className="pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  .{getOrgBaseDomain()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Your organization will be available at <span className="font-medium text-foreground">{orgHostPreview}</span></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input id="agreeTerms" type="checkbox" required className="mt-1 rounded border-gray-300" />
              <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <a href="/terms-and-conditions" className="Kiini-auth-link hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="Kiini-auth-link hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="Kiini-auth-submit w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                onClick={(e) => { e.preventDefault(); setLocation(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`); }}
                className="Kiini-auth-link hover:underline font-medium"
              >
                Sign in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}

