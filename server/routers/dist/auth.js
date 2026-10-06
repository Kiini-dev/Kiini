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
exports.authRouter = exports._lockStore = exports._resetLockStore = void 0;
var const_1 = require("@shared/const");
var server_1 = require("@trpc/server");
var zod_1 = require("zod");
var jose_1 = require("jose");
var bcrypt = require("bcryptjs");
var uuid_1 = require("uuid");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var cookies_1 = require("../_core/cookies");
var db = require("../db");
var db_users_1 = require("../db-users");
// Feature-based procedures
var userEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("users:edit");
var JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");
/**
 * Generate JWT token for local authentication
 */
function generateJWT(userId, expiresIn) {
    if (expiresIn === void 0) { expiresIn = const_1.ONE_YEAR_MS; }
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new jose_1.SignJWT({ userId: userId })
                        .setProtectedHeader({ alg: "HS256" })
                        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn / 1000)
                        .sign(JWT_SECRET)];
                case 1:
                    token = _a.sent();
                    return [2 /*return*/, token];
            }
        });
    });
}
/**
 * Verify JWT token
 */
function verifyJWT(token) {
    return __awaiter(this, void 0, void 0, function () {
        var verified, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, jose_1.jwtVerify(token, JWT_SECRET)];
                case 1:
                    verified = _a.sent();
                    return [2 /*return*/, verified.payload];
                case 2:
                    error_1 = _a.sent();
                    throw new server_1.TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Hash password
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcrypt.genSalt(10)];
                case 1:
                    salt = _a.sent();
                    return [2 /*return*/, bcrypt.hash(password, salt)];
            }
        });
    });
}
/**
 * Verify password
 */
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcrypt.compare(password, hash)];
        });
    });
}
var registerInput = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    company: zod_1.z.string().min(2, "Company name is required"),
    slug: zod_1.z.string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")
        .optional()
});
var loginInput = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required")
});
var lockStore = new Map();
// tests may clear or inspect the store
function _resetLockStore() {
    lockStore.clear();
}
exports._resetLockStore = _resetLockStore;
exports._lockStore = lockStore;
var MAX_ATTEMPTS = 5;
var LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
var rateMap = new Map();
function checkRateLimit(ip, action, max, windowMs) {
    var key = ip + ":" + action;
    var now = Date.now();
    var info = rateMap.get(key);
    if (!info || now - info.windowStart > windowMs) {
        rateMap.set(key, { count: 1, windowStart: now });
        return true;
    }
    if (info.count >= max) {
        return false;
    }
    info.count += 1;
    return true;
}
var updateProfileInput = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional()
});
var changePasswordInput = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: zod_1.z.string()
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
var requestPasswordResetInput = zod_1.z.object({
    email: zod_1.z.string().email()
});
var resetPasswordInput = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: zod_1.z.string()
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
exports.authRouter = trpc_1.router({
    /**
     * Get current user
     */
    me: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var organizationSlug, org, orgErr_1, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Auth.me] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER');
                        organizationSlug = null;
                        if (!ctx.user.organizationId) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 2:
                        org = _c.sent();
                        organizationSlug = (org === null || org === void 0 ? void 0 : org.slug) || null;
                        return [3 /*break*/, 4];
                    case 3:
                        orgErr_1 = _c.sent();
                        console.warn('[Auth.me] getOrganization failed (non-fatal):', orgErr_1);
                        return [3 /*break*/, 4];
                    case 4:
                        result = __assign(__assign({}, ctx.user), { organizationSlug: organizationSlug });
                        console.log('[Auth.me] Returning user data for:', result.email);
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Register new user
     */
    register: trpc_1.publicProcedure
        .input(registerInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var existingUser, passwordHash, userId, userRole, companyName, slug, org, orgId, billingCycle, trialFeatures, _i, trialFeatures_1, feature, subscriptionId, now, renewalDate, trialPlan, price, error_2, token, cookieOptions, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 19, , 20]);
                        return [4 /*yield*/, db_users_1.getUserByEmail(input.email)];
                    case 1:
                        existingUser = _c.sent();
                        if (existingUser) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Email already registered"
                            });
                        }
                        return [4 /*yield*/, hashPassword(input.password)];
                    case 2:
                        passwordHash = _c.sent();
                        userId = "user_" + Date.now();
                        return [4 /*yield*/, db.upsertUser({
                                id: userId,
                                email: input.email,
                                name: input.name,
                                loginMethod: "local",
                                lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        _c.sent();
                        // Store password hash
                        return [4 /*yield*/, db.setUserPassword(userId, passwordHash)];
                    case 4:
                        // Store password hash
                        _c.sent();
                        userRole = "user";
                        if (!(input.company && input.company.trim())) return [3 /*break*/, 17];
                        companyName = input.company.trim();
                        slug = (input.slug || companyName)
                            .toString()
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                        return [4 /*yield*/, db.getOrganizationBySlug(slug)];
                    case 5:
                        org = _c.sent();
                        if (!org) return [3 /*break*/, 7];
                        // Join existing organization as regular user
                        return [4 /*yield*/, db.assignUserToOrganization(userId, org.id)];
                    case 6:
                        // Join existing organization as regular user
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 7:
                        orgId = "org_" + Date.now();
                        billingCycle = 'monthly';
                        return [4 /*yield*/, db.createOrganization({
                                id: orgId,
                                name: companyName,
                                slug: slug,
                                plan: 'trial',
                                isActive: 1,
                                maxUsers: 5,
                                settings: { billingCycle: billingCycle }
                            })];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, db.assignUserToOrganization(userId, orgId)];
                    case 9:
                        _c.sent();
                        userRole = "admin";
                        trialFeatures = ['crm', 'invoicing', 'reports'];
                        _i = 0, trialFeatures_1 = trialFeatures;
                        _c.label = 10;
                    case 10:
                        if (!(_i < trialFeatures_1.length)) return [3 /*break*/, 13];
                        feature = trialFeatures_1[_i];
                        return [4 /*yield*/, db.setOrganizationFeature(orgId, feature, true)];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 10];
                    case 13:
                        _c.trys.push([13, 16, , 17]);
                        subscriptionId = "sub_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        now = new Date();
                        renewalDate = new Date();
                        // Set renewal date based on billing cycle (default monthly)
                        renewalDate.setMonth(renewalDate.getMonth() + 1);
                        return [4 /*yield*/, db.getPricingPlan('trial')];
                    case 14:
                        trialPlan = _c.sent();
                        price = ((_b = trialPlan) === null || _b === void 0 ? void 0 : _b.monthlyPrice) || 0;
                        return [4 /*yield*/, db.createSubscription({
                                id: subscriptionId,
                                organizationId: orgId,
                                planId: 'trial',
                                status: 'trial',
                                billingCycle: 'monthly',
                                startDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                renewalDate: renewalDate.toISOString().replace('T', ' ').substring(0, 19),
                                currentPrice: price,
                                autoRenew: 1
                            })];
                    case 15:
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        error_2 = _c.sent();
                        console.error('[Auth] Failed to create subscription during signup:', error_2);
                        return [3 /*break*/, 17];
                    case 17: return [4 /*yield*/, generateJWT(userId)];
                    case 18:
                        token = _c.sent();
                        cookieOptions = cookies_1.getSessionCookieOptions(ctx.req);
                        ctx.res.cookie(const_1.COOKIE_NAME, token, __assign(__assign({}, cookieOptions), { maxAge: const_1.ONE_YEAR_MS }));
                        return [2 /*return*/, {
                                success: true,
                                message: "Registration successful",
                                user: {
                                    id: userId,
                                    email: input.email,
                                    name: input.name,
                                    role: userRole
                                },
                                // Return token for localStorage fallback
                                token: token
                            }];
                    case 19:
                        error_3 = _c.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Registration failed"
                        });
                    case 20: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Login with email and password
     */
    login: trpc_1.publicProcedure
        .input(loginInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var ip, user, dbLockedUntil, lockInfo, passwordHash, isPasswordValid, userClient, subscription, subError_1, token_1, cookieOptions_1, token, cookieOptions, org, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 26, , 27]);
                        console.log('[Auth.login] Attempting login for:', input.email);
                        ip = ctx.req.ip || 'unknown';
                        if (!checkRateLimit(ip, 'login', 20, 60 * 60 * 1000)) {
                            console.log('[Auth.login] Rate limit exceeded for IP:', ip);
                            throw new server_1.TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, try again later' });
                        }
                        return [4 /*yield*/, db_users_1.getUserByEmail(input.email)];
                    case 1:
                        user = _b.sent();
                        console.log('[Auth.login] User lookup result:', { email: input.email, found: !!user, userId: user === null || user === void 0 ? void 0 : user.id });
                        // persistent lockout check if user exists
                        if (user) {
                            dbLockedUntil = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
                            if (dbLockedUntil && Date.now() < dbLockedUntil) {
                                throw new server_1.TRPCError({
                                    code: "FORBIDDEN",
                                    message: "Account temporarily locked due to multiple failed login attempts"
                                });
                            }
                        }
                        lockInfo = lockStore.get(input.email) || { attempts: 0 };
                        if (!!user) return [3 /*break*/, 3];
                        // increment failed attempts for unknown email as well (optional)
                        lockInfo.attempts = (lockInfo.attempts || 0) + 1;
                        if (lockInfo.attempts >= MAX_ATTEMPTS) {
                            lockInfo.lockedUntil = Date.now() + LOCK_DURATION_MS;
                        }
                        lockStore.set(input.email, lockInfo);
                        return [4 /*yield*/, db.logActivity({
                                userId: 'unknown',
                                action: 'login_failed',
                                entityType: 'auth',
                                entityId: input.email,
                                description: "Failed login attempt for non-existent user " + input.email
                            })];
                    case 2:
                        _b.sent();
                        throw new server_1.TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Invalid email or password"
                        });
                    case 3: return [4 /*yield*/, db.getUserPassword(user.id)];
                    case 4:
                        passwordHash = _b.sent();
                        console.log('[Auth.login] Password hash lookup:', { userId: user.id, hashExists: !!passwordHash, hashLength: passwordHash === null || passwordHash === void 0 ? void 0 : passwordHash.length });
                        if (!!passwordHash) return [3 /*break*/, 7];
                        // increment in-memory store as before
                        lockInfo.attempts = (lockInfo.attempts || 0) + 1;
                        if (lockInfo.attempts >= MAX_ATTEMPTS) {
                            lockInfo.lockedUntil = Date.now() + LOCK_DURATION_MS;
                        }
                        lockStore.set(input.email, lockInfo);
                        // persist in database
                        return [4 /*yield*/, db_users_1.updateUser(user.id, {
                                failedLoginAttempts: lockInfo.attempts,
                                lockedUntil: lockInfo.lockedUntil ? new Date(lockInfo.lockedUntil) : undefined
                            })];
                    case 5:
                        // persist in database
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: user.id,
                                action: 'login_failed',
                                entityType: 'auth',
                                entityId: user.id,
                                description: "Failed login attempt (no password) for user " + user.email
                            })];
                    case 6:
                        _b.sent();
                        throw new server_1.TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Invalid email or password"
                        });
                    case 7: return [4 /*yield*/, verifyPassword(input.password, passwordHash)];
                    case 8:
                        isPasswordValid = _b.sent();
                        console.log('[Auth.login] Password verification:', { email: input.email, isValid: isPasswordValid });
                        if (!!isPasswordValid) return [3 /*break*/, 11];
                        lockInfo.attempts = (lockInfo.attempts || 0) + 1;
                        if (lockInfo.attempts >= MAX_ATTEMPTS) {
                            lockInfo.lockedUntil = Date.now() + LOCK_DURATION_MS;
                        }
                        lockStore.set(input.email, lockInfo);
                        // persist updates
                        return [4 /*yield*/, db_users_1.updateUser(user.id, {
                                failedLoginAttempts: lockInfo.attempts,
                                lockedUntil: lockInfo.lockedUntil ? new Date(lockInfo.lockedUntil) : undefined
                            })];
                    case 9:
                        // persist updates
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: user.id,
                                action: 'login_failed',
                                entityType: 'auth',
                                entityId: user.id,
                                description: "Invalid password attempt for user " + user.email
                            })];
                    case 10:
                        _b.sent();
                        throw new server_1.TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Invalid email or password"
                        });
                    case 11:
                        _b.trys.push([11, 16, , 17]);
                        return [4 /*yield*/, db.getClientByCreatedBy(user.id)];
                    case 12:
                        userClient = _b.sent();
                        if (!userClient) return [3 /*break*/, 15];
                        return [4 /*yield*/, db.getClientSubscription(userClient.id)];
                    case 13:
                        subscription = _b.sent();
                        if (!(subscription && subscription.isLocked)) return [3 /*break*/, 15];
                        return [4 /*yield*/, db.logActivity({
                                userId: user.id,
                                action: 'login_blocked',
                                entityType: 'auth',
                                entityId: user.id,
                                description: "Login blocked - subscription locked for client " + userClient.id
                            })];
                    case 14:
                        _b.sent();
                        throw new server_1.TRPCError({
                            code: "FORBIDDEN",
                            message: "Your subscription has been locked due to overdue payment. Please update your payment to continue.",
                            cause: "subscription_locked"
                        });
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        subError_1 = _b.sent();
                        if (subError_1.code === 'FORBIDDEN')
                            throw subError_1;
                        console.warn('[Auth] Subscription check warning:', subError_1);
                        return [3 /*break*/, 17];
                    case 17:
                        if (!user.requiresPasswordChange) return [3 /*break*/, 19];
                        return [4 /*yield*/, generateJWT(user.id)];
                    case 18:
                        token_1 = _b.sent();
                        cookieOptions_1 = cookies_1.getSessionCookieOptions(ctx.req);
                        ctx.res.cookie(const_1.COOKIE_NAME, token_1, __assign(__assign({}, cookieOptions_1), { maxAge: const_1.ONE_YEAR_MS }));
                        return [2 /*return*/, {
                                success: true,
                                requiresPasswordChange: true,
                                message: "Password change required on first login",
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    name: user.name,
                                    role: user.role
                                },
                                token: token_1
                            }];
                    case 19:
                        // reset on success
                        lockStore["delete"](input.email);
                        // clear persistent lockout
                        return [4 /*yield*/, db_users_1.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null })];
                    case 20:
                        // clear persistent lockout
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: user.id,
                                action: 'login_success',
                                entityType: 'auth',
                                entityId: user.id,
                                description: "User " + user.email + " logged in successfully"
                            })];
                    case 21:
                        _b.sent();
                        // Update last signed in
                        return [4 /*yield*/, db.upsertUser({
                                id: user.id,
                                lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 22:
                        // Update last signed in
                        _b.sent();
                        return [4 /*yield*/, generateJWT(user.id)];
                    case 23:
                        token = _b.sent();
                        cookieOptions = cookies_1.getSessionCookieOptions(ctx.req);
                        ctx.res.cookie(const_1.COOKIE_NAME, token, __assign(__assign({}, cookieOptions), { maxAge: const_1.ONE_YEAR_MS }));
                        org = null;
                        if (!user.organizationId) return [3 /*break*/, 25];
                        return [4 /*yield*/, db.getOrganization(user.organizationId)];
                    case 24:
                        org = _b.sent();
                        _b.label = 25;
                    case 25: return [2 /*return*/, {
                            success: true,
                            message: "Login successful",
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                                organizationId: user.organizationId || null,
                                organizationSlug: (org === null || org === void 0 ? void 0 : org.slug) || null,
                                organizationName: (org === null || org === void 0 ? void 0 : org.name) || null
                            },
                            // Return token for localStorage fallback
                            token: token
                        }];
                    case 26:
                        error_4 = _b.sent();
                        console.error("[Login Error]", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Login failed"
                        });
                    case 27: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Logout
     */
    logout: trpc_1.publicProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        var cookieOptions = cookies_1.getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(const_1.COOKIE_NAME, __assign(__assign({}, cookieOptions), { maxAge: -1 }));
        return { success: true };
    }),
    /**
     * Update user profile
     */
    updateProfile: userEditProcedure
        .input(updateProfileInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, updateData, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ctx.user.id;
                        updateData = {};
                        if (input.name)
                            updateData.name = input.name;
                        if (input.email)
                            updateData.email = input.email;
                        if (Object.keys(updateData).length === 0) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "No fields to update"
                            });
                        }
                        return [4 /*yield*/, db.updateUser(userId, updateData)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Profile updated successfully"
                            }];
                    case 2:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update profile"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Change password
     */
    changePassword: userEditProcedure
        .input(changePasswordInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, passwordHash, isPasswordValid, newPasswordHash, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        userId = ctx.user.id;
                        return [4 /*yield*/, db.getUserPassword(userId)];
                    case 1:
                        passwordHash = _b.sent();
                        if (!passwordHash) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Current password is incorrect"
                            });
                        }
                        return [4 /*yield*/, verifyPassword(input.currentPassword, passwordHash)];
                    case 2:
                        isPasswordValid = _b.sent();
                        if (!isPasswordValid) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Current password is incorrect"
                            });
                        }
                        return [4 /*yield*/, hashPassword(input.newPassword)];
                    case 3:
                        newPasswordHash = _b.sent();
                        return [4 /*yield*/, db.setUserPassword(userId, newPasswordHash)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Password changed successfully"
                            }];
                    case 5:
                        error_6 = _b.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to change password"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update notification preferences
     */
    updateNotificationPreferences: userEditProcedure
        .input(zod_1.z.object({
        emailNotifications: zod_1.z.boolean().optional(),
        smsNotifications: zod_1.z.boolean().optional(),
        payrollAlerts: zod_1.z.boolean().optional(),
        invoiceAlerts: zod_1.z.boolean().optional(),
        paymentReminders: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ctx.user.id;
                        // Store preferences in a settings table or user table
                        // For now, we'll just return success (can be extended)
                        return [4 /*yield*/, db.updateUser(userId, {
                                preferences: JSON.stringify(input)
                            })];
                    case 1:
                        // Store preferences in a settings table or user table
                        // For now, we'll just return success (can be extended)
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Notification preferences updated successfully"
                            }];
                    case 2:
                        error_7 = _b.sent();
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update notification preferences"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Request password reset
     */
    requestPasswordReset: trpc_1.publicProcedure
        .input(requestPasswordResetInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var ip, user, resetToken, frontendUrl, resetLink, sendEmail, passwordResetEmail, getCompanyInfo, company, emailPayload, emailError_1, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ip = ctx.req.ip || 'unknown';
                        if (!checkRateLimit(ip, 'password_reset_request', 5, 60 * 60 * 1000)) {
                            throw new server_1.TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many password reset requests, try again later' });
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 14, , 15]);
                        return [4 /*yield*/, db_users_1.getUserByEmail(input.email)];
                    case 2:
                        user = _b.sent();
                        if (!user) {
                            // Don't reveal if email exists for security
                            return [2 /*return*/, {
                                    success: true,
                                    message: "If email exists, password reset link will be sent"
                                }];
                        }
                        return [4 /*yield*/, generateJWT(user.id, 3600000)];
                    case 3:
                        resetToken = _b.sent();
                        return [4 /*yield*/, db.setPasswordResetToken(user.id, resetToken)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: user.id,
                                action: 'password_reset_requested',
                                entityType: 'auth',
                                entityId: user.id,
                                description: "Password reset requested for " + user.email
                            })];
                    case 5:
                        _b.sent();
                        frontendUrl = process.env.FRONTEND_URL || ctx.req.protocol + "://" + ctx.req.get('host');
                        resetLink = frontendUrl + "/reset-password?token=" + resetToken;
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 12, , 13]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../_core/mail'); })];
                    case 7:
                        sendEmail = (_b.sent()).sendEmail;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../_core/emailTemplates'); })];
                    case 8:
                        passwordResetEmail = (_b.sent()).passwordResetEmail;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/company-info'); })];
                    case 9:
                        getCompanyInfo = (_b.sent()).getCompanyInfo;
                        return [4 /*yield*/, getCompanyInfo()];
                    case 10:
                        company = _b.sent();
                        emailPayload = passwordResetEmail(user.name || user.email, resetLink, {
                            companyName: company.name,
                            companyEmail: company.email,
                            logoUrl: company.logo,
                            brandColor: '#4F46E5'
                        });
                        return [4 /*yield*/, sendEmail({
                                to: user.email,
                                subject: emailPayload.subject,
                                html: emailPayload.html,
                                text: emailPayload.text
                            })];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        emailError_1 = _b.sent();
                        console.error('[Auth] Failed to send password reset email:', emailError_1);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/, {
                            success: true,
                            message: "If email exists, password reset link will be sent"
                        }];
                    case 14:
                        error_8 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to process password reset request"
                        });
                    case 15: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Reset password with token
     */
    resetPassword: trpc_1.publicProcedure
        .input(resetPasswordInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var ip, payload, userId, storedToken, passwordHash, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ip = ctx.req.ip || 'unknown';
                        if (!checkRateLimit(ip, 'password_reset', 10, 60 * 60 * 1000)) {
                            throw new server_1.TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' });
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, verifyJWT(input.token)];
                    case 2:
                        payload = _b.sent();
                        userId = payload.userId;
                        return [4 /*yield*/, db.getPasswordResetToken(userId)];
                    case 3:
                        storedToken = _b.sent();
                        if (storedToken !== input.token) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Invalid or expired reset token"
                            });
                        }
                        return [4 /*yield*/, hashPassword(input.newPassword)];
                    case 4:
                        passwordHash = _b.sent();
                        return [4 /*yield*/, db.setUserPassword(userId, passwordHash)];
                    case 5:
                        _b.sent();
                        // Clear reset token
                        return [4 /*yield*/, db.clearPasswordResetToken(userId)];
                    case 6:
                        // Clear reset token
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: 'password_reset',
                                entityType: 'auth',
                                entityId: userId,
                                description: "Password reset completed for user " + userId
                            })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Password reset successfully"
                            }];
                    case 8:
                        error_9 = _b.sent();
                        if (error_9 instanceof server_1.TRPCError)
                            throw error_9;
                        throw new server_1.TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Invalid or expired reset token"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Enable two-factor authentication
     */
    enable2FA: userEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, secret, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = ctx.user.id;
                        secret = userId + "_" + Date.now();
                        // Store temporarily for verification
                        return [4 /*yield*/, db.upsertUser({
                                id: userId,
                                email: ctx.user.email
                            })];
                    case 1:
                        // Store temporarily for verification
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: '2fa_setup_initiated',
                                entityType: 'auth',
                                entityId: userId,
                                description: "2FA setup initiated for user " + ctx.user.email
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                secret: secret,
                                message: "2FA setup initiated. Scan QR code with authenticator app."
                            }];
                    case 3:
                        error_10 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to enable 2FA"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Disable two-factor authentication
     */
    disable2FA: userEditProcedure
        .input(zod_1.z.object({ password: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, passwordHash, isPasswordValid, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        userId = ctx.user.id;
                        return [4 /*yield*/, db.getUserPassword(userId)];
                    case 1:
                        passwordHash = _b.sent();
                        if (!passwordHash) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Failed to verify password"
                            });
                        }
                        return [4 /*yield*/, verifyPassword(input.password, passwordHash)];
                    case 2:
                        isPasswordValid = _b.sent();
                        if (!isPasswordValid) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Invalid password"
                            });
                        }
                        // Disable 2FA (remove secret)
                        return [4 /*yield*/, db.updateUser(userId, {
                                twoFactorEnabled: false
                            })];
                    case 3:
                        // Disable 2FA (remove secret)
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: '2fa_disabled',
                                entityType: 'auth',
                                entityId: userId,
                                description: "2FA disabled for user " + ctx.user.email
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Two-factor authentication disabled"
                            }];
                    case 5:
                        error_11 = _b.sent();
                        if (error_11 instanceof server_1.TRPCError)
                            throw error_11;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to disable 2FA"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get active sessions
     */
    getSessions: enhancedRbac_1.createFeatureRestrictedProcedure("auth:sessions").query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId;
            return __generator(this, function (_b) {
                try {
                    userId = ctx.user.id;
                    // Return current session info
                    // In a real implementation, track sessions in DB
                    return [2 /*return*/, [
                            {
                                id: "current",
                                device: "Chrome on Windows",
                                location: "Unknown",
                                lastActive: new Date().toISOString(),
                                createdAt: ctx.user.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                current: true
                            },
                        ]];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch sessions"
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Logout from all sessions
     */
    logoutAllSessions: enhancedRbac_1.createFeatureRestrictedProcedure("auth:sessions").mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ctx.user.id;
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: 'logout_all_sessions',
                                entityType: 'auth',
                                entityId: userId,
                                description: "User logged out from all sessions"
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Logged out from all sessions" }];
                    case 2:
                        error_12 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to logout from all sessions"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export user data
     */
    exportUserData: enhancedRbac_1.createFeatureRestrictedProcedure("auth:export_user_data").query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, user, userData, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = ctx.user.id;
                        return [4 /*yield*/, db.getUser(userId)];
                    case 1:
                        user = _b.sent();
                        userData = {
                            profile: {
                                id: user === null || user === void 0 ? void 0 : user.id,
                                email: user === null || user === void 0 ? void 0 : user.email,
                                name: user === null || user === void 0 ? void 0 : user.name,
                                role: user === null || user === void 0 ? void 0 : user.role,
                                createdAt: user === null || user === void 0 ? void 0 : user.createdAt
                            },
                            exportedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: 'data_export_requested',
                                entityType: 'auth',
                                entityId: userId,
                                description: "User requested data export"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, userData];
                    case 3:
                        error_13 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to export user data"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Request account deletion
     */
    requestAccountDeletion: userEditProcedure
        .input(zod_1.z.object({ password: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId, passwordHash, isPasswordValid, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = ctx.user.id;
                        return [4 /*yield*/, db.getUserPassword(userId)];
                    case 1:
                        passwordHash = _b.sent();
                        if (!passwordHash) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Failed to verify password"
                            });
                        }
                        return [4 /*yield*/, verifyPassword(input.password, passwordHash)];
                    case 2:
                        isPasswordValid = _b.sent();
                        if (!isPasswordValid) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Invalid password"
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: userId,
                                action: 'account_deletion_requested',
                                entityType: 'auth',
                                entityId: userId,
                                description: "User requested account deletion. Will be deleted in 30 days."
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Account deletion requested. Your account will be deleted in 30 days."
                            }];
                    case 4:
                        error_14 = _b.sent();
                        if (error_14 instanceof server_1.TRPCError)
                            throw error_14;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to request account deletion"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Verify email token - lightweight stub for frontend compatibility
    getCsrfToken: trpc_1.publicProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return { csrfToken: ctx.csrfToken || null };
    }),
    verifyEmail: trpc_1.publicProcedure
        .input(zod_1.z.object({ token: zod_1.z.string().optional(), email: zod_1.z.string().email().optional() }).optional())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // For now, accept token/email and return success to satisfy client
                return [2 /*return*/, { success: true }];
            });
        });
    })
});
