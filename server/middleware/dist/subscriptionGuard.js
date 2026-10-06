"use strict";
/**
 * Subscription Guard
 * Checks whether an organization's subscription is active.
 * Results are cached for 60 seconds to avoid per-request DB hits.
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
exports.__esModule = true;
exports.checkOrgSubscription = exports.invalidateSubscriptionCache = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var CACHE_TTL_MS = 60000; // 60 seconds
var _cache = new Map();
/** Invalidate cached subscription status for an org (call after payment or status change). */
function invalidateSubscriptionCache(organizationId) {
    _cache["delete"](organizationId);
}
exports.invalidateSubscriptionCache = invalidateSubscriptionCache;
/**
 * Check if an organization's subscription allows service access.
 * Returns { active: true } when status is 'trial' or 'active' and not locked.
 * When no subscription record exists we allow access (graceful — new orgs may not have one yet).
 */
function checkOrgSubscription(organizationId) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var now, cached, db, rows, result_1, sub, isLocked, status, active, result, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    now = Date.now();
                    cached = _cache.get(organizationId);
                    if (cached && now - cached.checkedAt < CACHE_TTL_MS) {
                        return [2 /*return*/, cached.result];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, db_1.getDb()];
                case 2:
                    db = _c.sent();
                    if (!db) {
                        // DB unavailable — fail open so a connectivity blip doesn't lock everyone out
                        return [2 /*return*/, { active: true, status: "unknown", isLocked: false, renewalDate: null }];
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, organizationId))
                            .orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))
                            .limit(1)];
                case 3:
                    rows = _c.sent();
                    if (rows.length === 0) {
                        result_1 = { active: true, status: "none", isLocked: false, renewalDate: null };
                        _cache.set(organizationId, { result: result_1, checkedAt: now });
                        return [2 /*return*/, result_1];
                    }
                    sub = rows[0];
                    isLocked = sub.isLocked === 1 || sub.isLocked === true;
                    status = (_a = sub.status) !== null && _a !== void 0 ? _a : "unknown";
                    active = (status === "trial" || status === "active") && !isLocked;
                    result = {
                        active: active,
                        status: status,
                        isLocked: isLocked,
                        renewalDate: (_b = sub.renewalDate) !== null && _b !== void 0 ? _b : null
                    };
                    _cache.set(organizationId, { result: result, checkedAt: now });
                    return [2 /*return*/, result];
                case 4:
                    err_1 = _c.sent();
                    console.error("[SubscriptionGuard] DB error during check:", err_1);
                    // Fail open on unexpected DB errors
                    return [2 /*return*/, { active: true, status: "error", isLocked: false, renewalDate: null }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.checkOrgSubscription = checkOrgSubscription;
