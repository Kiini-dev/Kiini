"use strict";
/**
 * User Management Database Helpers
 * Handles all user-related database operations
 */
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
exports.updatePassword = exports.getDepartmentMembers = exports.userHasPermission = exports.getRolePermissions = exports.updateTaskStatus = exports.getUserTasks = exports.getDepartmentTasks = exports.createStaffTask = exports.getProjectComments = exports.addProjectComment = exports.getProjectTeam = exports.getUserProjects = exports.assignUserToProject = exports.hardDeleteUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.getUserById = exports.getAllUsers = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../drizzle/schema");
var schema_extended_1 = require("../drizzle/schema-extended");
var db_1 = require("./db");
/**
 * Get all users with optional filtering by search, role, and organization
 */
function getAllUsers(searchTerm, role, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    conditions = [];
                    if (searchTerm) {
                        conditions.push(drizzle_orm_1.like(schema_1.users.name, "%" + searchTerm + "%"));
                    }
                    if (role) {
                        conditions.push(drizzle_orm_1.eq(schema_1.users.role, role));
                    }
                    if (organizationId) {
                        conditions.push(drizzle_orm_1.eq(schema_1.users.organizationId, organizationId));
                    }
                    if (!(conditions.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.select().from(schema_1.users).where(drizzle_orm_1.and.apply(void 0, conditions))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, db.select().from(schema_1.users)];
                case 5: return [2 /*return*/, _a.sent()];
                case 6:
                    error_1 = _a.sent();
                    console.error("[Database] Failed to get users:", error_1);
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.getAllUsers = getAllUsers;
/**
 * Get a single user by ID
 */
function getUserById(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, undefined];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : undefined];
                case 4:
                    error_2 = _a.sent();
                    console.error("[Database] Failed to get user:", error_2);
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserById = getUserById;
/**
 * Get a single user by email
 */
function getUserByEmail(email) {
    return __awaiter(this, void 0, Promise, function () {
        var db, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, undefined];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.email, email))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : undefined];
                case 4:
                    error_3 = _a.sent();
                    console.error("[Database] Failed to get user by email:", error_3);
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserByEmail = getUserByEmail;
/**
 * Create a new user
 */
