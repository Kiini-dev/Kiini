import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

/**
 * Hook that builds a userId → name lookup map from the users list.
 * Falls back to a truncated ID when the name cannot be resolved.
 */
export function useUserNameMap() {
  const { data: usersList } = trpc.users.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(usersList)) {
      for (const u of usersList) {
        if (u.id && u.name) map.set(u.id, u.name);
        else if (u.id && u.email) map.set(u.id, u.email);
      }
    }
    return map;
  }, [usersList]);

  /** Resolve a userId to a display name. */
  const resolve = (userId?: string | null): string => {
    if (!userId) return "-";
    return userMap.get(userId) || "Unknown user";
  };

  return { userMap, resolve };
}
