"use strict";
/**
 * Super Admin Seed Script
 * Creates the default super admin user and organization
 * Run with: npx ts-node scripts/seed-super-admin.ts
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
var db_1 = require("../server/db");
var schema_1 = require("../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var bcrypt_1 = require("bcrypt");
var SUPER_ADMIN = {
    email: "info@kiini.africa",
    password: "K1in1@@26!!",
    name: "Kiini Admin",
    role: "super_admin"
};
var DEFAULT_ORG = {
    id: "org_kiini_default",
    name: "Kiini Platform",
    slug: "kiini",
    plan: "enterprise",
    maxUsers: 999,
    currency: "KES",
    timezone: "Africa/Nairobi"
};
function seedSuperAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var db, existingOrg, orgId, existingUser, hashedPassword, userId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("❌ Failed to connect to database");
                        process.exit(1);
                    }
                    console.log("🌱 Seeding super admin...\n");
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.slug, DEFAULT_ORG.slug))
                            .limit(1)];
                case 2:
                    existingOrg = _a.sent();
                    orgId = DEFAULT_ORG.id;
                    if (!(existingOrg.length > 0)) return [3 /*break*/, 3];
                    orgId = existingOrg[0].id;
                    console.log("\u23ED\uFE0F  Organization \"" + DEFAULT_ORG.name + "\" already exists (id: " + orgId + ")");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, db.insert(schema_1.organizations).values({
                        id: orgId,
                        name: DEFAULT_ORG.name,
                        slug: DEFAULT_ORG.slug,
                        plan: DEFAULT_ORG.plan,
                        maxUsers: DEFAULT_ORG.maxUsers,
                        currency: DEFAULT_ORG.currency,
                        timezone: DEFAULT_ORG.timezone,
                        isActive: true
                    })];
                case 4:
                    _a.sent();
                    console.log("\u2705 Created organization: " + DEFAULT_ORG.name);
                    _a.label = 5;
                case 5: return [4 /*yield*/, db
                        .select()
                        .from(schema_1.users)
                        .where(drizzle_orm_1.eq(schema_1.users.email, SUPER_ADMIN.email))
                        .limit(1)];
                case 6:
                    existingUser = _a.sent();
                    if (!(existingUser.length > 0)) return [3 /*break*/, 7];
                    console.log("\u23ED\uFE0F  Super admin " + SUPER_ADMIN.email + " already exists");
                    return [3 /*break*/, 11];
                case 7: return [4 /*yield*/, bcrypt_1["default"].hash(SUPER_ADMIN.password, 10)];
                case 8:
                    hashedPassword = _a.sent();
                    userId = "user_super_admin_" + Date.now();
                    return [4 /*yield*/, db.insert(schema_1.users).values({
                            id: userId,
                            email: SUPER_ADMIN.email,
                            name: SUPER_ADMIN.name,
                            passwordHash: hashedPassword,
                            role: SUPER_ADMIN.role,
                            organizationId: orgId,
                            isActive: true,
                            loginMethod: "local",
                            createdAt: new Date().toISOString()
                        })];
                case 9:
                    _a.sent();
                    // Also insert into userRoles for role-based access
                    return [4 /*yield*/, db.insert(schema_1.userRoles).values({
                            id: "ur_super_admin_" + Date.now(),
                            userId: userId,
                            role: "super_admin",
                            roleName: "Super Administrator",
                            description: "Full platform access",
                            isActive: 1,
                            createdAt: new Date().toISOString()
                        })];
                case 10:
                    // Also insert into userRoles for role-based access
                    _a.sent();
                    console.log("\u2705 Created super admin: " + SUPER_ADMIN.name + " (" + SUPER_ADMIN.email + ")");
                    _a.label = 11;
                case 11:
                    console.log("\n🎉 Super admin seed complete!");
                    console.log("\n  \uD83D\uDCE7 Email:    " + SUPER_ADMIN.email);
                    console.log("  \uD83D\uDD11 Password: " + SUPER_ADMIN.password);
                    console.log("  \uD83C\uDFE2 Org:      " + DEFAULT_ORG.name + " (" + DEFAULT_ORG.slug + ")");
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.error("❌ Error seeding super admin:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
seedSuperAdmin();
