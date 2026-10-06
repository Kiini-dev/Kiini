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
var vitest_1 = require("vitest");
vitest_1.vi.mock('../../db', function () {
    return {
        getOrganizationSettings: vitest_1.vi.fn(),
        updateOrganizationSettings: vitest_1.vi.fn(),
        createSmsTemplate: vitest_1.vi.fn(),
        getSmsTemplate: vitest_1.vi.fn(),
        getSmsTemplates: vitest_1.vi.fn(),
        updateSmsTemplate: vitest_1.vi.fn(),
        deleteSmsTemplate: vitest_1.vi.fn(),
        createSmsAutomationRule: vitest_1.vi.fn(),
        getSmsAutomationRules: vitest_1.vi.fn(),
        getDb: vitest_1.vi.fn()
    };
});
vitest_1.vi.mock('../../services/smsService', function () { return ({
    queueSms: vitest_1.vi.fn()
}); });
vitest_1.vi.mock('../../middleware/enhancedRbac', function (importOriginal) { return __awaiter(void 0, void 0, void 0, function () {
    var actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, importOriginal()];
            case 1:
                actual = _a.sent();
                return [2 /*return*/, __assign(__assign({}, actual), { resolveUserPermission: vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, true];
                        }); }); }) })];
        }
    });
}); });
var db = require("../../db");
var smsService = require("../../services/smsService");
vitest_1.describe('SMS Automation Router persistence', function () {
    var mockDb;
    var smsAutomationRouter;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.clearAllMocks();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../smsAutomation'); })];
                case 1:
                    module = _a.sent();
                    smsAutomationRouter = module.smsAutomationRouter;
                    mockDb = {
                        insert: vitest_1.vi.fn().mockReturnValue({
                            values: vitest_1.vi.fn().mockResolvedValue({ id: 'test-id' })
                        }),
                        select: vitest_1.vi.fn().mockReturnValue({
                            from: vitest_1.vi.fn().mockReturnValue({
                                where: vitest_1.vi.fn().mockReturnValue({
                                    limit: vitest_1.vi.fn().mockResolvedValue([])
                                }),
                                orderBy: vitest_1.vi.fn().mockReturnValue({
                                    limit: vitest_1.vi.fn().mockReturnValue({
                                        offset: vitest_1.vi.fn().mockResolvedValue([])
                                    })
                                })
                            })
                        }),
                        update: vitest_1.vi.fn().mockReturnValue({
                            set: vitest_1.vi.fn().mockReturnValue({
                                where: vitest_1.vi.fn().mockResolvedValue({})
                            })
                        }),
                        "delete": vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockResolvedValue({})
                        })
                    };
                    db.getDb.mockResolvedValue(mockDb);
                    smsService.queueSms.mockResolvedValue({ queueId: 'sms-queue-1', success: true });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.afterEach(function () {
        vitest_1.vi.restoreAllMocks();
    });
    vitest_1.it('creates SMS template and persists to database', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] }
                    });
                    return [4 /*yield*/, caller.createTemplate({
                            name: 'Invoice Notification',
                            content: 'Your invoice {{invoiceId}} is ready',
                            category: 'invoice_notification',
                            variables: ['invoiceId', 'amount'],
                            isActive: true
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.template.name).toBe('Invoice Notification');
                    vitest_1.expect(response.template.content).toContain('{{invoiceId}}');
                    vitest_1.expect(mockDb.insert).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('fetches SMS templates with pagination', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTemplates, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTemplates = [
                        { id: 'tpl1', name: 'Template 1', category: 'invoice_notification', organizationId: 'org1' },
                        { id: 'tpl2', name: 'Template 2', category: 'payment_reminder', organizationId: 'org1' },
                    ];
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([{ total: 2 }])
                            })
                        })
                    });
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                orderBy: vitest_1.vi.fn().mockReturnValue({
                                    limit: vitest_1.vi.fn().mockReturnValue({
                                        offset: vitest_1.vi.fn().mockResolvedValue(mockTemplates)
                                    })
                                })
                            })
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] }
                    });
                    return [4 /*yield*/, caller.getTemplates({ category: 'invoice_notification', limit: 20, offset: 0 })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.total).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('sends SMS with template variable replacement', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTemplate, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTemplate = {
                        id: 'tpl1',
                        content: 'Your invoice {{invoiceId}} for {{amount}} is due',
                        variables: ['invoiceId', 'amount']
                    };
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([mockTemplate])
                            })
                        })
                    });
                    mockDb.update.mockReturnValueOnce({
                        set: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockResolvedValue({})
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write', 'communications:read'] }
                    });
                    return [4 /*yield*/, caller.sendSMS({
                            toNumber: '+254712345678',
                            templateId: 'tpl1',
                            variables: { invoiceId: 'INV-001', amount: '5000' }
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.sms.content).toContain('INV-001');
                    vitest_1.expect(response.sms.content).toContain('5000');
                    vitest_1.expect(smsService.queueSms).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('queues bulk SMS with template rendering', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTemplate, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTemplate = {
                        id: 'tpl1',
                        content: 'Hello {{name}}, your balance is {{balance}}'
                    };
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([mockTemplate])
                            })
                        })
                    });
                    mockDb.update.mockReturnValueOnce({
                        set: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockResolvedValue({})
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] }
                    });
                    return [4 /*yield*/, caller.sendBulkSMS({
                            templateId: 'tpl1',
                            recipients: [
                                { toNumber: '+254712345678', variables: { name: 'Alice', balance: '500' } },
                                { toNumber: '+254787654321', variables: { name: 'Bob', balance: '750' } },
                            ]
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.recipientCount).toBe(2);
                    vitest_1.expect(mockDb.insert).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('schedules SMS with template for later delivery', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTemplate, caller, scheduleTime, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockTemplate = {
                        id: 'tpl1',
                        content: 'Reminder: {{eventName}} at {{time}}'
                    };
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([mockTemplate])
                            })
                        })
                    });
                    mockDb.update.mockReturnValueOnce({
                        set: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockResolvedValue({})
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] }
                    });
                    scheduleTime = new Date(Date.now() + 3600000).toISOString();
                    return [4 /*yield*/, caller.scheduleSMS({
                            toNumber: '+254712345678',
                            templateId: 'tpl1',
                            variables: { eventName: 'Team Meeting', time: '2:00 PM' },
                            scheduleTime: scheduleTime
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.schedule.nextRetryAt).toBe(scheduleTime);
                    vitest_1.expect(mockDb.insert).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('fetches SMS delivery status', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockMessage, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockMessage = {
                        id: 'sms-1',
                        status: 'delivered',
                        sentAt: '2026-05-15 10:00:00',
                        deliveredAt: '2026-05-15 10:05:00',
                        failureReason: null
                    };
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([mockMessage])
                            })
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] }
                    });
                    return [4 /*yield*/, caller.getDeliveryStatus({ smsId: 'sms-1' })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.status.status).toBe('delivered');
                    vitest_1.expect(response.status.deliveredAt).toBe('2026-05-15 10:05:00');
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('creates SMS automation rule and stores to database', function () { return __awaiter(void 0, void 0, void 0, function () {
        var caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] }
                    });
                    return [4 /*yield*/, caller.createAutomationRule({
                            name: 'Invoice Reminder',
                            trigger: 'invoice_created',
                            templateId: 'tpl1',
                            conditions: { daysUntilDue: 7 },
                            isActive: true
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.rule.name).toBe('Invoice Reminder');
                    vitest_1.expect(response.rule.trigger).toBe('invoice_created');
                    vitest_1.expect(mockDb.insert).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('fetches SMS automation rules for organization', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockRules, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockRules = [
                        { id: 'rule1', name: 'Rule 1', trigger: 'invoice_created', organizationId: 'org1' },
                        { id: 'rule2', name: 'Rule 2', trigger: 'payment_received', organizationId: 'org1' },
                    ];
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockResolvedValue(mockRules)
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] }
                    });
                    return [4 /*yield*/, caller.getAutomationRules()];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.rules.length).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('fetches SMS history with filtering', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockHistory, caller, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockHistory = [
                        { id: 'sms1', phoneNumber: '+254712345678', status: 'delivered', createdAt: '2026-05-15' },
                        { id: 'sms2', phoneNumber: '+254787654321', status: 'pending', createdAt: '2026-05-15' },
                    ];
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                limit: vitest_1.vi.fn().mockResolvedValue([{ total: 2 }])
                            })
                        })
                    });
                    mockDb.select.mockReturnValueOnce({
                        from: vitest_1.vi.fn().mockReturnValue({
                            where: vitest_1.vi.fn().mockReturnValue({
                                orderBy: vitest_1.vi.fn().mockReturnValue({
                                    limit: vitest_1.vi.fn().mockReturnValue({
                                        offset: vitest_1.vi.fn().mockResolvedValue(mockHistory)
                                    })
                                })
                            })
                        })
                    });
                    caller = smsAutomationRouter.createCaller({
                        user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] }
                    });
                    return [4 /*yield*/, caller.getHistory({
                            status: 'delivered',
                            limit: 20,
                            offset: 0
                        })];
                case 1:
                    response = _a.sent();
                    vitest_1.expect(response.success).toBe(true);
                    vitest_1.expect(response.total).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
});
