import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { getOrgSubdomainSlug } from "@/lib/organizationUrl";
import { clearAuthStorage, clearAuthStorageForLogoutRedirect, saveAuthUser } from "@/lib/authStorage";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: "super_admin" | "admin" | "staff" | "accountant" | "hr" | "user" | "client";
  effectiveRole?: string;
  employeeId?: string | null;
  effectivePermissions?: string[];
  loginMethod?: string;
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationUrlMode?: "path" | "subdomain" | null;
  organizationName?: string | null;
  requiresPasswordChange?: boolean;
}

/**
 * Enhanced auth hook with persistent login state
 * 
 * Features:
 * - Persists user data to localStorage as fallback when cookies fail
 * - Stores JWT token in localStorage for Docker/HTTP environments
 * - Handles hydration to prevent SSR mismatches
 * - Provides role-based routing information
 * - Automatic redirect on unauthenticated access
 */
export function useAuthWithPersistence(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [logoutRedirectHandled] = useState(() => clearAuthStorageForLogoutRedirect());
  
  // Try to load persisted user and token synchronously from localStorage
  // This is the SOURCE OF TRUTH for who is logged in on protected pages
  const [persistedUser, setPersistedUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUser = localStorage.getItem("auth-user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [persistedToken, setPersistedToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth-token");
  });

  // Keep localStorage in sync across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth-token") {
        setPersistedToken(event.newValue);
      }
      if (event.key === "auth-user") {
        try {
          setPersistedUser(event.newValue ? JSON.parse(event.newValue) : null);
        } catch {
          setPersistedUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Helper to clear all auth state (token, user, and query cache)
  const clearAuthState = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    setPersistedToken(null);
    setPersistedUser(null);
    utils.auth.me.setData(undefined, null);
  }, [utils.auth.me]);

  // Fetch auth status when we have either a persisted token or persisted user.
  // This validates the session by either token auth or cookie-based auth.
  const shouldFetchAuth = !logoutRedirectHandled && Boolean(persistedToken || persistedUser || getOrgSubdomainSlug());
  
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: shouldFetchAuth,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Only log every 3rd render to avoid console spam
  const [logCounter, setLogCounter] = useState(0);
  useEffect(() => {
    setLogCounter(c => c + 1);
  }, []);
  
  if (logCounter % 3 === 0) {
    console.log('[useAuthWithPersistence] meQuery state:', {
      shouldFetchAuth,
      isLoading: meQuery.isLoading,
      isFetching: meQuery.isFetching,
      hasData: !!meQuery.data,
      hasError: !!meQuery.error,
      status: meQuery.status,
    });
  }

  // Only clear auth state on genuine UNAUTHORIZED errors (not network/server errors).
  useEffect(() => {
    if (!meQuery.error || !shouldFetchAuth) return;
    const err = meQuery.error;
    const isUnauthorized =
      err instanceof TRPCClientError &&
      (err.message === UNAUTHED_ERR_MSG ||
        err.message === 'UNAUTHORIZED' ||
        (err.data as any)?.code === 'UNAUTHORIZED');
    if (isUnauthorized) {
      clearAuthState();
    }
  }, [meQuery.error, shouldFetchAuth, clearAuthState]);

  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      // Keep the protected tree mounted until the server logout completes.
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
    } finally {
      if (typeof window !== "undefined") {
        clearAuthStorage();
        const loginUrl = new URL(getLoginUrl(), window.location.href);
        loginUrl.searchParams.set("logout", "1");
        window.location.replace(loginUrl.toString());
      }
    }
  }, [logoutMutation]);

  // Update persisted user and token when meQuery data changes
  useEffect(() => {
    console.log('[useAuthWithPersistence] meQuery data changed:', {
      hasData: !!meQuery.data,
      dataType: meQuery.data ? typeof meQuery.data : 'null',
      isLoading: meQuery.isLoading,
      error: meQuery.error?.message,
    });

    if (meQuery.data) {
      console.log('[useAuthWithPersistence] meQuery.data received:', meQuery.data);
      const { token, ...rest } = meQuery.data as any;
      const userData = rest as AuthUser;
      console.log('[useAuthWithPersistence] Extracted userData:', userData);

      saveAuthUser(userData);
      setPersistedUser(userData);

      // Store token if available (from login response)
      if (token) {
        localStorage.setItem("auth-token", token);
        setPersistedToken(token);
      }
    } else if (!meQuery.isLoading && meQuery.data === null && !meQuery.error) {
      // Server explicitly returned null (not an error) — user is not authenticated
      console.log('[useAuthWithPersistence] Server returned null user, clearing auth state');
      localStorage.removeItem("auth-user");
      localStorage.removeItem("auth-token");
      setPersistedUser(null);
      setPersistedToken(null);
    }
  }, [meQuery.data, meQuery.isLoading, meQuery.error]);

  // Use backend user if available, otherwise use persisted user
  const user = meQuery.data || persistedUser;

  const state = useMemo(() => {
    const effectiveUser = user || null;
    const hasPersistedAuth = Boolean(persistedToken || persistedUser);
    const shouldWaitForQuery = !hasPersistedAuth && meQuery.isLoading;
    const isWaitingForAuth = logoutMutation.isPending || shouldWaitForQuery;

    console.log('[useAuthWithPersistence] Computing state:', {
      effectiveUserEmail: effectiveUser?.email,
      userSource: meQuery.data ? 'meQuery' : (persistedUser ? 'persistedUser' : 'null'),
      shouldWaitForQuery,
      isWaitingForAuth,
      hasPersistedAuth,
      persistedToken: persistedToken ? 'exists' : 'null',
      persistedUserExists: !!persistedUser,
      meQueryLoading: meQuery.isLoading,
    });

    return {
      user: effectiveUser,
      loading: isWaitingForAuth,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(effectiveUser) || hasPersistedAuth,
    };
  }, [
    user,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    persistedToken,
    persistedUser,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user || Boolean(persistedToken || persistedUser)) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    persistedToken,
    persistedUser,
  ]);

  return {
    ...state,
    refresh: useCallback(() => meQuery.refetch(), [meQuery.refetch]),
    logout,
  };
}
