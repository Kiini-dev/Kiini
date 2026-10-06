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
exports.systemHealthRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var os_1 = require("os");
var fs = require("fs");
var path = require("path");
var metricsCollector_1 = require("../lib/metricsCollector");
exports.systemHealthRouter = trpc_1.router({
    getStatus: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var uptime, memUsage, cpus, totalMem, freeMem, loadAvg;
        var _a;
        return __generator(this, function (_b) {
            uptime = process.uptime();
            memUsage = process.memoryUsage();
            cpus = os_1["default"].cpus();
            totalMem = os_1["default"].totalmem();
            freeMem = os_1["default"].freemem();
            loadAvg = os_1["default"].loadavg();
            return [2 /*return*/, {
                    status: "healthy",
                    uptime: Math.floor(uptime),
                    uptimeFormatted: Math.floor(uptime / 86400) + "d " + Math.floor((uptime % 86400) / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m",
                    memory: {
                        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                        rss: Math.round(memUsage.rss / 1024 / 1024),
                        external: Math.round(memUsage.external / 1024 / 1024),
                        systemTotal: Math.round(totalMem / 1024 / 1024),
                        systemFree: Math.round(freeMem / 1024 / 1024),
                        usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100)
                    },
                    cpu: {
                        cores: cpus.length,
                        model: ((_a = cpus[0]) === null || _a === void 0 ? void 0 : _a.model) || "Unknown",
                        loadAvg: loadAvg.map(function (l) { return Math.round(l * 100) / 100; })
                    },
                    platform: os_1["default"].platform(),
                    nodeVersion: process.version,
                    timestamp: new Date().toISOString()
                }];
        });
    }); }),
    getComponents: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var components, serverUptime, uptimePercent, getPool, pool, start, dbResponseTime, _a, smtpHost, smtpUser, smsKey, uploadDir, start;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    components = [];
                    serverUptime = process.uptime();
                    uptimePercent = Math.min(99.99, Math.round((serverUptime / (serverUptime + 1)) * 100 * 100) / 100);
                    // 1. API Server - real process uptime
                    components.push({
                        name: "API Server",
                        status: "operational",
                        uptime: uptimePercent,
                        responseTime: 1
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../db"); })];
                case 2:
                    getPool = (_b.sent()).getPool;
                    pool = getPool();
                    if (!pool)
                        throw new Error("No DB pool");
                    start = Date.now();
                    return [4 /*yield*/, pool.query("SELECT 1")];
                case 3:
                    _b.sent();
                    dbResponseTime = Date.now() - start;
                    components.push({
                        name: "Database",
                        status: "operational",
                        uptime: uptimePercent,
                        responseTime: dbResponseTime
                    });
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    components.push({ name: "Database", status: "down", uptime: 0, responseTime: 0 });
                    return [3 /*break*/, 5];
                case 5:
                    // 3. Email Service - check SMTP config availability
                    try {
                        smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
                        smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
                        if (smtpHost && smtpUser) {
                            components.push({ name: "Email Service", status: "operational", uptime: uptimePercent, responseTime: 0 });
                        }
                        else {
                            components.push({ name: "Email Service", status: "not_configured", uptime: 0, responseTime: 0 });
                        }
                    }
                    catch (_c) {
                        components.push({ name: "Email Service", status: "down", uptime: 0, responseTime: 0 });
                    }
                    smsKey = process.env.AFRICASTALKING_API_KEY || process.env.SMS_API_KEY;
                    if (smsKey) {
                        components.push({ name: "SMS Service", status: "operational", uptime: uptimePercent, responseTime: 0 });
                    }
                    else {
                        components.push({ name: "SMS Service", status: "not_configured", uptime: 0, responseTime: 0 });
                    }
                    // 5. File Storage - check upload directory
                    try {
                        uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads");
                        start = Date.now();
                        fs.accessSync(uploadDir, fs.constants.W_OK);
                        components.push({
                            name: "File Storage",
                            status: "operational",
                            uptime: uptimePercent,
                            responseTime: Date.now() - start
                        });
                    }
                    catch (_d) {
                        components.push({ name: "File Storage", status: "degraded", uptime: 0, responseTime: 0 });
                    }
                    // 6. Cache Layer - in-memory (always available if server is running)
                    components.push({
                        name: "Cache Layer",
                        status: "operational",
                        uptime: uptimePercent,
                        responseTime: 0
                    });
                    return [2 /*return*/, components];
            }
        });
    }); }),
    getMetrics: trpc_1.protectedProcedure
        .input(zod_1.z.object({ period: zod_1.z["enum"](["1h", "24h", "7d", "30d"]).optional()["default"]("24h") }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var period;
            return __generator(this, function (_b) {
                period = (input === null || input === void 0 ? void 0 : input.period) || "24h";
                return [2 /*return*/, metricsCollector_1.metricsCollector.getMetrics(period)];
            });
        });
    })
});
