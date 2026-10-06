"use strict";
/**
 * Analytics Utility
 * Centralized analytics tracking for mobile app
 */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.analytics = void 0;
var async_storage_1 = require("@react-native-async-storage/async-storage");
var AnalyticsService = /** @class */ (function () {
    function AnalyticsService() {
        var _this = this;
        this.events = [];
        this.batchSize = 10;
        this.flushInterval = 60000; // 1 minute
        // Auto-flush events periodically
        setInterval(function () { return _this.flush(); }, this.flushInterval);
    }
    AnalyticsService.prototype.track = function (name, properties) {
        if (properties === void 0) { properties = {}; }
        var event = {
            name: name,
            properties: properties,
            timestamp: Date.now()
        };
        this.events.push(event);
        // Flush when batch size reached
        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    };
    AnalyticsService.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var batch, stored, queue, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.events.length === 0)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        batch = __spreadArrays(this.events);
                        this.events = [];
                        return [4 /*yield*/, async_storage_1["default"].getItem("analytics_queue")];
                    case 2:
                        stored = _a.sent();
                        queue = stored ? JSON.parse(stored) : [];
                        queue.push.apply(queue, batch);
                        return [4 /*yield*/, async_storage_1["default"].setItem("analytics_queue", JSON.stringify(queue))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error flushing analytics:", error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AnalyticsService.prototype.sendPendingEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stored, queue, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, async_storage_1["default"].getItem("analytics_queue")];
                    case 1:
                        stored = _a.sent();
                        if (!stored)
                            return [2 /*return*/];
                        queue = JSON.parse(stored);
                        // TODO: Send to analytics server
                        // await api.post("/analytics/events", { events: queue });
                        return [4 /*yield*/, async_storage_1["default"].removeItem("analytics_queue")];
                    case 2:
                        // TODO: Send to analytics server
                        // await api.post("/analytics/events", { events: queue });
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error sending pending analytics:", error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AnalyticsService;
}());
exports.analytics = new AnalyticsService();
