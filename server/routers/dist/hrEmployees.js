"use strict";
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
exports.hrEmployeesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var mail_1 = require("../_core/mail");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var createEmployeeSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    employeeNumber: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    gender: zod_1.z["enum"](['male', 'female', 'other']).optional(),
    maritalStatus: zod_1.z["enum"](['single', 'married', 'divorced', 'widowed']).optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    hireDate: zod_1.z.string().datetime(),
    departmentId: zod_1.z.string(),
    jobGroupId: zod_1.z.string(),
    salary: zod_1.z.number().int(),
    employmentType: zod_1.z["enum"](['full_time', 'part_time', 'contract', 'intern', 'contractual', 'hourly', 'wage', 'temporary', 'seasonal']),
    address: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
    bankBranch: zod_1.z.string().optional(),
    bankAccountNumber: zod_1.z.string().optional(),
    nhifNumber: zod_1.z.string().optional(),
    nssfNumber: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
    nationalId: zod_1.z.string().optional()
});
var updateEmployeeSchema = createEmployeeSchema.partial().extend({
    id: zod_1.z.string()
});
var promoteEmployeeSchema = zod_1.z.object({
    employeeId: zod_1.z.string(),
    newJobGroupId: zod_1.z.string(),
    newSalary: zod_1.z.number().int(),
    promotionDate: zod_1.z.string().datetime(),
    promotionReason: zod_1.z.string(),
    approvedBy: zod_1.z.string().optional()
});
var transferEmployeeSchema = zod_1.z.object({
    employeeId: zod_1.z.string(),
    newDepartmentId: zod_1.z.string(),
    transferDate: zod_1.z.string().datetime(),
    transferReason: zod_1.z.string(),
    approvedBy: zod_1.z.string().optional()
});
exports.hrEmployeesRouter = trpc_1.router({
    // Create employee
    createEmployee: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(createEmployeeSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, newEmployee, checklistId, tasks, _i, tasks_1, task, leaveTypes, _b, leaveTypes_1, leaveType, entitlement, fullName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.employees).values({
                                id: id,
                                organizationId: input.organizationId,
                                employeeNumber: input.employeeNumber,
                                firstName: input.firstName,
                                lastName: input.lastName,
                                email: input.email,
                                phone: input.phone,
                                gender: input.gender,
                                maritalStatus: input.maritalStatus,
                                dateOfBirth: input.dateOfBirth,
                                hireDate: input.hireDate,
                                department: input.departmentId,
                                jobGroupId: input.jobGroupId,
                                salary: input.salary,
                                employmentType: input.employmentType,
                                address: input.address,
                                bankName: input.bankName,
                                bankBranch: input.bankBranch,
                                bankAccountNumber: input.bankAccountNumber,
                                nhifNumber: input.nhifNumber,
                                nssfNumber: input.nssfNumber,
                                taxId: input.taxId,
                                nationalId: input.nationalId,
                                status: 'active',
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString()
                            })
                            // Create onboarding checklist
                        ];
                    case 2:
                        newEmployee = _c.sent();
                        checklistId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.onboardingChecklists).values({
                                id: checklistId,
                                organizationId: input.organizationId,
                                employeeId: id,
                                jobGroupId: input.jobGroupId,
                                startDate: input.hireDate,
                                status: 'in_progress',
                                createdAt: new Date().toISOString()
                            })
                            // Create default onboarding tasks
                        ];
                    case 3:
                        _c.sent();
                        tasks = [
                            { category: 'it_setup', name: 'Laptop & Email Setup', assignedTo: 'ict_manager' },
                            { category: 'it_setup', name: 'System Access & VPN', assignedTo: 'ict_manager' },
                            { category: 'paperwork', name: 'Contract Signing', assignedTo: 'hr' },
                            { category: 'paperwork', name: 'Tax Forms (P9)', assignedTo: 'hr' },
                            { category: 'paperwork', name: 'Insurance Forms', assignedTo: 'hr' },
                            { category: 'training', name: 'Company Induction', assignedTo: 'hr' },
                            { category: 'training', name: 'Department Orientation', assignedTo: 'manager' },
                            { category: 'introduction', name: 'Meet the Team', assignedTo: 'manager' },
                        ];
                        _i = 0, tasks_1 = tasks;
                        _c.label = 4;
                    case 4:
                        if (!(_i < tasks_1.length)) return [3 /*break*/, 7];
                        task = tasks_1[_i];
                        return [4 /*yield*/, db.insert(schema_1.onboardingTasks).values({
                                id: uuid_1.v4(),
                                organizationId: input.organizationId,
                                checklistId: checklistId,
                                taskName: task.name,
                                category: task.category,
                                priority: 'high',
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'compassion'];
                        _b = 0, leaveTypes_1 = leaveTypes;
                        _c.label = 8;
                    case 8:
                        if (!(_b < leaveTypes_1.length)) return [3 /*break*/, 11];
                        leaveType = leaveTypes_1[_b];
                        entitlement = leaveType === 'annual' ? 21 : leaveType === 'sick' ? 10 : 0;
                        return [4 /*yield*/, db.insert(schema_1.leaveBalances).values({
                                id: uuid_1.v4(),
                                organizationId: input.organizationId,
                                employeeId: id,
                                fiscalYear: new Date().getFullYear(),
                                leaveType: leaveType,
                                totalEntitlement: entitlement,
                                accrued: 0,
                                used: 0,
                                available: entitlement,
                                createdAt: new Date().toISOString()
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        _b++;
                        return [3 /*break*/, 8];
                    case 11:
                        fullName = input.firstName + " " + input.lastName;
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.email,
                                subject: 'Welcome to the Company!',
                                html: "<p>Dear " + fullName + ",</p><p>Welcome to our organization! Your onboarding journey begins now. Please check your portal for tasks and orientation materials.</p>"
                            })];
                    case 12:
                        _c.sent();
                        return [2 /*return*/, { id: id, employeeNumber: input.employeeNumber }];
                }
            });
        });
    }),
    // Get employee details
    getEmployee: trpc_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.employees.findFirst({
                                where: drizzle_orm_1.eq(schema_1.employees.id, input.id)
                            })];
                    case 2:
                        employee = _b.sent();
                        return [2 /*return*/, employee];
                }
            });
        });
    }),
    // List employees with filters
    listEmployees: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        department: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](50),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, total, records;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        query = db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.organizationId, input.organizationId));
                        if (input.department) {
                            query = query.where(drizzle_orm_1.eq(schema_1.employees.department, input.department));
                        }
                        if (input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.employees.status, input.status));
                        }
                        if (input.search) {
                            query = query.where(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " LIKE ", " OR ", " LIKE ", " OR ", " LIKE ", ""], ["", " LIKE ", " OR ", " LIKE ", " OR ", " LIKE ", ""])), schema_1.employees.firstName, "%" + input.search + "%", schema_1.employees.lastName, "%" + input.search + "%", schema_1.employees.email, "%" + input.search + "%"));
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        total = _b.sent();
                        return [4 /*yield*/, query.limit(input.limit).offset(input.offset)];
                    case 3:
                        records = _b.sent();
                        return [2 /*return*/, { records: records, total: total.length }];
                }
            });
        });
    }),
    // Update employee
    updateEmployee: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(updateEmployeeSchema)
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
                        return [4 /*yield*/, db.update(schema_1.employees).set(data).where(drizzle_orm_1.eq(schema_1.employees.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    // Promote employee
    promoteEmployee: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(promoteEmployeeSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee, promotionId, previousJobGroupId, previousSalary;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.employees.findFirst({
                                where: drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)
                            })];
                    case 2:
                        employee = _b.sent();
                        if (!employee)
                            throw new Error('Employee not found');
                        promotionId = uuid_1.v4();
                        previousJobGroupId = employee.jobGroupId;
                        previousSalary = employee.salary || 0;
                        // Record promotion
                        return [4 /*yield*/, db.insert(schema_1.employeePromotions).values({
                                id: promotionId,
                                organizationId: employee.organizationId,
                                employeeId: input.employeeId,
                                promotionDate: input.promotionDate,
                                previousJobGroupId: previousJobGroupId,
                                newJobGroupId: input.newJobGroupId,
                                previousSalary: previousSalary,
                                newSalary: input.newSalary,
                                promotionReason: input.promotionReason,
                                approvedBy: input.approvedBy || ctx.user.id,
                                approvalDate: input.approvedBy ? new Date().toISOString() : undefined,
                                createdAt: new Date().toISOString()
                            })
                            // Update employee job group and salary
                        ];
                    case 3:
                        // Record promotion
                        _b.sent();
                        // Update employee job group and salary
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({ jobGroupId: input.newJobGroupId, salary: input.newSalary })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))
                            // Send promotion notification
                        ];
                    case 4:
                        // Update employee job group and salary
                        _b.sent();
                        // Send promotion notification
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: employee.email,
                                subject: 'Promotion Notification',
                                html: "<p>Dear " + employee.firstName + ",</p><p>Congratulations on your promotion! Your new salary is KES " + input.newSalary.toLocaleString() + ". Details will follow from the HR team.</p>"
                            })];
                    case 5:
                        // Send promotion notification
                        _b.sent();
                        return [2 /*return*/, { promotionId: promotionId }];
                }
            });
        });
    }),
    // Transfer employee
    transferEmployee: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(transferEmployeeSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee, transferId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.employees.findFirst({
                                where: drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)
                            })];
                    case 2:
                        employee = _b.sent();
                        if (!employee)
                            throw new Error('Employee not found');
                        transferId = uuid_1.v4();
                        // Record transfer
                        return [4 /*yield*/, db.insert(schema_1.employeeTransfers).values({
                                id: transferId,
                                organizationId: employee.organizationId,
                                employeeId: input.employeeId,
                                transferDate: input.transferDate,
                                previousDepartmentId: employee.department || '',
                                newDepartmentId: input.newDepartmentId,
                                transferReason: input.transferReason,
                                approvedBy: input.approvedBy || ctx.user.id,
                                approvalDate: input.approvedBy ? new Date().toISOString() : undefined,
                                createdAt: new Date().toISOString()
                            })
                            // Update employee department
                        ];
                    case 3:
                        // Record transfer
                        _b.sent();
                        // Update employee department
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({ department: input.newDepartmentId })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))];
                    case 4:
                        // Update employee department
                        _b.sent();
                        return [2 /*return*/, { transferId: transferId }];
                }
            });
        });
    }),
    // Terminate employee
    terminateEmployee: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        terminationDate: zod_1.z.string().datetime(),
        reason: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.employees.findFirst({
                                where: drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)
                            })];
                    case 2:
                        employee = _b.sent();
                        if (!employee)
                            throw new Error('Employee not found');
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({ status: 'terminated' })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { employeeId: input.employeeId }];
                }
            });
        });
    }),
    // Get employee history (promotions, transfers, leave, payroll)
    getEmployeeHistory: trpc_1.publicProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, promotions, transfers;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.employeePromotions.findMany({
                                where: drizzle_orm_1.eq(schema_1.employeePromotions.employeeId, input.employeeId)
                            })];
                    case 2:
                        promotions = _b.sent();
                        return [4 /*yield*/, db.query.employeeTransfers.findMany({
                                where: drizzle_orm_1.eq(schema_1.employeeTransfers.employeeId, input.employeeId)
                            })];
                    case 3:
                        transfers = _b.sent();
                        return [2 /*return*/, { promotions: promotions, transfers: transfers }];
                }
            });
        });
    }),
    // Add employee skill
    addEmployeeSkill: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        employeeId: zod_1.z.string(),
        skillName: zod_1.z.string(),
        proficiencyLevel: zod_1.z["enum"](['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: zod_1.z.number().int().optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, skillId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        skillId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.employeeSkills).values({
                                id: skillId,
                                organizationId: input.organizationId,
                                employeeId: input.employeeId,
                                skillName: input.skillName,
                                proficiencyLevel: input.proficiencyLevel,
                                yearsOfExperience: input.yearsOfExperience || 0,
                                certifications: input.certifications ? JSON.stringify(input.certifications) : null,
                                createdAt: new Date().toISOString()
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { skillId: skillId }];
                }
            });
        });
    }),
    // Get employee skills
    getEmployeeSkills: trpc_1.publicProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, db.query.employeeSkills.findMany({
                        where: drizzle_orm_1.eq(schema_1.employeeSkills.employeeId, input.employeeId)
                    })];
            });
        });
    }),
    // Get onboarding progress
    getOnboardingProgress: trpc_1.publicProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var checklist, tasks, completedTasks, progress;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.query.onboardingChecklists.findFirst({
                            where: drizzle_orm_1.eq(schema_1.onboardingChecklists.employeeId, input.employeeId)
                        })];
                    case 1:
                        checklist = _b.sent();
                        return [4 /*yield*/, db.query.onboardingTasks.findMany({
                                where: drizzle_orm_1.eq(schema_1.onboardingTasks.checklistId, (checklist === null || checklist === void 0 ? void 0 : checklist.id) || '')
                            })];
                    case 2:
                        tasks = _b.sent();
                        completedTasks = tasks.filter(function (t) { return t.status === 'completed'; }).length;
                        progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
                        return [2 /*return*/, { checklist: checklist, tasks: tasks, progress: Math.round(progress) }];
                }
            });
        });
    }),
    // Complete onboarding task
    completeOnboardingTask: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(zod_1.z.object({
        taskId: zod_1.z.string(),
        completedBy: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.update(schema_1.onboardingTasks)
                            .set({
                            status: 'completed',
                            completedBy: input.completedBy,
                            completedDate: new Date().toISOString()
                        })
                            .where(drizzle_orm_1.eq(schema_1.onboardingTasks.id, input.taskId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { taskId: input.taskId }];
                }
            });
        });
    }),
    // Get employee count by department
    getEmployeeCountByDepartment: trpc_1.publicProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, db.select({
                        department: schema_1.employees.department,
                        count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))).mapWith(Number)
                    })
                        .from(schema_1.employees)
                        .where(drizzle_orm_1.eq(schema_1.employees.organizationId, input.organizationId))
                        .groupBy(schema_1.employees.department)];
            });
        });
    })
});
var templateObject_1, templateObject_2;
