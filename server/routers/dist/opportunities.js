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
exports.opportunitiesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var emailNotifications_1 = require("./emailNotifications");
exports.opportunitiesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, query, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Opportunities.list] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER', 'Input:', input);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        query = orgId
                            ? db.select().from(schema_1.opportunities).where(drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId))
                            : db.select().from(schema_1.opportunities);
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        rows = _c.sent();
                        return [2 /*return*/, rows.map(function (r) {
                                var _a, _b;
                                return (__assign(__assign({}, r), { 
                                    // Back-compat aliases expected by frontend
                                    proposalNumber: r.proposalNumber || r.id, amount: (_b = (_a = r.value) !== null && _a !== void 0 ? _a : r.total) !== null && _b !== void 0 ? _b : 0, validUntil: r.expectedCloseDate || r.expiryDate || null, status: r.stage || r.status }));
                            })];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, row;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.opportunities.id, input), drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.opportunities.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.opportunities).where(where).limit(1)];
                    case 2:
                        result = _d.sent();
                        row = result[0] || null;
                        if (!row)
                            return [2 /*return*/, null];
                        return [2 /*return*/, __assign(__assign({}, row), { proposalNumber: row.proposalNumber || row.id, amount: (_c = (_b = row.value) !== null && _b !== void 0 ? _b : row.total) !== null && _c !== void 0 ? _c : 0, validUntil: row.expectedCloseDate || row.expiryDate || null, status: row.stage || row.status })];
                }
            });
        });
    }),
    byClient: trpc_1.protectedProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.opportunities.clientId, input.clientId), drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.opportunities.clientId, input.clientId);
                        return [4 /*yield*/, db.select().from(schema_1.opportunities).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("opportunities:create")
        .input(zod_1.z.object({
        // Accept frontend-friendly fields and map them to DB columns
        proposalNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional()["default"](""),
        name: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        amount: zod_1.z.number().optional(),
        value: zod_1.z.number().optional(),
        validUntil: zod_1.z.string().optional(),
        stage: zod_1.z["enum"](["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        // Accept status for frontend compatibility and map to stage
        status: zod_1.z.string().optional(),
        probability: zod_1.z.number().optional(),
        expectedCloseDate: zod_1.z.date().optional(),
        assignedTo: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        winReason: zod_1.z.string().optional(),
        lossReason: zod_1.z.string().optional(),
        actualCloseDate: zod_1.z.date().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, insertData, title, notifError_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        insertData = __assign(__assign({}, input), { 
                            // Support both `name` and `title` fields from different callers
                            title: input.title || input.name || "Untitled", clientId: input.clientId || "", 
                            // Map frontend-friendly fields to DB columns
                            value: (_c = (_b = input.amount) !== null && _b !== void 0 ? _b : input.value) !== null && _c !== void 0 ? _c : 0, expectedCloseDate: input.expectedCloseDate ? input.expectedCloseDate.toISOString() : (input.validUntil || undefined), actualCloseDate: input.actualCloseDate ? input.actualCloseDate.toISOString() : undefined });
                        delete insertData.name;
                        if (input.status) {
                            insertData.stage = input.status;
                            delete insertData.status;
                        }
                        return [4 /*yield*/, db.insert(schema_1.opportunities).values(__assign(__assign({ id: id, organizationId: (_d = ctx.user.organizationId) !== null && _d !== void 0 ? _d : null }, insertData), { createdBy: ctx.user.id }))];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 6, , 7]);
                        if (!ctx.user.email) return [3 /*break*/, 5];
                        title = insertData.title || "Untitled";
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "opportunity_created",
                                recipientEmail: ctx.user.email,
                                recipientName: ctx.user.name,
                                subject: "New Opportunity: " + title,
                                htmlContent: "<h2>New Opportunity Created</h2><p>Opportunity <strong>" + title + "</strong> has been created.</p>" + (insertData.value ? "<p><strong>Value:</strong> KES " + insertData.value.toLocaleString() + "</p>" : '') + "<p><a href=\"/opportunities/" + id + "\">View Opportunity</a></p>",
                                entityType: "opportunity",
                                entityId: id,
                                actionUrl: "/opportunities/" + id
                            })];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        notifError_1 = _e.sent();
                        console.error("[Opportunities] Failed to send email notification:", notifError_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("opportunities:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        proposalNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        // Accept frontend-friendly fields
        amount: zod_1.z.number().optional(),
        value: zod_1.z.number().optional(),
        validUntil: zod_1.z.string().optional(),
        // Accept frontend `status` (maps to stage)
        status: zod_1.z.string().optional(),
        stage: zod_1.z["enum"](["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        probability: zod_1.z.number().optional(),
        expectedCloseDate: zod_1.z.date().optional(),
        actualCloseDate: zod_1.z.date().optional(),
        assignedTo: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, existing, oldStage, updateData, orgId, updateWhere, newStage, err_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        return [4 /*yield*/, db.select().from(schema_1.opportunities).where(drizzle_orm_1.eq(schema_1.opportunities.id, id)).limit(1)];
                    case 2:
                        existing = _e.sent();
                        oldStage = (_b = existing[0]) === null || _b === void 0 ? void 0 : _b.stage;
                        updateData = __assign(__assign({}, data), { 
                            // Map frontend-friendly fields
                            value: (_c = data.amount) !== null && _c !== void 0 ? _c : data.value, expectedCloseDate: data.expectedCloseDate ? data.expectedCloseDate.toISOString() : data.validUntil || undefined, actualCloseDate: data.actualCloseDate ? data.actualCloseDate.toISOString() : undefined });
                        if (data.status !== undefined) {
                            updateData.stage = data.status;
                            delete updateData.status;
                        }
                        if (data.proposalNumber !== undefined)
                            updateData.proposalNumber = data.proposalNumber;
                        // Remove frontend-only keys to avoid DB errors
                        delete updateData.amount;
                        delete updateData.validUntil;
                        orgId = ctx.user.organizationId;
                        updateWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.opportunities.id, id), drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.opportunities.id, id);
                        return [4 /*yield*/, db.update(schema_1.opportunities).set(updateData).where(updateWhere)];
                    case 3:
                        _e.sent();
                        newStage = updateData.stage;
                        if (!(newStage && oldStage !== newStage)) return [3 /*break*/, 8];
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../workflows/triggerEngine'); })];
                    case 5: return [4 /*yield*/, (_e.sent()).workflowTriggerEngine.trigger({
                            triggerType: 'opportunity_moved',
                            entityType: 'opportunity',
                            entityId: id,
                            data: { oldStage: oldStage, newStage: newStage },
                            userId: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id
                        })];
                    case 6:
                        _e.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _e.sent();
                        console.error('Workflow trigger (opportunity_moved) failed:', err_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("opportunities:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, deleteWhere;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        deleteWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.opportunities.id, input), drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.opportunities.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.opportunities).where(deleteWhere)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    byStage: trpc_1.protectedProcedure
        .input(zod_1.z.object({ stage: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.opportunities.stage, input.stage), drizzle_orm_1.eq(schema_1.opportunities.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.opportunities.stage, input.stage);
                        return [4 /*yield*/, db.select().from(schema_1.opportunities).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    })
});
