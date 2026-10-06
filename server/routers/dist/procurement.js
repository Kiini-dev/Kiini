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
exports.procurementRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var budgetEnforcer_1 = require("../utils/budgetEnforcer");
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:read");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:delete");
// Define procurement request schema
var procurementRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z["enum"](["equipment", "supplies", "services", "materials"]),
    quantity: zod_1.z.number().positive(),
    price: zod_1.z.number().nonnegative(),
    requiredDate: zod_1.z.date().optional(),
    notes: zod_1.z.string().optional()
});
exports.procurementRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows, err_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId)
                            return [2 /*return*/, []];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.raw("\n          SELECT \n            id, name, description, category, quantity, price, \n            status, requiredDate, notes, createdAt, updatedAt, createdBy\n          FROM procurement_requests\n          WHERE organizationId = ?\n          ORDER BY createdAt DESC\n          LIMIT ? OFFSET ?\n        ", [orgId, (input === null || input === void 0 ? void 0 : input.limit) || 50, (input === null || input === void 0 ? void 0 : input.offset) || 0])];
                    case 3:
                        rows = _c.sent();
                        return [2 /*return*/, (rows || []).map(function (r) { return (__assign(__assign({}, r), { createdAt: r.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19) })); })];
                    case 4:
                        err_1 = _c.sent();
                        console.warn("Procurement query failed, returning empty", err_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows, err_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId)
                            return [2 /*return*/, null];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.raw("SELECT * FROM procurement_requests WHERE id = ? AND organizationId = ? LIMIT 1", [input, orgId])];
                    case 3:
                        rows = _c.sent();
                        return [2 /*return*/, (rows || [])[0] || null];
                    case 4:
                        err_2 = _c.sent();
                        console.warn("Procurement getById failed", err_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(procurementRequestSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, now, orgId, err_3;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId)
                            throw new Error("Organization not found");
                        return [4 /*yield*/, db.raw("INSERT INTO procurement_requests \n          (id, name, description, category, quantity, price, status, requiredDate, notes, createdBy, organizationId, createdAt, updatedAt)\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                id,
                                input.name,
                                input.description || null,
                                input.category,
                                input.quantity,
                                input.price,
                                "pending",
                                input.requiredDate ? input.requiredDate.toISOString().split("T")[0] : null,
                                input.notes || null,
                                ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "system",
                                orgId,
                                now,
                                now,
                            ])];
                    case 3:
                        _e.sent();
                        // Log activity
                        return [4 /*yield*/, db.raw("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n          VALUES (?, ?, ?, ?, ?, ?, ?)", [
                                uuid_1.v4(),
                                ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "system",
                                "create_procurement_request",
                                "procurement_request",
                                id,
                                "Created procurement request: " + input.name,
                                now,
                            ])["catch"](function () { })];
                    case 4:
                        // Log activity
                        _e.sent();
                        return [2 /*return*/, { id: id, success: true }];
                    case 5:
                        err_3 = _e.sent();
                        console.error("Procurement create error:", err_3);
                        throw new Error("Failed to create procurement request");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object(__assign({ id: zod_1.z.string(), status: zod_1.z["enum"](["pending", "approved", "ordered", "delivered", "rejected"]).optional() }, procurementRequestSchema.partial().shape)))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, updateData, now, orgId, rows, record, totalCents, updateFields, values, err_4;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 9, , 10]);
                        id = input.id, updateData = __rest(input, ["id"]);
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        if (!(updateData.status === "approved")) return [3 /*break*/, 5];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.raw("SELECT price, quantity FROM procurement_requests WHERE id = ? AND organizationId = ? LIMIT 1", [id, orgId])];
                    case 3:
                        rows = _e.sent();
                        record = (rows || [])[0];
                        if (!record) return [3 /*break*/, 5];
                        totalCents = Math.round((record.price || 0) * (record.quantity || 1));
                        return [4 /*yield*/, budgetEnforcer_1.enforceBudget(db, orgId, totalCents)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        updateFields = [];
                        values = [];
                        if (updateData.name) {
                            updateFields.push("name = ?");
                            values.push(updateData.name);
                        }
                        if (updateData.description !== undefined) {
                            updateFields.push("description = ?");
                            values.push(updateData.description);
                        }
                        if (updateData.status) {
                            updateFields.push("status = ?");
                            values.push(updateData.status);
                        }
                        if (updateData.quantity) {
                            updateFields.push("quantity = ?");
                            values.push(updateData.quantity);
                        }
                        if (updateData.price !== undefined) {
                            updateFields.push("price = ?");
                            values.push(updateData.price);
                        }
                        if (updateData.notes !== undefined) {
                            updateFields.push("notes = ?");
                            values.push(updateData.notes);
                        }
                        updateFields.push("updatedAt = ?");
                        values.push(now);
                        values.push(id);
                        values.push((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId);
                        if (!(updateFields.length > 1)) return [3 /*break*/, 8];
                        return [4 /*yield*/, db.raw("UPDATE procurement_requests SET " + updateFields.join(", ") + " WHERE id = ? AND organizationId = ?", values)];
                    case 6:
                        _e.sent();
                        // Log activity
                        return [4 /*yield*/, db.raw("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n            VALUES (?, ?, ?, ?, ?, ?, ?)", [
                                uuid_1.v4(),
                                ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "system",
                                "update_procurement_request",
                                "procurement_request",
                                id,
                                "Updated procurement request: " + (updateData.status ? "status changed to " + updateData.status : "details updated"),
                                now,
                            ])["catch"](function () { })];
                    case 7:
                        // Log activity
                        _e.sent();
                        _e.label = 8;
                    case 8: return [2 /*return*/, { id: id, success: true }];
                    case 9:
                        err_4 = _e.sent();
                        console.error("Procurement update error:", err_4);
                        throw new Error("Failed to update procurement request");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, orgId, err_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId)
                            throw new Error("Organization not found");
                        return [4 /*yield*/, db.raw("DELETE FROM procurement_requests WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 3:
                        _d.sent();
                        // Log activity
                        return [4 /*yield*/, db.raw("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n          VALUES (?, ?, ?, ?, ?, ?, ?)", [
                                uuid_1.v4(),
                                ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "system",
                                "delete_procurement_request",
                                "procurement_request",
                                input,
                                "Deleted procurement request",
                                now,
                            ])["catch"](function () { })];
                    case 4:
                        // Log activity
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        err_5 = _d.sent();
                        console.error("Procurement delete error:", err_5);
                        throw new Error("Failed to delete procurement request");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getStats: readProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, result, row, err_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { totalRequests: 0, pendingCount: 0, totalSpend: 0, approvedCount: 0 }];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId)
                            return [2 /*return*/, { totalRequests: 0, pendingCount: 0, totalSpend: 0, approvedCount: 0 }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.raw("\n          SELECT \n            COUNT(*) as totalRequests,\n            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,\n            SUM(CASE WHEN status = 'approved' THEN price * quantity ELSE 0 END) as totalSpend,\n            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCount\n          FROM procurement_requests\n          WHERE organizationId = ?\n        ", [orgId])];
                    case 3:
                        result = _c.sent();
                        row = (result || [])[0] || {};
                        return [2 /*return*/, {
                                totalRequests: row.totalRequests || 0,
                                pendingCount: row.pendingCount || 0,
                                totalSpend: row.totalSpend || 0,
                                approvedCount: row.approvedCount || 0
                            }];
                    case 4:
                        err_6 = _c.sent();
                        console.warn("Stats query failed", err_6);
                        return [2 /*return*/, { totalRequests: 0, pendingCount: 0, totalSpend: 0, approvedCount: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
