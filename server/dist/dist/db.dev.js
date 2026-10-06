"use strict";

var __makeTemplateObject = void 0 && (void 0).__makeTemplateObject || function (cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", {
      value: raw
    });
  } else {
    cooked.raw = raw;
  }

  return cooked;
};

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};

  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  }

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

exports.__esModule = true;
exports.getAllTenantSuperAdmins = exports.markTenantMessageRead = exports.getTenantMessages = exports.createTenantMessage = exports.bulkSetPricingTierFeatures = exports.setPricingTierFeature = exports.getAllPricingTierFeatures = exports.getPricingTierFeatures = exports.assignUserToOrganization = exports.getUsersByOrganization = exports.setOrganizationFeature = exports.getOrganizationFeatures = exports.deleteOrganization = exports.updateOrganization = exports.getAllOrganizations = exports.getOrganizationBySlug = exports.getOrganization = exports.createOrganization = exports.createBillingNotification = exports.createReceiptFromInvoice = exports.createPaymentMethod = exports.getPaymentMethods = exports.getClientInvoices = exports.getAllSubscriptions = exports.updateSubscription = exports.getSubscriptionById = exports.createSubscription = exports.getPricingPlan = exports.getAvailablePlans = exports.getInvoiceById = exports.getClientById = exports.getUserById = exports.getClientSubscription = exports.getClientByCreatedBy = exports.clearPasswordResetToken = exports.getPasswordResetToken = exports.setPasswordResetToken = exports.createPermission = exports.createRole = exports.removePermissionFromRole = exports.assignPermissionToRole = exports.getRolePermissions = exports.getPermissions = exports.getRoles = exports.resetCategoryToDefaults = exports.resetSettingToDefault = exports.setDefaultSetting = exports.getDefaultSettingsByCategory = exports.getDefaultSetting = exports.resetDocumentNumberFormatCounter = exports.getNextDocumentNumberWithFormat = exports.updateDocumentNumberFormat = exports.getDocumentNumberFormat = exports.getDocumentNumberingSettings = exports.resetDocumentNumberCounter = exports.getNextDocumentNumber = exports.deleteSetting = exports.setSetting = exports.getAllSettings = exports.getSettingsByCategory = exports.getSetting = exports.logActivity = exports.getPaymentsByInvoice = exports.createPayment = exports.updateEstimate = exports.getEstimatesByClient = exports.getAllEstimates = exports.getEstimate = exports.createEstimate = exports.updateInvoice = exports.getInvoicesByClient = exports.getAllInvoices = exports.getInvoice = exports.createInvoice = exports.deleteClient = exports.updateClient = exports.getAllClients = exports.getClient = exports.createClient = exports.deleteProjectTask = exports.updateProjectTask = exports.getProjectTasks = exports.createProjectTask = exports.deleteProject = exports.updateProject = exports.getProjectsByStatus = exports.getProjectsByClient = exports.getAllProjects = exports.getProject = exports.createProject = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadNotifications = exports.getUserNotifications = exports.createNotification = exports.getUserPassword = exports.setUserPassword = exports.updateUser = exports.getAllUsers = exports.getUser = exports.upsertUser = exports.getDb = exports.__resetDbForTests = exports.__setDbForTests = void 0;

var drizzle_orm_1 = require("drizzle-orm");

var mysql2_1 = require("drizzle-orm/mysql2");

var migrator_1 = require("drizzle-orm/mysql2/migrator");

var mysql = require("mysql2/promise"); // sqlite support for tests will be dynamically imported below when needed


var schema_1 = require("../drizzle/schema");

var uuid_1 = require("uuid");

var env_1 = require("./_core/env");

var _db = null;
var _pool = null;
var _migrationsRun = false; // helpers used in unit tests to override or reset database instance

function __setDbForTests(dbInstance) {
  _db = dbInstance;
}

exports.__setDbForTests = __setDbForTests;

function __resetDbForTests() {
  _db = null;
}

exports.__resetDbForTests = __resetDbForTests; // Lazily create the drizzle instance so local tooling can run without a DB.

