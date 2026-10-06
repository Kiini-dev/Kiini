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
exports.cloudInfrastructureRouter = void 0;
/**
 * Cloud Infrastructure Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var featureViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('infra:view');
var featureEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('infra:edit');
exports.cloudInfrastructureRouter = trpc_1.router({
    manageContainerOrchestration: featureEditProcedure
        .input(zod_1.z.object({ orchestrator: zod_1.z["enum"](["DOCKER", "KUBERNETES", "DOCKER_SWARM"]), clusterSize: zod_1.z.number().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.containerDeployments).values({ id: id, name: input.orchestrator + ' Cluster', orchestrator: input.orchestrator, replicas: input.clusterSize || 5, status: 'RUNNING', config: JSON.stringify({ clusterSize: input.clusterSize || 5 }), createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { orchestrationId: id, orchestrator: input.orchestrator, clusterSize: input.clusterSize || 5, status: 'RUNNING', createdAt: new Date() }];
                }
            });
        });
    }),
    deployMicroservices: featureEditProcedure
        .input(zod_1.z.object({ serviceName: zod_1.z.string(), replicas: zod_1.z.number()["default"](3) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.containerDeployments).values({ id: id, name: input.serviceName, serviceName: input.serviceName, replicas: input.replicas, status: 'DEPLOYED', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { deploymentId: id, serviceName: input.serviceName, replicas: input.replicas, status: 'DEPLOYED', version: '1.0.0', createdAt: new Date() }];
                }
            });
        });
    }),
    configureServerlessComputing: featureEditProcedure
        .input(zod_1.z.object({ provider: zod_1.z["enum"](["AWS_LAMBDA", "AZURE_FUNCTIONS", "GCP_FUNCTIONS"]), runtime: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.containerDeployments).values({ id: id, name: input.provider, config: JSON.stringify({ runtime: input.runtime || 'NODE_18', type: 'serverless' }), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { serverlessConfigId: id, provider: input.provider, runtime: input.runtime || 'NODE_18', status: 'ACTIVE', createdAt: new Date() }];
                }
            });
        });
    }),
    listDeployments: featureViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.containerDeployments).orderBy(drizzle_orm_1.desc(schema_1.containerDeployments.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { deployments: rows.map(function (r) { return (__assign(__assign({}, r), { config: r.config ? JSON.parse(r.config) : null })); }), total: rows.length }];
                }
            });
        });
    }),
    deleteDeployment: featureEditProcedure
        .input(zod_1.z.object({ deploymentId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db["delete"](schema_1.containerDeployments).where(drizzle_orm_1.eq(schema_1.containerDeployments.id, input.deploymentId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, deletedId: input.deploymentId }];
                }
            });
        });
    })
});
