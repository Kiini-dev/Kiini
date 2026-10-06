/**
 * Webhook & Job Orchestration Setup
 * Registers all payment webhooks and scheduling jobs
 */

import { Express } from "express";
import { stripeWebhookRouter } from "../webhooks/stripe-webhooks";
import { mpesaWebhookRouter } from "../webhooks/mpesa-webhooks";
import { initializeBillingJobs } from "../jobs/billing-automation";

/**
 * Initialize all webhooks and background jobs
 */
export function setupBillingInfrastructure(app: Express) {
  console.log("🚀 Setting up billing infrastructure...");

  // Register webhook routes
  // These MUST be registered BEFORE parsing JSON body for signature verification
  console.log("📨 Registering payment webhooks...");
  
  // Stripe webhooks at /webhooks/stripe
  app.use("/webhooks", stripeWebhookRouter);
  console.log("✅ Stripe webhook registered at POST /webhooks/stripe");

  // M-Pesa webhooks at /webhooks/mpesa
  app.use("/webhooks", mpesaWebhookRouter);
  console.log("✅ M-Pesa webhook registered at POST /webhooks/mpesa");

  // Initialize background jobs
  console.log("⏰ Initializing billing automation jobs...");
  try {
    initializeBillingJobs();
    console.log("✅ Billing automation jobs initialized");
  } catch (error: any) {
    console.error("❌ Error initializing billing jobs:", error.message);
  }

  console.log("✅ Billing infrastructure ready");
}

export default setupBillingInfrastructure;