function getDb() {
  return __awaiter(this, void 0, void 0, function () {
    var dbSchema, migrationError_1, error_1, sqlitePkg, _a, drizzleSqlite, sqlite3, conn, err_1;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!(!_db && process.env.DATABASE_URL)) return [3
          /*break*/
          , 9];
          _b.label = 1;

        case 1:
          _b.trys.push([1, 8,, 9]);

          console.log("[Database] Attempting to create drizzle connection...");
          if (!!_pool) return [3
          /*break*/
          , 3];
          return [4
          /*yield*/
          , mysql.createPool({
            uri: process.env.DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
            connectTimeout: 30000
          })];

        case 2:
          _pool = _b.sent();
          _b.label = 3;

        case 3:
          dbSchema = {
            users: schema_1.users,
            clients: schema_1.clients,
            products: schema_1.products,
            services: schema_1.services,
            estimates: schema_1.estimates,
            estimateItems: schema_1.estimateItems,
            invoices: schema_1.invoices,
            invoiceItems: schema_1.invoiceItems,
            payments: schema_1.payments,
            expenses: schema_1.expenses,
            accounts: schema_1.accounts,
            journalEntries: schema_1.journalEntries,
            journalEntryLines: schema_1.journalEntryLines,
            bankAccounts: schema_1.bankAccounts,
            bankTransactions: schema_1.bankTransactions,
            employees: schema_1.employees,
            leaveRequests: schema_1.leaveRequests,
            payroll: schema_1.payroll,
            opportunities: schema_1.opportunities,
            templates: schema_1.templates,
            activityLog: schema_1.activityLog,
            settings: schema_1.settings,
            projects: schema_1.projects,
            projectTasks: schema_1.projectTasks,
            notifications: schema_1.notifications,
            documentNumberFormats: schema_1.documentNumberFormats,
            defaultSettings: schema_1.defaultSettings,
            rolePermissions: schema_1.rolePermissions,
            userRoles: schema_1.userRoles,
            userPermissions: schema_1.userPermissions,
            permissionMetadata: schema_1.permissionMetadata,
            departments: schema_1.departments,
            budgets: schema_1.budgets,
            budgetLines: schema_1.budgetLines,
            employeeDocuments: schema_1.employeeDocuments,
            subscriptions: schema_1.subscriptions,
            customFields: schema_1.customFields,
            fieldValidations: schema_1.fieldValidations,
            fieldValues: schema_1.fieldValues,
            workOrders: schema_1.workOrders,
            budgetAllocations: schema_1.budgetAllocations,
            lpos: schema_1.lpos,
            lpoLineItems: schema_1.lpoLineItems,
            lineItems: schema_1.lineItems,
            recurringInvoices: schema_1.recurringInvoices,
            serviceInvoices: schema_1.serviceInvoices,
            serviceInvoiceItems: schema_1.serviceInvoiceItems,
            receipts: schema_1.receipts,
            jobGroups: schema_1.jobGroups,
            attendance: schema_1.attendance,
            aiChatSessions: schema_1.aiChatSessions,
            aiChatMessages: schema_1.aiChatMessages,
            conversations: schema_1.conversations,
            conversationMembers: schema_1.conversationMembers,
            messages: schema_1.messages,
            messageReadReceipts: schema_1.messageReadReceipts,
            pricingTierFeatures: schema_1.pricingTierFeatures,
            tenantMessages: schema_1.tenantMessages
          }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

          _db = mysql2_1.drizzle(_pool, {
            schema: dbSchema,
            mode: "default"
          });
          console.log("[Database] ✅ Drizzle connection created successfully");
          if (!(!_migrationsRun && _db && process.env.NODE_ENV !== 'test')) return [3
          /*break*/
          , 7];
          _b.label = 4;

        case 4:
          _b.trys.push([4, 6,, 7]);

          console.log("[Database] Running migrations...");
          return [4
          /*yield*/
          , migrator_1.migrate(_db, {
            migrationsFolder: "./drizzle/migrations"
          })];

        case 5:
          _b.sent();

          _migrationsRun = true;
          console.log("[Database] ✅ Migrations completed successfully");
          return [3
          /*break*/
          , 7];

        case 6:
          migrationError_1 = _b.sent();
          console.error("[Database] ⚠️  Migration error (continuing anyway):", migrationError_1 instanceof Error ? migrationError_1.message : migrationError_1); // Don't fail startup if migrations have issues - tables might already exist

          _migrationsRun = true;
          return [3
          /*break*/
          , 7];

        case 7:
          return [3
          /*break*/
          , 9];

        case 8:
          error_1 = _b.sent();
          console.error("[Database] ❌ Failed to connect:", error_1 instanceof Error ? error_1.message : error_1);
          _db = null;
          _pool = null;
          return [3
          /*break*/
          , 9];

        case 9:
          if (!(!_db && process.env.NODE_ENV === "test")) return [3
          /*break*/
          , 13];
          _b.label = 10;

        case 10:
          _b.trys.push([10, 12,, 13]);

          console.log("[Database] Creating sqlite in-memory DB for tests...");
          sqlitePkg = "drizzle-orm/sqlite3";
          return [4
          /*yield*/
          , Promise.all([Promise.resolve().then(function () {
            return require(sqlitePkg);
          }), Promise.resolve().then(function () {
            return require("sqlite3");
          })])];

        case 11:
          _a = _b.sent(), drizzleSqlite = _a[0].drizzle, sqlite3 = _a[1];
          conn = new sqlite3.Database(":memory:");
          _db = drizzleSqlite(conn);
          return [3
          /*break*/
          , 13];

        case 12:
          err_1 = _b.sent();
          console.warn("[Database] sqlite memory init failed", err_1);
          _db = null;
          return [3
          /*break*/
          , 13];

        case 13:
          if (!_db && !process.env.DATABASE_URL) {
            console.warn("[Database] DATABASE_URL not set");
          }

          return [2
          /*return*/
          , _db];
      }
    });
  });
}

exports.getDb = getDb;

function upsertUser(user) {
  return __awaiter(this, void 0, Promise, function () {
    var db, values_1, updateSet_1, textFields, assignNullable, placeholder, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!user.id) {
            throw new Error("User ID is required for upsert");
          }

          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();

          if (!db) {
            console.warn("[Database] Cannot upsert user: database not available");
            return [2
            /*return*/
            ];
          }

          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          values_1 = {
            id: user.id
          };
          updateSet_1 = {};
          textFields = ["name", "email", "loginMethod"];

          assignNullable = function assignNullable(field) {
            var value = user[field];
            if (value === undefined) return;
            var normalized = value !== null && value !== void 0 ? value : null;
            values_1[field] = normalized;
            updateSet_1[field] = normalized;
          };

          textFields.forEach(assignNullable); // Ensure required non-null DB columns have values to avoid INSERT errors
          // Some deployed DB schemas mark `email` and `name` as NOT NULL.
          // Only set placeholders for NEW inserts, NOT for updates (to preserve existing data)

          if (values_1.email === undefined || values_1.email === null || values_1.email === "") {
            placeholder = user.id + "@no-email.local";
            values_1.email = placeholder; // DO NOT update existing user emails - preserve their current email
            // updateSet.email = placeholder;
          }

          if (values_1.name === undefined || values_1.name === null) {
            values_1.name = ""; // DO NOT update existing user names - preserve their current name
            // updateSet.name = "";
          }

          if (user.lastSignedIn !== undefined) {
            values_1.lastSignedIn = user.lastSignedIn;
            updateSet_1.lastSignedIn = user.lastSignedIn;
          }

          if (user.role === undefined) {
            if (user.id === env_1.ENV.ownerId) {
              user.role = 'admin';
              values_1.role = 'admin';
              updateSet_1.role = 'admin';
            }
          }

          if (Object.keys(updateSet_1).length === 0) {
            updateSet_1.lastSignedIn = new Date().toISOString().replace('T', ' ').substring(0, 19);
          }

          return [4
          /*yield*/
          , db.insert(schema_1.users).values(values_1).onDuplicateKeyUpdate({
            set: updateSet_1
          })];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 5];

        case 4:
          error_2 = _a.sent();
          console.error("[Database] Failed to upsert user:", error_2);
          throw error_2;

        case 5:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();

          if (!db) {
            console.warn("[Database] Cannot get user: database not available");
            return [2
            /*return*/
            , undefined];
          }

          return [4
          /*yield*/
          , db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, id)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : undefined];
      }
    });
  });
}

exports.getUser = getUser;

function getAllUsers() {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.users).orderBy(drizzle_orm_1.desc(schema_1.users.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
      }
    });
  });
}

exports.getAllUsers = getAllUsers;

function updateUser(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var db, updateSet, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();

          if (!db) {
            console.warn("[Database] Cannot update user: database not available");
            return [2
            /*return*/
            ];
          }

          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          updateSet = {};
          if (data.name !== undefined) updateSet.name = data.name;
          if (data.email !== undefined) updateSet.email = data.email;
          if (data.loginMethod !== undefined) updateSet.loginMethod = data.loginMethod;
          if (data.role !== undefined) updateSet.role = data.role;
          if (data.lastSignedIn !== undefined) updateSet.lastSignedIn = data.lastSignedIn;

          if (Object.keys(updateSet).length === 0) {
            return [2
            /*return*/
            ]; // Nothing to update
          }

          return [4
          /*yield*/
          , db.update(schema_1.users).set(updateSet).where(drizzle_orm_1.eq(schema_1.users.id, id))];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 5];

        case 4:
          error_3 = _a.sent();
          console.error("[Database] Failed to update user:", error_3);
          throw error_3;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateUser = updateUser; // ============= USER PASSWORD MANAGEMENT =============