function createUser(userData) {
    return __awaiter(this, void 0, Promise, function () {
        var db, now, newUser, memberId, omErr_1, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("[Database] Database connection failed");
                        return [2 /*return*/, null];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    newUser = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role || "user",
                        department: userData.department,
                        isActive: userData.isActive !== false ? 1 : 0,
                        clientId: userData.clientId,
                        organizationId: userData.organizationId,
                        permissions: userData.permissions,
                        loginMethod: userData.loginMethod,
                        passwordHash: userData.passwordHash,
                        requiresPasswordChange: userData.requiresPasswordChange !== undefined ? userData.requiresPasswordChange : 1,
                        createdAt: userData.createdAt || now,
                        lastSignedIn: userData.lastSignedIn
                    };
                    console.log("[Database] Creating user with data:", {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        isActive: newUser.isActive,
                        createdAt: newUser.createdAt
                    });
                    return [4 /*yield*/, db.insert(schema_1.users).values(newUser)];
                case 3:
                    _a.sent();
                    if (!userData.organizationId) return [3 /*break*/, 7];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    memberId = "om_" + userData.id;
                    return [4 /*yield*/, db.insert(schema_extended_1.organizationMembers).values({
                            id: memberId,
                            organizationId: userData.organizationId,
                            userId: userData.id,
                            role: userData.role || "user",
                            status: "active",
                            isActive: true,
                            joinedAt: new Date()
                        }).onDuplicateKeyUpdate({ set: { status: "active", isActive: true, updatedAt: new Date() } })];
                case 5:
                    _a.sent();
                    console.log("[Database] Added user to organizationMembers:", memberId);
                    return [3 /*break*/, 7];
                case 6:
                    omErr_1 = _a.sent();
                    console.warn("[Database] Failed to add org member (non-fatal):", omErr_1 === null || omErr_1 === void 0 ? void 0 : omErr_1.message);
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, getUserById(userData.id)];
                case 8:
                    result = _a.sent();
                    console.log("[Database] User created successfully:", result === null || result === void 0 ? void 0 : result.id);
                    return [2 /*return*/, result || null];
                case 9:
                    error_4 = _a.sent();
                    console.error("[Database] Failed to create user:", {
                        message: error_4 === null || error_4 === void 0 ? void 0 : error_4.message,
                        code: error_4 === null || error_4 === void 0 ? void 0 : error_4.code,
                        errno: error_4 === null || error_4 === void 0 ? void 0 : error_4.errno,
                        sqlMessage: error_4 === null || error_4 === void 0 ? void 0 : error_4.sqlMessage,
                        sql: error_4 === null || error_4 === void 0 ? void 0 : error_4.sql
                    });
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.createUser = createUser;
/**
 * Update an existing user
 */
function updateUser(userId, updates) {
    return __awaiter(this, void 0, Promise, function () {
        var db, updateData, result_1, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    updateData = {};
                    // Core user fields
                    if (updates.name !== undefined)
                        updateData.name = updates.name;
                    if (updates.email !== undefined)
                        updateData.email = updates.email;
                    if (updates.role !== undefined)
                        updateData.role = updates.role;
                    if (updates.department !== undefined)
                        updateData.department = updates.department;
                    if (updates.isActive !== undefined)
                        updateData.isActive = updates.isActive ? 1 : 0;
                    if (updates.clientId !== undefined)
                        updateData.clientId = updates.clientId;
                    if (updates.permissions !== undefined)
                        updateData.permissions = updates.permissions;
                    if (updates.passwordHash !== undefined)
                        updateData.passwordHash = updates.passwordHash;
                    if (updates.organizationId !== undefined)
                        updateData.organizationId = updates.organizationId;
                    // Profile fields
                    if (updates.phone !== undefined)
                        updateData.phone = updates.phone;
                    if (updates.company !== undefined)
                        updateData.company = updates.company;
                    if (updates.position !== undefined)
                        updateData.position = updates.position;
                    if (updates.address !== undefined)
                        updateData.address = updates.address;
                    if (updates.city !== undefined)
                        updateData.city = updates.city;
                    if (updates.country !== undefined)
                        updateData.country = updates.country;
                    if (updates.photoUrl !== undefined)
                        updateData.photoUrl = updates.photoUrl;
                    if (!(Object.keys(updateData).length === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getUserById(userId)];
                case 3:
                    result_1 = _a.sent();
                    return [2 /*return*/, result_1 || null];
                case 4: return [4 /*yield*/, db.update(schema_1.users).set(updateData).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, getUserById(userId)];
                case 6:
                    result = _a.sent();
                    return [2 /*return*/, result || null];
                case 7:
                    error_5 = _a.sent();
                    console.error("[Database] Failed to update user:", error_5);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.updateUser = updateUser;
/**
 * Delete a user
 */
function deleteUser(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    // Soft delete by marking as inactive
                    return [4 /*yield*/, db.update(schema_1.users).set({ isActive: 0 }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 3:
                    // Soft delete by marking as inactive
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    error_6 = _a.sent();
                    console.error("[Database] Failed to delete user:", error_6);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.deleteUser = deleteUser;
/**
 * Permanently hard delete a user from the database
 * This removes all user records and associated data
 * Only for inactive users (safety check must be done in router)
 */
function hardDeleteUser(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, _a, _b, error_7;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 15, , 16]);
                    // Hard delete - completely remove from database
                    // First, delete related records to maintain referential integrity
                    // Delete activity logs
                    return [4 /*yield*/, db["delete"](schema_1.activityLog).where(drizzle_orm_1.eq(schema_1.activityLog.userId, userId))];
                case 3:
                    // Hard delete - completely remove from database
                    // First, delete related records to maintain referential integrity
                    // Delete activity logs
                    _c.sent();
                    // Delete audit logs
                    return [4 /*yield*/, db["delete"](schema_1.auditLogs).where(drizzle_orm_1.eq(schema_1.auditLogs.userId, userId))];
                case 4:
                    // Delete audit logs
                    _c.sent();
                    // Nullify settings updatedBy references for this user
                    return [4 /*yield*/, db.update(schema_1.settings).set({ updatedBy: null }).where(drizzle_orm_1.eq(schema_1.settings.updatedBy, userId))];
                case 5:
                    // Nullify settings updatedBy references for this user
                    _c.sent();
                    // Delete user roles
                    return [4 /*yield*/, db["delete"](schema_1.userRoles).where(drizzle_orm_1.eq(schema_1.userRoles.userId, userId))];
                case 6:
                    // Delete user roles
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, db["delete"](schema_1.apiKeys).where(drizzle_orm_1.eq(schema_1.apiKeys.userId, userId))];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _a = _c.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, db["delete"](schema_1.webhooks).where(drizzle_orm_1.eq(schema_1.webhooks.userId, userId))];
                case 11:
                    _c.sent();
                    return [3 /*break*/, 13];
                case 12:
                    _b = _c.sent();
                    return [3 /*break*/, 13];
                case 13: 
                // Finally, delete the user record itself
                return [4 /*yield*/, db["delete"](schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 14:
                    // Finally, delete the user record itself
                    _c.sent();
                    console.log("[Database] User " + userId + " permanently deleted from system");
                    return [2 /*return*/, true];
                case 15:
                    error_7 = _c.sent();
                    console.error("[Database] Failed to hard delete user:", error_7);
                    return [2 /*return*/, false];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.hardDeleteUser = hardDeleteUser;
/**
 * Assign a user to a project
 */
function assignUserToProject(userId, projectId, role) {
    if (role === void 0) { role = "developer"; }
    return __awaiter(this, void 0, Promise, function () {
        var db, id, assignment, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    id = "upa_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    assignment = {
                        id: id,
                        userId: userId,
                        projectId: projectId,
                        role: role,
                        isActive: 1
                    };
                    return [4 /*yield*/, db.insert(schema_1.userProjectAssignments).values(assignment)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, assignment];
                case 4:
                    error_8 = _a.sent();
                    console.error("[Database] Failed to assign user to project:", error_8);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.assignUserToProject = assignUserToProject;
/**
 * Get projects assigned to a user
 */
function getUserProjects(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.userProjectAssignments)
                            .where(drizzle_orm_1.eq(schema_1.userProjectAssignments.userId, userId))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_9 = _a.sent();
                    console.error("[Database] Failed to get user projects:", error_9);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserProjects = getUserProjects;
/**
 * Get team members for a project
 */
function getProjectTeam(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.userProjectAssignments)
                            .where(drizzle_orm_1.eq(schema_1.userProjectAssignments.projectId, projectId))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_10 = _a.sent();
                    console.error("[Database] Failed to get project team:", error_10);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getProjectTeam = getProjectTeam;
/**
 * Add a comment to a project
 */
function addProjectComment(projectId, userId, comment, commentType, isPublic) {
    if (commentType === void 0) { commentType = "remark"; }
    if (isPublic === void 0) { isPublic = true; }
    return __awaiter(this, void 0, Promise, function () {
        var db, id, newComment, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    id = "pc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    newComment = {
                        id: id,
                        projectId: projectId,
                        userId: userId,
                        comment: comment,
                        commentType: commentType,
                        isPublic: isPublic
                    };
                    return [4 /*yield*/, db.insert(schema_1.projectComments).values(newComment)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, newComment];
                case 4:
                    error_11 = _a.sent();
                    console.error("[Database] Failed to add project comment:", error_11);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.addProjectComment = addProjectComment;
/**
 * Get comments for a project
 */
function getProjectComments(projectId, includePrivate) {
    if (includePrivate === void 0) { includePrivate = false; }
    return __awaiter(this, void 0, void 0, function () {
        var db, whereConditions, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    whereConditions = [drizzle_orm_1.eq(schema_1.projectComments.projectId, projectId)];
                    if (!includePrivate) {
                        // `projectComments` schema does not have `isPublic`; skip that filter.
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.projectComments)
                            .where(drizzle_orm_1.and.apply(void 0, whereConditions))
                            .orderBy(drizzle_orm_1.desc(schema_1.projectComments.createdAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_12 = _a.sent();
                    console.error("[Database] Failed to get project comments:", error_12);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getProjectComments = getProjectComments;
/**
 * Create a staff task
 */
function createStaffTask(title, department, createdBy, description, assignedTo, priority, dueDate) {
    if (priority === void 0) { priority = "medium"; }
    return __awaiter(this, void 0, Promise, function () {
        var db, id, task, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    id = "st_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    task = {
                        id: id,
                        title: title,
                        description: description,
                        department: department,
                        assignedTo: assignedTo,
                        createdBy: createdBy,
                        status: "todo",
                        priority: priority,
                        dueDate: dueDate
                    };
                    return [4 /*yield*/, db.insert(schema_1.staffTasks).values(task)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, task];
                case 4:
                    error_13 = _a.sent();
                    console.error("[Database] Failed to create staff task:", error_13);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.createStaffTask = createStaffTask;
/**
 * Get staff tasks for a department
 */
function getDepartmentTasks(department) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.staffTasks)
                            .where(drizzle_orm_1.eq(schema_1.staffTasks.departmentId, department))
                            .orderBy(drizzle_orm_1.desc(schema_1.staffTasks.createdAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_14 = _a.sent();
                    console.error("[Database] Failed to get department tasks:", error_14);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getDepartmentTasks = getDepartmentTasks;
/**
 * Get tasks assigned to a user
 */
function getUserTasks(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.staffTasks)
                            .where(drizzle_orm_1.eq(schema_1.staffTasks.assignedTo, userId))
                            .orderBy(drizzle_orm_1.desc(schema_1.staffTasks.createdAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_15 = _a.sent();
                    console.error("[Database] Failed to get user tasks:", error_15);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserTasks = getUserTasks;
/**
 * Update staff task status
 */
function updateTaskStatus(taskId, status) {
    return __awaiter(this, void 0, Promise, function () {
        var db, updateData, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    updateData = { status: status };
                    if (status === "completed") {
                        updateData.completedDate = new Date();
                    }
                    return [4 /*yield*/, db.update(schema_1.staffTasks).set(updateData).where(drizzle_orm_1.eq(schema_1.staffTasks.id, taskId))];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    error_16 = _a.sent();
                    console.error("[Database] Failed to update task status:", error_16);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.updateTaskStatus = updateTaskStatus;
/**
 * Get all permissions for a role
 */
function getRolePermissions(roleId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, perms, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({ permissionId: schema_1.rolePermissions.permissionId })
                            .from(schema_1.rolePermissions)
                            .where(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId))];
                case 3:
                    perms = _a.sent();
                    return [2 /*return*/, perms.map(function (p) { return ({ id: p.permissionId, permissionName: p.permissionId }); })];
                case 4:
                    error_17 = _a.sent();
                    console.error("[Database] Failed to get role permissions:", error_17);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getRolePermissions = getRolePermissions;
/**
 * Check if user has a specific permission
 */
function userHasPermission(userId, permissionName) {
    return __awaiter(this, void 0, Promise, function () {
        var db, user, perms, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, getUserById(userId)];
                case 3:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, false];
                    // Admins have all permissions
                    if (user.role === "admin" || user.role === "super_admin") {
                        return [2 /*return*/, true];
                    }
                    // Check if user has the permission in their permissions field (JSON)
                    if (user.permissions) {
                        try {
                            perms = JSON.parse(user.permissions);
                            return [2 /*return*/, Array.isArray(perms) && perms.includes(permissionName)];
                        }
                        catch (_b) {
                            return [2 /*return*/, false];
                        }
                    }
                    return [2 /*return*/, false];
                case 4:
                    error_18 = _a.sent();
                    console.error("[Database] Failed to check user permission:", error_18);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.userHasPermission = userHasPermission;
/**
 * Get department members
 */
function getDepartmentMembers(department) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.department, department), drizzle_orm_1.eq(schema_1.users.isActive, 1)))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_19 = _a.sent();
                    console.error("[Database] Failed to get department members:", error_19);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getDepartmentMembers = getDepartmentMembers;
/**
 * Update user password
 * Verifies current password before updating
 */
function updatePassword(userId, currentPassword, newPassword) {
    return __awaiter(this, void 0, Promise, function () {
        var db, bcrypt_1, user, isValid, salt, newPasswordHash, error_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
                case 3:
                    bcrypt_1 = _a.sent();
                    return [4 /*yield*/, getUserById(userId)];
                case 4:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, false];
                    if (!user.passwordHash) return [3 /*break*/, 6];
                    return [4 /*yield*/, bcrypt_1.compare(currentPassword, user.passwordHash)];
                case 5:
                    isValid = _a.sent();
                    if (!isValid)
                        return [2 /*return*/, false];
                    return [3 /*break*/, 7];
                case 6: 
                // User doesn't have a password set (OAuth user)
                return [2 /*return*/, false];
                case 7: return [4 /*yield*/, bcrypt_1.genSalt(10)];
                case 8:
                    salt = _a.sent();
                    return [4 /*yield*/, bcrypt_1.hash(newPassword, salt)];
                case 9:
                    newPasswordHash = _a.sent();
                    // Update password
                    return [4 /*yield*/, db.update(schema_1.users).set({ passwordHash: newPasswordHash }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 10:
                    // Update password
                    _a.sent();
                    return [2 /*return*/, true];
                case 11:
                    error_20 = _a.sent();
                    console.error("[Database] Failed to update password:", error_20);
                    return [2 /*return*/, false];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.updatePassword = updatePassword;
