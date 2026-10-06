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
exports.clientScoringRouter = exports.calculateClientHealthScore = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var date_fns_1 = require("date-fns");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("analytics:view");
/**
 * Calculate client health score (0-100)
 * Based on: payment timeliness, invoice frequency, revenue, overdue amount, project success
 */
function calculateClientHealthScore(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, client, invoices, paidOnTimeCount, totalInvoices, _i, invoices_1, invoice, daysLate, paymentTimelinessScore, invoiceFrequency, invoiceFrequencyScore, totalRevenue, revenueScore, overdueAmount, overdueScore, projects, completedProjects, projectSuccessRate, totalScore, churnRisk, riskLevel, lifetimeValue, scoreId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, db.getClient(clientId)];
                case 3:
                    client = _a.sent();
                    if (!client)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.getInvoicesByClient(clientId)];
                case 4:
                    invoices = _a.sent();
                    paidOnTimeCount = 0;
                    totalInvoices = 0;
                    for (_i = 0, invoices_1 = invoices; _i < invoices_1.length; _i++) {
                        invoice = invoices_1[_i];
                        daysLate = date_fns_1.differenceInDays(new Date(invoice.paidAt || new Date()), new Date(invoice.dueDate));
                        if (daysLate <= 0) {
                            paidOnTimeCount++;
                        }
                        totalInvoices++;
                    }
                    paymentTimelinessScore = totalInvoices > 0 ? Math.round((paidOnTimeCount / totalInvoices) * 25) : 12;
                    invoiceFrequency = totalInvoices;
                    invoiceFrequencyScore = 0;
                    if (invoiceFrequency >= 12)
                        invoiceFrequencyScore = 20;
                    else if (invoiceFrequency >= 8)
                        invoiceFrequencyScore = 15;
                    else if (invoiceFrequency >= 4)
                        invoiceFrequencyScore = 10;
                    else if (invoiceFrequency >= 1)
                        invoiceFrequencyScore = 5;
                    totalRevenue = invoices.reduce(function (sum, inv) { return sum + inv.total; }, 0);
                    revenueScore = 0;
                    if (totalRevenue >= 5000000)
                        revenueScore = 20;
                    else if (totalRevenue >= 1000000)
                        revenueScore = 15;
                    else if (totalRevenue >= 500000)
                        revenueScore = 10;
                    else if (totalRevenue > 0)
                        revenueScore = 5;
                    overdueAmount = invoices
                        .filter(function (inv) { return new Date(inv.dueDate) < new Date(); })
                        .reduce(function (sum, inv) { return sum + (inv.total - inv.paidAmount); }, 0);
                    overdueScore = 20;
                    if (overdueAmount > 1000000)
                        overdueScore = 0;
                    else if (overdueAmount > 500000)
                        overdueScore = 5;
                    else if (overdueAmount > 100000)
                        overdueScore = 10;
                    else if (overdueAmount > 0)
                        overdueScore = 15;
                    return [4 /*yield*/, db.getClientProjects(clientId)];
                case 5:
                    projects = _a.sent();
                    completedProjects = projects.filter(function (p) { return p.status === 'completed'; }).length;
                    projectSuccessRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 15) : 7;
                    totalScore = paymentTimelinessScore + invoiceFrequencyScore + revenueScore + overdueScore + projectSuccessRate;
                    churnRisk = 0;
                    if (totalScore < 40)
                        churnRisk = 80;
                    else if (totalScore < 60)
                        churnRisk = 50;
                    else if (totalScore < 80)
                        churnRisk = 20;
                    else
                        churnRisk = 5;
                    riskLevel = 'green';
                    if (totalScore >= 80)
                        riskLevel = 'green';
                    else if (totalScore >= 60)
                        riskLevel = 'yellow';
                    else
                        riskLevel = 'red';
                    lifetimeValue = totalRevenue;
                    scoreId = uuid_1.v4();
                    return [4 /*yield*/, db.insertClientHealthScore({
                            id: scoreId,
                            clientId: clientId,
                            healthScore: Math.min(100, totalScore),
                            riskLevel: riskLevel,
                            paymentTimeliness: paymentTimelinessScore,
                            invoiceFrequency: invoiceFrequencyScore,
                            totalRevenue: totalRevenue,
                            overdueAmount: overdueAmount,
                            projectSuccessRate: projectSuccessRate,
                            churnRisk: churnRisk,
                            lifetimeValue: lifetimeValue
                        })];
                case 6:
                    _a.sent();
                    return [2 /*return*/, {
                            id: scoreId,
                            clientId: clientId,
                            healthScore: Math.min(100, totalScore),
                            riskLevel: riskLevel,
                            paymentTimeliness: paymentTimelinessScore,
                            invoiceFrequency: invoiceFrequencyScore,
                            totalRevenue: totalRevenue,
                            overdueAmount: overdueAmount,
                            projectSuccessRate: projectSuccessRate,
                            churnRisk: churnRisk,
                            lifetimeValue: lifetimeValue
                        }];
                case 7:
                    error_1 = _a.sent();
                    console.error("[CLIENT SCORING] Error calculating health score:", error_1);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.calculateClientHealthScore = calculateClientHealthScore;