function setUserPassword(userId, passwordHash) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.users).set({
            passwordHash: passwordHash
          }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select({
            passwordHash: schema_1.users.passwordHash
          }).from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, userId)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0].passwordHash : null];
      }
    });
  });
}

exports.getUserPassword = getUserPassword; // ============= NOTIFICATIONS =============

function createNotification(notification) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id, notificationData, broadcastNotification, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          notificationData = __assign(__assign({}, notification), {
            id: id
          });
          return [4
          /*yield*/
          , db.insert(schema_1.notifications).values(notificationData)];

        case 2:
          _a.sent();

          _a.label = 3;

        case 3:
          _a.trys.push([3, 6,, 7]);

          return [4
          /*yield*/
          , Promise.resolve().then(function () {
            return require("../server/websocket/notificationBroadcaster");
          })];

        case 4:
          broadcastNotification = _a.sent().broadcastNotification;
          return [4
          /*yield*/
          , broadcastNotification(notification.userId, notificationData)];

        case 5:
          _a.sent();

          return [3
          /*break*/
          , 7];

        case 6:
          error_4 = _a.sent();
          console.warn("Could not broadcast notification, websocket may not be available:", error_4);
          return [3
          /*break*/
          , 7];

        case 7:
          return [2
          /*return*/
          , id];
      }
    });
  });
}

exports.createNotification = createNotification;

function getUserNotifications(userId, limit) {
  if (limit === void 0) {
    limit = 50;
  }

  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.notifications).where(drizzle_orm_1.eq(schema_1.notifications.userId, userId)).orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt)).limit(limit)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.notifications).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, userId), drizzle_orm_1.eq(schema_1.notifications.isRead, 0))).orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.notifications).set({
            isRead: 1,
            readAt: new Date().toISOString()
          }).where(drizzle_orm_1.eq(schema_1.notifications.id, notificationId))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.markNotificationAsRead = markNotificationAsRead;

function markAllNotificationsAsRead(userId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, now;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          now = new Date().toISOString();
          return [4
          /*yield*/
          , db.update(schema_1.notifications).set({
            isRead: 1,
            readAt: now
          }).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, userId), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.notifications).where(drizzle_orm_1.eq(schema_1.notifications.id, notificationId))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteNotification = deleteNotification; // ============= PROJECTS =============

function createProject(project) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.projects).values(__assign(__assign({}, project), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.id, id)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.projects).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.clientId, clientId)).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.status, status)).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.projects).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.projects.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteProject = deleteProject; // ============= PROJECT TASKS =============

function createProjectTask(task) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.projectTasks).values(__assign(__assign({}, task), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.projectTasks).where(drizzle_orm_1.eq(schema_1.projectTasks.projectId, projectId)).orderBy(schema_1.projectTasks.order, drizzle_orm_1.desc(schema_1.projectTasks.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.projectTasks).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.projectTasks.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.projectTasks).where(drizzle_orm_1.eq(schema_1.projectTasks.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteProjectTask = deleteProjectTask; // ============= CLIENTS =============

function createClient(client) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "client_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.clients).values(__assign(__assign({}, client), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, id)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
      }
    });
  });
}

exports.getClient = getClient;

function getAllClients() {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.clients).orderBy(drizzle_orm_1.desc(schema_1.clients.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.clients).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.clients.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteClient = deleteClient; // ============= INVOICES =============

function createInvoice(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.invoices).values(__assign(__assign({}, invoice), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, id)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId)).orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
      }
    });
  });
}

exports.getInvoicesByClient = getInvoicesByClient;

function updateInvoice(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.invoices).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.invoices.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateInvoice = updateInvoice; // ============= ESTIMATES =============

function createEstimate(estimate) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "est_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.estimates).values(__assign(__assign({}, estimate), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.id, id)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.estimates).orderBy(drizzle_orm_1.desc(schema_1.estimates.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.clientId, clientId)).orderBy(drizzle_orm_1.desc(schema_1.estimates.createdAt))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.estimates).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.estimates.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateEstimate = updateEstimate; // ============= PAYMENTS =============

function createPayment(payment) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "pay_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.payments).values(__assign(__assign({}, payment), {
            id: id
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.payments).where(drizzle_orm_1.eq(schema_1.payments.invoiceId, invoiceId)).orderBy(drizzle_orm_1.desc(schema_1.payments.paymentDate))];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
      }
    });
  });
}

exports.getPaymentsByInvoice = getPaymentsByInvoice; // ============= ACTIVITY LOG =============

function logActivity(activity) {
  return __awaiter(this, void 0, void 0, function () {
    var db, id, mysqlDateTime, logEntry, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          ];
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
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.insert(schema_1.activityLog).values(logEntry)];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 5];

        case 4:
          error_5 = _a.sent(); // Log detailed error but do not re-throw to prevent failing the calling operation

          console.error('Failed to insert activityLog entry:', {
            error: (error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || error_5,
            code: error_5 === null || error_5 === void 0 ? void 0 : error_5.code,
            entry: logEntry
          }); // Graceful fallback: skip logging to DB when it fails

          return [2
          /*return*/
          ];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.logActivity = logActivity; // ============= SETTINGS =============

function getSetting(key) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.key, key)).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, category)).orderBy(schema_1.settings.key)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.settings).orderBy(schema_1.settings.category, schema_1.settings.key)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "set_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , getSetting(key)];

        case 2:
          existing = _a.sent();
          if (!existing) return [3
          /*break*/
          , 4];
          return [4
          /*yield*/
          , db.update(schema_1.settings).set({
            value: value,
            category: category || existing.category,
            description: description || existing.description,
            updatedBy: updatedBy,
            updatedAt: new Date().toISOString()
          }).where(drizzle_orm_1.eq(schema_1.settings.key, key))];

        case 3:
          _a.sent();

          return [2
          /*return*/
          , existing.id];

        case 4:
          // Insert new setting
          return [4
          /*yield*/
          , db.insert(schema_1.settings).values({
            id: id,
            key: key,
            value: value,
            category: category,
            description: description,
            updatedBy: updatedBy,
            updatedAt: new Date().toISOString()
          })];

        case 5:
          // Insert new setting
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.key, key))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteSetting = deleteSetting; // ============= DOCUMENT NUMBER AUTO-INCREMENT =============

