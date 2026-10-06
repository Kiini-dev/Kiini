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
var wouter_1 = require("wouter");
var trpc_1 = require("@/utils/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var checkbox_1 = require("@/components/ui/checkbox");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
function Tickets() {
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState("all"), priorityFilter = _d[0], setPriorityFilter = _d[1];
    var _e = react_1.useState(false), showCreateDialog = _e[0], setShowCreateDialog = _e[1];
    var _f = react_1.useState(null), selectedTicket = _f[0], setSelectedTicket = _f[1];
    var _g = react_1.useState(new Set()), selectedTickets = _g[0], setSelectedTickets = _g[1];
    var ticketColumns = [
        { key: "title", label: "Title" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
        { key: "createdBy", label: "Created By" },
        { key: "createdDate", label: "Created Date" },
    ];
    var _h = TableColumnSettings_1.useColumnVisibility(ticketColumns, "tickets"), visibleColumns = _h.visibleColumns, toggleColumn = _h.toggleColumn, isVisible = _h.isVisible, pageSize = _h.pageSize, updatePageSize = _h.updatePageSize, reset = _h.reset;
    // Queries
    var _j = trpc_1.trpc.tickets.list.useQuery({}), _k = _j.data, tickets = _k === void 0 ? [] : _k, isLoading = _j.isLoading;
    var ticketDetail = trpc_1.trpc.tickets.getById.useQuery(selectedTicket || "", {
        enabled: !!selectedTicket
    }).data;
    // Mutations
    var utils = trpc_1.trpc.useUtils();
    var createTicket = trpc_1.trpc.tickets.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket created successfully");
            setShowCreateDialog(false);
            utils.tickets.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message);
        }
    });
    var updateTicket = trpc_1.trpc.tickets.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket updated successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message);
        }
    });
    var deleteTicket = trpc_1.trpc.tickets["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message);
        }
    });
    var filteredTickets = react_1.useMemo(function () {
        return (tickets || []).filter(function (ticket) {
            var matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ticket.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
            var matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tickets, searchQuery, statusFilter, priorityFilter]);
    var stats = {
        "new": (tickets === null || tickets === void 0 ? void 0 : tickets.filter(function (t) { return t.status === "new"; }).length) || 0,
        open: (tickets === null || tickets === void 0 ? void 0 : tickets.filter(function (t) { return t.status === "open"; }).length) || 0,
        inProgress: (tickets === null || tickets === void 0 ? void 0 : tickets.filter(function (t) { return t.status === "in_progress"; }).length) || 0,
        completed: (tickets === null || tickets === void 0 ? void 0 : tickets.filter(function (t) { return t.status === "completed"; }).length) || 0
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "new":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-blue-600" });
            case "open":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-600" });
            case "in_progress":
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-purple-600" });
            case "completed":
                return React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-600" });
            case "closed":
                return React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-slate-600" });
            default:
                return null;
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "new":
                return "bg-blue-100 text-blue-800";
            case "open":
                return "bg-yellow-100 text-yellow-800";
            case "in_progress":
                return "bg-purple-100 text-purple-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "closed":
                return "bg-slate-100 text-slate-800";
            default:
                return "";
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Support Tickets", description: "Create and manage support tickets", icon: React.createElement(lucide_react_1.Ticket, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Support & Ticketing" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/tickets/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "New Ticket") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "New", value: stats["new"], description: "Not started", color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Open", value: stats.open, description: "Awaiting action", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "In Progress", value: stats.inProgress, description: "Being worked on", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, description: "Done", color: "border-l-blue-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search tickets...", onCreateClick: function () { return navigate("/tickets/create"); }, createLabel: "New Ticket", onPrintClick: function () { return window.print(); }, filterContent: React.createElement(React.Fragment, null,
                    React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                            React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                            React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                            React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                            React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                            React.createElement(select_1.SelectItem, { value: "closed" }, "Closed"))),
                    React.createElement(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Priority" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Priorities"),
                            React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                            React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                            React.createElement(select_1.SelectItem, { value: "low" }, "Low")))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedTickets.size, onClear: function () { return setSelectedTickets(new Set()); }, actions: [
                    { id: "close", label: "Close Tickets", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-3.5 w-3.5" }), confirm: true, confirmMessage: "Close " + selectedTickets.size + " selected ticket(s)?", onClick: function () { selectedTickets.forEach(function (id) { return updateTicket.mutate({ id: id, status: "closed" }); }); setSelectedTickets(new Set()); } },
                    EnhancedBulkActions_1.bulkExportAction(selectedTickets, tickets, ticketColumns, "tickets"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedTickets),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedTickets, function (ids) { ids.forEach(function (id) { return deleteTicket.mutate(id); }); setSelectedTickets(new Set()); }),
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredTickets.length,
                            " ticket",
                            filteredTickets.length !== 1 ? "s" : ""),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: ticketColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    isLoading ? (React.createElement("div", { className: "text-center py-12" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" }),
                        React.createElement("p", { className: "text-muted-foreground" }, "Loading tickets..."))) : filteredTickets.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
                        React.createElement(lucide_react_1.Ticket, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" }),
                        React.createElement("p", { className: "text-muted-foreground" }, "No tickets found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedTickets.size === filteredTickets.length && filteredTickets.length > 0, onCheckedChange: function () { if (selectedTickets.size === filteredTickets.length)
                                                setSelectedTickets(new Set());
                                            else
                                                setSelectedTickets(new Set(filteredTickets.map(function (t) { return t.id; }))); } })),
                                    isVisible("title") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Title"),
                                    isVisible("priority") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Priority"),
                                    isVisible("status") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                                    isVisible("createdBy") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Created By"),
                                    isVisible("createdDate") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Created Date"),
                                    React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredTickets.map(function (ticket) { return (React.createElement(table_1.TableRow, { key: ticket.id, className: selectedTickets.has(ticket.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedTickets.has(ticket.id), onCheckedChange: function () { var next = new Set(selectedTickets); if (next.has(ticket.id))
                                            next["delete"](ticket.id);
                                        else
                                            next.add(ticket.id); setSelectedTickets(next); } })),
                                isVisible("title") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-medium" }, ticket.title),
                                isVisible("priority") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                    React.createElement(badge_1.Badge, { className: getPriorityColor(ticket.priority) }, (ticket.priority || "medium").charAt(0).toUpperCase() + (ticket.priority || "medium").slice(1))),
                                isVisible("status") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                    React.createElement(badge_1.Badge, { className: getStatusColor(ticket.status), variant: "outline" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            getStatusIcon(ticket.status),
                                            (ticket.status || "new").replace("_", " ").charAt(0).toUpperCase() + (ticket.status || "new").replace("_", " ").slice(1)))),
                                isVisible("createdBy") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground" }, getUserName(ticket.createdBy)),
                                isVisible("createdDate") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, new Date(ticket.createdAt || "").toLocaleDateString()),
                                React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return setSelectedTicket(ticket.id); } },
                                        ], menuActions: [
                                            { label: "Edit Ticket", icon: React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }), onClick: function () { return navigate("/tickets/" + ticket.id + "/edit"); } },
                                            { label: "Duplicate", icon: React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }), onClick: function () { return navigate("/tickets/create?clone=" + ticket.id); }, separator: true },
                                            { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete this ticket?"))
                                                    deleteTicket.mutate(ticket.id); }, variant: "destructive" },
                                        ] })))); }))))))),
            React.createElement(CreateTicketDialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, onSuccess: function () {
                    setShowCreateDialog(false);
                } }),
            selectedTicket && ticketDetail && (React.createElement(TicketDetailDialog, { ticket: ticketDetail, open: !!selectedTicket, onOpenChange: function (open) {
                    if (!open)
                        setSelectedTicket(null);
                } })))));
}
exports["default"] = Tickets;
function CreateTicketDialog(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = react_1.useState(""), title = _b[0], setTitle = _b[1];
    var _c = react_1.useState(""), description = _c[0], setDescription = _c[1];
    var _d = react_1.useState("medium"), priority = _d[0], setPriority = _d[1];
    var _e = react_1.useState(""), area = _e[0], setArea = _e[1];
    var _f = react_1.useState(""), clientId = _f[0], setClientId = _f[1];
    var TICKET_AREAS = [
        { value: "finance", label: "Finance & Accounting" },
        { value: "hr", label: "Human Resources" },
        { value: "it", label: "IT Support & Systems" },
        { value: "operations", label: "Operations & Logistics" },
        { value: "sales", label: "Sales & Business Development" },
        { value: "procurement", label: "Procurement & Suppliers" },
        { value: "customer_service", label: "Customer Service" },
        { value: "administration", label: "Administration & General" },
        { value: "projects", label: "Projects & Timelines" },
        { value: "other", label: "Other" },
    ];
    var createTicket = trpc_1.trpc.tickets.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket created successfully");
            setTitle("");
            setDescription("");
            setPriority("medium");
            setArea("");
            setClientId("");
            onOpenChange(false);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!title.trim()) {
                        sonner_1.toast.error("Title is required");
                        return [2 /*return*/];
                    }
                    if (!area) {
                        sonner_1.toast.error("Please select an area");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, createTicket.mutateAsync({
                            clientId: clientId || "default",
                            title: title,
                            description: description || undefined,
                            priority: priority,
                            category: area
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Create New Support Ticket")),
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", { className: "col-span-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Title *"),
                        React.createElement(input_1.Input, { value: title, onChange: function (e) { return setTitle(e.target.value); }, placeholder: "Brief description of your issue", required: true })),
                    React.createElement("div", { className: "col-span-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Area of Concern *"),
                        React.createElement(select_1.Select, { value: area, onValueChange: setArea },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select the area you need help with" })),
                            React.createElement(select_1.SelectContent, null, TICKET_AREAS.map(function (option) { return (React.createElement(select_1.SelectItem, { key: option.value, value: option.value }, option.label)); })))),
                    React.createElement("div", { className: "col-span-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                        React.createElement("textarea", { value: description, onChange: function (e) { return setDescription(e.target.value); }, placeholder: "Provide detailed information about your issue, including what you've already tried", className: "min-h-32 border rounded-lg p-3 w-full text-sm resize-none" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium" }, "Priority"),
                        React.createElement(select_1.Select, { value: priority, onValueChange: setPriority },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low - Can wait"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Medium - Soon"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High - Urgent"))))),
                React.createElement(dialog_1.DialogFooter, { className: "flex justify-end gap-2" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: createTicket.isPending },
                        createTicket.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Create Ticket"))))));
}
function TicketDetailDialog(_a) {
    var _this = this;
    var ticket = _a.ticket, open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = react_1.useState(ticket.status || "new"), status = _b[0], setStatus = _b[1];
    var _c = react_1.useState(ticket.priority || "medium"), priority = _c[0], setPriority = _c[1];
    var updateTicket = trpc_1.trpc.tickets.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket updated successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message);
        }
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updateTicket.mutateAsync({
                        id: ticket.id,
                        status: status,
                        priority: priority
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    "Ticket Details: ",
                    ticket.title)),
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                        React.createElement(select_1.Select, { value: status, onValueChange: setStatus },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                                React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                                React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                React.createElement(select_1.SelectItem, { value: "closed" }, "Closed")))),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium" }, "Priority"),
                        React.createElement(select_1.Select, { value: priority, onValueChange: setPriority },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High"))))),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                    React.createElement("p", { className: "text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg" }, ticket.description || "No description provided")),
                ticket.comments && ticket.comments.length > 0 && (React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-medium flex items-center gap-2" },
                        React.createElement(lucide_react_1.MessageCircle, { className: "h-4 w-4" }),
                        "Comments (",
                        ticket.comments.length,
                        ")"),
                    React.createElement("div", { className: "space-y-2 mt-2" }, ticket.comments.map(function (comment) { return (React.createElement("div", { key: comment.id, className: "bg-slate-50 p-3 rounded-lg text-sm" },
                        React.createElement("p", { className: "font-medium" }, comment.authorId),
                        React.createElement("p", { className: "text-muted-foreground" }, comment.body))); })))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); } }, "Close"),
                    React.createElement(button_1.Button, { type: "button", disabled: updateTicket.isPending, onClick: handleSave },
                        updateTicket.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Save Changes"))))));
}
