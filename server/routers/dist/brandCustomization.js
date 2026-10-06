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
exports.brandCustomizationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("settings:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("settings:edit");
// Zod schema for brand configuration
var BrandConfigSchema = zod_1.z.object({
    primaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    secondaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    accentColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    darkPrimaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    darkSecondaryColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    darkAccentColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    lightGray: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    darkGray: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    lightText: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    darkText: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    fontFamily: zod_1.z.string().min(1),
    headingFontSize: zod_1.z.string().regex(/^\d+$/, "Must be a number"),
    bodyFontSize: zod_1.z.string().regex(/^\d+$/, "Must be a number"),
    buttonBorderRadius: zod_1.z.string().regex(/^\d+$/, "Must be a number"),
    buttonPadding: zod_1.z.string().regex(/^\d+$/, "Must be a number"),
    buttonFontWeight: zod_1.z.string().regex(/^\d+$/, "Must be a number")
});
var DEFAULT_BRAND_CONFIG = {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    darkPrimaryColor: "#60A5FA",
    darkSecondaryColor: "#34D399",
    darkAccentColor: "#FBBF24",
    lightGray: "#F3F4F6",
    darkGray: "#374151",
    lightText: "#FFFFFF",
    darkText: "#1F2937",
    fontFamily: "Inter",
    headingFontSize: "32",
    bodyFontSize: "14",
    buttonBorderRadius: "8",
    buttonPadding: "12",
    buttonFontWeight: "500"
};
exports.brandCustomizationRouter = trpc_1.router({
    /**
     * Get current brand customization settings
     */
    getConfig: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, setting, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, DEFAULT_BRAND_CONFIG];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "brand"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 2:
                        setting = _b.sent();
                        if (setting.length === 0)
                            return [2 /*return*/, DEFAULT_BRAND_CONFIG];
                        if (setting[0].dataType === "json" && setting[0].value) {
                            return [2 /*return*/, JSON.parse(setting[0].value)];
                        }
                        return [2 /*return*/, DEFAULT_BRAND_CONFIG];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching brand config:", error_1);
                        return [2 /*return*/, DEFAULT_BRAND_CONFIG];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Save brand customization settings (admin/super_admin only)
     */
    saveConfig: writeProcedure
        .input(BrandConfigSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existingSetting, settingId, now, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Check if user is admin or super_admin
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Only admins can modify brand settings"
                            });
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "brand"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 3:
                        existingSetting = _b.sent();
                        settingId = uuid_1.v4();
                        now = new Date().toISOString().slice(0, 19).replace("T", " ");
                        if (!(existingSetting.length === 0)) return [3 /*break*/, 5];
                        // Create new setting
                        return [4 /*yield*/, db.insert(schema_1.systemSettings).values({
                                id: settingId,
                                category: "brand",
                                key: "customization",
                                value: JSON.stringify(input),
                                dataType: "json",
                                description: "Brand customization settings for the application",
                                isPublic: 1,
                                updatedBy: ctx.user.id,
                                updatedAt: now
                            })];
                    case 4:
                        // Create new setting
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: 
                    // Update existing setting
                    return [4 /*yield*/, db
                            .update(schema_1.systemSettings)
                            .set({
                            value: JSON.stringify(input),
                            updatedBy: ctx.user.id,
                            updatedAt: now
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "brand"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))];
                    case 6:
                        // Update existing setting
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            config: input,
                            message: "Brand settings saved successfully"
                        }];
                    case 8:
                        error_2 = _b.sent();
                        console.error("Error saving brand config:", error_2);
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to save brand settings"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Reset brand settings to default
     */
    resetToDefault: writeProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, settingId, now, existingSetting, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Check if user is admin or super_admin
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Only admins can reset brand settings"
                            });
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        settingId = uuid_1.v4();
                        now = new Date().toISOString().slice(0, 19).replace("T", " ");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "brand"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 3:
                        existingSetting = _b.sent();
                        if (!(existingSetting.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.insert(schema_1.systemSettings).values({
                                id: settingId,
                                category: "brand",
                                key: "customization",
                                value: JSON.stringify(DEFAULT_BRAND_CONFIG),
                                dataType: "json",
                                description: "Brand customization settings for the application",
                                isPublic: 1,
                                updatedBy: ctx.user.id,
                                updatedAt: now
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, db
                            .update(schema_1.systemSettings)
                            .set({
                            value: JSON.stringify(DEFAULT_BRAND_CONFIG),
                            updatedBy: ctx.user.id,
                            updatedAt: now
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "brand"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            config: DEFAULT_BRAND_CONFIG,
                            message: "Brand settings reset to default"
                        }];
                    case 8:
                        error_3 = _b.sent();
                        console.error("Error resetting brand config:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to reset brand settings"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    })
});