/**
 * Get the next document number for a given document type
 * Supports: invoice, estimate, receipt, proposal, expense
 */

function getNextDocumentNumber(documentType) {
  return __awaiter(this, void 0, Promise, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available"); // Use the new formatted numbering system

          return [2
          /*return*/
          , getNextDocumentNumberWithFormat(documentType)];
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
    project: 'PROJ-'
  };
  return prefixes[documentType] || 'DOC-';
}
/**
 * Reset document number counter for a given document type
 */


function resetDocumentNumberCounter(documentType, startNumber) {
  if (startNumber === void 0) {
    startNumber = 1;
  }

  return __awaiter(this, void 0, void 0, function () {
    var db, nextKey;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          nextKey = documentType + "_next";
          return [4
          /*yield*/
          , setSetting(nextKey, String(startNumber), 'document_numbering')];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , {}];
          return [4
          /*yield*/
          , getSettingsByCategory('document_numbering')];

        case 2:
          settings_list = _a.sent();
          result = {};
          settings_list.forEach(function (setting) {
            result[setting.key] = setting.value || '';
          });
          return [2
          /*return*/
          , result];
      }
    });
  });
}

exports.getDocumentNumberingSettings = getDocumentNumberingSettings; // ============= DOCUMENT NUMBER FORMATTING =============

function getDocumentNumberFormat(documentType) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_6, code, msg;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.documentNumberFormats).where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_6 = _a.sent();
          code = (error_6 === null || error_6 === void 0 ? void 0 : error_6.code) || (error_6 === null || error_6 === void 0 ? void 0 : error_6.errno) || '';
          msg = (error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || '';

          if (code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist")) {
            console.warn('[Database] documentNumberFormats table missing - returning null');
            return [2
            /*return*/
            , null];
          }

          throw error_6;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getDocumentNumberFormat = getDocumentNumberFormat;

function updateDocumentNumberFormat(documentType, format) {
  return __awaiter(this, void 0, void 0, function () {
    var db, existing, now, id, error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          _a.label = 2;

        case 2:
          _a.trys.push([2, 8,, 9]);

          return [4
          /*yield*/
          , getDocumentNumberFormat(documentType)];

        case 3:
          existing = _a.sent();
          now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          if (!existing) return [3
          /*break*/
          , 5];
          return [4
          /*yield*/
          , db.update(schema_1.documentNumberFormats).set({
            prefix: format.prefix !== undefined ? format.prefix : existing.prefix,
            padding: format.padding !== undefined ? format.padding : existing.padding,
            separator: format.separator !== undefined ? format.separator : existing.separator,
            updatedAt: now
          }).where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];

        case 4:
          _a.sent();

          return [2
          /*return*/
          , existing.id];

        case 5:
          id = "dnf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.documentNumberFormats).values({
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

          return [2
          /*return*/
          , id];

        case 7:
          return [3
          /*break*/
          , 9];

        case 8:
          error_7 = _a.sent();

          if ((error_7 === null || error_7 === void 0 ? void 0 : error_7.code) === 'ER_NO_SUCH_TABLE') {
            console.warn('[Database] documentNumberFormats table not available');
            return [2
            /*return*/
            , "dnf_" + Date.now()];
          }

          throw error_7;

        case 9:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateDocumentNumberFormat = updateDocumentNumberFormat;

function getNextDocumentNumberWithFormat(documentType) {
  return __awaiter(this, void 0, Promise, function () {
    var db, format, yearMatch, newPrefix, err_2, id, prefix_1, now, error_8, code, msg, now, prefix, padding, separator, nextNum, paddedNumber, documentNumber;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , getDocumentNumberFormat(documentType)];

        case 2:
          format = _a.sent();
          if (!(format && format.prefix)) return [3
          /*break*/
          , 6];
          yearMatch = format.prefix.match(/(.+)-\d{4}$/);
          if (!yearMatch) return [3
          /*break*/
          , 6];
          newPrefix = yearMatch[1];
          format.prefix = newPrefix;
          _a.label = 3;

        case 3:
          _a.trys.push([3, 5,, 6]);

          return [4
          /*yield*/
          , db.update(schema_1.documentNumberFormats).set({
            prefix: newPrefix,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }).where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];

        case 4:
          _a.sent();

          console.log("[DB] removed year from prefix for " + documentType + ", new prefix='" + newPrefix + "'");
          return [3
          /*break*/
          , 6];

        case 5:
          err_2 = _a.sent();
          console.warn("[DB] failed to sanitize prefix for " + documentType, err_2);
          return [3
          /*break*/
          , 6];

        case 6:
          if (!!format) return [3
          /*break*/
          , 16];
          id = uuid_1.v4();
          prefix_1 = getDefaultPrefix(documentType).replace('-', '');
          _a.label = 7;

        case 7:
          _a.trys.push([7, 9,, 14]);

          now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          return [4
          /*yield*/
          , db.insert(schema_1.documentNumberFormats).values({
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

          return [3
          /*break*/
          , 14];

        case 9:
          error_8 = _a.sent();
          code = (error_8 === null || error_8 === void 0 ? void 0 : error_8.code) || (error_8 === null || error_8 === void 0 ? void 0 : error_8.errno) || '';
          msg = (error_8 === null || error_8 === void 0 ? void 0 : error_8.message) || '';
          if (!(code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist"))) return [3
          /*break*/
          , 12];
          console.warn('[Database] documentNumberFormats table still missing during insert, attempting to create.'); // attempt to create table manually

          return [4
          /*yield*/
          , db.execute("\n          CREATE TABLE IF NOT EXISTS documentNumberFormats (\n            id VARCHAR(64) PRIMARY KEY,\n            documentType ENUM('invoice','estimate','receipt','proposal','expense') NOT NULL,\n            prefix VARCHAR(50) NOT NULL DEFAULT '',\n            padding INT NOT NULL DEFAULT 6,\n            separator VARCHAR(5) DEFAULT '-',\n            currentNumber INT NOT NULL DEFAULT 1,\n            createdAt TIMESTAMP,\n            updatedAt TIMESTAMP\n          )\n        ")];

        case 10:
          // attempt to create table manually
          _a.sent();

          now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          return [4
          /*yield*/
          , db.insert(schema_1.documentNumberFormats).values({
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

          return [3
          /*break*/
          , 13];

        case 12:
          throw error_8;

        case 13:
          return [3
          /*break*/
          , 14];

        case 14:
          return [4
          /*yield*/
          , getDocumentNumberFormat(documentType)];

        case 15:
          format = _a.sent();
          if (!format) throw new Error("Failed to create document format");
          _a.label = 16;

        case 16:
          prefix = format.prefix || '';
          padding = format.padding || 6;
          separator = format.separator || '-';
          nextNum = format.currentNumber || 1;
          paddedNumber = String(nextNum).padStart(padding, '0');
          documentNumber = prefix ? "" + prefix + separator + paddedNumber : paddedNumber; // Increment and save the next number

          return [4
          /*yield*/
          , db.update(schema_1.documentNumberFormats).set({
            currentNumber: nextNum + 1,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }).where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];

        case 17:
          // Increment and save the next number
          _a.sent();

          return [2
          /*return*/
          , documentNumber];
      }
    });
  });
}

exports.getNextDocumentNumberWithFormat = getNextDocumentNumberWithFormat;

function generateFormatExample(prefix, padding, separator, exampleNumber) {
  if (exampleNumber === void 0) {
    exampleNumber = 1;
  }

  var paddedNumber = String(exampleNumber).padStart(padding, '0');
  return prefix ? "" + prefix + separator + paddedNumber : paddedNumber;
}

function resetDocumentNumberFormatCounter(documentType, startNumber) {
  if (startNumber === void 0) {
    startNumber = 1;
  }

  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.documentNumberFormats).set({
            currentNumber: startNumber,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }).where(drizzle_orm_1.eq(schema_1.documentNumberFormats.documentType, documentType))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.resetDocumentNumberFormatCounter = resetDocumentNumberFormatCounter; // ============= DEFAULT SETTINGS =============

function getDefaultSetting(category, key) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          return [4
          /*yield*/
          , db.select().from(schema_1.defaultSettings).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.defaultSettings.category, category), drizzle_orm_1.eq(schema_1.defaultSettings.key, key))).limit(1)];

        case 2:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.defaultSettings).where(drizzle_orm_1.eq(schema_1.defaultSettings.category, category)).orderBy(schema_1.defaultSettings.key)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "dset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , getDefaultSetting(category, key)];

        case 2:
          existing = _a.sent();
          if (!existing) return [3
          /*break*/
          , 4];
          return [4
          /*yield*/
          , db.update(schema_1.defaultSettings).set({
            value: defaultValue,
            description: description || existing.description
          }).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.defaultSettings.category, category), drizzle_orm_1.eq(schema_1.defaultSettings.key, key)))];

        case 3:
          _a.sent();

          return [2
          /*return*/
          , existing.id];

        case 4:
          return [4
          /*yield*/
          , db.insert(schema_1.defaultSettings).values({
            id: id,
            category: category,
            key: key,
            value: defaultValue,
            description: description
          })];

        case 5:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.select().from(schema_1.defaultSettings)];

        case 2:
          allDefaults = _a.sent();
          defaultSetting = allDefaults.find(function (d) {
            return d.key === key;
          });
          if (!defaultSetting) return [3
          /*break*/
          , 4]; // Reset the setting to its default value

          return [4
          /*yield*/
          , setSetting(key, defaultSetting.value, defaultSetting.category)];

        case 3:
          // Reset the setting to its default value
          _a.sent();

          _a.label = 4;

        case 4:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , getDefaultSettingsByCategory(category)];

        case 2:
          defaults = _a.sent();
          _i = 0, defaults_1 = defaults;
          _a.label = 3;

        case 3:
          if (!(_i < defaults_1.length)) return [3
          /*break*/
          , 6];
          defaultSetting = defaults_1[_i];
          if (!defaultSetting.value) return [3
          /*break*/
          , 5];
          return [4
          /*yield*/
          , setSetting(defaultSetting.key, defaultSetting.value, category)];

        case 4:
          _a.sent();

          _a.label = 5;

        case 5:
          _i++;
          return [3
          /*break*/
          , 3];

        case 6:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.resetCategoryToDefaults = resetCategoryToDefaults; // ============= ROLES & PERMISSIONS =============

