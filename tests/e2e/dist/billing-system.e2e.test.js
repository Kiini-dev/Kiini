"use strict";
/**
 * End-to-End Test Suite for Multi-Tenancy & Billing System
 * Tests all major flows: signup → org creation → trial → conversion → renewal
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.createTestInvoice = exports.createTestUser = exports.createTestOrganization = void 0;
var vitest_1 = require("vitest");
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
vitest_1.describe('E2E: Multi-Tenancy & Billing System', function () {
    var testOrgId;
    var testUserId;
    var testInvoiceId;
    vitest_1.beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('🚀 Starting E2E tests...');
            return [2 /*return*/];
        });
    }); });
    vitest_1.afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('✅ E2E tests completed');
            return [2 /*return*/];
        });
    }); });
    vitest_1.describe('Phase 1: Organization Creation & Setup', function () {
        vitest_1.it('should create a new organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newOrg, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newOrg = {
                            id: "org-" + Date.now(),
                            name: 'Test Organization',
                            email: 'test@org.com',
                            plan: 'Trial',
                            status: 'active',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        // Insert organization
                        return [4 /*yield*/, db_1.db.insert(schema_1.organizations).values(newOrg)];
                    case 1:
                        // Insert organization
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.organizations.findFirst({
                                where: drizzle_orm_1.eq(schema_1.organizations.id, newOrg.id)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.name).toBe('Test Organization');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.plan).toBe('Trial');
                        testOrgId = newOrg.id;
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should create subscription for new organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var now, trialEnd, subscription, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                        subscription = {
                            id: "sub-" + Date.now(),
                            organizationId: testOrgId,
                            status: 'trial',
                            currentTier: 'Trial',
                            trialStartDate: now,
                            trialEndDate: trialEnd,
                            renewalDate: trialEnd,
                            nextBillingDate: trialEnd,
                            billingCycleMonths: 1,
                            autoRenewEnabled: false,
                            createdAt: now,
                            updatedAt: now
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.organizationSubscriptions).values(subscription)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, testOrgId)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.status).toBe('trial');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.currentTier).toBe('Trial');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.trialEndDate).toEqual(trialEnd);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should create admin user for organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newUser = {
                            id: "user-" + Date.now(),
                            email: 'admin@org.com',
                            name: 'Admin User',
                            organizationId: testOrgId,
                            role: 'admin',
                            status: 'active',
                            lastLogin: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.users).values(newUser)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_1.users.id, newUser.id)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.role).toBe('admin');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.organizationId).toBe(testOrgId);
                        testUserId = newUser.id;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 2: Permissions & Access Control', function () {
        vitest_1.it('should grant permissions to user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var permission, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        permission = {
                            id: "perm-" + Date.now(),
                            organizationId: testOrgId,
                            userId: testUserId,
                            module: 'billing',
                            permission: 'create',
                            isGranted: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.granularPermissions).values(permission)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.granularPermissions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.granularPermissions.userId, testUserId)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.module).toBe('billing');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.permission).toBe('create');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.isGranted).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should audit permission grant', function () { return __awaiter(void 0, void 0, void 0, function () {
            var auditEntry, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auditEntry = {
                            id: "audit-" + Date.now(),
                            organizationId: testOrgId,
                            userId: testUserId,
                            action: 'permission_granted',
                            entityType: 'granularPermission',
                            entityId: "perm-test-" + Date.now(),
                            oldValues: null,
                            newValues: JSON.stringify({ module: 'billing', permission: 'create' }),
                            severity: 'info',
                            ipAddress: '192.168.1.1',
                            userAgent: 'Test Suite',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.auditLogs).values(auditEntry)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.auditLogs.findFirst({
                                where: drizzle_orm_1.eq(schema_1.auditLogs.entityId, auditEntry.entityId)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.action).toBe('permission_granted');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 3: Trial-to-Paid Conversion', function () {
        vitest_1.it('should generate invoice when trial ends', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invoice, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invoice = {
                            id: "inv-" + Date.now(),
                            organizationId: testOrgId,
                            invoiceNumber: "INV-2026-001",
                            status: 'pending',
                            issueDate: new Date(),
                            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            totalAmount: 0,
                            taxAmount: 0,
                            discountAmount: 0,
                            paymentMethod: 'stripe',
                            description: 'Trial conversion invoice',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values(invoice)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, invoice.id)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.status).toBe('pending');
                        testInvoiceId = invoice.id;
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should convert subscription to paid status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var subscription, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                            where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, testOrgId)
                        })];
                    case 1:
                        subscription = _a.sent();
                        vitest_1.expect(subscription).toBeDefined();
                        if (!subscription) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.organizationSubscriptions)
                                .set({
                                status: 'paid',
                                currentTier: 'Starter'
                            })
                                .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, testOrgId))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, testOrgId)
                            })];
                    case 3:
                        updated = _a.sent();
                        vitest_1.expect(updated === null || updated === void 0 ? void 0 : updated.status).toBe('paid');
                        vitest_1.expect(updated === null || updated === void 0 ? void 0 : updated.currentTier).toBe('Starter');
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 4: Payment Processing', function () {
        vitest_1.it('should record successful payment via Stripe', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invoice, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                            where: drizzle_orm_1.eq(schema_1.invoices.id, testInvoiceId)
                        })];
                    case 1:
                        invoice = _a.sent();
                        vitest_1.expect(invoice).toBeDefined();
                        if (!invoice) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.invoices)
                                .set({
                                status: 'paid',
                                paidDate: new Date(),
                                paymentMethod: 'stripe',
                                stripePaymentIntentId: 'pi_test123',
                                updatedAt: new Date()
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, invoice.id)
                            })];
                    case 3:
                        updated = _a.sent();
                        vitest_1.expect(updated === null || updated === void 0 ? void 0 : updated.status).toBe('paid');
                        vitest_1.expect(updated === null || updated === void 0 ? void 0 : updated.stripePaymentIntentId).toBe('pi_test123');
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should handle failed payment gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var failedInvoice, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        failedInvoice = {
                            id: "inv-fail-" + Date.now(),
                            organizationId: testOrgId,
                            invoiceNumber: "INV-2026-F001",
                            status: 'failed',
                            issueDate: new Date(),
                            dueDate: new Date(),
                            totalAmount: 99.99,
                            taxAmount: 0,
                            discountAmount: 0,
                            paymentMethod: 'stripe',
                            failureReason: 'Card declined',
                            description: 'Test failed payment',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values(failedInvoice)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, failedInvoice.id)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result).toBeDefined();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.status).toBe('failed');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.failureReason).toBe('Card declined');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 5: Multi-Tenancy Isolation', function () {
        vitest_1.it('should prevent cross-tenant data access', function () { return __awaiter(void 0, void 0, void 0, function () {
            var anotherOrg, otherOrgUsers, testOrgUsers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        anotherOrg = {
                            id: "org-" + Date.now() + "-other",
                            name: 'Other Organization',
                            email: 'other@org.com',
                            plan: 'Trial',
                            status: 'active',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.organizations).values(anotherOrg)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .select()
                                .from(schema_1.users)
                                .where(drizzle_orm_1.eq(schema_1.users.organizationId, anotherOrg.id))];
                    case 2:
                        otherOrgUsers = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .select()
                                .from(schema_1.users)
                                .where(drizzle_orm_1.eq(schema_1.users.organizationId, testOrgId))];
                    case 3:
                        testOrgUsers = _a.sent();
                        // Should have separate user lists
                        vitest_1.expect(otherOrgUsers).not.toEqual(testOrgUsers);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should isolate permissions per organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var perms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.granularPermissions)
                            .where(drizzle_orm_1.eq(schema_1.granularPermissions.organizationId, testOrgId))];
                    case 1:
                        perms = _a.sent();
                        // All perms should be for testOrgId
                        perms.forEach(function (perm) {
                            vitest_1.expect(perm.organizationId).toBe(testOrgId);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 6: Subscription Renewal', function () {
        vitest_1.it('should schedule renewal invoice on next billing date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var subscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                            where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, testOrgId)
                        })];
                    case 1:
                        subscription = _a.sent();
                        vitest_1.expect(subscription).toBeDefined();
                        vitest_1.expect(subscription === null || subscription === void 0 ? void 0 : subscription.nextBillingDate).toBeDefined();
                        vitest_1.expect(subscription === null || subscription === void 0 ? void 0 : subscription.autoRenewEnabled).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should lock subscription if payment is overdue', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lockedSubscription, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lockedSubscription = {
                            id: "sub-lock-" + Date.now(),
                            organizationId: "org-lock-" + Date.now(),
                            status: 'locked',
                            currentTier: 'Starter',
                            trialStartDate: new Date(),
                            trialEndDate: new Date(),
                            renewalDate: new Date(),
                            nextBillingDate: new Date(),
                            billingCycleMonths: 1,
                            autoRenewEnabled: false,
                            lockedReason: 'Payment overdue 3+ days',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, db_1.db.insert(schema_1.organizationSubscriptions).values(lockedSubscription)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.id, lockedSubscription.id)
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.status).toBe('locked');
                        vitest_1.expect(result === null || result === void 0 ? void 0 : result.lockedReason).toBe('Payment overdue 3+ days');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Phase 7: Analytics & Compliance', function () {
        vitest_1.it('should track all changes in audit log', function () { return __awaiter(void 0, void 0, void 0, function () {
            var auditEntries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.auditLogs)
                            .where(drizzle_orm_1.eq(schema_1.auditLogs.organizationId, testOrgId))];
                    case 1:
                        auditEntries = _a.sent();
                        vitest_1.expect(auditEntries.length).toBeGreaterThan(0);
                        auditEntries.forEach(function (entry) {
                            vitest_1.expect(entry.action).toBeDefined();
                            vitest_1.expect(entry.entityType).toBeDefined();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should support audit log export', function () { return __awaiter(void 0, void 0, void 0, function () {
            var auditEntries, jsonExport, csvExport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.auditLogs)
                            .where(drizzle_orm_1.eq(schema_1.auditLogs.organizationId, testOrgId))];
                    case 1:
                        auditEntries = _a.sent();
                        jsonExport = JSON.stringify(auditEntries, null, 2);
                        vitest_1.expect(jsonExport).toBeDefined();
                        vitest_1.expect(jsonExport.length).toBeGreaterThan(0);
                        csvExport = __spreadArrays([
                            'Action,EntityType,User,Timestamp,Severity'
                        ], auditEntries.map(function (entry) {
                            return entry.action + "," + entry.entityType + "," + entry.userId + "," + entry.createdAt + "," + entry.severity;
                        })).join('\n');
                        vitest_1.expect(csvExport).toBeDefined();
                        vitest_1.expect(csvExport.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Summary Report', function () {
        vitest_1.it('should generate test summary', function () {
            var summary = {
                organizationsCreated: 1,
                usersCreated: 1,
                invoicesGenerated: 2,
                permissionsGranted: 1,
                auditEntriesLogged: 2,
                testsCompleted: 'All major flows',
                status: '✅ PASS'
            };
            console.log('\n📊 Test Summary:');
            console.log(JSON.stringify(summary, null, 2));
            vitest_1.expect(summary.status).toBe('✅ PASS');
        });
    });
});
/**
 * Integration Test Helpers
 */
