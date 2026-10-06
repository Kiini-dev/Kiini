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
exports.NotificationTriggerService = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
var drizzle_orm_1 = require("drizzle-orm");
var notificationBroadcaster_1 = require("../websocket/notificationBroadcaster");
/**
 * Server-side notification trigger service
 * Used by other routers to create notifications without exposing client code
 */
var NotificationTriggerService = /** @class */ (function () {
    function NotificationTriggerService() {
    }
    /**
     * Create and send a notification to a user
     */
    NotificationTriggerService.notify = function (payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var db, id, now, notificationData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            console.error("Database not available for notification");
                            return [2 /*return*/, null];
                        }
                        id = uuid_1.v4();
                        now = new Date();
                        notificationData = {
                            id: id,
                            userId: payload.userId,
                            title: payload.title,
                            message: payload.message,
                            type: (payload.type || "info"),
                            priority: (payload.priority || "normal"),
                            category: payload.category,
                            entityType: payload.entityType,
                            entityId: payload.entityId,
                            actionUrl: payload.actionUrl,
                            expiresAt: (_a = payload.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString().replace('T', ' ').substring(0, 19),
                            metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
                            isRead: 0,
                            createdAt: now.toISOString().replace('T', ' ').substring(0, 19),
                            readAt: null
                        };
                        return [4 /*yield*/, db.insert(schema_1.notifications).values(notificationData)];
                    case 2:
                        _b.sent();
                        // Broadcast notification to subscribed clients
                        notificationBroadcaster_1.broadcastNotification(payload.userId, notificationData);
                        notificationBroadcaster_1.broadcastUnreadCountChanged(payload.userId, 1);
                        return [2 /*return*/, id];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error creating notification:", error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create invoice-related notification
     */
    NotificationTriggerService.notifyInvoiceEvent = function (userId, action, invoiceId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap;
            return __generator(this, function (_a) {
                titleMap = {
                    created: "Invoice Created",
                    updated: "Invoice Updated",
                    sent: "Invoice Sent",
                    paid: "Invoice Paid",
                    overdue: "Invoice Overdue"
                };
                messageMap = {
                    created: (metadata === null || metadata === void 0 ? void 0 : metadata.clientName) ? "Invoice created for " + metadata.clientName
                        : "New invoice has been created",
                    updated: "Invoice has been updated",
                    sent: (metadata === null || metadata === void 0 ? void 0 : metadata.clientName) ? "Invoice sent to " + metadata.clientName
                        : "Invoice has been sent",
                    paid: (metadata === null || metadata === void 0 ? void 0 : metadata.amount) ? "Payment of " + metadata.amount + " received"
                        : "Invoice has been paid",
                    overdue: "Invoice payment is overdue"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: action === "overdue" ? "error" : "success",
                        priority: action === "overdue" ? "high" : "normal",
                        category: "invoice",
                        entityType: "invoice",
                        entityId: invoiceId,
                        actionUrl: "/invoices/" + invoiceId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Create payment-related notification
     */
    NotificationTriggerService.notifyPaymentEvent = function (userId, action, paymentId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap, typeMap;
            return __generator(this, function (_a) {
                titleMap = {
                    created: "Payment Recorded",
                    pending_approval: "Payment Awaiting Approval",
                    approved: "Payment Approved",
                    rejected: "Payment Rejected",
                    failed: "Payment Failed"
                };
                messageMap = {
                    created: (metadata === null || metadata === void 0 ? void 0 : metadata.amount) ? "Payment of " + metadata.amount + " has been recorded"
                        : "Payment has been recorded successfully",
                    pending_approval: "Your payment is pending manager approval",
                    approved: "Payment has been approved",
                    rejected: (metadata === null || metadata === void 0 ? void 0 : metadata.reason) ? "Rejected: " + metadata.reason
                        : "Payment has been rejected",
                    failed: "Payment processing failed"
                };
                typeMap = {
                    created: "success",
                    pending_approval: "info",
                    approved: "success",
                    rejected: "error",
                    failed: "error"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: typeMap[action],
                        priority: ["rejected", "failed"].includes(action) ? "high" : "normal",
                        category: "payment",
                        entityType: "payment",
                        entityId: paymentId,
                        actionUrl: "/payments/" + paymentId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Create approval-related notification
     */
    NotificationTriggerService.notifyApprovalEvent = function (userId, action, entityType, entityId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap, typeMap;
            return __generator(this, function (_a) {
                titleMap = {
                    pending: "Approval Required",
                    approved: "Request Approved",
                    rejected: "Request Rejected"
                };
                messageMap = {
                    pending: (metadata === null || metadata === void 0 ? void 0 : metadata.approvalType) ? "A " + metadata.approvalType + " requires your approval"
                        : "A " + entityType + " requires your approval",
                    approved: "Your " + entityType + " has been approved",
                    rejected: (metadata === null || metadata === void 0 ? void 0 : metadata.reason) ? "Rejected: " + metadata.reason
                        : "Your " + entityType + " has been rejected"
                };
                typeMap = {
                    pending: "reminder",
                    approved: "success",
                    rejected: "error"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: typeMap[action],
                        priority: "high",
                        category: "approval",
                        entityType: entityType,
                        entityId: entityId,
                        actionUrl: "/approvals/" + entityId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Create order-related notification
     */
    NotificationTriggerService.notifyOrderEvent = function (userId, action, orderId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap, typeMap;
            return __generator(this, function (_a) {
                titleMap = {
                    created: "Order Created",
                    confirmed: "Order Confirmed",
                    shipped: "Order Shipped",
                    delivered: "Order Delivered",
                    cancelled: "Order Cancelled"
                };
                messageMap = {
                    created: (metadata === null || metadata === void 0 ? void 0 : metadata.orderNumber) ? "Order #" + metadata.orderNumber + " has been created"
                        : "New order has been created",
                    confirmed: (metadata === null || metadata === void 0 ? void 0 : metadata.orderNumber) ? "Order #" + metadata.orderNumber + " confirmed"
                        : "Order has been confirmed",
                    shipped: (metadata === null || metadata === void 0 ? void 0 : metadata.trackingNumber) ? "Order shipped - Tracking: " + metadata.trackingNumber
                        : "Order is on the way",
                    delivered: "Order has been delivered",
                    cancelled: "Order has been cancelled"
                };
                typeMap = {
                    created: "success",
                    confirmed: "success",
                    shipped: "info",
                    delivered: "success",
                    cancelled: "warning"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: typeMap[action],
                        priority: action === "cancelled" ? "high" : "normal",
                        category: "order",
                        entityType: "order",
                        entityId: orderId,
                        actionUrl: "/orders/" + orderId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Create employee/team notification
     */
    NotificationTriggerService.notifyTeamEvent = function (userId, action, employeeId, employeeName, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap;
            return __generator(this, function (_a) {
                titleMap = {
                    added: "Team Member Added",
                    updated: "Team Member Updated",
                    removed: "Team Member Removed",
                    joined: "Team Member Joined",
                    left: "Team Member Left"
                };
                messageMap = {
                    added: employeeName + " has been added to the team",
                    updated: employeeName + "'s information has been updated",
                    removed: employeeName + " has been removed from the team",
                    joined: employeeName + " has joined the team",
                    left: employeeName + " has left the team"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: "info",
                        category: "team",
                        entityType: "employee",
                        entityId: employeeId,
                        actionUrl: "/employees/" + employeeId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Create inventory/stock notification
     */
    NotificationTriggerService.notifyInventoryEvent = function (userId, action, productId, productName, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var titleMap, messageMap, typeMap, priorityMap;
            return __generator(this, function (_a) {
                titleMap = {
                    low_stock: "Low Stock Alert",
                    out_of_stock: "Out of Stock",
                    restocked: "Product Restocked",
                    expiring: "Product Expiring Soon"
                };
                messageMap = {
                    low_stock: (metadata === null || metadata === void 0 ? void 0 : metadata.currentStock) ? productName + " (" + metadata.currentStock + " units) is running low"
                        : productName + " is running low",
                    out_of_stock: productName + " is out of stock",
                    restocked: productName + " has been restocked",
                    expiring: productName + " is expiring soon"
                };
                typeMap = {
                    low_stock: "warning",
                    out_of_stock: "error",
                    restocked: "success",
                    expiring: "warning"
                };
                priorityMap = {
                    low_stock: "normal",
                    out_of_stock: "high",
                    restocked: "normal",
                    expiring: "high"
                };
                return [2 /*return*/, this.notify({
                        userId: userId,
                        title: titleMap[action],
                        message: messageMap[action],
                        type: typeMap[action],
                        priority: priorityMap[action],
                        category: "inventory",
                        entityType: "product",
                        entityId: productId,
                        actionUrl: "/products/" + productId,
                        metadata: metadata
                    })];
            });
        });
    };
    /**
     * Notify multiple users
     */
    NotificationTriggerService.notifyMultiple = function (userIds, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(userIds.map(function (userId) {
                            return _this.notify(__assign(__assign({}, payload), { userId: userId }));
                        }))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.filter(function (id) { return id !== null; })];
                }
            });
        });
    };
    /**
     * Send system-wide notification to all users with a specific role
     */
    NotificationTriggerService.notifyByRole = function (role, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var db, usersWithRole, userIds, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.users)
                                .where(drizzle_orm_1.eq(schema_1.users.role, role))];
                    case 2:
                        usersWithRole = _a.sent();
                        userIds = usersWithRole.map(function (u) { return u.id; });
                        return [2 /*return*/, this.notifyMultiple(userIds, payload)];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error notifying by role:", error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return NotificationTriggerService;
}());
exports.NotificationTriggerService = NotificationTriggerService;