function getRoles() {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_9;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3,, 4]);

          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select().from(schema_1.userRoles).orderBy(schema_1.userRoles.roleName)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];

        case 3:
          error_9 = _a.sent();
          console.error("Error fetching roles:", error_9); // Return default roles if query fails

          return [2
          /*return*/
          , [{
            id: "1",
            userId: null,
            role: 'admin',
            roleName: "Admin",
            description: "Administrator role",
            isActive: 1,
            assignedBy: null,
            createdAt: new Date().toISOString()
          }, {
            id: "2",
            userId: null,
            role: 'staff',
            roleName: "Staff",
            description: "Staff role",
            isActive: 1,
            assignedBy: null,
            createdAt: new Date().toISOString()
          }, {
            id: "3",
            userId: null,
            role: 'client',
            roleName: "Client",
            description: "Client role",
            isActive: 1,
            assignedBy: null,
            createdAt: new Date().toISOString()
          }]];

        case 4:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getRoles = getRoles;

function getPermissions() {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_10;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2,, 3]);

          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []]; // Note: permissions table doesn't exist in current DB schema
          // Permissions are managed via RBAC middleware instead
          // Return default permissions on request

          return [2
          /*return*/
          , [{
            id: "1",
            name: "View",
            permissionName: "view",
            description: "View records",
            category: "general",
            resource: "*",
            action: "view",
            createdAt: new Date().toISOString()
          }, {
            id: "2",
            name: "Create",
            permissionName: "create",
            description: "Create records",
            category: "general",
            resource: "*",
            action: "create",
            createdAt: new Date().toISOString()
          }, {
            id: "3",
            name: "Edit",
            permissionName: "edit",
            description: "Edit records",
            category: "general",
            resource: "*",
            action: "edit",
            createdAt: new Date().toISOString()
          }, {
            id: "4",
            name: "Delete",
            permissionName: "delete",
            description: "Delete records",
            category: "general",
            resource: "*",
            action: "delete",
            createdAt: new Date().toISOString()
          }]];

        case 2:
          error_10 = _a.sent();
          console.error("Error fetching permissions:", error_10); // Return default permissions if query fails

          return [2
          /*return*/
          , [{
            id: "1",
            name: "View",
            permissionName: "view",
            description: "View records",
            category: "general",
            resource: "*",
            action: "view",
            createdAt: new Date().toISOString()
          }, {
            id: "2",
            name: "Create",
            permissionName: "create",
            description: "Create records",
            category: "general",
            resource: "*",
            action: "create",
            createdAt: new Date().toISOString()
          }, {
            id: "3",
            name: "Edit",
            permissionName: "edit",
            description: "Edit records",
            category: "general",
            resource: "*",
            action: "edit",
            createdAt: new Date().toISOString()
          }, {
            id: "4",
            name: "Delete",
            permissionName: "delete",
            description: "Delete records",
            category: "general",
            resource: "*",
            action: "delete",
            createdAt: new Date().toISOString()
          }]];

        case 3:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          return [4
          /*yield*/
          , db.select({
            permissionId: schema_1.rolePermissions.permissionId,
            permissionName: permissions.permissionName,
            description: permissions.description,
            category: permissions.category
          }).from(schema_1.rolePermissions).innerJoin(permissions, drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissions.id)).where(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId)).orderBy(permissions.category, permissions.permissionName)];

        case 2:
          return [2
          /*return*/
          , _a.sent()];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.select().from(schema_1.rolePermissions).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissionId))).limit(1)];

        case 2:
          existing = _a.sent();

          if (existing.length > 0) {
            return [2
            /*return*/
            , existing[0].id];
          }

          id = "rp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(schema_1.rolePermissions).values({
            id: id,
            roleId: roleId,
            permissionId: permissionId
          })];

        case 3:
          _a.sent();

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.rolePermissions).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, permissionId)))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "role_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          now = new Date().toISOString().replace('T', ' ').substring(0, 19);
          return [4
          /*yield*/
          , db.insert(schema_1.userRoles).values({
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

          return [2
          /*return*/
          , id];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          id = "perm_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          return [4
          /*yield*/
          , db.insert(permissions).values({
            id: id,
            permissionName: permissionName,
            description: description,
            category: category
          })];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , id];
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
    var db, expiresAt, error_11;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          expiresAt = new Date(Date.now() + 3600000);
          return [4
          /*yield*/
          , db.update(schema_1.users).set({
            passwordResetToken: token,
            passwordResetExpiresAt: expiresAt.toISOString()
          }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 5];

        case 4:
          error_11 = _a.sent();
          console.error("[Database] Failed to set password reset token:", error_11);
          throw error_11;

        case 5:
          return [2
          /*return*/
          ];
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
    var db, result, user, expiresAt, error_12;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          _a.label = 2;

        case 2:
          _a.trys.push([2, 6,, 7]);

          return [4
          /*yield*/
          , db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, userId)).limit(1)];

        case 3:
          result = _a.sent();
          if (result.length === 0) return [2
          /*return*/
          , null];
          user = result[0];
          if (!user.passwordResetExpiresAt) return [3
          /*break*/
          , 5];
          expiresAt = new Date(user.passwordResetExpiresAt);
          if (!(expiresAt < new Date())) return [3
          /*break*/
          , 5]; // Token expired, clear it

          return [4
          /*yield*/
          , clearPasswordResetToken(userId)];

        case 4:
          // Token expired, clear it
          _a.sent();

          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          , user.passwordResetToken || null];

        case 6:
          error_12 = _a.sent();
          console.error("[Database] Failed to get password reset token:", error_12);
          throw error_12;

        case 7:
          return [2
          /*return*/
          ];
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
    var db, error_13;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.update(schema_1.users).set({
            passwordResetToken: null,
            passwordResetExpiresAt: null
          }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 5];

        case 4:
          error_13 = _a.sent();
          console.error("[Database] Failed to clear password reset token:", error_13);
          throw error_13;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.clearPasswordResetToken = clearPasswordResetToken; // ============= SUBSCRIPTION UTILITIES =============

