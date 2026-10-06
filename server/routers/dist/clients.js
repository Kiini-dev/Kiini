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
exports.clientsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var bcrypt = require("bcryptjs");
var sse_1 = require("../sse");
var emailNotifications_1 = require("./emailNotifications");
var orgIsolation_1 = require("../middleware/orgIsolation");
var server_1 = require("@trpc/server");
var nullableIntFromInput = zod_1.z.preprocess(function (value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    if (typeof value === "number") {
        return Number.isInteger(value) ? value : value;
    }
    if (typeof value === "string") {
        var trimmed = value.trim();
        if (trimmed === "")
            return null;
        if (/^-?\d+$/.test(trimmed))
            return Number.parseInt(trimmed, 10);
    }
    return value;
}, zod_1.z.number().int().nullable().optional());
var toNullableInt = function (value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    if (typeof value === "number") {
        if (!Number.isFinite(value))
            return null;
        return Math.trunc(value);
    }
    if (typeof value === "string") {
        var trimmed = value.trim();
        if (trimmed === "")
            return null;
        var parsed = Number.parseInt(trimmed, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};
var normalizeOptionalString = function (value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    if (typeof value !== "string")
        return null;
    var trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
};
var sanitizeClientPayload = function (data) {
    return __assign(__assign({}, data), { creditLimit: toNullableInt(data.creditLimit), numberOfEmployees: toNullableInt(data.numberOfEmployees), yearEstablished: toNullableInt(data.yearEstablished), assignedTo: normalizeOptionalString(data.assignedTo) });
};
/**
 * Generate a random password
 * @param length - Password length (default 12)
 * @returns Random password string
 */
function generatePassword(length) {
    if (length === void 0) { length = 12; }
    var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lowercase = "abcdefghijklmnopqrstuvwxyz";
    var numbers = "0123456789";
    var symbols = "!@#$%^&*";
    var allChars = uppercase + lowercase + numbers + symbols;
    var password = "";
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    // Fill the rest randomly
    for (var i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle the password
    return password.split('').sort(function () { return Math.random() - 0.5; }).join('');
}
exports.clientsRouter = trpc_1.router({
    list: trpc_1.createFeatureRestrictedProcedure("clients:read")
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database_1, orgId, baseQuery, clientsList, clientsWithRevenue, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database_1 = _b.sent();
                        if (!database_1)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        baseQuery = orgId
                            ? database_1.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.organizationId, orgId))
                            : database_1.select().from(schema_1.clients);
                        return [4 /*yield*/, baseQuery.limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        clientsList = _b.sent();
                        return [4 /*yield*/, Promise.all(clientsList.map(function (client) { return __awaiter(void 0, void 0, void 0, function () {
                                var clientInvoices, totalRevenue, paidRevenue, outstandingRevenue;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, database_1.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, client.id))];
                                        case 1:
                                            clientInvoices = _a.sent();
                                            totalRevenue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                                            paidRevenue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.paidAmount || 0); }, 0);
                                            outstandingRevenue = totalRevenue - paidRevenue;
                                            return [2 /*return*/, __assign(__assign({}, client), { name: client.companyName || undefined, accountManager: client.assignedTo || undefined, revenue: {
                                                        totalRevenue: totalRevenue,
                                                        paidRevenue: paidRevenue,
                                                        outstandingRevenue: outstandingRevenue,
                                                        invoiceCount: clientInvoices.length
                                                    } })];
                                    }
                                });
                            }); }))];
                    case 3:
                        clientsWithRevenue = _b.sent();
                        return [2 /*return*/, clientsWithRevenue];
                    case 4:
                        error_1 = _b.sent();
                        console.error("[Clients List Error]", error_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.createFeatureRestrictedProcedure("clients:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, client, r, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length)
                            return [2 /*return*/, null];
                        client = result[0];
                        // STRICT: Verify the user owns this client's organization
                        orgIsolation_1.verifyOrgOwnership(ctx, client.organizationId);
                        r = client;
                        return [2 /*return*/, __assign(__assign({}, r), { name: r.companyName || undefined, accountManager: r.assignedTo || undefined })];
                    case 3:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        console.error("[Clients GetById Error]", error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("clients:create")
        .input(zod_1.z.object({
        companyName: zod_1.z.string(),
        contactPerson: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "inactive", "prospect", "archived"]).optional(),
        notes: zod_1.z.string().optional(),
        // Extended business fields
        businessType: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string().optional(),
        yearEstablished: nullableIntFromInput,
        numberOfEmployees: nullableIntFromInput,
        businessLicense: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        creditLimit: nullableIntFromInput,
        bankName: zod_1.z.string().optional(),
        bankCode: zod_1.z.string().optional(),
        branch: zod_1.z.string().optional(),
        bankAccountNumber: zod_1.z.string().optional(),
        currency: zod_1.z.string().optional(),
        leadSource: zod_1.z.string().optional(),
        secondaryPhone: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional(),
        createClientLogin: zod_1.z.boolean().optional()["default"](false),
        clientPassword: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, createClientLogin, clientPassword, clientData, sanitizedClientData, orgId, generatedPassword, salt, passwordHash, userId, nameParts, firstName, lastName, contactErr_1, notifError_1, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 17, , 18]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        createClientLogin = input.createClientLogin, clientPassword = input.clientPassword, clientData = __rest(input, ["createClientLogin", "clientPassword"]);
                        sanitizedClientData = sanitizeClientPayload(clientData);
                        orgId = ctx.user.organizationId && ctx.user.organizationId.trim()
                            ? ctx.user.organizationId
                            : null;
                        return [4 /*yield*/, database.insert(schema_1.clients).values(__assign(__assign({ id: id }, sanitizedClientData), { organizationId: orgId, createdBy: ctx.user.id }))];
                    case 2:
                        _c.sent();
                        generatedPassword = null;
                        if (!(createClientLogin && input.email)) return [3 /*break*/, 7];
                        // Generate password if not provided
                        generatedPassword = clientPassword || generatePassword(12);
                        return [4 /*yield*/, bcrypt.genSalt(10)];
                    case 3:
                        salt = _c.sent();
                        return [4 /*yield*/, bcrypt.hash(generatedPassword, salt)];
                    case 4:
                        passwordHash = _c.sent();
                        userId = "client_" + id;
                        return [4 /*yield*/, db.upsertUser({
                                id: userId,
                                email: input.email,
                                name: input.contactPerson || input.companyName,
                                role: "client",
                                loginMethod: "local",
                                lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 5:
                        _c.sent();
                        // Store password hash
                        return [4 /*yield*/, db.setUserPassword(userId, passwordHash)];
                    case 6:
                        // Store password hash
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 10, , 11]);
                        if (!(input.contactPerson || input.email)) return [3 /*break*/, 9];
                        nameParts = (input.contactPerson || input.companyName).trim().split(/\s+/);
                        firstName = nameParts[0] || input.companyName;
                        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
                        return [4 /*yield*/, database.insert(schema_1.contacts).values({
                                id: uuid_1.v4(),
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                clientId: id,
                                firstName: firstName,
                                lastName: lastName || "-",
                                email: input.email || null,
                                phone: input.phone || null,
                                mobile: input.secondaryPhone || null,
                                isPrimary: 1,
                                address: input.address || null,
                                city: input.city || null,
                                country: input.country || null,
                                postalCode: input.postalCode || null,
                                createdBy: ctx.user.id
                            })];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        contactErr_1 = _c.sent();
                        console.error("[Clients] Auto-create contact failed:", contactErr_1);
                        return [3 /*break*/, 11];
                    case 11:
                        // SSE: broadcast new client
                        if (ctx.user.organizationId) {
                            sse_1.notifyOrg(ctx.user.organizationId, {
                                id: "client-created-" + id,
                                type: "new_client",
                                title: "New Client Added",
                                body: input.companyName + " has been added as a client",
                                href: "/org/" + (ctx.user.organizationSlug || '') + "/crm",
                                timestamp: new Date().toISOString()
                            });
                        }
                        _c.label = 12;
                    case 12:
                        _c.trys.push([12, 15, , 16]);
                        if (!ctx.user.email) return [3 /*break*/, 14];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "client_created",
                                recipientEmail: ctx.user.email,
                                recipientName: ctx.user.name,
                                subject: "New Client Created: " + input.companyName,
                                htmlContent: "<h2>New Client Added</h2><p>Client <strong>" + input.companyName + "</strong> has been created.</p>" + (input.contactPerson ? "<p><strong>Contact:</strong> " + input.contactPerson + "</p>" : '') + (input.email ? "<p><strong>Email:</strong> " + input.email + "</p>" : '') + "<p><a href=\"/clients/" + id + "\">View Client</a></p>",
                                entityType: "client",
                                entityId: id,
                                actionUrl: "/clients/" + id
                            })];
                    case 13:
                        _c.sent();
                        _c.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        notifError_1 = _c.sent();
                        console.error("[Clients] Failed to send email notification:", notifError_1);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, {
                            id: id,
                            clientLoginCreated: createClientLogin && !!input.email,
                            generatedPassword: generatedPassword,
                            message: generatedPassword ? "Client account created. Password: " + generatedPassword : "Client created successfully"
                        }];
                    case 17:
                        error_3 = _c.sent();
                        console.error("[Clients Create Error]", error_3);
                        throw error_3;
                    case 18: return [2 /*return*/];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("clients:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        companyName: zod_1.z.string().optional(),
        contactPerson: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        secondaryPhone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        businessType: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string().optional(),
        yearEstablished: nullableIntFromInput,
        numberOfEmployees: nullableIntFromInput,
        businessLicense: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        creditLimit: nullableIntFromInput,
        bankName: zod_1.z.string().optional(),
        bankCode: zod_1.z.string().optional(),
        branch: zod_1.z.string().optional(),
        bankAccountNumber: zod_1.z.string().optional(),
        currency: zod_1.z.string().optional(),
        leadSource: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "inactive", "prospect", "archived"]).optional(),
        assignedTo: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, data, sanitizedData, existing, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        sanitizedData = sanitizeClientPayload(data);
                        return [4 /*yield*/, database.select({ organizationId: schema_1.clients.organizationId }).from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, id)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Client not found" });
                        }
                        // STRICT: Verify org ownership
                        orgIsolation_1.verifyOrgOwnership(ctx, existing[0].organizationId);
                        return [4 /*yield*/, database.update(schema_1.clients).set(sanitizedData).where(drizzle_orm_1.eq(schema_1.clients.id, id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        console.error("[Clients Update Error]", error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("clients:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select({ organizationId: schema_1.clients.organizationId }).from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Client not found" });
                        }
                        // STRICT: Verify org ownership
                        orgIsolation_1.verifyOrgOwnership(ctx, existing[0].organizationId);
                        return [4 /*yield*/, database["delete"](schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        console.error("[Clients Delete Error]", error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("clients:delete")
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existingClients, _i, existingClients_1, client, verifiedIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select({ id: schema_1.clients.id, organizationId: schema_1.clients.organizationId }).from(schema_1.clients).where(drizzle_orm_1.inArray(schema_1.clients.id, input))];
                    case 2:
                        existingClients = _b.sent();
                        for (_i = 0, existingClients_1 = existingClients; _i < existingClients_1.length; _i++) {
                            client = existingClients_1[_i];
                            orgIsolation_1.verifyOrgOwnership(ctx, client.organizationId);
                        }
                        verifiedIds = existingClients.map(function (c) { return c.id; });
                        return [4 /*yield*/, database["delete"](schema_1.clients).where(drizzle_orm_1.inArray(schema_1.clients.id, verifiedIds))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: verifiedIds.length }];
                }
            });
        });
    }),
    // Get client projects
    getProjects: trpc_1.createFeatureRestrictedProcedure("clients:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, clientExists, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database.select({ organizationId: schema_1.clients.organizationId }).from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input)).limit(1)];
                    case 2:
                        clientExists = _b.sent();
                        if (!clientExists.length)
                            return [2 /*return*/, []];
                        orgIsolation_1.verifyOrgOwnership(ctx, clientExists[0].organizationId);
                        return [4 /*yield*/, database.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.clientId, input))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_6 = _b.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        console.error("[Clients GetProjects Error]", error_6);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get client revenue
    getRevenue: trpc_1.createFeatureRestrictedProcedure("clients:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, clientInvoices, totalRevenue, paidRevenue, outstandingRevenue, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, { totalRevenue: 0, paidRevenue: 0, outstandingRevenue: 0, invoices: [] }];
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, input))];
                    case 2:
                        clientInvoices = _b.sent();
                        totalRevenue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                        paidRevenue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.paidAmount || 0); }, 0);
                        outstandingRevenue = totalRevenue - paidRevenue;
                        return [2 /*return*/, {
                                totalRevenue: totalRevenue,
                                paidRevenue: paidRevenue,
                                outstandingRevenue: outstandingRevenue,
                                invoices: clientInvoices
                            }];
                    case 3:
                        error_7 = _b.sent();
                        console.error("[Clients GetRevenue Error]", error_7);
                        return [2 /*return*/, { totalRevenue: 0, paidRevenue: 0, outstandingRevenue: 0, invoices: [] }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get top clients by revenue
    getTopClients: trpc_1.createFeatureRestrictedProcedure("clients:read")
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](10) }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database_2, allClients, clientsWithRevenue, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database_2 = _b.sent();
                        if (!database_2)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database_2.select().from(schema_1.clients)];
                    case 2:
                        allClients = _b.sent();
                        return [4 /*yield*/, Promise.all(allClients.map(function (client) { return __awaiter(void 0, void 0, void 0, function () {
                                var clientInvoices, totalRevenue;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, database_2.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, client.id))];
                                        case 1:
                                            clientInvoices = _a.sent();
                                            totalRevenue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                                            return [2 /*return*/, __assign(__assign({}, client), { totalRevenue: totalRevenue })];
                                    }
                                });
                            }); }))];
                    case 3:
                        clientsWithRevenue = _b.sent();
                        return [2 /*return*/, clientsWithRevenue
                                .sort(function (a, b) { return b.totalRevenue - a.totalRevenue; })
                                .slice(0, (input === null || input === void 0 ? void 0 : input.limit) || 10)
                                .map(function (c) { return (__assign(__assign({}, c), { name: c.companyName || undefined, accountManager: c.assignedTo || undefined })); })];
                    case 4:
                        error_8 = _b.sent();
                        console.error("[Clients GetTopClients Error]", error_8);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get client by user ID (for client portal)
    getClientByUserId: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, r, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.createdBy, ctx.user.id)).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length)
                            return [2 /*return*/, null];
                        r = result[0];
                        return [2 /*return*/, __assign(__assign({}, r), { name: r.companyName || undefined, accountManager: r.assignedTo || undefined })];
                    case 3:
                        error_9 = _b.sent();
                        console.error("[Clients GetClientByUserId Error]", error_9);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Create or update client login
    createClientLogin: trpc_1.createFeatureRestrictedProcedure("clients:create")
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().optional(),
        autoGenerate: zod_1.z.boolean().optional()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, clientRecord, password, salt, passwordHash, userId, clientName, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input.clientId)).limit(1)];
                    case 2:
                        clientRecord = _b.sent();
                        if (!clientRecord.length) {
                            throw new Error("Client not found");
                        }
                        password = input.password || (input.autoGenerate ? generatePassword(12) : null);
                        if (!password) {
                            throw new Error("Password required when autoGenerate is false");
                        }
                        return [4 /*yield*/, bcrypt.genSalt(10)];
                    case 3:
                        salt = _b.sent();
                        return [4 /*yield*/, bcrypt.hash(password, salt)];
                    case 4:
                        passwordHash = _b.sent();
                        userId = "client_" + input.clientId;
                        clientName = clientRecord[0].contactPerson || clientRecord[0].companyName;
                        return [4 /*yield*/, db.upsertUser({
                                id: userId,
                                email: input.email,
                                name: clientName,
                                role: "client",
                                loginMethod: "local",
                                lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 5:
                        _b.sent();
                        // Store password hash
                        return [4 /*yield*/, db.setUserPassword(userId, passwordHash)];
                    case 6:
                        // Store password hash
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                userId: userId,
                                email: input.email,
                                password: input.autoGenerate ? password : undefined,
                                message: input.autoGenerate ? "Client login created. Password: " + password : "Client login updated successfully"
                            }];
                    case 7:
                        error_10 = _b.sent();
                        console.error("[Clients CreateClientLogin Error]", error_10);
                        throw error_10;
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
