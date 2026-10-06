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
var vitest_1 = require("vitest");
var tickets_1 = require("../tickets");
var schema_extended_1 = require("../../../drizzle/schema-extended");
// stub DB similar to other integration tests
var fakeDb = {
    select: function () { return ({ from: function () { return ({ where: function () { return ({ limit: function (n) { return Promise.resolve([]); } }); } }); } }); },
    insert: function () { return ({ values: function () { return Promise.resolve(); } }); },
    update: function () { return ({ set: function () { return ({ where: function () { return Promise.resolve(); } }); } }); },
    "delete": function () { return ({ where: function () { return Promise.resolve(); } }); },
    logActivity: vitest_1.vi.fn()
};
// helper to simulate an existing ticket record when update is invoked
function ensureTicketExists() {
    fakeDb.select = function () { return ({
        from: function () { return ({
            where: function () { return ({
                limit: function (n) { return Promise.resolve([{ id: 't1' }]); }
            }); }
        }); }
    }); };
}
vitest_1.vi.mock('../../db', function () { return ({
    getDb: vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, fakeDb];
    }); }); }),
    logActivity: vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve()];
    }); }); })
}); });
vitest_1.describe('Tickets Router basic checks', function () {
    vitest_1.it('should expose create and comment procedures', function () {
        vitest_1.expect(typeof tickets_1.ticketsRouter.create).toBe('function');
        vitest_1.expect(typeof tickets_1.ticketsRouter.addComment).toBe('function');
        vitest_1.expect(typeof tickets_1.ticketsRouter.update).toBe('function');
        vitest_1.expect(typeof tickets_1.ticketsRouter.list).toBe('function');
    });
    vitest_1.it('create should return id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.create({ clientId: 'c1', title: 'foo' })];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toHaveProperty('id');
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('update with minimal fields succeeds', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ensureTicketExists();
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.update({ id: 't1', title: 'new' })];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toEqual({ success: true });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('addComment should return id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.addComment({ ticketId: 't1', body: 'hello' })];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toHaveProperty('id');
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('createTask should return id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.createTask({ ticketId: 't1', serviceType: 'repair' })];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toHaveProperty('id');
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('delete should succeed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller["delete"]('t1')];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toEqual({ success: true });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('getById returns ticket with comments/tasks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // adjust fakeDb to return sample ticket, comment, task
                    fakeDb.select = function () { return ({
                        from: function (table) { return ({
                            where: function (cond) {
                                if (table === schema_extended_1.tickets) {
                                    return { limit: function (n) { return Promise.resolve([{ id: 't1', title: 'hi' }]); } };
                                }
                                if (table === schema_extended_1.ticketComments) {
                                    return Promise.resolve([{ id: 'c1', ticketId: 't1', body: 'a' }]);
                                }
                                if (table === schema_extended_1.ticketTasks) {
                                    return Promise.resolve([{ id: 'k1', ticketId: 't1', serviceType: 'foo' }]);
                                }
                                return Promise.resolve([]);
                            }
                        }); }
                    }); };
                    caller = tickets_1.ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.getById('t1')];
                case 1:
                    res = _a.sent();
                    vitest_1.expect(res).toMatchObject({ id: 't1', comments: [{ id: 'c1' }], tasks: [{ id: 'k1' }] });
                    return [2 /*return*/];
            }
        });
    }); });
});
