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
exports.accountingPoliciesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
/**
 * Accounting Policies Configuration Router
 * Allows organizations to define and enforce accounting policies
 * Supports multi-country compliance requirements
 */
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:policies:read");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:policies:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:policies:update");
exports.accountingPoliciesRouter = trpc_1.router({
    // Get organization's accounting policies
    getOrgPolicies: readProcedure
        .input(zod_1.z.object({
        country: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_2 = _b.sent();
                        if (!db_2)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, db_2.select().from("organizationAccountingPolicies")
                                .where(drizzle_orm_1.eq("organizationAccountingPolicies.organizationId", orgId)).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || {
                                organizationId: orgId,
                                country: (input === null || input === void 0 ? void 0 : input.country) || "KE",
                                fiscalYearStart: "01-01",
                                fiscalYearEnd: "12-31",
                                accountingMethod: "accrual",
                                defaultCurrency: "KES",
                                taxInclusiveInvoicing: true,
                                autoReconciliation: false,
                                requireInvoiceApproval: true,
                                requireExpenseApproval: true,
                                defaultPaymentTerms: "net30",
                                depreciationMethod: "straight_line",
                                capitalizedAssetThreshold: 50000
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching policies:", error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Create/Update policies
    updatePolicies: updateProcedure
        .input(zod_1.z.object({
        country: zod_1.z.string(),
        fiscalYearStart: zod_1.z.string().optional(),
        fiscalYearEnd: zod_1.z.string().optional(),
        accountingMethod: zod_1.z["enum"](["accrual", "cash"]).optional(),
        defaultCurrency: zod_1.z.string().optional(),
        taxInclusiveInvoicing: zod_1.z.boolean().optional(),
        autoReconciliation: zod_1.z.boolean().optional(),
        requireInvoiceApproval: zod_1.z.boolean().optional(),
        requireExpenseApproval: zod_1.z.boolean().optional(),
        defaultPaymentTerms: zod_1.z.string().optional(),
        depreciationMethod: zod_1.z["enum"](["straight_line", "declining_balance", "units_of_production"]).optional(),
        capitalizedAssetThreshold: zod_1.z.number().optional(),
        roundingMethod: zod_1.z["enum"](["round", "truncate"]).optional(),
        retentionPeriod: zod_1.z.number().optional(),
        auditTrailRequired: zod_1.z.boolean().optional(),
        allowManualJournalEntries: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, now, existing, policyData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, , 10]);
                        orgId = ctx.user.organizationId;
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.select().from("organizationAccountingPolicies")
                                .where(drizzle_orm_1.eq("organizationAccountingPolicies.organizationId", orgId)).limit(1)];
                    case 3:
                        existing = _b.sent();
                        policyData = {
                            organizationId: orgId,
                            country: input.country,
                            fiscalYearStart: input.fiscalYearStart || "01-01",
                            fiscalYearEnd: input.fiscalYearEnd || "12-31",
                            accountingMethod: input.accountingMethod || "accrual",
                            defaultCurrency: input.defaultCurrency || "KES",
                            taxInclusiveInvoicing: input.taxInclusiveInvoicing !== undefined ? input.taxInclusiveInvoicing : true,
                            autoReconciliation: input.autoReconciliation || false,
                            requireInvoiceApproval: input.requireInvoiceApproval !== undefined ? input.requireInvoiceApproval : true,
                            requireExpenseApproval: input.requireExpenseApproval !== undefined ? input.requireExpenseApproval : true,
                            defaultPaymentTerms: input.defaultPaymentTerms || "net30",
                            depreciationMethod: input.depreciationMethod || "straight_line",
                            capitalizedAssetThreshold: input.capitalizedAssetThreshold || 50000,
                            roundingMethod: input.roundingMethod || "round",
                            retentionPeriod: input.retentionPeriod || 7,
                            auditTrailRequired: input.auditTrailRequired !== undefined ? input.auditTrailRequired : true,
                            allowManualJournalEntries: input.allowManualJournalEntries !== undefined ? input.allowManualJournalEntries : true,
                            updatedBy: ctx.user.id,
                            updatedAt: now
                        };
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update("organizationAccountingPolicies").set(policyData)
                                .where(drizzle_orm_1.eq("organizationAccountingPolicies.organizationId", orgId))];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert("organizationAccountingPolicies").values(__assign(__assign({ id: uuid_1.v4() }, policyData), { createdBy: ctx.user.id, createdAt: now }))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "accounting_policies_updated",
                            entityType: "organizationPolicy",
                            entityId: orgId,
                            description: "Accounting policies updated for " + input.country
                        })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 9:
                        error_2 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update policies: " + error_2.message
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    // Get country-specific policy templates
    getPolicyTemplate: readProcedure
        .input(zod_1.z.object({
        country: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var templates;
            return __generator(this, function (_b) {
                templates = {
                    KE: {
                        country: "Kenya",
                        fiscalYearStart: "01-01",
                        fiscalYearEnd: "12-31",
                        accountingMethod: "accrual",
                        defaultCurrency: "KES",
                        taxInclusiveInvoicing: true,
                        autoReconciliation: true,
                        requireInvoiceApproval: true,
                        requireExpenseApproval: true,
                        defaultPaymentTerms: "net30",
                        depreciationMethod: "straight_line",
                        capitalizedAssetThreshold: 50000,
                        retentionPeriod: 5,
                        auditTrailRequired: true,
                        allowManualJournalEntries: false,
                        complianceNotes: "Align with Kenya Revenue Authority requirements"
                    },
                    NG: {
                        country: "Nigeria",
                        fiscalYearStart: "01-01",
                        fiscalYearEnd: "12-31",
                        accountingMethod: "accrual",
                        defaultCurrency: "NGN",
                        taxInclusiveInvoicing: false,
                        autoReconciliation: true,
                        requireInvoiceApproval: true,
                        requireExpenseApproval: true,
                        defaultPaymentTerms: "net30",
                        depreciationMethod: "declining_balance",
                        capitalizedAssetThreshold: 100000,
                        retentionPeriod: 5,
                        auditTrailRequired: true,
                        allowManualJournalEntries: false,
                        complianceNotes: "Align with FIRS requirements"
                    },
                    ZA: {
                        country: "South Africa",
                        fiscalYearStart: "03-01",
                        fiscalYearEnd: "02-28",
                        accountingMethod: "accrual",
                        defaultCurrency: "ZAR",
                        taxInclusiveInvoicing: true,
                        autoReconciliation: true,
                        requireInvoiceApproval: true,
                        requireExpenseApproval: true,
                        defaultPaymentTerms: "net30",
                        depreciationMethod: "straight_line",
                        capitalizedAssetThreshold: 100000,
                        retentionPeriod: 5,
                        auditTrailRequired: true,
                        allowManualJournalEntries: false,
                        complianceNotes: "Align with SARS requirements"
                    },
                    UG: {
                        country: "Uganda",
                        fiscalYearStart: "07-01",
                        fiscalYearEnd: "06-30",
                        accountingMethod: "accrual",
                        defaultCurrency: "UGX",
                        taxInclusiveInvoicing: true,
                        autoReconciliation: true,
                        requireInvoiceApproval: true,
                        requireExpenseApproval: true,
                        defaultPaymentTerms: "net30",
                        depreciationMethod: "straight_line",
                        capitalizedAssetThreshold: 5000000,
                        retentionPeriod: 5,
                        auditTrailRequired: true,
                        allowManualJournalEntries: false,
                        complianceNotes: "Align with URA requirements"
                    }
                };
                return [2 /*return*/, templates[input.country] || templates.KE];
            });
        });
    }),
    // Enforce policy compliance check
    checkPolicyCompliance: readProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string(),
        entityId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_3, policies, policy, issues, inv, exp, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_3 = _b.sent();
                        if (!db_3)
                            return [2 /*return*/, { compliant: true, issues: [] }];
                        return [4 /*yield*/, db_3.select().from("organizationAccountingPolicies")
                                .where(drizzle_orm_1.eq("organizationAccountingPolicies.organizationId", ctx.user.organizationId)).limit(1)];
                    case 2:
                        policies = _b.sent();
                        policy = policies[0];
                        issues = [];
                        if (!(policy.requireInvoiceApproval && input.entityType === "invoice")) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_3.select().from("invoices").where(drizzle_orm_1.eq("invoices.id", input.entityId)).limit(1)];
                    case 3:
                        inv = _b.sent();
                        if (inv[0] && !inv[0].approvedBy) {
                            issues.push("Invoice requires approval before finalizing");
                        }
                        _b.label = 4;
                    case 4:
                        if (!(policy.requireExpenseApproval && input.entityType === "expense")) return [3 /*break*/, 6];
                        return [4 /*yield*/, db_3.select().from("expenses").where(drizzle_orm_1.eq("expenses.id", input.entityId)).limit(1)];
                    case 5:
                        exp = _b.sent();
                        if (exp[0] && exp[0].status !== "approved") {
                            issues.push("Expense requires approval before recording");
                        }
                        _b.label = 6;
                    case 6: return [2 /*return*/, {
                            compliant: issues.length === 0,
                            issues: issues,
                            policy: {
                                country: policy === null || policy === void 0 ? void 0 : policy.country,
                                accountingMethod: policy === null || policy === void 0 ? void 0 : policy.accountingMethod,
                                auditTrailRequired: policy === null || policy === void 0 ? void 0 : policy.auditTrailRequired
                            }
                        }];
                    case 7:
                        error_3 = _b.sent();
                        console.error("Compliance check error:", error_3);
                        return [2 /*return*/, { compliant: false, issues: ["Failed to check compliance"] }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
