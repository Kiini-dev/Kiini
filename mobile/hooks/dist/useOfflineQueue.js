"use strict";
/**
 * useOfflineQueue Hook
 * Manages offline requests that will be synced when connection is restored
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
exports.useOfflineQueue = void 0;
var react_1 = require("react");
var netinfo_1 = require("@react-native-community/netinfo");
var async_storage_1 = require("@react-native-async-storage/async-storage");
var QUEUE_STORAGE_KEY = "offline_queue";
function useOfflineQueue() {
    var _a = react_1.useState(true), isOnline = _a[0], setIsOnline = _a[1];
    var _b = react_1.useState([]), queue = _b[0], setQueue = _b[1];
    // Monitor connection status
    react_1.useEffect(function () {
        var unsubscribe = netinfo_1["default"].addEventListener(function (state) {
            var _a;
            setIsOnline((_a = state.isConnected) !== null && _a !== void 0 ? _a : true);
        });
        return unsubscribe;
    }, []);
    // Load queue from storage
    react_1.useEffect(function () {
        function loadQueue() {
            return __awaiter(this, void 0, void 0, function () {
                var stored, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, async_storage_1["default"].getItem(QUEUE_STORAGE_KEY)];
                        case 1:
                            stored = _a.sent();
                            if (stored) {
                                setQueue(JSON.parse(stored));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error("Error loading queue:", error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        loadQueue();
    }, []);
    // Save queue to storage
    react_1.useEffect(function () {
        function saveQueue() {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, async_storage_1["default"].setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            console.error("Error saving queue:", error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        saveQueue();
    }, [queue]);
    var addToQueue = react_1.useCallback(function (method, endpoint, data) {
        var request = {
            id: Date.now() + "-" + Math.random(),
            method: method,
            endpoint: endpoint,
            data: data,
            timestamp: Date.now()
        };
        setQueue(function (prev) { return __spreadArrays(prev, [request]); });
        return request.id;
    }, []);
    var removeFromQueue = react_1.useCallback(function (id) {
        setQueue(function (prev) { return prev.filter(function (req) { return req.id !== id; }); });
    }, []);
    var clearQueue = react_1.useCallback(function () {
        setQueue([]);
    }, []);
    return {
        isOnline: isOnline,
        queue: queue,
        addToQueue: addToQueue,
        removeFromQueue: removeFromQueue,
        clearQueue: clearQueue
    };
}
exports.useOfflineQueue = useOfflineQueue;
