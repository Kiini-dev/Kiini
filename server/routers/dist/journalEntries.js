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
exports.__esModule = true;
exports.journalEntriesRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:edit");
var approveProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:approve");
var exportProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:export");
// ============================================================================
// ENHANCED VALIDATION SCHEMAS
// ============================================================================
var lineSchema = zod_1.z.object({
    accountId: zod_1.z.string().min(1, "Account ID is required"),
    debit: zod_1.z.number().min(0, "Debit must be non-negative")["default"](0),
    credit: zod_1.z.number().min(0, "Credit must be non-negative")["default"](0),
    description: zod_1.z.string().optional()
}).refine(function (line) { return !(line.debit > 0 && line.credit > 0); }, "A line cannot have both debit and credit amounts");
var createEntrySchema = zod_1.z.object({
    entryDate: zod_1.z.string().datetime().refine(function (d) { return new Date(d) <= new Date(); }, "Entry date cannot be in the future"),
    description: zod_1.z.string().min(5, "Description must be at least 5 characters"),
    referenceType: zod_1.z["enum"](["invoice", "expense", "payment", "manual", "adjustment"]).optional(),
    referenceId: zod_1.z.string().optional(),
    lines: zod_1.z.array(lineSchema).min(2, "At least 2 lines required")
}).refine(function (data) {
    var totalDebit = data.lines.reduce(function (s, l) { return s + l.debit; }, 0);
    var totalCredit = data.lines.reduce(function (s, l) { return s + l.credit; }, 0);
    return totalDebit === totalCredit;
}, { message: "Total debits must equal total credits" }).refine(function (data) { return data.lines.reduce(function (s, l) { return s + l.debit; }, 0) > 0; }, { message: "Entry must have non-zero amounts" });
var advancedFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    minAmount: zod_1.z.number().optional(),
    maxAmount: zod_1.z.number().optional(),
    accountIds: zod_1.z.array(zod_1.z.string()).optional(),
    referenceTypes: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z["enum"](["pending", "approved", "posted"]).optional(),
    limit: zod_1.z.number().min(1).max(500)["default"](50),
    offset: zod_1.z.number().min(0)["default"](0),
    sortBy: zod_1.z["enum"](["date", "amount", "description"])["default"]("date"),
    sortOrder: zod_1.z["enum"](["asc", "desc"])["default"]("desc")
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Log journal entry changes for audit trail
 */