/**
 * Get client created by a specific user
 * Used for subscription status checks during login
 */

function getClientByCreatedBy(userId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_14;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.createdBy, userId)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_14 = _a.sent();
          console.error("[Database] Failed to get client by created by:", error_14);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
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
    var db, result, error_15;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.subscriptions).where(drizzle_orm_1.eq(schema_1.subscriptions.clientId, clientId)).orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_15 = _a.sent();
          console.error("[Database] Failed to get client subscription:", error_15);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getClientSubscription = getClientSubscription; // ============= BILLING ALIASES & HELPERS =============

/** Alias for getUser – used by billing router */

function getUserById(id) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2
      /*return*/
      , getUser(id)];
    });
  });
}

exports.getUserById = getUserById;
/** Alias for getClient – used by billing router */

function getClientById(id) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2
      /*return*/
      , getClient(id)];
    });
  });
}

exports.getClientById = getClientById;
/** Alias for getInvoice – used by billing router */

function getInvoiceById(id) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2
      /*return*/
      , getInvoice(id)];
    });
  });
}

exports.getInvoiceById = getInvoiceById; // ============= PRICING PLANS =============

function getAvailablePlans(tier) {
  return __awaiter(this, void 0, void 0, function () {
    var db, query, results, error_16;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          query = db.select().from(schema_1.pricingPlans).where(drizzle_orm_1.eq(schema_1.pricingPlans.isActive, 1));
          return [4
          /*yield*/
          , query.orderBy(schema_1.pricingPlans.displayOrder)];

        case 3:
          results = _a.sent();
          if (tier) return [2
          /*return*/
          , results.filter(function (p) {
            return p.tier === tier;
          })];
          return [2
          /*return*/
          , results];

        case 4:
          error_16 = _a.sent();
          console.error("[Database] Failed to get available plans:", error_16);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getAvailablePlans = getAvailablePlans;

function getPricingPlan(planId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_17;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.pricingPlans).where(drizzle_orm_1.eq(schema_1.pricingPlans.id, planId)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_17 = _a.sent();
          console.error("[Database] Failed to get pricing plan:", error_17);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getPricingPlan = getPricingPlan; // ============= SUBSCRIPTIONS CRUD =============

function createSubscription(data) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.insert(schema_1.subscriptions).values(data)];

        case 2:
          _a.sent();

          return [4
          /*yield*/
          , db.select().from(schema_1.subscriptions).where(drizzle_orm_1.eq(schema_1.subscriptions.id, data.id)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
      }
    });
  });
}

exports.createSubscription = createSubscription;

function getSubscriptionById(id) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_18;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.subscriptions).where(drizzle_orm_1.eq(schema_1.subscriptions.id, id)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_18 = _a.sent();
          console.error("[Database] Failed to get subscription by id:", error_18);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.subscriptions).set(__assign(__assign({}, data), {
            updatedAt: new Date().toISOString()
          })).where(drizzle_orm_1.eq(schema_1.subscriptions.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.updateSubscription = updateSubscription;

function getAllSubscriptions() {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_19;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.subscriptions).orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_19 = _a.sent();
          console.error("[Database] Failed to get all subscriptions:", error_19);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getAllSubscriptions = getAllSubscriptions; // ============= BILLING INVOICES (client invoices with optional status) =============

/**
 * Get invoices for a client, optionally filtered by status.
 * Uses the main `invoices` table (CRM invoices sent to clients).
 */

function getClientInvoices(clientId, status) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_20;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 6,, 7]);

          if (!status) return [3
          /*break*/
          , 4];
          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId), drizzle_orm_1.eq(schema_1.invoices.status, status))).orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId)).orderBy(drizzle_orm_1.desc(schema_1.invoices.createdAt))];

        case 5:
          return [2
          /*return*/
          , _a.sent()];

        case 6:
          error_20 = _a.sent();
          console.error("[Database] Failed to get client invoices:", error_20);
          return [2
          /*return*/
          , []];

        case 7:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getClientInvoices = getClientInvoices; // ============= PAYMENT METHODS =============

