"use strict";
/**
 * Version Control Router
 * Tracks document version history using the documentVersions table.
 */
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
exports.versionControlRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('documents:view');
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('documents:edit');
exports.versionControlRouter = trpc_1.router({
    /** List all document versions, optionally filtered by documentId */
    list: viewProcedure
        .input(zod_1.z.object({
        documentId: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](50),
        offset: zod_1.z.number().min(0)["default"](0)
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, rows, _b, totalResult, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            return [2 /*return*/, { versions: [], total: 0 }];
                        conditions = [];
                        if (input === null || input === void 0 ? void 0 : input.documentId)
                            conditions.push(drizzle_orm_1.eq(schema_1.documentVersions.documentId, input.documentId));
                        if (!(conditions.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.documentVersions).where(drizzle_orm_1.and.apply(void 0, conditions)).orderBy(drizzle_orm_1.desc(schema_1.documentVersions.createdAt)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        _b = _e.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.documentVersions).orderBy(drizzle_orm_1.desc(schema_1.documentVersions.createdAt)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 4:
                        _b = _e.sent();
                        _e.label = 5;
                    case 5:
                        rows = _b;
                        if (!(conditions.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.documentVersions).where(drizzle_orm_1.and.apply(void 0, conditions))];
                    case 6:
                        _c = _e.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.documentVersions)];
                    case 8:
                        _c = _e.sent();
                        _e.label = 9;
                    case 9:
                        totalResult = _c;
                        return [2 /*return*/, {
                                versions: rows,
                                total: ((_d = totalResult[0]) === null || _d === void 0 ? void 0 : _d.total) || 0
                            }];
                }
            });
        });
    }),
    /** Get a single version by ID */
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.documentVersions).where(drizzle_orm_1.eq(schema_1.documentVersions.id, input)).limit(1)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    /** Get stats: total versions, total storage, unique documents */
    getStats: viewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, stats, latest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { totalVersions: 0, totalStorage: 0, uniqueDocuments: 0, latestVersion: null }];
                    return [4 /*yield*/, db.select({
                            totalVersions: drizzle_orm_1.count(),
                            totalStorage: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COALESCE(SUM(fileSize), 0)"], ["COALESCE(SUM(fileSize), 0)"]))),
                            uniqueDocuments: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COUNT(DISTINCT documentId)"], ["COUNT(DISTINCT documentId)"])))
                        }).from(schema_1.documentVersions)];
                case 2:
                    stats = (_a.sent())[0];
                    return [4 /*yield*/, db.select().from(schema_1.documentVersions).orderBy(drizzle_orm_1.desc(schema_1.documentVersions.createdAt)).limit(1)];
                case 3:
                    latest = _a.sent();
                    return [2 /*return*/, {
                            totalVersions: (stats === null || stats === void 0 ? void 0 : stats.totalVersions) || 0,
                            totalStorage: (stats === null || stats === void 0 ? void 0 : stats.totalStorage) || 0,
                            uniqueDocuments: (stats === null || stats === void 0 ? void 0 : stats.uniqueDocuments) || 0,
                            latestVersion: latest[0] || null
                        }];
            }
        });
    }); }),
    /** Create a new version entry */
    create: editProcedure
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        fileUrl: zod_1.z.string(),
        fileSize: zod_1.z.number().optional(),
        changeNotes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, nextVersion, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.select({ maxVersion: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COALESCE(MAX(versionNumber), 0)"], ["COALESCE(MAX(versionNumber), 0)"]))) })
                                .from(schema_1.documentVersions)
                                .where(drizzle_orm_1.eq(schema_1.documentVersions.documentId, input.documentId))];
                    case 2:
                        existing = _c.sent();
                        nextVersion = (((_b = existing[0]) === null || _b === void 0 ? void 0 : _b.maxVersion) || 0) + 1;
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.documentVersions).values({
                                id: id,
                                documentId: input.documentId,
                                versionNumber: nextVersion,
                                fileUrl: input.fileUrl,
                                fileSize: input.fileSize || 0,
                                uploadedBy: ctx.user.id,
                                changeNotes: input.changeNotes || null
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'version_created',
                                entityType: 'document_version',
                                entityId: id,
                                description: "Created version " + nextVersion + " for document " + input.documentId
                            })];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { id: id, versionNumber: nextVersion }];
                }
            });
        });
    }),
    /** Delete a version */
    "delete": editProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db["delete"](schema_1.documentVersions).where(drizzle_orm_1.eq(schema_1.documentVersions.id, input))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'version_deleted',
                                entityType: 'document_version',
                                entityId: input,
                                description: "Deleted version " + input
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3;
