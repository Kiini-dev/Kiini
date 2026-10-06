"use strict";
/**
 * GDPR API Router
 * Endpoints for GDPR compliance operations
 */
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
exports.gdprRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var dataExport_1 = require("../lib/gdpr/dataExport");
var dataDeletion_1 = require("../lib/gdpr/dataDeletion");
var consentManagement_1 = require("../lib/gdpr/consentManagement");
var auditLog_1 = require("../lib/gdpr/auditLog");
exports.gdprRouter = trpc_1.router({
    /**
     * Request user data export
     * POST /trpc/gdpr.requestDataExport
     */
    requestDataExport: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, exportData, _b, content, filename, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        userId = input.userId || ctx.userId;
                        // Verify user owns the data or is admin
                        if (userId !== ctx.userId && ctx.userRole !== "admin") {
                            throw new Error("Unauthorized");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, dataExport_1.getUserDataExport(userId)];
                    case 2:
                        exportData = _c.sent();
                        _b = dataExport_1.generateExportFile(exportData), content = _b.content, filename = _b.filename;
                        // Log the export request
                        return [4 /*yield*/, auditLog_1.logDataProcessing(userId, ctx.organizationId, "export", {
                                purpose: "User requested data export per GDPR Article 15",
                                processor: ctx.userId,
                                dataCategories: ["personal", "organizational", "transactional"]
                            })];
                    case 3:
                        // Log the export request
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                filename: filename,
                                url: "/api/gdpr/export/" + userId,
                                expiresIn: 30 * 24 * 60 * 60 * 1000
                            }];
                    case 4:
                        error_1 = _c.sent();
                        throw new Error("Failed to export data: " + error_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Request account deletion
     * POST /trpc/gdpr.requestDeletion
     */
    requestDeletion: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        reason: zod_1.z.string().optional(),
        immediate: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, scheduled, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        if (!input.immediate) return [3 /*break*/, 2];
                        // Immediate deletion (admin only)
                        if (ctx.userRole !== "admin") {
                            throw new Error("Only admins can request immediate deletion");
                        }
                        return [4 /*yield*/, dataDeletion_1.deleteUserData(ctx.userId, input.reason)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                deleted: true,
                                details: result
                            }];
                    case 2: return [4 /*yield*/, dataDeletion_1.scheduleDeletionByUser(ctx.userId)];
                    case 3:
                        scheduled = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                deleted: false,
                                deletionScheduledFor: scheduled.deletionScheduledFor,
                                cancellationCode: scheduled.cancellationCode,
                                message: "Your account will be deleted in 30 days. You can cancel anytime."
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        throw new Error("Failed to delete data: " + error_2);
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Record user consent
     * POST /trpc/gdpr.recordConsent
     */
    recordConsent: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        consentType: zod_1.z["enum"]([
            "marketing",
            "analytics",
            "essential",
            "third_party",
            "data_processing",
        ]),
        granted: zod_1.z.boolean(),
        ipAddress: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, consentManagement_1.recordConsent(ctx.userId, input.consentType, input.granted, {
                                organizationId: ctx.organizationId,
                                ipAddress: input.ipAddress,
                                expirationDays: 365
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_3 = _b.sent();
                        throw new Error("Failed to record consent: " + error_3);
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get user consent status
     * GET /trpc/gdpr.getUserConsent
     */
    getUserConsent: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var consents, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, consentManagement_1.getUserConsent(ctx.userId)];
                    case 1:
                        consents = _b.sent();
                        return [2 /*return*/, {
                                consents: consents || []
                            }];
                    case 2:
                        error_4 = _b.sent();
                        throw new Error("Failed to retrieve consent: " + error_4);
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Revoke consent
     * POST /trpc/gdpr.revokeConsent
     */
    revokeConsent: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        consentType: zod_1.z["enum"]([
            "marketing",
            "analytics",
            "essential",
            "third_party",
            "data_processing",
        ])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, consentManagement_1.revokeConsent(ctx.userId, input.consentType)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Failed to revoke consent: " + error_5);
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get compliance audit trail (admin only)
     * GET /trpc/gdpr.getAuditTrail
     */
    getAuditTrail: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        activityType: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var auditTrail, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Verify admin access
                        if (ctx.userRole !== "admin") {
                            throw new Error("Only admins can access audit trails");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, auditLog_1.getComplianceAuditTrail(input.organizationId, {
                                activityType: input.activityType,
                                startDate: input.startDate ? new Date(input.startDate) : undefined,
                                endDate: input.endDate ? new Date(input.endDate) : undefined
                            })];
                    case 2:
                        auditTrail = _b.sent();
                        return [2 /*return*/, {
                                auditTrail: auditTrail,
                                summary: auditLog_1.generateComplianceReport(input.organizationId, auditTrail)
                            }];
                    case 3:
                        error_6 = _b.sent();
                        throw new Error("Failed to retrieve audit trail: " + error_6);
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
