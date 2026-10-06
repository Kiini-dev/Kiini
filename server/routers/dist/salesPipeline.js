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
exports.salesPipelineRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("sales:opportunities");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("sales:opportunities:create");
var PIPELINE_STAGES = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
];
var stageLabelMap = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal Sent",
    negotiation: "Negotiating",
    closed_won: "Won",
    closed_lost: "Lost"
};
var moveOpportunitySchema = zod_1.z.object({
    id: zod_1.z.string(),
    newStage: zod_1.z["enum"](PIPELINE_STAGES),
    winReason: zod_1.z.string().optional(),
    lossReason: zod_1.z.string().optional()
});
var createOpportunitySchema = zod_1.z.object({
    clientId: zod_1.z.string(),
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    value: zod_1.z.number().int().min(0),
    probability: zod_1.z.number().int().min(0).max(100)["default"](0),
    expectedCloseDate: zod_1.z.string().datetime().optional(),
    assignedTo: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.salesPipelineRouter = trpc_1.router({
    // Get opportunities grouped by stage (for Kanban)
    getPipelineBoard: readProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, allOpportunities, board_1, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { stages: [] }];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        allOpportunities = void 0;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db
                                .select({ opp: schema_1.opportunities })
                                .from(schema_1.opportunities)
                                .innerJoin(schema_1.clients, drizzle_orm_1.eq(schema_1.opportunities.clientId, schema_1.clients.id))
                                .where(drizzle_orm_1.eq(schema_1.clients.organizationId, orgId))
                                .orderBy(drizzle_orm_1.desc(schema_1.opportunities.createdAt))
                                .then(function (rows) { return rows.map(function (r) { return r.opp; }); })];
                    case 2:
                        allOpportunities = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.opportunities)
                            .orderBy(drizzle_orm_1.desc(schema_1.opportunities.createdAt))];
                    case 4:
                        allOpportunities = _c.sent();
                        _c.label = 5;
                    case 5:
                        board_1 = {};
                        PIPELINE_STAGES.forEach(function (stage) {
                            board_1[stage] = [];
                        });
                        allOpportunities.forEach(function (opp) {
                            if (board_1[opp.stage]) {
                                board_1[opp.stage].push(opp);
                            }
                        });
                        return [2 /*return*/, {
                                stages: PIPELINE_STAGES.map(function (stage) { return ({
                                    id: stage,
                                    title: stageLabelMap[stage],
                                    opportunities: board_1[stage] || [],
                                    count: (board_1[stage] || []).length
                                }); })
                            }];
                    case 6:
                        error_1 = _c.sent();
                        console.error("[SALES_PIPELINE] getPipelineBoard error:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch pipeline board"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Move opportunity to a new stage
    moveOpportunity: writeProcedure
        .input(moveOpportunitySchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, opp, currentOpp, now, updateData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.opportunities)
                                .where(drizzle_orm_1.eq(schema_1.opportunities.id, input.id))
                                .limit(1)];
                    case 2:
                        opp = _b.sent();
                        if (!opp.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Opportunity not found"
                            });
                        }
                        currentOpp = opp[0];
                        now = new Date().toISOString();
                        updateData = {
                            stage: input.newStage,
                            stageMovedAt: now,
                            updatedAt: now
                        };
                        // If moving to closed_won, set actualCloseDate and add win reason
                        if (input.newStage === "closed_won") {
                            updateData.actualCloseDate = now;
                            if (input.winReason) {
                                updateData.winReason = input.winReason;
                            }
                        }
                        // If moving to closed_lost, add loss reason
                        if (input.newStage === "closed_lost") {
                            updateData.actualCloseDate = now;
                            if (input.lossReason) {
                                updateData.lossReason = input.lossReason;
                            }
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.opportunities)
                                .set(updateData)
                                .where(drizzle_orm_1.eq(schema_1.opportunities.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, stage: input.newStage }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[SALES_PIPELINE] moveOpportunity error:", error_2);
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to move opportunity"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get sales forecast (weighted by probability)
    getSalesForecast: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, activeOpportunities, forecast_1, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { totalPipeline: 0, weightedForecast: 0, byStage: {}, opportunities: [] }];
                        filters = [];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.opportunities)
                                .orderBy(drizzle_orm_1.desc(schema_1.opportunities.createdAt))];
                    case 2:
                        activeOpportunities = _b.sent();
                        forecast_1 = {
                            totalPipeline: 0,
                            weightedForecast: 0,
                            byStage: {
                                lead: { count: 0, value: 0, forecast: 0 },
                                qualified: { count: 0, value: 0, forecast: 0 },
                                proposal: { count: 0, value: 0, forecast: 0 },
                                negotiation: { count: 0, value: 0, forecast: 0 }
                            },
                            opportunities: []
                        };
                        activeOpportunities.forEach(function (opp) {
                            // Skip won/lost deals
                            if (opp.stage === "closed_won" || opp.stage === "closed_lost") {
                                return;
                            }
                            // Apply date filter if provided
                            if (input.startDate && input.endDate && opp.expectedCloseDate) {
                                if (opp.expectedCloseDate < input.startDate || opp.expectedCloseDate > input.endDate) {
                                    return;
                                }
                            }
                            forecast_1.totalPipeline += opp.value;
                            var weightedValue = Math.round((opp.value * (opp.probability || 0)) / 100);
                            forecast_1.weightedForecast += weightedValue;
                            var stageForecast = forecast_1.byStage[opp.stage];
                            if (stageForecast) {
                                stageForecast.count += 1;
                                stageForecast.value += opp.value;
                                stageForecast.forecast += weightedValue;
                            }
                            forecast_1.opportunities.push(__assign(__assign({}, opp), { forecast: weightedValue, stageName: stageLabelMap[opp.stage] }));
                        });
                        return [2 /*return*/, forecast_1];
                    case 3:
                        error_3 = _b.sent();
                        console.error("[SALES_PIPELINE] getSalesForecast error:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate sales forecast"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get win/loss statistics
    getWinLossStats: readProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number().int().min(1).max(12)["default"](3)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, monthsAgo, closedDeals, stats_1, totalDays_1, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { total: 0, won: 0, lost: 0, winRate: 0, totalValue: 0, totalWon: 0, totalLost: 0, avgDealSize: 0, avgWonDealSize: 0, closureTimeAsAvg: 0, byReason: { wins: {}, losses: {} } }];
                        monthsAgo = new Date();
                        monthsAgo.setMonth(monthsAgo.getMonth() - input.months);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.opportunities)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.opportunities.actualCloseDate, monthsAgo.toISOString()), (drizzle_orm_1.eq(schema_1.opportunities.stage, "closed_won") ||
                                drizzle_orm_1.eq(schema_1.opportunities.stage, "closed_lost"))))];
                    case 2:
                        closedDeals = _b.sent();
                        stats_1 = {
                            total: closedDeals.length,
                            won: 0,
                            lost: 0,
                            winRate: 0,
                            totalValue: 0,
                            totalWon: 0,
                            totalLost: 0,
                            avgDealSize: 0,
                            avgWonDealSize: 0,
                            closureTimeAsAvg: 0,
                            byReason: {
                                wins: {},
                                losses: {}
                            }
                        };
                        totalDays_1 = 0;
                        closedDeals.forEach(function (deal) {
                            stats_1.totalValue += deal.value;
                            if (deal.stage === "closed_won") {
                                stats_1.won += 1;
                                stats_1.totalWon += deal.value;
                                // Track win reasons
                                if (deal.winReason) {
                                    stats_1.byReason.wins[deal.winReason] =
                                        (stats_1.byReason.wins[deal.winReason] || 0) + 1;
                                }
                            }
                            else if (deal.stage === "closed_lost") {
                                stats_1.lost += 1;
                                stats_1.totalLost += deal.value;
                                // Track loss reasons
                                if (deal.lossReason) {
                                    stats_1.byReason.losses[deal.lossReason] =
                                        (stats_1.byReason.losses[deal.lossReason] || 0) + 1;
                                }
                            }
                            // Calculate average closure time
                            if (deal.createdAt && deal.actualCloseDate) {
                                var createdDate = new Date(deal.createdAt);
                                var closedDate = new Date(deal.actualCloseDate);
                                totalDays_1 += Math.floor((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                            }
                        });
                        if (stats_1.total > 0) {
                            stats_1.winRate = Math.round((stats_1.won / stats_1.total) * 100);
                            stats_1.avgDealSize = Math.round(stats_1.totalValue / stats_1.total);
                            stats_1.closureTimeAsAvg = Math.round(totalDays_1 / stats_1.total);
                        }
                        if (stats_1.won > 0) {
                            stats_1.avgWonDealSize = Math.round(stats_1.totalWon / stats_1.won);
                        }
                        return [2 /*return*/, stats_1];
                    case 3:
                        error_4 = _b.sent();
                        console.error("[SALES_PIPELINE] getWinLossStats error:", error_4);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to get win/loss statistics"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Create new opportunity
    create: writeProcedure
        .input(createOpportunitySchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, client, id, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, input.clientId))
                                .limit(1)];
                    case 2:
                        client = _b.sent();
                        if (!client.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Client not found"
                            });
                        }
                        id = nanoid_1.nanoid();
                        return [4 /*yield*/, db.insert(schema_1.opportunities).values({
                                id: id,
                                clientId: input.clientId,
                                title: input.title,
                                description: input.description,
                                value: input.value,
                                probability: input.probability,
                                expectedCloseDate: input.expectedCloseDate,
                                assignedTo: input.assignedTo,
                                source: input.source,
                                notes: input.notes,
                                stage: "lead",
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id, success: true }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("[SALES_PIPELINE] Create error:", error_5);
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create opportunity"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Update probability
    updateProbability: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        probability: zod_1.z.number().int().min(0).max(100)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, opp, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.opportunities)
                                .where(drizzle_orm_1.eq(schema_1.opportunities.id, input.id))
                                .limit(1)];
                    case 2:
                        opp = _b.sent();
                        if (!opp.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Opportunity not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.opportunities)
                                .set({
                                probability: input.probability,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.opportunities.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("[SALES_PIPELINE] updateProbability error:", error_6);
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update probability"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get opportunity details
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, opp, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.opportunities)
                                .where(drizzle_orm_1.eq(schema_1.opportunities.id, input))
                                .limit(1)];
                    case 2:
                        opp = _b.sent();
                        if (!opp.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Opportunity not found"
                            });
                        }
                        return [2 /*return*/, __assign(__assign({}, opp[0]), { stageName: stageLabelMap[opp[0].stage] })];
                    case 3:
                        error_7 = _b.sent();
                        console.error("[SALES_PIPELINE] getById error:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch opportunity"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
