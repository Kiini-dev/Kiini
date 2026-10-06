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
exports.mobileResponsiveRouter = void 0;
/**
 * Mobile Responsive Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.mobileResponsiveRouter = trpc_1.router({
    registerDevice: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ deviceType: zod_1.z["enum"](['phone', 'tablet', 'desktop']), platform: zod_1.z.string(), pushToken: zod_1.z.string().optional(), appVersion: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.registeredDevices).values({ id: id, deviceId: uuid_1.v4(), deviceType: input.deviceType, platform: input.platform, pushToken: input.pushToken || null, appVersion: input.appVersion || null, userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || null, createdBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system' })];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, { success: true, deviceId: id, deviceType: input.deviceType, platform: input.platform, registeredAt: new Date() }];
                }
            });
        });
    }),
    getResponsiveConfig: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ deviceType: zod_1.z["enum"](['phone', 'tablet', 'desktop']).optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var breakpoints;
            return __generator(this, function (_b) {
                breakpoints = { phone: { maxWidth: 768, columns: 1, fontSize: 14 }, tablet: { maxWidth: 1024, columns: 2, fontSize: 15 }, desktop: { maxWidth: 1920, columns: 3, fontSize: 16 } };
                if (input.deviceType)
                    return [2 /*return*/, { config: breakpoints[input.deviceType], deviceType: input.deviceType }];
                return [2 /*return*/, { configs: breakpoints }];
            });
        });
    }),
    listDevices: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.registeredDevices).orderBy(drizzle_orm_1.desc(schema_1.registeredDevices.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { devices: rows, total: rows.length }];
                }
            });
        });
    }),
    revokeDevice: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ deviceId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db["delete"](schema_1.registeredDevices).where(drizzle_orm_1.eq(schema_1.registeredDevices.id, input.deviceId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, deviceId: input.deviceId, status: 'revoked' }];
                }
            });
        });
    })
});
