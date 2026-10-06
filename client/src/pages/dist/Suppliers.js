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
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var checkbox_1 = require("@/components/ui/checkbox");
var stats_card_1 = require("@/components/ui/stats-card");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
function SuppliersPage() {
    var _this = this;
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState(false), isExporting = _e[0], setIsExporting = _e[1];
    var _f = react_1.useState(false), isImporting = _f[0], setIsImporting = _f[1];
    var _g = react_1.useState(new Set()), selectedSuppliers = _g[0], setSelectedSuppliers = _g[1];
    var _h = react_1.useState(1), formStep = _h[0], setFormStep = _h[1]; // 1: Basic Info, 2: Contact, 3: Address & Tax
    var supplierColumns = [
        { key: "companyName", label: "Company Name" },
        { key: "contact", label: "Contact" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "rating", label: "Rating" },
        { key: "status", label: "Status" },
        { key: "city", label: "City" },
    ];
    var _j = TableColumnSettings_1.useColumnVisibility(supplierColumns, "suppliers"), visibleColumns = _j.visibleColumns, toggleColumn = _j.toggleColumn, isVisible = _j.isVisible, pageSize = _j.pageSize, updatePageSize = _j.updatePageSize, reset = _j.reset;
    var _k = react_1.useState({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        phoneCountryCode: "+254",
        alternatePhone: "",
        alternatePhoneCountryCode: "+254",
        city: "",
        postalCode: "",
        taxId: "",
        address: ""
    }), formData = _k[0], setFormData = _k[1];
    // Queries
    var _l = trpc_1.trpc.suppliers.list.useQuery({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined
    }), _m = _l.data, suppliers = _m === void 0 ? [] : _m, isLoading = _l.isLoading, refetch = _l.refetch;
    // Mutations
    var createMutation = trpc_1.trpc.suppliers.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Supplier created successfully");
            setIsCreateOpen(false);
            setFormData({
                companyName: "",
                contactPerson: "",
                email: "",
                phone: "",
                alternatePhone: "",
                city: "",
                postalCode: "",
                taxId: "",
                address: ""
            });
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create supplier");
        }
    });
    var deleteMutation = trpc_1.trpc.suppliers["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Supplier deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete supplier");
        }
    });
    var exportMutation = trpc_1.trpc.importExport.exportSuppliers.useQuery({
        format: 'csv'
    });
    var importMutation = trpc_1.trpc.importExport.importSuppliers.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Imported " + result.imported + " suppliers successfully");
            if (result.errors.length > 0) {
                sonner_1.toast.warning(result.errors.length + " rows had errors");
            }
            refetch();
            setIsImporting(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to import suppliers");
            setIsImporting(false);
        }
    });
    var handleCreateSupplier = function () {
        if (!formData.companyName.trim()) {
            sonner_1.toast.error("Company name is required");
            return;
        }
        createMutation.mutate({
            companyName: formData.companyName,
            contactPerson: formData.contactPerson || undefined,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            alternatePhone: formData.alternatePhone || undefined,
            city: formData.city || undefined,
            postalCode: formData.postalCode || undefined,
            taxId: formData.taxId || undefined,
            address: formData.address || undefined,
            qualificationStatus: "pending"
        });
    };
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleExportSuppliers = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, csvData, element, file, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsExporting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, exportMutation.refetch()];
                case 2:
                    result = _b.sent();
                    if ((_a = result.data) === null || _a === void 0 ? void 0 : _a.data) {
                        csvData = result.data.data;
                        element = document.createElement("a");
                        file = new Blob([csvData], { type: "text/csv" });
                        element.href = URL.createObjectURL(file);
                        element.download = "suppliers_" + new Date().toISOString().split('T')[0] + ".csv";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        sonner_1.toast.success("Suppliers exported successfully");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    sonner_1.toast.error("Failed to export suppliers");
                    return [3 /*break*/, 5];
                case 4:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleImportSuppliers = function () {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";
        input.onchange = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var file, reader;
            var _this = this;
            return __generator(this, function (_a) {
                setIsImporting(true);
                file = e.target.files[0];
                reader = new FileReader();
                reader.onload = function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var csvText, lines, headers, data;
                    return __generator(this, function (_a) {
                        try {
                            csvText = event.target.result;
                            lines = csvText.split('\n');
                            headers = lines[0].split(',').map(function (h) { return h.trim().replace(/"/g, ''); });
                            data = lines.slice(1)
                                .filter(function (line) { return line.trim(); })
                                .map(function (line) {
                                var values = line.split(',').map(function (v) { return v.trim().replace(/"/g, ''); });
                                return {
                                    companyName: values[0] || '',
                                    contactPerson: values[1] || undefined,
                                    email: values[2] || undefined,
                                    phone: values[3] || undefined,
                                    altPhone: values[4] || undefined,
                                    address: values[5] || undefined,
                                    city: values[6] || undefined,
                                    postalCode: values[7] || undefined,
                                    taxIdPin: values[8] || undefined,
                                    website: values[9] || undefined,
                                    paymentTerms: values[10] || undefined,
                                    qualificationStatus: values[11] || 'pending',
                                    notes: values[16] || undefined
                                };
                            });
                            importMutation.mutate({
                                data: data,
                                skipDuplicates: true
                            });
                        }
                        catch (error) {
                            sonner_1.toast.error("Failed to parse CSV file");
                            setIsImporting(false);
                        }
                        return [2 /*return*/];
                    });
                }); };
                reader.readAsText(file);
                return [2 /*return*/];
            });
        }); };
        input.click();
    };
    var getStatusBadge = function (status) {
        var statusConfig = {
            pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
            pre_qualified: { color: "bg-blue-100 text-blue-800", label: "Pre-qualified" },
            qualified: { color: "bg-green-100 text-green-800", label: "Qualified" },
            rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
            inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" }
        };
        var config = statusConfig[status] || statusConfig.pending;
        return React.createElement(badge_1.Badge, { className: config.color }, config.label);
    };
    var getRatingColor = function (rating) {
        if (rating >= 80)
            return "text-green-600";
        if (rating >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Suppliers", description: "Manage supplier information, ratings, and audit records", icon: React.createElement(lucide_react_1.Truck, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Suppliers" },
        ], actions: React.createElement(React.Fragment, null) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Suppliers", value: suppliers.length, icon: React.createElement(lucide_react_1.Truck, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Qualified", value: suppliers.filter(function (s) { return s.qualificationStatus === "qualified"; }).length, icon: React.createElement(lucide_react_1.Star, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: suppliers.filter(function (s) { return s.qualificationStatus === "pending"; }).length, icon: React.createElement(lucide_react_1.Loader2, { className: "h-5 w-5" }), color: "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Rejected", value: suppliers.filter(function (s) { return s.qualificationStatus === "rejected"; }).length, icon: React.createElement(lucide_react_1.Trash2, { className: "h-5 w-5" }), color: "border-l-red-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchTerm, onSearchChange: setSearchTerm, searchPlaceholder: "Search by company name, email, or phone...", onCreateClick: function () { return setIsCreateOpen(true); }, createLabel: "New Supplier", onExportClick: handleExportSuppliers, onImportClick: handleImportSuppliers, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                        React.createElement(select_1.SelectItem, { value: "pre_qualified" }, "Pre-qualified"),
                        React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedSuppliers.size, onClear: function () { return setSelectedSuppliers(new Set()); }, actions: [
                    EnhancedBulkActions_1.bulkExportAction(selectedSuppliers, suppliers, supplierColumns, "suppliers"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedSuppliers),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedSuppliers, function (ids) { ids.forEach(function (id) { return deleteMutation.mutate(id); }); setSelectedSuppliers(new Set()); }),
                ] }),
            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: function (open) { setIsCreateOpen(open); if (!open)
                    setFormStep(1); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null,
                            "Add New Supplier - Step ",
                            formStep,
                            " of 3"),
                        React.createElement(dialog_1.DialogDescription, null,
                            formStep === 1 && "Enter basic company information",
                            formStep === 2 && "Add contact details with country codes",
                            formStep === 3 && "Complete address and tax information")),
                    formStep === 1 && (React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2 col-span-2" },
                            React.createElement(label_1.Label, { htmlFor: "companyName" }, "Company Name *"),
                            React.createElement(input_1.Input, { id: "companyName", name: "companyName", value: formData.companyName, onChange: handleInputChange, placeholder: "e.g., ABC Supplies Ltd" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "contactPerson" }, "Contact Person"),
                            React.createElement(input_1.Input, { id: "contactPerson", name: "contactPerson", value: formData.contactPerson, onChange: handleInputChange, placeholder: "e.g., John Doe" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address"),
                            React.createElement(input_1.Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, placeholder: "supplier@example.com" })))),
                    formStep === 2 && (React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Phone Number"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(select_1.Select, { value: formData.phoneCountryCode, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { phoneCountryCode: val })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-32" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "+254" }, "\uD83C\uDDF0\uD83C\uDDEA Kenya +254"),
                                        React.createElement(select_1.SelectItem, { value: "+256" }, "\uD83C\uDDFA\uD83C\uDDEC Uganda +256"),
                                        React.createElement(select_1.SelectItem, { value: "+255" }, "\uD83C\uDDF9\uD83C\uDDFF Tanzania +255"),
                                        React.createElement(select_1.SelectItem, { value: "+44" }, "\uD83C\uDDEC\uD83C\uDDE7 UK +44"),
                                        React.createElement(select_1.SelectItem, { value: "+1" }, "\uD83C\uDDFA\uD83C\uDDF8 USA +1"),
                                        React.createElement(select_1.SelectItem, { value: "+27" }, "\uD83C\uDDFF\uD83C\uDDE6 S. Africa +27"),
                                        React.createElement(select_1.SelectItem, { value: "+234" }, "\uD83C\uDDF3\uD83C\uDDEC Nigeria +234"))),
                                React.createElement(input_1.Input, { name: "phone", value: formData.phone, onChange: handleInputChange, placeholder: "712 345 678", className: "flex-1" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Alternate Phone (Optional)"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(select_1.Select, { value: formData.alternatePhoneCountryCode, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { alternatePhoneCountryCode: val })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-32" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "+254" }, "\uD83C\uDDF0\uD83C\uDDEA Kenya +254"),
                                        React.createElement(select_1.SelectItem, { value: "+256" }, "\uD83C\uDDFA\uD83C\uDDEC Uganda +256"),
                                        React.createElement(select_1.SelectItem, { value: "+255" }, "\uD83C\uDDF9\uD83C\uDDFF Tanzania +255"),
                                        React.createElement(select_1.SelectItem, { value: "+44" }, "\uD83C\uDDEC\uD83C\uDDE7 UK +44"),
                                        React.createElement(select_1.SelectItem, { value: "+1" }, "\uD83C\uDDFA\uD83C\uDDF8 USA +1"),
                                        React.createElement(select_1.SelectItem, { value: "+27" }, "\uD83C\uDDFF\uD83C\uDDE6 S. Africa +27"),
                                        React.createElement(select_1.SelectItem, { value: "+234" }, "\uD83C\uDDF3\uD83C\uDDEC Nigeria +234"))),
                                React.createElement(input_1.Input, { name: "alternatePhone", value: formData.alternatePhone, onChange: handleInputChange, placeholder: "712 345 679", className: "flex-1" }))))),
                    formStep === 3 && (React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                            React.createElement(input_1.Input, { id: "address", name: "address", value: formData.address, onChange: handleInputChange, placeholder: "Street address" }),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "taxId" }, "Tax ID / PIN *"),
                                React.createElement(input_1.Input, { id: "taxId", name: "taxId", value: formData.taxId, onChange: handleInputChange, placeholder: "A001234567N" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "postalCode" }, "Postal Code"),
                                React.createElement(input_1.Input, { id: "postalCode", name: "postalCode", value: formData.postalCode, onChange: handleInputChange, placeholder: "00100" }))))),
                    React.createElement("div", { className: "flex justify-between gap-2 mt-6" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return formStep === 1 ? setIsCreateOpen(false) : setFormStep(formStep - 1); } }, formStep === 1 ? "Cancel" : "Back"),
                        React.createElement("div", { className: "flex gap-2" },
                            formStep < 3 && (React.createElement(button_1.Button, { onClick: function () { return setFormStep(formStep + 1); }, disabled: formStep === 1 && !formData.companyName }, "Next")),
                            formStep === 3 && (React.createElement(button_1.Button, { onClick: handleCreateSupplier, disabled: createMutation.isPending || !formData.companyName || !formData.taxId }, createMutation.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                "Creating...")) : ("Create Supplier"))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            suppliers.length,
                            " suppliers"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: supplierColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : suppliers.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No suppliers found. Click \"+\" to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedSuppliers.size === suppliers.length && suppliers.length > 0, onCheckedChange: function () { if (selectedSuppliers.size === suppliers.length)
                                                setSelectedSuppliers(new Set());
                                            else
                                                setSelectedSuppliers(new Set(suppliers.map(function (s) { return s.id; }))); } })),
                                    isVisible("companyName") && React.createElement(table_1.TableHead, null, "Company Name"),
                                    isVisible("contact") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Contact"),
                                    isVisible("phone") && React.createElement(table_1.TableHead, null, "Phone"),
                                    isVisible("email") && React.createElement(table_1.TableHead, { className: "hidden lg:table-cell" }, "Email"),
                                    isVisible("rating") && React.createElement(table_1.TableHead, { className: "hidden lg:table-cell" }, "Rating"),
                                    isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                    isVisible("city") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "City"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, suppliers.map(function (supplier) { return (React.createElement(table_1.TableRow, { key: supplier.id, className: selectedSuppliers.has(supplier.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedSuppliers.has(supplier.id), onCheckedChange: function () { var next = new Set(selectedSuppliers); if (next.has(supplier.id))
                                            next["delete"](supplier.id);
                                        else
                                            next.add(supplier.id); setSelectedSuppliers(next); } })),
                                isVisible("companyName") && React.createElement(table_1.TableCell, { className: "font-medium" }, supplier.companyName),
                                isVisible("contact") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell" }, supplier.contactPerson || "-"),
                                isVisible("phone") && React.createElement(table_1.TableCell, null, supplier.phone || "-"),
                                isVisible("email") && React.createElement(table_1.TableCell, { className: "hidden lg:table-cell text-sm truncate max-w-[180px]" }, supplier.email || "-"),
                                isVisible("rating") && React.createElement(table_1.TableCell, { className: "hidden lg:table-cell" },
                                    React.createElement("div", { className: "flex items-center gap-1" },
                                        React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + getRatingColor(supplier.averageRating) }),
                                        React.createElement("span", { className: "font-semibold " + getRatingColor(supplier.averageRating) }, supplier.averageRating || 0))),
                                isVisible("status") && React.createElement(table_1.TableCell, null, getStatusBadge(supplier.qualificationStatus)),
                                isVisible("city") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell" }, supplier.city || "-"),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/suppliers/" + supplier.id); } },
                                            { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/suppliers/" + supplier.id + "/edit"); } },
                                            { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { if (confirm("Delete this supplier?"))
                                                    deleteMutation.mutate(supplier.id); }, variant: "destructive" },
                                        ], menuActions: [
                                            { label: "Send Email", icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }), onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, supplier.email)); } },
                                            { label: "Duplicate", icon: React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }), onClick: function () { return navigate("/suppliers/create?clone=" + supplier.id); }, separator: true },
                                            { label: "Download Profile", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/suppliers/" + supplier.id); setTimeout(function () { return window.print(); }, 500); } },
                                        ] })))); }))))))))));
}
exports["default"] = SuppliersPage;
