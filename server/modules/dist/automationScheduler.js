"use strict";
/**
 * Scheduled Automation Execution Setup
 * Sets up cron jobs for HR and Accounting automations
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
exports.getAutomationStatus = exports.stopAllAutomations = exports.startAllAutomations = exports.initializeAccountingAutomations = exports.initializeHRAutomations = void 0;
var node_cron_1 = require("node-cron");
var hrAutomationModule = require("../modules/hrAutomation");
var accountingAutomationModule = require("../modules/accountingAutomation");
// Configuration for automation schedules
var AUTOMATION_SCHEDULES = {
    // HR Automations
    hrDaily: "0 8 * * *",
    hrMonthly: "0 0 1 * *",
    hrQuarterly: "0 0 1 */3 *",
    // Accounting Automations
    accountingDaily: "0 9 * * *",
    accountingMonthly: "0 0 2 * *"
};
/**
 * Initialize HR Automation Jobs
 */
function initializeHRAutomations(globalContext) {
    var _this = this;
    var jobs = new Map();
    var ctx = globalContext || { organizationId: "global" };
    // Daily HR automations (birthday reminders, absenteeism alerts, training reminders, payroll alerts)
    jobs.set("hrDaily", node_cron_1["default"].schedule(AUTOMATION_SCHEDULES.hrDaily, function () { return __awaiter(_this, void 0, void 0, function () {
        var reminders, absenteeism, training, payroll, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log("[Cron] Running daily HR automations...");
                    return [4 /*yield*/, hrAutomationModule.generateBirthdayReminders(ctx)];
                case 1:
                    reminders = _a.sent();
                    return [4 /*yield*/, hrAutomationModule.generateAbsenteeismAlerts(ctx)];
                case 2:
                    absenteeism = _a.sent();
                    return [4 /*yield*/, hrAutomationModule.generateTrainingReminders(ctx)];
                case 3:
                    training = _a.sent();
                    return [4 /*yield*/, hrAutomationModule.generatePayrollProcessingAlerts(ctx)];
                case 4:
                    payroll = _a.sent();
                    console.log("[Cron] Daily HR automations complete:", "Birthdays: " + reminders.length + ", Absenteeism: " + absenteeism.length + ", Training: " + training.length + ", Payroll: " + payroll.length);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error("[Cron] Daily HR automation error:", err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }));
    // Monthly HR automations (leave balance reset on Jan 1st, performance reviews quarterly)
    jobs.set("hrMonthly", node_cron_1["default"].schedule(AUTOMATION_SCHEDULES.hrMonthly, function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("[Cron] Running monthly HR automations...");
                    return [4 /*yield*/, hrAutomationModule.autoResetLeaveBalances(ctx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, hrAutomationModule.schedulePerformanceReviews(ctx)];
                case 2:
                    _a.sent();
                    console.log("[Cron] Monthly HR automations complete: Leave reset, Performance reviews scheduled");
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error("[Cron] Monthly HR automation error:", err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
    // Weekly sick leave approval automation
    jobs.set("hrWeekly", node_cron_1["default"].schedule("0 10 * * 1", function () { return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("[Cron] Running weekly HR automations...");
                    return [4 /*yield*/, hrAutomationModule.autoApproveSickLeave(ctx)];
                case 1:
                    _a.sent();
                    console.log("[Cron] Weekly HR automations complete: Sick leave auto-approved");
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error("[Cron] Weekly HR automation error:", err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }));
    return jobs;
}
exports.initializeHRAutomations = initializeHRAutomations;
/**
 * Initialize Accounting Automation Jobs
 */
function initializeAccountingAutomations(globalContext) {
    var _this = this;
    var jobs = new Map();
    var ctx = globalContext || { organizationId: "global" };
    // Daily accounting automations (invoice status updates, overdue alerts, tax compliance)
    jobs.set("accountingDaily", node_cron_1["default"].schedule(AUTOMATION_SCHEDULES.accountingDaily, function () { return __awaiter(_this, void 0, void 0, function () {
        var overdue, taxReminders, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log("[Cron] Running daily accounting automations...");
                    return [4 /*yield*/, accountingAutomationModule.autoUpdateInvoiceStatus(ctx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, accountingAutomationModule.generateOverdueInvoiceAlerts(ctx)];
                case 2:
                    overdue = _a.sent();
                    return [4 /*yield*/, accountingAutomationModule.generateTaxComplianceReminder(ctx)];
                case 3:
                    taxReminders = _a.sent();
                    console.log("[Cron] Daily accounting automations complete:", "Invoice updates, Overdue: " + overdue.length + ", Tax reminders: " + taxReminders.length);
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error("[Cron] Daily accounting automation error:", err_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }));
    // Monthly accounting automations (journal entries, expense reconciliation, revenue analysis)
    jobs.set("accountingMonthly", node_cron_1["default"].schedule(AUTOMATION_SCHEDULES.accountingMonthly, function () { return __awaiter(_this, void 0, void 0, function () {
        var expenses, revenue, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log("[Cron] Running monthly accounting automations...");
                    return [4 /*yield*/, accountingAutomationModule.autoCreateJournalEntries(ctx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, accountingAutomationModule.generateExpenseReconciliationReport(ctx)];
                case 2:
                    expenses = _a.sent();
                    return [4 /*yield*/, accountingAutomationModule.generateRevenueAnalysisSummary(ctx)];
                case 3:
                    revenue = _a.sent();
                    console.log("[Cron] Monthly accounting automations complete:", "Journal entries created, Expenses: " + expenses.type + ", Revenue: " + revenue.invoiceCount + " invoices");
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    console.error("[Cron] Monthly accounting automation error:", err_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }));
    // Weekly bank reconciliation status check
    jobs.set("accountingWeekly", node_cron_1["default"].schedule("0 14 * * 1", function () { return __awaiter(_this, void 0, void 0, function () {
        var reconciliation, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("[Cron] Running weekly accounting automations...");
                    return [4 /*yield*/, accountingAutomationModule.checkBankReconciliationStatus(ctx)];
                case 1:
                    reconciliation = _a.sent();
                    console.log("[Cron] Weekly accounting automations complete: Bank reconciliation check (" + reconciliation.length + " pending)");
                    return [3 /*break*/, 3];
                case 2:
                    err_6 = _a.sent();
                    console.error("[Cron] Weekly accounting automation error:", err_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }));
    return jobs;
}
exports.initializeAccountingAutomations = initializeAccountingAutomations;
/**
 * Start All Automations
 */
function startAllAutomations(globalContext) {
    console.log("[Automation Scheduler] Initializing HR and Accounting automations...");
    var hrJobs = initializeHRAutomations(globalContext);
    var accountingJobs = initializeAccountingAutomations(globalContext);
    console.log("[Automation Scheduler] Started " + hrJobs.size + " HR automation jobs");
    console.log("[Automation Scheduler] Started " + accountingJobs.size + " accounting automation jobs");
    return { hrJobs: hrJobs, accountingJobs: accountingJobs };
}
exports.startAllAutomations = startAllAutomations;
/**
 * Stop All Automations
 */
function stopAllAutomations(hrJobs, accountingJobs) {
    console.log("[Automation Scheduler] Stopping all automations...");
    hrJobs.forEach(function (job) {
        if (job.stop)
            job.stop();
    });
    accountingJobs.forEach(function (job) {
        if (job.stop)
            job.stop();
    });
    console.log("[Automation Scheduler] All automations stopped");
}
exports.stopAllAutomations = stopAllAutomations;
/**
 * Get Automation Status
 */
function getAutomationStatus(hrJobs, accountingJobs) {
    return {
        hrJobs: Array.from(hrJobs.keys()),
        accountingJobs: Array.from(accountingJobs.keys()),
        totalJobs: hrJobs.size + accountingJobs.size
    };
}
exports.getAutomationStatus = getAutomationStatus;
exports["default"] = {
    initializeHRAutomations: initializeHRAutomations,
    initializeAccountingAutomations: initializeAccountingAutomations,
    startAllAutomations: startAllAutomations,
    stopAllAutomations: stopAllAutomations,
    getAutomationStatus: getAutomationStatus
};
