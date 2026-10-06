"use strict";
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
exports.proposalsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var document_numbering_1 = require("../utils/document-numbering");
function generateNextProposalNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, document_numbering_1.generateNextDocumentNumber(db, "proposal")];
        });
    });
}
var createProcedure = trpc_1.createFeatureRestrictedProcedure("proposals:create");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("proposals:read");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("proposals:update");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("proposals:delete");
exports.proposalsRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.proposals)
                                .orderBy(drizzle_orm_1.desc(schema_1.proposals.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.proposals).where(drizzle_orm_1.eq(schema_1.proposals.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    getNextProposalNumber: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextProposalNumber(db)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { proposalNumber: nextNumber }];
            }
        });
    }); }),
    create: createProcedure
        .input(zod_1.z.object({
        proposalNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['draft', 'sent', 'accepted', 'rejected']).optional(),
        issueDate: zod_1.z.string(),
        expiryDate: zod_1.z.string().optional(),
        subtotal: zod_1.z.number(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, now, proposalNumber;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        proposalNumber = input.proposalNumber;
                        if (!!proposalNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextProposalNumber(db)];
                    case 2:
                        proposalNumber = _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, db.insert(schema_1.proposals).values({
                            id: id,
                            proposalNumber: proposalNumber,
                            clientId: input.clientId,
                            title: input.title || null,
                            status: input.status || 'draft',
                            issueDate: new Date(input.issueDate).toISOString().replace('T', ' ').substring(0, 19),
                            expiryDate: input.expiryDate ? new Date(input.expiryDate).toISOString().replace('T', ' ').substring(0, 19) : null,
                            subtotal: input.subtotal,
                            taxAmount: input.taxAmount || 0,
                            discountAmount: input.discountAmount || 0,
                            total: input.total,
                            notes: input.notes || null,
                            createdBy: ctx.user.id,
                            createdAt: now,
                            updatedAt: now
                        })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id, proposalNumber: proposalNumber }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        clientId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['draft', 'sent', 'accepted', 'rejected']).optional(),
        issueDate: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().optional(),
        subtotal: zod_1.z.number().optional(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, now, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        updateData = { updatedAt: now };
                        if (data.clientId !== undefined)
                            updateData.clientId = data.clientId;
                        if (data.title !== undefined)
                            updateData.title = data.title;
                        if (data.status !== undefined)
                            updateData.status = data.status;
                        if (data.issueDate !== undefined)
                            updateData.issueDate = new Date(data.issueDate).toISOString().replace('T', ' ').substring(0, 19);
                        if (data.expiryDate !== undefined)
                            updateData.expiryDate = new Date(data.expiryDate).toISOString().replace('T', ' ').substring(0, 19);
                        if (data.subtotal !== undefined)
                            updateData.subtotal = data.subtotal;
                        if (data.taxAmount !== undefined)
                            updateData.taxAmount = data.taxAmount;
                        if (data.discountAmount !== undefined)
                            updateData.discountAmount = data.discountAmount;
                        if (data.total !== undefined)
                            updateData.total = data.total;
                        if (data.notes !== undefined)
                            updateData.notes = data.notes;
                        return [4 /*yield*/, db.update(schema_1.proposals).set(updateData).where(drizzle_orm_1.eq(schema_1.proposals.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.proposals).where(drizzle_orm_1.eq(schema_1.proposals.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
