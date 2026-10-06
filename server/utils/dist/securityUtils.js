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
exports.getSecurityStats = exports.getUserSecurityLogs = exports.isIPWhitelisted = exports.whitelistIP = exports.verifyEmailChangeToken = exports.createEmailVerificationToken = exports.generateVerificationToken = exports.logSecurityEvent = exports.clearFailedAttempts = exports.getAccountLockoutInfo = exports.isAccountLocked = exports.recordLoginAttempt = void 0;
var uuid_1 = require("uuid");
var db_1 = require("../db");
var crypto = require("crypto");
var drizzle_orm_1 = require("drizzle-orm");
var LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
var LOCKOUT_DURATION_MINUTES = 30;
/**
 * Record a login attempt (success or failure)
 */
function recordLoginAttempt(email, userId, success, ipAddress, userAgent) {
    return __awaiter(this, void 0, void 0, function () {
        var database, id, now, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/];
                    id = uuid_1.v4();
                    now = new Date();
                    return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      INSERT INTO login_attempts (id, userId, email, ipAddress, userAgent, success, attemptedAt)\n      VALUES (", ", ", ", ", ", ", ", ", ", ", ", ", ")\n    "], ["\n      INSERT INTO login_attempts (id, userId, email, ipAddress, userAgent, success, attemptedAt)\n      VALUES (", ", ", ", ", ", ", ", ", ", ", ", ", ")\n    "])), id, userId, email, ipAddress, userAgent || null, success ? 1 : 0, now))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error recording login attempt:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.recordLoginAttempt = recordLoginAttempt;
/**
 * Check if user account is locked
 */
function isAccountLocked(email) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, false];
        });
    });
}
exports.isAccountLocked = isAccountLocked;
/**
 * Get account lockout info
 */
function getAccountLockoutInfo(email) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, null];
        });
    });
}
exports.getAccountLockoutInfo = getAccountLockoutInfo;
/**
 * Clear failed login attempts for user
 */
function clearFailedAttempts(email) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
exports.clearFailedAttempts = clearFailedAttempts;
/**
 * Log security audit event
 */
function logSecurityEvent(userId, eventType, severity, description, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
exports.logSecurityEvent = logSecurityEvent;
/**
 * Generate email verification token
 */
function generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
}
exports.generateVerificationToken = generateVerificationToken;
/**
 * Create email verification request
 */
function createEmailVerificationToken(userId, newEmail) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, null];
        });
    });
}
exports.createEmailVerificationToken = createEmailVerificationToken;
/**
 * Verify email change token
 */
function verifyEmailChangeToken(token) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, null];
        });
    });
}
exports.verifyEmailChangeToken = verifyEmailChangeToken;
/**
 * Add IP to user's whitelist
 */
function whitelistIP(userId, ipAddress, description) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, false];
        });
    });
}
exports.whitelistIP = whitelistIP;
/**
 * Check if IP is whitelisted for user
 */
function isIPWhitelisted(userId, ipAddress) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, false];
        });
    });
}
exports.isIPWhitelisted = isIPWhitelisted;
/**
 * Get security audit logs for user
 */
function getUserSecurityLogs(userId, limit) {
    if (limit === void 0) { limit = 50; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, []];
        });
    });
}
exports.getUserSecurityLogs = getUserSecurityLogs;
/**
 * Get security stats
 */
function getSecurityStats() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Re-implement with Drizzle queries
            return [2 /*return*/, {
                    failedLoginsLast24h: 0,
                    criticalEventsLast24h: 0,
                    lockedAccountsCount: 0
                }];
        });
    });
}
exports.getSecurityStats = getSecurityStats;
var templateObject_1;
