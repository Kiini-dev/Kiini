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
exports.__esModule = true;
exports.markTenantMessageRead = exports.getTenantMessages = exports.createTenantMessage = exports.bulkSetPricingTierFeatures = exports.setPricingTierFeature = exports.getAllPricingTierFeatures = exports.getPricingTierFeatures = exports.getAllTenantSuperAdmins = exports.assignUserToOrganization = exports.getUsersByOrganization = exports.setOrganizationFeature = exports.getOrganizationFeatures = exports.deleteOrganization = exports.updateOrganizationSettings = exports.getOrganizationSettings = exports.updateOrganization = exports.createOrganization = exports.getOrganizationBySlug = exports.getOrganization = exports.getAllOrganizations = exports.getSmsAutomationRules = exports.createSmsAutomationRule = exports.deleteSmsTemplate = exports.updateSmsTemplate = exports.getSmsTemplates = exports.getSmsTemplate = exports.createSmsTemplate = exports.queueSmsMessage = exports.disableIntegration = exports.getEnabledIntegrations = exports.saveIntegrationConfig = exports.getDunningStatus = exports.getDunningEvents = exports.logDunningEvent = exports.getRetryHistory = exports.recordPaymentRetry = exports.getActiveDunningPolicy = exports.getDunningPolicy = exports.getDunningPolicies = exports.createDunningPolicy = exports.getBillingUsageSummary = exports.getBillingUsageMetrics = exports.createExportJob = exports.createBillingUsageMetric = exports.createBillingNotification = exports.getOrganizationSubscription = exports.getAllSubscriptions = exports.updateSubscription = exports.getSubscriptionById = exports.getClientSubscription = exports.getClientByCreatedBy = exports.createSubscription = exports.getPricingPlan = exports.getAvailablePlans = exports.clearPasswordResetToken = exports.getPasswordResetToken = exports.setPasswordResetToken = exports.createPermission = exports.createRole = exports.removePermissionFromRole = exports.assignPermissionToRole = exports.getRolePermissions = exports.getPermissions = exports.getRoles = exports.resetCategoryToDefaults = exports.resetSettingToDefault = exports.setDefaultSetting = exports.getDefaultSettingsByCategory = exports.getDefaultSetting = exports.resetDocumentNumberFormatCounter = exports.getNextDocumentNumberWithFormat = exports.updateDocumentNumberFormat = exports.getDocumentNumberFormat = exports.getDocumentNumberingSettings = exports.resetDocumentNumberCounter = exports.getNextDocumentNumber = exports.deleteSetting = exports.setSetting = exports.getAllSettings = exports.getSettingsByCategory = exports.getSetting = exports.logActivity = exports.createReceiptFromInvoice = exports.createPaymentMethod = exports.getPaymentMethods = exports.getPaymentsByInvoice = exports.createPayment = exports.updateEstimate = exports.getEstimatesByClient = exports.getAllEstimates = exports.getEstimate = exports.createEstimate = exports.updateInvoice = exports.getInvoiceById = exports.getClientInvoices = exports.getInvoicesByClient = exports.getAllInvoices = exports.getInvoice = exports.createInvoice = exports.deleteClient = exports.updateClient = exports.getAllClients = exports.getClientById = exports.getClient = exports.createClient = exports.deleteProjectTask = exports.updateProjectTask = exports.getProjectTasks = exports.createProjectTask = exports.deleteProject = exports.updateProject = exports.getProjectsByStatus = exports.getProjectsByClient = exports.getAllProjects = exports.getProject = exports.createProject = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadNotifications = exports.getUserNotifications = exports.createNotification = exports.getUserPassword = exports.setUserPassword = exports.updateUser = exports.getAllUsers = exports.getUserById = exports.getUser = exports.upsertUser = exports.getDb = exports.getPool = exports.__resetDbForTests = exports.__setDbForTests = exports.db = exports.getDbInstance = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var mysql2_1 = require("drizzle-orm/mysql2");
var migrator_1 = require("drizzle-orm/mysql2/migrator");
var mysql = require("mysql2/promise");
// sqlite support for tests will be dynamically imported below when needed
var schema_1 = require("../drizzle/schema");
var schema_extended_1 = require("../drizzle/schema-extended");
var uuid_1 = require("uuid");
var env_1 = require("./_core/env");
var _db = null;
var _pool = null;
var _migrationsRun = false;
// Getter for the drizzle db instance (for files that need sync access after initialization)
function getDbInstance() {
    return _db;
}
exports.getDbInstance = getDbInstance;
// Export db for compatibility with code expecting direct access
exports.db = new Proxy({}, {
    get: function (target, prop) {
        if (!_db) {
            throw new Error('Database not initialized. Call await getDb() first.');
        }
        return (_db[prop]);
    }
});
// helpers used in unit tests to override or reset database instance
function __setDbForTests(dbInstance) {
    _db = dbInstance;
}
exports.__setDbForTests = __setDbForTests;
function __resetDbForTests() {
    _db = null;
}
exports.__resetDbForTests = __resetDbForTests;
/** Expose the underlying mysql2 pool for raw SQL queries */
function getPool() {
    return _pool;
}
exports.getPool = getPool;
// Lazily create the drizzle instance so local tooling can run without a DB.
function getDb() {
    return __awaiter(this, void 0, void 0, function () {
        var shouldRunRuntimeMigrations, migrationError_1, error_1, sqlitePkg, _a, drizzleSqlite, BetterSqlite3, conn, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(!_db && process.env.DATABASE_URL)) return [3 /*break*/, 11];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    console.log("[Database] Attempting to create drizzle connection...");
                    if (!!_pool) return [3 /*break*/, 3];
                    return [4 /*yield*/, mysql.createPool({
                            uri: process.env.DATABASE_URL,
                            waitForConnections: true,
                            connectionLimit: 10,
                            queueLimit: 0,
                            multipleStatements: true
                        })];
                case 2:
                    _pool = _b.sent();
                    _b.label = 3;
                case 3:
                    _db = mysql2_1.drizzle(_pool);
                    console.log("[Database] ✅ Drizzle connection created successfully");
                    shouldRunRuntimeMigrations = process.env.NODE_ENV !== 'production' || process.env.RUN_DRIZZLE_MIGRATIONS === 'true';
                    if (!(!_migrationsRun && _db && process.env.NODE_ENV !== 'test')) return [3 /*break*/, 9];
                    if (!shouldRunRuntimeMigrations) return [3 /*break*/, 8];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    console.log("[Database] Running migrations...");
                    return [4 /*yield*/, migrator_1.migrate(_db, { migrationsFolder: "./drizzle/migrations" })];
                case 5:
                    _b.sent();
                    _migrationsRun = true;
                    console.log("[Database] ✅ Migrations completed successfully");
                    return [3 /*break*/, 7];
                case 6:
                    migrationError_1 = _b.sent();
                    console.error("[Database] ⚠️  Migration error (continuing anyway):", migrationError_1 instanceof Error ? migrationError_1.message : migrationError_1);
                    // Don't fail startup if migrations have issues - tables might already exist
                    _migrationsRun = true;
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    _migrationsRun = true;
                    console.log("[Database] Skipping runtime drizzle migrations in production");
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    console.error("[Database] ❌ Failed to connect:", error_1 instanceof Error ? error_1.message : error_1);
                    _db = null;
                    _pool = null;
                    return [3 /*break*/, 11];
                case 11:
                    if (!(!_db && process.env.NODE_ENV === "test")) return [3 /*break*/, 15];
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 14, , 15]);
                    console.log("[Database] Creating sqlite in-memory DB for tests...");
                    sqlitePkg = "drizzle-orm/better-sqlite3";
                    return [4 /*yield*/, Promise.all([
                            Promise.resolve().then(function () { return require(sqlitePkg); }),
                            Promise.resolve().then(function () { return require("better-sqlite3"); }),
                        ])];
                case 13:
                    _a = _b.sent(), drizzleSqlite = _a[0].drizzle, BetterSqlite3 = _a[1];
                    conn = new BetterSqlite3["default"](":memory:");
                    _db = drizzleSqlite(conn);
                    return [3 /*break*/, 15];
                case 14:
                    err_1 = _b.sent();
                    console.warn("[Database] sqlite memory init failed", err_1);
                    _db = null;
                    return [3 /*break*/, 15];
                case 15:
                    if (!_db && !process.env.DATABASE_URL) {
                        console.warn("[Database] DATABASE_URL not set");
                    }
                    return [2 /*return*/, _db];
            }
        });
    });
}
exports.getDb = getDb;
function upsertUser(user) {
    return __awaiter(this, void 0, Promise, function () {
        var db, values_1, updateSet_1, textFields, assignNullable, activeValue, requiresPasswordChangeValue, placeholder, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user.id) {
                        throw new Error("User ID is required for upsert");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.warn("[Database] Cannot upsert user: database not available");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    values_1 = {
                        id: user.id
                    };
                    updateSet_1 = {};
                    textFields = [
                        "name",
                        "email",
                        "loginMethod",
                        "department",
                        "clientId",
                        "permissions",
                        "passwordResetToken",
                        "phone",
                        "company",
                        "position",
                        "address",
                        "city",
                        "country",
                        "photoUrl",
                        "organizationId",
                        "customRoleId",
                    ];
                    assignNullable = function (field) {
                        var value = user[field];
                        if (value === undefined)
                            return;
                        var normalized = value !== null && value !== void 0 ? value : null;
                        values_1[field] = normalized;
                        updateSet_1[field] = normalized;
                    };
                    textFields.forEach(assignNullable);
                    if (user.isActive !== undefined) {
                        activeValue = typeof user.isActive === 'boolean' ? (user.isActive ? 1 : 0) : user.isActive;
                        values_1.isActive = activeValue;
                        updateSet_1.isActive = activeValue;
                    }
                    if (user.passwordHash !== undefined) {
                        values_1.passwordHash = user.passwordHash;
                        updateSet_1.passwordHash = user.passwordHash;
                    }
                    if (user.requiresPasswordChange !== undefined) {
                        requiresPasswordChangeValue = typeof user.requiresPasswordChange === 'boolean' ? (user.requiresPasswordChange ? 1 : 0) : user.requiresPasswordChange;
                        values_1.requiresPasswordChange = requiresPasswordChangeValue;
                        updateSet_1.requiresPasswordChange = requiresPasswordChangeValue;
                    }
                    if (user.lastSignedIn !== undefined) {
                        values_1.lastSignedIn = user.lastSignedIn;
                        updateSet_1.lastSignedIn = user.lastSignedIn;
                    }
                    if (user.role !== undefined) {
                        values_1.role = user.role;
                        updateSet_1.role = user.role;
                    }
                    else if (user.id === env_1.ENV.ownerId) {
                        values_1.role = 'admin';
                        updateSet_1.role = 'admin';
                    }
                    if (values_1.email === undefined || values_1.email === null || values_1.email === "") {
                        placeholder = user.id + "@no-email.local";
                        values_1.email = placeholder;
                    }
                    if (values_1.name === undefined || values_1.name === null) {
                        values_1.name = "";
                    }
                    if (values_1.loginMethod === undefined || values_1.loginMethod === null) {
                        values_1.loginMethod = "local";
                    }
                    if (Object.keys(updateSet_1).length === 0) {
                        updateSet_1.lastSignedIn = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    }
                    return [4 /*yield*/, db.insert(schema_1.users).values(values_1).onDuplicateKeyUpdate({
                            set: updateSet_1
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("[Database] Failed to upsert user:", error_2);
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.upsertUser = upsertUser;
function getUser(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.warn("[Database] Cannot get user: database not available");
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, id)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : undefined];
            }
        });
    });
}
exports.getUser = getUser;
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getUser(id)];
        });
    });
}
exports.getUserById = getUserById;
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.users).orderBy(drizzle_orm_1.desc(schema_1.users.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllUsers = getAllUsers;
function updateUser(id, data) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var db, updateSet, updated, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.warn("[Database] Cannot update user: database not available");
                        return [2 /*return*/];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    updateSet = {};
                    if (data.name !== undefined)
                        updateSet.name = data.name;
                    if (data.email !== undefined)
                        updateSet.email = data.email;
                    if (data.loginMethod !== undefined)
                        updateSet.loginMethod = data.loginMethod;
                    if (data.role !== undefined)
                        updateSet.role = data.role;
                    if (data.lastSignedIn !== undefined)
                        updateSet.lastSignedIn = data.lastSignedIn;
                    if (data.department !== undefined)
                        updateSet.department = data.department;
                    if (data.isActive !== undefined)
                        updateSet.isActive = typeof data.isActive === 'boolean' ? (data.isActive ? 1 : 0) : data.isActive;
                    if (data.passwordHash !== undefined)
                        updateSet.passwordHash = data.passwordHash;
                    if (data.phone !== undefined)
                        updateSet.phone = data.phone;
                    if (data.company !== undefined)
                        updateSet.company = data.company;
                    if (data.position !== undefined)
                        updateSet.position = data.position;
                    if (data.photoUrl !== undefined)
                        updateSet.photoUrl = data.photoUrl;
                    if (Object.keys(updateSet).length === 0) {
                        return [2 /*return*/, getUser(id)]; // Nothing to update, return current user
                    }
                    return [4 /*yield*/, db.update(schema_1.users).set(updateSet).where(drizzle_orm_1.eq(schema_1.users.id, id))];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, id)).limit(1)];
                case 4:
                    updated = _b.sent();
                    return [2 /*return*/, (_a = updated[0]) !== null && _a !== void 0 ? _a : null];
                case 5:
                    error_3 = _b.sent();
                    console.error("[Database] Failed to update user:", error_3);
                    throw error_3;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.updateUser = updateUser;
