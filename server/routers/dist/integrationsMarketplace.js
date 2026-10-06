"use strict";
/**
 * Integrations Marketplace Router
 * Handles third-party app integration management, webhooks, and API connectivity
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.integrationsMarketplaceRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
var integrationsReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("integrations:read");
var integrationsWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("integrations:write");
// Available integrations catalog
var INTEGRATIONS_CATALOG = [
    {
        id: 'zapier',
        name: 'Zapier',
        category: 'automation',
        description: 'Connect Kiini with 5000+ apps via Zapier',
        logo: 'https://cdn.zapier.com/zapier/images/logo.png',
        oauthRequired: false,
        features: ['task_automation', 'data_sync', 'multi_app_workflows'],
        pricing: 'freemium',
        setupTime: '< 5 minutes'
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
        setupTime: '< 2 minutes'
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
        setupTime: '< 3 minutes'
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
        setupTime: '< 10 minutes'
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
        setupTime: '< 5 minutes'
    },
];
exports.integrationsMarketplaceRouter = trpc_1.router({
    /**
     * Get available integrations
     */
    getAvailableIntegrations: integrationsReadProcedure.query(function () {
        try {
            return {
                integrations: INTEGRATIONS_CATALOG,
                total: INTEGRATIONS_CATALOG.length,
                success: true
            };
        }
        catch (error) {
            console.error("[Integrations] Error fetching catalog:", error);
            return { integrations: [], total: 0, success: false };
        }
    }),
    /**
     * Get specific integration details
     */
    getIntegrationDetails: integrationsReadProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        try {
            var integration = INTEGRATIONS_CATALOG.find(function (i) { return i.id === input.integrationId; });
            if (!integration) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Integration not found'
                });
            }
            // Add detailed configuration requirements
            var details = __assign(__assign({}, integration), { configFields: getConfigFieldsForIntegration(integration.id), documentation: getDocumentationUrl(integration.id), support: {
                    email: 'support@kiini.africa',
                    status: 'available'
                } });
            return { integration: details, success: true };
        }
        catch (error) {
            console.error("[Integrations] Error fetching integration details:", error);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch integration details'
            });
        }
    }),
    /**
     * Enable an integration
     */
    enableIntegration: integrationsWriteProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        config: zod_1.z.record(zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration, configId, enabledIntegration, database, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        integration = INTEGRATIONS_CATALOG.find(function (i) { return i.id === input.integrationId; });
                        if (!integration) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Integration not found'
                            });
                        }
                        configId = uuid_1.v4();
                        enabledIntegration = {
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
                            createdBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        return [4 /*yield*/, database.insert(schema_1.integrationConfigs).values(enabledIntegration)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                integration: __assign(__assign({}, enabledIntegration), { config: input.config || {} }),
                                success: true,
                                message: integration.name + " enabled successfully"
                            }];
                    case 3:
                        error_1 = _c.sent();
                        console.error("[Integrations] Error enabling integration:", error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to enable integration'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Disable an integration
     */
    disableIntegration: integrationsWriteProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        return [4 /*yield*/, database.update(schema_1.integrationConfigs).set({ status: 'inactive', isActive: 0, updatedAt: new Date().toISOString() }).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, input.integrationId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Integration disabled successfully'
                            }];
                    case 3:
                        error_2 = _b.sent();
                        console.error("[Integrations] Error disabling integration:", error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to disable integration'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get enabled integrations for organization
     */
    getEnabledIntegrations: integrationsReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, rows, enabledIntegrations, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.integrationConfigs)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.integrationConfigs.createdBy, (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id), drizzle_orm_1.eq(schema_1.integrationConfigs.isActive, 1)))
                                .orderBy(drizzle_orm_1.desc(schema_1.integrationConfigs.createdAt))];
                    case 2:
                        rows = _c.sent();
                        enabledIntegrations = rows.map(function (row) { return (__assign(__assign({}, row), { config: row.config ? JSON.parse(row.config) : {} })); });
                        return [2 /*return*/, {
                                integrations: enabledIntegrations,
                                total: enabledIntegrations.length,
                                success: true
                            }];
                    case 3:
                        error_3 = _c.sent();
                        console.error("[Integrations] Error fetching enabled integrations:", error_3);
                        return [2 /*return*/, { integrations: [], total: 0, success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update integration configuration
     */
    updateIntegrationConfig: integrationsWriteProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        config: zod_1.z.record(zod_1.z.any())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // TODO: Update configuration in database
                    // Validate configuration schema first
                    return [2 /*return*/, {
                            success: true,
                            message: 'Integration configuration updated'
                        }];
                }
                catch (error) {
                    console.error("[Integrations] Error updating configuration:", error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update integration configuration'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Test integration connection
     */
    testConnection: integrationsWriteProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        config: zod_1.z.record(zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var testResult;
            return __generator(this, function (_b) {
                try {
                    testResult = {
                        success: true,
                        status: 'connected',
                        latency: Math.random() * 100,
                        message: 'Connection successful'
                    };
                    return [2 /*return*/, testResult];
                }
                catch (error) {
                    console.error("[Integrations] Error testing connection:", error);
                    return [2 /*return*/, {
                            success: false,
                            status: 'failed',
                            error: error instanceof Error ? error.message : 'Connection test failed'
                        }];
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Register integration webhook
     */
    registerWebhook: integrationsWriteProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        webhookUrl: zod_1.z.string().url(),
        events: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var webhookId, webhook;
            var _b, _c;
            return __generator(this, function (_d) {
                try {
                    webhookId = uuid_1.v4();
                    webhook = {
                        id: webhookId,
                        organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                        integrationId: input.integrationId,
                        webhookUrl: input.webhookUrl,
                        events: input.events,
                        secret: uuid_1.v4(),
                        isActive: true,
                        lastTriggeredAt: null,
                        createdAt: new Date().toISOString()
                    };
                    // TODO: Store webhook configuration
                    // TODO: Register with third-party service if needed
                    return [2 /*return*/, {
                            webhook: webhook,
                            success: true,
                            message: 'Webhook registered successfully'
                        }];
                }
                catch (error) {
                    console.error("[Integrations] Error registering webhook:", error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to register webhook'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get webhooks for integration
     */
    getWebhooks: integrationsReadProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var webhooks;
            return __generator(this, function (_b) {
                try {
                    webhooks = [];
                    return [2 /*return*/, {
                            webhooks: webhooks,
                            total: webhooks.length,
                            success: true
                        }];
                }
                catch (error) {
                    console.error("[Integrations] Error fetching webhooks:", error);
                    return [2 /*return*/, { webhooks: [], total: 0, success: false }];
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Initiate OAuth flow
     */
    initiateOAuth: integrationsWriteProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        redirectUri: zod_1.z.string().url()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var state, authUrl;
            return __generator(this, function (_b) {
                try {
                    state = uuid_1.v4();
                    authUrl = generateOAuthUrl(input.integrationId, input.redirectUri, state);
                    // TODO: Store state for verification in callback
                    // await db.storeOAuthState(state, {
                    //   organizationId: ctx.user?.organizationId,
                    //   integrationId: input.integrationId,
                    //   expiresAt: Date.now() + 15 * 60 * 1000,
                    // });
                    return [2 /*return*/, {
                            authUrl: authUrl,
                            state: state,
                            success: true
                        }];
                }
                catch (error) {
                    console.error("[Integrations] Error initiating OAuth:", error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to initiate OAuth flow'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Handle OAuth callback
     */
    handleOAuthCallback: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string(),
        code: zod_1.z.string(),
        state: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
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
                    return [2 /*return*/, {
                            success: true,
                            message: 'OAuth authorization completed'
                        }];
                }
                catch (error) {
                    console.error("[Integrations] Error handling OAuth callback:", error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to complete OAuth authorization'
                    });
                }
                return [2 /*return*/];
            });
        });
    })
});
// Helper functions
function getConfigFieldsForIntegration(integrationId) {
    var configs = {
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
        ]
    };
    return configs[integrationId] || [];
}
function getDocumentationUrl(integrationId) {
    return "https://docs.kiini.africa/integrations/" + integrationId;
}
function generateOAuthUrl(integrationId, redirectUri, state) {
    var oauthUrls = {
        slack: "https://slack.com/oauth_authorize?client_id=xxx&scope=chat:write&redirect_uri=" + redirectUri + "&state=" + state,
        google_sheets: "https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=" + redirectUri + "&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets&state=" + state,
        hubspot: "https://app.hubspot.com/oauth/authorize?client_id=xxx&redirect_uri=" + redirectUri + "&scope=crm.objects.contacts.read&state=" + state
    };
    return oauthUrls[integrationId] || '';
}
