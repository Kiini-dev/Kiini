import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrgSubdomainSlug } from "@/lib/organizationUrl";
import { clearAuthStorage } from "@/lib/authStorage";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  // Read token from localStorage synchronously
  const [persistedToken, setPersistedToken] = useState<string | null>(() => {
    const token = localStorage.getItem("auth-token");
    console.log('[useAuth] Initialized persistedToken from localStorage:', token ? token.substring(0, 20) + '...' : 'NULL');
    return token;
  });

  // Listen for storage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-token") {
        console.log('[useAuth] Storage event: auth-token changed to:', e.newValue ? e.newValue.substring(0, 20) + '...' : 'NULL');
        setPersistedToken(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logoutMutation = trpc.auth.logout.useMutation();

  // ONLY call auth.me if we have a token in localStorage (prevent unnecessary 401s)
  console.log('[useAuth] Creating meQuery with enabled:', persistedToken !== null);
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: persistedToken !== null || !!getOrgSubdomainSlug(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Track query lifecycle
  useEffect(() => {
    console.log('[useAuth] meQuery state changed:', {
      isLoading: meQuery.isLoading,
      isFetching: meQuery.isFetching,
      hasData: !!meQuery.data,
      dataEmail: meQuery.data?.email,
      dataKeys: meQuery.data ? Object.keys(meQuery.data) : [],
      dataFull: JSON.stringify(meQuery.data, null, 2),
      hasError: !!meQuery.error,
      errorMsg: meQuery.error?.message,
      errorCode: (meQuery.error as any)?.data?.code,
      status: meQuery.status,
    });
  }, [meQuery.isLoading, meQuery.isFetching, meQuery.data, meQuery.error, meQuery.status]);

  const logout = useCallback(async () => {
    try {
      await mutateAsync(logoutMutation);
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out on server, that's fine
      } else {
        console.error("Logout error:", error);
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

  const state = useMemo(() => {
    // Handle network/fetch errors gracefully - treat as unauthenticated
    const fetchError = meQuery.error?.message?.includes("Failed to fetch");
    const isError = Boolean(meQuery.error);
    
    const result = {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      fetchError, // indicate if this is a network error
      isError, // indicate if there's any error
    };
    
    console.log('[useAuth] State computed:', {
      loading: result.loading,
      hasData: !!result.user,
      userEmail: result.user?.email,
      userFull: JSON.stringify(result.user, null, 2),
      hasError: !!result.error,
      errorMsg: result.error?.message,
      isAuthenticated: result.isAuthenticated,
      returnedState: JSON.stringify(result, null, 2),
    });
    
    return result;
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
