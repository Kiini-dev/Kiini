/**
 * Enterprise Features Router
 * Handles white-labeling, custom branding, SSO, and advanced RBAC
 */

import { z } from "zod";
import { optionalEmail } from "../utils/validation";
import { TRPCError } from "@trpc/server";
import { createCipheriv, createHash, randomBytes } from "crypto";
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import * as db from "../db";
import { v4 as uuidv4 } from "uuid";

const adminProcedure = createFeatureRestrictedProcedure("admin:access");

const ENCRYPTION_KEY = createHash("sha256").update(process.env.JWT_SECRET || "dev-insecure-fallback").digest();

function encryptSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}::${tag.toString("base64")}::${encrypted.toString("base64")}`;
}

function normalizeCustomDomain(domain: string) {
  const cleaned = domain.trim().toLowerCase();
  if (!cleaned) throw new Error("Custom domain cannot be empty");
  if (cleaned.includes(" ")) throw new Error("Custom domain cannot contain spaces");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(cleaned)) throw new Error("Custom domain cannot be an IP address");
  if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(cleaned)) {
    throw new Error("Custom domain is invalid");
  }
  return cleaned;
}

export const enterpriseFeaturesRouter = router({
  /**
   * Configure white-label settings
   */
  configureWhiteLabel: adminProcedure
    .input(z.object({
      companyName: z.string().min(1).max(255),
      logoUrl: z.string().url().optional(),
      faviconUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      supportEmail: optionalEmail(),
      supportPhone: z.string().optional(),
      customDomain: z.string().optional(),
      hideKiiniLogo: z.boolean().default(false),
      customTermsUrl: z.string().url().optional(),
      customPrivacyUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const configId = uuidv4();
        const validatedCustomDomain = input.customDomain ? normalizeCustomDomain(input.customDomain) : undefined;
        const config = {
          id: configId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          companyName: input.companyName,
          logoUrl: input.logoUrl,
          faviconUrl: input.faviconUrl,
          primaryColor: input.primaryColor || '#2563eb',
          secondaryColor: input.secondaryColor || '#64748b',
          supportEmail: input.supportEmail,
          supportPhone: input.supportPhone,
          customDomain: validatedCustomDomain,
          hideKiiniLogo: input.hideKiiniLogo,
          customTermsUrl: input.customTermsUrl,
          customPrivacyUrl: input.customPrivacyUrl,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const orgId = ctx.user?.organizationId || ctx.user?.id;
        const organization = await db.getOrganization(orgId);
        if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

        const settings = await db.getOrganizationSettings(orgId);

        const updatedSettings = {
          ...settings,
          enterprise: {
            ...(settings.enterprise || {}),
            whiteLabel: {
              ...config,
              customDomain: validatedCustomDomain,
            },
          },
        };

        const updatePayload: Record<string, any> = { settings: updatedSettings };
        if (validatedCustomDomain) {
          updatePayload.domain = validatedCustomDomain;
        }

        await db.updateOrganization(orgId, updatePayload);

        return {
          config,
          success: true,
          message: 'White-label configuration saved successfully',
        };
      } catch (error) {
        console.error("[Enterprise] Error configuring white-label:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure white-label settings',
        });
      }
    }),

  /**
   * Get white-label configuration
   */
  getWhiteLabelConfig: protectedProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user?.organizationId || ctx.user?.id;
      const organization = await db.getOrganization(orgId);
      if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

      const settings = await db.getOrganizationSettings(orgId);
      const config = settings.enterprise?.whiteLabel || {
        companyName: 'Kiini: One Hub. Total Control',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        hideKiiniLogo: false,
      };

      return { config, success: true };
    } catch (error) {
      console.error("[Enterprise] Error fetching white-label config:", error);
      return { config: null, success: false };
    }
  }),

  /**
   * Configure Single Sign-On (SAML/OIDC)
   */
  configureSSOSettings: adminProcedure
    .input(z.object({
      ssoType: z.enum(['saml', 'oidc', 'oauth2']),
      name: z.string().min(1),
      idpUrl: z.string().url(),
      clientId: z.string().min(1),
      clientSecret: z.string().min(1),
      mappings: z.object({
        emailField: z.string(),
        nameField: z.string(),
        roleField: z.string().optional(),
      }),
      autoProvision: z.boolean().default(true),
      forceSSO: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const ssoId = uuidv4();
        const ssoConfig = {
          id: ssoId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          ssoType: input.ssoType,
          name: input.name,
          idpUrl: input.idpUrl,
          clientId: input.clientId,
          clientSecret: encryptSecret(input.clientSecret),
          mappings: input.mappings,
          autoProvision: input.autoProvision,
          forceSSO: input.forceSSO,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const orgId = ctx.user?.organizationId || ctx.user?.id;
        const organization = await db.getOrganization(orgId);
        if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

        const settings = await db.getOrganizationSettings(orgId);
        const updatedSettings = {
          ...settings,
          enterprise: {
            ...(settings.enterprise || {}),
            sso: ssoConfig,
          },
        };

        await db.updateOrganization(orgId, { settings: updatedSettings });

        // TODO: Test SSO connection
        // await testSSOConnection(input.idpUrl, input.clientId, input.clientSecret);

        return {
          sso: ssoConfig,
          success: true,
          message: 'SSO configuration saved successfully',
        };
      } catch (error) {
        console.error("[Enterprise] Error configuring SSO:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure SSO settings',
        });
      }
    }),

  /**
   * Get SSO configuration
   */
  getSSOSettings: adminProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user?.organizationId || ctx.user?.id;
      const organization = await db.getOrganization(orgId);
      if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

      const settings = await db.getOrganizationSettings(orgId);
      const ssoConfig = settings.enterprise?.sso || null;
      if (ssoConfig) {
        const { clientSecret, ...sanitized } = ssoConfig;
        return { sso: sanitized, success: true };
      }

      return { sso: null, success: true };
    } catch (error) {
      console.error("[Enterprise] Error fetching SSO config:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch SSO settings',
      });
    }
  }),

  /**
   * Create custom workflow template
   */
  createWorkflowTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum([
        'invoice_to_payment',
        'lead_to_deal',
        'project_completion',
        'approval_chain',
        'custom',
      ]),
      steps: z.array(z.object({
        name: z.string(),
        action: z.string(),
        conditions: z.record(z.string(), z.any()).optional(),
        notifications: z.array(z.string()).optional(),
      })),
      triggers: z.array(z.string()),
      isTemplate: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const workflowId = uuidv4();
        const workflow = {
          id: workflowId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          name: input.name,
          description: input.description,
          category: input.category,
          steps: input.steps,
          triggers: input.triggers,
          isTemplate: input.isTemplate,
          isActive: true,
          createdBy: ctx.user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const orgId = ctx.user?.organizationId || ctx.user?.id;
        const organization = await db.getOrganization(orgId);
        if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

        const settings = await db.getOrganizationSettings(orgId);
        const workflows = settings.enterprise?.workflows || [];
        const updatedSettings = {
          ...settings,
          enterprise: {
            ...(settings.enterprise || {}),
            workflows: [...workflows, workflow],
          },
        };

        await db.updateOrganization(orgId, { settings: updatedSettings });

        return {
          workflow,
          success: true,
          message: 'Workflow template created successfully',
        };
      } catch (error) {
        console.error("[Enterprise] Error creating workflow template:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workflow template',
        });
      }
    }),

  /**
   * Get custom workflow templates
   */
  getWorkflowTemplates: adminProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user?.organizationId || ctx.user?.id;
      const organization = await db.getOrganization(orgId);
      if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
      const settings = await db.getOrganizationSettings(orgId);
      const workflows = settings.enterprise?.workflows || [];

      return { workflows, success: true };
    } catch (error) {
      console.error("[Enterprise] Error fetching workflows:", error);
      return { workflows: [], success: false };
    }
  }),

  /**
   * Configure advanced security policies
   */
  configureSecurityPolicies: adminProcedure
    .input(z.object({
      passwordPolicy: z.object({
        minLength: z.number().int().min(8).max(32),
        requireUppercase: z.boolean(),
        requireNumbers: z.boolean(),
        requireSpecialChars: z.boolean(),
        expirationDays: z.number().int().optional(),
      }).optional(),
      mfaRequired: z.boolean().optional(),
      ipWhitelist: z.array(z.string().regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d+)?$/)).optional(),
      sessionTimeout: z.number().int().optional(),
      dataEncryption: z.boolean().optional(),
      auditLogging: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const policyId = uuidv4();
        const policies = {
          id: policyId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const orgId = ctx.user?.organizationId || ctx.user?.id;
        const organization = await db.getOrganization(orgId);
        if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

        const settings = await db.getOrganizationSettings(orgId);
        const updatedSettings = {
          ...settings,
          enterprise: {
            ...(settings.enterprise || {}),
            securityPolicies: policies,
          },
        };

        await db.updateOrganization(orgId, { settings: updatedSettings });

        return {
          policies,
          success: true,
          message: 'Security policies configured successfully',
        };
      } catch (error) {
        console.error("[Enterprise] Error configuring security policies:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure security policies',
        });
      }
    }),

  /**
   * Get security policies
   */
  getSecurityPolicies: adminProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user?.organizationId || ctx.user?.id;
      const organization = await db.getOrganization(orgId);
      if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
      const settings = await db.getOrganizationSettings(orgId);
      const policies = settings.enterprise?.securityPolicies || null;

      return { policies, success: true };
    } catch (error) {
      console.error("[Enterprise] Error fetching security policies:", error);
      return { policies: null, success: false };
    }
  }),

  /**
   * Configure team/department workflows
   */
  configureTeamWorkflows: adminProcedure
    .input(z.object({
      departmentId: z.string(),
      workflows: z.array(z.object({
        workflowId: z.string(),
        isRequired: z.boolean().default(false),
      })),
      approvalChain: z.array(z.object({
        stepNumber: z.number(),
        roleId: z.string(),
        requiresAll: z.boolean().default(false),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const configId = uuidv4();
        const config = {
          id: configId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          departmentId: input.departmentId,
          workflows: input.workflows,
          approvalChain: input.approvalChain || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const orgId = ctx.user?.organizationId || ctx.user?.id;
        const organization = await db.getOrganization(orgId);
        if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

        const settings = await db.getOrganizationSettings(orgId);
        const currentTeamWorkflows = settings.enterprise?.teamWorkflows || {};
        const updatedSettings = {
          ...settings,
          enterprise: {
            ...(settings.enterprise || {}),
            teamWorkflows: {
              ...currentTeamWorkflows,
              [input.departmentId]: config,
            },
          },
        };

        await db.updateOrganization(orgId, { settings: updatedSettings });

        return {
          config,
          success: true,
          message: 'Team workflows configured successfully',
        };
      } catch (error) {
        console.error("[Enterprise] Error configuring team workflows:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to configure team workflows',
        });
      }
    }),

  /**
   * Get enterprise features usage
   */
  getFeatureUsage: adminProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user?.organizationId || ctx.user?.id;
      const organization = await db.getOrganization(orgId);
      if (!organization) throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });

      const settings = await db.getOrganizationSettings(orgId);
      const users = await db.getUsersByOrganization(orgId);
      const subscription = await db.getOrganizationSubscription(orgId);
      const pricingPlan = subscription ? await db.getPricingPlan(subscription.planId) : null;

      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const billingSummary = subscription ? await db.getBillingUsageSummary(subscription.id, monthStart, now.toISOString().split('T')[0]) : null;

      const usage = {
        whiteLabelEnabled: !!settings.enterprise?.whiteLabel?.isActive,
        ssoConfigured: !!settings.enterprise?.sso,
        customDomainActive: !!settings.enterprise?.whiteLabel?.customDomain,
        workflowCount: (settings.enterprise?.workflows?.length || 0) + Object.keys(settings.enterprise?.teamWorkflows || {}).length,
        userCount: users.length,
        apiCallsThisMonth: billingSummary?.totalApiCalls || 0,
        storageUsedGB: subscription?.storageUsedGB || 0,
        maxStorageGB: pricingPlan?.maxStorageGB ?? 100,
      };

      return { usage, success: true };
    } catch (error) {
      console.error("[Enterprise] Error fetching feature usage:", error);
      return { usage: null, success: false };
    }
  }),

  /**
   * Export organization data
   */
  exportOrganizationData: adminProcedure
    .input(z.object({
      format: z.enum(['json', 'csv', 'xlsx']).default('json'),
      includeUsers: z.boolean().default(true),
      includeTransactions: z.boolean().default(true),
      includeTemplates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const exportId = uuidv4();
        const orgId = ctx.user?.organizationId || ctx.user?.id;

        await db.createExportJob({
          id: exportId,
          name: `Organization export for ${orgId}`,
          dataType: 'organization_export',
          format: input.format,
          filters: JSON.stringify({ organizationId: orgId, includeUsers: input.includeUsers, includeTransactions: input.includeTransactions, includeTemplates: input.includeTemplates }),
          status: 'processing',
          createdBy: ctx.user?.id || 'system',
        });

        return {
          exportId,
          status: 'processing',
          success: true,
          message: 'Data export started. You will receive an email when ready.',
        };
      } catch (error) {
        console.error("[Enterprise] Error exporting data:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export organization data',
        });
      }
    }),
});
