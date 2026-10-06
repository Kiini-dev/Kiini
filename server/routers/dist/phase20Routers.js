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
exports.integrationPlatformRouter = exports.forecastingRouter = exports.multiCurrencyRouter = exports.expenseManagementRouter = exports.recurringInvoicingRouter = exports.notificationRulesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
exports.notificationRulesRouter = trpc_1.router({
    /**
     * Create notification rule
     */
    createRule: trpc_1.createFeatureRestrictedProcedure("notifications:create")
        .input(zod_1.z.object({
        eventType: zod_1.z.string(),
        channelType: zod_1.z["enum"](['email', 'in_app', 'push', 'sms']),
        frequency: zod_1.z["enum"](['instant', 'daily', 'weekly', 'never']),
        doNotDisturbStart: zod_1.z.string().optional(),
        doNotDisturbEnd: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ruleId, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        ruleId = uuid_1.v4();
                        return [4 /*yield*/, db.insertNotificationRule({
                                id: ruleId,
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "",
                                eventType: input.eventType,
                                channelType: input.channelType,
                                frequency: input.frequency,
                                doNotDisturbStart: input.doNotDisturbStart,
                                doNotDisturbEnd: input.doNotDisturbEnd,
                                enabled: 1
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, ruleId: ruleId }];
                    case 4:
                        error_1 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_1) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get notification rules
     */
    getRules: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rules, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { rules: [] }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getNotificationRules(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "")];
                    case 3:
                        rules = _c.sent();
                        return [2 /*return*/, { rules: rules }];
                    case 4:
                        error_2 = _c.sent();
                        return [2 /*return*/, { rules: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update rule
     */
    updateRule: trpc_1.createFeatureRestrictedProcedure("notifications:edit")
        .input(zod_1.z.object({
        ruleId: zod_1.z.string(),
        enabled: zod_1.z.boolean().optional(),
        frequency: zod_1.z["enum"](['instant', 'daily', 'weekly', 'never']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.updateNotificationRule(input.ruleId, {
                                enabled: input.enabled !== undefined ? input.enabled ? 1 : 0 : undefined,
                                frequency: input.frequency
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_3 = _b.sent();
                        return [2 /*return*/, { success: false, error: String(error_3) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
exports.recurringInvoicingRouter = trpc_1.router({
    /**
     * Create subscription
     */
    createSubscription: trpc_1.createFeatureRestrictedProcedure("billing:create")
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        subscriptionName: zod_1.z.string(),
        tier: zod_1.z["enum"](['basic', 'professional', 'enterprise', 'custom']),
        monthlyAmount: zod_1.z.number(),
        billingCycle: zod_1.z["enum"](['monthly', 'quarterly', 'semi_annual', 'annual']),
        startDate: zod_1.z.string(),
        features: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, subId, nextBilling, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        subId = uuid_1.v4();
                        nextBilling = new Date(input.startDate);
                        if (input.billingCycle === 'monthly') {
                            nextBilling.setMonth(nextBilling.getMonth() + 1);
                        }
                        else if (input.billingCycle === 'quarterly') {
                            nextBilling.setMonth(nextBilling.getMonth() + 3);
                        }
                        else if (input.billingCycle === 'semi_annual') {
                            nextBilling.setMonth(nextBilling.getMonth() + 6);
                        }
                        else {
                            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
                        }
                        return [4 /*yield*/, db.insertSubscription({
                                id: subId,
                                clientId: input.clientId,
                                subscriptionName: input.subscriptionName,
                                tier: input.tier,
                                monthlyAmount: input.monthlyAmount,
                                billingCycle: input.billingCycle,
                                startDate: input.startDate,
                                nextBillingDate: nextBilling.toISOString(),
                                status: 'active',
                                autoRenew: 1,
                                features: input.features
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, subscriptionId: subId }];
                    case 4:
                        error_4 = _b.sent();
                        return [2 /*return*/, { success: false, error: String(error_4) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get subscriptions
     */
    getSubscriptions: trpc_1.createFeatureRestrictedProcedure("billing:read")
        .input(zod_1.z.object({ clientId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, subs, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { subscriptions: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getSubscriptions(input.clientId)];
                    case 3:
                        subs = _b.sent();
                        return [2 /*return*/, { subscriptions: subs }];
                    case 4:
                        error_5 = _b.sent();
                        return [2 /*return*/, { subscriptions: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Record usage metric
     */
    recordUsage: trpc_1.createFeatureRestrictedProcedure("billing:create")
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        metricName: zod_1.z.string(),
        metricValue: zod_1.z.number(),
        billingAmount: zod_1.z.number()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, metricId, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        metricId = uuid_1.v4();
                        return [4 /*yield*/, db.insertUsageMetric({
                                id: metricId,
                                subscriptionId: input.subscriptionId,
                                metricName: input.metricName,
                                metricValue: input.metricValue,
                                billingAmount: input.billingAmount,
                                usagePeriod: new Date().toISOString().split('T')[0]
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, metricId: metricId }];
                    case 4:
                        error_6 = _b.sent();
                        return [2 /*return*/, { success: false, error: String(error_6) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
exports.expenseManagementRouter = trpc_1.router({
    /**
     * Submit expense report
     */
    submitExpenseReport: trpc_1.createFeatureRestrictedProcedure("expenses:create")
        .input(zod_1.z.object({ expenses: zod_1.z.array(zod_1.z.object({ description: zod_1.z.string(), amount: zod_1.z.number(), date: zod_1.z.string() })) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reportId, totalAmount, _i, _b, expense, expId, error_7;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 8, , 9]);
                        reportId = uuid_1.v4();
                        totalAmount = input.expenses.reduce(function (sum, exp) { return sum + exp.amount; }, 0);
                        return [4 /*yield*/, db.insertExpenseReport({
                                id: reportId,
                                submittedBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "",
                                reportDate: new Date().toISOString(),
                                totalAmount: totalAmount,
                                status: 'submitted'
                            })];
                    case 3:
                        _d.sent();
                        _i = 0, _b = input.expenses;
                        _d.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        expense = _b[_i];
                        expId = uuid_1.v4();
                        return [4 /*yield*/, db.insertExpense({
                                id: expId,
                                expenseReportId: reportId,
                                categoryId: "",
                                amount: expense.amount,
                                expenseDate: expense.date,
                                description: expense.description
                            })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { success: true, reportId: reportId }];
                    case 8:
                        error_7 = _d.sent();
                        return [2 /*return*/, { success: false, error: String(error_7) }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get expense reports
     */
    getReports: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reports, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { reports: [] }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getExpenseReports(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "")];
                    case 3:
                        reports = _c.sent();
                        return [2 /*return*/, { reports: reports }];
                    case 4:
                        error_8 = _c.sent();
                        return [2 /*return*/, { reports: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Approve expense report
     */
    approveReport: trpc_1.createFeatureRestrictedProcedure("expenses:edit")
        .input(zod_1.z.object({ reportId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.updateExpenseReport(input.reportId, {
                                status: 'approved',
                                approvedBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                                approvalDate: new Date().toISOString()
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_9 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_9) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Process reimbursement
     */
    processReimbursement: trpc_1.createFeatureRestrictedProcedure("expenses:create")
        .input(zod_1.z.object({
        reportId: zod_1.z.string(),
        paymentMethod: zod_1.z.string(),
        paymentDate: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reimbId, report, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        reimbId = uuid_1.v4();
                        return [4 /*yield*/, db.getExpenseReport(input.reportId)];
                    case 3:
                        report = _b.sent();
                        return [4 /*yield*/, db.insertReimbursement({
                                id: reimbId,
                                expenseReportId: input.reportId,
                                employeeId: (report === null || report === void 0 ? void 0 : report.submittedBy) || "",
                                totalAmount: (report === null || report === void 0 ? void 0 : report.totalAmount) || 0,
                                paymentMethod: input.paymentMethod,
                                paymentDate: input.paymentDate,
                                status: 'processed'
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true, reimbursementId: reimbId }];
                    case 5:
                        error_10 = _b.sent();
                        return [2 /*return*/, { success: false, error: String(error_10) }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
exports.multiCurrencyRouter = trpc_1.router({
    /**
     * Get exchange rate
     */
    getExchangeRate: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.object({ fromCurrency: zod_1.z.string(), toCurrency: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rate, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { rate: 1 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getExchangeRate(input.fromCurrency, input.toCurrency)];
                    case 3:
                        rate = _b.sent();
                        return [2 /*return*/, { rate: rate || 1 }];
                    case 4:
                        error_11 = _b.sent();
                        return [2 /*return*/, { rate: 1 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get tax rate for country
     */
    getTaxRate: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.object({ country: zod_1.z.string(), taxType: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rate, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { rate: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getTaxRate(input.country, input.taxType)];
                    case 3:
                        rate = _b.sent();
                        return [2 /*return*/, { rate: rate || 0 }];
                    case 4:
                        error_12 = _b.sent();
                        return [2 /*return*/, { rate: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
exports.forecastingRouter = trpc_1.router({
    /**
     * Get revenue forecast
     */
    getRevenueForecast: trpc_1.createFeatureRestrictedProcedure("analytics:read")
        .input(zod_1.z.object({ months: zod_1.z.number()["default"](12) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, forecast, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { forecast: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getRevenueForecast(input.months)];
                    case 3:
                        forecast = _b.sent();
                        return [2 /*return*/, { forecast: forecast }];
                    case 4:
                        error_13 = _b.sent();
                        return [2 /*return*/, { forecast: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get churn prediction
     */
    getChurnPrediction: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, predictions, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { predictions: [] }];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.getChurnPredictions()];
                case 3:
                    predictions = _a.sent();
                    return [2 /*return*/, { predictions: predictions }];
                case 4:
                    error_14 = _a.sent();
                    return [2 /*return*/, { predictions: [] }];
                case 5: return [2 /*return*/];
            }
        });
    }); })
});
exports.integrationPlatformRouter = trpc_1.router({
    /**
     * Create API key
     */
    createApiKey: trpc_1.createFeatureRestrictedProcedure("settings:edit")
        .input(zod_1.z.object({ keyName: zod_1.z.string(), rateLimit: zod_1.z.number()["default"](1000) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, keyId, keyValue, error_15;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        keyId = uuid_1.v4();
                        keyValue = "sk_" + uuid_1.v4();
                        return [4 /*yield*/, db.insertApiKey({
                                id: keyId,
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "",
                                keyName: input.keyName,
                                keyValue: keyValue,
                                rateLimit: input.rateLimit,
                                isActive: 1
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, keyId: keyId, keyValue: keyValue }];
                    case 4:
                        error_15 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_15) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create webhook
     */
    createWebhook: trpc_1.createFeatureRestrictedProcedure("settings:edit")
        .input(zod_1.z.object({
        webhookUrl: zod_1.z.string(),
        eventType: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, hookId, secret, error_16;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        hookId = uuid_1.v4();
                        secret = uuid_1.v4();
                        return [4 /*yield*/, db.insertWebhook({
                                id: hookId,
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "",
                                webhookUrl: input.webhookUrl,
                                eventType: input.eventType,
                                secret: secret,
                                isActive: 1
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, hookId: hookId, secret: secret }];
                    case 4:
                        error_16 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_16) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get webhook logs
     */
    getWebhookLogs: trpc_1.createFeatureRestrictedProcedure("settings:read")
        .input(zod_1.z.object({ webhookId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, logs, error_17;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { logs: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getIntegrationLogs(input.webhookId)];
                    case 3:
                        logs = _b.sent();
                        return [2 /*return*/, { logs: logs }];
                    case 4:
                        error_17 = _b.sent();
                        return [2 /*return*/, { logs: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
