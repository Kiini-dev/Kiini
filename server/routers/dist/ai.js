"use strict";
/**
 * Groq AI Router
 *
 * Features:
 * - Document Summarization & Intelligence
 * - Email Generation Assistant
 * - Financial Analytics & Insights
 * - Conversational Chat Interface
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
exports.aiRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
var db = require("../db");
var GROQ_BASE_URL = "https://api.groq.com/openai/v1";
function getGroqConfig() {
    var apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new server_1.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI features are not configured. Please set GROQ_API_KEY in your environment."
        });
    }
    var model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
    return { apiKey: apiKey, model: model };
}
function groqChat(messages, maxTokens) {
    var _a, _b, _c, _d, _e, _f;
    if (maxTokens === void 0) { maxTokens = 1024; }
    return __awaiter(this, void 0, Promise, function () {
        var _g, apiKey, model, response, err, data;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _g = getGroqConfig(), apiKey = _g.apiKey, model = _g.model;
                    return [4 /*yield*/, fetch(GROQ_BASE_URL + "/chat/completions", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + apiKey
                            },
                            body: JSON.stringify({ model: model, messages: messages, max_tokens: maxTokens })
                        })];
                case 1:
                    response = _h.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    err = _h.sent();
                    throw new Error("Groq API error " + response.status + ": " + err);
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _h.sent();
                    return [2 /*return*/, {
                            text: (_d = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : "",
                            tokensUsed: (_f = (_e = data.usage) === null || _e === void 0 ? void 0 : _e.completion_tokens) !== null && _f !== void 0 ? _f : 0
                        }];
            }
        });
    });
}
exports.aiRouter = trpc_1.router({
    // ============================================
    // Document Summarization
    // ============================================
    summarizeDocument: trpc_1.createFeatureRestrictedProcedure("ai:summarize")
        .input(zod_1.z.object({
        text: zod_1.z.string().min(50).max(50000),
        focus: zod_1.z["enum"](['key_points', 'action_items', 'financial', 'general']).optional()["default"]('general')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var prompt, _b, summary, tokensUsed, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        prompt = "Summarize the following document focusing on " + input.focus + ". Be concise and actionable:\n\n" + input.text;
                        return [4 /*yield*/, groqChat([{ role: "user", content: prompt }], 1024)];
                    case 1:
                        _b = _c.sent(), summary = _b.text, tokensUsed = _b.tokensUsed;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "ai_document_summarized",
                                entityType: "ai_request",
                                entityId: "summary_" + Date.now(),
                                description: "Summarized document (" + input.focus + ")"
                            })];
                    case 2:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { summary: summary, tokensUsed: tokensUsed }];
                    case 3:
                        error_1 = _c.sent();
                        console.error("Groq summarization error:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to summarize document: " + error_1.message
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ============================================
    // Email Generation
    // ============================================
    generateEmail: trpc_1.createFeatureRestrictedProcedure("ai:generateEmail")
        .input(zod_1.z.object({
        context: zod_1.z.string().min(20).max(5000),
        tone: zod_1.z["enum"](['professional', 'friendly', 'formal', 'casual'])["default"]('professional'),
        type: zod_1.z["enum"](['invoice', 'proposal', 'follow_up', 'general'])["default"]('general')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var systemPrompt, userPrompt, _b, emailContent, tokensUsed, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        systemPrompt = "You are a professional business email writer. Generate a concise, " + input.tone + " email. Return only the email content without subject line.";
                        userPrompt = "Generate a " + input.tone + " " + input.type + " email based on this context:\n\n" + input.context;
                        return [4 /*yield*/, groqChat([
                                { role: "system", content: systemPrompt },
                                { role: "user", content: userPrompt },
                            ], 800)];
                    case 1:
                        _b = _c.sent(), emailContent = _b.text, tokensUsed = _b.tokensUsed;
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "ai_email_generated",
                                entityType: "ai_request",
                                entityId: "email_" + Date.now(),
                                description: "Generated " + input.type + " email (" + input.tone + ")"
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { emailContent: emailContent, tokensUsed: tokensUsed }];
                    case 3:
                        error_2 = _c.sent();
                        console.error("Groq email generation error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate email: " + error_2.message
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ============================================
    // Financial Analytics
    // ============================================
    analyzeFinancials: trpc_1.createFeatureRestrictedProcedure("ai:financial")
        .input(zod_1.z.object({
        dataDescription: zod_1.z.string().min(20),
        metricType: zod_1.z["enum"](['expense_trends', 'revenue_analysis', 'cash_flow', 'profitability'])["default"]('revenue_analysis')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var prompt, _b, insights, tokensUsed, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        prompt = "As a financial analyst, provide insights on the following financial data. Focus on " + input.metricType + ":\n\n" + input.dataDescription + "\n\nProvide 3-5 actionable insights.";
                        return [4 /*yield*/, groqChat([{ role: "user", content: prompt }], 1024)];
                    case 1:
                        _b = _c.sent(), insights = _b.text, tokensUsed = _b.tokensUsed;
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "ai_financial_analysis",
                                entityType: "ai_request",
                                entityId: "financial_" + Date.now(),
                                description: "Analyzed " + input.metricType
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { insights: insights, tokensUsed: tokensUsed }];
                    case 3:
                        error_3 = _c.sent();
                        console.error("Groq financial analysis error:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to analyze financials: " + error_3.message
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ============================================
    // Conversational AI Chat
    // ============================================
    createChatSession: trpc_1.createFeatureRestrictedProcedure("ai:chat")
        .input(zod_1.z.object({
        title: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.aiChatSessions).values({
                                id: id,
                                userId: ctx.user.id,
                                title: input.title || "Chat " + new Date().toLocaleDateString()
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                    case 3:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to create chat session: " + error_4.message
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    chat: trpc_1.createFeatureRestrictedProcedure("ai:chat")
        .input(zod_1.z.object({
        message: zod_1.z.string().min(1).max(5000),
        context: zod_1.z.string().optional(),
        sessionId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var systemPrompt, _b, assistantMessage, tokensUsed, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        systemPrompt = "You are a helpful CRM assistant for Kiini. Keep responses concise and actionable.\n\nIMPORTANT: When referencing CRM pages, modules, or items, ALWAYS include direct navigation links using markdown format: [Link Text](/path).\n\nAvailable navigation routes (use these exact paths):\n- Dashboard: [Dashboard](/crm-home) or [Executive Dashboard](/executive-dashboard)\n- Clients: [Clients](/clients), [Create Client](/clients/create), specific client [Client #ID](/clients/ID)\n- Contacts: [Contacts](/contacts), [Create Contact](/contacts/create)\n- Leads: [Leads](/leads), Tasks: [Tasks](/tasks)\n- Opportunities: [Opportunities](/opportunities), Pipeline: [Sales Pipeline](/sales-pipeline)\n- Invoices: [Invoices](/invoices), [Create Invoice](/invoices/create), specific [Invoice #ID](/invoices/ID)\n- Estimates: [Estimates](/estimates), [Create Estimate](/estimates/create)\n- Payments: [Payments](/payments), [Create Payment](/payments/create), [Overdue Payments](/payments/overdue)\n- Receipts: [Receipts](/receipts), [Create Receipt](/receipts/create)\n- Expenses: [Expenses](/expenses), [Create Expense](/expenses/create), [Recurring Expenses](/recurring-expenses)\n- Credit Notes: [Credit Notes](/credit-notes), Debit Notes: [Debit Notes](/debit-notes)\n- Projects: [Projects](/projects), [Create Project](/projects/create), specific [Project #ID](/projects/ID)\n- Budgets: [Budgets](/budgets), [Create Budget](/budgets/create)\n- Accounting: [Chart of Accounts](/chart-of-accounts), [Bank Reconciliation](/bank-reconciliation)\n- Financial: [Financial Dashboard](/financial-dashboard), [Forecasting](/forecasting), [Imprests](/imprests)\n- HR: [Employees](/employees), [Create Employee](/employees/create), [Attendance](/attendance), [Leave Management](/leave-management)\n- Payroll: [Payroll](/payroll), [Create Payroll](/payroll/create), [Payslips](/payslips)\n- Departments: [Departments](/departments), [Training](/training), [Performance Reviews](/performance-reviews)\n- Recruitment: [Recruitment](/recruitment), [Onboarding](/onboarding)\n- Suppliers: [Suppliers](/suppliers), [Create Supplier](/suppliers/create)\n- LPOs: [LPOs](/lpos), [Create LPO](/lpos/create), Orders: [Orders](/orders)\n- Quotes: [Quotes](/quotes), Proposals: [Proposals](/proposals)\n- Contracts: [Contracts](/contracts), [Work Orders](/work-orders)\n- Communications: [Communications](/communications), [Staff Chat](/staff-chat), [Notifications](/notification-center)\n- Reports: [Reports](/reports), [Report Builder](/report-builder), [KPI Tracking](/kpi-tracking)\n- Settings: [Settings](/settings), [Roles](/roles), [Account](/account)\n- Admin: [Admin Management](/admin/management), [Email Templates](/admin/email-templates), [Backups](/admin/backups)\n- Documents: [Documents](/documents), [Knowledge Base](/knowledge-base)\n- Inventory: [Inventory](/inventory), Assets: [Assets](/assets)\n- Workflow: [Workflow Automation](/workflow-automation), [Integrations](/integrations)\n- AI Hub: [AI Hub](/ai-hub), Calendar: [Calendar](/calendar), Approvals: [Approvals](/approvals)\n\nWhen a user asks about navigation, always provide the direct link. When describing items, include links to relevant pages.\nUse markdown formatting: **bold** for emphasis, bullet lists for multiple items, and [text](/path) for all links.";
                        if (input.context) {
                            systemPrompt += "\n\nUser Context: " + input.context;
                        }
                        return [4 /*yield*/, groqChat([
                                { role: "system", content: systemPrompt },
                                { role: "user", content: input.message },
                            ], 1024)];
                    case 1:
                        _b = _c.sent(), assistantMessage = _b.text, tokensUsed = _b.tokensUsed;
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "ai_chat_interaction",
                                entityType: "ai_request",
                                entityId: input.sessionId || "chat_" + Date.now(),
                                description: "Chat message: " + input.message.substring(0, 100)
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                message: assistantMessage,
                                tokensUsed: tokensUsed,
                                sessionId: input.sessionId
                            }];
                    case 3:
                        error_5 = _c.sent();
                        console.error("Groq chat error:", error_5);
                        if (error_5 instanceof server_1.TRPCError) {
                            throw error_5;
                        }
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to process chat message: " + error_5.message
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check if Claude AI is available
     */
    checkAvailability: trpc_1.createFeatureRestrictedProcedure("ai:access").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var isAvailable;
        return __generator(this, function (_a) {
            isAvailable = !!process.env.GROQ_API_KEY;
            return [2 /*return*/, {
                    available: isAvailable,
                    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
                    provider: "groq",
                    features: ["summarization", "email_generation", "chat", "financial_analysis"]
                }];
        });
    }); })
});
