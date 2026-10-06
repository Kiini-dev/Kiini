import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { saveAuthUser } from "@/lib/authStorage";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: "super_admin" | "admin" | "staff" | "accountant" | "user" | "client";
  loginMethod?: string;
}

/**
 * Enhanced useAuth hook with persistent localStorage fallback
 * Ensures users stay logged in across page refreshes
 */
export function useAuthPersistent(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [persistedUser, setPersistedUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth-user");
    if (stored) {
      try {
        setPersistedUser(JSON.parse(stored));
      } catch (error) {
        localStorage.removeItem("auth-user");
      }
    }
    setIsHydrated(true);
  }, []);

  // Only try to fetch if we have a token
  const token = typeof window !== 'undefined' ? localStorage.getItem("auth-token") : null;
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: token !== null && isHydrated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("auth-user");
      setPersistedUser(null);
    },
  });

  const logout = useCallback(async () => {
    // Clear local state FIRST to ensure immediate logout
    utils.auth.me.setData(undefined, null);
    localStorage.removeItem("auth-user");
    setPersistedUser(null);
    await utils.auth.me.invalidate();
    
    try {
      // Call server logout endpoint
      await mutateAsync(logoutMutation);
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out on server, that's fine
      } else {
        throw error;
      }
    }
  }, [logoutMutation, utils]);

  // Update persisted user when meQuery data changes
  useEffect(() => {
    if (meQuery.data) {
      const userData: AuthUser = {
        id: meQuery.data.id,
        email: meQuery.data.email,
        name: meQuery.data.name,
        role: meQuery.data.role,
        loginMethod: meQuery.data.loginMethod,
      };
      saveAuthUser(userData);
      setPersistedUser(userData);
    } else if (!meQuery.isLoading && meQuery.data === null) {
      // User is not authenticated
      localStorage.removeItem("auth-user");
      setPersistedUser(null);
    }
  }, [meQuery.data, meQuery.isLoading]);

  // Use backend user if available, otherwise use persisted user
  const user = meQuery.data || persistedUser;

  const state = useMemo(() => {
    // Only consider meQuery.isLoading if the query is actually enabled (has a token and is hydrated)
    // Additional safety: when query is disabled, always report loading as false for this query
    const shouldCheckQueryLoading = token !== null && isHydrated;
    const queryLoading = shouldCheckQueryLoading && meQuery.isLoading;
    return {
      user: user || null,
      loading: queryLoading || logoutMutation.isPending || !isHydrated,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    user,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    isHydrated,
    token,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending || !isHydrated) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    isHydrated,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