// ============= USER PASSWORD MANAGEMENT =============
function setUserPassword(userId, passwordHash) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.update(schema_1.users).set({ passwordHash: passwordHash }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setUserPassword = setUserPassword;
function getUserPassword(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select({ passwordHash: schema_1.users.passwordHash }).from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, userId)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0].passwordHash : null];
            }
        });
    });
}
exports.getUserPassword = getUserPassword;
// ============= NOTIFICATIONS =============
function createNotification(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id, notificationData, broadcastNotification, error_4, _a, notifyOrg, notifyUser, targetUser, event, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    notificationData = __assign(__assign({}, notification), { id: id });
                    return [4 /*yield*/, db.insert(schema_1.notifications).values(notificationData)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../server/websocket/notificationBroadcaster"); })];
                case 4:
                    broadcastNotification = (_b.sent()).broadcastNotification;
                    return [4 /*yield*/, broadcastNotification(notification.userId, notificationData)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _b.sent();
                    console.warn("Could not broadcast notification, websocket may not be available:", error_4);
                    return [3 /*break*/, 7];
                case 7:
                    _b.trys.push([7, 10, , 11]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./sse"); })];
                case 8:
                    _a = _b.sent(), notifyOrg = _a.notifyOrg, notifyUser = _a.notifyUser;
                    return [4 /*yield*/, db
                            .select({ id: schema_1.users.id, organizationId: schema_1.users.organizationId })
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, notification.userId))
                            .limit(1)];
                case 9:
                    targetUser = (_b.sent())[0];
                    event = {
                        id: id,
                        type: "info",
                        title: notification.title || "Notification",
                        body: notification.message || "You have a new update",
                        href: notification.actionUrl || undefined,
                        timestamp: new Date().toISOString()
                    };
                    if (targetUser === null || targetUser === void 0 ? void 0 : targetUser.organizationId) {
                        notifyOrg(targetUser.organizationId, event);
                    }
                    else {
                        notifyUser(notification.userId, event);
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_5 = _b.sent();
                    console.warn("Could not broadcast notification over SSE:", error_5);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, id];
            }
        });
    });
}
exports.createNotification = createNotification;
function getUserNotifications(userId, limit) {
    if (limit === void 0) { limit = 50; }
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.notifications)
                            .where(drizzle_orm_1.eq(schema_1.notifications.recipientId, userId))
                            .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))
                            .limit(limit)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getUserNotifications = getUserNotifications;
