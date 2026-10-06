/**
 * Permission Audit Logging System
 * Tracks all permission checks, grants, and denials for security auditing
 */

import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface AuditLogEntry {
  id: string;
  userId: string;
  orgId: string;
  feature: string;
  action: "CHECK" | "GRANT" | "DENY" | "CREATE" | "UPDATE" | "DELETE" | "DELEGATE";
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Hook for audit logging permission actions
 */
export function usePermissionAuditLog() {
  const { user } = useAuth();
  const { mutate: logAudit } = trpc.audit.logPermissionAction.useMutation();

  const logPermissionCheck = useCallback(
    (feature: string, allowed: boolean, reason?: string) => {
      if (!user?.id) return;

      logAudit({
        feature,
        action: "CHECK",
        allowed,
        reason,
        metadata: {
          timestamp: new Date().toISOString(),
          userRole: user.role,
        },
      });
    },
    [user?.id, logAudit]
  );

  const logPermissionGrant = useCallback(
    (feature: string, targetUserId?: string, reason?: string) => {
      if (!user?.id) return;

      logAudit({
        feature,
        action: "GRANT",
        allowed: true,
        reason: reason || `Permission granted for ${feature}`,
        metadata: {
          targetUserId,
          grantedBy: user.id,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user?.id, logAudit]
  );

  const logPermissionDeny = useCallback(
    (feature: string, reason?: string, targetUserId?: string) => {
      if (!user?.id) return;

      logAudit({
        feature,
        action: "DENY",
        allowed: false,
        reason: reason || `Permission denied for ${feature}`,
        metadata: {
          targetUserId,
          deniedBy: user.id,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user?.id, logAudit]
  );

  const logPermissionDelegate = useCallback(
    (feature: string, fromUserId: string, toUserId: string, duration?: number) => {
      if (!user?.id) return;

      logAudit({
        feature,
        action: "DELEGATE",
        allowed: true,
        reason: `Permission delegated from ${fromUserId} to ${toUserId}`,
        metadata: {
          fromUserId,
          toUserId,
          delegatedBy: user.id,
          durationDays: duration,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user?.id, logAudit]
  );

  const logDataAccess = useCallback(
    (feature: string, resourceType: string, resourceId: string, action: "READ" | "WRITE" | "DELETE") => {
      if (!user?.id) return;

      logAudit({
        feature,
        action: action as any,
        allowed: true,
        reason: `${action} access to ${resourceType} ${resourceId}`,
        metadata: {
          resourceType,
          resourceId,
          accessType: action,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user?.id, logAudit]
  );

  return {
    logPermissionCheck,
    logPermissionGrant,
    logPermissionDeny,
    logPermissionDelegate,
    logDataAccess,
  };
}

/**
 * Hook to fetch audit logs (admin only)
 */
export function useAuditLogs(filters?: {
  userId?: string;
  feature?: string;
  action?: AuditLogEntry["action"];
  startDate?: Date;
  endDate?: Date;
}) {
  return trpc.audit.getPermissionLogs.useQuery(filters || {}, {
    staleTime: 60_000,
  });
}

/**
 * Hook to export audit logs for compliance
 */
export function useExportAuditLogs() {
  const { mutate: exportLogs, isPending } = trpc.audit.exportPermissionLogs.useMutation({
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString()}.csv`;
      link.click();
    },
  });

  return { exportLogs, isPending };
}
