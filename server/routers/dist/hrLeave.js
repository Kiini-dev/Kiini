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
exports.hrLeaveRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var mail_1 = require("../_core/mail");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var getRequestIp = function (req) {
    var _a;
    return ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a['x-forwarded-for']) || (req === null || req === void 0 ? void 0 : req.ip) || null;
};
var requestLeaveSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    employeeId: zod_1.z.string(),
    leaveType: zod_1.z["enum"](['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'compassion']),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    days: zod_1.z.number().int(),
    reason: zod_1.z.string()
});
var approveLeaveSchema = zod_1.z.object({
    leaveRequestId: zod_1.z.string(),
    approverId: zod_1.z.string(),
    approvalComments: zod_1.z.string().optional()
});
var rejectLeaveSchema = zod_1.z.object({
    leaveRequestId: zod_1.z.string(),
    reason: zod_1.z.string()
});
exports.hrLeaveRouter = trpc_1.router({
    // Request leave
    requestLeave: trpc_1.publicProcedure
        .input(requestLeaveSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgSettings, leavePolicy, allowedLeaveTypes, balance, requiresBalance, entitlement, initialAvailable, availableDays, leaveId, leaveBalanceUpdate;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.hrSettings.findFirst({
                                where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                            })];
                    case 2:
                        orgSettings = _e.sent();
                        leavePolicy = (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.leavePolicy) || { annual: 21, sick: 10, maxCarryover: 5, accrualRatePerMonth: 2 };
                        allowedLeaveTypes = Object.keys(leavePolicy).filter(function (key) { return key !== 'maxCarryover' && key !== 'accrualRatePerMonth'; });
                        if (input.leaveType !== 'unpaid' && input.leaveType !== 'compassion' && !allowedLeaveTypes.includes(input.leaveType)) {
                            throw new Error("Leave type " + input.leaveType + " is not supported by the organization's configured leave policy");
                        }
                        return [4 /*yield*/, db.query.leaveBalances.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, input.employeeId), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, input.leaveType), drizzle_orm_1.eq(schema_1.leaveBalances.fiscalYear, new Date().getFullYear()))
                            })];
                    case 3:
                        balance = _e.sent();
                        requiresBalance = input.leaveType !== 'unpaid' && input.leaveType !== 'compassion';
                        if (!!balance) return [3 /*break*/, 5];
                        entitlement = (_b = leavePolicy[input.leaveType]) !== null && _b !== void 0 ? _b : 0;
                        initialAvailable = requiresBalance ? Math.max(0, entitlement - input.days) : 0;
                        if (requiresBalance && entitlement < input.days) {
                            throw new Error("Insufficient " + input.leaveType + " entitlement. Available: " + entitlement + " days");
                        }
                        balance = {
                            id: uuid_1.v4(),
                            organizationId: input.organizationId,
                            employeeId: input.employeeId,
                            leaveType: input.leaveType,
                            fiscalYear: new Date().getFullYear(),
                            totalEntitlement: entitlement,
                            accrued: entitlement,
                            used: 0,
                            pending: input.days,
                            available: initialAvailable,
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.insert(schema_1.leaveBalances).values(balance)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        availableDays = balance.available || 0;
                        if (requiresBalance && availableDays < input.days) {
                            throw new Error("Insufficient " + input.leaveType + " leave. Available: " + availableDays + " days");
                        }
                        leaveId = uuid_1.v4();
                        // Create leave request
                        return [4 /*yield*/, db.insert(schema_1.leaveRequests).values({
                                id: leaveId,
                                organizationId: input.organizationId,
                                employeeId: input.employeeId,
                                leaveType: input.leaveType,
                                startDate: input.startDate,
                                endDate: input.endDate,
                                days: input.days,
                                reason: input.reason,
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            })
                            // Update leave balance (mark as pending and adjust available days for entitlement-based leave)
                        ];
                    case 6:
                        // Create leave request
                        _e.sent();
                        leaveBalanceUpdate = {
                            pending: (balance.pending || 0) + input.days
                        };
                        if (input.leaveType !== 'unpaid' && input.leaveType !== 'compassion') {
                            leaveBalanceUpdate.available = availableDays - input.days;
                        }
                        return [4 /*yield*/, db.update(schema_1.leaveBalances)
                                .set(leaveBalanceUpdate)
                                .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))
                            // Create approval workflow
                        ];
                    case 7:
                        _e.sent();
                        // Create approval workflow
                        return [4 /*yield*/, db.insert(schema_1.approvalWorkflows).values({
                                id: uuid_1.v4(),
                                organizationId: input.organizationId,
                                workflowType: 'leave_request',
                                entityId: leaveId,
                                requestedBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                requestedAt: new Date().toISOString(),
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            })
                            // Send notification to manager
                        ];
                    case 8:
                        // Create approval workflow
                        _e.sent();
                        // Send notification to manager
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: 'manager@company.com',
                                subject: "Leave Request Pending - " + input.days + " days",
                                html: "<p>An employee has requested " + input.days + " days of " + input.leaveType + " leave from " + input.startDate + " to " + input.endDate + ". Reason: " + input.reason + "</p>"
                            })];
                    case 9:
                        // Send notification to manager
                        _e.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                                action: 'leave_requested',
                                entityType: 'leaveRequest',
                                entityId: leaveId,
                                description: "Leave request for " + input.days + " days of " + input.leaveType + " created",
                                metadata: JSON.stringify({ organizationId: input.organizationId, employeeId: input.employeeId, leaveType: input.leaveType, fiscalYear: new Date().getFullYear() }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 10:
                        _e.sent();
                        return [2 /*return*/, { leaveRequestId: leaveId }];
                }
            });
        });
    }),
    // Get leave request
    getLeaveRequest: trpc_1.publicProcedure
        .input(zod_1.z.object({ leaveRequestId: zod_1.z.string() }))
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
                            throw new Error('Database not available');
                        return [2 /*return*/, db.query.leaveRequests.findFirst({
                                where: drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId)
                            })];
                }
            });
        });
    }),
    // List leave requests
    listLeaveRequests: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        leaveType: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](50),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        query = db.select().from(schema_1.leaveRequests).where(drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, input.organizationId));
                        if (input.employeeId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.leaveRequests.employeeId, input.employeeId));
                        }
                        if (input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.leaveRequests.status, input.status));
                        }
                        if (input.leaveType) {
                            query = query.where(drizzle_orm_1.eq(schema_1.leaveRequests.leaveType, input.leaveType));
                        }
                        return [2 /*return*/, query.orderBy(drizzle_orm_1.desc(schema_1.leaveRequests.createdAt)).limit(input.limit).offset(input.offset)];
                }
            });
        });
    }),
    // Approve leave
    approveLeave: enhancedRbac_1.createFeatureRestrictedProcedure(['leave:approve', 'admin:all', 'hr:manage'])
        .input(approveLeaveSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, leaveRequest, balance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.leaveRequests.findFirst({
                                where: drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId)
                            })];
                    case 2:
                        leaveRequest = _b.sent();
                        if (!leaveRequest) {
                            throw new Error('Leave request not found');
                        }
                        // Update leave request
                        return [4 /*yield*/, db.update(schema_1.leaveRequests)
                                .set({
                                status: 'approved',
                                approvedBy: input.approverId,
                                approvalDate: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId))
                            // Update leave balance
                        ];
                    case 3:
                        // Update leave request
                        _b.sent();
                        return [4 /*yield*/, db.query.leaveBalances.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, leaveRequest.employeeId), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, leaveRequest.leaveType))
                            })];
                    case 4:
                        balance = _b.sent();
                        if (!balance) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.update(schema_1.leaveBalances)
                                .set({
                                pending: Math.max(0, (balance.pending || 0) - leaveRequest.days),
                                used: (balance.used || 0) + leaveRequest.days
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: 
                    // Create approval record
                    return [4 /*yield*/, db.insert(schema_1.leaveApprovals).values({
                            id: uuid_1.v4(),
                            organizationId: leaveRequest.organizationId,
                            leaveRequestId: input.leaveRequestId,
                            approverId: input.approverId,
                            approvalStatus: 'approved',
                            approvalComments: input.approvalComments,
                            approvalDate: new Date().toISOString(),
                            createdAt: new Date().toISOString()
                        })
                        // Update approval workflow
                    ];
                    case 7:
                        // Create approval record
                        _b.sent();
                        // Update approval workflow
                        return [4 /*yield*/, db.update(schema_1.approvalWorkflows)
                                .set({
                                status: 'approved',
                                approvedBy: input.approverId,
                                approvedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.approvalWorkflows.entityId, input.leaveRequestId))];
                    case 8:
                        // Update approval workflow
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'leave_request_approved',
                                entityType: 'leaveRequest',
                                entityId: input.leaveRequestId,
                                description: "Leave request " + input.leaveRequestId + " approved by " + input.approverId,
                                metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, leaveType: leaveRequest.leaveType }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, { leaveRequestId: input.leaveRequestId }];
                }
            });
        });
    }),
    // Reject leave
    rejectLeave: enhancedRbac_1.createFeatureRestrictedProcedure(['leave:approve', 'admin:all', 'hr:manage'])
        .input(rejectLeaveSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, leaveRequest, balance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.leaveRequests.findFirst({
                                where: drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId)
                            })];
                    case 2:
                        leaveRequest = _b.sent();
                        if (!leaveRequest) {
                            throw new Error('Leave request not found');
                        }
                        // Update leave request
                        return [4 /*yield*/, db.update(schema_1.leaveRequests)
                                .set({
                                status: 'rejected',
                                notes: input.reason
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId))
                            // Restore leave balance
                        ];
                    case 3:
                        // Update leave request
                        _b.sent();
                        return [4 /*yield*/, db.query.leaveBalances.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, leaveRequest.employeeId), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, leaveRequest.leaveType))
                            })];
                    case 4:
                        balance = _b.sent();
                        if (!balance) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.update(schema_1.leaveBalances)
                                .set({
                                pending: Math.max(0, (balance.pending || 0) - leaveRequest.days),
                                available: (balance.available || 0) + leaveRequest.days
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: 
                    // Create rejection record
                    return [4 /*yield*/, db.insert(schema_1.leaveApprovals).values({
                            id: uuid_1.v4(),
                            organizationId: leaveRequest.organizationId,
                            leaveRequestId: input.leaveRequestId,
                            approverId: ctx.user.id,
                            approvalStatus: 'rejected',
                            approvalComments: input.reason,
                            approvalDate: new Date().toISOString(),
                            createdAt: new Date().toISOString()
                        })
                        // Update approval workflow
                    ];
                    case 7:
                        // Create rejection record
                        _b.sent();
                        // Update approval workflow
                        return [4 /*yield*/, db.update(schema_1.approvalWorkflows)
                                .set({
                                status: 'rejected',
                                approverComments: input.reason,
                                approvedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.approvalWorkflows.entityId, input.leaveRequestId))];
                    case 8:
                        // Update approval workflow
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'leave_request_rejected',
                                entityType: 'leaveRequest',
                                entityId: input.leaveRequestId,
                                description: "Leave request " + input.leaveRequestId + " rejected",
                                metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, leaveType: leaveRequest.leaveType, reason: input.reason }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, { leaveRequestId: input.leaveRequestId }];
                }
            });
        });
    }),
    // Cancel leave
    cancelLeave: enhancedRbac_1.createFeatureRestrictedProcedure(['leave:manage', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({
        leaveRequestId: zod_1.z.string(),
        reason: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, leaveRequest, balance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.leaveRequests.findFirst({
                                where: drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId)
                            })];
                    case 2:
                        leaveRequest = _b.sent();
                        if (!leaveRequest || leaveRequest.status !== 'approved') {
                            throw new Error('Only approved leave can be cancelled');
                        }
                        // Update leave request
                        return [4 /*yield*/, db.update(schema_1.leaveRequests)
                                .set({
                                status: 'cancelled',
                                notes: input.reason
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.leaveRequestId))
                            // Restore leave balance
                        ];
                    case 3:
                        // Update leave request
                        _b.sent();
                        return [4 /*yield*/, db.query.leaveBalances.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, leaveRequest.employeeId), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, leaveRequest.leaveType))
                            })];
                    case 4:
                        balance = _b.sent();
                        if (!balance) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.update(schema_1.leaveBalances)
                                .set({
                                used: Math.max(0, (balance.used || 0) - leaveRequest.days),
                                available: (balance.available || 0) + leaveRequest.days
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, db_1.logActivity({
                            userId: ctx.user.id,
                            action: 'leave_request_cancelled',
                            entityType: 'leaveRequest',
                            entityId: input.leaveRequestId,
                            description: "Leave request " + input.leaveRequestId + " cancelled",
                            metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, reason: input.reason }),
                            ipAddress: getRequestIp(ctx.req)
                        })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, { leaveRequestId: input.leaveRequestId }];
                }
            });
        });
    }),
    // Get leave balance
    getLeaveBalance: trpc_1.publicProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        leaveType: zod_1.z.string().optional(),
        fiscalYear: zod_1.z.number().int().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, year, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        year = input.fiscalYear || new Date().getFullYear();
                        query = db.select().from(schema_1.leaveBalances).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, input.employeeId), drizzle_orm_1.eq(schema_1.leaveBalances.fiscalYear, year)));
                        if (input.leaveType) {
                            query = query.where(drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, input.leaveType));
                        }
                        return [2 /*return*/, query];
                }
            });
        });
    }),
    // Get leave history
    getLeaveHistory: trpc_1.publicProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        limit: zod_1.z.number().int()["default"](20)
    }))
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
                            throw new Error('Database not available');
                        return [2 /*return*/, db.select()
                                .from(schema_1.leaveRequests)
                                .where(drizzle_orm_1.eq(schema_1.leaveRequests.employeeId, input.employeeId))
                                .orderBy(drizzle_orm_1.desc(schema_1.leaveRequests.startDate))
                                .limit(input.limit)];
                }
            });
        });
    }),
    // Accrue leave (automated job, called monthly)
    accrueLeave: enhancedRbac_1.createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({
        organizationId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employees_active, accrueCount, _i, employees_active_1, emp, balance, monthlyAccrual, newAccrued;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.employees.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.organizationId, input.organizationId), drizzle_orm_1.eq(schema_1.employees.status, 'active'))
                            })];
                    case 2:
                        employees_active = _b.sent();
                        accrueCount = 0;
                        _i = 0, employees_active_1 = employees_active;
                        _b.label = 3;
                    case 3:
                        if (!(_i < employees_active_1.length)) return [3 /*break*/, 7];
                        emp = employees_active_1[_i];
                        return [4 /*yield*/, db.query.leaveBalances.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, emp.id), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, 'annual'), drizzle_orm_1.eq(schema_1.leaveBalances.fiscalYear, new Date().getFullYear()))
                            })];
                    case 4:
                        balance = _b.sent();
                        if (!balance) return [3 /*break*/, 6];
                        monthlyAccrual = Math.round(balance.totalEntitlement / 12);
                        newAccrued = (balance.accrued || 0) + monthlyAccrual;
                        return [4 /*yield*/, db.update(schema_1.leaveBalances)
                                .set({
                                accrued: newAccrued,
                                available: newAccrued - (balance.used || 0)
                            })
                                .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))];
                    case 5:
                        _b.sent();
                        accrueCount++;
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, { employeesProcessed: accrueCount }];
                }
            });
        });
    }),
    // Get leave analytics
    getLeaveAnalytics: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        fiscalYear: zod_1.z.number().int().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var year, requests, approved, pending, rejected, totalDays;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        year = input.fiscalYear || new Date().getFullYear();
                        return [4 /*yield*/, db.query.leaveRequests.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.leaveRequests.startDate, new Date(year + "-01-01").toISOString()), drizzle_orm_1.lte(schema_1.leaveRequests.startDate, new Date(year + "-12-31").toISOString()))
                            })];
                    case 1:
                        requests = _b.sent();
                        approved = requests.filter(function (r) { return r.status === 'approved'; }).length;
                        pending = requests.filter(function (r) { return r.status === 'pending'; }).length;
                        rejected = requests.filter(function (r) { return r.status === 'rejected'; }).length;
                        totalDays = requests.filter(function (r) { return r.status === 'approved'; }).reduce(function (sum, r) { return sum + r.days; }, 0);
                        return [2 /*return*/, { approved: approved, pending: pending, rejected: rejected, totalDays: totalDays, totalRequests: requests.length }];
                }
            });
        });
    })
});
