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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
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
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var lucide_react_2 = require("lucide-react");
var separator_1 = require("@/components/ui/separator");
var currency_1 = require("@/lib/currency");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
function ImprestsPage() {
    var _this = this;
    var _a, _b;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _c = permissions_1.useRequireFeature("procurement:imprest:view"), allowed = _c.allowed, isLoading = _c.isLoading;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    // Column configuration
    var IMPREST_COLUMNS = [
        { key: "imprestNumber", label: "Imprest #" },
        { key: "userName", label: "Employee" },
        { key: "amount", label: "Amount" },
        { key: "approvalStatus", label: "Status" },
        { key: "dateNeeded", label: "Date Needed" },
    ];
    // Sorting and pagination state
    var _e = react_1.useState("imprestNumber"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("asc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = react_1.useState(new Set()), selectedImprests = _g[0], setSelectedImprests = _g[1];
    var _h = data_table_controls_1.usePagination(25), page = _h.page, pageSize = _h.pageSize, setPage = _h.setPage, setPageSize = _h.setPageSize, paginate = _h.paginate;
    var _j = TableColumnSettings_1.useColumnVisibility(IMPREST_COLUMNS, "imprests"), visibleColumns = _j.visibleColumns, toggleColumn = _j.toggleColumn, isVisible = _j.isVisible;
    var _k = react_1.useState(false), isCreateOpen = _k[0], setIsCreateOpen = _k[1];
    var _l = react_1.useState(false), isExporting = _l[0], setIsExporting = _l[1];
    var _m = react_1.useState(false), isImporting = _m[0], setIsImporting = _m[1];
    var _o = react_1.useState(false), isSurrenderOpen = _o[0], setIsSurrenderOpen = _o[1];
    var _p = react_1.useState(""), searchTerm = _p[0], setSearchTerm = _p[1];
    var _q = react_1.useState("all"), statusFilter = _q[0], setStatusFilter = _q[1];
    var _r = react_1.useState(null), selectedImprest = _r[0], setSelectedImprest = _r[1];
    var _s = react_1.useState({
        imprestNumber: "",
        userId: "",
        userName: "",
        purpose: "",
        amount: 0,
        dateRequested: new Date().toISOString().split("T")[0],
        dateNeeded: "",
        approvalStatus: "pending",
        notes: ""
    }), formData = _s[0], setFormData = _s[1];
    var _t = react_1.useState({
        amount: 0,
        notes: ""
    }), surrenderData = _t[0], setSurrenderData = _t[1];
    // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
    // Queries - Fetch users/employees for dropdown
    var _u = trpc_1.trpc.imprest.list.useQuery({}), _v = _u.data, imprests = _v === void 0 ? [] : _v, isLoadingImprests = _u.isLoading, refetch = _u.refetch;
    var _w = trpc_1.trpc.imprestSurrender.list.useQuery({}), _x = _w.data, surrenders = _x === void 0 ? [] : _x, refetchSurrenders = _w.refetch;
    var _y = trpc_1.trpc.users.list.useQuery({ limit: 100 }).data, employees = _y === void 0 ? [] : _y;
    // Mutations
    var createMutation = trpc_1.trpc.imprest.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Imprest request created successfully");
            setIsCreateOpen(false);
            resetForm();
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create imprest");
        }
    });
    var deleteMutation = trpc_1.trpc.imprest["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Imprest deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete imprest");
        }
    });
    var bulkDeleteMutation = ((_b = (_a = trpc_1.trpc.imprest.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation) === null || _b === void 0 ? void 0 : _b.call(_a, {
        onSuccess: function () {
            sonner_1.toast.success("Imprests deleted successfully");
            setSelectedImprests(new Set());
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete imprests");
        }
    })) || { mutate: function () { return sonner_1.toast.error("Bulk delete not available"); }, isPending: false };
    var surrenderMutation = trpc_1.trpc.imprestSurrender.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Surrender recorded successfully");
            setIsSurrenderOpen(false);
            setSurrenderData({ amount: 0, notes: "" });
            refetch();
            refetchSurrenders();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to record surrender");
        }
    });
    // Computed properties for sorting and pagination (MUST be before permission checks to follow React hooks rules)
    var processedImprests = react_1.useMemo(function () {
        var filtered = imprests.filter(function (imp) {
            var _a, _b, _c;
            var matchesSearch = ((_a = imp.imprestNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = imp.userName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) || ((_c = imp.purpose) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase()));
            var matchesStatus = statusFilter === "all" || imp.approvalStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
        filtered.sort(function (a, b) {
            var aVal = a[sortField] || "";
            var bVal = b[sortField] || "";
            if (aVal < bVal)
                return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal)
                return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [imprests, searchTerm, statusFilter, sortField, sortOrder]);
    var statCards = react_1.useMemo(function () {
        var totalCount = imprests.length;
        var totalAmount = imprests.reduce(function (sum, imp) { return sum + (imp.amount || 0); }, 0);
        var approvedCount = imprests.filter(function (imp) { return imp.approvalStatus === "approved"; }).length;
        return [
            { label: "Total Imprests", value: totalCount, icon: "📋" },
            { label: "Total Value", value: "Ksh " + (totalAmount / 100).toLocaleString(), icon: "💰" },
            { label: "Approved", value: approvedCount, icon: "✓" },
        ];
    }, [imprests]);
    var paginatedImprests = react_1.useMemo(function () {
        var start = (currentPage - 1) * pageSize;
        return processedImprests.slice(start, start + pageSize);
    }, [processedImprests, currentPage, pageSize]);
    var totalPages = Math.ceil(processedImprests.length / pageSize);
    var resetForm = function () {
        setFormData({
            imprestNumber: "",
            userId: "",
            userName: "",
            purpose: "",
            amount: 0,
            dateRequested: new Date().toISOString().split("T")[0],
            dateNeeded: "",
            approvalStatus: "pending",
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
    var handleEmployeeSelect = function (userId) {
        var selectedEmployee = employees.find(function (e) { return e.id === userId; });
        setFormData(function (prev) { return (__assign(__assign({}, prev), { userId: userId, userName: (selectedEmployee === null || selectedEmployee === void 0 ? void 0 : selectedEmployee.name) || "" })); });
    };
    var handleCreateImprest = function () {
        if (!formData.imprestNumber.trim() || !formData.userId || formData.amount <= 0) {
            sonner_1.toast.error("Imprest Number, Employee, and Amount are required");
            return;
        }
        createMutation.mutate({
            imprestNumber: formData.imprestNumber,
            userId: formData.userId,
            purpose: formData.purpose,
            amount: formData.amount * 100,
            dateRequested: formData.dateRequested || undefined,
            dateNeeded: formData.dateNeeded || undefined,
            approvalStatus: formData.approvalStatus,
            notes: formData.notes || undefined
        });
    };
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var csv, element, file;
        return __generator(this, function (_a) {
            setIsExporting(true);
            try {
                csv = __spreadArrays([
                    ["Imprest Number", "Employee", "Amount", "Purpose", "Status", "Date Requested", "Date Needed"]
                ], filteredImprests.map(function (imp) { return [
                    imp.imprestNumber,
                    imp.userName,
                    imp.amount / 100,
                    imp.purpose,
                    imp.approvalStatus,
                    imp.dateRequested || "",
                    imp.dateNeeded || "",
                ]; })).map(function (row) { return row.join(","); })
                    .join("\n");
                element = document.createElement("a");
                file = new Blob([csv], { type: "text/csv" });
                element.href = URL.createObjectURL(file);
                element.download = "imprests-" + new Date().toISOString().split("T")[0] + ".csv";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                sonner_1.toast.success("Imprests exported successfully");
            }
            catch (error) {
                sonner_1.toast.error("Failed to export imprests");
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
            var file, text, lines, imported, _i, lines_1, line, _a, imprestNumber, userId, amount, purpose, err_1, error_1;
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
                        _a = line.split(","), imprestNumber = _a[0], userId = _a[1], amount = _a[2], purpose = _a[3];
                        if (!(imprestNumber && userId && amount)) return [3 /*break*/, 7];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, createMutation.mutateAsync({
                                imprestNumber: imprestNumber,
                                userId: userId,
                                purpose: purpose,
                                amount: Number(amount) * 100
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
                        sonner_1.toast.success("Imported " + imported + " imprests successfully");
                        refetch();
                        return [3 /*break*/, 11];
                    case 9:
                        error_1 = _c.sent();
                        sonner_1.toast.error("Failed to import imprests");
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
    // Filter imprests AFTER all hooks are called
    if (!Array.isArray(imprests)) {
        return null;
    }
    var filteredImprests = imprests.filter(function (imp) {
        var _a, _b, _c;
        var matchesSearch = ((_a = imp.imprestNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = imp.userName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) || ((_c = imp.purpose) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesStatus = statusFilter === "all" || imp.approvalStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var getStatusColor = function (status) {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "settled":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Imprests", description: "Manage cash advances and imprest requests for employees", icon: React.createElement(lucide_react_2.Wallet, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Imprests" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleImport, disabled: isImporting, className: "gap-2" },
                isImporting ? React.createElement(lucide_react_2.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_2.Upload, { className: "h-4 w-4" }),
                "Import"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExport, disabled: isExporting, className: "gap-2" },
                isExporting ? React.createElement(lucide_react_2.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_2.Download, { className: "h-4 w-4" }),
                "Export"),
            React.createElement(button_1.Button, { onClick: function () { resetForm(); setIsCreateOpen(true); }, className: "gap-2" },
                React.createElement(lucide_react_2.Plus, { className: "w-4 h-4" }),
                "New Request")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex gap-4 flex-col sm:flex-row" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_2.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Search by imprest number, employee, or purpose...", value: searchTerm, onChange: function (e) { setSearchTerm(e.target.value); setCurrentPage(1); }, className: "pl-8 w-full" }))),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (val) { setStatusFilter(val); setCurrentPage(1); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                React.createElement(select_1.SelectItem, { value: "settled" }, "Settled"),
                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: IMPREST_COLUMNS, visibleColumns: visibleColumns, onToggle: toggleColumn })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Imprests (",
                        processedImprests.length,
                        ")"),
                    React.createElement(card_1.CardDescription, null, "Manage employee cash advances and imprest requests")),
                React.createElement(card_1.CardContent, null, isLoadingImprests ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_2.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : processedImprests.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No imprests found. Click \"New Request\" to get started.")) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-12" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedImprests.size === paginatedImprests.length && paginatedImprests.length > 0, onCheckedChange: function (checked) {
                                                if (checked) {
                                                    setSelectedImprests(new Set(paginatedImprests.map(function (i) { return i.id; })));
                                                }
                                                else {
                                                    setSelectedImprests(new Set());
                                                }
                                            } })),
                                    IMPREST_COLUMNS.map(function (col) { return (isVisible(col.key) && (React.createElement(table_1.TableHead, { key: col.key, className: "cursor-pointer", onClick: function () {
                                            setSortField(col.key);
                                            setSortOrder(sortField === col.key && sortOrder === "asc" ? "desc" : "asc");
                                        } },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            col.label,
                                            sortField === col.key && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))))); }),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, paginatedImprests.map(function (imp) {
                                var _a;
                                var surrendered = surrenders
                                    .filter(function (s) { return s.imprestId === imp.id; })
                                    .reduce(function (sum, s) { return sum + (s.amount || 0); }, 0);
                                return (React.createElement(table_1.TableRow, { key: imp.id },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedImprests.has(imp.id), onCheckedChange: function (checked) {
                                                var newSet = new Set(selectedImprests);
                                                if (checked)
                                                    newSet.add(imp.id);
                                                else
                                                    newSet["delete"](imp.id);
                                                setSelectedImprests(newSet);
                                            } })),
                                    isVisible("imprestNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, imp.imprestNumber),
                                    isVisible("userName") && React.createElement(table_1.TableCell, null, imp.userName),
                                    isVisible("amount") && React.createElement(table_1.TableCell, { className: "text-right" },
                                        "Ksh ",
                                        ((imp.amount || 0) / 100).toLocaleString()),
                                    isVisible("approvalStatus") && React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { className: imp.approvalStatus === "approved" ? "bg-green-100 text-green-800" : imp.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800" }, (_a = imp.approvalStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase())),
                                    isVisible("dateNeeded") && React.createElement(table_1.TableCell, null, imp.dateNeeded ? date_fns_1.format(new Date(imp.dateNeeded), "MMM dd, yyyy") : "N/A"),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/imprests/" + imp.id); } },
                                            React.createElement(lucide_react_2.Eye, { className: "w-4 h-4" })),
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { setSelectedImprest(imp); setSurrenderData({ amount: 0, notes: "" }); setIsSurrenderOpen(true); } }, "Surrender"),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return deleteMutation.mutate(imp.id); }, disabled: deleteMutation.isPending },
                                            React.createElement(lucide_react_2.Trash2, { className: "w-4 h-4" })))));
                            })))),
                    React.createElement("div", { className: "flex items-center justify-between mt-4 pt-4 border-t" },
                        React.createElement("div", { className: "text-sm text-muted-foreground" },
                            "Page ",
                            currentPage,
                            " of ",
                            totalPages || 1,
                            " (",
                            processedImprests.length,
                            " total)"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (p) { return Math.max(1, p - 1); }); }, disabled: currentPage === 1 }, "Previous"),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: currentPage === totalPages }, "Next"),
                            React.createElement(select_1.Select, { value: String(pageSize), onValueChange: function (val) { setPageSize(Number(val)); setCurrentPage(1); } },
                                React.createElement(select_1.SelectTrigger, { className: "w-20" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "5" }, "5"),
                                    React.createElement(select_1.SelectItem, { value: "10" }, "10"),
                                    React.createElement(select_1.SelectItem, { value: "25" }, "25"),
                                    React.createElement(select_1.SelectItem, { value: "50" }, "50"))))))))),
            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New Imprest Request"),
                        React.createElement(dialog_1.DialogDescription, null, "Submit a cash advance or imprest request for an employee")),
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_2.User, { className: "w-4 h-4 text-blue-600" }),
                                    "Request Details")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "imprestNumber" }, "Imprest Number *"),
                                        React.createElement(input_1.Input, { id: "imprestNumber", name: "imprestNumber", value: formData.imprestNumber, onChange: handleInputChange, placeholder: "e.g., IMP-2026-001" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "userId" }, "Select Employee *"),
                                        React.createElement(select_1.Select, { value: formData.userId, onValueChange: handleEmployeeSelect },
                                            React.createElement(select_1.SelectTrigger, { id: "userId" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                            React.createElement(select_1.SelectContent, null, employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id }, emp.name)); }))))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_2.Coins, { className: "w-4 h-4 text-green-600" }),
                                    "Financial & Schedule")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "amount" }, "Amount (KES) *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_2.Coins, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { id: "amount", name: "amount", type: "number", value: formData.amount, onChange: handleInputChange, placeholder: "0.00", step: "0.01", className: "pl-8" }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "dateRequested" }, "Date Requested"),
                                        React.createElement(input_1.Input, { id: "dateRequested", name: "dateRequested", type: "date", value: formData.dateRequested, onChange: handleInputChange }))),
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "dateNeeded" }, "Date Needed"),
                                        React.createElement(input_1.Input, { id: "dateNeeded", name: "dateNeeded", type: "date", value: formData.dateNeeded, onChange: handleInputChange }))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_2.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                                    "Purpose & Notes")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "purpose" }, "Purpose *"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.purpose, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { purpose: html })); }); }, placeholder: "Describe the purpose of this imprest", minHeight: "100px" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Additional notes or comments", minHeight: "80px" }))))),
                    React.createElement("div", { className: "flex justify-end gap-3 pt-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreateImprest, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Request")))),
            selectedImprest && (React.createElement(dialog_1.Dialog, { open: isSurrenderOpen, onOpenChange: setIsSurrenderOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null,
                            "Surrender Imprest ",
                            selectedImprest.imprestNumber),
                        React.createElement(dialog_1.DialogDescription, null, "Record the surrender/return of cash from this imprest")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "bg-gray-50 p-4 rounded" },
                            React.createElement("p", { className: "text-sm text-gray-600" }, "Original Amount"),
                            React.createElement("p", { className: "text-2xl font-bold" }, new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: currencyCode
                            }).format((selectedImprest.amount || 0) / 100))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "surrenderAmount" }, "Amount Returned (KES) *"),
                            React.createElement(input_1.Input, { id: "surrenderAmount", type: "number", value: surrenderData.amount, onChange: function (e) {
                                    return setSurrenderData(function (prev) { return (__assign(__assign({}, prev), { amount: Number(e.target.value) })); });
                                }, placeholder: "0.00", step: "0.01" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "surrenderNotes" }, "Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: surrenderData.notes, onChange: function (html) { return setSurrenderData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Any notes about the surrender", minHeight: "100px" }))),
                    React.createElement("div", { className: "flex justify-end gap-3" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                setIsSurrenderOpen(false);
                                setSelectedImprest(null);
                            } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: function () {
                                if (surrenderData.amount <= 0) {
                                    sonner_1.toast.error("Amount must be greater than 0");
                                    return;
                                }
                                surrenderMutation.mutate({
                                    imprestId: selectedImprest.id,
                                    amount: surrenderData.amount * 100,
                                    notes: surrenderData.notes || undefined
                                });
                            }, disabled: surrenderMutation.isPending }, surrenderMutation.isPending ? "Recording..." : "Record Surrender"))))))));
}
exports["default"] = ImprestsPage;
