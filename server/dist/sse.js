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
exports.sseHandler = exports.notifyUser = exports.notifyOrg = void 0;
var sdk_1 = require("./_core/sdk");
// ─── Per-org subscriber registry ───────────────────────────────────────────
// Key: organizationId (stringified) OR "user_<userId>" for platform-level users
var sseClients = new Map();
function addClient(orgId, res) {
    if (!sseClients.has(orgId))
        sseClients.set(orgId, new Set());
    sseClients.get(orgId).add(res);
}
function removeClient(orgId, res) {
    var _a, _b;
    (_a = sseClients.get(orgId)) === null || _a === void 0 ? void 0 : _a["delete"](res);
    if (((_b = sseClients.get(orgId)) === null || _b === void 0 ? void 0 : _b.size) === 0)
        sseClients["delete"](orgId);
}
// ─── Emitters ───────────────────────────────────────────────────────────────
/**
 * Send a notification to all connected clients in an org.
 * Safe to call from any tRPC router after a mutation.
 */
function notifyOrg(orgId, event) {
    var key = String(orgId);
    var clients = sseClients.get(key);
    if (!clients || clients.size === 0)
        return;
    var payload = "data: " + JSON.stringify(event) + "\n\n";
    for (var _i = 0, clients_1 = clients; _i < clients_1.length; _i++) {
        var res = clients_1[_i];
        try {
            res.write(payload);
        }
        catch (_a) {
            // client disconnected mid-write; cleanup is handled by the 'close' event
        }
    }
}
exports.notifyOrg = notifyOrg;
/**
 * Send a notification to a specific user by their user ID.
 * Used for users who have no organizationId (e.g. platform admins).
 */
function notifyUser(userId, event) {
    notifyOrg("user_" + userId, event);
}
exports.notifyUser = notifyUser;
// ─── Express route handler ──────────────────────────────────────────────────
/**
 * Register this BEFORE tRPC middleware in the main server file:
 *   app.get('/api/sse/notifications', sseHandler);
 */
function sseHandler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var queryToken, user, syntheticReq, error_1, orgId, sock, heartbeat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryToken = typeof req.query.token === "string" ? req.query.token : null;
                    user = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!queryToken) return [3 /*break*/, 3];
                    syntheticReq = __assign(__assign({}, req), { headers: __assign(__assign({}, req.headers), { authorization: "Bearer " + queryToken }) });
                    return [4 /*yield*/, sdk_1.sdk.authenticateRequest(syntheticReq)];
                case 2:
                    user = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, sdk_1.sdk.authenticateRequest(req)];
                case 4:
                    user = _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.warn("[SSE] Auth error:", error_1 instanceof Error ? error_1.message : String(error_1));
                    return [3 /*break*/, 7];
                case 7:
                    if (!user) {
                        console.warn("[SSE] Unauthorized connection attempt");
                        res.status(401).json({ error: "Unauthorized" });
                        return [2 /*return*/];
                    }
                    orgId = user.organizationId
                        ? String(user.organizationId)
                        : "user_" + user.id;
                    // ── SSE headers ───────────────────────────────────────────────────────────
                    res.setHeader("Content-Type", "text/event-stream");
                    res.setHeader("Cache-Control", "no-cache, no-transform");
                    res.setHeader("Connection", "keep-alive");
                    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
                    sock = req.socket;
                    if (sock) {
                        sock.setTimeout(0);
                        sock.setNoDelay(true);
                        sock.setKeepAlive(true, 0);
                    }
                    res.flushHeaders();
                    // Send initial connection acknowledgement with retry hint
                    res.write("retry: 5000\ndata: " + JSON.stringify({
                        id: "init-" + Date.now(),
                        type: "info",
                        title: "Connected",
                        body: "Real-time notifications active",
                        timestamp: new Date().toISOString()
                    }) + "\n\n");
                    // Register client
                    addClient(orgId, res);
                    heartbeat = setInterval(function () {
                        try {
                            res.write(": heartbeat\n\n");
                        }
                        catch (_a) {
                            clearInterval(heartbeat);
                        }
                    }, 15000);
                    // Clean up when client disconnects
                    req.on("close", function () {
                        clearInterval(heartbeat);
                        removeClient(orgId, res);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.sseHandler = sseHandler;