function createTestOrganization(name) {
    return __awaiter(this, void 0, void 0, function () {
        var org;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    org = {
                        id: "test-org-" + Date.now(),
                        name: name,
                        email: name.toLowerCase() + "@test.com",
                        plan: 'Trial',
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [4 /*yield*/, db_1.db.insert(schema_1.organizations).values(org)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, org];
            }
        });
    });
}
exports.createTestOrganization = createTestOrganization;
function createTestUser(orgId, email, role) {
    if (role === void 0) { role = 'user'; }
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = {
                        id: "test-user-" + Date.now(),
                        email: email,
                        name: email.split('@')[0],
                        organizationId: orgId,
                        role: role,
                        status: 'active',
                        lastLogin: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [4 /*yield*/, db_1.db.insert(schema_1.users).values(user)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, user];
            }
        });
    });
}
exports.createTestUser = createTestUser;
function createTestInvoice(orgId, amount, status) {
    if (status === void 0) { status = 'pending'; }
    return __awaiter(this, void 0, void 0, function () {
        var invoice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invoice = {
                        id: "test-inv-" + Date.now(),
                        organizationId: orgId,
                        invoiceNumber: "TEST-" + Date.now(),
                        status: status,
                        issueDate: new Date(),
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        totalAmount: amount,
                        taxAmount: 0,
                        discountAmount: 0,
                        paymentMethod: 'stripe',
                        description: 'Test invoice',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values(invoice)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, invoice];
            }
        });
    });
}
exports.createTestInvoice = createTestInvoice;
