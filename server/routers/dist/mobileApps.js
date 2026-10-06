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
exports.mobileAppsRouter = void 0;
/**
 * Mobile Apps Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var featureViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('mobile:view');
var featureEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('mobile:edit');
exports.mobileAppsRouter = trpc_1.router({
    getIosAppMetrics: featureViewProcedure
        .input(zod_1.z.object({ buildVersion: zod_1.z.string().optional() }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, row, cfg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.mobileAppConfigs)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.mobileAppConfigs.platform, 'ios'), drizzle_orm_1.eq(schema_1.mobileAppConfigs.status, 'ACTIVE')))
                                .orderBy(drizzle_orm_1.desc(schema_1.mobileAppConfigs.createdAt))
                                .limit(1)];
                    case 2:
                        rows = _b.sent();
                        row = rows[0];
                        cfg = (row === null || row === void 0 ? void 0 : row.config) ? JSON.parse(row.config) : {};
                        return [2 /*return*/, {
                                appName: cfg.appName || 'Kiini iOS',
                                version: (row === null || row === void 0 ? void 0 : row.appVersion) || '0.0.0',
                                buildVersion: input.buildVersion || (row === null || row === void 0 ? void 0 : row.appVersion) || '0.0.0',
                                appStore: cfg.appStore || {},
                                deviceSupport: cfg.deviceSupport || {},
                                performance: cfg.performance || {},
                                features: cfg.features || {},
                                bugs: cfg.bugs || {}
                            }];
                }
            });
        });
    }),
    getAndroidAppMetrics: featureEditProcedure
        .input(zod_1.z.object({ buildVersion: zod_1.z.string().optional() }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, row, cfg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.mobileAppConfigs)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.mobileAppConfigs.platform, 'android'), drizzle_orm_1.eq(schema_1.mobileAppConfigs.status, 'ACTIVE')))
                                .orderBy(drizzle_orm_1.desc(schema_1.mobileAppConfigs.createdAt))
                                .limit(1)];
                    case 2:
                        rows = _b.sent();
                        row = rows[0];
                        cfg = (row === null || row === void 0 ? void 0 : row.config) ? JSON.parse(row.config) : {};
                        return [2 /*return*/, {
                                appName: cfg.appName || 'Kiini Android',
                                version: (row === null || row === void 0 ? void 0 : row.appVersion) || '0.0.0',
                                buildVersion: input.buildVersion || (row === null || row === void 0 ? void 0 : row.appVersion) || '0.0.0',
                                playStore: cfg.playStore || {},
                                deviceSupport: cfg.deviceSupport || {},
                                performance: cfg.performance || {},
                                targetSdk: cfg.targetSdk || 0,
                                features: cfg.features || {}
                            }];
                }
            });
        });
    }),
    manageOfflineSync: featureEditProcedure
        .input(zod_1.z.object({ syncStrategy: zod_1.z["enum"](["INCREMENTAL", "FULL", "SMART"]) }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.mobileAppConfigs).values({
                                id: id,
                                platform: 'sync',
                                config: JSON.stringify({ type: 'offline_sync', strategy: input.syncStrategy }),
                                status: 'ACTIVE',
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                syncConfigId: id,
                                strategy: input.syncStrategy,
                                status: 'ACTIVE',
                                lastSync: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                dataSize: 0,
                                cacheSize: 0,
                                syncFrequency: '5 minutes',
                                conflictResolution: 'LAST_WRITE_WINS',
                                compressionEnabled: true,
                                encryptionEnabled: true,
                                p2pSyncEnabled: false,
                                syncStats: { successfulSyncs: 0, failedSyncs: 0, retries: 0, averageSyncTime: 0 }
                            }];
                }
            });
        });
    }),
    configurePushNotifications: featureViewProcedure
        .input(zod_1.z.object({ platform: zod_1.z["enum"](["iOS", "ANDROID", "ALL"]) }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, row, cfg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.mobileAppConfigs)
                                .where(drizzle_orm_1.eq(schema_1.mobileAppConfigs.status, 'ACTIVE'))
                                .orderBy(drizzle_orm_1.desc(schema_1.mobileAppConfigs.createdAt))
                                .limit(1)];
                    case 2:
                        rows = _b.sent();
                        row = rows[0];
                        cfg = (row === null || row === void 0 ? void 0 : row.config) ? JSON.parse(row.config) : {};
                        return [2 /*return*/, {
                                platform: input.platform,
                                provider: cfg.provider || 'Firebase Cloud Messaging',
                                status: (row === null || row === void 0 ? void 0 : row.status) || 'INACTIVE',
                                notificationsSent: cfg.notificationsSent || 0,
                                deliveryRate: cfg.deliveryRate || 0,
                                engagementRate: cfg.engagementRate || 0,
                                openRate: cfg.openRate || 0,
                                topics: cfg.topics || 0,
                                subscribers: cfg.subscribers || 0,
                                segmentation: true,
                                scheduling: true,
                                automation: true,
                                analytics: cfg.analytics || {}
                            }];
                }
            });
        });
    }),
    getNativePlatformFeatures: featureViewProcedure
        .input(zod_1.z.object({ feature: zod_1.z.string().optional() }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, iosConfig, androidConfig, iosCfg, androidCfg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.mobileAppConfigs)
                                .where(drizzle_orm_1.eq(schema_1.mobileAppConfigs.status, 'ACTIVE'))
                                .limit(10)];
                    case 2:
                        rows = _b.sent();
                        iosConfig = rows.find(function (r) { return r.platform === 'ios'; });
                        androidConfig = rows.find(function (r) { return r.platform === 'android'; });
                        iosCfg = (iosConfig === null || iosConfig === void 0 ? void 0 : iosConfig.config) ? JSON.parse(iosConfig.config) : {};
                        androidCfg = (androidConfig === null || androidConfig === void 0 ? void 0 : androidConfig.config) ? JSON.parse(androidConfig.config) : {};
                        return [2 /*return*/, {
                                iosFeatures: iosCfg.nativeFeatures || {},
                                androidFeatures: androidCfg.nativeFeatures || {},
                                featureAdoption: []
                            }];
                }
            });
        });
    }),
    monitorAppHealth: featureEditProcedure
        .input(zod_1.z.object({ checkType: zod_1.z["enum"](["CRASH", "PERFORTMANCE", "BATTERY"]) }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.mobileAppConfigs).values({
                                id: id,
                                platform: 'health_check',
                                config: JSON.stringify({ checkType: input.checkType, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) }),
                                status: 'ACTIVE',
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                healthCheckId: id,
                                checkType: input.checkType,
                                status: 'HEALTHY',
                                ios: { crashes: 0, crashRate: 0, anrCount: 0, memoryUsage: 0 },
                                android: { crashes: 0, crashRate: 0, anrCount: 0, memoryUsage: 0 },
                                overall: { healthScore: 0, trends: 'STABLE', alerts: 0 }
                            }];
                }
            });
        });
    })
});
