import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setError("");
      setIsSuccess(true);
      toast.success("Email verified successfully!");
      navigate("/login");
    },
    onError: (error: any) => {
      setError(error?.message || "Failed to verify email. The link may have expired.");
      toast.error(error?.message || "Failed to verify email");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    // Extract token from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get("token");
    
    if (!verifyToken) {
      setError("Invalid or missing verification token. Please check your email link.");
      setIsLoading(false);
      return;
    }

    setToken(verifyToken);
    // Automatically verify email when token is found
    verifyEmailMutation.mutate({ token: verifyToken });
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-20 w-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Email Verified</CardTitle>
              <CardDescription className="text-base">
                Your email has been successfully verified
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Your account is now fully activated. You can log in with your username and password.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-20 w-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Verification Failed</CardTitle>
              <CardDescription className="text-base">
                Unable to verify your email address
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                The verification link may have expired or is invalid. Please try the following:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Check if the link in your email is complete</li>
                <li>Request a new verification email from signup</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/signup")}
                className="flex-1"
              >
                Back to Signup
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="flex-1"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-20 w-20 rounded-xl object-cover shadow-lg"
            />
          </div>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Verifying Email</CardTitle>
            <CardDescription className="text-base">
              Please wait while we verify your email address
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            This may take a few moments...
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
