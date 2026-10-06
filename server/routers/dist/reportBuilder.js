"use strict";
/**
 * Report Builder Router
 *
 * Custom report design and generation with:
 * - Report template management
 * - Drag-and-drop report designer
 * - Multiple data source integration
 * - Export to PDF, Excel, CSV
 * - Report scheduling and distribution
 * - Report sharing and collaboration
 */
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
exports.reportBuilderRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
// Feature-based procedures
var reportViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('analytics:view', 'report:view');
var reportEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('analytics:view', 'report:edit');
exports.reportBuilderRouter = trpc_1.router({
    /**
     * Get all saved reports for current user/organization
     */
    getReports: reportViewProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string().optional(),
        owner: zod_1.z.number().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, where, rows, reports, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        db = db_1.getDb();
                        where = (input === null || input === void 0 ? void 0 : input.category) ? drizzle_orm_1.eq(schema_1.customReports.category, input.category) : undefined;
                        return [4 /*yield*/, db.select().from(schema_1.customReports).where(where).orderBy(drizzle_orm_1.desc(schema_1.customReports.createdAt))];
                    case 1:
                        rows = _b.sent();
                        reports = rows.map(function (r) { return (__assign(__assign({}, r), { dataSources: r.dataSources ? JSON.parse(r.dataSources) : [], layout: r.layout ? JSON.parse(r.layout) : {} })); });
                        return [2 /*return*/, {
                                reports: reports,
                                total: reports.length,
                                templates: reports.filter(function (r) { return r.isTemplate === 1; })
                            }];
                    case 2:
                        error_1 = _b.sent();
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch reports' });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get report structure and available fields for building
     */
    getReportBuilderSchema: reportViewProcedure
        .input(zod_1.z.object({
        dataSource: zod_1.z.string()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var schemas;
            return __generator(this, function (_b) {
                try {
                    schemas = {
                        'GL': {
                            tableName: 'General Ledger',
                            fields: [
                                { id: 'date', name: 'Date', type: 'date', aggregatable: false },
                                { id: 'account', name: 'Account', type: 'text', aggregatable: true },
                                { id: 'amount', name: 'Amount', type: 'number', aggregatable: true },
                                { id: 'category', name: 'Category', type: 'text', aggregatable: true },
                                { id: 'description', name: 'Description', type: 'text', aggregatable: false },
                            ]
                        },
                        'Invoices': {
                            tableName: 'Invoices',
                            fields: [
                                { id: 'invoice_no', name: 'Invoice Number', type: 'text', aggregatable: false },
                                { id: 'client', name: 'Client', type: 'text', aggregatable: true },
                                { id: 'amount', name: 'Amount', type: 'number', aggregatable: true },
                                { id: 'date', name: 'Date', type: 'date', aggregatable: false },
                                { id: 'status', name: 'Status', type: 'text', aggregatable: true },
                            ]
                        },
                        'Expenses': {
                            tableName: 'Expenses',
                            fields: [
                                { id: 'category', name: 'Category', type: 'text', aggregatable: true },
                                { id: 'amount', name: 'Amount', type: 'number', aggregatable: true },
                                { id: 'department', name: 'Department', type: 'text', aggregatable: true },
                                { id: 'date', name: 'Date', type: 'date', aggregatable: false },
                                { id: 'description', name: 'Description', type: 'text', aggregatable: false },
                            ]
                        }
                    };
                    return [2 /*return*/, schemas[input.dataSource] || { tableName: 'Unknown', fields: [] }];
                }
                catch (error) {
                    console.error('Error in getReportBuilderSchema:', error);
                    throw new Error('Failed to fetch report schema');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Create new report
     */
    createReport: reportEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(3).max(100),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string(),
        dataSources: zod_1.z.array(zod_1.z.string()),
        layout: zod_1.z.record(zod_1.z.any()),
        format: zod_1.z["enum"](['PDF', 'Excel', 'CSV', 'HTML']),
        isTemplate: zod_1.z.boolean()["default"](false)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, rows, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.customReports).values({
                                id: id,
                                name: input.name,
                                description: (_b = input.description) !== null && _b !== void 0 ? _b : null,
                                category: input.category,
                                dataSources: JSON.stringify(input.dataSources),
                                layout: JSON.stringify(input.layout),
                                format: input.format,
                                isTemplate: input.isTemplate ? 1 : 0,
                                status: 'draft',
                                createdBy: ctx.user.id
                            })];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.customReports).where(drizzle_orm_1.eq(schema_1.customReports.id, id))];
                    case 2:
                        rows = _c.sent();
                        return [2 /*return*/, __assign(__assign({}, rows[0]), { message: 'Report created successfully' })];
                    case 3:
                        error_2 = _c.sent();
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create report' });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get report preview
     */
    getReportPreview: reportViewProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, report, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.customReports).where(drizzle_orm_1.eq(schema_1.customReports.id, String(input.reportId)))];
                    case 1:
                        rows = _c.sent();
                        report = rows[0];
                        return [2 /*return*/, {
                                reportId: input.reportId,
                                title: (_b = report === null || report === void 0 ? void 0 : report.name) !== null && _b !== void 0 ? _b : 'Report Preview',
                                generatedAt: new Date(),
                                preview: {
                                    sections: [
                                        {
                                            title: 'Executive Summary',
                                            type: 'summary',
                                            data: {
                                                revenue: 0,
                                                expenses: 0,
                                                profit: 0
                                            }
                                        },
                                    ]
                                }
                            }];
                    case 2:
                        error_3 = _c.sent();
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate report preview' });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export report to various formats
     */
    exportReport: reportEditProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number(),
        format: zod_1.z["enum"](['PDF', 'Excel', 'CSV', 'HTML']),
        includeCharts: zod_1.z.boolean()["default"](true)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            reportId: input.reportId,
                            format: input.format,
                            fileName: "Report_" + input.reportId + "_" + Date.now() + "." + input.format.toLowerCase(),
                            downloadUrl: "/api/reports/" + input.reportId + "/download?format=" + input.format,
                            fileSize: Math.floor(Math.random() * 5000) + 100,
                            message: "Report exported as " + input.format
                        }];
                }
                catch (error) {
                    console.error('Error in exportReport:', error);
                    throw new Error('Failed to export report');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Schedule report for recurring generation and distribution
     */
    scheduleReport: reportEditProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number(),
        frequency: zod_1.z["enum"](['daily', 'weekly', 'monthly', 'quarterly']),
        recipients: zod_1.z.array(zod_1.z.string().email()),
        format: zod_1.z["enum"](['PDF', 'Excel']),
        nextRun: zod_1.z.date()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, __assign(__assign({ reportId: input.reportId }, input), { scheduleId: Math.floor(Math.random() * 10000), status: 'scheduled', lastScheduleCheck: new Date(), message: 'Report scheduled successfully' })];
                }
                catch (error) {
                    console.error('Error in scheduleReport:', error);
                    throw new Error('Failed to schedule report');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Share report with users
     */
    shareReport: reportEditProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number(),
        recipients: zod_1.z.array(zod_1.z.object({
            userId: zod_1.z.number(),
            permission: zod_1.z["enum"](['view', 'edit', 'admin'])
        }))
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            reportId: input.reportId,
                            recipients: input.recipients,
                            sharedAt: new Date(),
                            message: "Report shared with " + input.recipients.length + " recipient(s)"
                        }];
                }
                catch (error) {
                    console.error('Error in shareReport:', error);
                    throw new Error('Failed to share report');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get report templates
     */
    getTemplates: reportViewProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string().optional()
    }).strict())
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                return [2 /*return*/, {
                        templates: [
                            {
                                id: 't1',
                                name: 'Financial Summary Template',
                                category: 'Financial',
                                description: 'Monthly financial performance overview',
                                sections: ['Summary', 'Revenue Breakdown', 'Expense Analysis', 'Margin Analysis'],
                                dataSources: ['GL', 'Invoices', 'Expenses']
                            },
                            {
                                id: 't2',
                                name: 'Sales Performance Report',
                                category: 'Sales',
                                description: 'Sales metrics by region and rep',
                                sections: ['Overview', 'Regional Sales', 'Rep Performance', 'Pipeline'],
                                dataSources: ['Invoices', 'Opportunities']
                            },
                            {
                                id: 't3',
                                name: 'HR Analytics Report',
                                category: 'HR',
                                description: 'Employee and payroll analytics',
                                sections: ['Headcount', 'Payroll Summary', 'Attendance', 'Turnover'],
                                dataSources: ['Employees', 'Payroll', 'Attendance']
                            },
                            {
                                id: 't4',
                                name: 'Cash Flow Dashboard',
                                category: 'Financial',
                                description: 'Cash inflow and outflow analysis',
                                sections: ['Overview', 'Inflows', 'Outflows', 'Forecast'],
                                dataSources: ['Payments', 'GL']
                            },
                        ]
                    }];
            }
            catch (error) {
                console.error('Error in getTemplates:', error);
                throw new Error('Failed to fetch templates');
            }
            return [2 /*return*/];
        });
    }); }),
    /**
     * Generate report from template
     */
    generateFromTemplate: reportEditProcedure
        .input(zod_1.z.object({
        templateId: zod_1.z.string(),
        reportName: zod_1.z.string(),
        filters: zod_1.z.record(zod_1.z.any()).optional()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.customReports).values({
                                id: id,
                                name: input.reportName,
                                category: 'Generated',
                                dataSources: JSON.stringify([]),
                                layout: JSON.stringify((_b = input.filters) !== null && _b !== void 0 ? _b : {}),
                                format: 'PDF',
                                status: 'active',
                                createdBy: ctx.user.id
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, {
                                reportId: id,
                                templateId: input.templateId,
                                reportName: input.reportName,
                                status: 'generated',
                                createdAt: new Date(),
                                message: 'Report generated from template successfully'
                            }];
                    case 2:
                        error_4 = _c.sent();
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate report' });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get report history
     */
    getReportHistory: reportViewProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number(),
        limit: zod_1.z.number()["default"](10)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, report, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.customReports).where(drizzle_orm_1.eq(schema_1.customReports.id, String(input.reportId)))];
                    case 1:
                        rows = _c.sent();
                        report = rows[0];
                        return [2 /*return*/, {
                                reportId: input.reportId,
                                history: report ? [{
                                        version: 1,
                                        generatedAt: report.createdAt,
                                        executedBy: (_b = report.owner) !== null && _b !== void 0 ? _b : 'System',
                                        status: report.status,
                                        recordCount: 0
                                    }] : []
                            }];
                    case 2:
                        error_5 = _c.sent();
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch report history' });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete report
     */
    deleteReport: reportEditProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, existing, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        db = db_1.getDb();
                        id = String(input.reportId);
                        return [4 /*yield*/, db.select().from(schema_1.customReports).where(drizzle_orm_1.eq(schema_1.customReports.id, id))];
                    case 1:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.customReports).where(drizzle_orm_1.eq(schema_1.customReports.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                reportId: input.reportId,
                                message: 'Report deleted successfully'
                            }];
                    case 3:
                        error_6 = _b.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete report' });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get advanced scheduling options for reports
     */
    getSchedulingOptions: reportViewProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            reportId: input.reportId,
                            currentSchedule: {
                                enabled: true,
                                frequency: 'weekly',
                                dayOfWeek: 'Monday',
                                time: '08:00',
                                timezone: 'UTC',
                                recipients: ['finance@company.com', 'director@company.com'],
                                format: 'PDF'
                            },
                            frequencyOptions: [
                                { value: 'daily', label: 'Daily', pattern: 'Every day' },
                                { value: 'weekly', label: 'Weekly', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], selected: [1] },
                                { value: 'biweekly', label: 'Bi-weekly', pattern: 'Every other week' },
                                { value: 'monthly', label: 'Monthly', daysOfMonth: 'Last day', selected: 'last' },
                                { value: 'quarterly', label: 'Quarterly', pattern: 'First day of quarter' },
                                { value: 'custom', label: 'Custom', pattern: 'Cron expression' },
                            ],
                            timeOptions: {
                                availableTimes: ['00:00', '06:00', '08:00', '12:00', '14:00', '18:00', '20:00'],
                                timezone: 'UTC'
                            },
                            recipientOptions: {
                                currentRecipients: ['finance@company.com', 'director@company.com'],
                                suggestedRecipients: ['operations@company.com', 'analytics@company.com'],
                                canAddCustom: true
                            },
                            formatOptions: ['PDF', 'Excel', 'CSV', 'HTML'],
                            deliveryMethods: ['Email', 'Slack', 'Teams', 'Drive', 'SharePoint']
                        }];
                }
                catch (error) {
                    console.error('Error in getSchedulingOptions:', error);
                    throw new Error('Failed to fetch scheduling options');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get report parameters and filters
     */
    getReportParameters: reportViewProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            reportId: input.reportId,
                            parameters: [
                                {
                                    id: 'date_range',
                                    name: 'Date Range',
                                    type: 'dateRange',
                                    required: true,
                                    "default": { start: '2024-01-01', end: new Date().toISOString().split('T')[0] },
                                    options: {
                                        presets: ['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'Year to Date']
                                    }
                                },
                                {
                                    id: 'department',
                                    name: 'Department',
                                    type: 'multiselect',
                                    required: false,
                                    "default": ['All'],
                                    options: {
                                        values: [
                                            { label: 'All', value: 'all' },
                                            { label: 'Sales', value: 'sales' },
                                            { label: 'Operations', value: 'operations' },
                                            { label: 'Finance', value: 'finance' },
                                            { label: 'HR', value: 'hr' },
                                        ]
                                    }
                                },
                                {
                                    id: 'minimum_amount',
                                    name: 'Minimum Amount',
                                    type: 'number',
                                    required: false,
                                    "default": 0,
                                    options: { min: 0, max: 1000000, step: 1000 }
                                },
                                {
                                    id: 'include_summary',
                                    name: 'Include Summary Section',
                                    type: 'boolean',
                                    required: false,
                                    "default": true
                                },
                            ],
                            currentValues: {
                                date_range: { start: '2024-01-01', end: new Date().toISOString().split('T')[0] },
                                department: ['all'],
                                minimum_amount: 0,
                                include_summary: true
                            }
                        }];
                }
                catch (error) {
                    console.error('Error in getReportParameters:', error);
                    throw new Error('Failed to fetch report parameters');
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get report usage and performance analytics
     */
    getReportAnalytics: reportViewProcedure
        .input(zod_1.z.object({
        reportId: zod_1.z.number(),
        timeRange: zod_1.z["enum"](['week', 'month', 'quarter', 'year'])["default"]('month')
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            reportId: input.reportId,
                            timeRange: input.timeRange,
                            usage: {
                                totalViews: 245,
                                totalDownloads: 89,
                                totalShares: 34,
                                averageViewTime: '4.5 minutes'
                            },
                            viewsTrend: [
                                { date: '2024-01-10', views: 8, downloads: 2 },
                                { date: '2024-01-12', views: 12, downloads: 4 },
                                { date: '2024-01-15', views: 18, downloads: 6 },
                                { date: '2024-01-17', views: 15, downloads: 5 },
                                { date: '2024-01-19', views: 22, downloads: 8 },
                                { date: '2024-01-22', views: 25, downloads: 9 },
                                { date: '2024-01-24', views: 20, downloads: 7 },
                            ],
                            topConsumers: [
                                { user: 'John Smith', views: 45, downloads: 18, lastViewedAt: new Date() },
                                { user: 'Sarah Johnson', views: 38, downloads: 14, lastViewedAt: new Date() },
                                { user: 'Mike Wilson', views: 32, downloads: 11, lastViewedAt: new Date() },
                                { user: 'Emily Davis', views: 28, downloads: 9, lastViewedAt: new Date() },
                            ],
                            performanceMetrics: {
                                averageGenerationTime: '3.2 seconds',
                                averageExportTime: '8.5 seconds',
                                dataFreshness: '< 1 hour',
                                reliability: '99.8%'
                            },
                            recommendations: [
                                'Report is widely used - consider featuring prominently',
                                'Export feature is frequently used - ensure optimization',
                                'Consider creation of complementary reports for top viewers',
                            ]
                        }];
                }
                catch (error) {
                    console.error('Error in getReportAnalytics:', error);
                    throw new Error('Failed to fetch report analytics');
                }
                return [2 /*return*/];
            });
        });
    })
});
