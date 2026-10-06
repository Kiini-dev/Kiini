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
exports.trainingRouter = void 0;
/**
 * Training Management Router
 * Programs, enrollments, progress tracking
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    return p;
}
var hrView = enhancedRbac_1.createFeatureRestrictedProcedure("hr:view");
var hrWrite = enhancedRbac_1.createFeatureRestrictedProcedure("hr:edit");
exports.trainingRouter = trpc_1.router({
    // --- Programs CRUD ---
    listPrograms: hrView
        .input(zod_1.z.object({
        category: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "completed", "cancelled", "draft"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, query, params, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        query = "SELECT tp.*, (SELECT COUNT(*) FROM trainingEnrollments te WHERE te.programId = tp.id) as enrollmentCount\n        FROM trainingPrograms tp WHERE (tp.organizationId = ? OR tp.organizationId IS NULL)";
                        params = [orgId];
                        if (input === null || input === void 0 ? void 0 : input.category) {
                            query += " AND tp.category = ?";
                            params.push(input.category);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query += " AND tp.status = ?";
                            params.push(input.status);
                        }
                        query += " ORDER BY tp.startDate DESC LIMIT ? OFFSET ?";
                        params.push((input === null || input === void 0 ? void 0 : input.limit) || 50, (input === null || input === void 0 ? void 0 : input.offset) || 0);
                        return [4 /*yield*/, p.query(query, params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    getProgram: hrView
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows, enrollments;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT * FROM trainingPrograms WHERE id = ?", [input.id])];
                    case 1:
                        rows = (_b.sent())[0];
                        if (!(rows === null || rows === void 0 ? void 0 : rows[0]))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, p.query("SELECT te.*, e.firstName, e.lastName, e.department, e.position\n         FROM trainingEnrollments te\n         LEFT JOIN employees e ON te.employeeId = e.id\n         WHERE te.programId = ? ORDER BY te.enrolledAt DESC", [input.id])];
                    case 2:
                        enrollments = (_b.sent())[0];
                        return [2 /*return*/, __assign(__assign({}, rows[0]), { enrollments: enrollments || [] })];
                }
            });
        });
    }),
    createProgram: hrWrite
        .input(zod_1.z.object({
        name: zod_1.z.string().max(200),
        description: zod_1.z.string().max(2000).optional(),
        category: zod_1.z.string().max(100).optional(),
        trainer: zod_1.z.string().max(200).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        maxParticipants: zod_1.z.number().optional(),
        cost: zod_1.z.number().optional(),
        location: zod_1.z.string().max(200).optional(),
        isOnline: zod_1.z.boolean()["default"](false),
        isMandatory: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO trainingPrograms (id, organizationId, name, description, category, trainer, startDate, endDate, maxParticipants, cost, location, isOnline, isMandatory, status, createdBy)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)", [id, ctx.user.organizationId, input.name, input.description || null, input.category || null, input.trainer || null, input.startDate || null, input.endDate || null, input.maxParticipants || null, input.cost || null, input.location || null, input.isOnline ? 1 : 0, input.isMandatory ? 1 : 0, ctx.user.id])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { id: id, success: true }];
                }
            });
        });
    }),
    updateProgram: hrWrite
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().max(200).optional(),
        description: zod_1.z.string().max(2000).optional(),
        category: zod_1.z.string().max(100).optional(),
        trainer: zod_1.z.string().max(200).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        maxParticipants: zod_1.z.number().optional(),
        cost: zod_1.z.number().optional(),
        location: zod_1.z.string().max(200).optional(),
        isOnline: zod_1.z.boolean().optional(),
        isMandatory: zod_1.z.boolean().optional(),
        status: zod_1.z["enum"](["active", "completed", "cancelled", "draft"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id, fields, setClauses, params, _i, _b, _c, key, val;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        id = input.id, fields = __rest(input, ["id"]);
                        setClauses = [];
                        params = [];
                        for (_i = 0, _b = Object.entries(fields); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], val = _c[1];
                            if (val !== undefined) {
                                setClauses.push(key + " = ?");
                                params.push(typeof val === "boolean" ? (val ? 1 : 0) : val);
                            }
                        }
                        if (setClauses.length === 0)
                            return [2 /*return*/, { success: true }];
                        setClauses.push("updatedAt = NOW()");
                        params.push(id);
                        return [4 /*yield*/, p.query("UPDATE trainingPrograms SET " + setClauses.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteProgram: hrWrite
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM trainingEnrollments WHERE programId = ?", [input.id])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, p.query("DELETE FROM trainingPrograms WHERE id = ?", [input.id])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // --- Enrollments ---
    enroll: hrWrite
        .input(zod_1.z.object({
        programId: zod_1.z.string(),
        employeeIds: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, enrolled, _i, _b, employeeId, existing, id;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        enrolled = 0;
                        _i = 0, _b = input.employeeIds;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        employeeId = _b[_i];
                        return [4 /*yield*/, p.query("SELECT id FROM trainingEnrollments WHERE programId = ? AND employeeId = ?", [input.programId, employeeId])];
                    case 2:
                        existing = (_d.sent())[0];
                        if (((_c = existing) === null || _c === void 0 ? void 0 : _c.length) > 0)
                            return [3 /*break*/, 4];
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO trainingEnrollments (id, programId, employeeId, status, enrolledBy) VALUES (?, ?, ?, 'enrolled', ?)", [id, input.programId, employeeId, ctx.user.id])];
                    case 3:
                        _d.sent();
                        enrolled++;
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, { enrolled: enrolled, total: input.employeeIds.length }];
                }
            });
        });
    }),
    updateEnrollment: hrWrite
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](["enrolled", "in_progress", "completed", "dropped", "failed"]),
        score: zod_1.z.number().optional(),
        certificate: zod_1.z.string().optional(),
        feedback: zod_1.z.string().max(1000).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, setClauses, params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        setClauses = ["status = ?"];
                        params = [input.status];
                        if (input.score !== undefined) {
                            setClauses.push("score = ?");
                            params.push(input.score);
                        }
                        if (input.certificate) {
                            setClauses.push("certificate = ?");
                            params.push(input.certificate);
                        }
                        if (input.feedback) {
                            setClauses.push("feedback = ?");
                            params.push(input.feedback);
                        }
                        if (input.status === "completed") {
                            setClauses.push("completedAt = NOW()");
                        }
                        setClauses.push("updatedAt = NOW()");
                        params.push(input.id);
                        return [4 /*yield*/, p.query("UPDATE trainingEnrollments SET " + setClauses.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    removeEnrollment: hrWrite
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM trainingEnrollments WHERE id = ?", [input.id])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Employee's training history
    employeeTraining: hrView
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT te.*, tp.name as programName, tp.category, tp.trainer, tp.startDate, tp.endDate, tp.isOnline, tp.isMandatory\n         FROM trainingEnrollments te\n         LEFT JOIN trainingPrograms tp ON te.programId = tp.id\n         WHERE te.employeeId = ? ORDER BY te.enrolledAt DESC", [input.employeeId])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    // Dashboard stats
    stats: hrView.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, programs, enrollments;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, p.query("SELECT status, COUNT(*) as cnt FROM trainingPrograms WHERE (organizationId = ? OR organizationId IS NULL) GROUP BY status", [orgId])];
                    case 1:
                        programs = (_b.sent())[0];
                        return [4 /*yield*/, p.query("SELECT te.status, COUNT(*) as cnt FROM trainingEnrollments te\n       LEFT JOIN trainingPrograms tp ON te.programId = tp.id\n       WHERE (tp.organizationId = ? OR tp.organizationId IS NULL)\n       GROUP BY te.status", [orgId])];
                    case 2:
                        enrollments = (_b.sent())[0];
                        return [2 /*return*/, { programs: programs || [], enrollments: enrollments || [] }];
                }
            });
        });
    })
});
