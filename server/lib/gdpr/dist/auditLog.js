"use strict";
/**
 * GDPR Audit & Compliance Logger
 * Tracks all data processing activities for compliance
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
exports.generateComplianceReport = exports.getComplianceAuditTrail = exports.logDataProcessing = exports.dataProcessingLog = void 0;
var uuid_1 = require("uuid");
var mysql_core_1 = require("drizzle-orm/mysql-core");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("../../db");
/**
 * Data Processing Activity Schema
 */
exports.dataProcessingLog = mysql_core_1.mysqlTable("dataProcessingLog", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    userId: mysql_core_1.varchar("userId", { length: 36 }).notNull(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    activityType: mysql_core_1.varchar("activityType", { length: 50 }).notNull(),
    dataCategories: mysql_core_1.text("dataCategories"),
    purpose: mysql_core_1.text("purpose"),
    processor: mysql_core_1.varchar("processor", { length: 255 }),
    completedAt: mysql_core_1.datetime("completedAt"),
    status: mysql_core_1.varchar("status", { length: 20 }).notNull(),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.datetime("createdAt").notNull()
}, function (table) { return ({
    userIdx: mysql_core_1.index("dpl_user_idx").on(table.userId),
    orgIdx: mysql_core_1.index("dpl_org_idx").on(table.organizationId),
    typeIdx: mysql_core_1.index("dpl_type_idx").on(table.activityType),
    createdAtIdx: mysql_core_1.index("dpl_created_idx").on(table.createdAt)
}); });
/**
 * Log data processing activity
 */
function logDataProcessing(userId, organizationId, activityType, options) {
    var _a, _b, _c;
    return __awaiter(this, void 0, Promise, function () {
        var activityId, db, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    activityId = uuid_1.v4();
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        console.warn("GDPR audit logger: no database available");
                        return [2 /*return*/, activityId];
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.insert(exports.dataProcessingLog).values({
                            id: activityId,
                            userId: userId,
                            organizationId: organizationId,
                            activityType: activityType,
                            dataCategories: JSON.stringify((options === null || options === void 0 ? void 0 : options.dataCategories) || []),
                            purpose: (_a = options === null || options === void 0 ? void 0 : options.purpose) !== null && _a !== void 0 ? _a : null,
                            processor: (_b = options === null || options === void 0 ? void 0 : options.processor) !== null && _b !== void 0 ? _b : null,
                            completedAt: new Date(),
                            status: "completed",
                            notes: (_c = options === null || options === void 0 ? void 0 : options.notes) !== null && _c !== void 0 ? _c : null,
                            createdAt: new Date()
                        })];
                case 3:
                    _d.sent();
                    return [2 /*return*/, activityId];
                case 4:
                    error_1 = _d.sent();
                    console.error("Error logging data processing activity:", error_1);
                    return [2 /*return*/, activityId];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.logDataProcessing = logDataProcessing;
/**
 * Get compliance audit trail
 */
function getComplianceAuditTrail(organizationId, options) {
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
                        .from(exports.dataProcessingLog)
                        .where(drizzle_orm_1.eq(exports.dataProcessingLog.organizationId, organizationId));
                    if (options === null || options === void 0 ? void 0 : options.activityType) {
                        query = query.where(drizzle_orm_1.eq(exports.dataProcessingLog.activityType, options.activityType));
                    }
                    if (options === null || options === void 0 ? void 0 : options.startDate) {
                        query = query.where(drizzle_orm_1.gte(exports.dataProcessingLog.createdAt, options.startDate));
                    }
                    if (options === null || options === void 0 ? void 0 : options.endDate) {
                        query = query.where(drizzle_orm_1.lte(exports.dataProcessingLog.createdAt, options.endDate));
                    }
                    return [4 /*yield*/, query.orderBy(drizzle_orm_1.desc(exports.dataProcessingLog.createdAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error retrieving audit trail:", error_2);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getComplianceAuditTrail = getComplianceAuditTrail;
/**
 * Generate GDPR compliance report
 */
function generateComplianceReport(organizationId, auditTrail) {
    return {
        organizationId: organizationId,
        generatedAt: new Date().toISOString(),
        activitiesLogged: auditTrail.length,
        dataExports: auditTrail.filter(function (a) { return a.activityType === "export"; }).length,
        dataDeletions: auditTrail.filter(function (a) {
            return a.activityType === "deletion";
        }).length,
        consentRecords: auditTrail.filter(function (a) { return a.activityType === "consent"; }).length
    };
}
exports.generateComplianceReport = generateComplianceReport;
