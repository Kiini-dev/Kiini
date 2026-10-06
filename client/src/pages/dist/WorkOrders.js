"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var spinner_1 = require("@/components/ui/spinner");
var table_1 = require("@/components/ui/table");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var lucide_react_2 = require("lucide-react");
var sonner_1 = require("sonner");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
function WorkOrders() {
    var _a, _b;
    var _c = permissions_1.useRequireFeature("operations:work-orders:view"), allowed = _c.allowed, permLoading = _c.isLoading;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _e = react_1.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState("all"), priorityFilter = _g[0], setPriorityFilter = _g[1];
    var _h = react_1.useState("workOrderNumber"), sortField = _h[0], setSortField = _h[1];
    var _j = react_1.useState("asc"), sortOrder = _j[0], setSortOrder = _j[1];
    var _k = react_1.useState(new Set()), selectedOrders = _k[0], setSelectedOrders = _k[1];
    var _l = data_table_controls_1.usePagination(25), page = _l.page, pageSize = _l.pageSize, setPage = _l.setPage, setPageSize = _l.setPageSize, paginate = _l.paginate;
    // Column configuration
    var WO_COLUMNS = [
        { key: "workOrderNumber", label: "WO #", defaultVisible: true },
        { key: "description", label: "Description", defaultVisible: true },
        { key: "assignedTo", label: "Assigned To", defaultVisible: true },
        { key: "priority", label: "Priority", defaultVisible: true },
        { key: "status", label: "Status", defaultVisible: true },
        { key: "targetEndDate", label: "Target End Date", defaultVisible: true },
        { key: "total", label: "Total", defaultVisible: false },
    ];
    var _m = TableColumnSettings_1.useColumnVisibility(WO_COLUMNS, "workorders"), visibleColumns = _m.visibleColumns, toggleColumn = _m.toggleColumn, isVisible = _m.isVisible;
    var _o = trpc_1.trpc.workOrders.list.useQuery({}), _p = _o.data, workOrders = _p === void 0 ? [] : _p, isLoading = _o.isLoading, refetch = _o.refetch;
    var deleteMutation = trpc_1.trpc.workOrders["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Work order deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var bulkDeleteMutation = ((_b = (_a = trpc_1.trpc.workOrders.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation) === null || _b === void 0 ? void 0 : _b.call(_a, {
        onSuccess: function () {
            sonner_1.toast.success("Work orders deleted successfully");
            setSelectedWOs(new Set());
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    })) || { mutate: function () { }, isPending: false };
    // Computed properties for sorting and pagination
    var processedWOs = react_1.useMemo(function () {
        var filtered = workOrders.filter(function (wo) {
            var matchesSearch = (wo.workOrderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (wo.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || wo.status === statusFilter;
            var matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
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
    }, [workOrders, searchQuery, statusFilter, priorityFilter, sortField, sortOrder]);
    var statCards = react_1.useMemo(function () {
        var totalCount = workOrders.length;
        var inProgressCount = workOrders.filter(function (wo) { return wo.status === "in-progress"; }).length;
        var completedCount = workOrders.filter(function (wo) { return wo.status === "completed"; }).length;
        return [
            { label: "Total Work Orders", value: totalCount, icon: "📋" },
            { label: "In Progress", value: inProgressCount, icon: "⏳" },
            { label: "Completed", value: completedCount, icon: "✓" },
        ];
    }, [workOrders]);
    var paginatedWOs = react_1.useMemo(function () {
        var start = (page - 1) * pageSize;
        return processedWOs.slice(start, start + pageSize);
    }, [processedWOs, page, pageSize]);
    var totalPages = Math.ceil(processedWOs.length / pageSize);
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "critical": return "destructive";
            case "high": return "secondary";
            case "medium": return "default";
            case "low": return "outline";
            default: return "default";
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "draft": return "outline";
            case "open": return "default";
            case "in-progress": return "secondary";
            case "completed": return "default";
            case "cancelled": return "destructive";
            default: return "default";
        }
    };
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Work Orders", description: "Track service and maintenance work orders", icon: React.createElement(lucide_react_2.Wrench, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Operations", href: "/operations" },
            { label: "Work Orders" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return setLocation("/work-orders/create"); } },
            React.createElement(lucide_react_2.Plus, { className: "w-4 h-4 mr-2" }),
            "New Work Order") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex gap-4 flex-col sm:flex-row" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_2.Search, { className: "h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Search work orders...", value: searchQuery, onChange: function (e) { setSearchQuery(e.target.value); setPage(1); }, className: "flex-1" }))),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (val) { setStatusFilter(val); setPage(1); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                React.createElement(select_1.SelectItem, { value: "in-progress" }, "In Progress"),
                                React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))),
                        React.createElement(select_1.Select, { value: priorityFilter, onValueChange: function (val) { setPriorityFilter(val); setPage(1); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Priority"),
                                React.createElement(select_1.SelectItem, { value: "critical" }, "Critical"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low"))),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: WO_COLUMNS, visibleColumns: visibleColumns, onToggle: toggleColumn })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Work Orders (",
                        processedWOs.length,
                        ")"),
                    React.createElement(card_1.CardDescription, null, "Manage service and maintenance work orders")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, null))) : processedWOs.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No work orders found. Click \"New Work Order\" to get started.")) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-12" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedWOs.size === paginatedWOs.length && paginatedWOs.length > 0, onCheckedChange: function (checked) {
                                                if (checked)
                                                    setSelectedWOs(new Set(paginatedWOs.map(function (w) { return w.id; })));
                                                else
                                                    setSelectedWOs(new Set());
                                            } })),
                                    WO_COLUMNS.map(function (col) { return (isVisible(col.key) && (React.createElement(table_1.TableHead, { key: col.key, className: "cursor-pointer", onClick: function () {
                                            setSortField(col.key);
                                            setSortOrder(sortField === col.key && sortOrder === "asc" ? "desc" : "asc");
                                        } },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            col.label,
                                            sortField === col.key && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))))); }),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, paginatedWOs.map(function (wo) { return (React.createElement(table_1.TableRow, { key: wo.id },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedWOs.has(wo.id), onCheckedChange: function (checked) {
                                            var newSet = new Set(selectedWOs);
                                            if (checked)
                                                newSet.add(wo.id);
                                            else
                                                newSet["delete"](wo.id);
                                            setSelectedWOs(newSet);
                                        } })),
                                isVisible("workOrderNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, wo.workOrderNumber),
                                isVisible("description") && React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, wo.description),
                                isVisible("assignedTo") && React.createElement(table_1.TableCell, null, getUserName(wo.assignedTo)),
                                isVisible("priority") && React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: getPriorityColor(wo.priority) }, wo.priority)),
                                isVisible("status") && React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: getStatusColor(wo.status) }, wo.status)),
                                isVisible("targetEndDate") && React.createElement(table_1.TableCell, null, wo.targetEndDate ? date_fns_1.format(new Date(wo.targetEndDate), "MMM dd, yyyy") : "N/A"),
                                React.createElement(table_1.TableCell, { className: "text-right space-x-1" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/work-orders/" + wo.id); } },
                                        React.createElement(lucide_react_2.Eye, { className: "w-4 h-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                        React.createElement(lucide_react_2.Edit, { className: "w-4 h-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: function () { if (confirm("Delete this work order?"))
                                            deleteMutation.mutate(wo.id); } },
                                        React.createElement(lucide_react_2.Trash2, { className: "w-4 h-4" }))))); })))),
                    React.createElement("div", { className: "flex items-center justify-between mt-4 pt-4 border-t" },
                        React.createElement("div", { className: "text-sm text-muted-foreground" },
                            "Page ",
                            page,
                            " of ",
                            totalPages || 1,
                            " (",
                            processedWOs.length,
                            " total)"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setPage(function (p) { return Math.max(1, p - 1); }); }, disabled: page === 1 }, "Previous"),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: page === totalPages }, "Next"),
                            React.createElement(select_1.Select, { value: String(pageSize), onValueChange: function (val) { setPageSize(Number(val)); setPage(1); } },
                                React.createElement(select_1.SelectTrigger, { className: "w-20" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "5" }, "5"),
                                    React.createElement(select_1.SelectItem, { value: "10" }, "10"),
                                    React.createElement(select_1.SelectItem, { value: "25" }, "25"),
                                    React.createElement(select_1.SelectItem, { value: "50" }, "50"))))))))))));
}
exports["default"] = WorkOrders;
