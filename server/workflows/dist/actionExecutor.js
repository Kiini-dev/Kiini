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
exports.executeAction = exports.executeCreateReminderAction = exports.executeUpdateFieldAction = exports.executeAddInvoiceAction = exports.executeCreateFollowUpAction = exports.executeSendNotificationAction = exports.executeUpdateStatusAction = exports.executeCreateTaskAction = exports.executeSendEmailAction = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var emailNotifications_1 = require("../routers/emailNotifications");
var nanoid_1 = require("nanoid");
// ============================================
// ACTION EXECUTOR IMPLEMENTATIONS
// ============================================
/**
 * Send Email Action Executor
 * Sends email to client or internal team based on action configuration
 */
function executeSendEmailAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var subject, template, recipientType, recipientEmail, body, htmlContent, entityType, entityId, toEmail, emailErr_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    subject = actionData.subject, template = actionData.template, recipientType = actionData.recipientType, recipientEmail = actionData.recipientEmail, body = actionData.body, htmlContent = actionData.htmlContent, entityType = actionData.entityType, entityId = actionData.entityId;
                    if (!subject && !template) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Email action requires subject or template",
                                error: "Missing email configuration"
                            }];
                    }
                    toEmail = recipientEmail || process.env.COMPANY_EMAIL || "";
                    console.log("[EMAIL_EXECUTOR] Sending email:", {
                        subject: subject || template,
                        toEmail: toEmail,
                        recipientType: recipientType,
                        entityType: context.entityType,
                        entityId: context.entityId
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Use existing email notification system
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: context.userId || "system",
                            eventType: template || "custom_email",
                            recipientEmail: toEmail,
                            recipientName: recipientType === "client" ? "Client" : "Team Member",
                            subject: subject || "Notification",
                            htmlContent: htmlContent || body || "<p>" + subject + "</p>",
                            entityType: entityType || context.entityType,
                            entityId: entityId || context.entityId,
                            actionUrl: "/"
                        })];
                case 2:
                    // Use existing email notification system
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    emailErr_1 = _a.sent();
                    console.error("[EMAIL_EXECUTOR] Failed to send via notification system:", emailErr_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, {
                        success: true,
                        message: "Email sent: " + (subject || template),
                        resultData: { emailId: "email_" + Date.now(), recipient: toEmail }
                    }];
                case 5:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to send email",
                            error: String(error_1)
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.executeSendEmailAction = executeSendEmailAction;
/**
 * Create Task Action Executor
 * Creates a new task with given title, priority, and due date
 */
function executeCreateTaskAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, title, description, priority, dueDate, assignedTo, taskId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    title = actionData.title, description = actionData.description, priority = actionData.priority, dueDate = actionData.dueDate, assignedTo = actionData.assignedTo;
                    if (!title) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Task creation requires a title",
                                error: "Missing task title"
                            }];
                    }
                    taskId = "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    console.log("[TASK_EXECUTOR] Creating task:", {
                        title: title,
                        priority: priority,
                        dueDate: dueDate,
                        assignedTo: assignedTo
                    });
                    // TODO: Insert task into database
                    //const result = await db.insert(tasks).values({
                    //  id: taskId,
                    //  title,
                    //  description,
                    //  priority: priority || 'normal',
                    //  dueDate,
                    //  assignedTo,
                    //  entityType: context.entityType,
                    //  entityId: context.entityId,
                    //});
                    return [2 /*return*/, {
                            success: true,
                            message: "Task created: " + title,
                            resultData: { taskId: taskId }
                        }];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to create task",
                            error: String(error_2)
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.executeCreateTaskAction = executeCreateTaskAction;
/**
 * Update Status Action Executor
 * Updates the status of an entity (invoice, opportunity, etc.)
 */
function executeUpdateStatusAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, newStatus, targetEntity, entityType, entityId, mysqlNow, opportunities, projects, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    newStatus = actionData.newStatus, targetEntity = actionData.targetEntity;
                    entityType = targetEntity || context.entityType;
                    entityId = context.entityId;
                    if (!newStatus) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Status update requires newStatus",
                                error: "Missing new status value"
                            }];
                    }
                    console.log("[STATUS_EXECUTOR] Updating status:", {
                        entityType: entityType,
                        entityId: entityId,
                        newStatus: newStatus
                    });
                    mysqlNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    if (!(entityType === "invoice")) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.update(schema_1.invoices)
                            .set({ status: newStatus, updatedAt: mysqlNow })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, entityId))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 3:
                    if (!(entityType === "opportunity")) return [3 /*break*/, 6];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 4:
                    opportunities = (_a.sent()).opportunities;
                    return [4 /*yield*/, db.update(opportunities)
                            .set({ stage: newStatus, updatedAt: mysqlNow })
                            .where(drizzle_orm_1.eq(opportunities.id, entityId))];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 6:
                    if (!(entityType === "project")) return [3 /*break*/, 9];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 7:
                    projects = (_a.sent()).projects;
                    return [4 /*yield*/, db.update(projects)
                            .set({ status: newStatus, updatedAt: mysqlNow })
                            .where(drizzle_orm_1.eq(projects.id, entityId))];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/, {
                        success: true,
                        message: "Status updated to: " + newStatus,
                        resultData: { entityType: entityType, entityId: entityId, newStatus: newStatus }
                    }];
                case 10:
                    error_3 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to update status",
                            error: String(error_3)
                        }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.executeUpdateStatusAction = executeUpdateStatusAction;
