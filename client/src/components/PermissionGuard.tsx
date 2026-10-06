import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface PermissionGuardProps {
  allowed: boolean;
  feature: string;
  action?: string;
  slug?: string;
  fallbackPath?: string;
  children: React.ReactNode;
}

/**
 * Component for denying access to unauthorized users
 * Shows a consistent access denied screen
 */
export function PermissionGuard({
  allowed,
  feature,
  action = "access this feature",
  slug = "",
  fallbackPath = `/org/${slug}/dashboard`,
  children,
}: PermissionGuardProps) {
  const [, setLocation] = useLocation();

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <Card className="bg-white/5 border-white/10 mt-6">
      <CardContent className="py-12 text-center space-y-4">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-white/20" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Access Restricted</h2>
          <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
            You do not have permission to {action}. If you believe this is an error, please contact your administrator.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 mt-4"
          onClick={() => setLocation(fallbackPath)}
        >
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Inline permission check for UI elements
 * Use for buttons, actions, etc.
 */
export function PermissionDeniedInline({
  reason = "You don't have permission to perform this action",
}: {
  reason?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 border border-white/10 rounded px-3 py-2">
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{reason}</span>
    </div>
  );
}

/**
 * Hook for conditional rendering based on permission
 */
export function usePermissionGuard(allowed: boolean, fallbackPath?: string) {
  const [, setLocation] = useLocation();

  const redirect = () => {
    if (fallbackPath) {
      setLocation(fallbackPath);
    }
  };

  return { allowed, redirect };
}
