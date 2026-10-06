"use strict";
/**
 * Enterprise Features Router
 * Handles white-labeling, custom branding, SSO, and advanced RBAC
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.enterpriseFeaturesRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var crypto_1 = require("crypto");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var uuid_1 = require("uuid");
var adminProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("admin:access");
var ENCRYPTION_KEY = crypto_1.createHash("sha256").update(process.env.JWT_SECRET || "dev-insecure-fallback").digest();
function encryptSecret(secret) {
    var iv = crypto_1.randomBytes(12);
    var cipher = crypto_1.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    var encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
    var tag = cipher.getAuthTag();
    return iv.toString("base64") + "::" + tag.toString("base64") + "::" + encrypted.toString("base64");
}
function normalizeCustomDomain(domain) {
    var cleaned = domain.trim().toLowerCase();
    if (!cleaned)
        throw new Error("Custom domain cannot be empty");
    if (cleaned.includes(" "))
        throw new Error("Custom domain cannot contain spaces");
    if (/^\d+\.\d+\.\d+\.\d+$/.test(cleaned))
        throw new Error("Custom domain cannot be an IP address");
    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(cleaned)) {
        throw new Error("Custom domain is invalid");
    }
    return cleaned;
}
exports.enterpriseFeaturesRouter = trpc_1.router({
    /**
     * Configure white-label settings
     */
    configureWhiteLabel: adminProcedure
        .input(zod_1.z.object({
        companyName: zod_1.z.string().min(1).max(255),
        logoUrl: zod_1.z.string().url().optional(),
        faviconUrl: zod_1.z.string().url().optional(),
        primaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        secondaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        supportEmail: zod_1.z.string().email().optional(),
        supportPhone: zod_1.z.string().optional(),
        customDomain: zod_1.z.string().optional(),
        hideKiiniLogo: zod_1.z.boolean()["default"](false),
        customTermsUrl: zod_1.z.string().url().optional(),
        customPrivacyUrl: zod_1.z.string().url().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var configId, validatedCustomDomain, config, orgId, organization, settings, updatedSettings, updatePayload, error_1;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 4, , 5]);
                        configId = uuid_1.v4();
                        validatedCustomDomain = input.customDomain ? normalizeCustomDomain(input.customDomain) : undefined;
                        config = {
                            id: configId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
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
                            updatedAt: new Date().toISOString()
                        };
                        orgId = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) || ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _f.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _f.sent();
                        updatedSettings = __assign(__assign({}, settings), { enterprise: __assign(__assign({}, (settings.enterprise || {})), { whiteLabel: __assign(__assign({}, config), { customDomain: validatedCustomDomain }) }) });
                        updatePayload = { settings: updatedSettings };
                        if (validatedCustomDomain) {
                            updatePayload.domain = validatedCustomDomain;
                        }
                        return [4 /*yield*/, db.updateOrganization(orgId, updatePayload)];
                    case 3:
                        _f.sent();
                        return [2 /*return*/, {
                                config: config,
                                success: true,
                                message: 'White-label configuration saved successfully'
                            }];
                    case 4:
                        error_1 = _f.sent();
                        console.error("[Enterprise] Error configuring white-label:", error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to configure white-label settings'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get white-label configuration
     */
    getWhiteLabelConfig: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, organization, settings, config, error_2;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _e.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _e.sent();
                        config = ((_d = settings.enterprise) === null || _d === void 0 ? void 0 : _d.whiteLabel) || {
                            companyName: 'Kiini',
                            primaryColor: '#2563eb',
                            secondaryColor: '#64748b',
                            hideKiiniLogo: false
                        };
                        return [2 /*return*/, { config: config, success: true }];
                    case 3:
                        error_2 = _e.sent();
                        console.error("[Enterprise] Error fetching white-label config:", error_2);
                        return [2 /*return*/, { config: null, success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Configure Single Sign-On (SAML/OIDC)
     */
    configureSSOSettings: adminProcedure
        .input(zod_1.z.object({
        ssoType: zod_1.z["enum"](['saml', 'oidc', 'oauth2']),
        name: zod_1.z.string().min(1),
        idpUrl: zod_1.z.string().url(),
        clientId: zod_1.z.string().min(1),
        clientSecret: zod_1.z.string().min(1),
        mappings: zod_1.z.object({
            emailField: zod_1.z.string(),
            nameField: zod_1.z.string(),
            roleField: zod_1.z.string().optional()
        }),
        autoProvision: zod_1.z.boolean()["default"](true),
        forceSSO: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var ssoId, ssoConfig, orgId, organization, settings, updatedSettings, error_3;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 4, , 5]);
                        ssoId = uuid_1.v4();
                        ssoConfig = {
                            id: ssoId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
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
                            updatedAt: new Date().toISOString()
                        };
                        orgId = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) || ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _f.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _f.sent();
                        updatedSettings = __assign(__assign({}, settings), { enterprise: __assign(__assign({}, (settings.enterprise || {})), { sso: ssoConfig }) });
                        return [4 /*yield*/, db.updateOrganization(orgId, { settings: updatedSettings })];
                    case 3:
                        _f.sent();
                        // TODO: Test SSO connection
                        // await testSSOConnection(input.idpUrl, input.clientId, input.clientSecret);
                        return [2 /*return*/, {
                                sso: ssoConfig,
                                success: true,
                                message: 'SSO configuration saved successfully'
                            }];
                    case 4:
                        error_3 = _f.sent();
                        console.error("[Enterprise] Error configuring SSO:", error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to configure SSO settings'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SSO configuration
     */
    getSSOSettings: adminProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, organization, settings, ssoConfig, clientSecret, sanitized, error_4;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _e.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _e.sent();
                        ssoConfig = ((_d = settings.enterprise) === null || _d === void 0 ? void 0 : _d.sso) || null;
                        if (ssoConfig) {
                            clientSecret = ssoConfig.clientSecret, sanitized = __rest(ssoConfig, ["clientSecret"]);
                            return [2 /*return*/, { sso: sanitized, success: true }];
                        }
                        return [2 /*return*/, { sso: null, success: true }];
                    case 3:
                        error_4 = _e.sent();
                        console.error("[Enterprise] Error fetching SSO config:", error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch SSO settings'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create custom workflow template
     */
    createWorkflowTemplate: adminProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        category: zod_1.z["enum"]([
            'invoice_to_payment',
            'lead_to_deal',
            'project_completion',
            'approval_chain',
            'custom',
        ]),
        steps: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            action: zod_1.z.string(),
            conditions: zod_1.z.record(zod_1.z.any()).optional(),
            notifications: zod_1.z.array(zod_1.z.string()).optional()
        })),
        triggers: zod_1.z.array(zod_1.z.string()),
        isTemplate: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var workflowId, workflow, orgId, organization, settings, workflows, updatedSettings, error_5;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 4, , 5]);
                        workflowId = uuid_1.v4();
                        workflow = {
                            id: workflowId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                            name: input.name,
                            description: input.description,
                            category: input.category,
                            steps: input.steps,
                            triggers: input.triggers,
                            isTemplate: input.isTemplate,
                            isActive: true,
                            createdBy: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        orgId = ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) || ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _h.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _h.sent();
                        workflows = ((_g = settings.enterprise) === null || _g === void 0 ? void 0 : _g.workflows) || [];
                        updatedSettings = __assign(__assign({}, settings), { enterprise: __assign(__assign({}, (settings.enterprise || {})), { workflows: __spreadArrays(workflows, [workflow]) }) });
                        return [4 /*yield*/, db.updateOrganization(orgId, { settings: updatedSettings })];
                    case 3:
                        _h.sent();
                        return [2 /*return*/, {
                                workflow: workflow,
                                success: true,
                                message: 'Workflow template created successfully'
                            }];
                    case 4:
                        error_5 = _h.sent();
                        console.error("[Enterprise] Error creating workflow template:", error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create workflow template'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get custom workflow templates
     */
    getWorkflowTemplates: adminProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, organization, settings, workflows, error_6;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _e.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _e.sent();
                        workflows = ((_d = settings.enterprise) === null || _d === void 0 ? void 0 : _d.workflows) || [];
                        return [2 /*return*/, { workflows: workflows, success: true }];
                    case 3:
                        error_6 = _e.sent();
                        console.error("[Enterprise] Error fetching workflows:", error_6);
                        return [2 /*return*/, { workflows: [], success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Configure advanced security policies
     */
    configureSecurityPolicies: adminProcedure
        .input(zod_1.z.object({
        passwordPolicy: zod_1.z.object({
            minLength: zod_1.z.number().int().min(8).max(32),
            requireUppercase: zod_1.z.boolean(),
            requireNumbers: zod_1.z.boolean(),
            requireSpecialChars: zod_1.z.boolean(),
            expirationDays: zod_1.z.number().int().optional()
        }).optional(),
        mfaRequired: zod_1.z.boolean().optional(),
        ipWhitelist: zod_1.z.array(zod_1.z.string().regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d+)?$/)).optional(),
        sessionTimeout: zod_1.z.number().int().optional(),
        dataEncryption: zod_1.z.boolean().optional(),
        auditLogging: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var policyId, policies, orgId, organization, settings, updatedSettings, error_7;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 4, , 5]);
                        policyId = uuid_1.v4();
                        policies = __assign(__assign({ id: policyId, organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) }, input), { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                        orgId = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) || ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _f.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _f.sent();
                        updatedSettings = __assign(__assign({}, settings), { enterprise: __assign(__assign({}, (settings.enterprise || {})), { securityPolicies: policies }) });
                        return [4 /*yield*/, db.updateOrganization(orgId, { settings: updatedSettings })];
                    case 3:
                        _f.sent();
                        return [2 /*return*/, {
                                policies: policies,
                                success: true,
                                message: 'Security policies configured successfully'
                            }];
                    case 4:
                        error_7 = _f.sent();
                        console.error("[Enterprise] Error configuring security policies:", error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to configure security policies'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get security policies
     */
    getSecurityPolicies: adminProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, organization, settings, policies, error_8;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _e.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _e.sent();
                        policies = ((_d = settings.enterprise) === null || _d === void 0 ? void 0 : _d.securityPolicies) || null;
                        return [2 /*return*/, { policies: policies, success: true }];
                    case 3:
                        error_8 = _e.sent();
                        console.error("[Enterprise] Error fetching security policies:", error_8);
                        return [2 /*return*/, { policies: null, success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Configure team/department workflows
     */
    configureTeamWorkflows: adminProcedure
        .input(zod_1.z.object({
        departmentId: zod_1.z.string(),
        workflows: zod_1.z.array(zod_1.z.object({
            workflowId: zod_1.z.string(),
            isRequired: zod_1.z.boolean()["default"](false)
        })),
        approvalChain: zod_1.z.array(zod_1.z.object({
            stepNumber: zod_1.z.number(),
            roleId: zod_1.z.string(),
            requiresAll: zod_1.z.boolean()["default"](false)
        })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var configId, config, orgId, organization, settings, currentTeamWorkflows, updatedSettings, error_9;
            var _b;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 4, , 5]);
                        configId = uuid_1.v4();
                        config = {
                            id: configId,
                            organizationId: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id),
                            departmentId: input.departmentId,
                            workflows: input.workflows,
                            approvalChain: input.approvalChain || [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        orgId = ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) || ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _h.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _h.sent();
                        currentTeamWorkflows = ((_g = settings.enterprise) === null || _g === void 0 ? void 0 : _g.teamWorkflows) || {};
                        updatedSettings = __assign(__assign({}, settings), { enterprise: __assign(__assign({}, (settings.enterprise || {})), { teamWorkflows: __assign(__assign({}, currentTeamWorkflows), (_b = {}, _b[input.departmentId] = config, _b)) }) });
                        return [4 /*yield*/, db.updateOrganization(orgId, { settings: updatedSettings })];
                    case 3:
                        _h.sent();
                        return [2 /*return*/, {
                                config: config,
                                success: true,
                                message: 'Team workflows configured successfully'
                            }];
                    case 4:
                        error_9 = _h.sent();
                        console.error("[Enterprise] Error configuring team workflows:", error_9);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to configure team workflows'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get enterprise features usage
     */
    getFeatureUsage: adminProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, organization, settings, users, subscription, pricingPlan, _b, now, monthStart, billingSummary, _c, usage, error_10;
            var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            return __generator(this, function (_q) {
                switch (_q.label) {
                    case 0:
                        _q.trys.push([0, 11, , 12]);
                        orgId = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) || ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id);
                        return [4 /*yield*/, db.getOrganization(orgId)];
                    case 1:
                        organization = _q.sent();
                        if (!organization)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationSettings(orgId)];
                    case 2:
                        settings = _q.sent();
                        return [4 /*yield*/, db.getUsersByOrganization(orgId)];
                    case 3:
                        users = _q.sent();
                        return [4 /*yield*/, db.getOrganizationSubscription(orgId)];
                    case 4:
                        subscription = _q.sent();
                        if (!subscription) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.getPricingPlan(subscription.planId)];
                    case 5:
                        _b = _q.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = null;
                        _q.label = 7;
                    case 7:
                        pricingPlan = _b;
                        now = new Date();
                        monthStart = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-01";
                        if (!subscription) return [3 /*break*/, 9];
                        return [4 /*yield*/, db.getBillingUsageSummary(subscription.id, monthStart, now.toISOString().split('T')[0])];
                    case 8:
                        _c = _q.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _c = null;
                        _q.label = 10;
                    case 10:
                        billingSummary = _c;
                        usage = {
                            whiteLabelEnabled: !!((_g = (_f = settings.enterprise) === null || _f === void 0 ? void 0 : _f.whiteLabel) === null || _g === void 0 ? void 0 : _g.isActive),
                            ssoConfigured: !!((_h = settings.enterprise) === null || _h === void 0 ? void 0 : _h.sso),
                            customDomainActive: !!((_k = (_j = settings.enterprise) === null || _j === void 0 ? void 0 : _j.whiteLabel) === null || _k === void 0 ? void 0 : _k.customDomain),
                            workflowCount: (((_m = (_l = settings.enterprise) === null || _l === void 0 ? void 0 : _l.workflows) === null || _m === void 0 ? void 0 : _m.length) || 0) + Object.keys(((_o = settings.enterprise) === null || _o === void 0 ? void 0 : _o.teamWorkflows) || {}).length,
                            userCount: users.length,
                            apiCallsThisMonth: (billingSummary === null || billingSummary === void 0 ? void 0 : billingSummary.totalApiCalls) || 0,
                            storageUsedGB: (subscription === null || subscription === void 0 ? void 0 : subscription.storageUsedGB) || 0,
                            maxStorageGB: (_p = pricingPlan === null || pricingPlan === void 0 ? void 0 : pricingPlan.maxStorageGB) !== null && _p !== void 0 ? _p : 100
                        };
                        return [2 /*return*/, { usage: usage, success: true }];
                    case 11:
                        error_10 = _q.sent();
                        console.error("[Enterprise] Error fetching feature usage:", error_10);
                        return [2 /*return*/, { usage: null, success: false }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export organization data
     */
    exportOrganizationData: adminProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['json', 'csv', 'xlsx'])["default"]('json'),
        includeUsers: zod_1.z.boolean()["default"](true),
        includeTransactions: zod_1.z.boolean()["default"](true),
        includeTemplates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var exportId, orgId, error_11;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        exportId = uuid_1.v4();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, db.createExportJob({
                                id: exportId,
                                name: "Organization export for " + orgId,
                                dataType: 'organization_export',
                                format: input.format,
                                filters: JSON.stringify({ organizationId: orgId, includeUsers: input.includeUsers, includeTransactions: input.includeTransactions, includeTemplates: input.includeTemplates }),
                                status: 'processing',
                                createdBy: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system'
                            })];
                    case 1:
                        _e.sent();
                        return [2 /*return*/, {
                                exportId: exportId,
                                status: 'processing',
                                success: true,
                                message: 'Data export started. You will receive an email when ready.'
                            }];
                    case 2:
                        error_11 = _e.sent();
                        console.error("[Enterprise] Error exporting data:", error_11);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to export organization data'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
