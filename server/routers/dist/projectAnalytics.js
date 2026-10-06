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
exports.projectAnalyticsRouter = exports.calculateProjectMetrics = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var date_fns_1 = require("date-fns");
/**
 * Calculate project analytics and metrics
 */
function calculateProjectMetrics(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, project, invoices, totalRevenue, paidAmount, teamMembers, totalHoursEstimated, actualHours, startDate, endDate, now, totalDays, daysPassed, completionPercentage, statusKey, riskLevel, costOverrunPercentage, scheduleRisk, metricsId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, db.getProject(projectId)];
                case 3:
                    project = _a.sent();
                    if (!project)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.getInvoicesByProject(projectId)];
                case 4:
                    invoices = _a.sent();
                    totalRevenue = invoices.reduce(function (sum, inv) { return sum + inv.total; }, 0);
                    paidAmount = invoices.reduce(function (sum, inv) { return sum + inv.paidAmount; }, 0);
                    return [4 /*yield*/, db.getProjectTeamMembers(projectId)];
                case 5:
                    teamMembers = _a.sent();
                    totalHoursEstimated = teamMembers.reduce(function (sum, tm) { return sum + (tm.hoursAllocated || 0); }, 0);
                    return [4 /*yield*/, db.getProjectActualHours(projectId)];
                case 6:
                    actualHours = _a.sent();
                    startDate = new Date(project.startDate);
                    endDate = new Date(project.endDate);
                    now = new Date();
                    totalDays = date_fns_1.differenceInDays(endDate, startDate);
                    daysPassed = date_fns_1.differenceInDays(now, startDate);
                    completionPercentage = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
                    statusKey = 'on-time';
                    if (now > endDate) {
                        statusKey = 'delayed';
                    }
                    else if (completionPercentage > 75) {
                        statusKey = 'on-track';
                    }
                    riskLevel = 'low';
                    costOverrunPercentage = project.budget ? ((project.budget - project.cost) / project.budget) * 100 : 0;
                    scheduleRisk = completionPercentage < (daysPassed / totalDays) * 100 ? 30 : 0;
                    if (costOverrunPercentage < 10 && scheduleRisk < 20) {
                        riskLevel = 'low';
                    }
                    else if (costOverrunPercentage < 25 || scheduleRisk < 50) {
                        riskLevel = 'medium';
                    }
                    else {
                        riskLevel = 'high';
                    }
                    metricsId = uuid_1.v4();
                    return [4 /*yield*/, db.insertProjectMetrics({
                            id: metricsId,
                            projectId: projectId,
                            revenue: totalRevenue,
                            costs: project.cost || 0,
                            profit: totalRevenue - (project.cost || 0),
                            profitMargin: totalRevenue > 0 ? Math.round((((totalRevenue - (project.cost || 0)) / totalRevenue) * 100)) : 0,
                            hoursEstimated: totalHoursEstimated,
                            hoursActual: actualHours,
                            teamMembersCount: teamMembers.length,
                            completionPercentage: completionPercentage,
                            statusKey: statusKey,
                            riskLevel: riskLevel
                        })];
                case 7:
                    _a.sent();
                    return [2 /*return*/, {
                            id: metricsId,
                            projectId: projectId,
                            revenue: totalRevenue,
                            costs: project.cost || 0,
                            profit: totalRevenue - (project.cost || 0),
                            profitMargin: totalRevenue > 0 ? Math.round((((totalRevenue - (project.cost || 0)) / totalRevenue) * 100)) : 0,
                            hoursEstimated: totalHoursEstimated,
                            hoursActual: actualHours,
                            teamMembersCount: teamMembers.length,
                            completionPercentage: completionPercentage,
                            statusKey: statusKey,
                            riskLevel: riskLevel
                        }];
                case 8:
                    error_1 = _a.sent();
                    console.error("[PROJECT ANALYTICS] Error calculating metrics:", error_1);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.calculateProjectMetrics = calculateProjectMetrics;
