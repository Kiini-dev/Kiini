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
exports.createTierRateLimiter = exports.createGlobalRateLimiter = exports.getRateLimitStats = exports.getTierLimit = exports.invalidateOrgCache = exports.rateLimitConfig = exports.TIER_RATE_LIMITS = void 0;
/**
 * Shared rate limit configuration module.
 *
 * Exports:
 *  - TIER_RATE_LIMITS  — default per-tier request quotas
 *  - rateLimitConfig   — mutable global config (updated by ICT management UI)
 *  - createGlobalRateLimiter() — IP-based brute-force limiter using express-rate-limit
 *  - createTierRateLimiter()   — per-org async middleware that enforces tier quotas
 *  - getTierLimit()            — resolve effective limit for a tier (respects overrides)
 *  - getRateLimitStats()       — live stats from in-memory counters
 *  - invalidateOrgCache()      — flush cached user→org→tier lookups
 */
var express_rate_limit_1 = require("express-rate-limit");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
/** Default requests-per-window for each subscription tier (15-minute window). */
exports.TIER_RATE_LIMITS = {
    free: { requestsPerWindow: 300, windowMs: 15 * 60 * 1000, label: "Free" },
    trial: { requestsPerWindow: 500, windowMs: 15 * 60 * 1000, label: "Trial" },
    starter: { requestsPerWindow: 2000, windowMs: 15 * 60 * 1000, label: "Starter" },
    professional: { requestsPerWindow: 5000, windowMs: 15 * 60 * 1000, label: "Professional" },
    enterprise: { requestsPerWindow: 15000, windowMs: 15 * 60 * 1000, label: "Enterprise" },
    custom: { requestsPerWindow: 15000, windowMs: 15 * 60 * 1000, label: "Custom" }
};
// ---------------------------------------------------------------------------
// Mutable global config — updated at runtime by ICT Management UI
// ---------------------------------------------------------------------------
exports.rateLimitConfig = {
    /** Global IP-level ceiling per window (brute-force protection) */
    globalRequestsPerMinute: 5000,
    /** Per-user ceiling per minute (per-org tier limiter key unit) */
    perUserRequestsPerMinute: 60,
    burstLimit: 100,
    /** Sliding window length in ms shared by both limiters */
    windowMs: 15 * 60 * 1000,
    whitelistedIPs: [],
    enabled: true,
    /**
     * Per-tier overrides.
     * When set, these values replace the TIER_RATE_LIMITS defaults.
     */
    tierOverrides: {}
};
var userOrgCache = new Map();
var USER_CACHE_TTL_MS = 5 * 60 * 1000;
/** Flush cached user→org entries, optionally scoped to one orgId. */
function invalidateOrgCache(orgId) {
    if (orgId) {
        for (var _i = 0, _a = userOrgCache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            if (val.orgId === orgId)
                userOrgCache["delete"](key);
        }
    }
    else {
        userOrgCache.clear();
    }
}
exports.invalidateOrgCache = invalidateOrgCache;
function getUserOrgInfo(userId) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var now, cached, db, user, org, tier, result, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    now = Date.now();
                    cached = userOrgCache.get(userId);
                    if (cached && cached.expiresAt > now) {
                        return [2 /*return*/, { orgId: cached.orgId, tier: cached.tier }];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, db_1.getDb()];
                case 2:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, { orgId: "unknown", tier: "trial" }];
                    return [4 /*yield*/, db
                            .select({ organizationId: schema_1.users.organizationId })
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))
                            .limit(1)];
                case 3:
                    user = (_c.sent())[0];
                    if (!(user === null || user === void 0 ? void 0 : user.organizationId)) {
                        return [2 /*return*/, { orgId: "unknown", tier: "trial" }];
                    }
                    return [4 /*yield*/, db
                            .select({ plan: schema_1.organizations.plan })
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, user.organizationId))
                            .limit(1)];
                case 4:
                    org = (_c.sent())[0];
                    tier = (_a = org === null || org === void 0 ? void 0 : org.plan) !== null && _a !== void 0 ? _a : "trial";
                    result = { orgId: user.organizationId, tier: tier };
                    userOrgCache.set(userId, __assign(__assign({}, result), { expiresAt: now + USER_CACHE_TTL_MS }));
                    return [2 /*return*/, result];
                case 5:
                    _b = _c.sent();
                    return [2 /*return*/, { orgId: "unknown", tier: "trial" }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// JWT userId extraction (no signature verification — tRPC context does that)
// ---------------------------------------------------------------------------
function extractUserId(req) {
    var _a;
    try {
        var authHeader = req.headers["authorization"];
        var token = void 0;
        if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
        else {
            var cookieHeader = (_a = req.headers.cookie) !== null && _a !== void 0 ? _a : "";
            var match = cookieHeader.match(/app_session_id=([^;]+)/);
            token = match === null || match === void 0 ? void 0 : match[1];
        }
        if (!token)
            return null;
        var parts = token.split(".");
        if (parts.length !== 3)
            return null;
        var payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        return typeof (payload === null || payload === void 0 ? void 0 : payload.userId) === "string" ? payload.userId : null;
    }
    catch (_b) {
        return null;
    }
}
function getClientIP(req) {
    var _a, _b, _c;
    var fwd = req.headers["x-forwarded-for"];
    if (typeof fwd === "string")
        return fwd.split(",")[0].trim();
    return (_c = (_b = (_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) !== null && _b !== void 0 ? _b : req.ip) !== null && _c !== void 0 ? _c : "unknown";
}
var orgCounters = new Map();
var blockedRequestsCount = 0;
// Periodically purge stale counters (every 5 minutes)
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, _a = orgCounters.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], c = _b[1];
        if (now - c.windowStart > exports.rateLimitConfig.windowMs * 2) {
            orgCounters["delete"](key);
        }
    }
}, 5 * 60 * 1000).unref();
// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------
/** Resolve the effective per-window request limit for a given tier. */
function getTierLimit(tier) {
    var _a, _b;
    var override = exports.rateLimitConfig.tierOverrides[tier];
    if (override !== undefined)
        return override;
    return (_b = (_a = exports.TIER_RATE_LIMITS[tier]) === null || _a === void 0 ? void 0 : _a.requestsPerWindow) !== null && _b !== void 0 ? _b : exports.TIER_RATE_LIMITS.trial.requestsPerWindow;
}
exports.getTierLimit = getTierLimit;
/** Live stats from the in-memory counters. */
function getRateLimitStats() {
    var now = Date.now();
    var totalTracked = 0;
    var totalRequests = 0;
    var topEntries = [];
    for (var _i = 0, _a = orgCounters.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], counter = _b[1];
        if (now - counter.windowStart < exports.rateLimitConfig.windowMs) {
            totalTracked++;
            totalRequests += counter.count;
            topEntries.push({ key: key, count: counter.count });
        }
    }
    topEntries.sort(function (a, b) { return b.count - a.count; });
    return {
        totalTrackedUsers: totalTracked,
        totalRequestsLastMinute: totalRequests,
        topUsers: topEntries.slice(0, 10).map(function (e) { return ({
            userId: e.key,
            requests: e.count
        }); }),
        blockedRequests: blockedRequestsCount,
        timestamp: new Date().toISOString()
    };
}
exports.getRateLimitStats = getRateLimitStats;
// ---------------------------------------------------------------------------
// Middleware factories
// ---------------------------------------------------------------------------
/**
 * Global IP-based rate limiter (brute-force protection).
 * Uses express-rate-limit v7; reads from rateLimitConfig at call time.
 */
