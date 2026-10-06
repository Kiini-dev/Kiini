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
exports.__esModule = true;
exports.departmentalHeadsRouter = void 0;
/**
 * Departmental Heads Router
 * Manage department head assignments and auto-update department records
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var manager_employee_mapper_1 = require("../utils/manager-employee-mapper");
var notification_1 = require("../_core/notification");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
var hrManage = enhancedRbac_1.createFeatureRestrictedProcedure("hr:manage");
exports.departmentalHeadsRouter = trpc_1.router({
    // ── HR: List department heads ──────────────────────────────────────────
    list: hrManage
        .input(zod_1.z.object({
        departmentId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, query, params, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        query = "\n        SELECT dh.*, e.firstName, e.lastName, e.email, e.position, d.name as departmentName\n        FROM departmental_heads dh\n        LEFT JOIN employees e ON dh.employeeId = e.id\n        LEFT JOIN departments d ON dh.departmentId = d.id\n        WHERE dh.organizationId = ? AND dh.removedAt IS NULL\n      ";
                        params = [orgId];
                        if (input.departmentId) {
                            query += " AND dh.departmentId = ?";
                            params.push(input.departmentId);
                        }
                        query += " ORDER BY d.name ASC LIMIT ? OFFSET ?";
                        params.push(input.limit, input.offset);
                        return [4 /*yield*/, p.query(query, params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, (rows || [])];
                }
            });
        });
    }),
    // ── HR: Assign department head ──────────────────────────────────────────
    assign: hrManage
        .input(zod_1.z.object({
        departmentId: zod_1.z.string(),
        employeeId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, empRows, emp, deptRows, dept, existingRows, headId, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, p.query("SELECT id, userId, firstName, lastName, email, department FROM employees WHERE id = ? AND organizationId = ? LIMIT 1", [input.employeeId, orgId])];
                    case 2:
                        empRows = (_d.sent())[0];
                        emp = (_b = empRows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!emp)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                        return [4 /*yield*/, p.query("SELECT id, name FROM departments WHERE id = ? AND organizationId = ? LIMIT 1", [input.departmentId, orgId])];
                    case 3:
                        deptRows = (_d.sent())[0];
                        dept = (_c = deptRows) === null || _c === void 0 ? void 0 : _c[0];
                        if (!dept)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Department not found" });
                        return [4 /*yield*/, p.query("SELECT id FROM departmental_heads WHERE departmentId = ? AND employeeId = ? AND removedAt IS NULL LIMIT 1", [input.departmentId, input.employeeId])];
                    case 4:
                        existingRows = (_d.sent())[0];
                        if (existingRows && existingRows.length > 0) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Already assigned as department head" });
                        }
                        // Ensure manager has employee record
                        return [4 /*yield*/, manager_employee_mapper_1.ensureManagerHasEmployeeRecord(emp.userId, orgId, emp.email, emp.firstName, emp.lastName)];
                    case 5:
                        // Ensure manager has employee record
                        _d.sent();
                        headId = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO departmental_heads (\n            id, organizationId, departmentId, employeeId, userId, assignedBy, createdAt, updatedAt\n          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [headId, orgId, input.departmentId, input.employeeId, emp.userId, ctx.user.id])];
                    case 6:
                        _d.sent();
                        // Update department's headId
                        return [4 /*yield*/, p.query("UPDATE departments SET headId = ? WHERE id = ?", [input.employeeId, input.departmentId])];
                    case 7:
                        // Update department's headId
                        _d.sent();
                        // Send notification
                        return [4 /*yield*/, notification_1.createNotification({
                                userId: emp.userId,
                                title: "Department Head Assignment",
                                message: "You have been assigned as head of " + dept.name,
                                type: "promotion",
                                organizationId: orgId
                            })];
                    case 8:
                        // Send notification
                        _d.sent();
                        console.log("[DEPT-HEADS] " + emp.email + " assigned as head of " + dept.name + " by " + ctx.user.id);
                        return [2 /*return*/, { success: true, message: emp.firstName + " assigned as department head" }];
                    case 9:
                        error_1 = _d.sent();
                        if (error_1.code)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to assign department head: " + (error_1 === null || error_1 === void 0 ? void 0 : error_1.message)
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Remove department head ──────────────────────────────────────────
    remove: hrManage
        .input(zod_1.z.object({ headId: zod_1.z.string(), reason: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, head, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, p.query("SELECT dh.*, e.email, e.firstName, e.lastName FROM departmental_heads dh\n           LEFT JOIN employees e ON dh.employeeId = e.id\n           WHERE dh.id = ? AND dh.organizationId = ? LIMIT 1", [input.headId, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        head = (_b = rows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!head)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Department head assignment not found" });
                        // Mark as removed
                        return [4 /*yield*/, p.query("UPDATE departmental_heads SET removedAt = NOW(), removedBy = ?, removalReason = ?, updatedAt = NOW()\n           WHERE id = ?", [ctx.user.id, input.reason || null, input.headId])];
                    case 3:
                        // Mark as removed
                        _c.sent();
                        // Clear department's headId
                        return [4 /*yield*/, p.query("UPDATE departments SET headId = NULL WHERE id = ?", [head.departmentId])];
                    case 4:
                        // Clear department's headId
                        _c.sent();
                        // Send notification
                        return [4 /*yield*/, notification_1.createNotification({
                                userId: head.userId,
                                title: "Department Head Role Removed",
                                message: "You are no longer a department head. " + (input.reason ? "Reason: " + input.reason : ""),
                                type: "demotion",
                                organizationId: orgId
                            })];
                    case 5:
                        // Send notification
                        _c.sent();
                        console.log("[DEPT-HEADS] " + head.email + " removed as department head by " + ctx.user.id);
                        return [2 /*return*/, { success: true, message: head.firstName + " removed as department head" }];
                    case 6:
                        error_2 = _c.sent();
                        if (error_2.code)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to remove department head: " + (error_2 === null || error_2 === void 0 ? void 0 : error_2.message)
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Get department head for a specific department ──────────────────
    getByDepartment: trpc_1.protectedProcedure
        .input(zod_1.z.object({ departmentId: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, p.query("SELECT dh.*, e.firstName, e.lastName, e.email, e.position\n           FROM departmental_heads dh\n           LEFT JOIN employees e ON dh.employeeId = e.id\n           WHERE dh.departmentId = ? AND dh.organizationId = ? AND dh.removedAt IS NULL LIMIT 1", [input.departmentId, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        return [2 /*return*/, ((_b = rows) === null || _b === void 0 ? void 0 : _b[0]) || null];
                    case 3:
                        error_3 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch department head: " + (error_3 === null || error_3 === void 0 ? void 0 : error_3.message)
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