exports.projectAnalyticsRouter = trpc_1.router({
    /**
     * Get analytics for a specific project
     */
    getProjectAnalytics: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, metrics, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            return [2 /*return*/, null];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db.getProjectMetrics(input.projectId)];
                    case 3:
                        metrics = _b.sent();
                        if (metrics) {
                            return [2 /*return*/, metrics];
                        }
                        return [4 /*yield*/, calculateProjectMetrics(input.projectId)];
                    case 4: 
                    // If not cached, calculate on-demand
                    return [2 /*return*/, _b.sent()];
                    case 5:
                        error_2 = _b.sent();
                        console.error("[PROJECT ANALYTICS] Error getting analytics:", error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get analytics for all projects (dashboard view)
     */
    getAllProjectAnalytics: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(zod_1.z.object({
        status: zod_1.z["enum"](['active', 'completed', 'on_hold']).optional(),
        limit: zod_1.z.number()["default"](100)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, projects, analytics, _i, projects_1, project, metrics, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { projects: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getProjects({ status: input.status, limit: input.limit })];
                    case 3:
                        projects = _b.sent();
                        analytics = [];
                        _i = 0, projects_1 = projects;
                        _b.label = 4;
                    case 4:
                        if (!(_i < projects_1.length)) return [3 /*break*/, 7];
                        project = projects_1[_i];
                        return [4 /*yield*/, calculateProjectMetrics(project.id)];
                    case 5:
                        metrics = _b.sent();
                        if (metrics) {
                            analytics.push(__assign(__assign({}, project), { metrics: metrics }));
                        }
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { projects: analytics }];
                    case 8:
                        error_3 = _b.sent();
                        console.error("[PROJECT ANALYTICS] Error getting all analytics:", error_3);
                        return [2 /*return*/, { projects: [] }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get projects by risk level
     */
    getProjectsByRisk: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(zod_1.z.object({
        riskLevel: zod_1.z["enum"](['low', 'medium', 'high']),
        limit: zod_1.z.number()["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, metrics, projects, _i, metrics_1, metric, project, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { projects: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getProjectMetricsByRisk(input.riskLevel, input.limit)];
                    case 3:
                        metrics = _b.sent();
                        projects = [];
                        _i = 0, metrics_1 = metrics;
                        _b.label = 4;
                    case 4:
                        if (!(_i < metrics_1.length)) return [3 /*break*/, 7];
                        metric = metrics_1[_i];
                        return [4 /*yield*/, db.getProject(metric.projectId)];
                    case 5:
                        project = _b.sent();
                        if (project) {
                            projects.push(__assign(__assign({}, project), { metrics: metric }));
                        }
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { projects: projects }];
                    case 8:
                        error_4 = _b.sent();
                        console.error("[PROJECT ANALYTICS] Error getting projects by risk:", error_4);
                        return [2 /*return*/, { projects: [] }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get profitability analysis
     */
    getProfitabilityAnalysis: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, metrics, totalRevenue, totalCosts, totalProfit, averageMargin, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, { summary: { totalRevenue: 0, totalCosts: 0, totalProfit: 0, averageMargin: 0 }, byProject: [] }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.getProjectMetrics()];
                case 3:
                    metrics = _a.sent();
                    totalRevenue = metrics.reduce(function (sum, m) { return sum + (m.revenue || 0); }, 0);
                    totalCosts = metrics.reduce(function (sum, m) { return sum + (m.costs || 0); }, 0);
                    totalProfit = totalRevenue - totalCosts;
                    averageMargin = metrics.length > 0
                        ? Math.round(metrics.reduce(function (sum, m) { return sum + (m.profitMargin || 0); }, 0) / metrics.length)
                        : 0;
                    return [2 /*return*/, {
                            summary: {
                                totalRevenue: totalRevenue,
                                totalCosts: totalCosts,
                                totalProfit: totalProfit,
                                averageMargin: averageMargin
                            },
                            byProject: metrics.sort(function (a, b) { return (b.profit || 0) - (a.profit || 0); })
                        }];
                case 4:
                    error_5 = _a.sent();
                    console.error("[PROJECT ANALYTICS] Error getting profitability:", error_5);
                    return [2 /*return*/, { summary: { totalRevenue: 0, totalCosts: 0, totalProfit: 0, averageMargin: 0 }, byProject: [] }];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get timeline analysis (on-time vs delays)
     */
    getTimelineAnalysis: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, projects, onTime, delayed, onTrack, completed, _i, projects_2, project, metrics, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, { onTime: 0, delayed: 0, onTrack: 0, completed: [] }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, db.getProjects({ limit: 1000 })];
                case 3:
                    projects = _a.sent();
                    onTime = 0;
                    delayed = 0;
                    onTrack = 0;
                    completed = [];
                    _i = 0, projects_2 = projects;
                    _a.label = 4;
                case 4:
                    if (!(_i < projects_2.length)) return [3 /*break*/, 7];
                    project = projects_2[_i];
                    return [4 /*yield*/, calculateProjectMetrics(project.id)];
                case 5:
                    metrics = _a.sent();
                    if (metrics) {
                        if (metrics.statusKey === 'on-time')
                            onTime++;
                        else if (metrics.statusKey === 'delayed')
                            delayed++;
                        else if (metrics.statusKey === 'on-track')
                            onTrack++;
                        if (project.status === 'completed') {
                            completed.push({
                                projectName: project.name,
                                completionDate: project.endDate,
                                onTime: metrics.statusKey !== 'delayed'
                            });
                        }
                    }
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, { onTime: onTime, delayed: delayed, onTrack: onTrack, completed: completed }];
                case 8:
                    error_6 = _a.sent();
                    console.error("[PROJECT ANALYTICS] Error getting timeline analysis:", error_6);
                    return [2 /*return*/, { onTime: 0, delayed: 0, onTrack: 0, completed: [] }];
                case 9: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get resource utilization
     */
    getResourceUtilization: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, teamMembers, utilization, _i, teamMembers_1, member, actualHours, utilizationRate, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            return [2 /*return*/, { utilization: [] }];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.getProjectTeamMembers(input.projectId)];
                    case 3:
                        teamMembers = _b.sent();
                        utilization = [];
                        _i = 0, teamMembers_1 = teamMembers;
                        _b.label = 4;
                    case 4:
                        if (!(_i < teamMembers_1.length)) return [3 /*break*/, 7];
                        member = teamMembers_1[_i];
                        return [4 /*yield*/, db.getTeamMemberActualHours(member.employeeId, input.projectId)];
                    case 5:
                        actualHours = _b.sent();
                        utilizationRate = member.hoursAllocated > 0
                            ? Math.round((actualHours / member.hoursAllocated) * 100)
                            : 0;
                        utilization.push({
                            employeeId: member.employeeId,
                            allocated: member.hoursAllocated,
                            actual: actualHours,
                            utilizationRate: utilizationRate,
                            role: member.role
                        });
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { utilization: utilization }];
                    case 8:
                        error_7 = _b.sent();
                        console.error("[PROJECT ANALYTICS] Error getting resource utilization:", error_7);
                        return [2 /*return*/, { utilization: [] }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Refresh metrics for all projects
     */
    refreshAllMetrics: trpc_1.createFeatureRestrictedProcedure("reporting:view").mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, projects, updated, _i, projects_3, project, error_8;
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
                        return [4 /*yield*/, db.getProjects({ limit: 10000 })];
                    case 3:
                        projects = _d.sent();
                        updated = 0;
                        _i = 0, projects_3 = projects;
                        _d.label = 4;
                    case 4:
                        if (!(_i < projects_3.length)) return [3 /*break*/, 7];
                        project = projects_3[_i];
                        return [4 /*yield*/, calculateProjectMetrics(project.id)];
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
                        console.error("[PROJECT ANALYTICS] Error refreshing metrics:", error_8);
                        return [2 /*return*/, { success: false, error: String(error_8) }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    })
});
