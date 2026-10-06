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
exports.createMonitoringService = exports.MonitoringService = void 0;
/**
 * MonitoringService - Centralized monitoring, observability, and health checks
 * Integrates with APM providers and logging services
 */
var MonitoringService = /** @class */ (function () {
    function MonitoringService(config) {
        if (config === void 0) { config = {}; }
        this.activeSpans = new Map();
        this.metrics = [];
        this.config = __assign({ enabled: true, apmProvider: 'none', logProvider: 'console', metricsInterval: 60, traceEnabled: true, traceSampleRate: 0.1 }, config);
        this.initialize();
    }
    MonitoringService.prototype.initialize = function () {
        if (!this.config.enabled)
            return;
        // Initialize APM provider
        switch (this.config.apmProvider) {
            case 'newrelic':
                this.initializeNewRelic();
                break;
            case 'datadog':
                this.initializeDatadog();
                break;
            case 'elastic':
                this.initializeElastic();
                break;
        }
        // Start metrics collection
        this.startMetricsCollection();
    };
    MonitoringService.prototype.initializeNewRelic = function () {
        try {
            // New Relic APM initialization
            console.log('[Monitoring] Initializing New Relic APM');
            // require('newrelic'); // This should be loaded at app startup
        }
        catch (error) {
            console.error('Failed to initialize New Relic:', error);
        }
    };
    MonitoringService.prototype.initializeDatadog = function () {
        try {
            // Datadog APM initialization
            console.log('[Monitoring] Initializing Datadog APM');
            // require('dd-trace').init(); // Should be done at app startup
        }
        catch (error) {
            console.error('Failed to initialize Datadog:', error);
        }
    };
    MonitoringService.prototype.initializeElastic = function () {
        try {
            // Elastic APM initialization
            console.log('[Monitoring] Initializing Elastic APM');
            // require('elastic-apm-node').start(); // Should be done at app startup
        }
        catch (error) {
            console.error('Failed to initialize Elastic APM:', error);
        }
    };
    /**
     * Start distributed trace span
     */
    MonitoringService.prototype.startSpan = function (name, attributes) {
        if (attributes === void 0) { attributes = {}; }
        if (!this.config.traceEnabled) {
            return this.createDummySpan(name);
        }
        // Sample traces based on configuration
        if (Math.random() > this.config.traceSampleRate) {
            return this.createDummySpan(name);
        }
        var span = {
            traceId: this.generateTraceId(),
            spanId: this.generateSpanId(),
            name: name,
            startTime: new Date(),
            attributes: attributes,
            events: [],
            status: 'ok'
        };
        this.activeSpans.set(span.spanId, span);
        return span;
    };
    /**
     * End trace span
     */
    MonitoringService.prototype.endSpan = function (span, status) {
        if (status === void 0) { status = 'ok'; }
        if (!span.spanId || !this.activeSpans.has(span.spanId))
            return;
        var activeSpan = this.activeSpans.get(span.spanId);
        activeSpan.endTime = new Date();
        activeSpan.duration = activeSpan.endTime.getTime() - activeSpan.startTime.getTime();
        activeSpan.status = status;
        this.activeSpans["delete"](span.spanId);
        // Send to APM provider
        this.sendTraceToAPM(activeSpan);
    };
    /**
     * Add event to span
     */
    MonitoringService.prototype.addSpanEvent = function (span, eventName, attributes) {
        if (attributes === void 0) { attributes = {}; }
        if (!this.activeSpans.has(span.spanId))
            return;
        this.activeSpans.get(span.spanId).events.push({
            name: eventName,
            timestamp: new Date(),
            attributes: attributes
        });
    };
    /**
     * Record a metric
     */
    MonitoringService.prototype.recordMetric = function (name, value, tags) {
        if (tags === void 0) { tags = {}; }
        var metric = {
            name: name,
            value: value,
            timestamp: new Date(),
            tags: tags
        };
        this.metrics.push(metric);
        // Send to metrics provider
        this.sendMetric(metric);
    };
    /**
     * Record operation duration
     */
    MonitoringService.prototype.recordOperationDuration = function (operationName, durationMs, tags) {
        if (tags === void 0) { tags = {}; }
        this.recordMetric("operation.duration", durationMs, __assign({ operation: operationName }, tags));
    };
    /**
     * Perform health check
     */
    MonitoringService.prototype.performHealthCheck = function () {
        return __awaiter(this, void 0, Promise, function () {
            var result, _a, _b, checksArray;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = {
                            status: 'healthy',
                            timestamp: new Date()
                        };
                        _b = {};
                        return [4 /*yield*/, this.checkDatabase()];
                    case 1:
                        _b.database = _c.sent();
                        return [4 /*yield*/, this.checkCache()];
                    case 2:
                        _b.cache = _c.sent();
                        return [4 /*yield*/, this.checkExternalAPIs()];
                    case 3:
                        _b.externalAPIs = _c.sent();
                        return [4 /*yield*/, this.checkDiskSpace()];
                    case 4:
                        _b.diskSpace = _c.sent();
                        return [4 /*yield*/, this.checkMemory()];
                    case 5:
                        _b.memory = _c.sent();
                        return [4 /*yield*/, this.checkCPU()];
                    case 6:
                        result = (_a.checks = (_b.cpu = _c.sent(),
                            _b),
                            _a.alerts = [],
                            _a);
                        checksArray = Object.values(result.checks);
                        if (checksArray.some(function (c) { return c.status === 'unhealthy'; })) {
                            result.status = 'unhealthy';
                            result.alerts = result.alerts || [];
                            result.alerts.push({
                                level: 'critical',
                                message: 'One or more critical services are unhealthy'
                            });
                        }
                        else if (checksArray.some(function (c) { return c.status === 'degraded'; })) {
                            result.status = 'degraded';
                            result.alerts = result.alerts || [];
                            result.alerts.push({
                                level: 'warning',
                                message: 'Some services are operating in degraded mode'
                            });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    MonitoringService.prototype.checkDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, responseTime;
            return __generator(this, function (_a) {
                startTime = Date.now();
                try {
                    responseTime = Date.now() - startTime;
                    return [2 /*return*/, { status: 'healthy', responseTime: responseTime }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            status: 'unhealthy',
                            responseTime: Date.now() - startTime,
                            error: error.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.checkCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, responseTime;
            return __generator(this, function (_a) {
                startTime = Date.now();
                try {
                    responseTime = Date.now() - startTime;
                    return [2 /*return*/, { status: 'healthy', responseTime: responseTime }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            status: 'degraded',
                            responseTime: Date.now() - startTime,
                            error: error.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.checkExternalAPIs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, responseTime;
            return __generator(this, function (_a) {
                startTime = Date.now();
                try {
                    responseTime = Date.now() - startTime;
                    return [2 /*return*/, { status: 'healthy', responseTime: responseTime }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            status: 'degraded',
                            responseTime: Date.now() - startTime,
                            error: error.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.checkDiskSpace = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Check available disk space
                    // Use os.statfs or similar
                    return [2 /*return*/, {
                            status: 'healthy',
                            available: 1000000,
                            used: 500000
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            status: 'degraded',
                            available: 0,
                            used: 0
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.checkMemory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var usage, usagePercent;
            return __generator(this, function (_a) {
                try {
                    usage = process.memoryUsage();
                    usagePercent = (usage.heapUsed / usage.heapTotal) * 100;
                    return [2 /*return*/, {
                            status: usagePercent > 90 ? 'unhealthy' : usagePercent > 75 ? 'degraded' : 'healthy',
                            usagePercent: Math.round(usagePercent)
                        }];
                }
                catch (error) {
                    return [2 /*return*/, { status: 'degraded', usagePercent: 0 }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.checkCPU = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Get CPU usage from os module or process metrics
                    // Simple placeholder
                    return [2 /*return*/, { status: 'healthy', usagePercent: 45 }];
                }
                catch (error) {
                    return [2 /*return*/, { status: 'degraded', usagePercent: 0 }];
                }
                return [2 /*return*/];
            });
        });
    };
    MonitoringService.prototype.sendMetric = function (metric) {
        if (this.config.logProvider === 'datadog') {
            console.log("[Datadog] Metric: " + metric.name + "=" + metric.value, metric.tags);
        }
        else if (this.config.logProvider === 'console') {
            console.log("[Metric] " + metric.name + "=" + metric.value, metric.tags);
        }
    };
    MonitoringService.prototype.sendTraceToAPM = function (span) {
        if (this.config.apmProvider === 'newrelic') {
            console.log("[NewRelic] Trace: " + span.name + " (" + span.duration + "ms)");
        }
        else if (this.config.apmProvider === 'datadog') {
            console.log("[Datadog] Trace: " + span.name + " (" + span.duration + "ms)");
        }
    };
    MonitoringService.prototype.createDummySpan = function (name) {
        return {
            traceId: '',
            spanId: '',
            name: name,
            startTime: new Date(),
            attributes: {},
            events: [],
            status: 'ok'
        };
    };
    MonitoringService.prototype.generateTraceId = function () {
        return 'trace-' + Math.random().toString(36).substr(2, 16);
    };
    MonitoringService.prototype.generateSpanId = function () {
        return 'span-' + Math.random().toString(36).substr(2, 16);
    };
    MonitoringService.prototype.startMetricsCollection = function () {
        var _this = this;
        setInterval(function () {
            // Collect and aggregate metrics
            _this.recordMetric('app.active_spans', _this.activeSpans.size);
            _this.recordMetric('app.metrics_queued', _this.metrics.length);
        }, this.config.metricsInterval * 1000);
    };
    return MonitoringService;
}());
exports.MonitoringService = MonitoringService;
exports.createMonitoringService = function (config) {
    return new MonitoringService(config);
};
