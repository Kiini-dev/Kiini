/**
 * P9 Form Annual Generation Job
 * Generates P9 tax forms for all employees at year-end
 */
import { CronJob } from "cron";
import { getDb, getPool } from "../db";
import { generateP9Form } from "../utils/p9-forms";
import { notifyByRole } from "./payrollJobs";

/**
 * Generate P9 forms for all active employees
 * Typically run on March 31st each year (before April 30th KRA deadline)
 */
export async function generateAnnualP9Forms(
  taxYear?: number,
  triggeredBy?: string
): Promise<{ generated: number; errors: string[] }> {
  const pool = getPool();
  if (!pool) {
    console.error("[P9-JOB] Database pool not available");
    return { generated: 0, errors: ["Database not available"] };
  }

  const year = taxYear || new Date().getFullYear() - 1; // Previous year by default
  const errors: string[] = [];
  let generated = 0;

  try {
    console.log(`[P9-JOB] Starting P9 generation for tax year ${year}`);

    // Get all organizations
    const [orgsRows] = await pool.query(
      `SELECT DISTINCT organizationId FROM employees WHERE status = 'active' AND organizationId IS NOT NULL`
    );

    if (!orgsRows || (orgsRows as any[]).length === 0) {
      console.warn("[P9-JOB] No active organizations found");
      return { generated: 0, errors: ["No active organizations"] };
    }

    for (const org of orgsRows as any[]) {
      try {
        // Get all active employees in this organization
        const [empRows] = await pool.query(
          `SELECT id FROM employees WHERE organizationId = ? AND status = 'active'`,
          [org.organizationId]
        );

        if (!empRows || (empRows as any[]).length === 0) {
          console.log(`[P9-JOB] No active employees in org ${org.organizationId}`);
          continue;
        }

        // Generate P9 for each employee
        for (const emp of empRows as any[]) {
          try {
            const [existingRows] = await pool.query(
              `SELECT id FROM p9_forms WHERE organizationId = ? AND employeeId = ? AND taxYear = ? LIMIT 1`,
              [org.organizationId, emp.id, year]
            );
            if ((existingRows as any[]).length > 0) continue;

            const result = await generateP9Form(
              {
                employeeId: emp.id,
                organizationId: org.organizationId,
                taxYear: year,
              },
              triggeredBy || "system"
            );

            if (result) {
              generated++;
            } else {
              errors.push(`Failed to generate P9 for employee ${emp.id} in org ${org.organizationId}`);
            }
          } catch (empError: any) {
            errors.push(
              `Error generating P9 for employee ${emp.id}: ${empError?.message}`
            );
          }
        }

        // Notify HR/Admin of generation completion
        try {
          await notifyByRole(await getDb(), org.organizationId, ["hr", "admin"], {
            title: "Annual P9 Forms Generated",
            message: `P9 tax forms for year ${year} have been generated and are ready for distribution to employees.`,
            type: "info",
          });
        } catch (notifyError) {
          console.error("[P9-JOB] Failed to send notification:", notifyError);
        }
      } catch (orgError: any) {
        errors.push(`Error processing org ${org.organizationId}: ${orgError?.message}`);
      }
    }

    console.log(
      `[P9-JOB] P9 generation completed. Generated: ${generated}, Errors: ${errors.length}`
    );
  } catch (error: any) {
    console.error("[P9-JOB] Fatal error during P9 generation:", error);
    errors.push(`Fatal error: ${error?.message}`);
  }

  return { generated, errors };
}

/**
 * Initialize P9 generation cron job
 * Runs on March 31st at 02:00 AM EAT each year
 */
export function initializeP9Jobs() {
  console.log("[P9-JOB] Initializing annual P9 generation job");

  const p9GenerationJob = new CronJob(
    "0 2 31 3 *", // 02:00 AM on March 31st
    async () => {
      try {
        console.log("[P9-JOB] Running annual P9 generation job...");
        const result = await generateAnnualP9Forms();
        console.log(`[P9-JOB] Job completed: ${result.generated} P9 forms generated`);
      } catch (error) {
        console.error("[P9-JOB] Cron job error:", error);
      }
    },
    null,
    true,
    "Africa/Nairobi"
  );

  return { p9GenerationJob };
}
