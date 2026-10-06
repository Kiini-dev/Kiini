import { getDb } from "../server/db";

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: ts-node scripts/fix-project-budget.ts <projectId>");
    process.exit(1);
  }
  const id = args[0];
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  const row = await db.select().from((await import("../drizzle/schema")).projects).where((await import("drizzle-orm")).eq((await import("../drizzle/schema")).projects.id, id)).limit(1);
  if (!row || row.length === 0) {
    console.error(`Project ${id} not found`);
    process.exit(1);
  }

  const project = row[0] as any;
  console.log("Current budget:", project.budget);

  // Heuristic: if budget is >0 and less than 100000, treat as major units and convert to cents
  if (project.budget > 0 && project.budget < 100000) {
    const newBudget = Math.round(project.budget * 100);
    await db.update((await import("../drizzle/schema")).projects).set({ budget: newBudget }).where((await import("drizzle-orm")).eq((await import("../drizzle/schema")).projects.id, id));
    console.log(`Updated project ${id} budget -> ${newBudget}`);
  } else {
    console.log("No update needed (budget looks like cents or zero)");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
