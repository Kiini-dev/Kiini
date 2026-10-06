import { router } from "../_core/trpc";
import { z } from "zod";
import { optionalEmail } from "../utils/validation";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { getDb, logActivity } from "../db";
import * as db from "../db";
import nodemailer from "nodemailer";

// Permission-restricted procedures
const readProcedure = createFeatureRestrictedProcedure("admin:integrations");
const writeProcedure = createFeatureRestrictedProcedure("admin:integrations");

// In-memory storage for integrations (can be replaced with database)
const integrationsStore: Map<string, any> = new Map();

// Initialize with default integrations
const DEFAULT_INTEGRATIONS = [
  {
    id: 'smtp',
    name: 'SMTP Mail Service',
    category: 'Email',
    status: 'disconnected',
    icon: '📧',
    metrics: {
      emailsSent: '0',
      successRate: '0%',
      averageDeliveryTime: '0s',
    },
    description: 'Send emails via SMTP server',
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromEmail: '',
    fromName: 'Kiini',
    isDefault: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    status: 'disconnected',
    icon: '💳',
    metrics: {
      transactionsToday: '0',
      volume: '$0',
      successRate: '0%',
    },
    description: 'Accept payments and manage billing',
    apiKey: '',
    apiSecret: '',
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    category: 'Mobile Money',
    status: 'disconnected',
    icon: '📱',
    metrics: {
      transactionsToday: '0',
      volume: '0 KES',
      successRate: '0%',
    },
    description: 'Mobile money integration for Africa',
    consumerKey: '',
    consumerSecret: '',
  },
  {
    id: 'google',
    name: 'Google OAuth',
    category: 'Authentication',
    status: 'disconnected',
    icon: '🔐',
    metrics: {
      usersToday: '0',
      monthlyUsers: '0',
      failureRate: '0%',
    },
    description: 'Single sign-on via Google',
    clientId: '',
    clientSecret: '',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communications',
    status: 'disconnected',
    icon: '💬',
    metrics: null,
    description: 'Team notifications and alerts',
    webhookUrl: '',
    botToken: '',
  },
];

// Initialize default integrations
for (const integration of DEFAULT_INTEGRATIONS) {
  integrationsStore.set(integration.id, integration);
}

