"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.knowledgeBaseRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.knowledgeBaseRouter = trpc_1.router({
    // ── Categories ──
    listCategories: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, db.select().from(schema_1.kbCategories).orderBy(schema_1.kbCategories.sortOrder)];
            }
        });
    }); }),
    createCategory: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        slug: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        sortOrder: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.kbCategories).values(__assign({ id: id }, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    updateCategory: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        sortOrder: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        id = input.id, data = __rest(input, ["id"]);
                        return [4 /*yield*/, db.update(schema_1.kbCategories).set(data).where(drizzle_orm_1.eq(schema_1.kbCategories.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteCategory: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.kbArticles).where(drizzle_orm_1.eq(schema_1.kbArticles.categoryId, input.id))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.kbCategories).where(drizzle_orm_1.eq(schema_1.kbCategories.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Articles ──
    listArticles: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        categoryId: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        conditions = [];
                        if (input === null || input === void 0 ? void 0 : input.categoryId)
                            conditions.push(drizzle_orm_1.eq(schema_1.kbArticles.categoryId, input.categoryId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.kbArticles.status, input.status));
                        if (input === null || input === void 0 ? void 0 : input.search)
                            conditions.push(drizzle_orm_1.like(schema_1.kbArticles.title, "%" + input.search + "%"));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [2 /*return*/, db.select().from(schema_1.kbArticles).where(where).orderBy(drizzle_orm_1.desc(schema_1.kbArticles.createdAt))];
                }
            });
        });
    }),
    getArticle: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, article;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.kbArticles).where(drizzle_orm_1.eq(schema_1.kbArticles.id, input.id))];
                    case 2:
                        article = (_b.sent())[0];
                        if (!article) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.update(schema_1.kbArticles).set({ views: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), schema_1.kbArticles.views) }).where(drizzle_orm_1.eq(schema_1.kbArticles.id, input.id))];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, article || null];
                }
            });
        });
    }),
    createArticle: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        categoryId: zod_1.z.string(),
        title: zod_1.z.string().min(1),
        content: zod_1.z.string().optional(),
        excerpt: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        featured: zod_1.z.boolean().optional(),
        readTime: zod_1.z.number().optional(),
        tags: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.kbArticles).values(__assign(__assign({ id: id }, input), { createdBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id }))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    updateArticle: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        categoryId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        excerpt: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        featured: zod_1.z.boolean().optional(),
        readTime: zod_1.z.number().optional(),
        tags: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        id = input.id, data = __rest(input, ["id"]);
                        return [4 /*yield*/, db.update(schema_1.kbArticles).set(data).where(drizzle_orm_1.eq(schema_1.kbArticles.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteArticle: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.kbArticles).where(drizzle_orm_1.eq(schema_1.kbArticles.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
var templateObject_1;
