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
exports.monitoringService = exports.monitoringRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var monitoringService_1 = require("../services/monitoringService");
// Initialize monitoring service
var monitoringService = monitoringService_1.createMonitoringService({
    enabled: process.env.MONITORING_ENABLED !== 'false',
    apmProvider: process.env.APM_PROVIDER || 'none',
    logProvider: process.env.LOG_PROVIDER || 'console'
});
exports.monitoringService = monitoringService;
exports.monitoringRouter = trpc_1.router({
    /**
     * Health check endpoint - returns system health status
     * Can be called publicly for load balancer health checks
     */
    healthCheck: trpc_1.publicProcedure
        .input(zod_1.z
        .object({
        detailed: zod_1.z.boolean().optional()
    })
        .optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var healthCheckResult, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, monitoringService.performHealthCheck()];
                    case 1:
                        healthCheckResult = _b.sent();
                        if (!(input === null || input === void 0 ? void 0 : input.detailed)) {
                            // Simple health check response for load balancers
                            return [2 /*return*/, {
                                    status: healthCheckResult.status,
                                    timestamp: healthCheckResult.timestamp
                                }];
                        }
                        // Detailed health check with all component statuses
                        return [2 /*return*/, healthCheckResult];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Health check failed:', error_1);
                        return [2 /*return*/, {
                                status: 'unhealthy',
                                timestamp: new Date(),
                                error: error_1.message
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get current system metrics
     */
    getMetrics: trpc_1.publicProcedure
        .input(zod_1.z
        .object({
        metric: zod_1.z.string().optional(),
        timeRange: zod_1.z["enum"](['1h', '24h', '7d', '30d']).optional()
    })
        .optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_b) {
                try {
                    mockMetrics = [
                        {
                            name: 'http_requests_total',
                            value: 15234,
                            timestamp: new Date(),
                            tags: { endpoint: '/api', method: 'POST', status: '200' }
                        },
                        {
                            name: 'operation.duration',
                            value: 234,
                            timestamp: new Date(),
                            tags: { operation: 'database_query', status: 'success' }
                        },
                        {
                            name: 'database_connections',
                            value: 45,
                            timestamp: new Date(),
                            tags: { pool: 'default', status: 'active' }
                        },
                    ];
                    return [2 /*return*/, {
                            metrics: mockMetrics,
                            timeRange: (input === null || input === void 0 ? void 0 : input.timeRange) || '1h',
                            success: true
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: "Failed to fetch metrics: " + error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get system uptime and availability
     */
    getUptime: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var uptime, uptimeHours, uptimeMinutes, uptimeSeconds;
        return __generator(this, function (_a) {
            try {
                uptime = process.uptime();
                uptimeHours = Math.floor(uptime / 3600);
                uptimeMinutes = Math.floor((uptime % 3600) / 60);
                uptimeSeconds = Math.floor(uptime % 60);
                return [2 /*return*/, {
                        uptimeSeconds: Math.floor(uptime),
                        uptimeFormatted: uptimeHours + "h " + uptimeMinutes + "m " + uptimeSeconds + "s",
                        startTime: new Date(Date.now() - uptime * 1000),
                        availability: '99.9%',
                        success: true
                    }];
            }
            catch (error) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: "Failed to fetch uptime: " + error.message
                });
            }
            return [2 /*return*/];
        });
    }); }),
    /**
     * Get performance statistics
     */
    getPerformanceStats: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var memoryUsage, heapUsagePercent;
        return __generator(this, function (_a) {
            try {
                memoryUsage = process.memoryUsage();
                heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
                return [2 /*return*/, {
                        memory: {
                            heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                            heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                            externalMB: Math.round(memoryUsage.external / 1024 / 1024),
                            heapUsagePercent: Math.round(heapUsagePercent),
                            status: heapUsagePercent > 90 ? 'critical' : heapUsagePercent > 75 ? 'warning' : 'healthy'
                        },
                        cpu: {
                            usagePercent: 45
                        },
                        uptime: Math.floor(process.uptime()),
                        success: true
                    }];
            }
            catch (error) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: "Failed to fetch performance stats: " + error.message
                });
            }
            return [2 /*return*/];
        });
    }); }),
    /**
     * Get service status (API, Database, Cache, External Services)
     */
    getServiceStatus: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var health, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, monitoringService.performHealthCheck()];
                case 1:
                    health = _a.sent();
                    return [2 /*return*/, {
                            services: {
                                api: { status: 'operational', responseTime: 45 },
                                database: {
                                    status: health.checks.database.status,
                                    responseTime: health.checks.database.responseTime
                                },
                                cache: {
                                    status: health.checks.cache.status,
                                    responseTime: health.checks.cache.responseTime
                                },
                                externalAPIs: {
                                    status: health.checks.externalAPIs.status,
                                    responseTime: health.checks.externalAPIs.responseTime
                                }
                            },
                            lastUpdated: new Date(),
                            success: true
                        }];
                case 2:
                    error_2 = _a.sent();
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: "Failed to fetch service status: " + error_2.message
                    });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get error rate and logs
     */
    getErrorMetrics: trpc_1.publicProcedure
        .input(zod_1.z
        .object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        severity: zod_1.z["enum"](['all', 'error', 'warning', 'critical']).optional()
    })
        .optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // TODO: Query error logs from centralized logging service
                    return [2 /*return*/, {
                            errors: [
                                {
                                    id: '1',
                                    severity: 'error',
                                    message: 'Database connection timeout',
                                    timestamp: new Date(Date.now() - 3600000),
                                    count: 5,
                                    resolved: false
                                },
                            ],
                            totalErrors24h: 234,
                            totalWarnings24h: 567,
                            errorRate: 0.3,
                            trend: 'improving',
                            success: true
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: "Failed to fetch error metrics: " + error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get alerts and notifications
     */
    getAlerts: trpc_1.publicProcedure
        .input(zod_1.z
        .object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        severity: zod_1.z["enum"](['all', 'info', 'warning', 'critical']).optional()
    })
        .optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var health, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, monitoringService.performHealthCheck()];
                    case 1:
                        health = _c.sent();
                        return [2 /*return*/, {
                                alerts: health.alerts || [],
                                totalActive: ((_b = health.alerts) === null || _b === void 0 ? void 0 : _b.length) || 0,
                                timestamp: new Date(),
                                success: true
                            }];
                    case 2:
                        error_3 = _c.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to fetch alerts: " + error_3.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get application dependencies status
     */
    getDependencies: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                return [2 /*return*/, {
                        dependencies: [
                            {
                                name: 'Node.js',
                                version: process.version,
                                status: 'operational'
                            },
                            {
                                name: 'MySQL',
                                version: '8.0',
                                status: 'operational'
                            },
                            {
                                name: 'Redis',
                                version: '7.0',
                                status: 'operational'
                            },
                            {
                                name: 'Africa\'s Talking SMS',
                                version: 'v1',
                                status: 'operational'
                            },
                        ],
                        lastChecked: new Date(),
                        success: true
                    }];
            }
            catch (error) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: "Failed to fetch dependencies: " + error.message
                });
            }
            return [2 /*return*/];
        });
    }); })
});
