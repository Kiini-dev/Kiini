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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var budget_error_handler_1 = require("@/lib/budget-error-handler");
var lucide_react_1 = require("lucide-react");
var separator_1 = require("@/components/ui/separator");
var currency_1 = require("@/lib/currency");
function LPOsPage() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var user = useAuth_1.useAuth().user;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState(false), isExporting = _c[0], setIsExporting = _c[1];
    var _d = react_1.useState(false), isImporting = _d[0], setIsImporting = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState({
        lpoNumber: "",
        vendorId: "",
        vendorName: "",
        description: "",
        amount: 0,
        status: "draft",
        deliveryDate: "",
        deliveryLocation: "",
        requestedBy: (user === null || user === void 0 ? void 0 : user.name) || "",
        notes: ""
    }), formData = _g[0], setFormData = _g[1];
    // Queries
    var _h = trpc_1.trpc.lpo.list.useQuery(), _j = _h.data, lpos = _j === void 0 ? [] : _j, isLoading = _h.isLoading, refetch = _h.refetch;
    var _k = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _k === void 0 ? [] : _k;
    // Mutations
    var createMutation = trpc_1.trpc.lpo.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO created successfully");
            setIsCreateOpen(false);
            resetForm();
            refetch();
        },
        onError: function (error) {
            if (budget_error_handler_1.handleBudgetError(error))
                return;
            sonner_1.toast.error(error.message || "Failed to create LPO");
        }
    });
    var deleteMutation = trpc_1.trpc.lpo["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete LPO");
        }
    });
    var resetForm = function () {
        setFormData({
            lpoNumber: "",
            vendorId: "",
            vendorName: "",
            description: "",
            amount: 0,
            status: "draft",
            deliveryDate: "",
            deliveryLocation: "",
            requestedBy: (user === null || user === void 0 ? void 0 : user.name) || "",
            notes: ""
        });
    };
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = name === "amount" ? Number(value) : value, _a)));
        });
    };
    var handleVendorSelect = function (vendorId) {
        var selectedVendor = suppliers.find(function (s) { return s.id === vendorId; });
        setFormData(function (prev) { return (__assign(__assign({}, prev), { vendorId: vendorId, vendorName: (selectedVendor === null || selectedVendor === void 0 ? void 0 : selectedVendor.companyName) || "" })); });
    };
    var handleCreateLPO = function () {
        if (!formData.lpoNumber.trim() || !formData.vendorId || formData.amount <= 0) {
            sonner_1.toast.error("LPO Number, Vendor, and Amount are required");
            return;
        }
        createMutation.mutate({
            lpoNumber: formData.lpoNumber,
            vendorId: formData.vendorId,
            description: formData.description,
            amount: formData.amount * 100,
            deliveryDate: formData.deliveryDate || undefined,
            deliveryLocation: formData.deliveryLocation || undefined,
            requestedBy: formData.requestedBy,
            notes: formData.notes || undefined
        });
    };
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var csv, element, file;
        return __generator(this, function (_a) {
            setIsExporting(true);
            try {
                csv = __spreadArrays([
                    ["LPO Number", "Vendor", "Amount", "Status", "Delivery Date", "Delivery Location", "Requested By"]
                ], filteredLPOs.map(function (lpo) { return [
                    lpo.lpoNumber,
                    lpo.vendorName,
                    lpo.amount / 100,
                    lpo.status,
                    lpo.deliveryDate || "",
                    lpo.deliveryLocation || "",
                    lpo.requestedBy || "",
                ]; })).map(function (row) { return row.join(","); })
                    .join("\n");
                element = document.createElement("a");
                file = new Blob([csv], { type: "text/csv" });
                element.href = URL.createObjectURL(file);
                element.download = "lpos-" + new Date().toISOString().split("T")[0] + ".csv";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                sonner_1.toast.success("LPOs exported successfully");
            }
            catch (error) {
                sonner_1.toast.error("Failed to export LPOs");
            }
            finally {
                setIsExporting(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleImport = function () {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";
        input.onchange = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var file, text, lines, imported, _i, lines_1, line, _a, lpoNumber, vendorId, amount, status, err_1, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        file = (_b = e.target.files) === null || _b === void 0 ? void 0 : _b[0];
                        if (!file)
                            return [2 /*return*/];
                        setIsImporting(true);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, 10, 11]);
                        return [4 /*yield*/, file.text()];
                    case 2:
                        text = _c.sent();
                        lines = text.split("\n").slice(1);
                        imported = 0;
                        _i = 0, lines_1 = lines;
                        _c.label = 3;
                    case 3:
                        if (!(_i < lines_1.length)) return [3 /*break*/, 8];
                        line = lines_1[_i];
                        if (!line.trim())
                            return [3 /*break*/, 7];
                        _a = line.split(","), lpoNumber = _a[0], vendorId = _a[1], amount = _a[2], status = _a[3];
                        if (!(lpoNumber && vendorId && amount)) return [3 /*break*/, 7];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, createMutation.mutateAsync({
                                lpoNumber: lpoNumber,
                                vendorId: vendorId,
                                amount: Number(amount) * 100,
                                status: status || "draft"
                            })];
                    case 5:
                        _c.sent();
                        imported++;
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _c.sent();
                        console.error("Error importing row:", err_1);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        sonner_1.toast.success("Imported " + imported + " LPOs successfully");
                        refetch();
                        return [3 /*break*/, 11];
                    case 9:
                        error_1 = _c.sent();
                        sonner_1.toast.error("Failed to import LPOs");
                        return [3 /*break*/, 11];
                    case 10:
                        setIsImporting(false);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        input.click();
    };
    var filteredLPOs = react_1.useMemo(function () {
        return (Array.isArray(lpos) ? lpos : []).filter(function (lpo) {
            var _a, _b, _c;
            var matchesSearch = ((_a = lpo.lpoNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = lpo.vendorName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) || ((_c = lpo.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase()));
            var matchesStatus = statusFilter === "all" || lpo.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [lpos, searchTerm, statusFilter]);
    var getStatusColor = function (status) {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Local Purchase Orders", description: "Create and manage local purchase orders for vendor procurement", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "#" },
            { label: "LPOs" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleImport, disabled: isImporting, className: "gap-2" },
                isImporting ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                "Import"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExport, disabled: isExporting, className: "gap-2" },
                isExporting ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                "Export"),
            React.createElement(button_1.Button, { onClick: function () { resetForm(); setIsCreateOpen(true); }, className: "gap-2" },
                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                "New LPO")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Search by LPO number, vendor, or description...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-8 w-full" }))),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "All LPOs (",
                        filteredLPOs.length,
                        ")"),
                    React.createElement(card_1.CardDescription, null, "Click on an LPO to view or edit details")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : filteredLPOs.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No LPOs found. Click \"New LPO\" to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "LPO Number"),
                                React.createElement(table_1.TableHead, null, "Vendor"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                React.createElement(table_1.TableHead, null, "Delivery Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Requested By"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredLPOs.map(function (lpo) {
                            var _a;
                            return (React.createElement(table_1.TableRow, { key: lpo.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, lpo.lpoNumber),
                                React.createElement(table_1.TableCell, null, lpo.vendorName),
                                React.createElement(table_1.TableCell, { className: "text-right" }, new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: currencyCode
                                }).format((lpo.amount || 0) / 100)),
                                React.createElement(table_1.TableCell, null, lpo.deliveryDate || "N/A"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: getStatusColor(lpo.status) }, (_a = lpo.status) === null || _a === void 0 ? void 0 : _a.toUpperCase())),
                                React.createElement(table_1.TableCell, null, lpo.requestedBy || "N/A"),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement("div", { className: "flex justify-end gap-2" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/lpos/" + lpo.id); } },
                                            React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/lpos/" + lpo.id + "/edit"); } },
                                            React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return deleteMutation.mutate(lpo.id); }, disabled: deleteMutation.isPending },
                                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))));
                        }))))))),
            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New LPO"),
                        React.createElement(dialog_1.DialogDescription, null, "Fill in the details to create a new local purchase order")),
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                                    "Order Identification")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "lpoNumber" }, "LPO Number *"),
                                        React.createElement(input_1.Input, { id: "lpoNumber", name: "lpoNumber", value: formData.lpoNumber, onChange: handleInputChange, placeholder: "e.g., LPO-2026-001" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "vendorId" }, "Select Vendor *"),
                                        React.createElement(select_1.Select, { value: formData.vendorId, onValueChange: handleVendorSelect },
                                            React.createElement(select_1.SelectTrigger, { id: "vendorId" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Select a vendor" })),
                                            React.createElement(select_1.SelectContent, null, suppliers.map(function (supplier) { return (React.createElement(select_1.SelectItem, { key: supplier.id, value: supplier.id }, supplier.companyName)); }))))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                                    "Financial & Delivery")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "amount" }, "Amount (KES) *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.Coins, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { id: "amount", name: "amount", type: "number", value: formData.amount || "", onChange: handleInputChange, placeholder: "0.00", step: "0.01", className: "pl-8" }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "deliveryDate" }, "Delivery Date"),
                                        React.createElement(input_1.Input, { id: "deliveryDate", name: "deliveryDate", type: "date", value: formData.deliveryDate, onChange: handleInputChange }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "deliveryLocation" }, "Delivery Location"),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.MapPin, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { id: "deliveryLocation", name: "deliveryLocation", value: formData.deliveryLocation, onChange: handleInputChange, placeholder: "e.g., Warehouse A, Building 1", className: "pl-8" }))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                                    "Description & Notes")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description / Items"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: html })); }); }, placeholder: "List items or services to be procured", minHeight: "100px" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Additional notes or special instructions", minHeight: "80px" }))))),
                    React.createElement("div", { className: "flex justify-end gap-3 pt-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreateLPO, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create LPO")))))));
}
exports["default"] = LPOsPage;