exports.clientScoringRouter = trpc_1.router({
    /**
     * Get health score for a specific client
     */
    getClientScore: readProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, score, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.getClientHealthScore(input.clientId)];
                    case 3:
                        score = _b.sent();
                        if (!(!score || date_fns_1.differenceInDays(new Date(), new Date(score.calculatedAt)) > 7)) return [3 /*break*/, 5];
                        return [4 /*yield*/, calculateClientHealthScore(input.clientId)];
                    case 4:
                        // Recalculate if older than 7 days
                        score = _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, score];
                    case 6:
                        error_2 = _b.sent();
                        console.error("[CLIENT SCORING] Error getting client score:", error_2);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get all client scores (risk dashboard)
     */
    getAllClientScores: readProcedure
        .input(zod_1.z.object({
        riskLevel: zod_1.z["enum"](['green', 'yellow', 'red']).optional(),
        sortBy: zod_1.z["enum"](['healthScore', 'totalRevenue', 'churnRisk'])["default"]('healthScore'),
        limit: zod_1.z.number()["default"](100)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, scores, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { scores: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getClientHealthScores({
                                riskLevel: input.riskLevel,
                                sortBy: input.sortBy,
                                limit: input.limit
                            })];
                    case 3:
                        scores = _b.sent();
                        return [2 /*return*/, { scores: scores }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("[CLIENT SCORING] Error getting all scores:", error_3);
                        return [2 /*return*/, { scores: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get at-risk clients (red flag)
     */
    getAtRiskClients: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, scores, clients, _i, scores_1, score, client, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { clients: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getClientHealthScores({
                                riskLevel: 'red',
                                limit: input.limit
                            })];
                    case 3:
                        scores = _b.sent();
                        clients = [];
                        _i = 0, scores_1 = scores;
                        _b.label = 4;
                    case 4:
                        if (!(_i < scores_1.length)) return [3 /*break*/, 7];
                        score = scores_1[_i];
                        return [4 /*yield*/, db.getClient(score.clientId)];
                    case 5:
                        client = _b.sent();
                        if (client) {
                            clients.push(__assign(__assign({}, client), { healthScore: score }));
                        }
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { clients: clients }];
                    case 8:
                        error_4 = _b.sent();
                        console.error("[CLIENT SCORING] Error getting at-risk clients:", error_4);
                        return [2 /*return*/, { clients: [] }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get high-value clients
     */
    getHighValueClients: readProcedure
        .input(zod_1.z.object({ minRevenue: zod_1.z.number()["default"](500000), limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, scores, clients, _i, scores_2, score, client, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { clients: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getClientHealthScoresByRevenue(input.minRevenue, input.limit)];
                    case 3:
                        scores = _b.sent();
                        clients = [];
                        _i = 0, scores_2 = scores;
                        _b.label = 4;
                    case 4:
                        if (!(_i < scores_2.length)) return [3 /*break*/, 7];
                        score = scores_2[_i];
                        return [4 /*yield*/, db.getClient(score.clientId)];
                    case 5:
                        client = _b.sent();
                        if (client) {
                            clients.push(__assign(__assign({}, client), { healthScore: score }));
                        }
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { clients: clients }];
                    case 8:
                        error_5 = _b.sent();
                        console.error("[CLIENT SCORING] Error getting high-value clients:", error_5);
                        return [2 /*return*/, { clients: [] }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get churn risk analysis
     */
    getChurnRiskAnalysis: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, scores, veryHigh, high, medium, low, atRisk, _i, scores_3, score, client, _a, _b, _c, error_6;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        return [2 /*return*/, { veryHigh: 0, high: 0, medium: 0, low: 0, atRisk: [] }];
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, db.getClientHealthScores({ limit: 10000 })];
                case 3:
                    scores = _d.sent();
                    veryHigh = 0;
                    high = 0;
                    medium = 0;
                    low = 0;
                    atRisk = [];
                    _i = 0, scores_3 = scores;
                    _d.label = 4;
                case 4:
                    if (!(_i < scores_3.length)) return [3 /*break*/, 10];
                    score = scores_3[_i];
                    if (!(score.churnRisk >= 75)) return [3 /*break*/, 8];
                    veryHigh++;
                    if (!(atRisk.length < 20)) return [3 /*break*/, 7];
                    return [4 /*yield*/, db.getClient(score.clientId)];
                case 5:
                    client = _d.sent();
                    if (!client) return [3 /*break*/, 7];
                    _b = (_a = atRisk).push;
                    _c = {
                        clientName: client.companyName,
                        churnRisk: score.churnRisk,
                        healthScore: score.healthScore
                    };
                    return [4 /*yield*/, db.getLatestInvoice(score.clientId)];
                case 6:
                    _b.apply(_a, [(_c.lastInvoice = _d.sent(),
                            _c)]);
                    _d.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    if (score.churnRisk >= 50) {
                        high++;
                    }
                    else if (score.churnRisk >= 25) {
                        medium++;
                    }
                    else {
                        low++;
                    }
                    _d.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10: return [2 /*return*/, { veryHigh: veryHigh, high: high, medium: medium, low: low, atRisk: atRisk }];
                case 11:
                    error_6 = _d.sent();
                    console.error("[CLIENT SCORING] Error getting churn risk analysis:", error_6);
                    return [2 /*return*/, { veryHigh: 0, high: 0, medium: 0, low: 0, atRisk: [] }];
                case 12: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get growth trends for a client
     */
    getClientGrowthTrends: readProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string(), months: zod_1.z.number()["default"](12) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, trends, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { trends: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getClientRevenueTrends(input.clientId, input.months)];
                    case 3:
                        trends = _b.sent();
                        return [2 /*return*/, { trends: trends }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("[CLIENT SCORING] Error getting growth trends:", error_7);
                        return [2 /*return*/, { trends: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Recalculate all client scores
     */
    refreshAllScores: readProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, clients, updated, _i, clients_1, client, error_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== 'super_admin') {
                            throw new Error('Unauthorized - admin only');
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db) {
                            return [2 /*return*/, { success: false, updated: 0 }];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getClients({ limit: 10000 })];
                    case 3:
                        clients = _d.sent();
                        updated = 0;
                        _i = 0, clients_1 = clients;
                        _d.label = 4;
                    case 4:
                        if (!(_i < clients_1.length)) return [3 /*break*/, 7];
                        client = clients_1[_i];
                        return [4 /*yield*/, calculateClientHealthScore(client.id)];
                    case 5:
                        _d.sent();
                        updated++;
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { success: true, updated: updated }];
                    case 8:
                        error_8 = _d.sent();
                        console.error("[CLIENT SCORING] Error refreshing scores:", error_8);
                        return [2 /*return*/, { success: false, error: String(error_8) }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    })
});