function getUnreadNotifications(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.notifications)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, userId), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))
                            .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getUnreadNotifications = getUnreadNotifications;
function markNotificationAsRead(notificationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.notifications)
                            .set({ readAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                            .where(drizzle_orm_1.eq(schema_1.notifications.id, notificationId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.markNotificationAsRead = markNotificationAsRead;
function markAllNotificationsAsRead(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.notifications)
                            .set({ readAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.recipientId, userId), isNull(schema_1.notifications.readAt)))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
function deleteNotification(notificationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.notifications).where(drizzle_orm_1.eq(schema_1.notifications.id, notificationId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteNotification = deleteNotification;
// ============= PROJECTS =============
function createProject(project) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.projects).values(__assign(__assign({}, project), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createProject = createProject;
function getProject(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.id, id)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getProject = getProject;
function getAllProjects() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.projects).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllProjects = getAllProjects;
function getProjectsByClient(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.projects)
                            .where(drizzle_orm_1.eq(schema_1.projects.clientId, clientId))
                            .orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getProjectsByClient = getProjectsByClient;
function getProjectsByStatus(status) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.projects)
                            .where(drizzle_orm_1.eq(schema_1.projects.status, status))
                            .orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getProjectsByStatus = getProjectsByStatus;
function updateProject(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.projects)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.projects.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateProject = updateProject;
function deleteProject(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteProject = deleteProject;
// ============= PROJECT TASKS =============
function createProjectTask(task) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.projectTasks).values(__assign(__assign({}, task), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createProjectTask = createProjectTask;
function getProjectTasks(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.projectTasks)
                            .where(drizzle_orm_1.eq(schema_1.projectTasks.projectId, projectId))
                            .orderBy(schema_1.projectTasks.order, drizzle_orm_1.desc(schema_1.projectTasks.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getProjectTasks = getProjectTasks;
function updateProjectTask(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.projectTasks)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.projectTasks.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateProjectTask = updateProjectTask;
function deleteProjectTask(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.projectTasks).where(drizzle_orm_1.eq(schema_1.projectTasks.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteProjectTask = deleteProjectTask;
// ============= CLIENTS =============
function createClient(client) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "client_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.clients).values(__assign(__assign({}, client), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createClient = createClient;
function getClient(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, id)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getClient = getClient;
function getClientById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getClient(id)];
        });
    });
}
exports.getClientById = getClientById;
function getAllClients() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.clients).orderBy(drizzle_orm_1.desc(schema_1.clients.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllClients = getAllClients;
function updateClient(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.clients)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.clients.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateClient = updateClient;
function deleteClient(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteClient = deleteClient;
// ============= INVOICES =============
function createInvoice(invoice) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.invoices).values(__assign(__assign({}, invoice), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createInvoice = createInvoice;
function getInvoice(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, id)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getInvoice = getInvoice;
function getAllInvoices() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.invoices).orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllInvoices = getAllInvoices;
function getInvoicesByClient(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId))
                            .orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getInvoicesByClient = getInvoicesByClient;
function getClientInvoices(clientId, status) {
    return __awaiter(this, void 0, void 0, function () {
        var list;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getInvoicesByClient(clientId)];
                case 1:
                    list = _a.sent();
                    if (!status)
                        return [2 /*return*/, list];
                    return [2 /*return*/, list.filter(function (invoice) { return (invoice === null || invoice === void 0 ? void 0 : invoice.status) === status; })];
            }
        });
    });
}
exports.getClientInvoices = getClientInvoices;
function getInvoiceById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getInvoice(id)];
        });
    });
}
exports.getInvoiceById = getInvoiceById;
function updateInvoice(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.invoices)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateInvoice = updateInvoice;
// ============= ESTIMATES =============
function createEstimate(estimate) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "est_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.estimates).values(__assign(__assign({}, estimate), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createEstimate = createEstimate;
function getEstimate(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.id, id)).limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getEstimate = getEstimate;
function getAllEstimates() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.estimates).orderBy(drizzle_orm_1.desc(schema_1.estimates.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllEstimates = getAllEstimates;
function getEstimatesByClient(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.estimates)
                            .where(drizzle_orm_1.eq(schema_1.estimates.clientId, clientId))
                            .orderBy(drizzle_orm_1.desc(schema_1.estimates.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getEstimatesByClient = getEstimatesByClient;
function updateEstimate(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.estimates)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.estimates.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateEstimate = updateEstimate;
// ============= PAYMENTS =============
function createPayment(payment) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "pay_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.payments).values(__assign(__assign({}, payment), { id: id }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createPayment = createPayment;
function getPaymentsByInvoice(invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.payments)
                            .where(drizzle_orm_1.eq(schema_1.payments.invoiceId, invoiceId))
                            .orderBy(drizzle_orm_1.desc(schema_1.payments.paymentDate))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getPaymentsByInvoice = getPaymentsByInvoice;
function getPaymentMethods(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.paymentMethods)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentMethods.clientId, clientId), drizzle_orm_1.eq(schema_1.paymentMethods.isActive, 1)))
                            .orderBy(drizzle_orm_1.desc(schema_1.paymentMethods.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getPaymentMethods = getPaymentMethods;
function createPaymentMethod(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.insert(schema_1.paymentMethods).values(data)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.paymentMethods)
                            .where(drizzle_orm_1.eq(schema_1.paymentMethods.id, data.id))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : data];
            }
        });
    });
}
exports.createPaymentMethod = createPaymentMethod;
function createReceiptFromInvoice(invoiceId) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var db, invoice, now, receiptId, receiptNumber, payload;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _f.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, getInvoice(invoiceId)];
                case 2:
                    invoice = _f.sent();
                    if (!invoice)
                        return [2 /*return*/, null];
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    receiptId = "rec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    receiptNumber = "REC-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
                    payload = {
                        id: receiptId,
                        organizationId: (_a = invoice.organizationId) !== null && _a !== void 0 ? _a : null,
                        receiptNumber: receiptNumber,
                        clientId: invoice.clientId,
                        paymentId: null,
                        amount: Number((_c = (_b = invoice.paidAmount) !== null && _b !== void 0 ? _b : invoice.total) !== null && _c !== void 0 ? _c : 0),
                        paymentMethod: 'other',
                        receiptDate: now,
                        notes: "Auto-generated from invoice " + ((_d = invoice.invoiceNumber) !== null && _d !== void 0 ? _d : invoiceId),
                        createdBy: (_e = invoice.createdBy) !== null && _e !== void 0 ? _e : null,
                        createdAt: now
                    };
                    return [4 /*yield*/, db.insert(schema_1.receipts).values(payload)];
                case 3:
                    _f.sent();
                    return [2 /*return*/, payload];
            }
        });
    });
}
exports.createReceiptFromInvoice = createReceiptFromInvoice;
// ============= ACTIVITY LOG =============
function logActivity(activity) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id, mysqlDateTime, logEntry, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    id = "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    mysqlDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    logEntry = {
                        id: id,
                        userId: activity.userId,
                        action: activity.action,
                        entityType: activity.entityType || null,
                        entityId: activity.entityId || null,
                        description: activity.description || null,
                        metadata: activity.metadata || null,
                        ipAddress: activity.ipAddress || null,
                        createdAt: mysqlDateTime
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.insert(schema_1.activityLog).values(logEntry)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    // Log detailed error but do not re-throw to prevent failing the calling operation
                    console.error('Failed to insert activityLog entry:', {
                        error: (error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || error_6,
                        code: error_6 === null || error_6 === void 0 ? void 0 : error_6.code,
                        entry: logEntry
                    });
                    // Graceful fallback: skip logging to DB when it fails
                    return [2 /*return*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.logActivity = logActivity;
// ============= SETTINGS =============
function getSetting(key) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.key, key))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getSetting = getSetting;
function getSettingsByCategory(category) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, category))
                            .orderBy(schema_1.settings.key)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getSettingsByCategory = getSettingsByCategory;
function getAllSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.settings)
                            .orderBy(schema_1.settings.category, schema_1.settings.key)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllSettings = getAllSettings;
function setSetting(key, value, category, description, updatedBy) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "set_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, getSetting(key)];
                case 2:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 4];
                    return [4 /*yield*/, db
                            .update(schema_1.settings)
                            .set({
                            value: value,
                            category: category || existing.category,
                            description: description || existing.description,
                            updatedBy: updatedBy,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })
                            .where(drizzle_orm_1.eq(schema_1.settings.key, key))];
                case 3:
                    _a.sent();
                    return [2 /*return*/, existing.id];
                case 4: 
                // Insert new setting
                return [4 /*yield*/, db.insert(schema_1.settings).values({
                        id: id,
                        key: key,
                        value: value,
                        category: category,
                        description: description,
                        updatedBy: updatedBy,
                        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    })];
                case 5:
                    // Insert new setting
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.setSetting = setSetting;
function deleteSetting(key) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.key, key))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteSetting = deleteSetting;
// ============= DOCUMENT NUMBER AUTO-INCREMENT =============
/**
 * Get the next document number for a given document type
 * Supports: invoice, estimate, receipt, proposal, expense
 */
