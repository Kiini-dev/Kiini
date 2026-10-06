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
exports.resetPassword = exports.requestPasswordReset = exports.isEmailAvailable = exports.isUsernameAvailable = exports.authenticateLocalUser = exports.createLocalUser = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../drizzle/schema");
var db_1 = require("./db");
var auth_1 = require("./_core/auth");
/**
 * Create a new local user with username and password
 */
function createLocalUser(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, passwordHash, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
                    passwordHash = auth_1.hashPassword(data.password);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.insert(schema_1.users).values({
                            id: data.id,
                            // this app uses email as the canonical login field; accept `username` for
                            // backward compatibility and store it in `email` when `email` not provided
                            email: data.email || data.username || null,
                            name: data.name || null,
                            passwordHash: passwordHash,
                            loginMethod: "local",
                            role: data.role || "user",
                            createdAt: new Date().toISOString(),
                            lastSignedIn: new Date().toISOString(),
                            isActive: 1
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 4:
                    error_1 = _a.sent();
                    console.error("[Auth] Failed to create local user:", error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.createLocalUser = createLocalUser;
/**
 * Authenticate a user with username and password
 */
function authenticateLocalUser(username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, user, isPasswordValid, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.email, username))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    if (result.length === 0) {
                        return [2 /*return*/, { success: false, error: "Invalid username or password" }];
                    }
                    user = result[0];
                    // Check if user is active
                    if (!user.isActive) {
                        return [2 /*return*/, { success: false, error: "User account is disabled" }];
                    }
                    // Check if user has a password hash (local auth)
                    if (!user.passwordHash) {
                        return [2 /*return*/, { success: false, error: "This account uses external authentication" }];
                    }
                    isPasswordValid = auth_1.verifyPassword(password, user.passwordHash);
                    if (!isPasswordValid) {
                        return [2 /*return*/, { success: false, error: "Invalid username or password" }];
                    }
                    // Update last signed in
                    return [4 /*yield*/, db
                            .update(schema_1.users)
                            .set({ lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                            .where(drizzle_orm_1.eq(schema_1.users.id, user.id))];
                case 4:
                    // Update last signed in
                    _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            user: {
                                id: user.id,
                                // expose username for callers that expect it (map to email)
                                username: user.email,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                                loginMethod: user.loginMethod
                            }
                        }];
                case 5:
                    error_2 = _a.sent();
                    console.error("[Auth] Authentication failed:", error_2);
                    throw error_2;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.authenticateLocalUser = authenticateLocalUser;
/**
 * Check if username is available
 */
function isUsernameAvailable(username) {
    return __awaiter(this, void 0, Promise, function () {
        var db, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.email, username))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.length === 0];
                case 4:
                    error_3 = _a.sent();
                    console.error("[Auth] Failed to check username availability:", error_3);
                    throw error_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.isUsernameAvailable = isUsernameAvailable;
/**
 * Check if email is available
 */
function isEmailAvailable(email) {
    return __awaiter(this, void 0, Promise, function () {
        var db, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
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
                    return [2 /*return*/, result.length === 0];
                case 4:
                    error_4 = _a.sent();
                    console.error("[Auth] Failed to check email availability:", error_4);
                    throw error_4;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.isEmailAvailable = isEmailAvailable;
/**
 * Request password reset
 */
function requestPasswordReset(email) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, user, _a, token, expiresAt, hashedToken, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.email, email))
                            .limit(1)];
                case 3:
                    result = _b.sent();
                    if (result.length === 0) {
                        // Don't reveal if email exists
                        return [2 /*return*/, { success: true }];
                    }
                    user = result[0];
                    _a = generatePasswordResetToken(), token = _a.token, expiresAt = _a.expiresAt;
                    hashedToken = auth_1.hashResetToken(token);
                    return [4 /*yield*/, db
                            .update(schema_1.users)
                            .set({
                            passwordResetToken: hashedToken,
                            passwordResetExpiresAt: expiresAt.toISOString()
                        })
                            .where(drizzle_orm_1.eq(schema_1.users.id, user.id))];
                case 4:
                    _b.sent();
                    return [2 /*return*/, { success: true, token: token, email: email }];
                case 5:
                    error_5 = _b.sent();
                    console.error("[Auth] Failed to request password reset:", error_5);
                    throw error_5;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.requestPasswordReset = requestPasswordReset;
/**
 * Reset password with token
 */
function resetPassword(token, newPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var db, hashedToken, now, result, user, newPasswordHash, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database not available");
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    hashedToken = auth_1.hashResetToken(token);
                    now = new Date();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.passwordResetToken, hashedToken))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    if (result.length === 0) {
                        return [2 /*return*/, { success: false, error: "Invalid or expired reset token" }];
                    }
                    user = result[0];
                    // Check if token is expired
                    if (user.passwordResetExpiresAt && new Date(user.passwordResetExpiresAt) < now) {
                        return [2 /*return*/, { success: false, error: "Reset token has expired" }];
                    }
                    newPasswordHash = auth_1.hashPassword(newPassword);
                    return [4 /*yield*/, db
                            .update(schema_1.users)
                            .set({
                            passwordHash: newPasswordHash,
                            passwordResetToken: null,
                            passwordResetExpiresAt: null
                        })
                            .where(drizzle_orm_1.eq(schema_1.users.id, user.id))];
                case 4:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 5:
                    error_6 = _a.sent();
                    console.error("[Auth] Failed to reset password:", error_6);
                    throw error_6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.resetPassword = resetPassword;
/**
 * Helper function to generate password reset token
 */
function generatePasswordResetToken() {
    var crypto = require("crypto");
    var token = crypto.randomBytes(32).toString("hex");
    var expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token: token, expiresAt: expiresAt };
}