function getPaymentMethods(clientId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_21;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.paymentMethods).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentMethods.clientId, clientId), drizzle_orm_1.eq(schema_1.paymentMethods.isActive, 1))).orderBy(drizzle_orm_1.desc(schema_1.paymentMethods.isDefault))];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_21 = _a.sent();
          console.error("[Database] Failed to get payment methods:", error_21);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.insert(schema_1.paymentMethods).values(data)];

        case 2:
          _a.sent();

          return [4
          /*yield*/
          , db.select().from(schema_1.paymentMethods).where(drizzle_orm_1.eq(schema_1.paymentMethods.id, data.id)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];
      }
    });
  });
}

exports.createPaymentMethod = createPaymentMethod; // ============= RECEIPT FROM INVOICE =============

/**
 * Create a receipt record from an existing invoice.
 * Looks up the invoice and inserts a row into the receipts table if it exists,
 * otherwise logs a warning and returns gracefully.
 */

function createReceiptFromInvoice(invoiceId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, invoiceResult, error_22;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId)).limit(1)];

        case 3:
          invoiceResult = _a.sent();
          if (invoiceResult.length === 0) return [2
          /*return*/
          , null]; // Receipt creation is handled downstream; here we just confirm the invoice exists

          return [2
          /*return*/
          , invoiceResult[0]];

        case 4:
          error_22 = _a.sent();
          console.warn("[Database] createReceiptFromInvoice failed gracefully:", error_22);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.createReceiptFromInvoice = createReceiptFromInvoice; // ============= BILLING NOTIFICATIONS =============

function createBillingNotification(data) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_23;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.insert(schema_1.billingNotifications).values(data)];

        case 3:
          _a.sent();

          return [2
          /*return*/
          , data.id];

        case 4:
          error_23 = _a.sent();
          console.error("[Database] Failed to create billing notification:", error_23);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.createBillingNotification = createBillingNotification; // ============= ORGANIZATIONS =============

function createOrganization(data) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.insert(schema_1.organizations).values(data)];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , getOrganization(data.id)];
      }
    });
  });
}

exports.createOrganization = createOrganization;

function getOrganization(id) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_24;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.id, id)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_24 = _a.sent();
          console.error("[Database] Failed to get organization:", error_24);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getOrganization = getOrganization;

function getOrganizationBySlug(slug) {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_25;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , null];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.slug, slug)).limit(1)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result.length > 0 ? result[0] : null];

        case 4:
          error_25 = _a.sent();
          console.error("[Database] Failed to get organization by slug:", error_25);
          return [2
          /*return*/
          , null];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getOrganizationBySlug = getOrganizationBySlug;

function getAllOrganizations() {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_26;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.organizations).orderBy(schema_1.organizations.name)];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_26 = _a.sent();
          console.error("[Database] Failed to list organizations:", error_26);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getAllOrganizations = getAllOrganizations;

function updateOrganization(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var db, _id, _c, updateData;

    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          _id = data.id, _c = data.createdAt, updateData = __rest(data, ["id", "createdAt"]);
          return [4
          /*yield*/
          , db.update(schema_1.organizations).set(__assign(__assign({}, updateData), {
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })).where(drizzle_orm_1.eq(schema_1.organizations.id, id))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          , getOrganization(id)];
      }
    });
  });
}

exports.updateOrganization = updateOrganization;

function deleteOrganization(id) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db["delete"](schema_1.organizationFeatures).where(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, id))];

        case 2:
          _a.sent();

          return [4
          /*yield*/
          , db.update(schema_1.users).set({
            organizationId: null
          }).where(drizzle_orm_1.eq(schema_1.users.organizationId, id))];

        case 3:
          _a.sent();

          return [4
          /*yield*/
          , db["delete"](schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.id, id))];

        case 4:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.deleteOrganization = deleteOrganization;

function getOrganizationFeatures(organizationId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_27;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.organizationFeatures).where(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId))];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_27 = _a.sent();
          console.error("[Database] Failed to get org features:", error_27);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getOrganizationFeatures = getOrganizationFeatures;

function setOrganizationFeature(organizationId, featureKey, isEnabled, config) {
  var _a;

  return __awaiter(this, void 0, void 0, function () {
    var db, existing, now, rows;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _b.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.select().from(schema_1.organizationFeatures).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId), drizzle_orm_1.eq(schema_1.organizationFeatures.featureKey, featureKey))).limit(1)];

        case 2:
          existing = _b.sent();
          now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          if (!(existing.length > 0)) return [3
          /*break*/
          , 4];
          var updateSet = {
            isEnabled: isEnabled ? 1 : 0,
            updatedAt: now
          };
          if (config !== null && config !== void 0) updateSet.config = config;
          return [4
          /*yield*/
          , db.update(schema_1.organizationFeatures).set(updateSet).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId), drizzle_orm_1.eq(schema_1.organizationFeatures.featureKey, featureKey)))];

        case 3:
          _b.sent();

          return [3
          /*break*/
          , 6];

        case 4:
          var insertValues = {
            id: "orgfeat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
            organizationId: organizationId,
            featureKey: featureKey,
            isEnabled: isEnabled ? 1 : 0
          };
          if (config !== null && config !== void 0) insertValues.config = config;
          return [4
          /*yield*/
          , db.insert(schema_1.organizationFeatures).values(insertValues)];

        case 5:
          _b.sent();

          _b.label = 6;

        case 6:
          return [4
          /*yield*/
          , db.select().from(schema_1.organizationFeatures).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.organizationFeatures.organizationId, organizationId), drizzle_orm_1.eq(schema_1.organizationFeatures.featureKey, featureKey))).limit(1)];

        case 7:
          rows = _b.sent();
          return [2
          /*return*/
          , (_a = rows[0]) !== null && _a !== void 0 ? _a : null];
      }
    });
  });
}

exports.setOrganizationFeature = setOrganizationFeature;

function getUsersByOrganization(organizationId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_28;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.organizationId, organizationId)).orderBy(schema_1.users.name)];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_28 = _a.sent();
          console.error("[Database] Failed to get org users:", error_28);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getUsersByOrganization = getUsersByOrganization;

