/**
 * Seed Pricing Plans
 * Creates standard pricing tiers with all features
 */

import { getDb } from "../server/db";
import { pricingPlans } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

const PRICING_PLANS = [
  {
    planName: "Trial",
    planSlug: "trial",
    description: "Start free for 14 days. No credit card required.",
    tier: "free" as const,
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyAnnualDiscount: 0,
    maxUsers: 5,
    maxProjects: 3,
    maxStorageGB: 1,
    supportLevel: "email" as const,
    features: {
      crm: false,
      projects: true,
      hr: false,
      payroll: false,
      leave: false,
      attendance: false,
      invoicing: true,
      payments: false,
      expenses: true,
      procurement: false,
      accounting: false,
      budgets: false,
      reports: false,
      ai_hub: false,
      communications: true,
      tickets: true,
      contracts: false,
      work_orders: false,
    },
    displayOrder: 1,
  },
  {
    planName: "Starter",
    planSlug: "starter",
    description: "Perfect for small teams and startups. Basic modules included.",
    tier: "starter" as const,
    monthlyPrice: "4999.00",
    annualPrice: "49990.00",
    monthlyAnnualDiscount: 16.67,
    maxUsers: 10,
    maxProjects: 20,
    maxStorageGB: 10,
    supportLevel: "email" as const,
    features: {
      crm: true,
      projects: true,
      hr: true,
      payroll: false,
      leave: true,
      attendance: true,
      invoicing: true,
      payments: true,
      expenses: true,
      procurement: false,
      accounting: true,
      budgets: true,
      reports: true,
      ai_hub: false,
      communications: true,
      tickets: true,
      contracts: false,
      work_orders: true,
    },
    displayOrder: 2,
  },
  {
    planName: "Professional",
    planSlug: "professional",
    description: "Advanced features for growing businesses. HR & Payroll included.",
    tier: "professional" as const,
    monthlyPrice: "9999.00",
    annualPrice: "99990.00",
    monthlyAnnualDiscount: 16.67,
    maxUsers: 50,
    maxProjects: 100,
    maxStorageGB: 100,
    supportLevel: "priority" as const,
    features: {
      crm: true,
      projects: true,
      hr: true,
      payroll: true,
      leave: true,
      attendance: true,
      invoicing: true,
      payments: true,
      expenses: true,
      procurement: true,
      accounting: true,
      budgets: true,
      reports: true,
      ai_hub: true,
      communications: true,
      tickets: true,
      contracts: true,
      work_orders: true,
    },
    displayOrder: 3,
  },
  {
    planName: "Enterprise",
    planSlug: "enterprise",
    description: "Full-featured suite with dedicated support and custom configurations.",
    tier: "enterprise" as const,
    monthlyPrice: "24999.00",
    annualPrice: "249990.00",
    monthlyAnnualDiscount: 16.67,
    maxUsers: 500,
    maxProjects: 1000,
    maxStorageGB: 1000,
    supportLevel: "24/7_phone" as const,
    features: {
      crm: true,
      projects: true,
      hr: true,
      payroll: true,
      leave: true,
      attendance: true,
      invoicing: true,
      payments: true,
      expenses: true,
      procurement: true,
      accounting: true,
      budgets: true,
      reports: true,
      ai_hub: true,
      communications: true,
      tickets: true,
      contracts: true,
      work_orders: true,
    },
    displayOrder: 4,
  },
];

async function seedPricingPlans() {
  try {
    const database = await getDb();
    if (!database) {
      throw new Error("Database not available");
    }

    console.log("[SEED] Starting pricing plans seed...");

    for (const plan of PRICING_PLANS) {
      const existingPlan = await database
        .select()
        .from(pricingPlans)
        .where({ planSlug: plan.planSlug } as any)
        .limit(1);

      if (existingPlan.length > 0) {
        console.log(`[SEED] Plan "${plan.planName}" already exists, skipping...`);
        continue;
      }

      await database.insert(pricingPlans).values({
        id: uuidv4(),
        planName: plan.planName,
        planSlug: plan.planSlug,
        description: plan.description,
        tier: plan.tier,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        monthlyAnnualDiscount: plan.monthlyAnnualDiscount,
        maxUsers: plan.maxUsers,
        maxProjects: plan.maxProjects,
        maxStorageGB: plan.maxStorageGB,
        features: JSON.stringify(plan.features),
        supportLevel: plan.supportLevel,
        isActive: 1,
        displayOrder: plan.displayOrder,
      } as any);

      console.log(`[SEED] Created pricing plan: "${plan.planName}"`);
    }

    console.log("[SEED] Pricing plans seed completed successfully!");
  } catch (error) {
    console.error("[SEED] Error seeding pricing plans:", error);
    throw error;
  }
}

// Run the seed
seedPricingPlans().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
