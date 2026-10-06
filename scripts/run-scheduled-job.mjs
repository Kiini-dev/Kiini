#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(appRoot);
process.env.NODE_ENV ||= "production";
config({ path: path.join(appRoot, process.env.NODE_ENV === "production" ? ".env.production" : ".env") });
config({ path: path.join(appRoot, ".env") });

const [jobName, period] = process.argv.slice(2);
if (!jobName) {
  console.error("Usage: node scripts/run-scheduled-job.mjs <payroll-process|payslip-dispatch|p9-generate> [YYYY-MM|YYYY]");
  process.exitCode = 2;
} else {
  let runner;
  try {
    runner = await import("../dist/scheduled-jobs.js");
    const result = await runner.runScheduledJob(jobName, period);
    console.log(`[CRON-RUNNER] ${jobName}: ${JSON.stringify(result)}`);
    if (Array.isArray(result?.errors) && result.errors.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`[CRON-RUNNER] ${jobName} failed:`, error);
    process.exitCode = 1;
  } finally {
    try {
      await runner?.closeScheduledJobConnections();
    } catch (error) {
      console.error("[CRON-RUNNER] Failed to close database pool:", error);
      process.exitCode = 1;
    }
  }
}