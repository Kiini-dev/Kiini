/**
 * useRequireFeature Hook
 * Ensures user has required feature permission before rendering component
 * Automatically redirects to appropriate dashboard if unauthorized
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessFeature, getDashboardUrl } from "@/lib/permissions";
import { toast } from "sonner";

export function useRequireFeature(feature: string) {
  const [, navigate] = useLocation();
  const { user, loading: isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/");
      return;
    }

    if (!canAccessFeature(user.role, feature)) {
      toast.error(`Access denied: You don't have permission for this feature`);
      navigate(getDashboardUrl(user.role));
    }
  }, [user, feature, isLoading, navigate]);

  return {
    allowed: !isLoading && user && canAccessFeature(user.role, feature),
    isLoading,
    user,
  };
}
