/**
 * Integrations Marketplace Router
 * Handles third-party app integration management, webhooks, and API connectivity
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { getDb } from "../db";
import { and, desc, eq } from "drizzle-orm";
import { integrationConfigs } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { probeERPConnector, ERPConnectorProvider } from "../services/erp-connectors";

const integrationsReadProcedure = createFeatureRestrictedProcedure("integrations:read");
const integrationsWriteProcedure = createFeatureRestrictedProcedure("integrations:write");

// Available integrations catalog
const INTEGRATIONS_CATALOG = [
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    description: 'Connect Kiini with 5000+ apps via Zapier',
    logo: 'https://cdn.zapier.com/zapier/images/logo.png',
    oauthRequired: false,
    features: ['task_automation', 'data_sync', 'multi_app_workflows'],
    pricing: 'freemium',
    setupTime: '< 5 minutes',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Send notifications and updates to Slack channels',
    logo: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
    oauthRequired: true,
    features: ['notifications', 'alerts', 'message_posting'],
    pricing: 'free',
    setupTime: '< 2 minutes',
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'data_integration',
    description: 'Sync data to Google Sheets for analysis and reporting',
    logo: 'https://www.gstatic.com/images/branding/product/1x/sheets_64dp.png',
    oauthRequired: true,
    features: ['data_export', 'real_time_sync', 'automatic_updates'],
    pricing: 'free',
    setupTime: '< 3 minutes',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    description: 'Accept payments and manage subscriptions with Stripe',
    logo: 'https://images.ctfassets.net/fzn2n1nzqv0d/u2rOvM9lEMEkV1iXGM0kf/ab63894f93f2a1e731ebc10141e3d585/Twitter_social_white_circle.png',
    oauthRequired: false,
    features: ['payment_processing', 'subscription_management', 'webhook_support'],
    pricing: 'pay_as_you_go',
    setupTime: '< 10 minutes',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Sync contacts and deals with HubSpot CRM',
    logo: 'https://www.hubspot.com/hubfs/assets/hubspot.com/web-team/images/logos/hubspot-logo.svg',
    oauthRequired: true,
    features: ['contact_sync', 'deal_management', 'email_tracking'],
    pricing: 'free',
    setupTime: '< 5 minutes',
  },
  {
    id: 'bank_feed',
    name: 'Bank Feed / Statement Import',
    category: 'banking',
    description: 'Connect a bank feed or statement endpoint for reconciliation events',
    logo: '',
    oauthRequired: false,
    features: ['statement_sync', 'transaction_import', 'reconciliation'],
    pricing: 'provider_dependent',
    setupTime: '< 15 minutes',
  },
  {
    id: 'etims',
    name: 'KRA eTIMS',
    category: 'tax_compliance',
    description: 'Queue invoice and receipt fiscalization events for eTIMS adapters',
    logo: '',
    oauthRequired: false,
    features: ['invoice_fiscalization', 'receipt_fiscalization', 'tax_status'],
    pricing: 'provider_dependent',
    setupTime: '< 30 minutes',
  },
  {
    id: 'edi',
    name: 'EDI / Trading Partner',
    category: 'supply_chain',
    description: 'Exchange procurement, fulfilment and invoice events with trading partners',
    logo: '',
    oauthRequired: false,
    features: ['purchase_orders', 'dispatch_advice', 'invoices'],
    pricing: 'provider_dependent',
    setupTime: '< 30 minutes',
  },
  {
    id: 'payroll',
    name: 'Payroll Provider',
    category: 'hr',
    description: 'Exchange payroll and statutory events with an external payroll provider',
    logo: '',
    oauthRequired: false,
    features: ['employee_sync', 'payroll_sync', 'statutory_reports'],
    pricing: 'provider_dependent',
    setupTime: '< 20 minutes',
  },
];

export const integrationsMarketplaceRouter = router({
  /**
   * Get available integrations
   */
  getAvailableIntegrations: integrationsReadProcedure.query(() => {
    try {
      return {
        integrations: INTEGRATIONS_CATALOG,
        total: INTEGRATIONS_CATALOG.length,
        success: true,
      };
    } catch (error) {
      console.error("[Integrations] Error fetching catalog:", error);
      return { integrations: [], total: 0, success: false };
    }
  }),

  /**
   * Get specific integration details
   */
  getIntegrationDetails: integrationsReadProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(({ input }) => {
      try {
        const integration = INTEGRATIONS_CATALOG.find(i => i.id === input.integrationId);
        if (!integration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Integration not found',
          });
        }

        // Add detailed configuration requirements
        const details = {
          ...integration,
          configFields: getConfigFieldsForIntegration(integration.id),
          documentation: getDocumentationUrl(integration.id),
          support: {
            email: 'support@kiini.africa',
            status: 'available',
          },
        };

        return { integration: details, success: true };
      } catch (error) {
        console.error("[Integrations] Error fetching integration details:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch integration details',
        });
      }
    }),

  /**
   * Enable an integration
   */
  enableIntegration: integrationsWriteProcedure
    .input(z.object({
      integrationId: z.string(),
      config: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = INTEGRATIONS_CATALOG.find(i => i.id === input.integrationId);
        if (!integration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Integration not found',
          });
        }

        // TODO: Store integration configuration
        const configId = uuidv4();
        const enabledIntegration = {
          id: configId,
          provider: integration.id,
          name: integration.name,
          service: integration.category,
          integrationType: integration.oauthRequired ? 'oauth' : 'api',
          config: JSON.stringify(input.config || {}),
          status: 'active',
          isActive: 1,
          lastSyncAt: new Date().toISOString(),
          lastSync: new Date().toISOString(),
          createdBy: ctx.user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        await database.insert(integrationConfigs).values(enabledIntegration);

        return {
          integration: { ...enabledIntegration, config: input.config || {} },
          success: true,
          message: `${integration.name} enabled successfully`,
        };
      } catch (error) {
        console.error("[Integrations] Error enabling integration:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enable integration',
        });
      }
    }),

  /**
   * Disable an integration
   */
  disableIntegration: integrationsWriteProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await database.update(integrationConfigs).set({ status: 'inactive', isActive: 0, updatedAt: new Date().toISOString() }).where(eq(integrationConfigs.id, input.integrationId));

        return {
          success: true,
          message: 'Integration disabled successfully',
        };
      } catch (error) {
        console.error("[Integrations] Error disabling integration:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable integration',
        });
      }
    }),

  /**
   * Get enabled integrations for organization
   */
  getEnabledIntegrations: integrationsReadProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const rows = await database
        .select()
        .from(integrationConfigs)
        .where(and(eq(integrationConfigs.createdBy, ctx.user?.id), eq(integrationConfigs.isActive, 1)))
        .orderBy(desc(integrationConfigs.createdAt));

      const enabledIntegrations = rows.map((row: any) => ({
        ...row,
        config: row.config ? JSON.parse(row.config) : {},
      }));

      return {
        integrations: enabledIntegrations,
        total: enabledIntegrations.length,
        success: true,
      };
    } catch (error) {
      console.error("[Integrations] Error fetching enabled integrations:", error);
      return { integrations: [], total: 0, success: false };
    }
  }),

  /**
   * Update integration configuration
   */
  updateIntegrationConfig: integrationsWriteProcedure
    .input(z.object({
      integrationId: z.string(),
      config: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        await database.update(integrationConfigs)
          .set({ config: JSON.stringify(input.config), updatedAt: new Date().toISOString() } as any)
          .where(and(eq(integrationConfigs.provider, input.integrationId), eq(integrationConfigs.createdBy, ctx.user?.id)));

        return {
          success: true,
          message: 'Integration configuration updated',
        };
      } catch (error) {
        console.error("[Integrations] Error updating configuration:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update integration configuration',
        });
      }
    }),

  /**
   * Test integration connection
   */
  testConnection: integrationsWriteProcedure
    .input(z.object({
      integrationId: z.string(),
      config: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const config = input.config || {};
        const required: Record<string, string[]> = {
          stripe: ['apiKey'], mpesa: ['consumerKey', 'consumerSecret'],
          ecommerce: ['baseUrl', 'apiKey'], etims: ['baseUrl', 'apiKey'], bank_feed: ['baseUrl', 'apiKey'],
          edi: ['baseUrl', 'apiKey'], payroll: ['baseUrl', 'apiKey'],
        };
        const missing = (required[input.integrationId] || []).filter((key) => !config[key]);
        if (missing.length) return { success: false, status: 'invalid', latency: 0, message: `Missing configuration: ${missing.join(', ')}` };
        if (['mpesa', 'etims', 'bank_feed', 'edi', 'ecommerce', 'payroll'].includes(input.integrationId)) {
          const started = Date.now();
          const result = await probeERPConnector({ provider: input.integrationId as ERPConnectorProvider, ...config });
          return { success: result.ok, status: result.ok ? 'connected' : 'error', latency: Date.now() - started, message: result.message };
        }
        if (config.baseUrl) {
          const started = Date.now();
          const response = await fetch(String(config.baseUrl), { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          return { success: response.ok, status: response.ok ? 'connected' : 'error', latency: Date.now() - started, message: response.ok ? 'Endpoint reachable' : `Endpoint returned ${response.status}` };
        }
        return { success: true, status: 'configured', latency: 0, message: 'Required credentials are configured; provider probe is not available for this adapter.' };
      } catch (error) {
        console.error("[Integrations] Error testing connection:", error);
        return {
          success: false,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Connection test failed',
        };
      }
    }),

  /**
   * Register integration webhook
   */
  registerWebhook: integrationsWriteProcedure
    .input(z.object({
      integrationId: z.string(),
      webhookUrl: z.string().url(),
      events: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const webhookId = uuidv4();
        const webhook = {
          id: webhookId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          integrationId: input.integrationId,
          webhookUrl: input.webhookUrl,
          events: input.events,
          secret: uuidv4(),
          isActive: true,
          lastTriggeredAt: null,
          createdAt: new Date().toISOString(),
        };

        // TODO: Store webhook configuration
        // TODO: Register with third-party service if needed

        return {
          webhook,
          success: true,
          message: 'Webhook registered successfully',
        };
      } catch (error) {
        console.error("[Integrations] Error registering webhook:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register webhook',
        });
      }
    }),

  /**
   * Get webhooks for integration
   */
  getWebhooks: integrationsReadProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input }) => {
      try {
        // TODO: Query from webhooks table
        const webhooks = [];

        return {
          webhooks,
          total: webhooks.length,
          success: true,
        };
      } catch (error) {
        console.error("[Integrations] Error fetching webhooks:", error);
        return { webhooks: [], total: 0, success: false };
      }
    }),

  /**
   * Initiate OAuth flow
   */
  initiateOAuth: integrationsWriteProcedure
    .input(z.object({
      integrationId: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const state = uuidv4();
        
        // TODO: Generate OAuth authorization URL based on integration type
        const authUrl = generateOAuthUrl(input.integrationId, input.redirectUri, state);

        // TODO: Store state for verification in callback
        // await db.storeOAuthState(state, {
        //   organizationId: ctx.user?.organizationId,
        //   integrationId: input.integrationId,
        //   expiresAt: Date.now() + 15 * 60 * 1000,
        // });

        return {
          authUrl,
          state,
          success: true,
        };
      } catch (error) {
        console.error("[Integrations] Error initiating OAuth:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initiate OAuth flow',
        });
      }
    }),

  /**
   * Handle OAuth callback
   */
  handleOAuthCallback: protectedProcedure
    .input(z.object({
      integrationId: z.string(),
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Verify state parameter
        // const storedState = await db.getOAuthState(input.state);
        // if (!storedState || storedState.organizationId !== ctx.user?.organizationId) {
        //   throw new Error('Invalid state parameter');
        // }

        // TODO: Exchange code for access token
        // const tokens = await exchangeCodeForToken(input.integrationId, input.code);

        // TODO: Store tokens securely
        // await db.storeOAuthTokens({
        //   organizationId: ctx.user?.organizationId,
        //   integrationId: input.integrationId,
        //   accessToken: tokens.access_token,
        //   refreshToken: tokens.refresh_token,
        //   expiresAt: tokens.expires_in,
        // });

        return {
          success: true,
          message: 'OAuth authorization completed',
        };
      } catch (error) {
        console.error("[Integrations] Error handling OAuth callback:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete OAuth authorization',
        });
      }
    }),
});

