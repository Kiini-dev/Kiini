import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { dispatchSystemAlert, dispatchSystemReport } from "../services/systemReportingService";

const systemReportsAdmin = createFeatureRestrictedProcedure("system:manage");

export const systemReportsRouter = router({
  run: systemReportsAdmin
    .input(z.object({ kind: z.enum(["weekly", "monthly"]) }))
    .mutation(async ({ input }) => ({ success: true, ...(await dispatchSystemReport(input.kind)) })),
  alert: systemReportsAdmin
    .input(z.object({
      title: z.string().min(1).max(160),
      message: z.string().min(1).max(5000),
      organizationId: z.string().optional(),
      category: z.string().max(80).optional(),
      priority: z.enum(["low", "normal", "high", "critical"]).default("high"),
    }))
    .mutation(async ({ input }) => ({
      success: true,
      ...(await dispatchSystemAlert(input)),
    })),
});
