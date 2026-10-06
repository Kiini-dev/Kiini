"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.ictManagementRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var rateLimitConfig_1 = require("../lib/rateLimitConfig");
var schema_1 = require("../../drizzle/schema");
var server_1 = require("@trpc/server");
var os_1 = require("os");
exports.ictManagementRouter = trpc_1.router({
    // System Health Monitoring
    getSystemHealth: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, uptime, totalMem, freeMem, usedMem, memUsage, cpus, cpuLoad, diskUsage;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        try {
                            uptime = process.uptime();
                            totalMem = os_1["default"].totalmem();
                            freeMem = os_1["default"].freemem();
                            usedMem = totalMem - freeMem;
                            memUsage = (usedMem / totalMem) * 100;
                            cpus = os_1["default"].cpus();
                            cpuLoad = cpus.reduce(function (acc, cpu) {
                                var total = Object.values(cpu.times).reduce(function (a, b) { return a + b; }, 0);
                                var idle = cpu.times.idle;
                                return acc + ((total - idle) / total) * 100;
                            }, 0) / cpus.length;
                            diskUsage = 45;
                            return [2 /*return*/, {
                                    timestamp: new Date().toISOString(),
                                    cpuUsage: Math.round(cpuLoad * 10) / 10,
                                    memoryUsage: Math.round(memUsage * 10) / 10,
                                    diskUsagePercent: diskUsage,
                                    cpu: {
                                        model: ((_b = cpus[0]) === null || _b === void 0 ? void 0 : _b.model) || "Unknown",
                                        cores: cpus.length,
                                        physicalCores: cpus.length,
                                        currentSpeed: ((_c = cpus[0]) === null || _c === void 0 ? void 0 : _c.speed) || 0,
                                        temperature: null,
                                        load: Math.round(cpuLoad * 10) / 10,
                                        loadPercent: Math.round(cpuLoad * 10) / 10
                                    },
                                    memory: {
                                        total: Math.round(totalMem / (1024 * 1024 * 1024) * 10) / 10,
                                        used: Math.round(usedMem / (1024 * 1024 * 1024) * 10) / 10,
                                        available: Math.round(freeMem / (1024 * 1024 * 1024) * 10) / 10,
                                        percent: Math.round(memUsage)
                                    },
                                    disk: {
                                        total: 500,
                                        usage: [{
                                                disk: "/dev/sda1",
                                                used: Math.round((diskUsage / 100) * 500),
                                                size: 500,
                                                percent: diskUsage
                                            }]
                                    },
                                    system: {
                                        platform: os_1["default"].platform(),
                                        distro: os_1["default"].type(),
                                        release: os_1["default"].release(),
                                        arch: os_1["default"].arch(),
                                        hostname: os_1["default"].hostname()
                                    },
                                    uptime: Math.round(uptime / 3600),
                                    systemUptime: (uptime / 3600).toFixed(1),
                                    nodeVersion: process.version,
                                    processMemory: {
                                        rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
                                        heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
                                        heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024))
                                    },
                                    status: calculateHealthStatus(cpuLoad, memUsage, diskUsage),
                                    lastCheck: new Date().toISOString()
                                }];
                        }
                        catch (error) {
                            console.error("Error fetching system health:", error);
                            throw new Error("Failed to retrieve system health information");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }),
    // Get System Logs
    getSystemLogs: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().max(500)["default"](50),
        offset: zod_1.z.number()["default"](0),
        severity: zod_1.z["enum"](["info", "warning", "error", "critical"]).optional(),
        organizationId: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, conditions, total, logs, error_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        query = db.select().from(schema_1.systemLogs);
                        conditions = [];
                        if (input.severity) {
                            conditions.push(drizzle_orm_1.eq(schema_1.systemLogs.severity, input.severity));
                        }
                        // For org-level logs, restrict to org
                        if (input.organizationId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.systemLogs.organizationId, input.organizationId));
                        }
                        else if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin") {
                            // Non-super-admin only sees their org logs
                            conditions.push(drizzle_orm_1.eq(schema_1.systemLogs.organizationId, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ""));
                        }
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema_1.systemLogs)
                                .where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)];
                    case 3:
                        total = _e.sent();
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_1.systemLogs.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 4:
                        logs = _e.sent();
                        return [2 /*return*/, {
                                logs: logs,
                                total: ((_d = total[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
                                limit: input.limit,
                                offset: input.offset
                            }];
                    case 5:
                        error_1 = _e.sent();
                        console.error("Error fetching system logs:", error_1);
                        throw new Error("Failed to retrieve system logs");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get Active Sessions
    getActiveSessions: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        limit: zod_1.z.number().max(500)["default"](50)
    }).optional()["default"]({}))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, conditions, sessions, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        query = db
                            .select({
                            id: schema_1.activeSessions.id,
                            userId: schema_1.activeSessions.userId,
                            userEmail: schema_1.activeSessions.userEmail,
                            organizationId: schema_1.activeSessions.organizationId,
                            organizationName: schema_1.organizations.name,
                            ipAddress: schema_1.activeSessions.ipAddress,
                            userAgent: schema_1.activeSessions.userAgent,
                            createdAt: schema_1.activeSessions.createdAt,
                            lastActivity: schema_1.activeSessions.lastActivity,
                            expiresAt: schema_1.activeSessions.expiresAt
                        })
                            .from(schema_1.activeSessions)
                            .leftJoin(schema_1.organizations, drizzle_orm_1.eq(schema_1.activeSessions.organizationId, schema_1.organizations.id));
                        conditions = [];
                        if (input.organizationId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.activeSessions.organizationId, input.organizationId));
                        }
                        else if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin") {
                            conditions.push(drizzle_orm_1.eq(schema_1.activeSessions.organizationId, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ""));
                        }
                        // Only include non-expired sessions
                        conditions.push(drizzle_orm_1.gte(schema_1.activeSessions.expiresAt, new Date().toISOString()));
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_1.activeSessions.lastActivity))
                                .limit(input.limit)];
                    case 3:
                        sessions = _d.sent();
                        return [2 /*return*/, {
                                sessions: sessions,
                                count: sessions.length
                            }];
                    case 4:
                        error_2 = _d.sent();
                        console.error("Error fetching active sessions:", error_2);
                        throw new Error("Failed to retrieve active sessions");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Terminate Session
    terminateSession: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sessionId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, session, error_3;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _g.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.activeSessions)
                                .where(drizzle_orm_1.eq(schema_1.activeSessions.id, input.sessionId))];
                    case 3:
                        session = _g.sent();
                        if (!session || session.length === 0) {
                            throw new Error("Session not found");
                        }
                        // Check authorization - ICT can only terminate their org's sessions
                        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) === "ict_manager" &&
                            session[0].organizationId !== ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId)) {
                            throw new Error("Unauthorized to terminate this session");
                        }
                        // Delete the session
                        return [4 /*yield*/, db["delete"](schema_1.activeSessions)
                                .where(drizzle_orm_1.eq(schema_1.activeSessions.id, input.sessionId))];
                    case 4:
                        // Delete the session
                        _g.sent();
                        // Log the action
                        return [4 /*yield*/, logAuditEvent(db, {
                                action: "TERMINATE_SESSION",
                                userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "unknown",
                                organizationId: ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) || "",
                                details: "Session " + input.sessionId + " terminated by " + ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.email),
                                ipAddress: ctx.ipAddress || ""
                            })];
                    case 5:
                        // Log the action
                        _g.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Session terminated successfully"
                            }];
                    case 6:
                        error_3 = _g.sent();
                        console.error("Error terminating session:", error_3);
                        throw new Error("Failed to terminate session");
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Get Email Queue Status
    getEmailQueueStatus: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional()
    }).optional()["default"]({}))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, results, failedEmails, failed, error_4;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 5, , 6]);
                        query = db
                            .select({
                            status: schema_1.emailQueue.status,
                            count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"])))
                        })
                            .from(schema_1.emailQueue)
                            .groupBy(schema_1.emailQueue.status);
                        if (input.organizationId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.emailQueue.organizationId, input.organizationId));
                        }
                        else if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin") {
                            query = query.where(drizzle_orm_1.eq(schema_1.emailQueue.organizationId, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ""));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        results = _f.sent();
                        failedEmails = db
                            .select()
                            .from(schema_1.emailQueue)
                            .where(drizzle_orm_1.eq(schema_1.emailQueue.status, "failed"))
                            .orderBy(drizzle_orm_1.desc(schema_1.emailQueue.updatedAt))
                            .limit(10);
                        if (input.organizationId) {
                            failedEmails = failedEmails.where(drizzle_orm_1.eq(schema_1.emailQueue.organizationId, input.organizationId));
                        }
                        else if (((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "super_admin") {
                            failedEmails = failedEmails.where(drizzle_orm_1.eq(schema_1.emailQueue.organizationId, ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) || ""));
                        }
                        return [4 /*yield*/, failedEmails];
                    case 4:
                        failed = _f.sent();
                        return [2 /*return*/, {
                                summary: results,
                                recentFailures: failed,
                                totalQueued: results.reduce(function (sum, r) { return sum + Number(r.count); }, 0)
                            }];
                    case 5:
                        error_4 = _f.sent();
                        console.error("Error fetching email queue status:", error_4);
                        throw new Error("Failed to retrieve email queue status");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get Audit Logs
    getAuditLogs: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().max(500)["default"](50),
        offset: zod_1.z.number()["default"](0),
        action: zod_1.z.string().optional(),
        userId: zod_1.z.string().optional(),
        organizationId: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, conditions, total, logs, error_5;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        query = db.select().from(schema_1.auditLogs);
                        conditions = [];
                        if (input.action) {
                            conditions.push(drizzle_orm_1.eq(schema_1.auditLogs.action, input.action));
                        }
                        if (input.userId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.auditLogs.userId, input.userId));
                        }
                        if (input.organizationId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.auditLogs.organizationId, input.organizationId));
                        }
                        else if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin") {
                            conditions.push(drizzle_orm_1.eq(schema_1.auditLogs.organizationId, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ""));
                        }
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema_1.auditLogs)
                                .where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)];
                    case 3:
                        total = _e.sent();
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_1.auditLogs.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 4:
                        logs = _e.sent();
                        return [2 /*return*/, {
                                logs: logs,
                                total: ((_d = total[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
                                limit: input.limit,
                                offset: input.offset
                            }];
                    case 5:
                        error_5 = _e.sent();
                        console.error("Error fetching audit logs:", error_5);
                        throw new Error("Failed to retrieve audit logs");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Database Maintenance Check
    getDatabaseStatus: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, tables, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.query.users.findMany({ limit: 1 })];
                    case 3:
                        tables = _b.sent();
                        // This is a basic check - extend with actual DB-specific queries
                        return [2 /*return*/, {
                                status: "healthy",
                                lastCheck: new Date().toISOString(),
                                connected: !!db,
                                message: "Database connection is operational",
                                recommendations: [
                                    "Run regular maintenance queries",
                                    "Monitor backup schedules",
                                    "Check disk space usage",
                                ]
                            }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Error checking database status:", error_6);
                        return [2 /*return*/, {
                                status: "unhealthy",
                                lastCheck: new Date().toISOString(),
                                connected: false,
                                message: "Database connection failed",
                                recommendations: [
                                    "Check database service status",
                                    "Verify connection credentials",
                                    "Check network connectivity",
                                ]
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get System Alerts/Notifications
    getSystemAlerts: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        severity: zod_1.z["enum"](["info", "warning", "critical"]).optional()
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var health, alerts, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getSystemHealthForAlerts()];
                    case 1:
                        health = _b.sent();
                        alerts = [];
                        if (health.cpuLoad > 80) {
                            alerts.push({
                                id: "cpu_high",
                                severity: "warning",
                                title: "High CPU Usage",
                                message: "CPU usage at " + health.cpuLoad + "%",
                                createdAt: new Date().toISOString()
                            });
                        }
                        if (health.memoryUsage > 85) {
                            alerts.push({
                                id: "mem_high",
                                severity: "critical",
                                title: "High Memory Usage",
                                message: "Memory usage at " + health.memoryUsage + "%",
                                createdAt: new Date().toISOString()
                            });
                        }
                        if (health.diskUsage > 90) {
                            alerts.push({
                                id: "disk_full",
                                severity: "critical",
                                title: "Disk Space Low",
                                message: "Disk usage at " + health.diskUsage + "%",
                                createdAt: new Date().toISOString()
                            });
                        }
                        return [2 /*return*/, {
                                alerts: alerts.filter(function (a) {
                                    return !input.severity || a.severity.includes(input.severity);
                                }),
                                count: alerts.length
                            }];
                    case 2:
                        error_7 = _b.sent();
                        console.error("Error fetching system alerts:", error_7);
                        throw new Error("Failed to retrieve system alerts");
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    // ── API Keys Management ──────────────────────────────────────
    getApiKeys: trpc_1.protectedProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().max(100)["default"](50), offset: zod_1.z.number()["default"](0) }).optional())
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, limit, offset, keys, total, error_8;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        limit = (_b = input === null || input === void 0 ? void 0 : input.limit) !== null && _b !== void 0 ? _b : 50;
                        offset = (_c = input === null || input === void 0 ? void 0 : input.offset) !== null && _c !== void 0 ? _c : 0;
                        return [4 /*yield*/, db.select().from(schema_1.apiKeys).orderBy(drizzle_orm_1.desc(schema_1.apiKeys.createdAt)).limit(limit).offset(offset)];
                    case 3:
                        keys = _e.sent();
                        return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) }).from(schema_1.apiKeys)];
                    case 4:
                        total = _e.sent();
                        return [2 /*return*/, { keys: keys, total: ((_d = total[0]) === null || _d === void 0 ? void 0 : _d.count) || 0 }];
                    case 5:
                        error_8 = _e.sent();
                        console.error("Error fetching API keys:", error_8);
                        throw new Error("Failed to retrieve API keys");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    createApiKey: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        keyName: zod_1.z.string().min(1).max(255),
        expiresAt: zod_1.z.string().optional(),
        rateLimit: zod_1.z.number()["default"](1000)
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, keyValue, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        id = "ak_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
                        keyValue = "nxs_" + Array.from({ length: 32 }, function () { return Math.random().toString(36).charAt(2); }).join("");
                        return [4 /*yield*/, db.insert(schema_1.apiKeys).values({
                                id: id,
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "unknown",
                                keyName: input.keyName,
                                keyValue: keyValue,
                                expiresAt: input.expiresAt || null,
                                rateLimit: input.rateLimit,
                                isActive: 1,
                                createdAt: new Date().toISOString()
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { id: id, keyName: input.keyName, keyValue: keyValue, message: "API key created. Store the key securely - it won't be shown again." }];
                    case 4:
                        error_9 = _c.sent();
                        console.error("Error creating API key:", error_9);
                        throw new Error("Failed to create API key");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    revokeApiKey: trpc_1.protectedProcedure
        .input(zod_1.z.object({ keyId: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.update(schema_1.apiKeys).set({ isActive: 0 }).where(drizzle_orm_1.eq(schema_1.apiKeys.id, input.keyId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "API key revoked" }];
                    case 4:
                        error_10 = _b.sent();
                        console.error("Error revoking API key:", error_10);
                        throw new Error("Failed to revoke API key");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ── Performance Metrics ──────────────────────────────────────
    getPerformanceMetrics: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var cpus, cpuLoad, totalMem, freeMem, memUsage;
        var _a, _b;
        return __generator(this, function (_c) {
            try {
                cpus = os_1["default"].cpus();
                cpuLoad = cpus.reduce(function (acc, cpu) {
                    var total = Object.values(cpu.times).reduce(function (a, b) { return a + b; }, 0);
                    var idle = cpu.times.idle;
                    return acc + ((total - idle) / total) * 100;
                }, 0) / cpus.length;
                totalMem = os_1["default"].totalmem();
                freeMem = os_1["default"].freemem();
                memUsage = process.memoryUsage();
                return [2 /*return*/, {
                        cpu: {
                            cores: cpus.length,
                            model: ((_a = cpus[0]) === null || _a === void 0 ? void 0 : _a.model) || "Unknown",
                            speed: ((_b = cpus[0]) === null || _b === void 0 ? void 0 : _b.speed) || 0,
                            loadPercent: Math.round(cpuLoad * 10) / 10,
                            perCore: cpus.map(function (c, i) {
                                var total = Object.values(c.times).reduce(function (a, b) { return a + b; }, 0);
                                return { core: i, percent: Math.round(((total - c.times.idle) / total) * 1000) / 10 };
                            })
                        },
                        memory: {
                            totalGB: Math.round(totalMem / (Math.pow(1024, 3)) * 10) / 10,
                            usedGB: Math.round((totalMem - freeMem) / (Math.pow(1024, 3)) * 10) / 10,
                            freeGB: Math.round(freeMem / (Math.pow(1024, 3)) * 10) / 10,
                            percent: Math.round(((totalMem - freeMem) / totalMem) * 100)
                        },
                        process: {
                            rss: Math.round(memUsage.rss / (1024 * 1024)),
                            heapTotal: Math.round(memUsage.heapTotal / (1024 * 1024)),
                            heapUsed: Math.round(memUsage.heapUsed / (1024 * 1024)),
                            external: Math.round(memUsage.external / (1024 * 1024)),
                            uptimeHours: Math.round(process.uptime() / 3600 * 10) / 10,
                            pid: process.pid,
                            nodeVersion: process.version
                        },
                        system: {
                            platform: os_1["default"].platform(),
                            arch: os_1["default"].arch(),
                            hostname: os_1["default"].hostname(),
                            type: os_1["default"].type(),
                            release: os_1["default"].release(),
                            uptimeHours: Math.round(os_1["default"].uptime() / 3600 * 10) / 10,
                            loadAvg: os_1["default"].loadavg()
                        },
                        timestamp: new Date().toISOString()
                    }];
            }
            catch (error) {
                console.error("Error fetching performance metrics:", error);
                throw new Error("Failed to retrieve performance metrics");
            }
            return [2 /*return*/];
        });
    }); }),
    // ── Network Configuration ──────────────────────────────────────
    getNetworkConfig: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var interfaces, networkInfo;
        return __generator(this, function (_a) {
            try {
                interfaces = os_1["default"].networkInterfaces();
                networkInfo = Object.entries(interfaces).flatMap(function (_a) {
                    var name = _a[0], addrs = _a[1];
                    return (addrs || []).map(function (addr) { return ({
                        interface: name,
                        address: addr.address,
                        family: addr.family,
                        internal: addr.internal,
                        netmask: addr.netmask,
                        mac: addr.mac
                    }); });
                });
                return [2 /*return*/, {
                        interfaces: networkInfo,
                        hostname: os_1["default"].hostname(),
                        dns: {
                            servers: ["Managed by hosting provider"]
                        },
                        cors: {
                            enabled: true,
                            origins: ["*"]
                        },
                        ssl: {
                            enabled: true,
                            provider: "cPanel AutoSSL / Let's Encrypt"
                        },
                        timestamp: new Date().toISOString()
                    }];
            }
            catch (error) {
                console.error("Error fetching network config:", error);
                throw new Error("Failed to retrieve network configuration");
            }
            return [2 /*return*/];
        });
    }); }),
    // ── Extended Database Status ──────────────────────────────────
    getDatabaseInfo: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, tableStatus, processlist, variables, tables, procs, vars, varsMap_1, error_11;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SHOW TABLE STATUS"], ["SHOW TABLE STATUS"]))))];
                case 3:
                    tableStatus = _d.sent();
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SHOW PROCESSLIST"], ["SHOW PROCESSLIST"]))))];
                case 4:
                    processlist = _d.sent();
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SHOW GLOBAL STATUS WHERE Variable_name IN ('Uptime','Threads_connected','Questions','Slow_queries','Bytes_received','Bytes_sent')"], ["SHOW GLOBAL STATUS WHERE Variable_name IN ('Uptime','Threads_connected','Questions','Slow_queries','Bytes_received','Bytes_sent')"]))))];
                case 5:
                    variables = _d.sent();
                    tables = ((_a = tableStatus) === null || _a === void 0 ? void 0 : _a[0]) || [];
                    procs = ((_b = processlist) === null || _b === void 0 ? void 0 : _b[0]) || [];
                    vars = ((_c = variables) === null || _c === void 0 ? void 0 : _c[0]) || [];
                    varsMap_1 = {};
                    vars.forEach(function (v) { varsMap_1[v.Variable_name] = v.Value; });
                    return [2 /*return*/, {
                            status: "healthy",
                            connected: true,
                            tables: Array.isArray(tables) ? tables.map(function (t) { return ({
                                name: t.Name,
                                rows: Number(t.Rows || 0),
                                dataLength: Number(t.Data_length || 0),
                                indexLength: Number(t.Index_length || 0),
                                engine: t.Engine,
                                collation: t.Collation
                            }); }) : [],
                            activeConnections: procs.length || 0,
                            uptime: varsMap_1["Uptime"] ? Math.round(Number(varsMap_1["Uptime"]) / 3600) : 0,
                            totalQueries: Number(varsMap_1["Questions"] || 0),
                            slowQueries: Number(varsMap_1["Slow_queries"] || 0),
                            bytesReceived: Number(varsMap_1["Bytes_received"] || 0),
                            bytesSent: Number(varsMap_1["Bytes_sent"] || 0),
                            timestamp: new Date().toISOString()
                        }];
                case 6:
                    error_11 = _d.sent();
                    console.error("Error fetching database info:", error_11);
                    return [2 /*return*/, {
                            status: "error",
                            connected: false,
                            tables: [],
                            activeConnections: 0,
                            uptime: 0,
                            totalQueries: 0,
                            slowQueries: 0,
                            bytesReceived: 0,
                            bytesSent: 0,
                            timestamp: new Date().toISOString(),
                            error: String(error_11)
                        }];
                case 7: return [2 /*return*/];
            }
        });
    }); }),
    // API Rate Limiting Management
    getRateLimitConfig: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    globalRateLimit: rateLimitConfig_1.rateLimitConfig.globalRequestsPerMinute,
                    perUserRateLimit: rateLimitConfig_1.rateLimitConfig.perUserRequestsPerMinute,
                    burstLimit: rateLimitConfig_1.rateLimitConfig.burstLimit,
                    windowMs: rateLimitConfig_1.rateLimitConfig.windowMs,
                    whitelistedIPs: rateLimitConfig_1.rateLimitConfig.whitelistedIPs,
                    enabled: rateLimitConfig_1.rateLimitConfig.enabled
                }];
        });
    }); }),
    updateRateLimitConfig: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        globalRateLimit: zod_1.z.number().min(10).max(100000).optional(),
        perUserRateLimit: zod_1.z.number().min(5).max(10000).optional(),
        burstLimit: zod_1.z.number().min(5).max(1000).optional(),
        windowMs: zod_1.z.number().min(1000).max(3600000).optional(),
        whitelistedIPs: zod_1.z.array(zod_1.z.string().regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}(\/\d{1,3})?$/)).optional(),
        enabled: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin" && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "ict_manager") {
                    throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
                }
                if (input.globalRateLimit !== undefined)
                    rateLimitConfig_1.rateLimitConfig.globalRequestsPerMinute = input.globalRateLimit;
                if (input.perUserRateLimit !== undefined)
                    rateLimitConfig_1.rateLimitConfig.perUserRequestsPerMinute = input.perUserRateLimit;
                if (input.burstLimit !== undefined)
                    rateLimitConfig_1.rateLimitConfig.burstLimit = input.burstLimit;
                if (input.windowMs !== undefined)
                    rateLimitConfig_1.rateLimitConfig.windowMs = input.windowMs;
                if (input.whitelistedIPs !== undefined)
                    rateLimitConfig_1.rateLimitConfig.whitelistedIPs = input.whitelistedIPs;
                if (input.enabled !== undefined)
                    rateLimitConfig_1.rateLimitConfig.enabled = input.enabled;
                return [2 /*return*/, { success: true, config: rateLimitConfig_1.rateLimitConfig }];
            });
        });
    }),
    getRateLimitStats: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, rateLimitConfig_1.getRateLimitStats()];
        });
    }); }),
    // ── Subscription-tier rate limit management ──────────────────────────────
    /** Returns the effective limit for every tier (default + any override). */
    getTierRateLimits: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var tiers;
        return __generator(this, function (_a) {
            tiers = Object.entries(rateLimitConfig_1.TIER_RATE_LIMITS).map(function (_a) {
                var tier = _a[0], def = _a[1];
                return ({
                    tier: tier,
                    label: def.label,
                    defaultLimit: def.requestsPerWindow,
                    effectiveLimit: rateLimitConfig_1.getTierLimit(tier),
                    windowMs: def.windowMs,
                    overridden: tier in rateLimitConfig_1.rateLimitConfig.tierOverrides
                });
            });
            return [2 /*return*/, { tiers: tiers, windowMs: rateLimitConfig_1.rateLimitConfig.windowMs }];
        });
    }); }),
    /** Override or reset a single tier's request limit. Pass null to reset. */
    updateTierRateLimit: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        tier: zod_1.z["enum"](["free", "trial", "starter", "professional", "enterprise", "custom"]),
        requestsPerWindow: zod_1.z.number().min(50).max(100000).nullable()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "super_admin" && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "ict_manager") {
                    throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
                }
                if (input.requestsPerWindow === null) {
                    delete rateLimitConfig_1.rateLimitConfig.tierOverrides[input.tier];
                }
                else {
                    rateLimitConfig_1.rateLimitConfig.tierOverrides[input.tier] = input.requestsPerWindow;
                }
                // Flush cached org entries so new limits take effect immediately
                rateLimitConfig_1.invalidateOrgCache();
                return [2 /*return*/, {
                        success: true,
                        tier: input.tier,
                        effectiveLimit: rateLimitConfig_1.getTierLimit(input.tier)
                    }];
            });
        });
    })
});
function calculateHealthStatus(cpuLoad, memUsage, diskUsage) {
    if (cpuLoad > 90 || memUsage > 90 || diskUsage > 95) {
        return "critical";
    }
    if (cpuLoad > 75 || memUsage > 80 || diskUsage > 85) {
        return "warning";
    }
    return "healthy";
}
function getSystemHealthForAlerts() {
    return __awaiter(this, void 0, void 0, function () {
        var totalMem, freeMem, memUsage, cpus, cpuLoad;
        return __generator(this, function (_a) {
            try {
                totalMem = os_1["default"].totalmem();
                freeMem = os_1["default"].freemem();
                memUsage = ((totalMem - freeMem) / totalMem) * 100;
                cpus = os_1["default"].cpus();
                cpuLoad = cpus.reduce(function (acc, cpu) {
                    var total = Object.values(cpu.times).reduce(function (a, b) { return a + b; }, 0);
                    var idle = cpu.times.idle;
                    return acc + ((total - idle) / total) * 100;
                }, 0) / cpus.length;
                return [2 /*return*/, {
                        cpuLoad: Math.round(cpuLoad),
                        memoryUsage: Math.round(memUsage),
                        diskUsage: 45
                    }];
            }
            catch (error) {
                console.error("Error getting system health for alerts:", error);
                return [2 /*return*/, {
                        cpuLoad: 0,
                        memoryUsage: 0,
                        diskUsage: 0
                    }];
            }
            return [2 /*return*/];
        });
    });
}
function logAuditEvent(db, event) {
    return __awaiter(this, void 0, void 0, function () {
        var error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            id: "audit_" + Date.now(),
                            action: event.action,
                            userId: event.userId,
                            organizationId: event.organizationId,
                            details: event.details,
                            ipAddress: event.ipAddress,
                            createdAt: new Date().toISOString()
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _a.sent();
                    console.error("Error logging audit event:", error_12);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
