/**
 * GDPR API Router
 * Endpoints for GDPR compliance operations
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getUserDataExport, generateExportFile } from "../lib/gdpr/dataExport";
import { deleteUserData, scheduleDeletionByUser } from "../lib/gdpr/dataDeletion";
import { recordConsent, getUserConsent, revokeConsent, ConsentType } from "../lib/gdpr/consentManagement";
import { logDataProcessing, getComplianceAuditTrail, generateComplianceReport } from "../lib/gdpr/auditLog";

export const gdprRouter = router({
  /**
   * Request user data export
   * POST /trpc/gdpr.requestDataExport
   */
  requestDataExport: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;

      // Verify user owns the data or is admin
      if (userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const exportData = await getUserDataExport(userId);
        const { content, filename } = generateExportFile(exportData);

        // Log the export request
        await logDataProcessing(userId, ctx.user.organizationId || null, "export", {
          purpose: "User requested data export per GDPR Article 15",
          processor: ctx.user.id,
          dataCategories: ["personal", "organizational", "transactional"],
        });

        return {
          success: true,
          filename,
          url: `/api/gdpr/export/${userId}`, // Downloadable link
          expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
        };
      } catch (error) {
        throw new Error(`Failed to export data: ${error}`);
      }
    }),

  /**
   * Request account deletion
   * POST /trpc/gdpr.requestDeletion
   */
  requestDeletion: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
        immediate: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.immediate) {
          // Immediate deletion (admin only)
          if (ctx.user.role !== "admin") {
            throw new Error("Only admins can request immediate deletion");
          }

          const result = await deleteUserData(ctx.user.id, input.reason);
          return {
            success: true,
            deleted: true,
            details: result,
          };
        } else {
          // Scheduled deletion with 30-day notice period
          // This allows users to change their mind
          const scheduled = await scheduleDeletionByUser(ctx.user.id);
          return {
            success: true,
            deleted: false,
            deletionScheduledFor: scheduled.deletionScheduledFor,
            cancellationCode: scheduled.cancellationCode,
            message: "Your account will be deleted in 30 days. You can cancel anytime.",
          };
        }
      } catch (error) {
        throw new Error(`Failed to delete data: ${error}`);
      }
    }),

  /**
   * Record user consent
   * POST /trpc/gdpr.recordConsent
   */
  recordConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum([
          "marketing",
          "analytics",
          "essential",
          "third_party",
          "data_processing",
        ]),
        granted: z.boolean(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await recordConsent(ctx.user.id, input.consentType as ConsentType, input.granted, {
          organizationId: ctx.user.organizationId || undefined,
          ipAddress: input.ipAddress,
          expirationDays: 365,
        });

        return { success: true };
      } catch (error) {
        throw new Error(`Failed to record consent: ${error}`);
      }
    }),

  /**
   * Get user consent status
   * GET /trpc/gdpr.getUserConsent
   */
  getUserConsent: protectedProcedure.query(async ({ ctx }) => {
    try {
      const consents = await getUserConsent(ctx.user.id);
      return {
        consents: consents || [],
      };
    } catch (error) {
      throw new Error(`Failed to retrieve consent: ${error}`);
    }
  }),

  /**
   * Revoke consent
   * POST /trpc/gdpr.revokeConsent
   */
  revokeConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum([
          "marketing",
          "analytics",
          "essential",
          "third_party",
          "data_processing",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await revokeConsent(ctx.user.id, input.consentType as ConsentType);
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to revoke consent: ${error}`);
      }
    }),

  /**
   * Get compliance audit trail (admin only)
   * GET /trpc/gdpr.getAuditTrail
   */
  getAuditTrail: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        activityType: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify admin access
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can access audit trails");
      }

      try {
        const auditTrail = await getComplianceAuditTrail(input.organizationId, {
          activityType: input.activityType,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });

        return {
          auditTrail,
          summary: generateComplianceReport(input.organizationId, auditTrail),
        };
      } catch (error) {
        throw new Error(`Failed to retrieve audit trail: ${error}`);
      }
    }),
});
