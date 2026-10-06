import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { saveAuthUser } from "@/lib/authStorage";

export default function VerifyEmail() {
  const [location] = useLocation();
  const query = location.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const rawEmail = query.split("&").find((part) => part.startsWith("email="))?.slice("email=".length);
  const fallbackStoredEmail = (() => {
    try {
      const rawUser = localStorage.getItem("auth-user");
      if (!rawUser) return "";
      const user = JSON.parse(rawUser);
      return typeof user?.email === "string" ? user.email : "";
    } catch {
      return "";
    }
  })();
  const emailFromUrl = (rawEmail ? decodeURIComponent(rawEmail) : (params.get("email") || ""))
    .trim()
    .replace(/\s+/g, "+");
  const [manualEmail, setManualEmail] = useState(fallbackStoredEmail || emailFromUrl);
  const email = (emailFromUrl || manualEmail || fallbackStoredEmail).trim().replace(/\s+/g, "+");
  const verificationToken = params.get("token") || "";
  const nextPath = params.get("next") || "/checkout";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const verifyMutation = trpc.auth.verifyEmail.useMutation();
  const resendMutation = trpc.auth.resendEmailVerification.useMutation();

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetEmail = (email || manualEmail || fallbackStoredEmail).trim();

    if (!verificationToken && !targetEmail) {
      toast.error("Please enter the email address associated with your account.");
      return;
    }

    if (!verificationToken && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      toast.error("A valid email address is required to verify with the sent code.");
      return;
    }

    setLoading(true);
    try {
      const payload = verificationToken
        ? { token: verificationToken, ...(targetEmail ? { email: targetEmail } : {}) }
        : { email: targetEmail, otp };

      const result = await mutateAsync(verifyMutation, payload as any);
      if (result.token) localStorage.setItem("auth-token", result.token);
      if (result.user) saveAuthUser(result.user);
      toast.success("Email verified successfully.");
      window.location.replace(nextPath);
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    const targetEmail = (email || manualEmail || fallbackStoredEmail).trim();

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      toast.error("We could not find a valid email address to resend the code.");
      return;
    }

    try {
      const result = await mutateAsync(resendMutation, { email: targetEmail });
      if (result.success) toast.success("A new verification code has been sent.");
      else toast.error(result.message || "The verification email could not be sent.");
    } catch (error: any) {
      toast.error(error?.message || "Could not resend the code");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <MailCheck className="mx-auto mb-3 h-10 w-10 text-indigo-600" />
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {email ? `Enter the 6-digit code sent to ${email}.` : "Enter your email and the 6-digit code sent to your inbox."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verify} className="space-y-4">
            {!verificationToken && !email && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  value={manualEmail}
                  onChange={(event) => setManualEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}
            <Input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em]"
              required
            />
            <Button className="w-full" disabled={loading || otp.length !== 6 || (!verificationToken && !email && !manualEmail)}>
              {loading ? "Verifying..." : "Verify email"}
            </Button>
          </form>
          <Button variant="ghost" className="mt-3 w-full" onClick={resend} disabled={resendMutation.isPending}>
            Resend code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