function logEntryChange(db, entryId, action, userId, changes) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // This will be stored in your auditLog table when implemented
                console.log("[AUDIT] Journal Entry " + action + ":", {
                    entryId: entryId,
                    action: action,
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    changes: changes
                });
            }
            catch (err) {
                console.warn("Failed to log entry change:", err);
            }
            return [2 /*return*/];
        });
    });
}
exports.journalEntriesRouter = trpc_1.router({
    /**
     * Advanced list with filtering, sorting, and pagination
     */
    list: readProcedure
        .input(advancedFilterSchema.optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, orgId, where, limit, offset, orderByCol, orderDirection, rows, countRes, total, hasMore;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            return [2 /*return*/, { entries: [], total: 0, hasMore: false }];
                        filters = [];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        // Org isolation
                        if (orgId)
                            filters.push(drizzle_orm_1.eq(schema_1.journalEntries.organizationId, orgId));
                        // Text search
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            filters.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_1.journalEntries.description, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.journalEntries.entryNumber, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.journalEntries.reference, "%" + input.search + "%")));
                        }
                        // Date range
                        if ((input === null || input === void 0 ? void 0 : input.startDate) && (input === null || input === void 0 ? void 0 : input.endDate)) {
                            filters.push(drizzle_orm_1.between(schema_1.journalEntries.entryDate, input.startDate, input.endDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.startDate) {
                            filters.push(drizzle_orm_1.gte(schema_1.journalEntries.entryDate, input.startDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.endDate) {
                            filters.push(drizzle_orm_1.lte(schema_1.journalEntries.entryDate, input.endDate));
                        }
                        // Status filter
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.journalEntries.status, input.status));
                        }
                        // Reference type filter
                        if ((input === null || input === void 0 ? void 0 : input.referenceTypes) && input.referenceTypes.length > 0) {
                            filters.push(drizzle_orm_1.or.apply(void 0, input.referenceTypes.map(function (rt) { return drizzle_orm_1.eq(schema_1.journalEntries.referenceType, rt); })));
                        }
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        limit = (_c = input === null || input === void 0 ? void 0 : input.limit) !== null && _c !== void 0 ? _c : 50;
                        offset = (_d = input === null || input === void 0 ? void 0 : input.offset) !== null && _d !== void 0 ? _d : 0;
                        orderByCol = (input === null || input === void 0 ? void 0 : input.sortBy) === "amount"
                            ? schema_1.journalEntries.totalAmount
                            : (input === null || input === void 0 ? void 0 : input.sortBy) === "description"
                                ? schema_1.journalEntries.description
                                : schema_1.journalEntries.entryDate;
                        orderDirection = (input === null || input === void 0 ? void 0 : input.sortOrder) === "asc" ? "ASC" : "DESC";
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntries)
                                .where(where)
                                .orderBy(orderByCol)
                                .limit(limit)
                                .offset(offset)];
                    case 2:
                        rows = _f.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema_1.journalEntries)
                                .where(where)];
                    case 3:
                        countRes = (_f.sent())[0];
                        total = Number((_e = countRes === null || countRes === void 0 ? void 0 : countRes.count) !== null && _e !== void 0 ? _e : rows.length);
                        hasMore = offset + limit < total;
                        return [2 /*return*/, {
                                entries: rows,
                                total: total,
                                hasMore: hasMore,
                                limit: limit,
                                offset: offset,
                                pageCount: Math.ceil(total / limit)
                            }];
                }
            });
        });
    }),
    /**
     * Get single entry with all lines
     */
    getById: readProcedure
        .input(zod_1.z.string().min(1, "Entry ID required"))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, entry, lines;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        where = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntries.id, input), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.journalEntries.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.journalEntries).where(where).limit(1)];
                    case 2:
                        entry = (_c.sent())[0];
                        if (!entry) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Journal entry not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntryLines)
                                .where(drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, input))];
                    case 3:
                        lines = _c.sent();
                        return [2 /*return*/, __assign(__assign({}, entry), { lines: lines })];
                }
            });
        });
    }),
    /**
     * Create new journal entry with comprehensive validation
     */
    create: writeProcedure
        .input(createEntrySchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, accountIds, existingAccounts, now, prefix, last, seq, entryNumber, totalAmount, entryId, now_formatted, i, line, lineId, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 11, , 12]);
                        accountIds = input.lines.map(function (l) { return l.accountId; });
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.organizationId, ctx.user.organizationId), drizzle_orm_1.or.apply(void 0, accountIds.map(function (id) { return drizzle_orm_1.eq(schema_1.accounts.id, id); }))))];
                    case 3:
                        existingAccounts = _b.sent();
                        if (existingAccounts.length !== accountIds.length) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "One or more accounts do not exist or do not belong to your organization"
                            });
                        }
                        now = new Date();
                        prefix = "JE-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0");
                        return [4 /*yield*/, db
                                .select({ entryNumber: schema_1.journalEntries.entryNumber })
                                .from(schema_1.journalEntries)
                                .where(drizzle_orm_1.and(drizzle_orm_1.like(schema_1.journalEntries.entryNumber, prefix + "%"), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, ctx.user.organizationId)))
                                .orderBy(drizzle_orm_1.desc(schema_1.journalEntries.entryNumber))
                                .limit(1)];
                    case 4:
                        last = (_b.sent())[0];
                        seq = last ? parseInt(last.entryNumber.slice(-4)) + 1 : 1;
                        entryNumber = prefix + "-" + String(seq).padStart(4, "0");
                        totalAmount = input.lines.reduce(function (s, l) { return s + l.debit; }, 0);
                        entryId = uuid_1.v4();
                        now_formatted = now.toISOString();
                        // Insert journal entry
                        return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                                id: entryId,
                                organizationId: ctx.user.organizationId,
                                entryNumber: entryNumber,
                                entryDate: input.entryDate,
                                entryMonth: input.entryDate.substring(0, 7),
                                reference: input.referenceId || entryNumber,
                                description: input.description,
                                totalAmount: totalAmount,
                                status: "pending_approval",
                                createdBy: ctx.user.id,
                                createdAt: now_formatted,
                                updatedAt: now_formatted
                            })];
                    case 5:
                        // Insert journal entry
                        _b.sent();
                        i = 0;
                        _b.label = 6;
                    case 6:
                        if (!(i < input.lines.length)) return [3 /*break*/, 9];
                        line = input.lines[i];
                        lineId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: lineId,
                                journalEntryId: entryId,
                                accountId: line.accountId,
                                debit: line.debit,
                                credit: line.credit,
                                description: line.description || null,
                                lineNumber: i + 1,
                                createdBy: ctx.user.id,
                                createdAt: now_formatted
                            })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, logEntryChange(db, entryId, "create", ctx.user.id, {
                            entryNumber: entryNumber,
                            totalAmount: totalAmount,
                            lineCount: input.lines.length
                        })];
                    case 10:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                id: entryId,
                                entryNumber: entryNumber,
                                message: "Journal entry " + entryNumber + " created successfully and is pending approval"
                            }];
                    case 11:
                        error_1 = _b.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        console.error("[JournalEntries] Create error:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create journal entry"
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk create multiple journal entries at once
     * Useful for batch imports or recurring entries
     */
    createBatch: writeProcedure
        .input(zod_1.z.array(createEntrySchema).min(1).max(100))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, errors, i, entryInput, totalAmount, now, entryId, entryNumber, j, line, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        results = [];
                        errors = [];
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < input.length)) return [3 /*break*/, 11];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 9, , 10]);
                        entryInput = input[i];
                        totalAmount = entryInput.lines.reduce(function (s, l) { return s + l.debit; }, 0);
                        now = new Date();
                        entryId = uuid_1.v4();
                        entryNumber = "JE-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + "-" + i.toString().padStart(4, "0");
                        return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                                id: entryId,
                                organizationId: ctx.user.organizationId,
                                entryNumber: entryNumber,
                                entryDate: entryInput.entryDate,
                                entryMonth: entryInput.entryDate.substring(0, 7),
                                reference: entryInput.referenceId || entryNumber,
                                description: entryInput.description,
                                totalAmount: totalAmount,
                                status: "pending_approval",
                                createdBy: ctx.user.id,
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 4:
                        _b.sent();
                        j = 0;
                        _b.label = 5;
                    case 5:
                        if (!(j < entryInput.lines.length)) return [3 /*break*/, 8];
                        line = entryInput.lines[j];
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: entryId,
                                accountId: line.accountId,
                                debit: line.debit,
                                credit: line.credit,
                                description: line.description || null,
                                lineNumber: j + 1,
                                createdBy: ctx.user.id,
                                createdAt: now.toISOString()
                            })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        j++;
                        return [3 /*break*/, 5];
                    case 8:
                        results.push({ success: true, entryId: entryId, entryNumber: entryNumber, index: i });
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _b.sent();
                        errors.push({
                            success: false,
                            index: i,
                            error: error_2 instanceof Error ? error_2.message : String(error_2)
                        });
                        return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 2];
                    case 11: return [2 /*return*/, {
                            success: errors.length === 0,
                            created: results.length,
                            failed: errors.length,
                            results: results,
                            errors: errors.length > 0 ? errors : undefined,
                            message: results.length + " entries created successfully" + (errors.length > 0 ? ", " + errors.length + " failed" : "")
                        }];
                }
            });
        });
    }),
    /**
     * Approve/reject pending journal entries (with optional approval comments)
     */
    approveEntry: approveProcedure
        .input(zod_1.z.object({
        entryId: zod_1.z.string(),
        approved: zod_1.z.boolean(),
        comments: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, newStatus, now, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntries)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntries.id, input.entryId), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 3:
                        entry = (_b.sent())[0];
                        if (!entry) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Journal entry not found" });
                        }
                        if (entry.status !== "pending_approval") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot approve entry with status: " + entry.status
                            });
                        }
                        newStatus = input.approved ? "approved" : "rejected";
                        now = new Date().toISOString();
                        return [4 /*yield*/, db
                                .update(schema_1.journalEntries)
                                .set({
                                status: newStatus,
                                approvedBy: ctx.user.id,
                                approvedAt: now,
                                updatedAt: now
                            })
                                .where(drizzle_orm_1.eq(schema_1.journalEntries.id, input.entryId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, logEntryChange(db, input.entryId, "approve", ctx.user.id, {
                                approved: input.approved,
                                comments: input.comments
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                entryId: input.entryId,
                                newStatus: newStatus,
                                message: "Entry " + (input.approved ? "approved" : "rejected") + " successfully"
                            }];
                    case 6:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to approve/reject entry"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get account balance as of a specific date
     */
    getAccountBalance: readProcedure
        .input(zod_1.z.object({
        accountId: zod_1.z.string(),
        asOfDate: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, result, debit, credit;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { accountId: input.accountId, balance: 0, debit: 0, credit: 0 }];
                        dateFilter = input.asOfDate
                            ? drizzle_orm_1.lte(schema_1.journalEntries.entryDate, input.asOfDate)
                            : undefined;
                        return [4 /*yield*/, db
                                .select({
                                totalDebit: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.debit),
                                totalCredit: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.credit)
                            })
                                .from(schema_1.journalEntryLines)
                                .innerJoin(schema_1.journalEntries, drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, schema_1.journalEntries.id))
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntryLines.accountId, input.accountId), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, ctx.user.organizationId), drizzle_orm_1.eq(schema_1.journalEntries.status, "posted"), dateFilter))];
                    case 2:
                        result = (_d.sent())[0];
                        debit = Number((_b = result === null || result === void 0 ? void 0 : result.totalDebit) !== null && _b !== void 0 ? _b : 0);
                        credit = Number((_c = result === null || result === void 0 ? void 0 : result.totalCredit) !== null && _c !== void 0 ? _c : 0);
                        return [2 /*return*/, {
                                accountId: input.accountId,
                                asOfDate: input.asOfDate || new Date().toISOString().split("T")[0],
                                debit: debit,
                                credit: credit,
                                balance: debit - credit
                            }];
                }
            });
        });
    }),
    /**
     * Get account aging (balance breakdown by age)
     */
    getAccountAging: readProcedure
        .input(zod_1.z.object({
        accountId: zod_1.z.string(),
        periodMonths: zod_1.z.number()["default"](12)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, periods, i, startDate, endDate, result, debit, credit;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { aging: [] }];
                        now = new Date();
                        periods = [];
                        i = 0;
                        _d.label = 2;
                    case 2:
                        if (!(i < input.periodMonths)) return [3 /*break*/, 5];
                        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().split("T")[0];
                        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString().split("T")[0];
                        return [4 /*yield*/, db
                                .select({
                                totalDebit: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.debit),
                                totalCredit: drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.credit)
                            })
                                .from(schema_1.journalEntryLines)
                                .innerJoin(schema_1.journalEntries, drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, schema_1.journalEntries.id))
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntryLines.accountId, input.accountId), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, ctx.user.organizationId), drizzle_orm_1.gte(schema_1.journalEntries.entryDate, startDate), drizzle_orm_1.lte(schema_1.journalEntries.entryDate, endDate), drizzle_orm_1.eq(schema_1.journalEntries.status, "posted")))];
                    case 3:
                        result = (_d.sent())[0];
                        debit = Number((_b = result === null || result === void 0 ? void 0 : result.totalDebit) !== null && _b !== void 0 ? _b : 0);
                        credit = Number((_c = result === null || result === void 0 ? void 0 : result.totalCredit) !== null && _c !== void 0 ? _c : 0);
                        periods.push({
                            month: startDate.substring(0, 7),
                            startDate: startDate,
                            endDate: endDate,
                            debit: debit,
                            credit: credit,
                            balance: debit - credit
                        });
                        _d.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, { accountId: input.accountId, aging: periods }];
                }
            });
        });
    }),
    /**
     * Reverse a journal entry (create offsetting entry)
     */
    reverseEntry: writeProcedure
        .input(zod_1.z.object({
        entryId: zod_1.z.string(),
        reversalDate: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, originalEntry, originalLines, reversalId, now, reversalNumber, i, line, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 12, , 13]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntries)
                                .where(drizzle_orm_1.eq(schema_1.journalEntries.id, input.entryId))
                                .limit(1)];
                    case 3:
                        originalEntry = (_b.sent())[0];
                        if (!originalEntry) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntryLines)
                                .where(drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, input.entryId))];
                    case 4:
                        originalLines = _b.sent();
                        reversalId = uuid_1.v4();
                        now = new Date();
                        reversalNumber = "JE-REV-" + originalEntry.entryNumber;
                        return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                                id: reversalId,
                                organizationId: ctx.user.organizationId,
                                entryNumber: reversalNumber,
                                entryDate: input.reversalDate,
                                entryMonth: input.reversalDate.substring(0, 7),
                                reference: "Reversal of " + originalEntry.entryNumber,
                                description: "Reversal entry for " + originalEntry.description + (input.reason ? " - " + input.reason : ""),
                                totalAmount: originalEntry.totalAmount,
                                status: "pending_approval",
                                createdBy: ctx.user.id,
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 5:
                        _b.sent();
                        i = 0;
                        _b.label = 6;
                    case 6:
                        if (!(i < originalLines.length)) return [3 /*break*/, 9];
                        line = originalLines[i];
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: reversalId,
                                accountId: line.accountId,
                                debit: line.credit,
                                credit: line.debit,
                                description: line.description ? "Reversal: " + line.description : null,
                                lineNumber: i + 1,
                                createdBy: ctx.user.id,
                                createdAt: now.toISOString()
                            })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: 
                    // Mark original as reversed
                    return [4 /*yield*/, db
                            .update(schema_1.journalEntries)
                            .set({
                            status: "reversed",
                            reversedAt: now.toISOString(),
                            updatedAt: now.toISOString()
                        })
                            .where(drizzle_orm_1.eq(schema_1.journalEntries.id, input.entryId))];
                    case 10:
                        // Mark original as reversed
                        _b.sent();
                        return [4 /*yield*/, logEntryChange(db, input.entryId, "reverse", ctx.user.id, { reversalId: reversalId, reason: input.reason })];
                    case 11:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                originalEntryId: input.entryId,
                                reversalEntryId: reversalId,
                                reversalEntryNumber: reversalNumber,
                                message: "Entry reversed successfully. Reversal entry created: " + reversalNumber
                            }];
                    case 12:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to reverse entry"
                        });
                    case 13: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.journalEntries)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntries.id, input), drizzle_orm_1.eq(schema_1.journalEntries.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 3:
                        entry = (_b.sent())[0];
                        if (!entry) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
                        }
                        if (entry.status !== "pending_approval") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Can only delete pending entries"
                            });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.journalEntryLines).where(drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, input))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.journalEntries).where(drizzle_orm_1.eq(schema_1.journalEntries.id, input))];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, logEntryChange(db, input, "delete", ctx.user.id)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Entry deleted successfully" }];
                    case 7:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete entry"
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // General Ledger — account balances with running totals
    generalLedger: readProcedure
        .input(zod_1.z.object({
        accountId: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, where, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { ledger: [] }];
                        filters = [];
                        if (input === null || input === void 0 ? void 0 : input.accountId)
                            filters.push(drizzle_orm_1.eq(schema_1.journalEntryLines.accountId, input.accountId));
                        if (input === null || input === void 0 ? void 0 : input.startDate)
                            filters.push(drizzle_orm_1.gte(schema_1.journalEntries.entryDate, input.startDate));
                        if (input === null || input === void 0 ? void 0 : input.endDate)
                            filters.push(drizzle_orm_1.lte(schema_1.journalEntries.entryDate, input.endDate));
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        return [4 /*yield*/, db
                                .select({
                                lineId: schema_1.journalEntryLines.id,
                                entryId: schema_1.journalEntries.id,
                                entryNumber: schema_1.journalEntries.entryNumber,
                                entryDate: schema_1.journalEntries.entryDate,
                                entryDescription: schema_1.journalEntries.description,
                                accountId: schema_1.journalEntryLines.accountId,
                                debit: schema_1.journalEntryLines.debit,
                                credit: schema_1.journalEntryLines.credit,
                                lineDescription: schema_1.journalEntryLines.description
                            })
                                .from(schema_1.journalEntryLines)
                                .innerJoin(schema_1.journalEntries, drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, schema_1.journalEntries.id))
                                .where(where)
                                .orderBy(schema_1.journalEntries.entryDate, schema_1.journalEntries.entryNumber)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, { ledger: rows }];
                }
            });
        });
    }),
    // Trial balance — sum of debits/credits per account
    trialBalance: readProcedure
        .input(zod_1.z.object({
        asOfDate: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, where, rows, allAccounts, accountMap, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { accounts: [], totalDebit: 0, totalCredit: 0 }];
                        filters = [];
                        if (input === null || input === void 0 ? void 0 : input.asOfDate)
                            filters.push(drizzle_orm_1.lte(schema_1.journalEntries.entryDate, input.asOfDate));
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        return [4 /*yield*/, db
                                .select({
                                accountId: schema_1.journalEntryLines.accountId,
                                totalDebit: drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.debit),
                                totalCredit: drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.credit)
                            })
                                .from(schema_1.journalEntryLines)
                                .innerJoin(schema_1.journalEntries, drizzle_orm_1.eq(schema_1.journalEntryLines.journalEntryId, schema_1.journalEntries.id))
                                .where(where)
                                .groupBy(schema_1.journalEntryLines.accountId)];
                    case 2:
                        rows = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.accounts)];
                    case 3:
                        allAccounts = _b.sent();
                        accountMap = new Map(allAccounts.map(function (a) { return [a.id, a]; }));
                        result = rows.map(function (r) {
                            var _a, _b, _c, _d, _e, _f;
                            return ({
                                accountId: r.accountId,
                                accountName: (_b = (_a = accountMap.get(r.accountId)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
                                accountCode: (_d = (_c = accountMap.get(r.accountId)) === null || _c === void 0 ? void 0 : _c.code) !== null && _d !== void 0 ? _d : "",
                                accountType: (_f = (_e = accountMap.get(r.accountId)) === null || _e === void 0 ? void 0 : _e.type) !== null && _f !== void 0 ? _f : "",
                                totalDebit: Number(r.totalDebit),
                                totalCredit: Number(r.totalCredit),
                                balance: Number(r.totalDebit) - Number(r.totalCredit)
                            });
                        });
                        return [2 /*return*/, {
                                accounts: result,
                                totalDebit: result.reduce(function (s, a) { return s + a.totalDebit; }, 0),
                                totalCredit: result.reduce(function (s, a) { return s + a.totalCredit; }, 0)
                            }];
                }
            });
        });
    }),
    // Account summary for dashboard
    accountSummary: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, allAccounts, balances, balMap, summary, _i, allAccounts_1, acct, bal, t;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0 }];
                    return [4 /*yield*/, db.select().from(schema_1.accounts)];
                case 2:
                    allAccounts = _c.sent();
                    return [4 /*yield*/, db
                            .select({
                            accountId: schema_1.journalEntryLines.accountId,
                            totalDebit: drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.debit),
                            totalCredit: drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_1.journalEntryLines.credit)
                        })
                            .from(schema_1.journalEntryLines)
                            .groupBy(schema_1.journalEntryLines.accountId)];
                case 3:
                    balances = _c.sent();
                    balMap = new Map(balances.map(function (b) { return [b.accountId, Number(b.totalDebit) - Number(b.totalCredit)]; }));
                    summary = { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0 };
                    for (_i = 0, allAccounts_1 = allAccounts; _i < allAccounts_1.length; _i++) {
                        acct = allAccounts_1[_i];
                        bal = (_a = balMap.get(acct.id)) !== null && _a !== void 0 ? _a : 0;
                        t = ((_b = acct.type) !== null && _b !== void 0 ? _b : "").toLowerCase();
                        if (t.includes("asset"))
                            summary.assets += bal;
                        else if (t.includes("liabilit"))
                            summary.liabilities += Math.abs(bal);
                        else if (t.includes("equity"))
                            summary.equity += Math.abs(bal);
                        else if (t.includes("revenue") || t.includes("income"))
                            summary.revenue += Math.abs(bal);
                        else if (t.includes("expense") || t.includes("cost"))
                            summary.expenses += bal;
                    }
                    return [2 /*return*/, summary];
            }
        });
    }); })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
