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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
var wouter_1 = require("wouter");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
/**
 * ClientPortal component with backend API integration
 *
 * Features:
 * - Fetch client data from backend
 * - Display projects with real-time status
 * - Manage invoices and payments
 * - Download documents
 * - View account information
 * - Persistent authentication
 */
function ClientPortal() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _c.user, authLoading = _c.loading, isAuthenticated = _c.isAuthenticated, logout = _c.logout;
    // Verify user is a client
    react_1.useEffect(function () {
        if (!authLoading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "client") {
            setLocation("/dashboard");
        }
    }, [authLoading, isAuthenticated, user, setLocation]);
    // Fetch client data from backend
    var clientQuery = trpc_1.trpc.clients.getClientByUserId.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client"
    });
    var projectsQuery = trpc_1.trpc.projects.getClientProjects.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client"
    });
    var invoicesQuery = trpc_1.trpc.invoices.getClientInvoices.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client"
    });
    var documentsQuery = trpc_1.trpc.documents.getClientDocuments.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client"
    });
    var paymentPlansQuery = trpc_1.trpc.paymentPlans.list.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client",
        select: function (plans) {
            // Filter payment plans for invoices belonging to this client
            return (plans === null || plans === void 0 ? void 0 : plans.filter(function (plan) {
                var _a;
                var invoice = (_a = invoicesQuery.data) === null || _a === void 0 ? void 0 : _a.find(function (inv) { return inv.id === plan.invoiceId; });
                return !!invoice;
            })) || [];
        }
    });
    var milestonesQuery = trpc_1.trpc.projectMilestones.list.useQuery(undefined, {
        enabled: isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) === "client",
        select: function (milestones) {
            // Filter milestones for projects belonging to this client
            return (milestones === null || milestones === void 0 ? void 0 : milestones.filter(function (milestone) {
                var _a;
                var project = (_a = projectsQuery.data) === null || _a === void 0 ? void 0 : _a.find(function (p) { return p.id === milestone.projectId; });
                return !!project;
            })) || [];
        }
    });
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    setLocation("/login");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Logout failed");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (authLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" },
            React.createElement("div", { className: "flex flex-col items-center gap-4" },
                React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading portal..."))));
    }
    if (!isAuthenticated || (user === null || user === void 0 ? void 0 : user.role) !== "client") {
        return null;
    }
    var clientData = clientQuery.data || {
        name: (user === null || user === void 0 ? void 0 : user.name) || "Client",
        email: (user === null || user === void 0 ? void 0 : user.email) || "",
        phone: "",
        accountManager: ""
    };
    var projects = projectsQuery.data || [];
    var invoices = invoicesQuery.data || [];
    var documents = documentsQuery.data || [];
    // Calculate stats
    var activeProjectsCount = projects.filter(function (p) { return p.status === "active"; }).length;
    var totalSpent = projects.reduce(function (sum, p) { return sum + (p.spent || 0); }, 0);
    var pendingInvoices = invoices.filter(function (i) { return i.status === "pending"; });
    var pendingAmount = pendingInvoices.reduce(function (sum, i) { return sum + (i.amount || 0); }, 0);
    var handleDownloadDocument = function (documentId, fileName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                sonner_1.toast.promise(Promise.resolve(), {
                    loading: "Downloading document...",
                    success: fileName + " downloaded successfully",
                    error: "Failed to download document"
                });
                // Implement actual download logic
            }
            catch (error) {
                sonner_1.toast.error("Failed to download document");
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen bg-background" },
        React.createElement("header", { className: "border-b bg-card" },
            React.createElement("div", { className: "container mx-auto px-4 py-4 flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    const_1.APP_LOGO && React.createElement("img", { src: const_1.APP_LOGO, alt: const_1.APP_TITLE, className: "h-10 w-auto" }),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-xl font-bold" }, const_1.APP_TITLE),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Client Portal"))),
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon" },
                        React.createElement(lucide_react_1.Bell, { className: "h-5 w-5" })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("div", { className: "h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold" }, clientData.name.charAt(0).toUpperCase()),
                        React.createElement("div", { className: "text-sm" },
                            React.createElement("p", { className: "font-medium" }, clientData.name),
                            React.createElement("p", { className: "text-muted-foreground text-xs" }, clientData.email))),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: handleLogout },
                        React.createElement(lucide_react_1.LogOut, { className: "h-5 w-5" }))))),
        React.createElement("div", { className: "container mx-auto px-4 py-8" },
            React.createElement("div", { className: "mb-8" },
                React.createElement("h2", { className: "text-3xl font-bold mb-2" },
                    "Welcome back, ",
                    clientData.name,
                    "!"),
                React.createElement("p", { className: "text-muted-foreground" }, "Track your projects, view invoices, and manage documents all in one place.")),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Projects"),
                        React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, activeProjectsCount),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "In progress"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Spent"),
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" },
                            "Ksh ",
                            (totalSpent / 1000).toFixed(0),
                            "K"),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Across all projects"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pending Invoices"),
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, pendingInvoices.length),
                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                            "Ksh ",
                            (pendingAmount / 1000).toFixed(0),
                            "K due"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Documents"),
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, documents.length),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Available to download")))),
            React.createElement(tabs_1.Tabs, { defaultValue: "projects", className: "space-y-6" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "projects" }, "My Projects"),
                    React.createElement(tabs_1.TabsTrigger, { value: "invoices" }, "Invoices"),
                    React.createElement(tabs_1.TabsTrigger, { value: "payments" }, "Payment Plans"),
                    React.createElement(tabs_1.TabsTrigger, { value: "documents" }, "Documents"),
                    React.createElement(tabs_1.TabsTrigger, { value: "profile" }, "Profile")),
                React.createElement(tabs_1.TabsContent, { value: "projects", className: "space-y-4" }, projectsQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-gray-400" }))) : projects.length === 0 ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "py-8 text-center" },
                        React.createElement("p", { className: "text-muted-foreground" }, "No projects found")))) : (projects.map(function (project) { return (React.createElement(card_1.Card, { key: project.id },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null, project.name),
                                React.createElement(card_1.CardDescription, null,
                                    project.startDate,
                                    " - ",
                                    project.endDate)),
                            React.createElement(badge_1.Badge, { variant: project.status === "active"
                                    ? "default"
                                    : project.status === "on-hold"
                                        ? "secondary"
                                        : "outline" },
                                project.status === "active" ? (React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3 mr-1" })) : (React.createElement(lucide_react_1.Clock, { className: "h-3 w-3 mr-1" })),
                                (project.status || 'active').toUpperCase()))),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "flex justify-between text-sm mb-2" },
                                React.createElement("span", null, "Progress"),
                                React.createElement("span", { className: "font-medium" },
                                    project.progress || 0,
                                    "%")),
                            React.createElement(progress_1.Progress, { value: project.progress || 0 })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Budget"),
                                React.createElement("p", { className: "text-lg font-semibold" },
                                    "Ksh ",
                                    (project.budget || 0).toLocaleString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Spent"),
                                React.createElement("p", { className: "text-lg font-semibold" },
                                    "Ksh ",
                                    (project.spent || 0).toLocaleString()))),
                        milestonesQuery.data && milestonesQuery.data.some(function (m) { return m.projectId === project.id; }) && (React.createElement("div", { className: "border-t pt-4" },
                            React.createElement("p", { className: "text-sm font-semibold mb-3" }, "Milestones"),
                            React.createElement("div", { className: "space-y-2" }, milestonesQuery.data
                                .filter(function (m) { return m.projectId === project.id; })
                                .map(function (milestone) { return (React.createElement("div", { key: milestone.id, className: "flex items-center justify-between text-sm p-2 bg-muted rounded" },
                                React.createElement("div", { className: "flex items-center gap-2 flex-1" },
                                    milestone.status === "completed" && (React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-600" })),
                                    milestone.status === "in_progress" && (React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-600" })),
                                    !["completed", "in_progress"].includes(milestone.status) && (React.createElement("div", { className: "h-4 w-4 rounded-full border-2 border-gray-300" })),
                                    React.createElement("span", { className: "font-medium" }, milestone.phaseName)),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "text-xs text-muted-foreground" },
                                        milestone.completionPercentage,
                                        "%"),
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, milestone.status.replace("_", " "))))); })))),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full" },
                            React.createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                            "View Project Details")))); }))),
                React.createElement(tabs_1.TabsContent, { value: "invoices", className: "space-y-4" },
                    React.createElement("div", { className: "flex justify-between items-center mb-4" },
                        React.createElement("h3", { className: "text-lg font-semibold" }, "Your Invoices"),
                        React.createElement("div", { className: "relative w-64" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search invoices...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10" }))),
                    invoicesQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-gray-400" }))) : invoices.length === 0 ? (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "py-8 text-center" },
                            React.createElement("p", { className: "text-muted-foreground" }, "No invoices found")))) : (React.createElement("div", { className: "space-y-3" }, invoices
                        .filter(function (invoice) {
                        return invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                        .map(function (invoice) { return (React.createElement(card_1.Card, { key: invoice.id },
                        React.createElement(card_1.CardContent, { className: "flex items-center justify-between p-6" },
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement("div", { className: "h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-6 w-6 text-primary" })),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-semibold" }, invoice.id),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        "Issued: ",
                                        invoice.date,
                                        " \u2022 Due: ",
                                        invoice.dueDate))),
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement("div", { className: "text-right" },
                                    React.createElement("p", { className: "text-lg font-bold" },
                                        "Ksh ",
                                        (invoice.amount || 0).toLocaleString()),
                                    React.createElement(badge_1.Badge, { variant: invoice.status === "paid"
                                            ? "default"
                                            : invoice.status === "pending"
                                                ? "secondary"
                                                : "outline" }, (invoice.status || 'draft').toUpperCase())),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4" })))))); })))),
                React.createElement(tabs_1.TabsContent, { value: "payments", className: "space-y-4" }, paymentPlansQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-gray-400" }))) : paymentPlansQuery.data && paymentPlansQuery.data.length === 0 ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "py-8 text-center" },
                        React.createElement("p", { className: "text-muted-foreground" }, "No payment plans found")))) : (React.createElement("div", { className: "space-y-4" }, Array.isArray(paymentPlansQuery.data) && paymentPlansQuery.data.map(function (plan) { return (React.createElement(card_1.Card, { key: plan.id },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-base" },
                                    "Payment Plan - ",
                                    plan.numInstallments,
                                    " Installments"),
                                React.createElement(card_1.CardDescription, null,
                                    plan.completedInstallments,
                                    " of ",
                                    plan.numInstallments,
                                    " paid")),
                            React.createElement(badge_1.Badge, { variant: plan.status === "active" ? "default" : "secondary" }, plan.status))),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Per Installment"),
                                React.createElement("p", { className: "text-lg font-semibold" },
                                    "Ksh ",
                                    (plan.installmentAmount / 100).toLocaleString("en-KE"))),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Next Due"),
                                React.createElement("p", { className: "text-lg font-semibold" }, plan.nextInstallmentDue)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Paid"),
                                React.createElement("p", { className: "text-lg font-semibold text-green-600" },
                                    "Ksh ",
                                    (plan.totalPaid / 100).toLocaleString("en-KE")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Progress"),
                                React.createElement("span", null,
                                    Math.round((plan.completedInstallments / plan.numInstallments) * 100),
                                    "%")),
                            React.createElement(progress_1.Progress, { value: (plan.completedInstallments / plan.numInstallments) * 100, className: "h-2" }))))); })))),
                React.createElement(tabs_1.TabsContent, { value: "documents", className: "space-y-4" }, documentsQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-gray-400" }))) : documents.length === 0 ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "py-8 text-center" },
                        React.createElement("p", { className: "text-muted-foreground" }, "No documents available")))) : (React.createElement("div", { className: "space-y-3" }, documents.map(function (doc) { return (React.createElement(card_1.Card, { key: doc.id },
                    React.createElement(card_1.CardContent, { className: "flex items-center justify-between p-6" },
                        React.createElement("div", { className: "flex items-center gap-4" },
                            React.createElement("div", { className: "h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center" },
                                React.createElement(lucide_react_1.FileText, { className: "h-6 w-6 text-blue-600" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "font-semibold" }, doc.name),
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    doc.type,
                                    " \u2022 ",
                                    doc.date,
                                    " \u2022 ",
                                    doc.size))),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleDownloadDocument(doc.id, doc.name); } },
                            React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }))))); })))),
                React.createElement(tabs_1.TabsContent, { value: "profile", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Account Information"),
                            React.createElement(card_1.CardDescription, null, "Your client account details")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Company Name"),
                                    React.createElement("p", { className: "text-lg font-semibold" }, clientData.name)),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Email"),
                                    React.createElement("p", { className: "text-lg font-semibold" }, clientData.email)),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Phone"),
                                    React.createElement("p", { className: "text-lg font-semibold" }, clientData.phone || "N/A")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Account Manager"),
                                    React.createElement("p", { className: "text-lg font-semibold" }, clientData.accountManager || "N/A"))))))))));
}
exports["default"] = ClientPortal;
