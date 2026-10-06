"use strict";
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
exports.integrationsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db_1 = require("../db");
var nodemailer_1 = require("nodemailer");
// Permission-restricted procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("admin:integrations");
var writeProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("admin:integrations");
// In-memory storage for integrations (can be replaced with database)
var integrationsStore = new Map();
// Initialize with default integrations
var DEFAULT_INTEGRATIONS = [
    {
        id: 'smtp',
        name: 'SMTP Mail Service',
        category: 'Email',
        status: 'disconnected',
        icon: '📧',
        metrics: {
            emailsSent: '0',
            successRate: '0%',
            averageDeliveryTime: '0s'
        },
        description: 'Send emails via SMTP server',
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        fromEmail: '',
        fromName: 'Kiini Solutions',
        isDefault: false
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
            successRate: '0%'
        },
        description: 'Accept payments and manage billing',
        apiKey: '',
        apiSecret: ''
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
            successRate: '0%'
        },
        description: 'Mobile money integration for Africa',
        consumerKey: '',
        consumerSecret: ''
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
            failureRate: '0%'
        },
        description: 'Single sign-on via Google',
        clientId: '',
        clientSecret: ''
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
        botToken: ''
    },
];
// Initialize default integrations
for (var _i = 0, DEFAULT_INTEGRATIONS_1 = DEFAULT_INTEGRATIONS; _i < DEFAULT_INTEGRATIONS_1.length; _i++) {
    var integration = DEFAULT_INTEGRATIONS_1[_i];
    integrationsStore.set(integration.id, integration);
}
exports.integrationsRouter = trpc_1.router({
    /**
     * List all integrations with their status and metrics
     */
    list: readProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        category: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var integrations, query_1;
            return __generator(this, function (_b) {
                try {
                    integrations = Array.from(integrationsStore.values());
                    if (input === null || input === void 0 ? void 0 : input.search) {
                        query_1 = input.search.toLowerCase();
                        integrations = integrations.filter(function (i) {
                            return i.name.toLowerCase().includes(query_1) ||
                                i.description.toLowerCase().includes(query_1);
                        });
                    }
                    if (input === null || input === void 0 ? void 0 : input.category) {
                        integrations = integrations.filter(function (i) { return i.category === input.category; });
                    }
                    return [2 /*return*/, {
                            integrations: integrations.map(function (i) { return (__assign(__assign({}, i), { apiKey: undefined, apiSecret: undefined, consumerSecret: undefined, clientSecret: undefined, botToken: undefined })); }),
                            total: integrations.length
                        }];
                }
                catch (error) {
                    console.error('[INTEGRATIONS] list error:', error);
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch integrations"
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get a single integration's full configuration
     */
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration;
            return __generator(this, function (_b) {
                try {
                    integration = integrationsStore.get(input);
                    if (!integration) {
                        throw new server_1.TRPCError({
                            code: "NOT_FOUND",
                            message: "Integration not found"
                        });
                    }
                    return [2 /*return*/, integration];
                }
                catch (error) {
                    if (error instanceof server_1.TRPCError)
                        throw error;
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch integration"
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Save/update integration settings
     */
    saveIntegration: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](['connected', 'disconnected', 'error']).optional(),
        // Generic fields
        apiKey: zod_1.z.string().optional(),
        apiSecret: zod_1.z.string().optional(),
        consumerKey: zod_1.z.string().optional(),
        consumerSecret: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        clientSecret: zod_1.z.string().optional(),
        webhookUrl: zod_1.z.string().optional(),
        botToken: zod_1.z.string().optional(),
        // SMTP fields
        host: zod_1.z.string().optional(),
        port: zod_1.z.number().optional(),
        secure: zod_1.z.boolean().optional(),
        user: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        fromEmail: zod_1.z.string().email().optional(),
        fromName: zod_1.z.string().optional(),
        isDefault: zod_1.z.boolean().optional(),
        metrics: zod_1.z.record(zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration, updated, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        integration = integrationsStore.get(input.id);
                        if (!integration) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Integration not found"
                            });
                        }
                        // If setting SMTP as default, unset other default email integrations
                        if (input.isDefault && input.id === 'smtp') {
                            integrationsStore.forEach(function (intg) {
                                if (intg.category === 'Email' && intg.id !== 'smtp' && intg.isDefault) {
                                    intg.isDefault = false;
                                }
                            });
                        }
                        updated = __assign(__assign(__assign({}, integration), input), { id: integration.id, updatedBy: ctx.user.id, updatedAt: new Date().toISOString() });
                        integrationsStore.set(input.id, updated);
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "integration_updated",
                                entityType: "integration",
                                entityId: input.id,
                                description: "Updated integration: " + integration.name + " (Status: " + (input.status || 'unchanged') + ")"
                            })];
                    case 1:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                integration: __assign(__assign({}, updated), { apiSecret: undefined, consumerSecret: undefined, clientSecret: undefined, botToken: undefined, password: undefined })
                            }];
                    case 2:
                        error_1 = _b.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        console.error('[INTEGRATIONS] saveIntegration error:', error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to save integration"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Test connection to an integration
     */
    testConnection: writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration, isConnected, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        integration = integrationsStore.get(input);
                        if (!integration) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Integration not found"
                            });
                        }
                        isConnected = integration.status === 'connected';
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "integration_test",
                                entityType: "integration",
                                entityId: input,
                                description: "Tested connection to: " + integration.name + " (Result: " + (isConnected ? 'Success' : 'Failure') + ")"
                            })];
                    case 1:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: isConnected,
                                message: isConnected ? "Connected to " + integration.name : "Failed to connect to " + integration.name,
                                integration: integration.name
                            }];
                    case 2:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to test connection"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Disconnect an integration
     */
    disconnect: writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration, updated, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        integration = integrationsStore.get(input);
                        if (!integration) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Integration not found"
                            });
                        }
                        updated = __assign(__assign({}, integration), { status: 'disconnected', apiKey: '', apiSecret: '', consumerSecret: '', clientSecret: '', botToken: '', metrics: null, updatedBy: ctx.user.id, updatedAt: new Date().toISOString() });
                        integrationsStore.set(input, updated);
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "integration_disconnected",
                                entityType: "integration",
                                entityId: input,
                                description: "Disconnected integration: " + integration.name
                            })];
                    case 1:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to disconnect integration"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Test SMTP connection with settings
     */
    testSMTPConnection: writeProcedure
        .input(zod_1.z.object({
        host: zod_1.z.string().min(1, "SMTP host is required"),
        port: zod_1.z.number().int().min(1).max(65535),
        secure: zod_1.z.boolean(),
        user: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        fromEmail: zod_1.z.string().email("Invalid from email")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var transporter, verified, error_4, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 7]);
                        transporter = nodemailer_1["default"].createTransport({
                            host: input.host,
                            port: input.port,
                            secure: input.secure,
                            auth: input.user ? { user: input.user, pass: input.password } : undefined
                        });
                        return [4 /*yield*/, transporter.verify()];
                    case 1:
                        verified = _b.sent();
                        if (!verified) return [3 /*break*/, 3];
                        // Log successful test
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "smtp_test_success",
                                entityType: "integration",
                                entityId: "smtp",
                                description: "SMTP connection test successful: " + input.host + ":" + input.port
                            })];
                    case 2:
                        // Log successful test
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "SMTP connection successful! Connected to " + input.host + ":" + input.port
                            }];
                    case 3: throw new Error("SMTP verification failed");
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_4 = _b.sent();
                        errorMessage = error_4.message;
                        // Log failed test
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "smtp_test_failed",
                                entityType: "integration",
                                entityId: "smtp",
                                description: "SMTP connection test failed: " + errorMessage
                            })];
                    case 6:
                        // Log failed test
                        _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "SMTP connection failed: " + errorMessage
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMTP configuration (for sending emails)
     */
    getSMTPConfig: readProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var smtp;
            return __generator(this, function (_b) {
                try {
                    smtp = integrationsStore.get('smtp');
                    if (!smtp || smtp.status !== 'connected') {
                        throw new server_1.TRPCError({
                            code: "NOT_FOUND",
                            message: "SMTP integration not configured"
                        });
                    }
                    return [2 /*return*/, {
                            host: smtp.host,
                            port: smtp.port,
                            secure: smtp.secure,
                            user: smtp.user,
                            password: smtp.password,
                            fromEmail: smtp.fromEmail,
                            fromName: smtp.fromName
                        }];
                }
                catch (error) {
                    if (error instanceof server_1.TRPCError)
                        throw error;
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch SMTP configuration"
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Set SMTP as default email handler
     */
    setDefaultEmailIntegration: writeProcedure
        .input(zod_1.z.object({
        integrationId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var integration, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        integration = integrationsStore.get(input.integrationId);
                        if (!integration) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Integration not found"
                            });
                        }
                        if (integration.category !== 'Email') {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Only email integrations can be set as default"
                            });
                        }
                        if (integration.status !== 'connected') {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Integration must be connected before setting as default"
                            });
                        }
                        // Unset all other default email integrations
                        integrationsStore.forEach(function (intg) {
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
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "email_handler_set_default",
                                entityType: "integration",
                                entityId: input.integrationId,
                                description: "Set " + integration.name + " as default email handler"
                            })];
                    case 1:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: integration.name + " is now the default email handler"
                            }];
                    case 2:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        console.error('[INTEGRATIONS] setDefaultEmailIntegration error:', error_5);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to set default email integration"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
