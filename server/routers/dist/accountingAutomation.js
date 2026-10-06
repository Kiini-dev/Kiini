"use strict";
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
exports.accountingAutomationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var trpc_2 = require("../_core/trpc");
var server_1 = require("@trpc/server");
var checkModuleAccess_1 = require("../modules/checkModuleAccess");
var accountingAutomationModule = require("../modules/accountingAutomation");
var accountingViewProcedure = trpc_2.createFeatureRestrictedProcedure("accounting:view");
var accountingEditProcedure = trpc_2.createFeatureRestrictedProcedure("accounting:edit");
exports.accountingAutomationRouter = trpc_1.router({
    // ── Accounting Automation Procedures ───────────────────────────
    runAllAutomations: accountingEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, err_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.runAllAccountingAutomations({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        result = _d.sent();
                        return [2 /*return*/, { success: true, data: result, message: "All accounting automations completed" }];
                    case 4:
                        err_1 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Accounting automation failed: " + err_1.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    updateInvoiceStatuses: accountingEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.autoUpdateInvoiceStatus({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Invoice statuses updated successfully" }];
                    case 4:
                        err_2 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Invoice status update failed: " + err_2.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    createJournalEntries: accountingEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_3;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.autoCreateJournalEntries({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Journal entries created successfully" }];
                    case 4:
                        err_3 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Journal entry creation failed: " + err_3.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getOverdueInvoices: accountingViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var alerts, err_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.generateOverdueInvoiceAlerts({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        alerts = _d.sent();
                        return [2 /*return*/, { success: true, data: alerts }];
                    case 4:
                        err_4 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Overdue invoice alert generation failed: " + err_4.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    checkBankReconciliation: accountingViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var status, err_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.checkBankReconciliationStatus({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        status = _d.sent();
                        return [2 /*return*/, { success: true, data: status }];
                    case 4:
                        err_5 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Bank reconciliation check failed: " + err_5.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getExpenseReport: accountingViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var report, err_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.generateExpenseReconciliationReport({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        report = _d.sent();
                        return [2 /*return*/, { success: true, data: report }];
                    case 4:
                        err_6 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Expense report generation failed: " + err_6.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getTaxComplianceReminders: accountingViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var reminders, err_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.generateTaxComplianceReminder({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        reminders = _d.sent();
                        return [2 /*return*/, { success: true, data: reminders }];
                    case 4:
                        err_7 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Tax compliance reminder generation failed: " + err_7.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getRevenueAnalysis: accountingViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var analysis, err_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'accounting')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, accountingAutomationModule.generateRevenueAnalysisSummary({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        analysis = _d.sent();
                        return [2 /*return*/, { success: true, data: analysis }];
                    case 4:
                        err_8 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Revenue analysis generation failed: " + err_8.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