export const integrationsRouter = router({
  /**
   * List all integrations with their status and metrics
   */
  list: readProcedure
    .input(z.object({ 
      search: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        let integrations = Array.from(integrationsStore.values());
        
        if (input?.search) {
          const query = input.search.toLowerCase();
          integrations = integrations.filter(i => 
            i.name.toLowerCase().includes(query) ||
            i.description.toLowerCase().includes(query)
          );
        }
        
        if (input?.category) {
          integrations = integrations.filter(i => i.category === input.category);
        }
        
        return {
          integrations: integrations.map(i => ({
            ...i,
            apiKey: undefined, // Never expose secrets
            apiSecret: undefined,
            consumerSecret: undefined,
            clientSecret: undefined,
            botToken: undefined,
          })),
          total: integrations.length,
        };
      } catch (error) {
        console.error('[INTEGRATIONS] list error:', error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to fetch integrations" 
        });
      }
    }),

  /**
   * Get a single integration's full configuration
   */
  getById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const integration = integrationsStore.get(input);
        if (!integration) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Integration not found" 
          });
        }
        return integration;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to fetch integration" 
        });
      }
    }),

  /**
   * Save/update integration settings
   */
  saveIntegration: writeProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['connected', 'disconnected', 'error']).optional(),
      // Generic fields
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      consumerKey: z.string().optional(),
      consumerSecret: z.string().optional(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      webhookUrl: z.string().optional(),
      botToken: z.string().optional(),
      // SMTP fields
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.boolean().optional(),
      user: z.string().optional(),
      password: z.string().optional(),
      fromEmail: optionalEmail(),
      fromName: z.string().optional(),
      isDefault: z.boolean().optional(),
      metrics: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = integrationsStore.get(input.id);
        if (!integration) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Integration not found" 
          });
        }

        // If setting SMTP as default, unset other default email integrations
        if (input.isDefault && input.id === 'smtp') {
          integrationsStore.forEach((intg) => {
            if (intg.category === 'Email' && intg.id !== 'smtp' && intg.isDefault) {
              intg.isDefault = false;
            }
          });
        }

        const updated = {
          ...integration,
          ...input,
          id: integration.id, // Preserve ID
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        integrationsStore.set(input.id, updated);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "integration_updated",
          entityType: "integration",
          entityId: input.id,
          description: `Updated integration: ${integration.name} (Status: ${input.status || 'unchanged'})`,
        });

        return {
          success: true,
          integration: {
            ...updated,
            apiSecret: undefined,
            consumerSecret: undefined,
            clientSecret: undefined,
            botToken: undefined,
            password: undefined,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[INTEGRATIONS] saveIntegration error:', error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to save integration" 
        });
      }
    }),

  /**
   * Test connection to an integration
   */
  testConnection: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = integrationsStore.get(input);
        if (!integration) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Integration not found" 
          });
        }

        // Simulate connection test
        const isConnected = integration.status === 'connected';
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "integration_test",
          entityType: "integration",
          entityId: input,
          description: `Tested connection to: ${integration.name} (Result: ${isConnected ? 'Success' : 'Failure'})`,
        });

        return {
          success: isConnected,
          message: isConnected ? `Connected to ${integration.name}` : `Failed to connect to ${integration.name}`,
          integration: integration.name,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to test connection" 
        });
      }
    }),

  /**
   * Disconnect an integration
   */
  disconnect: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = integrationsStore.get(input);
        if (!integration) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Integration not found" 
          });
        }

        const updated = {
          ...integration,
          status: 'disconnected',
          apiKey: '',
          apiSecret: '',
          consumerSecret: '',
          clientSecret: '',
          botToken: '',
          metrics: null,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        integrationsStore.set(input, updated);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "integration_disconnected",
          entityType: "integration",
          entityId: input,
          description: `Disconnected integration: ${integration.name}`,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to disconnect integration" 
        });
      }
    }),

  /**
   * Test SMTP connection with settings
   */
  testSMTPConnection: writeProcedure
    .input(z.object({
      host: z.string().min(1, "SMTP host is required"),
      port: z.number().int().min(1).max(65535),
      secure: z.boolean(),
      user: z.string().optional(),
      password: z.string().optional(),
      fromEmail: z.string().email("Invalid from email"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Create transporter with provided settings
        const transporter = nodemailer.createTransport({
          host: input.host,
          port: input.port,
          secure: input.secure,
          auth: input.user ? { user: input.user, pass: input.password } : undefined,
        });

        // Test the connection
        const verified = await transporter.verify();

        if (verified) {
          // Log successful test
          await logActivity({
            userId: ctx.user.id,
            action: "smtp_test_success",
            entityType: "integration",
            entityId: "smtp",
            description: `SMTP connection test successful: ${input.host}:${input.port}`,
          });

          return {
            success: true,
            message: `SMTP connection successful! Connected to ${input.host}:${input.port}`,
          };
        } else {
          throw new Error("SMTP verification failed");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        
        // Log failed test
        await logActivity({
          userId: ctx.user.id,
          action: "smtp_test_failed",
          entityType: "integration",
          entityId: "smtp",
          description: `SMTP connection test failed: ${errorMessage}`,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `SMTP connection failed: ${errorMessage}`,
        });
      }
    }),

  /**
   * Get SMTP configuration (for sending emails)
   */
  getSMTPConfig: readProcedure
    .query(async ({ ctx }) => {
      try {
        const smtp = integrationsStore.get('smtp');
        if (!smtp || smtp.status !== 'connected') {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "SMTP integration not configured",
          });
        }

        return {
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          user: smtp.user,
          password: smtp.password,
          fromEmail: smtp.fromEmail,
          fromName: smtp.fromName,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch SMTP configuration",
        });
      }
    }),

  /**
   * Set SMTP as default email handler
   */
  setDefaultEmailIntegration: writeProcedure
    .input(z.object({
      integrationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = integrationsStore.get(input.integrationId);
        if (!integration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integration not found",
          });
        }

        if (integration.category !== 'Email') {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only email integrations can be set as default",
          });
        }

        if (integration.status !== 'connected') {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Integration must be connected before setting as default",
          });
        }

        // Unset all other default email integrations
        integrationsStore.forEach((intg) => {
          if (intg.category === 'Email' && intg.id !== input.integrationId && intg.isDefault) {
            intg.isDefault = false;
          }
        });

        // Set this one as default
        integration.isDefault = true;
        integration.updatedBy = ctx.user.id;
        integration.updatedAt = new Date().toISOString();

        integrationsStore.set(input.integrationId, integration);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "email_handler_set_default",
          entityType: "integration",
          entityId: input.integrationId,
          description: `Set ${integration.name} as default email handler`,
        });

        return {
          success: true,
          message: `${integration.name} is now the default email handler`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[INTEGRATIONS] setDefaultEmailIntegration error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set default email integration",
        });
      }
    }),
});