function getNextDocumentNumber(documentType) {
    return __awaiter(this, void 0, Promise, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    // Use the new formatted numbering system
                    return [2 /*return*/, getNextDocumentNumberWithFormat(documentType)];
            }
        });
    });
}
exports.getNextDocumentNumber = getNextDocumentNumber;
function getDefaultPrefix(documentType) {
    var prefixes = {
        invoice: 'INV-',
        estimate: 'EST-',
        receipt: 'REC-',
        proposal: 'PROP-',
        expense: 'EXP-',
        payment: 'PAY-',
        project: 'PROJ-',
        contract: 'CON-',
        quotation: 'QUO-',
        purchase_order: 'LPO-',
        credit_note: 'CN-',
        debit_note: 'DN-'
    };
    return prefixes[documentType] || 'DOC-';
}
/**
 * Reset document number counter for a given document type
 */
function resetDocumentNumberCounter(documentType, startNumber) {
    if (startNumber === void 0) { startNumber = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var db, nextKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    nextKey = documentType + "_next";
                    return [4 /*yield*/, setSetting(nextKey, String(startNumber), 'document_numbering')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.resetDocumentNumberCounter = resetDocumentNumberCounter;
/**
 * Get all document numbering settings
 */
function getDocumentNumberingSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var db, settings_list, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, {}];
                    return [4 /*yield*/, getSettingsByCategory('document_numbering')];
                case 2:
                    settings_list = _a.sent();
                    result = {};
                    settings_list.forEach(function (setting) {
                        result[setting.key] = setting.value || '';
                    });
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getDocumentNumberingSettings = getDocumentNumberingSettings;
// ============= DOCUMENT NUMBER FORMATTING =============
function getDocumentNumberFormat(documentType) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, error_7, code, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.documentNumberFormats)
                            .where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
                case 4:
                    error_7 = _a.sent();
                    code = (error_7 === null || error_7 === void 0 ? void 0 : error_7.code) || (error_7 === null || error_7 === void 0 ? void 0 : error_7.errno) || '';
                    msg = (error_7 === null || error_7 === void 0 ? void 0 : error_7.message) || '';
                    if (code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist")) {
                        console.warn('[Database] documentNumberFormats table missing - returning null');
                        return [2 /*return*/, null];
                    }
                    throw error_7;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getDocumentNumberFormat = getDocumentNumberFormat;
function updateDocumentNumberFormat(documentType, format) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existing, now, id, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, getDocumentNumberFormat(documentType)];
                case 3:
                    existing = _a.sent();
                    now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    if (!existing) return [3 /*break*/, 5];
                    return [4 /*yield*/, db
                            .update(schema_1.documentNumberFormats)
                            .set({
                            prefix: format.prefix !== undefined ? format.prefix : existing.prefix,
                            padding: format.padding !== undefined ? format.padding : existing.padding,
                            separator: format.separator !== undefined ? format.separator : existing.separator,
                            updatedAt: now
                        })
                            .where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];
                case 4:
                    _a.sent();
                    return [2 /*return*/, existing.id];
                case 5:
                    id = "dnf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.documentNumberFormats).values({
                            id: id,
                            documentType: documentType,
                            prefix: format.prefix || '',
                            padding: format.padding || 6,
                            separator: format.separator || '-',
                            currentNumber: 1,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 6:
                    _a.sent();
                    return [2 /*return*/, id];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_8 = _a.sent();
                    if ((error_8 === null || error_8 === void 0 ? void 0 : error_8.code) === 'ER_NO_SUCH_TABLE') {
                        console.warn('[Database] documentNumberFormats table not available');
                        return [2 /*return*/, "dnf_" + Date.now()];
                    }
                    throw error_8;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.updateDocumentNumberFormat = updateDocumentNumberFormat;
function getNextDocumentNumberWithFormat(documentType) {
    return __awaiter(this, void 0, Promise, function () {
        var db, format, yearMatch, newPrefix, err_2, id, prefix_1, now, error_9, code, msg, now, prefix, padding, separator, nextNum, paddedNumber, documentNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, getDocumentNumberFormat(documentType)];
                case 2:
                    format = _a.sent();
                    if (!(format && format.prefix)) return [3 /*break*/, 6];
                    yearMatch = format.prefix.match(/(.+)-\d{4}$/);
                    if (!yearMatch) return [3 /*break*/, 6];
                    newPrefix = yearMatch[1];
                    format.prefix = newPrefix;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, db.update(schema_1.documentNumberFormats)
                            .set({ prefix: newPrefix, updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
                            .where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];
                case 4:
                    _a.sent();
                    console.log("[DB] removed year from prefix for " + documentType + ", new prefix='" + newPrefix + "'");
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.warn("[DB] failed to sanitize prefix for " + documentType, err_2);
                    return [3 /*break*/, 6];
                case 6:
                    if (!!format) return [3 /*break*/, 16];
                    id = uuid_1.v4();
                    prefix_1 = getDefaultPrefix(documentType).replace('-', '');
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 14]);
                    now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    return [4 /*yield*/, db.insert(schema_1.documentNumberFormats).values({
                            id: id,
                            documentType: documentType,
                            prefix: prefix_1,
                            padding: 6,
                            separator: '-',
                            currentNumber: 1,
                            createdAt: now,
                            updatedAt: now
                        }).onDuplicateKeyUpdate({
                            set: {
                                currentNumber: 1,
                                updatedAt: now
                            }
                        })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 9:
                    error_9 = _a.sent();
                    code = (error_9 === null || error_9 === void 0 ? void 0 : error_9.code) || (error_9 === null || error_9 === void 0 ? void 0 : error_9.errno) || '';
                    msg = (error_9 === null || error_9 === void 0 ? void 0 : error_9.message) || '';
                    if (!(code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist"))) return [3 /*break*/, 12];
                    console.warn('[Database] documentNumberFormats table still missing during insert, attempting to create.');
                    // attempt to create table manually
                    return [4 /*yield*/, db.execute("\n          CREATE TABLE IF NOT EXISTS documentNumberFormats (\n            id VARCHAR(64) PRIMARY KEY,\n            documentType ENUM('invoice','estimate','receipt','proposal','expense','payment','contract','quotation','purchase_order','project','credit_note','debit_note') NOT NULL,\n            prefix VARCHAR(50) NOT NULL DEFAULT '',\n            padding INT NOT NULL DEFAULT 6,\n            separator VARCHAR(5) DEFAULT '-',\n            currentNumber INT NOT NULL DEFAULT 1,\n            createdAt TIMESTAMP,\n            updatedAt TIMESTAMP\n          )\n        ")];
                case 10:
                    // attempt to create table manually
                    _a.sent();
                    now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    return [4 /*yield*/, db.insert(schema_1.documentNumberFormats).values({
                            id: id,
                            documentType: documentType,
                            prefix: prefix_1,
                            padding: 6,
                            separator: '-',
                            currentNumber: 1,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 12: throw error_9;
                case 13: return [3 /*break*/, 14];
                case 14: return [4 /*yield*/, getDocumentNumberFormat(documentType)];
                case 15:
                    format = _a.sent();
                    if (!format)
                        throw new Error("Failed to create document format");
                    _a.label = 16;
                case 16:
                    prefix = format.prefix || '';
                    padding = format.padding || 6;
                    separator = format.separator || '-';
                    nextNum = format.currentNumber || 1;
                    paddedNumber = String(nextNum).padStart(padding, '0');
                    documentNumber = prefix ? "" + prefix + separator + paddedNumber : paddedNumber;
                    // Increment and save the next number
                    return [4 /*yield*/, db
                            .update(schema_1.documentNumberFormats)
                            .set({
                            currentNumber: nextNum + 1,
                            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
                        })
                            .where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];
                case 17:
                    // Increment and save the next number
                    _a.sent();
                    return [2 /*return*/, documentNumber];
            }
        });
    });
}
exports.getNextDocumentNumberWithFormat = getNextDocumentNumberWithFormat;
function generateFormatExample(prefix, padding, separator, exampleNumber) {
    if (exampleNumber === void 0) { exampleNumber = 1; }
    var paddedNumber = String(exampleNumber).padStart(padding, '0');
    return prefix ? "" + prefix + separator + paddedNumber : paddedNumber;
}
function resetDocumentNumberFormatCounter(documentType, startNumber) {
    if (startNumber === void 0) { startNumber = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.documentNumberFormats)
                            .set({
                            currentNumber: startNumber,
                            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
                        })
                            .where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.resetDocumentNumberFormatCounter = resetDocumentNumberFormatCounter;
// ============= DEFAULT SETTINGS =============
function getDefaultSetting(category, key) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.defaultSettings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.defaultSettings.category, category), drizzle_orm_1.eq(schema_1.defaultSettings.key, key)))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getDefaultSetting = getDefaultSetting;
function getDefaultSettingsByCategory(category) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.defaultSettings)
                            .where(drizzle_orm_1.eq(schema_1.defaultSettings.category, category))
                            .orderBy(schema_1.defaultSettings.key)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getDefaultSettingsByCategory = getDefaultSettingsByCategory;
