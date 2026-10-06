"use strict";
/**
 * Seed Pricing Plans
 * Creates standard pricing tiers with all features
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
var uuid_1 = require("uuid");
var PRICING_PLANS = [
    {
        planName: "Trial",
        planSlug: "trial",
        description: "Start free for 14 days. No credit card required.",
        tier: "free",
        monthlyPrice: 0,
        annualPrice: 0,
        monthlyAnnualDiscount: 0,
        maxUsers: 5,
        maxProjects: 3,
        maxStorageGB: 1,
        supportLevel: "email",
        features: {
            crm: false,
            projects: true,
            hr: false,
            payroll: false,
            leave: false,
            attendance: false,
            invoicing: true,
            payments: false,
            expenses: true,
            procurement: false,
            accounting: false,
            budgets: false,
            reports: false,
            ai_hub: false,
            communications: true,
            tickets: true,
            contracts: false,
            work_orders: false
        },
        displayOrder: 1
    },
    {
        planName: "Starter",
        planSlug: "starter",
        description: "Perfect for small teams and startups. Basic modules included.",
        tier: "starter",
        monthlyPrice: "4999.00",
        annualPrice: "49990.00",
        monthlyAnnualDiscount: 16.67,
        maxUsers: 10,
        maxProjects: 20,
        maxStorageGB: 10,
        supportLevel: "email",
        features: {
            crm: true,
            projects: true,
            hr: true,
            payroll: false,
            leave: true,
            attendance: true,
            invoicing: true,
            payments: true,
            expenses: true,
            procurement: false,
            accounting: true,
            budgets: true,
            reports: true,
            ai_hub: false,
            communications: true,
            tickets: true,
            contracts: false,
            work_orders: true
        },
        displayOrder: 2
    },
    {
        planName: "Professional",
        planSlug: "professional",
        description: "Advanced features for growing businesses. HR & Payroll included.",
        tier: "professional",
        monthlyPrice: "9999.00",
        annualPrice: "99990.00",
        monthlyAnnualDiscount: 16.67,
        maxUsers: 50,
        maxProjects: 100,
        maxStorageGB: 100,
        supportLevel: "priority",
        features: {
            crm: true,
            projects: true,
            hr: true,
            payroll: true,
            leave: true,
            attendance: true,
            invoicing: true,
            payments: true,
            expenses: true,
            procurement: true,
            accounting: true,
            budgets: true,
            reports: true,
            ai_hub: true,
            communications: true,
            tickets: true,
            contracts: true,
            work_orders: true
        },
        displayOrder: 3
    },
    {
        planName: "Enterprise",
        planSlug: "enterprise",
        description: "Full-featured suite with dedicated support and custom configurations.",
        tier: "enterprise",
        monthlyPrice: "24999.00",
        annualPrice: "249990.00",
        monthlyAnnualDiscount: 16.67,
        maxUsers: 500,
        maxProjects: 1000,
        maxStorageGB: 1000,
        supportLevel: "24/7_phone",
        features: {
            crm: true,
            projects: true,
            hr: true,
            payroll: true,
            leave: true,
            attendance: true,
            invoicing: true,
            payments: true,
            expenses: true,
            procurement: true,
            accounting: true,
            budgets: true,
            reports: true,
            ai_hub: true,
            communications: true,
            tickets: true,
            contracts: true,
            work_orders: true
        },
        displayOrder: 4
    },
];
function seedPricingPlans() {
    return __awaiter(this, void 0, void 0, function () {
        var database, _i, PRICING_PLANS_1, plan, existingPlan, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database) {
                        throw new Error("Database not available");
                    }
                    console.log("[SEED] Starting pricing plans seed...");
                    _i = 0, PRICING_PLANS_1 = PRICING_PLANS;
                    _a.label = 2;
                case 2:
                    if (!(_i < PRICING_PLANS_1.length)) return [3 /*break*/, 6];
                    plan = PRICING_PLANS_1[_i];
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.pricingPlans)
                            .where({ planSlug: plan.planSlug })
                            .limit(1)];
                case 3:
                    existingPlan = _a.sent();
                    if (existingPlan.length > 0) {
                        console.log("[SEED] Plan \"" + plan.planName + "\" already exists, skipping...");
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, database.insert(schema_1.pricingPlans).values({
                            id: uuid_1.v4(),
                            planName: plan.planName,
                            planSlug: plan.planSlug,
                            description: plan.description,
                            tier: plan.tier,
                            monthlyPrice: plan.monthlyPrice,
                            annualPrice: plan.annualPrice,
                            monthlyAnnualDiscount: plan.monthlyAnnualDiscount,
                            maxUsers: plan.maxUsers,
                            maxProjects: plan.maxProjects,
                            maxStorageGB: plan.maxStorageGB,
                            features: JSON.stringify(plan.features),
                            supportLevel: plan.supportLevel,
                            isActive: 1,
                            displayOrder: plan.displayOrder
                        })];
                case 4:
                    _a.sent();
                    console.log("[SEED] Created pricing plan: \"" + plan.planName + "\"");
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    console.log("[SEED] Pricing plans seed completed successfully!");
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("[SEED] Error seeding pricing plans:", error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run the seed
seedPricingPlans()["catch"](function (err) {
    console.error("Fatal error:", err);
    process.exit(1);
});
