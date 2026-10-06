import "dotenv/config";

// For a dev-only, unauthenticated test run we avoid connecting to the real database
// by forcing DATABASE_URL to empty so getDb() returns null and procedures return null safely.
process.env.DATABASE_URL = "";

import { appRouter } from "../server/routers";

async function run() {
  try {
    // Create a fake context with admin user to bypass protectedProcedure
    const ctx = { req: null, res: null, user: { id: 'dev_user', role: 'admin' } } as any;
    const caller = (appRouter as any).createCaller ? (appRouter as any).createCaller(ctx) : null;

    if (!caller) {
      console.error('createCaller is not available on appRouter');
      process.exit(1);
    }

    console.log('Calling reports.mrr...');
    const mrr = await caller.reports.mrr();
    console.log('MRR:', mrr);

    console.log('\nCalling reports.projectMetrics...');
    const pm = await caller.reports.projectMetrics();
    console.log('Project Metrics:', pm);

    console.log('\nCalling reports.cashFlowForecast (3 months)...');
    const cf = await caller.reports.cashFlowForecast({ monthsAhead: 3 });
    console.log('Cash Flow Forecast:', cf);

    console.log('\nDone.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();