function setDefaultSetting(category, key, defaultValue, description) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "dset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, getDefaultSetting(category, key)];
                case 2:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 4];
                    return [4 /*yield*/, db
                            .update(schema_1.defaultSettings)
                            .set({
                            value: defaultValue,
                            description: description || existing.description
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.defaultSettings.category, category), drizzle_orm_1.eq(schema_1.defaultSettings.key, key)))];
                case 3:
                    _a.sent();
                    return [2 /*return*/, existing.id];
                case 4: return [4 /*yield*/, db.insert(schema_1.defaultSettings).values({
                        id: id,
                        category: category,
                        key: key,
                        value: defaultValue,
                        description: description
                    })];
                case 5:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.setDefaultSetting = setDefaultSetting;
function resetSettingToDefault(key) {
    return __awaiter(this, void 0, void 0, function () {
        var db, allDefaults, defaultSetting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.select().from(schema_1.defaultSettings)];
                case 2:
                    allDefaults = _a.sent();
                    defaultSetting = allDefaults.find(function (d) { return d.key === key; });
                    if (!defaultSetting) return [3 /*break*/, 4];
                    // Reset the setting to its default value
                    return [4 /*yield*/, setSetting(key, defaultSetting.value, defaultSetting.category)];
                case 3:
                    // Reset the setting to its default value
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.resetSettingToDefault = resetSettingToDefault;
function resetCategoryToDefaults(category) {
    return __awaiter(this, void 0, void 0, function () {
        var db, defaults, _i, defaults_1, defaultSetting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, getDefaultSettingsByCategory(category)];
                case 2:
                    defaults = _a.sent();
                    _i = 0, defaults_1 = defaults;
                    _a.label = 3;
                case 3:
                    if (!(_i < defaults_1.length)) return [3 /*break*/, 6];
                    defaultSetting = defaults_1[_i];
                    if (!defaultSetting.value) return [3 /*break*/, 5];
                    return [4 /*yield*/, setSetting(defaultSetting.key, defaultSetting.value, category)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.resetCategoryToDefaults = resetCategoryToDefaults;
// ============= ROLES & PERMISSIONS =============
function getRoles() {
    return __awaiter(this, void 0, void 0, function () {
        var db_1, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db_1 = _a.sent();
                    if (!db_1)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db_1
                            .select()
                            .from(schema_1.userRoles)
                            .orderBy(schema_1.userRoles.roleName)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_10 = _a.sent();
                    console.error("Error fetching roles:", error_10);
                    // Return default roles if query fails
                    return [2 /*return*/, [
                            { id: "1", userId: null, role: 'admin', roleName: "Admin", description: "Administrator role", isActive: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "2", userId: null, role: 'staff', roleName: "Staff", description: "Staff role", isActive: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "3", userId: null, role: 'client', roleName: "Client", description: "Client role", isActive: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                        ]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getRoles = getRoles;
function getPermissions() {
    return __awaiter(this, void 0, void 0, function () {
        var db_2, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db_2 = _a.sent();
                    if (!db_2)
                        return [2 /*return*/, []];
                    // Note: permissions table doesn't exist in current DB schema
                    // Permissions are managed via RBAC middleware instead
                    // Return default permissions on request
                    return [2 /*return*/, [
                            { id: "1", name: "View", permissionName: "view", description: "View records", category: "general", resource: "*", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "2", name: "Create", permissionName: "create", description: "Create records", category: "general", resource: "*", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "3", name: "Edit", permissionName: "edit", description: "Edit records", category: "general", resource: "*", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "4", name: "Delete", permissionName: "delete", description: "Delete records", category: "general", resource: "*", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                        ]];
                case 2:
                    error_11 = _a.sent();
                    console.error("Error fetching permissions:", error_11);
                    // Return default permissions if query fails
                    return [2 /*return*/, [
                            { id: "1", name: "View", permissionName: "view", description: "View records", category: "general", resource: "*", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "2", name: "Create", permissionName: "create", description: "Create records", category: "general", resource: "*", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "3", name: "Edit", permissionName: "edit", description: "Edit records", category: "general", resource: "*", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                            { id: "4", name: "Delete", permissionName: "delete", description: "Delete records", category: "general", resource: "*", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
                        ]];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getPermissions = getPermissions;
function getRolePermissions(roleId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select({
                            permissionId: schema_1.rolePermissions.permissionId,
                            permissionName: permissions.permissionName,
                            description: permissions.description,
                            category: permissions.category
                        })
                            .from(schema_1.rolePermissions)
                            .innerJoin(permissions, drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissions.id))
                            .where(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId))
                            .orderBy(permissions.category, permissions.permissionName)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getRolePermissions = getRolePermissions;
function assignPermissionToRole(roleId, permissionId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existing, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.rolePermissions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissionId)))
                            .limit(1)];
                case 2:
                    existing = _a.sent();
                    if (existing.length > 0) {
                        return [2 /*return*/, existing[0].id];
                    }
                    id = "rp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(schema_1.rolePermissions).values({
                            id: id,
                            roleId: roleId,
                            permissionId: permissionId
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.assignPermissionToRole = assignPermissionToRole;
function removePermissionFromRole(roleId, permissionId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db["delete"](schema_1.rolePermissions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissionId)))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removePermissionFromRole = removePermissionFromRole;
function createRole(roleName, description) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "role_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    return [4 /*yield*/, db.insert(schema_1.userRoles).values({
                            id: id,
                            userId: null,
                            role: roleName,
                            roleName: roleName,
                            description: description || null,
                            isActive: 1,
                            assignedBy: null,
                            createdAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createRole = createRole;
function createPermission(permissionName, description, category) {
    return __awaiter(this, void 0, void 0, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    id = "perm_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    return [4 /*yield*/, db.insert(permissions).values({
                            id: id,
                            permissionName: permissionName,
                            description: description,
                            category: category
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.createPermission = createPermission;
/**
 * Set password reset token for a user
 */
function setPasswordResetToken(userId, token) {
    return __awaiter(this, void 0, Promise, function () {
        var db, expiresAt, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    expiresAt = new Date(Date.now() + 3600000);
                    return [4 /*yield*/, db.update(schema_1.users)
                            .set({
                            passwordResetToken: token,
                            passwordResetExpiresAt: expiresAt.toISOString().replace('T', ' ').substring(0, 19)
                        })
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_12 = _a.sent();
                    console.error("[Database] Failed to set password reset token:", error_12);
                    throw error_12;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.setPasswordResetToken = setPasswordResetToken;
/**
 * Get password reset token for a user
 */
function getPasswordResetToken(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, result, user, expiresAt, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    if (result.length === 0)
                        return [2 /*return*/, null];
                    user = result[0];
                    if (!user.passwordResetExpiresAt) return [3 /*break*/, 5];
                    expiresAt = new Date(user.passwordResetExpiresAt);
                    if (!(expiresAt < new Date())) return [3 /*break*/, 5];
                    // Token expired, clear it
                    return [4 /*yield*/, clearPasswordResetToken(userId)];
                case 4:
                    // Token expired, clear it
                    _a.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/, user.passwordResetToken || null];
                case 6:
                    error_13 = _a.sent();
                    console.error("[Database] Failed to get password reset token:", error_13);
                    throw error_13;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.getPasswordResetToken = getPasswordResetToken;
/**
 * Clear password reset token for a user
 */
function clearPasswordResetToken(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.update(schema_1.users)
                            .set({
                            passwordResetToken: null,
                            passwordResetExpiresAt: null
                        })
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_14 = _a.sent();
                    console.error("[Database] Failed to clear password reset token:", error_14);
                    throw error_14;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.clearPasswordResetToken = clearPasswordResetToken;
// ============= SUBSCRIPTION UTILITIES =============
function getAvailablePlans(tier) {
    return __awaiter(this, void 0, void 0, function () {
        var db, baseRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.pricingPlans)
                            .where(drizzle_orm_1.eq(schema_1.pricingPlans.isActive, 1))
                            .orderBy(schema_1.pricingPlans.displayOrder, schema_1.pricingPlans.planName)];
                case 2:
                    baseRows = _a.sent();
                    if (!tier)
                        return [2 /*return*/, baseRows];
                    return [2 /*return*/, baseRows.filter(function (plan) { return (plan === null || plan === void 0 ? void 0 : plan.tier) === tier; })];
            }
        });
    });
}
exports.getAvailablePlans = getAvailablePlans;
function getPricingPlan(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.pricingPlans)
                            .where(drizzle_orm_1.eq(schema_1.pricingPlans.id, id))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getPricingPlan = getPricingPlan;
function createSubscription(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.insert(schema_1.subscriptions).values(data)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, data.id))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : data];
            }
        });
    });
}
exports.createSubscription = createSubscription;
/**
 * Get client created by a specific user
 * Used for subscription status checks during login
 */
function getClientByCreatedBy(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.clients)
                            .where(drizzle_orm_1.eq(schema_1.clients.createdBy, userId))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
                case 4:
                    error_15 = _a.sent();
                    console.error("[Database] Failed to get client by created by:", error_15);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getClientByCreatedBy = getClientByCreatedBy;
/**
 * Get active subscription for a client
 * Used to check subscription status during login and operations
 */
function getClientSubscription(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.clientId, clientId))
                            .orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
                case 4:
                    error_16 = _a.sent();
                    console.error("[Database] Failed to get client subscription:", error_16);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getClientSubscription = getClientSubscription;
function getSubscriptionById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, id))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getSubscriptionById = getSubscriptionById;
function updateSubscription(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db
                            .update(schema_1.subscriptions)
                            .set(__assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getSubscriptionById(id)];
            }
        });
    });
}
exports.updateSubscription = updateSubscription;
function getAllSubscriptions() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAllSubscriptions = getAllSubscriptions;
function getOrganizationSubscription(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, organizationId))
                            .orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getOrganizationSubscription = getOrganizationSubscription;
