import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { canAccessRoute } from "@/lib/permissions";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoute?: string;
}

/**
 * ProtectedRoute component that checks user authentication and permissions
 * before rendering the protected content
 */
export default function ProtectedRoute({ children, requiredRoute }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check route access if requiredRoute is specified
    if (requiredRoute && !canAccessRoute(user?.role, requiredRoute)) {
      navigate("/404");
      return;
    }
  }, [loading, isAuthenticated, user, requiredRoute, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If route check failed, don't render children
  if (requiredRoute && !canAccessRoute(user?.role, requiredRoute)) {
    return null;
  }

  return <>{children}</>;
}