function assignUserToOrganization(userId, organizationId) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.update(schema_1.users).set({
            organizationId: organizationId
          }).where(drizzle_orm_1.eq(schema_1.users.id, userId))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.assignUserToOrganization = assignUserToOrganization; // ── Pricing Tier Features ────────────────────────────────────────────────────

function getPricingTierFeatures(tier) {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_29;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.pricingTierFeatures).where(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier))];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_29 = _a.sent();
          console.error("[Database] Failed to get pricing tier features:", error_29);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getPricingTierFeatures = getPricingTierFeatures;

function getAllPricingTierFeatures() {
  return __awaiter(this, void 0, void 0, function () {
    var db, error_30;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select().from(schema_1.pricingTierFeatures).orderBy(schema_1.pricingTierFeatures.tier)];

        case 3:
          return [2
          /*return*/
          , _a.sent()];

        case 4:
          error_30 = _a.sent();
          console.error("[Database] Failed to get all pricing tier features:", error_30);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
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
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.select().from(schema_1.pricingTierFeatures).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier), drizzle_orm_1.eq(schema_1.pricingTierFeatures.featureKey, featureKey))).limit(1)];

        case 2:
          existing = _a.sent();
          if (!(existing.length > 0)) return [3
          /*break*/
          , 4];
          return [4
          /*yield*/
          , db.update(schema_1.pricingTierFeatures).set({
            isEnabled: isEnabled ? 1 : 0
          }).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.pricingTierFeatures.tier, tier), drizzle_orm_1.eq(schema_1.pricingTierFeatures.featureKey, featureKey)))];

        case 3:
          _a.sent();

          return [3
          /*break*/
          , 6];

        case 4:
          return [4
          /*yield*/
          , db.insert(schema_1.pricingTierFeatures).values({
            id: "ptf_" + tier + "_" + featureKey,
            tier: tier,
            featureKey: featureKey,
            isEnabled: isEnabled ? 1 : 0
          })];

        case 5:
          _a.sent();

          _a.label = 6;

        case 6:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.setPricingTierFeature = setPricingTierFeature;

function bulkSetPricingTierFeatures(tier, features) {
  return __awaiter(this, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , Promise.all(Object.entries(features).map(function (_a) {
            var key = _a[0],
                enabled = _a[1];
            return setPricingTierFeature(tier, key, enabled);
          }))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.bulkSetPricingTierFeatures = bulkSetPricingTierFeatures; // ── Tenant Messages ──────────────────────────────────────────────────────────

function createTenantMessage(data) {
  var _a;

  return __awaiter(this, void 0, void 0, function () {
    var db, rows;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _b.sent();
          if (!db) throw new Error("Database not available");
          return [4
          /*yield*/
          , db.insert(schema_1.tenantMessages).values(data)];

        case 2:
          _b.sent();

          return [4
          /*yield*/
          , db.select().from(schema_1.tenantMessages).where(drizzle_orm_1.eq(schema_1.tenantMessages.id, data.id)).limit(1)];

        case 3:
          rows = _b.sent();
          return [2
          /*return*/
          , (_a = rows[0]) !== null && _a !== void 0 ? _a : null];
      }
    });
  });
}

exports.createTenantMessage = createTenantMessage;

function getTenantMessages(filters) {
  var _a, _b, _d, _e;

  return __awaiter(this, void 0, void 0, function () {
    var db, conditions, query, error_31;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _f.sent();
          if (!db) return [2
          /*return*/
          , []];
          _f.label = 2;

        case 2:
          _f.trys.push([2, 4,, 5]);

          conditions = [];
          if (filters.targetType) conditions.push(drizzle_orm_1.eq(schema_1.tenantMessages.targetType, filters.targetType));
          if (filters.targetOrgId) conditions.push(drizzle_orm_1.eq(schema_1.tenantMessages.targetOrgId, filters.targetOrgId));
          if (filters.targetUserId) conditions.push(drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.tenantMessages.targetUserId, filters.targetUserId), drizzle_orm_1.eq(schema_1.tenantMessages.targetType, 'all_admins')));
          query = conditions.length > 0 ? db.select().from(schema_1.tenantMessages).where(drizzle_orm_1.and.apply(void 0, conditions)).orderBy(drizzle_orm_1.desc(schema_1.tenantMessages.createdAt)).limit((_a = filters.limit) !== null && _a !== void 0 ? _a : 50).offset((_b = filters.offset) !== null && _b !== void 0 ? _b : 0) : db.select().from(schema_1.tenantMessages).orderBy(drizzle_orm_1.desc(schema_1.tenantMessages.createdAt)).limit((_d = filters.limit) !== null && _d !== void 0 ? _d : 50).offset((_e = filters.offset) !== null && _e !== void 0 ? _e : 0);
          return [4
          /*yield*/
          , query];

        case 3:
          return [2
          /*return*/
          , _f.sent()];

        case 4:
          error_31 = _f.sent();
          console.error("[Database] Failed to get tenant messages:", error_31);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getTenantMessages = getTenantMessages;

function markTenantMessageRead(messageId) {
  return __awaiter(this, void 0, void 0, function () {
    var db, now;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) throw new Error("Database not available");
          now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          return [4
          /*yield*/
          , db.update(schema_1.tenantMessages).set({
            isRead: 1,
            readAt: now
          }).where(drizzle_orm_1.eq(schema_1.tenantMessages.id, messageId))];

        case 2:
          _a.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.markTenantMessageRead = markTenantMessageRead; // ── Tenant super admins helper ───────────────────────────────────────────────

function getAllTenantSuperAdmins() {
  return __awaiter(this, void 0, void 0, function () {
    var db, result, error_32;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , getDb()];

        case 1:
          db = _a.sent();
          if (!db) return [2
          /*return*/
          , []];
          _a.label = 2;

        case 2:
          _a.trys.push([2, 4,, 5]);

          return [4
          /*yield*/
          , db.select({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            role: schema_1.users.role,
            organizationId: schema_1.users.organizationId,
            isActive: schema_1.users.isActive,
            lastSignedIn: schema_1.users.lastSignedIn,
            createdAt: schema_1.users.createdAt
          }).from(schema_1.users).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.role, 'super_admin'), drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IS NOT NULL"], ["", " IS NOT NULL"])), schema_1.users.organizationId))).orderBy(schema_1.users.name)];

        case 3:
          result = _a.sent();
          return [2
          /*return*/
          , result];

        case 4:
          error_32 = _a.sent();
          console.error("[Database] Failed to get tenant super admins:", error_32);
          return [2
          /*return*/
          , []];

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.getAllTenantSuperAdmins = getAllTenantSuperAdmins;
var templateObject_1;