"use strict";
/**
 * Default User Seed Script
 * Creates the default user during app building/initialization
 * This ensures users can log in immediately after drizzle migrations
 *
 * Run with: npx tsx scripts/seed-default-user.ts
 * Or via npm script: npm run seed:default-user
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
var bcryptjs_1 = require("bcryptjs");
// Default user credentials - customize as needed
var DEFAULT_USER = {
    email: process.env.DEFAULT_USER_EMAIL || "dev@kiini.africa",
    password: process.env.DEFAULT_USER_PASSWORD || "Kiinis@@21",
    name: process.env.DEFAULT_USER_NAME || "Kiini Admin",
    role: "super_admin"
};
// Default organization
var DEFAULT_ORG = {
    id: "org_default_" + Date.now(),
    name: "Default Organization",
    slug: "default-org",
    plan: "starter",
    maxUsers: 10,
    currency: "KES",
    timezone: "Africa/Nairobi"
};
function seedDefaultUser() {
    return __awaiter(this, void 0, void 0, function () {
        var db, existingOrgs, orgId, existingUser, hashedPassword, userId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    console.log("🌱 Seeding default user...\n");
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("❌ Failed to connect to database");
                        process.exit(1);
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.organizations)
                            .limit(1)];
                case 2:
                    existingOrgs = _a.sent();
                    orgId = DEFAULT_ORG.id;
                    if (!(existingOrgs.length === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.insert(schema_1.organizations).values({
                            id: DEFAULT_ORG.id,
                            name: DEFAULT_ORG.name,
                            slug: DEFAULT_ORG.slug,
                            plan: DEFAULT_ORG.plan,
                            maxUsers: DEFAULT_ORG.maxUsers,
                            currency: DEFAULT_ORG.currency,
                            timezone: DEFAULT_ORG.timezone,
                            isActive: true,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 3:
                    _a.sent();
                    console.log("\u2705 Created default organization: " + DEFAULT_ORG.name);
                    return [3 /*break*/, 5];
                case 4:
                    orgId = existingOrgs[0].id;
                    console.log("\u23ED\uFE0F  Using existing organization: " + existingOrgs[0].name);
                    _a.label = 5;
                case 5: return [4 /*yield*/, db
                        .select()
                        .from(schema_1.users)
                        .where(drizzle_orm_1.eq(schema_1.users.email, DEFAULT_USER.email))
                        .limit(1)];
                case 6:
                    existingUser = _a.sent();
                    if (existingUser.length > 0) {
                        console.log("\u23ED\uFE0F  Default user " + DEFAULT_USER.email + " already exists");
                        console.log("\n✅ Default user setup complete!");
                        console.log("\n\uD83D\uDCDD Login credentials:");
                        console.log("   Email: " + DEFAULT_USER.email);
                        console.log("   Password: " + DEFAULT_USER.password);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, bcryptjs_1["default"].hash(DEFAULT_USER.password, 10)];
                case 7:
                    hashedPassword = _a.sent();
                    userId = "user_default_" + Date.now();
                    return [4 /*yield*/, db_1.upsertUser({
                            id: userId,
                            email: DEFAULT_USER.email,
                            name: DEFAULT_USER.name,
                            passwordHash: hashedPassword,
                            role: DEFAULT_USER.role,
                            isActive: 1,
                            loginMethod: "local",
                            lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            requiresPasswordChange: 0
                        })];
                case 8:
                    _a.sent();
                    console.log("\u2705 Created default user: " + DEFAULT_USER.email);
                    console.log("   Role: " + DEFAULT_USER.role);
                    console.log("   Organization: " + DEFAULT_ORG.name);
                    console.log("\n✅ Default user setup complete!");
                    console.log("\n\uD83D\uDCDD Login credentials:");
                    console.log("   Email: " + DEFAULT_USER.email);
                    console.log("   Password: " + DEFAULT_USER.password);
                    console.log("\n\u26A0\uFE0F  IMPORTANT: Change this password immediately in production!\n");
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("❌ Error seeding default user:", error_1 instanceof Error ? error_1.message : error_1);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Run the seed function
seedDefaultUser().then(function () {
    process.exit(0);
})["catch"](function (error) {
    console.error("Fatal error:", error);
    process.exit(1);
});