function createBillingNotification(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.insert(schema_1.billingNotifications).values(data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.createBillingNotification = createBillingNotification;
function createBillingUsageMetric(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.insert(schema_1.billingUsageMetrics).values(data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.createBillingUsageMetric = createBillingUsageMetric;
function createExportJob(job) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, db.insert(schema_1.exportJobs).values(job)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, job];
            }
        });
    });
}
exports.createExportJob = createExportJob;
function getBillingUsageMetrics(subscriptionId, startDate, endDate, limit) {
    if (limit === void 0) { limit = 100; }
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    conditions = [drizzle_orm_1.eq(schema_1.billingUsageMetrics.subscriptionId, subscriptionId)];
                    if (startDate)
                        conditions.push(drizzle_orm_1.gte(schema_1.billingUsageMetrics.metricDate, startDate));
                    if (endDate)
                        conditions.push(drizzle_orm_1.lte(schema_1.billingUsageMetrics.metricDate, endDate));
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.billingUsageMetrics)
                            .where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)
                            .orderBy(drizzle_orm_1.desc(schema_1.billingUsageMetrics.metricDate))
                            .limit(limit)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getBillingUsageMetrics = getBillingUsageMetrics;
function getBillingUsageSummary(subscriptionId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions, summary;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { totalUsers: 0, totalProjects: 0, totalTasks: 0, totalDocuments: 0, totalStorageMB: 0, totalApiCalls: 0, totalEmails: 0, sampleCount: 0 }];
                    conditions = [drizzle_orm_1.eq(schema_1.billingUsageMetrics.subscriptionId, subscriptionId)];
                    if (startDate)
                        conditions.push(drizzle_orm_1.gte(schema_1.billingUsageMetrics.metricDate, startDate));
                    if (endDate)
                        conditions.push(drizzle_orm_1.lte(schema_1.billingUsageMetrics.metricDate, endDate));
                    return [4 /*yield*/, db
                            .select({
                            totalUsers: drizzle_orm_1.sum(schema_1.billingUsageMetrics.usersCount).as('totalUsers'),
                            totalProjects: drizzle_orm_1.sum(schema_1.billingUsageMetrics.projectsCount).as('totalProjects'),
                            totalTasks: drizzle_orm_1.sum(schema_1.billingUsageMetrics.tasksCount).as('totalTasks'),
                            totalDocuments: drizzle_orm_1.sum(schema_1.billingUsageMetrics.documentsCount).as('totalDocuments'),
                            totalStorageMB: drizzle_orm_1.sum(schema_1.billingUsageMetrics.storageUsedMB).as('totalStorageMB'),
                            totalApiCalls: drizzle_orm_1.sum(schema_1.billingUsageMetrics.apiCallsCount).as('totalApiCalls'),
                            totalEmails: drizzle_orm_1.sum(schema_1.billingUsageMetrics.emailsSent).as('totalEmails'),
                            sampleCount: drizzle_orm_1.count().as('sampleCount')
                        })
                            .from(schema_1.billingUsageMetrics)
                            .where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)
                            .limit(1)];
                case 2:
                    summary = (_a.sent())[0];
                    return [2 /*return*/, {
                            totalUsers: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalUsers) || '0', 10),
                            totalProjects: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalProjects) || '0', 10),
                            totalTasks: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalTasks) || '0', 10),
                            totalDocuments: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalDocuments) || '0', 10),
                            totalStorageMB: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalStorageMB) || '0', 10),
                            totalApiCalls: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalApiCalls) || '0', 10),
                            totalEmails: parseInt((summary === null || summary === void 0 ? void 0 : summary.totalEmails) || '0', 10),
                            sampleCount: parseInt((summary === null || summary === void 0 ? void 0 : summary.sampleCount) || '0', 10),
                            avgUsers: (summary === null || summary === void 0 ? void 0 : summary.sampleCount) ? parseInt((summary === null || summary === void 0 ? void 0 : summary.totalUsers) || '0', 10) / parseInt((summary === null || summary === void 0 ? void 0 : summary.sampleCount) || '1', 10) : 0,
                            avgProjects: (summary === null || summary === void 0 ? void 0 : summary.sampleCount) ? parseInt((summary === null || summary === void 0 ? void 0 : summary.totalProjects) || '0', 10) / parseInt((summary === null || summary === void 0 ? void 0 : summary.sampleCount) || '1', 10) : 0,
                            avgApiCalls: (summary === null || summary === void 0 ? void 0 : summary.sampleCount) ? parseInt((summary === null || summary === void 0 ? void 0 : summary.totalApiCalls) || '0', 10) / parseInt((summary === null || summary === void 0 ? void 0 : summary.sampleCount) || '1', 10) : 0
                        }];
            }
        });
    });
}
exports.getBillingUsageSummary = getBillingUsageSummary;
function createDunningPolicy(policy) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.dunningPolicies).values(policy)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, policy];
            }
        });
    });
}
exports.createDunningPolicy = createDunningPolicy;
function getDunningPolicies(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.dunningPolicies)
                            .where(drizzle_orm_1.eq(schema_1.dunningPolicies.organizationId, organizationId))
                            .orderBy(drizzle_orm_1.desc(schema_1.dunningPolicies.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getDunningPolicies = getDunningPolicies;
function getDunningPolicy(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.dunningPolicies)
                            .where(drizzle_orm_1.eq(schema_1.dunningPolicies.id, id))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getDunningPolicy = getDunningPolicy;
function getActiveDunningPolicy(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.dunningPolicies)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dunningPolicies.organizationId, organizationId), drizzle_orm_1.eq(schema_1.dunningPolicies.isActive, 1)))
                            .orderBy(drizzle_orm_1.desc(schema_1.dunningPolicies.createdAt))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : null];
            }
        });
    });
}
exports.getActiveDunningPolicy = getActiveDunningPolicy;
function recordPaymentRetry(retry) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.paymentRetries).values(retry)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, retry];
            }
        });
    });
}
exports.recordPaymentRetry = recordPaymentRetry;
function getRetryHistory(invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.paymentRetries)
                            .where(drizzle_orm_1.eq(schema_1.paymentRetries.invoiceId, invoiceId))
                            .orderBy(drizzle_orm_1.desc(schema_1.paymentRetries.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getRetryHistory = getRetryHistory;
function logDunningEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.dunningEvents).values(event)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, event];
            }
        });
    });
}
exports.logDunningEvent = logDunningEvent;
function getDunningEvents(subscriptionId, limit, offset) {
    if (limit === void 0) { limit = 20; }
    if (offset === void 0) { offset = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.dunningEvents)
                            .where(drizzle_orm_1.eq(schema_1.dunningEvents.subscriptionId, subscriptionId))
                            .orderBy(drizzle_orm_1.desc(schema_1.dunningEvents.createdAt))
                            .limit(limit)
                            .offset(offset)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getDunningEvents = getDunningEvents;
function getDunningStatus(subscriptionId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var db, retries, events, retryCount, latestRetry, isDunning, nextRetryAt, overdueDays, dunningPhase;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.paymentRetries)
                            .where(drizzle_orm_1.eq(schema_1.paymentRetries.subscriptionId, subscriptionId))
                            .orderBy(drizzle_orm_1.desc(schema_1.paymentRetries.createdAt))];
                case 2:
                    retries = _b.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.dunningEvents)
                            .where(drizzle_orm_1.eq(schema_1.dunningEvents.subscriptionId, subscriptionId))
                            .orderBy(drizzle_orm_1.desc(schema_1.dunningEvents.createdAt))
                            .limit(50)];
                case 3:
                    events = _b.sent();
                    retryCount = retries.length;
                    latestRetry = retries[0] || null;
                    isDunning = retries.some(function (retry) { return ['pending', 'processing', 'failed'].includes(retry.status); });
                    nextRetryAt = (_a = latestRetry === null || latestRetry === void 0 ? void 0 : latestRetry.nextRetryAt) !== null && _a !== void 0 ? _a : null;
                    overdueDays = (latestRetry === null || latestRetry === void 0 ? void 0 : latestRetry.attemptedAt) ? Math.max(0, Math.floor((Date.now() - new Date(latestRetry.attemptedAt).getTime()) / (1000 * 60 * 60 * 24)))
                        : 0;
                    dunningPhase = !isDunning
                        ? 'none'
                        : (latestRetry === null || latestRetry === void 0 ? void 0 : latestRetry.status) === 'pending'
                            ? 'early'
                            : (latestRetry === null || latestRetry === void 0 ? void 0 : latestRetry.status) === 'failed'
                                ? 'late'
                                : 'late';
                    return [2 /*return*/, {
                            subscriptionId: subscriptionId,
                            isDunning: isDunning,
                            overdueDays: overdueDays,
                            retryCount: retryCount,
                            nextRetryAt: nextRetryAt,
                            dunningPhase: dunningPhase,
                            events: events
                        }];
            }
        });
    });
}
exports.getDunningStatus = getDunningStatus;
function saveIntegrationConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.integrationConfigs).values(config)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, config];
            }
        });
    });
}
exports.saveIntegrationConfig = saveIntegrationConfig;
function getEnabledIntegrations(createdBy) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.integrationConfigs)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.integrationConfigs.createdBy, createdBy), drizzle_orm_1.eq(schema_1.integrationConfigs.isActive, 1)))
                            .orderBy(drizzle_orm_1.desc(schema_1.integrationConfigs.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getEnabledIntegrations = getEnabledIntegrations;
function disableIntegration(integrationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.update(schema_1.integrationConfigs).set({ status: 'inactive', isActive: 0, updatedAt: new Date().toISOString() }).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, integrationId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.disableIntegration = disableIntegration;
function queueSmsMessage(sms) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.smsQueue).values(sms)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, sms];
            }
        });
    });
}
exports.queueSmsMessage = queueSmsMessage;
function createSmsTemplate(template) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.smsTemplates).values(template)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, template];
            }
        });
    });
}
exports.createSmsTemplate = createSmsTemplate;
function getSmsTemplate(templateId, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions, template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    conditions = [drizzle_orm_1.eq(schema_1.smsTemplates.id, templateId)];
                    if (organizationId) {
                        conditions.push(drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId));
                    }
                    return [4 /*yield*/, db.select().from(schema_1.smsTemplates).where(drizzle_orm_1.and.apply(void 0, conditions)).limit(1)];
                case 2:
                    template = (_a.sent())[0];
                    return [2 /*return*/, template !== null && template !== void 0 ? template : null];
            }
        });
    });
}
exports.getSmsTemplate = getSmsTemplate;
function getSmsTemplates(organizationId, category, limit, offset) {
    var _a;
    if (limit === void 0) { limit = 20; }
    if (offset === void 0) { offset = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions, countResult, templates;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, { templates: [], total: 0 }];
                    conditions = [drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId)];
                    if (category)
                        conditions.push(drizzle_orm_1.eq(schema_1.smsTemplates.category, category));
                    return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.smsTemplates).where(drizzle_orm_1.and.apply(void 0, conditions))];
                case 2:
                    countResult = (_b.sent())[0];
                    return [4 /*yield*/, db.select().from(schema_1.smsTemplates).where(drizzle_orm_1.and.apply(void 0, conditions)).orderBy(drizzle_orm_1.desc(schema_1.smsTemplates.createdAt)).limit(limit).offset(offset)];
                case 3:
                    templates = _b.sent();
                    return [2 /*return*/, {
                            templates: templates,
                            total: Number((_a = countResult === null || countResult === void 0 ? void 0 : countResult.total) !== null && _a !== void 0 ? _a : 0)
                        }];
            }
        });
    });
}
exports.getSmsTemplates = getSmsTemplates;
function updateSmsTemplate(templateId, organizationId, updatedData) {
    return __awaiter(this, void 0, void 0, function () {
        var db, template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.update(schema_1.smsTemplates).set(__assign(__assign({}, updatedData), { updatedAt: new Date().toISOString() })).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId)))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.select().from(schema_1.smsTemplates).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId))).limit(1)];
                case 3:
                    template = (_a.sent())[0];
                    return [2 /*return*/, template !== null && template !== void 0 ? template : null];
            }
        });
    });
}
exports.updateSmsTemplate = updateSmsTemplate;
function deleteSmsTemplate(templateId, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db["delete"](schema_1.smsTemplates).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId)))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteSmsTemplate = deleteSmsTemplate;
function createSmsAutomationRule(rule) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.smsAutomationRules).values(rule)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, rule];
            }
        });
    });
}
exports.createSmsAutomationRule = createSmsAutomationRule;
function getSmsAutomationRules(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.smsAutomationRules).where(drizzle_orm_1.eq(schema_1.smsAutomationRules.organizationId, organizationId))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getSmsAutomationRules = getSmsAutomationRules;
// ============= ORGANIZATION / MULTI-TENANCY HELPERS =============
function getAllOrganizations() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.organizations).limit(500)];
            }
        });
    });
}
exports.getAllOrganizations = getAllOrganizations;
function getOrganization(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, org;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.id, id)).limit(1)];
                case 2:
                    org = (_a.sent())[0];
                    return [2 /*return*/, org !== null && org !== void 0 ? org : null];
            }
        });
    });
}
exports.getOrganization = getOrganization;
function getOrganizationBySlug(slug) {
    return __awaiter(this, void 0, void 0, function () {
        var db, org;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.slug, slug)).limit(1)];
                case 2:
                    org = (_a.sent())[0];
                    return [2 /*return*/, org !== null && org !== void 0 ? org : null];
            }
        });
    });
}
exports.getOrganizationBySlug = getOrganizationBySlug;
function createOrganization(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.organizations).values(data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.createOrganization = createOrganization;
function updateOrganization(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.update(schema_1.organizations).set(data).where(drizzle_orm_1.eq(schema_1.organizations.id, id))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.id, id)).limit(1)];
                case 3:
                    updated = (_a.sent())[0];
                    return [2 /*return*/, updated];
            }
        });
    });
}
exports.updateOrganization = updateOrganization;
function getOrganizationSettings(id) {
    return __awaiter(this, void 0, void 0, function () {
        var org;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOrganization(id)];
                case 1:
                    org = _a.sent();
                    return [2 /*return*/, (org === null || org === void 0 ? void 0 : org.settings) || {}];
            }
        });
    });
}
exports.getOrganizationSettings = getOrganizationSettings;
function updateOrganizationSettings(id, settingsUpdate) {
    return __awaiter(this, void 0, void 0, function () {
        var currentSettings, mergedSettings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOrganizationSettings(id)];
                case 1:
                    currentSettings = _a.sent();
                    mergedSettings = __assign(__assign(__assign({}, currentSettings), settingsUpdate), { enterprise: __assign(__assign({}, (currentSettings.enterprise || {})), (settingsUpdate.enterprise || {})) });
                    return [2 /*return*/, updateOrganization(id, { settings: mergedSettings })];
            }
        });
    });
}
exports.updateOrganizationSettings = updateOrganizationSettings;
function deleteOrganization(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db["delete"](schema_1.organizationFeatures).where(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, id))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db["delete"](schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.id, id))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteOrganization = deleteOrganization;
function getOrganizationFeatures(orgId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.organizationFeatures).where(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, orgId))];
            }
        });
    });
}
exports.getOrganizationFeatures = getOrganizationFeatures;
function setOrganizationFeature(organizationId, featureKey, isEnabled, config) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existing, updateSet, insertValues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.select().from(schema_1.organizationFeatures)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId), drizzle_orm_1.eq(schema_1.organizationFeatures.featureKey, featureKey)))
                            .limit(1)];
                case 2:
                    existing = _a.sent();
                    if (!(existing.length > 0)) return [3 /*break*/, 4];
                    updateSet = { isEnabled: isEnabled ? 1 : 0 };
                    if (config !== undefined && config !== null)
                        updateSet.config = config;
                    return [4 /*yield*/, db.update(schema_1.organizationFeatures).set(updateSet)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId), drizzle_orm_1.eq(schema_1.organizationFeatures.featureKey, featureKey)))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    insertValues = {
                        id: "orgfeat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
                        organizationId: organizationId,
                        featureKey: featureKey,
                        isEnabled: isEnabled ? 1 : 0
                    };
                    if (config !== undefined && config !== null)
                        insertValues.config = config;
                    return [4 /*yield*/, db.insert(schema_1.organizationFeatures).values(insertValues)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.setOrganizationFeature = setOrganizationFeature;
function getUsersByOrganization(orgId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.organizationId, orgId)).limit(500)];
            }
        });
    });
}
exports.getUsersByOrganization = getUsersByOrganization;
function assignUserToOrganization(userId, orgId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, u;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.update(schema_1.users).set({ organizationId: orgId }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];
                case 2:
                    _a.sent();
                    if (!orgId) return [3 /*break*/, 5];
                    return [4 /*yield*/, db
                            .select({ role: schema_1.users.role })
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.id, userId))
                            .limit(1)];
                case 3:
                    u = (_a.sent())[0];
                    return [4 /*yield*/, db.insert(schema_extended_1.organizationMembers).values({
                            id: "om_" + userId,
                            organizationId: orgId,
                            userId: userId,
                            role: (u === null || u === void 0 ? void 0 : u.role) || "user",
                            status: "active",
                            isActive: true,
                            joinedAt: new Date()
                        }).onDuplicateKeyUpdate({
                            set: {
                                organizationId: orgId,
                                role: (u === null || u === void 0 ? void 0 : u.role) || "user",
                                status: "active",
                                isActive: true,
                                leftAt: null,
                                updatedAt: new Date()
                            }
                        })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, db
                        .update(schema_extended_1.organizationMembers)
                        .set({ status: "removed", isActive: false, leftAt: new Date(), updatedAt: new Date() })
                        .where(drizzle_orm_1.eq(schema_extended_1.organizationMembers.userId, userId))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.assignUserToOrganization = assignUserToOrganization;
function getAllTenantSuperAdmins() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    // Only return org-scoped super_admins — exclude Kiini platform admins (no organizationId)
                    return [2 /*return*/, db.select().from(schema_1.users)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.role, 'super_admin'), drizzle_orm_1.isNotNull(schema_1.users.organizationId)))
                            .limit(100)];
            }
        });
    });
}
exports.getAllTenantSuperAdmins = getAllTenantSuperAdmins;
function getPricingTierFeatures(tier) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.pricingTierFeatures).where(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier))];
            }
        });
    });
}
exports.getPricingTierFeatures = getPricingTierFeatures;
function getAllPricingTierFeatures() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.pricingTierFeatures).limit(1000)];
            }
        });
    });
}
exports.getAllPricingTierFeatures = getAllPricingTierFeatures;
function setPricingTierFeature(tier, featureKey, isEnabled) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.select().from(schema_1.pricingTierFeatures)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier), drizzle_orm_1.eq(schema_1.pricingTierFeatures.featureKey, featureKey)))
                            .limit(1)];
                case 2:
                    existing = _a.sent();
                    if (!(existing.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.update(schema_1.pricingTierFeatures).set({ isEnabled: isEnabled ? 1 : 0 })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier), drizzle_orm_1.eq(schema_1.pricingTierFeatures.featureKey, featureKey)))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, db.insert(schema_1.pricingTierFeatures).values({
                        id: "ptf_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
                        tier: tier, featureKey: featureKey,
                        isEnabled: isEnabled ? 1 : 0
                    })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.setPricingTierFeature = setPricingTierFeature;
function bulkSetPricingTierFeatures(tier, features) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.entries(features).map(function (_a) {
                        var key = _a[0], enabled = _a[1];
                        return setPricingTierFeature(tier, key, enabled);
                    }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.bulkSetPricingTierFeatures = bulkSetPricingTierFeatures;
function createTenantMessage(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.insert(schema_1.tenantMessages).values(data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.createTenantMessage = createTenantMessage;
function getTenantMessages(filters) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(schema_1.tenantMessages).orderBy(drizzle_orm_1.desc(schema_1.tenantMessages.createdAt)).limit((_a = filters === null || filters === void 0 ? void 0 : filters.limit) !== null && _a !== void 0 ? _a : 100)];
            }
        });
    });
}
exports.getTenantMessages = getTenantMessages;
function markTenantMessageRead(messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    return [4 /*yield*/, db.update(schema_1.tenantMessages).set({ isRead: 1 }).where(drizzle_orm_1.eq(schema_1.tenantMessages.id, messageId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.markTenantMessageRead = markTenantMessageRead;