// Helper functions
function getConfigFieldsForIntegration(integrationId: string): any[] {
  const configs: Record<string, any[]> = {
    zapier: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      { name: 'events', label: 'Events to Trigger', type: 'multiselect', required: true },
    ],
    slack: [
      { name: 'channelId', label: 'Slack Channel', type: 'string', required: true },
      { name: 'botToken', label: 'Bot Token', type: 'secret', required: true },
    ],
    stripe: [
      { name: 'apiKey', label: 'API Key', type: 'secret', required: true },
      { name: 'webhookSecret', label: 'Webhook Secret', type: 'secret', required: false },
    ],
  };
  return configs[integrationId] || [];
}

function getDocumentationUrl(integrationId: string): string {
  return `https://docs.kiini.africa/integrations/${integrationId}`;
}

function generateOAuthUrl(
  integrationId: string,
  redirectUri: string,
  state: string
): string {
  const oauthUrls: Record<string, string> = {
    slack: `https://slack.com/oauth_authorize?client_id=xxx&scope=chat:write&redirect_uri=${redirectUri}&state=${state}`,
    google_sheets: `https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets&state=${state}`,
    hubspot: `https://app.hubspot.com/oauth/authorize?client_id=xxx&redirect_uri=${redirectUri}&scope=crm.objects.contacts.read&state=${state}`,
  };
  return oauthUrls[integrationId] || '';
}
