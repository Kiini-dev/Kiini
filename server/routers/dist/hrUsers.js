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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.hrUsersRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var mail_1 = require("../_core/mail");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var bcrypt = require("bcryptjs");
var createUserSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    role: zod_1.z["enum"](['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'])["default"]('staff'),
    customRoleId: zod_1.z.string().optional(),
    position: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    employeeId: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8).optional()
});
var updateUserSchema = createUserSchema.partial().extend({
    id: zod_1.z.string()
});
var resetPasswordSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8)
});
var changeUserRoleSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    newRole: zod_1.z["enum"](['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager']),
    effectiveDate: zod_1.z.string().datetime()
});
exports.hrUsersRouter = trpc_1.router({
    // Create user
    createUser: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(createUserSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existingUser, userId, hashedPassword, _b, resetToken, resetUrl;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.email, input.email)
                            })];
                    case 2:
                        existingUser = _c.sent();
                        if (existingUser) {
                            throw new Error('Email already in use');
                        }
                        userId = uuid_1.v4();
                        if (!input.password) return [3 /*break*/, 4];
                        return [4 /*yield*/, bcrypt.hash(input.password, 10)];
                    case 3:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, bcrypt.hash(Math.random().toString(36), 10)
                        // Create user
                    ];
                    case 5:
                        _b = _c.sent();
                        _c.label = 6;
                    case 6:
                        hashedPassword = _b;
                        // Create user
                        return [4 /*yield*/, db.insert(schema_1.users).values({
                                id: userId,
                                name: input.name,
                                email: input.email,
                                passwordHash: hashedPassword,
                                role: input.role,
                                customRoleId: input.customRoleId,
                                organizationId: input.organizationId,
                                position: input.position,
                                department: input.department,
                                phone: input.phone,
                                isActive: 1,
                                createdAt: new Date().toISOString()
                            })
                            // Link to employee if provided
                        ];
                    case 7:
                        // Create user
                        _c.sent();
                        if (!input.employeeId) return [3 /*break*/, 9];
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({ userId: userId })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        if (!input.organizationId) return [3 /*break*/, 11];
                        return [4 /*yield*/, db.insert(schema_1.organizationUsers).values({
                                id: uuid_1.v4(),
                                organizationId: input.organizationId,
                                name: input.name,
                                email: input.email,
                                role: input.role,
                                position: input.position,
                                department: input.department,
                                phone: input.phone,
                                isActive: 1,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString()
                            })];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11:
                        resetToken = uuid_1.v4();
                        resetUrl = process.env.APP_URL + "/auth/reset-password?token=" + resetToken;
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.email,
                                subject: 'Welcome! Set your password',
                                html: "<p>Dear " + input.name + ",</p><p>Your account has been created. <a href=\"" + resetUrl + "\">Click here to set your password</a></p>"
                            })];
                    case 12:
                        _c.sent();
                        return [2 /*return*/, { userId: userId, email: input.email }];
                }
            });
        });
    }),
    // Get user
    getUser: trpc_1.publicProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user, passwordHash, userWithoutPassword;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user)
                            return [2 /*return*/, null
                                // Don't return password hash
                            ];
                        passwordHash = user.passwordHash, userWithoutPassword = __rest(user, ["passwordHash"]);
                        return [2 /*return*/, userWithoutPassword];
                }
            });
        });
    }),
    // List users
    listUsers: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        role: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        search: zod_1.z.string().optional(),
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
                        query = db.select().from(schema_1.users);
                        if (input.organizationId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.users.organizationId, input.organizationId));
                        }
                        if (input.role) {
                            query = query.where(drizzle_orm_1.eq(schema_1.users.role, input.role));
                        }
                        if (input.isActive !== undefined) {
                            query = query.where(drizzle_orm_1.eq(schema_1.users.isActive, input.isActive ? 1 : 0));
                        }
                        if (input.search) {
                            query = query.where(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " LIKE ", " OR ", " LIKE ", ""], ["", " LIKE ", " OR ", " LIKE ", ""])), schema_1.users.name, "%" + input.search + "%", schema_1.users.email, "%" + input.search + "%"));
                        }
                        return [2 /*return*/, query.orderBy(drizzle_orm_1.desc(schema_1.users.createdAt)).limit(input.limit).offset(input.offset)];
                }
            });
        });
    }),
    // Update user
    updateUser: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(updateUserSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, password, updateData, hashedPassword;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        id = input.id, password = input.password, updateData = __rest(input
                        // If password is provided, hash it
                        , ["id", "password"]);
                        if (!password) return [3 /*break*/, 3];
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 2:
                        hashedPassword = _b.sent();
                        updateData.passwordHash = hashedPassword;
                        _b.label = 3;
                    case 3: return [4 /*yield*/, db.update(schema_1.users)
                            .set(__assign(__assign({}, updateData), { updatedAt: new Date().toISOString() }))
                            .where(drizzle_orm_1.eq(schema_1.users.id, id))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { userId: id }];
                }
            });
        });
    }),
    // Reset user password
    resetUserPassword: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(resetPasswordSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user, hashedPassword;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            throw new Error('User not found');
                        }
                        return [4 /*yield*/, bcrypt.hash(input.newPassword, 10)];
                    case 3:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, db.update(schema_1.users)
                                .set({ passwordHash: hashedPassword })
                                .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))
                            // Send password reset notification
                        ];
                    case 4:
                        _b.sent();
                        // Send password reset notification
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: user.email,
                                subject: 'Your password has been reset',
                                html: "<p>Dear " + user.name + ",</p><p>Your password has been reset by an administrator.</p>"
                            })];
                    case 5:
                        // Send password reset notification
                        _b.sent();
                        return [2 /*return*/, { userId: input.userId }];
                }
            });
        });
    }),
    // Toggle user status
    toggleUserStatus: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        isActive: zod_1.z.boolean(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            throw new Error('User not found');
                        }
                        return [4 /*yield*/, db.update(schema_1.users)
                                .set({ isActive: input.isActive ? 1 : 0 })
                                .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))];
                    case 3:
                        _b.sent();
                        if (!!input.isActive) return [3 /*break*/, 5];
                        // Send deactivation email
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: user.email,
                                subject: 'Your account has been deactivated',
                                html: "<p>Dear " + user.name + ",</p><p>Your account has been deactivated. " + (input.reason ? "Reason: " + input.reason : '') + "</p>"
                            })];
                    case 4:
                        // Send deactivation email
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { userId: input.userId, isActive: input.isActive }];
                }
            });
        });
    }),
    // Change user role
    changeUserRole: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(changeUserRoleSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            throw new Error('User not found');
                        }
                        return [4 /*yield*/, db.update(schema_1.users)
                                .set({ role: input.newRole })
                                .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))
                            // Send role change notification
                        ];
                    case 3:
                        _b.sent();
                        // Send role change notification
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: user.email,
                                subject: 'Your role has been changed',
                                html: "<p>Dear " + user.name + ",</p><p>Your role has been changed to: " + input.newRole + ". This change is effective from " + input.effectiveDate + "</p>"
                            })];
                    case 4:
                        // Send role change notification
                        _b.sent();
                        return [2 /*return*/, { userId: input.userId, newRole: input.newRole }];
                }
            });
        });
    }),
    // Soft delete user
    deleteUser: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            throw new Error('User not found');
                        }
                        // Create deletion record (soft delete)
                        return [4 /*yield*/, db.insert(schema_1.userDeletions).values({
                                id: uuid_1.v4(),
                                userId: input.userId,
                                userName: user.name,
                                userEmail: user.email,
                                deletedReason: input.reason,
                                deletedBy: ctx.user.id,
                                deletedAt: new Date().toISOString(),
                                archived: 1,
                                createdAt: new Date().toISOString()
                            })
                            // Deactivate user
                        ];
                    case 3:
                        // Create deletion record (soft delete)
                        _b.sent();
                        // Deactivate user
                        return [4 /*yield*/, db.update(schema_1.users)
                                .set({ isActive: 0 })
                                .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))];
                    case 4:
                        // Deactivate user
                        _b.sent();
                        return [2 /*return*/, { userId: input.userId, deleted: true }];
                }
            });
        });
    }),
    // Restore deleted user
    restoreUser: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, deletion;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.update(schema_1.users)
                                .set({ isActive: 1 })
                                .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))
                            // Update deletion record
                        ];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.query.userDeletions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.userDeletions.userId, input.userId)
                            })];
                    case 3:
                        deletion = _b.sent();
                        if (!deletion) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.update(schema_1.userDeletions)
                                .set({ restoredAt: new Date().toISOString(), restoredBy: ctx.user.id, archived: 0 })
                                .where(drizzle_orm_1.eq(schema_1.userDeletions.id, deletion.id))];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { userId: input.userId, restored: true }];
                }
            });
        });
    }),
    // Get user sessions (active logins)
    getUserSessions: trpc_1.publicProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // This would query activeSessions table
                // Returns list of active sessions for the user
                return [2 /*return*/, []];
            });
        });
    }),
    // Get user activity log
    getUserActivityLog: trpc_1.publicProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        limit: zod_1.z.number().int()["default"](20),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // This would query activityLog table
                // Returns user's recent activities
                return [2 /*return*/, []];
            });
        });
    }),
    // Search users
    searchUsers: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        query: zod_1.z.string(),
        limit: zod_1.z.number().int()["default"](10)
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
                                .from(schema_1.users)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.organizationId, input.organizationId), drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " LIKE ", " OR ", " LIKE ", ""], ["", " LIKE ", " OR ", " LIKE ", ""])), schema_1.users.name, "%" + input.query + "%", schema_1.users.email, "%" + input.query + "%")))
                                .limit(input.limit)];
                }
            });
        });
    }),
    // Get user permissions
    getUserPermissions: trpc_1.publicProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user, basePermissions, customRole, customPerms;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, input.userId)
                            })];
                    case 2:
                        user = _b.sent();
                        if (!user)
                            return [2 /*return*/, null
                                // Build permissions based on role and custom role
                            ];
                        basePermissions = getPermissionsByRole(user.role);
                        if (!user.customRoleId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.query.customRoles.findFirst({
                                where: drizzle_orm_1.eq(schema_1.customRoles.id, user.customRoleId)
                            })];
                    case 3:
                        customRole = _b.sent();
                        if (customRole === null || customRole === void 0 ? void 0 : customRole.permissions) {
                            customPerms = JSON.parse(customRole.permissions);
                            return [2 /*return*/, __spreadArrays(basePermissions, customPerms)];
                        }
                        _b.label = 4;
                    case 4: return [2 /*return*/, basePermissions];
                }
            });
        });
    }),
    // Bulk create users (from CSV)
    bulkCreateUsers: enhancedRbac_1.createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        users: zod_1.z.array(createUserSchema)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, _i, _b, userData, userId, hashedPassword, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        results = [];
                        _i = 0, _b = input.users;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        userData = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 6, , 7]);
                        userId = uuid_1.v4();
                        return [4 /*yield*/, bcrypt.hash(Math.random().toString(36), 10)];
                    case 4:
                        hashedPassword = _c.sent();
                        return [4 /*yield*/, db.insert(schema_1.users).values({
                                id: userId,
                                name: userData.name,
                                email: userData.email,
                                passwordHash: hashedPassword,
                                role: userData.role,
                                organizationId: input.organizationId,
                                isActive: 1,
                                createdAt: new Date().toISOString()
                            })];
                    case 5:
                        _c.sent();
                        results.push({ email: userData.email, status: 'success', userId: userId });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        results.push({ email: userData.email, status: 'failed', error: error_1.message });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { results: results, processed: results.length }];
                }
            });
        });
    })
});
// Helper function to get default permissions by role
function getPermissionsByRole(role) {
    var rolePermissions = {
        super_admin: ['*'],
        admin: ['user:*', 'org:*', 'billing:*', 'hr:*', 'payroll:*'],
        hr: ['hr:*', 'leave:*', 'attendance:*', 'user:view'],
        accountant: ['payroll:*', 'billing:*', 'finance:*'],
        project_manager: ['project:*', 'task:*'],
        manager: ['hr:view', 'team:manage', 'task:manage'],
        staff: ['task:view', 'leave:request', 'timesheet:submit'],
        user: ['profile:view']
    };
    return rolePermissions[role] || rolePermissions['user'];
}
var templateObject_1, templateObject_2;