function createGlobalRateLimiter() {
    return express_rate_limit_1["default"]({
        windowMs: function () { return exports.rateLimitConfig.windowMs; },
        max: function (req) {
            if (!exports.rateLimitConfig.enabled)
                return 0; // 0 = unlimited in e-r-l v7
            var ip = getClientIP(req);
            if (exports.rateLimitConfig.whitelistedIPs.includes(ip))
                return 0;
            return exports.rateLimitConfig.globalRequestsPerMinute;
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: function (req) {
            if (req.path === "/health" || req.path === "/api/health")
                return true;
            return exports.rateLimitConfig.whitelistedIPs.includes(getClientIP(req));
        },
        handler: function (_req, res) {
            blockedRequestsCount++;
            res.status(429).json({
                error: {
                    code: "TOO_MANY_REQUESTS",
                    message: "Too many requests from this IP. Please try again later."
                }
            });
        }
    });
}
exports.createGlobalRateLimiter = createGlobalRateLimiter;
/**
 * Tier-aware per-org rate limiter.
 * Decodes the JWT userId, looks up org + plan (cached 5 min), then enforces
 * the tier's per-window quota with an in-memory sliding window counter.
 *
 * Mount this on /api/trpc (or the full app) after the global limiter.
 */
function createTierRateLimiter() {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var ip, now, userId, rateKey, limit, tierLabel, _a, orgId, tier, counter, remaining, resetAt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!exports.rateLimitConfig.enabled)
                        return [2 /*return*/, next()];
                    ip = getClientIP(req);
                    if (exports.rateLimitConfig.whitelistedIPs.includes(ip))
                        return [2 /*return*/, next()];
                    if (req.path === "/health" || req.path === "/api/health")
                        return [2 /*return*/, next()];
                    now = Date.now();
                    userId = extractUserId(req);
                    if (!userId) return [3 /*break*/, 2];
                    return [4 /*yield*/, getUserOrgInfo(userId)];
                case 1:
                    _a = _b.sent(), orgId = _a.orgId, tier = _a.tier;
                    rateKey = "org:" + orgId;
                    limit = getTierLimit(tier);
                    tierLabel = tier;
                    return [3 /*break*/, 3];
                case 2:
                    rateKey = "ip:" + ip;
                    limit = getTierLimit("free");
                    tierLabel = "free";
                    _b.label = 3;
                case 3:
                    counter = orgCounters.get(rateKey);
                    // Reset if window has expired
                    if (!counter || now - counter.windowStart >= exports.rateLimitConfig.windowMs) {
                        counter = { count: 0, windowStart: now };
                    }
                    counter.count++;
                    orgCounters.set(rateKey, counter);
                    remaining = Math.max(0, limit - counter.count);
                    resetAt = counter.windowStart + exports.rateLimitConfig.windowMs;
                    res.setHeader("X-RateLimit-Limit", limit);
                    res.setHeader("X-RateLimit-Remaining", remaining);
                    res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000));
                    if (counter.count > limit) {
                        blockedRequestsCount++;
                        return [2 /*return*/, res.status(429).json({
                                error: {
                                    code: "TIER_RATE_LIMIT_EXCEEDED",
                                    message: "API rate limit exceeded for your subscription tier. Please upgrade your plan or wait for the window to reset.",
                                    tier: tierLabel,
                                    retryAfter: Math.ceil((resetAt - now) / 1000)
                                }
                            })];
                    }
                    next();
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.createTierRateLimiter = createTierRateLimiter;
