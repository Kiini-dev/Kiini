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
exports.RecurringInvoices = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var textarea_1 = require("@/components/ui/textarea");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function RecurringInvoices() {
    var _this = this;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = react_1.useState(null), deleteId = _c[0], setDeleteId = _c[1];
    var _d = react_1.useState({
        clientId: "",
        templateInvoiceId: "",
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        description: "",
        noteToInvoice: ""
    }), formData = _d[0], setFormData = _d[1];
    // Fetch data
    var _e = trpc_1.trpc.recurringInvoices.list.useQuery({
        activeOnly: false
    }), recurringList = _e.data, refetchRecurring = _e.refetch;
    var clients = trpc_1.trpc.clients.list.useQuery(undefined).data;
    var invoices = trpc_1.trpc.invoices.list.useQuery({ limit: 500 }).data;
    // Mutations
    var createMutation = trpc_1.trpc.recurringInvoices.create.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring invoice created");
                        setIsOpen(false);
                        resetForm();
                        return [4 /*yield*/, refetchRecurring()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create recurring invoice");
        }
    });
    var updateMutation = trpc_1.trpc.recurringInvoices.update.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring invoice updated");
                        setIsOpen(false);
                        setEditingId(null);
                        resetForm();
                        return [4 /*yield*/, refetchRecurring()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update recurring invoice");
        }
    });
    var deleteMutation = trpc_1.trpc.recurringInvoices["delete"].useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring invoice deleted");
                        setDeleteId(null);
                        return [4 /*yield*/, refetchRecurring()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete recurring invoice");
        }
    });
    var toggleActiveMutation = trpc_1.trpc.recurringInvoices.toggleActive.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Status updated");
                        return [4 /*yield*/, refetchRecurring()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update status");
        }
    });
    var triggerMutation = trpc_1.trpc.recurringInvoices.triggerGeneration.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Invoice " + result.invoiceNumber + " generated");
            refetchRecurring();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to generate invoice");
        }
    });
    // Handlers
    var resetForm = function () {
        setFormData({
            clientId: "",
            templateInvoiceId: "",
            frequency: "monthly",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            description: "",
            noteToInvoice: ""
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!formData.clientId || !formData.templateInvoiceId) {
                sonner_1.toast.error("Please fill in all required fields");
                return [2 /*return*/];
            }
            if (editingId) {
                updateMutation.mutate({
                    id: editingId,
                    frequency: formData.frequency,
                    endDate: formData.endDate ? formData.endDate + "T00:00:00Z" : undefined,
                    description: formData.description || undefined,
                    noteToInvoice: formData.noteToInvoice || undefined
                });
            }
            else {
                createMutation.mutate({
                    clientId: formData.clientId,
                    templateInvoiceId: formData.templateInvoiceId,
                    frequency: formData.frequency,
                    startDate: formData.startDate + "T00:00:00Z",
                    endDate: formData.endDate ? formData.endDate + "T00:00:00Z" : undefined,
                    description: formData.description || undefined,
                    noteToInvoice: formData.noteToInvoice || undefined
                });
            }
            return [2 /*return*/];
        });
    }); };
    var handleEdit = function (recurring) {
        setFormData({
            clientId: recurring.clientId,
            templateInvoiceId: recurring.templateInvoiceId,
            frequency: recurring.frequency,
            startDate: recurring.startDate.split("T")[0],
            endDate: recurring.endDate ? recurring.endDate.split("T")[0] : "",
            description: recurring.description || "",
            noteToInvoice: recurring.noteToInvoice || ""
        });
        setEditingId(recurring.id);
        setIsOpen(true);
    };
    var handleDelete = function (id) {
        deleteMutation.mutate(id);
    };
    var getClientName = function (clientId) {
        var _a;
        return ((_a = clients === null || clients === void 0 ? void 0 : clients.find(function (c) { return c.id === clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || clientId;
    };
    var getInvoiceNumber = function (invoiceId) {
        var _a;
        return ((_a = invoices === null || invoices === void 0 ? void 0 : invoices.find(function (i) { return i.id === invoiceId; })) === null || _a === void 0 ? void 0 : _a.invoiceNumber) || invoiceId;
    };
    var stats = react_1.useMemo(function () {
        if (!recurringList)
            return { total: 0, active: 0, inactive: 0 };
        return {
            total: recurringList.length,
            active: recurringList.filter(function (r) { return r.isActive; }).length,
            inactive: recurringList.filter(function (r) { return !r.isActive; }).length
        };
    }, [recurringList]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Recurring Invoices", description: "Manage automated invoice generation", icon: React.createElement(lucide_react_1.Clock, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Invoices", href: "/invoices" },
            { label: "Recurring" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
                        setIsOpen(open);
                        if (!open) {
                            setEditingId(null);
                            resetForm();
                        }
                    } },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Recurring Invoice")),
                    React.createElement(dialog_1.DialogContent, { className: "w-full max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null,
                                editingId ? "Edit" : "Create",
                                " Recurring Invoice"),
                            React.createElement(dialog_1.DialogDescription, null, editingId
                                ? "Update the recurring invoice settings"
                                : "Set up a new recurring invoice template")),
                        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "client" }, "Client *"),
                                React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { clientId: value }));
                                    }, disabled: !!editingId },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                    React.createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "template" }, "Template Invoice *"),
                                React.createElement(select_1.Select, { value: formData.templateInvoiceId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { templateInvoiceId: value }));
                                    }, disabled: !!editingId },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select invoice template" })),
                                    React.createElement(select_1.SelectContent, null, invoices === null || invoices === void 0 ? void 0 : invoices.filter(function (inv) {
                                        return !editingId ||
                                            inv.clientId === formData.clientId;
                                    }).map(function (invoice) { return (React.createElement(select_1.SelectItem, { key: invoice.id, value: invoice.id },
                                        invoice.invoiceNumber,
                                        " - Ksh",
                                        " ",
                                        (invoice.total / 100).toLocaleString())); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "frequency" }, "Frequency *"),
                                React.createElement(select_1.Select, { value: formData.frequency, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { frequency: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                        React.createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-weekly"),
                                        React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                        React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                        React.createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                            !editingId && (React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date *"),
                                React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { startDate: e.target.value }));
                                    } }))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "endDate" }, "End Date (Optional)"),
                                React.createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { endDate: e.target.value }));
                                    }, placeholder: "Leave empty for indefinite" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                                React.createElement(input_1.Input, { value: formData.description, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { description: e.target.value }));
                                    }, placeholder: "e.g., Monthly consulting fee" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "noteToInvoice" }, "Note to Invoice"),
                                React.createElement(textarea_1.Textarea, { value: formData.noteToInvoice, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { noteToInvoice: e.target.value }));
                                    }, placeholder: "Additional note to include in generated invoices", rows: 3 })),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: createMutation.isPending || updateMutation.isPending },
                                editingId ? "Update" : "Create",
                                " Recurring Invoice"))))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total", value: stats.total, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: stats.inactive, color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Recurring Invoice List"),
                    React.createElement(card_1.CardDescription, null,
                        Array.isArray(recurringList) ? recurringList.length : 0,
                        " recurring invoices configured")),
                React.createElement(card_1.CardContent, null, !Array.isArray(recurringList) || recurringList.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No recurring invoices yet. Create one to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Template"),
                                React.createElement(table_1.TableHead, null, "Frequency"),
                                React.createElement(table_1.TableHead, null, "Next Due"),
                                React.createElement(table_1.TableHead, null, "Last Generated"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Actions"))),
                        React.createElement(table_1.TableBody, null, Array.isArray(recurringList) && recurringList.map(function (recurring) { return (React.createElement(table_1.TableRow, { key: recurring.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, getClientName(recurring.clientId)),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, getInvoiceNumber(recurring.templateInvoiceId)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, recurring.frequency)),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, utils_1.formatDate(recurring.nextDueDate)),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, recurring.lastGeneratedDate
                                ? utils_1.formatDate(recurring.lastGeneratedDate)
                                : "Never"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: recurring.isActive ? "default" : "secondary" }, recurring.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                        { label: "Edit", icon: React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }), onClick: function () { return handleEdit(recurring); } },
                                    ], menuActions: [
                                        { label: recurring.isActive ? "Deactivate" : "Activate", icon: React.createElement(lucide_react_1.Clock, { className: "w-4 h-4" }), onClick: function () { return toggleActiveMutation.mutate({ id: recurring.id, isActive: !recurring.isActive }); } },
                                        { label: "Generate Now", icon: React.createElement(lucide_react_1.Play, { className: "w-4 h-4" }), onClick: function () { return triggerMutation.mutate(recurring.id); } },
                                        { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }), onClick: function () { return setDeleteId(recurring.id); }, variant: "destructive", separator: true },
                                    ] })))); }))))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (open) { return !open && setDeleteId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Recurring Invoice"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. Are you sure?")),
                    React.createElement("div", { className: "flex justify-end gap-2" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && handleDelete(deleteId); }, className: "bg-red-600" }, "Delete")))))));
}
exports.RecurringInvoices = RecurringInvoices;
exports["default"] = RecurringInvoices;