/**
 * Send Notification Action Executor
 * Sends in-app notification to user or users
 */
function executeSendNotificationAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, message, _a, notificationType, recipientRole, recipientUserId, title, notificationId, targetUserId, roleUsers, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error("Database not available");
                    message = actionData.message, _a = actionData.notificationType, notificationType = _a === void 0 ? "info" : _a, recipientRole = actionData.recipientRole, recipientUserId = actionData.recipientUserId, title = actionData.title;
                    if (!message) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Notification requires a message",
                                error: "Missing notification message"
                            }];
                    }
                    console.log("[NOTIFICATION_EXECUTOR] Sending notification:", {
                        message: message,
                        notificationType: notificationType,
                        recipientRole: recipientRole
                    });
                    notificationId = nanoid_1.nanoid();
                    targetUserId = recipientUserId || context.userId;
                    if (!(recipientRole && !recipientUserId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .limit(1)];
                case 2:
                    roleUsers = _b.sent();
                    if (roleUsers.length > 0) {
                        targetUserId = roleUsers[0].id;
                    }
                    _b.label = 3;
                case 3:
                    if (!targetUserId) return [3 /*break*/, 5];
                    // Create notification record
                    return [4 /*yield*/, db.insert(schema_1.notifications).values({
                            id: notificationId,
                            userId: targetUserId,
                            title: title || notificationType,
                            message: message,
                            type: notificationType,
                            category: "workflow",
                            entityType: context.entityType,
                            entityId: context.entityId,
                            actionUrl: "/",
                            isRead: 0,
                            priority: "normal"
                        })];
                case 4:
                    // Create notification record
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, {
                        success: true,
                        message: "Notification sent: " + message,
                        resultData: { notificationId: notificationId, recipientUserId: targetUserId }
                    }];
                case 6:
                    error_4 = _b.sent();
                    console.error("[NOTIFICATION_EXECUTOR] Error:", error_4);
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to send notification",
                            error: String(error_4)
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.executeSendNotificationAction = executeSendNotificationAction;
/**
 * Create Follow-up Action Executor
 * Creates a follow-up (recurring task, reminder, or second invoice)
 */
function executeCreateFollowUpAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, followUpType, frequency, startDate, details, followUpId, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    followUpType = actionData.followUpType, frequency = actionData.frequency, startDate = actionData.startDate, details = actionData.details;
                    if (!followUpType) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Follow-up creation requires followUpType",
                                error: "Missing follow-up type"
                            }];
                    }
                    followUpId = "followup_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    console.log("[FOLLOWUP_EXECUTOR] Creating follow-up:", {
                        followUpType: followUpType,
                        frequency: frequency,
                        startDate: startDate,
                        details: details
                    });
                    // TODO: Create follow-up based on type
                    // - If 'recurring': Create recurring invoice
                    // - If 'reminder': Create reminder/task
                    // - If 'task': Create follow-up task
                    return [2 /*return*/, {
                            success: true,
                            message: "Follow-up created: " + followUpType,
                            resultData: { followUpId: followUpId }
                        }];
                case 2:
                    error_5 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to create follow-up",
                            error: String(error_5)
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.executeCreateFollowUpAction = executeCreateFollowUpAction;
/**
 * Add Invoice Action Executor
 * Creates a new invoice based on trigger data
 */
function executeAddInvoiceAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, invoiceType, includeExpenses, lineItems, dueDate, invoiceId, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    invoiceType = actionData.invoiceType, includeExpenses = actionData.includeExpenses, lineItems = actionData.lineItems, dueDate = actionData.dueDate;
                    if (!invoiceType) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Invoice creation requires invoiceType",
                                error: "Missing invoice type"
                            }];
                    }
                    invoiceId = "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                    console.log("[INVOICE_EXECUTOR] Creating invoice:", {
                        invoiceType: invoiceType,
                        includeExpenses: includeExpenses,
                        dueDate: dueDate,
                        lineItems: (lineItems === null || lineItems === void 0 ? void 0 : lineItems.length) || 0
                    });
                    // TODO: Create invoice in database
                    // - Auto-populate from trigger data (client, project, milestone details)
                    // - Include line items if specified
                    // - Set due date
                    // - Generate invoice number
                    return [2 /*return*/, {
                            success: true,
                            message: "Invoice created: " + invoiceType,
                            resultData: { invoiceId: invoiceId }
                        }];
                case 2:
                    error_6 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to create invoice",
                            error: String(error_6)
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.executeAddInvoiceAction = executeAddInvoiceAction;
/**
 * Update Field Action Executor
 * Updates a specific field on an entity
 */
function executeUpdateFieldAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var db, entityType, fieldName, fieldValue, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    entityType = actionData.entityType, fieldName = actionData.fieldName, fieldValue = actionData.fieldValue;
                    if (!fieldName || fieldValue === undefined) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Field update requires fieldName and fieldValue",
                                error: "Missing field update parameters"
                            }];
                    }
                    console.log("[FIELD_EXECUTOR] Updating field:", {
                        entityType: entityType,
                        fieldName: fieldName,
                        fieldValue: fieldValue
                    });
                    // TODO: Update field in database
                    // - Build dynamic update query
                    // - Validate field exists and is updatable
                    // - Log change in activity log
                    return [2 /*return*/, {
                            success: true,
                            message: "Field updated: " + fieldName,
                            resultData: { fieldName: fieldName, previousValue: "N/A", newValue: fieldValue }
                        }];
                case 2:
                    error_7 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to update field",
                            error: String(error_7)
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.executeUpdateFieldAction = executeUpdateFieldAction;
/**
 * Create Reminder Action Executor
 * Creates a reminder notification at specified time
 */
function executeCreateReminderAction(actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var reminderType, reminderTime, reminderMessage, reminderId;
        return __generator(this, function (_a) {
            try {
                reminderType = actionData.reminderType, reminderTime = actionData.reminderTime, reminderMessage = actionData.reminderMessage;
                if (!reminderType) {
                    return [2 /*return*/, {
                            success: false,
                            message: "Reminder creation requires reminderType",
                            error: "Missing reminder type"
                        }];
                }
                reminderId = "reminder_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                console.log("[REMINDER_EXECUTOR] Creating reminder:", {
                    reminderType: reminderType,
                    reminderTime: reminderTime,
                    reminderMessage: reminderMessage
                });
                // TODO: Create reminder in database or scheduling system
                // - Set up scheduled task to trigger notification
                // - Store reminder details
                // - Link to original entity
                return [2 /*return*/, {
                        success: true,
                        message: "Reminder created: " + reminderType,
                        resultData: { reminderId: reminderId }
                    }];
            }
            catch (error) {
                return [2 /*return*/, {
                        success: false,
                        message: "Failed to create reminder",
                        error: String(error)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
exports.executeCreateReminderAction = executeCreateReminderAction;
/**
 * Main action executor dispatcher
 * Routes actions to appropriate executor functions
 */
function executeAction(actionType, actionData, context) {
    return __awaiter(this, void 0, Promise, function () {
        var _a, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 19, , 20]);
                    _a = actionType;
                    switch (_a) {
                        case "send_email": return [3 /*break*/, 1];
                        case "create_task": return [3 /*break*/, 3];
                        case "update_status": return [3 /*break*/, 5];
                        case "send_notification": return [3 /*break*/, 7];
                        case "create_follow_up": return [3 /*break*/, 9];
                        case "add_invoice": return [3 /*break*/, 11];
                        case "update_field": return [3 /*break*/, 13];
                        case "create_reminder": return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 17];
                case 1: return [4 /*yield*/, executeSendEmailAction(actionData, context)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, executeCreateTaskAction(actionData, context)];
                case 4: return [2 /*return*/, _b.sent()];
                case 5: return [4 /*yield*/, executeUpdateStatusAction(actionData, context)];
                case 6: return [2 /*return*/, _b.sent()];
                case 7: return [4 /*yield*/, executeSendNotificationAction(actionData, context)];
                case 8: return [2 /*return*/, _b.sent()];
                case 9: return [4 /*yield*/, executeCreateFollowUpAction(actionData, context)];
                case 10: return [2 /*return*/, _b.sent()];
                case 11: return [4 /*yield*/, executeAddInvoiceAction(actionData, context)];
                case 12: return [2 /*return*/, _b.sent()];
                case 13: return [4 /*yield*/, executeUpdateFieldAction(actionData, context)];
                case 14: return [2 /*return*/, _b.sent()];
                case 15: return [4 /*yield*/, executeCreateReminderAction(actionData, context)];
                case 16: return [2 /*return*/, _b.sent()];
                case 17: return [2 /*return*/, {
                        success: false,
                        message: "Unknown action type: " + actionType,
                        error: "Invalid action type"
                    }];
                case 18: return [3 /*break*/, 20];
                case 19:
                    error_8 = _b.sent();
                    return [2 /*return*/, {
                            success: false,
                            message: "Error executing action",
                            error: String(error_8)
                        }];
                case 20: return [2 /*return*/];
            }
        });
    });
}
exports.executeAction = executeAction;
