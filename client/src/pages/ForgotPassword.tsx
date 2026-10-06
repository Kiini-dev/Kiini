import { useState } from "react";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const requestPasswordResetMutation = trpc.auth.requestPasswordReset.useMutation();
  const verifyPasswordResetOtpMutation = trpc.auth.verifyPasswordResetOtp.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await mutateAsync(requestPasswordResetMutation, { email });
      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await mutateAsync(verifyPasswordResetOtpMutation, { email, otp });
      setLocation(`/reset-password?token=${encodeURIComponent(result.token)}`);
    } catch (error: any) {
      toast.error(error?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="Kiini-auth-shell flex flex-col">
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
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center gap-2.5 no-underline">
                <div className="Kiini-auth-brand-icon flex h-10 w-10 items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="Kiini-auth-brand text-2xl font-bold tracking-tight">Kiini</span>
              </a>
            </div>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
            <CardDescription className="text-base mt-2">
              We've sent a password reset code to
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={verifyOtp} className="space-y-3">
              <Label htmlFor="reset-otp">One-time code</Label>
              <Input
                id="reset-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em]"
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Confirming..." : "Confirm code"}
              </Button>
            </form>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Try Another Email
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/login")}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="Kiini-auth-shell flex flex-col">
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
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center gap-2.5 no-underline">
              <div className="Kiini-auth-brand-icon flex h-10 w-10 items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="Kiini-auth-brand text-2xl font-bold tracking-tight">Kiini</span>
            </a>
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your email address and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="Kiini-auth-submit w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Security Note:</p>
            <p>
              For your security, we'll only send reset instructions if an account exists with this email address.
              The link will expire after 1 hour.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

