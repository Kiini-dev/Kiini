"use strict";
/**
 * GDPR Compliance Data Export Service
 * Handles user data export for GDPR compliance
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
exports.generateExportFile = exports.getUserDataExport = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../../drizzle/schema");
var schema_extended_1 = require("../../../drizzle/schema-extended");
var db_1 = require("../../db");
function getUserDataExport(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, user, userOrganizations, orgIds, orgs, _a, userInvoices, _b, userProjects, _c, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        throw new Error("Database connection required for data export");
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 14, , 15]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))
                            .then(function (results) { return results[0]; })];
                case 3:
                    user = _d.sent();
                    if (!user) {
                        throw new Error("User not found");
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_extended_1.organizationMembers)
                            .where(drizzle_orm_1.eq(schema_extended_1.organizationMembers.userId, userId))];
                case 4:
                    userOrganizations = _d.sent();
                    orgIds = userOrganizations.map(function (m) { return m.organizationId; });
                    if (!orgIds.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.inArray(schema_1.organizations.id, orgIds))];
                case 5:
                    _a = _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = [];
                    _d.label = 7;
                case 7:
                    orgs = _a;
                    if (!orgIds.length) return [3 /*break*/, 9];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.inArray(schema_1.invoices.organizationId, orgIds))];
                case 8:
                    _b = _d.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _b = [];
                    _d.label = 10;
                case 10:
                    userInvoices = _b;
                    if (!orgIds.length) return [3 /*break*/, 12];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.projects)
                            .where(drizzle_orm_1.inArray(schema_1.projects.organizationId, orgIds))];
                case 11:
                    _c = _d.sent();
                    return [3 /*break*/, 13];
                case 12:
                    _c = [];
                    _d.label = 13;
                case 13:
                    userProjects = _c;
                    return [2 /*return*/, {
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt
                            },
                            organizations: orgs.map(function (org) { return ({
                                id: org.id,
                                name: org.name,
                                slug: org.slug,
                                tier: org.tier
                            }); }),
                            invoices: userInvoices.map(function (inv) { return ({
                                id: inv.id,
                                number: inv.invoiceNo,
                                date: inv.invoiceDate,
                                amount: inv.total
                            }); }),
                            projects: userProjects.map(function (proj) { return ({
                                id: proj.id,
                                name: proj.name,
                                status: proj.status,
                                createdAt: proj.createdAt
                            }); }),
                            activityLog: [],
                            exportDate: new Date().toISOString()
                        }];
                case 14:
                    error_1 = _d.sent();
                    console.error("Error exporting user data:", error_1);
                    throw error_1;
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.getUserDataExport = getUserDataExport;
/**
 * Generate downloadable export file
 */
function generateExportFile(data) {
    var filename = "data-export-" + data.user.id + "-" + Date.now() + ".json";
    var content = JSON.stringify(data, null, 2);
    return { content: content, filename: filename };
}
exports.generateExportFile = generateExportFile;
