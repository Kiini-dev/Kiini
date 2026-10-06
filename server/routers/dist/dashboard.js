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
exports.dashboardRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
exports.dashboardRouter = trpc_1.router({
    // Get dashboard stats for Quick Actions sidebar
    stats: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, monthStart, lastMonthStart, lastMonthEnd, monthStartStr, lastMonthStartStr, lastMonthEndStr, allPayments, totalRevenue, thisMonthPayments, thisMonthRevenue, lastMonthPayments, lastMonthRevenue, revenueGrowth, activeProjectsData, activeProjects, newProjectsData, newProjects, allClients, totalClients, newClientsData, newClients, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Dashboard.stats] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _c.sent();
                        if (!db) {
                            console.log('[Dashboard.stats] No DB available');
                            return [2 /*return*/, {
                                    totalRevenue: 0,
                                    revenueGrowth: 0,
                                    activeProjects: 0,
                                    newProjects: 0,
                                    totalClients: 0,
                                    newClients: 0
                                }];
                        }
                        now = new Date();
                        monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                        monthStartStr = monthStart.toISOString();
                        lastMonthStartStr = lastMonthStart.toISOString().replace('T', ' ').substring(0, 19);
                        lastMonthEndStr = lastMonthEnd.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.select({ amount: schema_1.payments.amount, status: schema_1.payments.status }).from(schema_1.payments).limit(10000)];
                    case 3:
                        allPayments = _c.sent();
                        totalRevenue = allPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db
                                .select({ amount: schema_1.payments.amount, paymentDate: schema_1.payments.paymentDate })
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.gte(schema_1.payments.paymentDate, monthStartStr))
                                .limit(1000)];
                    case 4:
                        thisMonthPayments = _c.sent();
                        thisMonthRevenue = thisMonthPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db
                                .select({ amount: schema_1.payments.amount, paymentDate: schema_1.payments.paymentDate })
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, lastMonthStartStr), drizzle_orm_1.lte(schema_1.payments.paymentDate, lastMonthEndStr)))
                                .limit(1000)];
                    case 5:
                        lastMonthPayments = _c.sent();
                        lastMonthRevenue = lastMonthPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        revenueGrowth = lastMonthRevenue > 0
                            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                            : 0;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projects)
                                .where(drizzle_orm_1.eq(schema_1.projects.status, "active"))
                                .limit(1000)];
                    case 6:
                        activeProjectsData = _c.sent();
                        activeProjects = activeProjectsData.length;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projects)
                                .where(drizzle_orm_1.gte(schema_1.projects.createdAt, monthStartStr))
                                .limit(1000)];
                    case 7:
                        newProjectsData = _c.sent();
                        newProjects = newProjectsData.length;
                        return [4 /*yield*/, db.select().from(schema_1.clients).limit(10000)];
                    case 8:
                        allClients = _c.sent();
                        totalClients = allClients.length;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.gte(schema_1.clients.createdAt, monthStartStr))
                                .limit(1000)];
                    case 9:
                        newClientsData = _c.sent();
                        newClients = newClientsData.length;
                        return [2 /*return*/, {
                                totalRevenue: totalRevenue,
                                revenueGrowth: revenueGrowth,
                                activeProjects: activeProjects,
                                newProjects: newProjects,
                                totalClients: totalClients,
                                newClients: newClients
                            }];
                    case 10:
                        error_1 = _c.sent();
                        console.error("Error fetching dashboard stats:", error_1);
                        return [2 /*return*/, {
                                totalRevenue: 0,
                                revenueGrowth: 0,
                                activeProjects: 0,
                                newProjects: 0,
                                totalClients: 0,
                                newClients: 0
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    // Get recent activity for Quick Actions sidebar
    recentActivity: trpc_1.protectedProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, limit, activities, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Dashboard.recentActivity] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER');
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.log('[Dashboard.recentActivity] No DB available');
                            return [2 /*return*/, []];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 10;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.activityLog)
                                .orderBy(drizzle_orm_1.desc(schema_1.activityLog.createdAt))
                                .limit(limit)];
                    case 3:
                        activities = _c.sent();
                        // Convert frozen objects to mutable objects to avoid React error #306
                        return [2 /*return*/, activities.map(function (activity) { return ({
                                id: activity.id || '',
                                userId: activity.userId || '',
                                action: activity.action || '',
                                entityType: activity.entityType || '',
                                entityId: activity.entityId || '',
                                description: activity.description || '',
                                createdAt: activity.createdAt,
                                updatedAt: activity.updatedAt
                            }); })];
                    case 4:
                        error_2 = _c.sent();
                        console.error("Error fetching recent activity:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get dashboard metrics
    metrics: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, projectsData, totalProjects, clientsData, activeClients, invoicesData, pendingInvoices, now, monthStart, monthEnd, monthStartStr, monthEndStr, paymentsData, monthlyRevenue, productsData, totalProducts, servicesData, totalServices, employeesData, totalEmployees, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Dashboard.metrics] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER');
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.log('[Dashboard.metrics] No DB available');
                            return [2 /*return*/, {
                                    totalProjects: 0,
                                    activeClients: 0,
                                    pendingInvoices: 0,
                                    monthlyRevenue: 0,
                                    totalProducts: 0,
                                    totalServices: 0,
                                    totalEmployees: 0,
                                    totalAccounts: 0
                                }];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, db.select().from(schema_1.projects).limit(1000)];
                    case 3:
                        projectsData = _c.sent();
                        totalProjects = projectsData.length;
                        return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.status, "active")).limit(1000)];
                    case 4:
                        clientsData = _c.sent();
                        activeClients = clientsData.length;
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.status, "sent")).limit(1000)];
                    case 5:
                        invoicesData = _c.sent();
                        pendingInvoices = invoicesData.length;
                        now = new Date();
                        monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        monthStartStr = monthStart.toISOString().replace('T', ' ').substring(0, 19);
                        monthEndStr = monthEnd.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, monthStartStr), drizzle_orm_1.lte(schema_1.payments.paymentDate, monthEndStr)))
                                .limit(1000)];
                    case 6:
                        paymentsData = _c.sent();
                        monthlyRevenue = paymentsData.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db.select().from(schema_1.products).limit(1000)];
                    case 7:
                        productsData = _c.sent();
                        totalProducts = productsData.length;
                        return [4 /*yield*/, db.select().from(schema_1.services).limit(1000)];
                    case 8:
                        servicesData = _c.sent();
                        totalServices = servicesData.length;
                        return [4 /*yield*/, db.select().from(schema_1.employees).limit(1000)];
                    case 9:
                        employeesData = _c.sent();
                        totalEmployees = employeesData.length;
                        return [2 /*return*/, {
                                totalProjects: totalProjects,
                                activeClients: activeClients,
                                pendingInvoices: pendingInvoices,
                                monthlyRevenue: monthlyRevenue,
                                totalProducts: totalProducts,
                                totalServices: totalServices,
                                totalEmployees: totalEmployees,
                                totalAccounts: 0
                            }];
                    case 10:
                        error_3 = _c.sent();
                        console.error("Error fetching dashboard metrics:", error_3);
                        return [2 /*return*/, {
                                totalProjects: 0,
                                activeClients: 0,
                                pendingInvoices: 0,
                                monthlyRevenue: 0,
                                totalProducts: 0,
                                totalServices: 0,
                                totalEmployees: 0,
                                totalAccounts: 0
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    // Get accounting metrics
    accountingMetrics: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoicesData, totalInvoices, paymentsData, totalPayments, expensesData, totalExpenses, totalRevenue, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            return [2 /*return*/, {
                                    totalInvoices: 0,
                                    totalPayments: 0,
                                    totalExpenses: 0,
                                    totalRevenue: 0
                                }];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.select({ total: schema_1.invoices.total }).from(schema_1.invoices).limit(1000)];
                    case 3:
                        invoicesData = _b.sent();
                        totalInvoices = invoicesData.length;
                        return [4 /*yield*/, db.select({ amount: schema_1.payments.amount }).from(schema_1.payments).limit(1000)];
                    case 4:
                        paymentsData = _b.sent();
                        totalPayments = paymentsData.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db.select({ amount: schema_1.expenses.amount }).from(schema_1.expenses).limit(1000)];
                    case 5:
                        expensesData = _b.sent();
                        totalExpenses = expensesData.reduce(function (sum, e) { return sum + (e.amount || 0); }, 0);
                        totalRevenue = invoicesData.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);
                        return [2 /*return*/, {
                                totalInvoices: totalInvoices,
                                totalPayments: totalPayments,
                                totalExpenses: totalExpenses,
                                totalRevenue: totalRevenue
                            }];
                    case 6:
                        error_4 = _b.sent();
                        console.error("Error fetching accounting metrics:", error_4);
                        return [2 /*return*/, {
                                totalInvoices: 0,
                                totalPayments: 0,
                                totalExpenses: 0,
                                totalRevenue: 0
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Get HR metrics
    hrMetrics: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employeesData, totalEmployees, activeEmployees, totalDepartments, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            return [2 /*return*/, {
                                    totalEmployees: 0,
                                    activeEmployees: 0,
                                    totalDepartments: 0
                                }];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.employees).limit(1000)];
                    case 3:
                        employeesData = _b.sent();
                        totalEmployees = employeesData.length;
                        activeEmployees = employeesData.filter(function (e) { return e.status === "active"; }).length;
                        totalDepartments = 0;
                        return [2 /*return*/, {
                                totalEmployees: totalEmployees,
                                activeEmployees: activeEmployees,
                                totalDepartments: totalDepartments
                            }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Error fetching HR metrics:", error_5);
                        return [2 /*return*/, {
                                totalEmployees: 0,
                                activeEmployees: 0,
                                totalDepartments: 0
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get calendar events for a given month (global – no org scope).
     * Aggregates invoice due dates, project end dates, and task due dates.
     */
    getCalendarEvents: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        year: zod_1.z.number().int().min(2000).max(2100),
        month: zod_1.z.number().int().min(1).max(12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, padded, startOfMonth_1, lastDay, endOfMonth_1, _b, monthInvoices, allProjects, projectsDueThisMonth, allProjectIds, tasksDue, events, _i, monthInvoices_1, inv, _c, projectsDueThisMonth_1, proj, _d, tasksDue_1, task, error_6;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            return [2 /*return*/, { events: [] }];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 6, , 7]);
                        padded = function (n) { return String(n).padStart(2, '0'); };
                        startOfMonth_1 = input.year + "-" + padded(input.month) + "-01 00:00:00";
                        lastDay = new Date(input.year, input.month, 0).getDate();
                        endOfMonth_1 = input.year + "-" + padded(input.month) + "-" + padded(lastDay) + " 23:59:59";
                        return [4 /*yield*/, Promise.all([
                                db.select().from(schema_1.invoices).where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.dueDate, startOfMonth_1), drizzle_orm_1.lte(schema_1.invoices.dueDate, endOfMonth_1))).limit(500),
                                db.select().from(schema_1.projects).limit(2000),
                            ])];
                    case 3:
                        _b = _e.sent(), monthInvoices = _b[0], allProjects = _b[1];
                        projectsDueThisMonth = allProjects.filter(function (p) {
                            if (!p.endDate)
                                return false;
                            var d = String(p.endDate).slice(0, 10);
                            return d >= startOfMonth_1.slice(0, 10) && d <= endOfMonth_1.slice(0, 10);
                        });
                        allProjectIds = allProjects.map(function (p) { return p.id; });
                        tasksDue = [];
                        if (!(allProjectIds.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.select().from(schema_1.projectTasks).where(drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.projectTasks.projectId, allProjectIds), drizzle_orm_1.gte(schema_1.projectTasks.dueDate, startOfMonth_1), drizzle_orm_1.lte(schema_1.projectTasks.dueDate, endOfMonth_1))).limit(500)];
                    case 4:
                        tasksDue = _e.sent();
                        _e.label = 5;
                    case 5:
                        events = [];
                        for (_i = 0, monthInvoices_1 = monthInvoices; _i < monthInvoices_1.length; _i++) {
                            inv = monthInvoices_1[_i];
                            events.push({
                                id: "inv_" + inv.id,
                                type: 'invoice',
                                title: "Invoice " + inv.invoiceNumber + " due",
                                date: String(inv.dueDate).slice(0, 10),
                                status: inv.status,
                                href: "/invoices/" + inv.id,
                                color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#ef4444' : '#3b82f6'
                            });
                        }
                        for (_c = 0, projectsDueThisMonth_1 = projectsDueThisMonth; _c < projectsDueThisMonth_1.length; _c++) {
                            proj = projectsDueThisMonth_1[_c];
                            events.push({
                                id: "proj_" + proj.id,
                                type: 'project',
                                title: proj.name + " deadline",
                                date: String(proj.endDate).slice(0, 10),
                                status: proj.status,
                                href: "/projects/" + proj.id,
                                color: proj.status === 'completed' ? '#22c55e' : proj.status === 'on_hold' ? '#f59e0b' : '#a855f7'
                            });
                        }
                        for (_d = 0, tasksDue_1 = tasksDue; _d < tasksDue_1.length; _d++) {
                            task = tasksDue_1[_d];
                            if (!task.dueDate)
                                continue;
                            events.push({
                                id: "task_" + task.id,
                                type: 'task',
                                title: task.title,
                                date: String(task.dueDate).slice(0, 10),
                                status: task.status,
                                href: "/projects/" + task.projectId,
                                color: task.status === 'completed' ? '#22c55e' : task.priority === 'urgent' ? '#ef4444' : '#f97316'
                            });
                        }
                        return [2 /*return*/, { events: events }];
                    case 6:
                        error_6 = _e.sent();
                        console.error('[dashboard.getCalendarEvents] Error:', error_6);
                        return [2 /*return*/, { events: [] }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Monthly income vs expenses chart data (last 12 months)
    monthlyChart: trpc_1.protectedProcedure
        .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, year, monthNames, months, m, start, end, paymentsData, income, expensesData, expense, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Dashboard.monthlyChart] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER', 'Year:', input === null || input === void 0 ? void 0 : input.year);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.log('[Dashboard.monthlyChart] No DB available');
                            return [2 /*return*/, { months: [], year: new Date().getFullYear() }];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 8, , 9]);
                        year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                        monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        months = [];
                        m = 0;
                        _c.label = 3;
                    case 3:
                        if (!(m < 12)) return [3 /*break*/, 7];
                        start = new Date(year, m, 1).toISOString().slice(0, 19).replace('T', ' ');
                        end = new Date(year, m + 1, 0, 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');
                        return [4 /*yield*/, db
                                .select({ amount: schema_1.payments.amount })
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, start), drizzle_orm_1.lte(schema_1.payments.paymentDate, end)))
                                .limit(1000)];
                    case 4:
                        paymentsData = _c.sent();
                        income = paymentsData.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db
                                .select({ amount: schema_1.expenses.amount })
                                .from(schema_1.expenses)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.expenses.expenseDate, start), drizzle_orm_1.lte(schema_1.expenses.expenseDate, end)))
                                .limit(1000)];
                    case 5:
                        expensesData = _c.sent();
                        expense = expensesData.reduce(function (sum, e) { return sum + (e.amount || 0); }, 0);
                        months.push({ month: m + 1, name: monthNames[m], income: income, expense: expense });
                        _c.label = 6;
                    case 6:
                        m++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, { months: months, year: year }];
                    case 8:
                        error_7 = _c.sent();
                        console.error("Error fetching monthly chart data:", error_7);
                        return [2 /*return*/, { months: [], year: (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear() }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    // Financial summary cards (like Kiini: One Hub. Total Control top stats)
    financialSummary: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, todayStart, todayEnd, monthStart, monthEnd, todayStr, todayPay, paymentsToday, monthPay, paymentsMonth, dueInv, invoicesDue, overdueInv, invoicesOverdue, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('[Dashboard.financialSummary] Called. User:', ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email) || 'NO USER');
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.log('[Dashboard.financialSummary] No DB available');
                            return [2 /*return*/, { paymentsToday: 0, paymentsMonth: 0, invoicesDue: 0, invoicesOverdue: 0 }];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        now = new Date();
                        todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 19).replace('T', ' ');
                        todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');
                        monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ');
                        monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');
                        todayStr = now.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        return [4 /*yield*/, db.select({ amount: schema_1.payments.amount }).from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, todayStart), drizzle_orm_1.lte(schema_1.payments.paymentDate, todayEnd))).limit(500)];
                    case 3:
                        todayPay = _c.sent();
                        paymentsToday = todayPay.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db.select({ amount: schema_1.payments.amount }).from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, monthStart), drizzle_orm_1.lte(schema_1.payments.paymentDate, monthEnd))).limit(1000)];
                    case 4:
                        monthPay = _c.sent();
                        paymentsMonth = monthPay.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
                        return [4 /*yield*/, db.select({ total: schema_1.invoices.total }).from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.status, 'sent'), drizzle_orm_1.gte(schema_1.invoices.dueDate, todayStr))).limit(500)];
                    case 5:
                        dueInv = _c.sent();
                        invoicesDue = dueInv.reduce(function (s, i) { return s + (i.total || 0); }, 0);
                        return [4 /*yield*/, db.select({ total: schema_1.invoices.total }).from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.invoices.status, ['sent', 'partial']), drizzle_orm_1.lte(schema_1.invoices.dueDate, todayStr))).limit(500)];
                    case 6:
                        overdueInv = _c.sent();
                        invoicesOverdue = overdueInv.reduce(function (s, i) { return s + (i.total || 0); }, 0);
                        return [2 /*return*/, { paymentsToday: paymentsToday, paymentsMonth: paymentsMonth, invoicesDue: invoicesDue, invoicesOverdue: invoicesOverdue }];
                    case 7:
                        error_8 = _c.sent();
                        console.error("Error fetching financial summary:", error_8);
                        return [2 /*return*/, { paymentsToday: 0, paymentsMonth: 0, invoicesDue: 0, invoicesOverdue: 0 }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
