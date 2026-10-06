"use strict";
/**
 * GDPR Consent Management Service
 * Handles user consent tracking and management
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
exports.revokeConsent = exports.getUserConsent = exports.recordConsent = exports.consentRecords = exports.ConsentType = void 0;
var uuid_1 = require("uuid");
var mysql_core_1 = require("drizzle-orm/mysql-core");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("../../db");
/**
 * Consent Types
 */
var ConsentType;
(function (ConsentType) {
    ConsentType["MARKETING"] = "marketing";
    ConsentType["ANALYTICS"] = "analytics";
    ConsentType["ESSENTIAL"] = "essential";
    ConsentType["THIRD_PARTY"] = "third_party";
    ConsentType["DATA_PROCESSING"] = "data_processing";
})(ConsentType = exports.ConsentType || (exports.ConsentType = {}));
/**
 * Consent Record Schema
 */
exports.consentRecords = mysql_core_1.mysqlTable("consentRecords", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    userId: mysql_core_1.varchar("userId", { length: 36 }).notNull(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }),
    consentType: mysql_core_1.varchar("consentType", { length: 50 }).notNull(),
    granted: mysql_core_1.boolean("granted").notNull(),
    consentVersion: mysql_core_1.varchar("consentVersion", { length: 20 }).notNull(),
    ipAddress: mysql_core_1.varchar("ipAddress", { length: 50 }),
    userAgent: mysql_core_1.text("userAgent"),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    expiresAt: mysql_core_1.datetime("expiresAt"),
    revokedAt: mysql_core_1.datetime("revokedAt")
}, function (table) { return ({
    userIdx: mysql_core_1.index("consent_user_idx").on(table.userId),
    typeIdx: mysql_core_1.index("consent_type_idx").on(table.consentType)
}); });
/**
 * Record user consent
 */
function recordConsent(userId, consentType, granted, options) {
    var _a, _b, _c;
    return __awaiter(this, void 0, Promise, function () {
        var db, expiresAt, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        console.warn("Database not available for consent recording");
                        return [2 /*return*/];
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    expiresAt = (options === null || options === void 0 ? void 0 : options.expirationDays) ? new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000)
                        : null;
                    return [4 /*yield*/, db.insert(exports.consentRecords).values({
                            id: uuid_1.v4(),
                            userId: userId,
                            organizationId: (_a = options === null || options === void 0 ? void 0 : options.organizationId) !== null && _a !== void 0 ? _a : null,
                            consentType: consentType,
                            granted: granted,
                            consentVersion: "1.0",
                            ipAddress: (_b = options === null || options === void 0 ? void 0 : options.ipAddress) !== null && _b !== void 0 ? _b : null,
                            userAgent: (_c = options === null || options === void 0 ? void 0 : options.userAgent) !== null && _c !== void 0 ? _c : null,
                            createdAt: new Date(),
                            expiresAt: expiresAt,
                            revokedAt: null
                        })];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error("Error recording consent:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.recordConsent = recordConsent;
/**
 * Get user consent status
 */
function getUserConsent(userId, consentType) {
    return __awaiter(this, void 0, Promise, function () {
        var db, query, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, []];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    query = db
                        .select()
                        .from(exports.consentRecords)
                        .where(drizzle_orm_1.eq(exports.consentRecords.userId, userId));
                    if (consentType) {
                        query = query.where(drizzle_orm_1.eq(exports.consentRecords.consentType, consentType));
                    }
                    return [4 /*yield*/, query.orderBy(drizzle_orm_1.desc(exports.consentRecords.createdAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error retrieving consent:", error_2);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserConsent = getUserConsent;
/**
 * Revoke consent
 */
function revokeConsent(userId, consentType) {
    return __awaiter(this, void 0, Promise, function () {
        var db, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.warn("Database not available for consent revocation");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .update(exports.consentRecords)
                            .set({ revokedAt: new Date() })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(exports.consentRecords.userId, userId), drizzle_orm_1.eq(exports.consentRecords.consentType, consentType)))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("Error revoking consent:", error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.revokeConsent = revokeConsent;
