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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var useUserLookup_1 = require("@/hooks/useUserLookup");
function Approvals() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = permissions_1.useRequireFeature("approvals:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), typeFilter = _d[0], setTypeFilter = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState("all"), priorityFilter = _f[0], setPriorityFilter = _f[1];
    var _g = react_1.useState(null), selectedApproval = _g[0], setSelectedApproval = _g[1];
    var _h = react_1.useState(false), showDetails = _h[0], setShowDetails = _h[1];
    var _j = react_1.useState(""), rejectionReason = _j[0], setRejectionReason = _j[1];
    var _k = react_1.useState(new Set()), selectedIds = _k[0], setSelectedIds = _k[1];
    var _l = react_1.useState(""), bulkRejectionReason = _l[0], setBulkRejectionReason = _l[1];
    var _m = react_1.useState(false), showBulkRejectReason = _m[0], setShowBulkRejectReason = _m[1];
    var queryUtils = trpc_1.trpc.useUtils();
    // Fetch real approvals data - BEFORE CONDITIONAL RETURNS
    var _o = trpc_1.trpc.approvals.getApprovals.useQuery({
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchQuery || undefined
    }), _p = _o.data, approvals = _p === void 0 ? [] : _p, isLoading = _o.isLoading, error = _o.error, refetch = _o.refetch;
    // Delete approval mutation
    var deleteApprovalMutation = trpc_1.trpc.approvals.deleteApproval.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Approval item deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete approval");
        }
    });
    // Approval mutations
    var approveInvoiceMutation = trpc_1.trpc.approvals.approveInvoice.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve invoice");
        }
    });
    var rejectInvoiceMutation = trpc_1.trpc.approvals.rejectInvoice.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject invoice");
        }
    });
    var approveEstimateMutation = trpc_1.trpc.approvals.approveEstimate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve estimate");
        }
    });
    var rejectEstimateMutation = trpc_1.trpc.approvals.rejectEstimate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject estimate");
        }
    });
    var approvePaymentMutation = trpc_1.trpc.approvals.approvePayment.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve payment");
        }
    });
    var rejectPaymentMutation = trpc_1.trpc.approvals.rejectPayment.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject payment");
        }
    });
    var approveExpenseMutation = trpc_1.trpc.approvals.approveExpense.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve expense");
        }
    });
    var rejectExpenseMutation = trpc_1.trpc.approvals.rejectExpense.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject expense");
        }
    });
    var approveBudgetMutation = trpc_1.trpc.approvals.approveBudget.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve budget");
        }
    });
    var rejectBudgetMutation = trpc_1.trpc.approvals.rejectBudget.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject budget");
        }
    });
    var approveLPOMutation = trpc_1.trpc.approvals.approveLPO.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve LPO");
        }
    });
    var rejectLPOMutation = trpc_1.trpc.approvals.rejectLPO.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject LPO");
        }
    });
    var approvePurchaseOrderMutation = trpc_1.trpc.approvals.approvePurchaseOrder.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Purchase Order approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve Purchase Order");
        }
    });
    var rejectPurchaseOrderMutation = trpc_1.trpc.approvals.rejectPurchaseOrder.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Purchase Order rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject Purchase Order");
        }
    });
    var approveImprestMutation = trpc_1.trpc.approvals.approveImprest.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Imprest approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve Imprest");
        }
    });
    var rejectImprestMutation = trpc_1.trpc.approvals.rejectImprest.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Imprest rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject Imprest");
        }
    });
    var approveLeaveRequestMutation = trpc_1.trpc.approvals.approveLeaveRequest.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request approved successfully");
            setShowDetails(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve leave request");
        }
    });
    var rejectLeaveRequestMutation = trpc_1.trpc.approvals.rejectLeaveRequest.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request rejected successfully");
            setShowDetails(false);
            setRejectionReason("");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to reject leave request");
        }
    });
    if (permissionLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement(spinner_1.Spinner, null)));
    }
    if (!allowed) {
        return null;
    }
    // Convert frozen Drizzle objects to plain JS for React dependencies
    var plainApprovals = Array.isArray(approvals)
        ? approvals.map(function (approval) { return JSON.parse(JSON.stringify(approval)); })
        : [];
    // MOVE PERMISSION ERROR CHECK HERE - AFTER ALL HOOKS
    // Show permission error if applicable
    if (error && error.message.includes("permission")) {
        return (React.createElement(DashboardLayout, null,
            React.createElement("div", { className: "space-y-6 p-6" },
                React.createElement("div", { className: "flex items-center justify-center min-h-[500px]" },
                    React.createElement(card_1.Card, { className: "w-full max-w-md border-red-200 bg-red-50" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-red-700 flex items-center gap-2" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }),
                                "Access Denied")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm text-red-600 mb-4" }, error.message),
                            React.createElement(button_1.Button, { onClick: function () { return navigate("/dashboard"); }, className: "w-full" }, "Return to Dashboard")))))));
    }
    // Filter approvals (already filtered by server)
    var filteredApprovals = (function () {
        if (!plainApprovals)
            return [];
        return plainApprovals.filter(function (approval) {
            if (searchQuery) {
                var query = searchQuery.toLowerCase();
                return (approval.referenceNo.toLowerCase().includes(query) ||
                    approval.description.toLowerCase().includes(query) ||
                    approval.requestedBy.toLowerCase().includes(query));
            }
            return true;
        });
    })();
    // Calculate statistics
    var stats = (function () {
        if (!plainApprovals)
            return { total: 0, pending: 0, approved: 0, rejected: 0 };
        return {
            total: plainApprovals.length,
            pending: plainApprovals.filter(function (a) { return a.status === "pending"; }).length,
            approved: plainApprovals.filter(function (a) { return a.status === "approved"; }).length,
            rejected: plainApprovals.filter(function (a) { return a.status === "rejected"; }).length
        };
    })();
    var handleApprove = function (approval) {
        switch (approval.type) {
            case "invoice":
                approveInvoiceMutation.mutate({ id: approval.referenceId });
                break;
            case "expense":
                approveExpenseMutation.mutate({ id: approval.referenceId });
                break;
            case "payment":
                approvePaymentMutation.mutate({ id: approval.referenceId });
                break;
            case "budget":
                approveBudgetMutation.mutate({ id: approval.referenceId });
                break;
            case "lpo":
                approveLPOMutation.mutate({ id: approval.referenceId });
                break;
            case "purchase_order":
                approvePurchaseOrderMutation.mutate({ id: approval.referenceId });
                break;
            case "leave_request":
                approveLeaveRequestMutation.mutate({ id: approval.referenceId });
                break;
            default:
                sonner_1.toast.error("Approval type not supported");
        }
    };
    var handleReject = function (approval) {
        if (!rejectionReason.trim()) {
            sonner_1.toast.error("Please provide a rejection reason");
            return;
        }
        switch (approval.type) {
            case "invoice":
                rejectInvoiceMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "expense":
                rejectExpenseMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "payment":
                rejectPaymentMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "budget":
                rejectBudgetMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "lpo":
                rejectLPOMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "purchase_order":
                rejectPurchaseOrderMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            case "leave_request":
                rejectLeaveRequestMutation.mutate({ id: approval.referenceId, reason: rejectionReason });
                break;
            default:
                sonner_1.toast.error("Rejection type not supported");
        }
    };
    var handleBulkApprove = function () {
        var selectedApprovals = filteredApprovals.filter(function (a) { return selectedIds.has(a.id); });
        if (selectedApprovals.length === 0) {
            sonner_1.toast.error("Please select at least one approval");
            return;
        }
        selectedApprovals.forEach(function (approval) {
            handleApprove(approval);
        });
        setSelectedIds(new Set());
        sonner_1.toast.success("Approved " + selectedApprovals.length + " item(s)");
    };
    var handleBulkReject = function () {
        var selectedApprovals = filteredApprovals.filter(function (a) { return selectedIds.has(a.id); });
        if (selectedApprovals.length === 0) {
            sonner_1.toast.error("Please select at least one approval");
            return;
        }
        if (!bulkRejectionReason.trim()) {
            sonner_1.toast.error("Please provide a rejection reason");
            return;
        }
        selectedApprovals.forEach(function (approval) {
            var tempReason = rejectionReason;
            setRejectionReason(bulkRejectionReason);
            handleReject(__assign({}, approval));
            setRejectionReason(tempReason);
        });
        setSelectedIds(new Set());
        setBulkRejectionReason("");
        setShowBulkRejectReason(false);
        sonner_1.toast.success("Rejected " + selectedApprovals.length + " item(s)");
    };
    var toggleSelectAll = function () {
        if (selectedIds.size === filteredApprovals.length) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(filteredApprovals.map(function (a) { return a.id; })));
        }
    };
    var toggleSelectId = function (id) {
        var newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };
    var getTypeIcon = function (type) {
        var typeConfig = {
            invoice: { label: "Invoice", color: "bg-blue-100 text-blue-800" },
            expense: { label: "Expense", color: "bg-orange-100 text-orange-800" },
            payment: { label: "Payment", color: "bg-green-100 text-green-800" },
            purchase_order: { label: "Purchase Order", color: "bg-purple-100 text-purple-800" },
            leave_request: { label: "Leave Request", color: "bg-pink-100 text-pink-800" },
            budget: { label: "Budget", color: "bg-indigo-100 text-indigo-800" },
            lpo: { label: "LPO", color: "bg-teal-100 text-teal-800" },
            imprest: { label: "Imprest", color: "bg-amber-100 text-amber-800" }
        };
        return typeConfig[type] || { label: type, color: "bg-gray-100 text-gray-800" };
    };
    var getStatusBadge = function (status) {
        switch (status) {
            case "pending":
                return (React.createElement(badge_1.Badge, { className: "bg-yellow-100 text-yellow-800", variant: "outline" },
                    React.createElement(lucide_react_1.Clock, { size: 12, className: "mr-1" }),
                    " Pending"));
            case "approved":
                return (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800", variant: "outline" },
                    React.createElement(lucide_react_1.CheckCircle, { size: 12, className: "mr-1" }),
                    " Approved"));
            case "rejected":
                return (React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800", variant: "outline" },
                    React.createElement(lucide_react_1.XCircle, { size: 12, className: "mr-1" }),
                    " Rejected"));
            default:
                return React.createElement(badge_1.Badge, { variant: "outline" }, status);
        }
    };
    var getPriorityBadge = function (priority) {
        var colors = {
            low: "bg-blue-100 text-blue-800",
            medium: "bg-yellow-100 text-yellow-800",
            high: "bg-orange-100 text-orange-800",
            critical: "bg-red-100 text-red-800"
        };
        return (React.createElement(badge_1.Badge, { className: colors[priority], variant: "outline" }, priority.charAt(0).toUpperCase() + priority.slice(1)));
    };
    var formatCurrency = function (amount) {
        if (!amount)
            return "-";
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode
        }).format(amount);
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Approvals", description: "Review and manage pending approvals for financial and administrative requests", icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Approvals" },
        ] },
        React.createElement("div", { className: "space-y-6 p-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Pending", value: stats.pending, description: "Awaiting approval", color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Approved", value: stats.approved, description: "This month", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Rejected", value: stats.rejected, description: "This month", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total", value: stats.total, description: "All approvals", color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Approval Queue"),
                            React.createElement(card_1.CardDescription, null,
                                filteredApprovals.length,
                                " approval",
                                filteredApprovals.length !== 1 ? "s" : "",
                                selectedIds.size > 0 && " (" + selectedIds.size + " selected)")),
                        selectedIds.size > 0 && (React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setShowBulkRejectReason(true); }, className: "text-red-600 border-red-300 hover:bg-red-50" },
                                React.createElement(lucide_react_1.XCircle, { size: 14, className: "mr-1" }),
                                " Reject Selected"),
                            React.createElement(button_1.Button, { size: "sm", className: "bg-green-600 hover:bg-green-700", onClick: handleBulkApprove },
                                React.createElement(lucide_react_1.CheckCircle, { size: 14, className: "mr-1" }),
                                " Approve Selected")))),
                    React.createElement("div", { className: "flex flex-col md:flex-row gap-4 mt-4" },
                        React.createElement("div", { className: "flex-1 flex items-center gap-2 bg-white border rounded-lg px-3" },
                            React.createElement(lucide_react_1.Search, { size: 16, className: "text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search by reference, description...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "border-0 focus-visible:ring-0 flex-1" })),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))),
                        React.createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "Type" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                                React.createElement(select_1.SelectItem, { value: "invoice" }, "Invoices"),
                                React.createElement(select_1.SelectItem, { value: "expense" }, "Expenses"),
                                React.createElement(select_1.SelectItem, { value: "payment" }, "Payments"),
                                React.createElement(select_1.SelectItem, { value: "budget" }, "Budgets"),
                                React.createElement(select_1.SelectItem, { value: "lpo" }, "LPOs"),
                                React.createElement(select_1.SelectItem, { value: "purchase_order" }, "Purchase Orders"),
                                React.createElement(select_1.SelectItem, { value: "imprest" }, "Imprests"),
                                React.createElement(select_1.SelectItem, { value: "leave_request" }, "Leave Requests"))),
                        React.createElement(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                React.createElement(select_1.SelectValue, { placeholder: "Priority" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Priorities"),
                                React.createElement(select_1.SelectItem, { value: "critical" }, "Critical"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low"))))),
                React.createElement(card_1.CardContent, null, filteredApprovals.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                    React.createElement(lucide_react_1.Clock, { size: 32, className: "mx-auto text-muted-foreground mb-2" }),
                    React.createElement("p", { className: "text-muted-foreground" }, "No approvals found"))) : (React.createElement("div", { className: "rounded-lg border overflow-hidden" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement("input", { type: "checkbox", checked: selectedIds.size === filteredApprovals.length && filteredApprovals.length > 0, onChange: toggleSelectAll, className: "rounded", "aria-label": "Select all" })),
                                React.createElement(table_1.TableHead, null, "Reference"),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, null, "Amount"),
                                React.createElement(table_1.TableHead, null, "Raiser"),
                                React.createElement(table_1.TableHead, null, "Requested Date"),
                                React.createElement(table_1.TableHead, null, "Approver"),
                                React.createElement(table_1.TableHead, null, "Approval Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredApprovals.map(function (approval) { return (React.createElement(table_1.TableRow, { key: approval.id, className: "hover:bg-muted/50" },
                            React.createElement(table_1.TableCell, null,
                                React.createElement("input", { type: "checkbox", checked: selectedIds.has(approval.id), onChange: function () { return toggleSelectId(approval.id); }, className: "rounded", "aria-label": "Select " + approval.referenceNo })),
                            React.createElement(table_1.TableCell, { className: "font-mono font-medium" }, approval.referenceNo),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: getTypeIcon(approval.type).color, variant: "outline" }, getTypeIcon(approval.type).label)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "max-w-xs truncate" }, approval.description)),
                            React.createElement(table_1.TableCell, { className: "font-mono" }, formatCurrency(approval.amount)),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, getUserName(approval.requestedBy)),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, new Date(approval.requestedAt).toLocaleDateString()),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, approval.approvedBy ? getUserName(approval.approvedBy) : React.createElement("span", { className: "text-muted-foreground" }, "-")),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, approval.approvedAt ? new Date(approval.approvedAt).toLocaleDateString() : React.createElement("span", { className: "text-muted-foreground" }, "-")),
                            React.createElement(table_1.TableCell, null, getStatusBadge(approval.status)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex gap-2 justify-end" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                            setSelectedApproval(approval);
                                            setShowDetails(true);
                                        }, title: "View details" },
                                        React.createElement(lucide_react_1.Eye, { size: 14 })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", title: "Edit", className: "text-blue-600 hover:bg-blue-50", onClick: function () {
                                            if (approval.type === "invoice") {
                                                navigate("/invoices/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "expense") {
                                                navigate("/expenses/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "payment") {
                                                navigate("/payments/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "purchase_order") {
                                                navigate("/lpos/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "leave_request") {
                                                navigate("/leave-management/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "budget") {
                                                navigate("/budgets/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "lpo") {
                                                navigate("/lpos/" + approval.referenceId + "/edit");
                                            }
                                            else if (approval.type === "imprest") {
                                                navigate("/imprests");
                                            }
                                            else {
                                                sonner_1.toast.error("Edit not available for this type");
                                            }
                                        } },
                                        React.createElement(lucide_react_1.Edit, { size: 14 })),
                                    approval.status === "pending" && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", title: "Move to Draft", className: "text-amber-600 hover:bg-amber-50", disabled: deleteApprovalMutation.isPending, onClick: function () {
                                            if (confirm("This will move the document back to draft status, allowing you to edit and re-submit it. Continue?")) {
                                                deleteApprovalMutation.mutate({ id: approval.referenceId, type: approval.type });
                                            }
                                        } },
                                        React.createElement(lucide_react_1.Trash2, { size: 14 }))))))); }))))))),
            showBulkRejectReason && (React.createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" },
                React.createElement(card_1.Card, { className: "max-w-md w-full" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null,
                            "Reject ",
                            selectedIds.size,
                            " Item(s)"),
                        React.createElement(card_1.CardDescription, null, "Please provide a reason for rejecting these approvals")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement(input_1.Input, { placeholder: "Enter rejection reason...", value: bulkRejectionReason, onChange: function (e) { return setBulkRejectionReason(e.target.value); }, className: "w-full" }),
                        React.createElement("div", { className: "flex gap-2 pt-4" },
                            React.createElement(button_1.Button, { variant: "outline", className: "flex-1", onClick: function () {
                                    setShowBulkRejectReason(false);
                                    setBulkRejectionReason("");
                                } }, "Cancel"),
                            React.createElement(button_1.Button, { className: "flex-1 bg-red-600 hover:bg-red-700", onClick: handleBulkReject },
                                React.createElement(lucide_react_1.XCircle, { size: 16, className: "mr-2" }),
                                " Reject All")))))),
            showDetails && selectedApproval && (React.createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
                React.createElement(card_1.Card, { className: "max-w-2xl w-full max-h-[90vh] overflow-y-auto" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null, "Approval Details"),
                                React.createElement(card_1.CardDescription, null, selectedApproval.referenceNo)),
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () {
                                    setShowDetails(false);
                                    setRejectionReason("");
                                } }, "\u2715"))),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Type"),
                                React.createElement("p", { className: "font-medium" }, getTypeIcon(selectedApproval.type).label)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Reference"),
                                React.createElement("p", { className: "font-medium" }, selectedApproval.referenceNo)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Amount"),
                                React.createElement("p", { className: "font-medium" }, formatCurrency(selectedApproval.amount))),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Priority"),
                                React.createElement("p", { className: "font-medium capitalize" }, selectedApproval.priority)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Raiser"),
                                React.createElement("p", { className: "font-medium" }, getUserName(selectedApproval.requestedBy))),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Requested At"),
                                React.createElement("p", { className: "font-medium" }, new Date(selectedApproval.requestedAt).toLocaleString())),
                            selectedApproval.approvedBy && (React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Approver"),
                                React.createElement("p", { className: "font-medium" }, getUserName(selectedApproval.approvedBy)))),
                            selectedApproval.approvedAt && (React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Approval Date"),
                                React.createElement("p", { className: "font-medium" }, new Date(selectedApproval.approvedAt).toLocaleString())))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Description"),
                            React.createElement("p", { className: "text-sm bg-muted p-3 rounded-lg" }, selectedApproval.description)),
                        selectedApproval.approvers && selectedApproval.approvers.length > 0 && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Approvers Required"),
                            React.createElement("div", { className: "flex flex-wrap gap-2" }, selectedApproval.approvers.map(function (approver, idx) { return (React.createElement(badge_1.Badge, { key: approver || "approver-" + idx, variant: "secondary" }, approver)); })))),
                        selectedApproval.status === "pending" && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Rejection Reason (optional)"),
                            React.createElement(input_1.Input, { placeholder: "Enter rejection reason if rejecting...", value: rejectionReason, onChange: function (e) { return setRejectionReason(e.target.value); }, className: "w-full" }))),
                        selectedApproval.status === "pending" && (React.createElement("div", { className: "flex gap-3 pt-4 border-t" },
                            React.createElement(button_1.Button, { variant: "outline", className: "flex-1", disabled: rejectInvoiceMutation.isPending ||
                                    rejectEstimateMutation.isPending ||
                                    rejectPaymentMutation.isPending ||
                                    rejectExpenseMutation.isPending ||
                                    rejectBudgetMutation.isPending ||
                                    rejectLPOMutation.isPending ||
                                    rejectPurchaseOrderMutation.isPending ||
                                    rejectImprestMutation.isPending, onClick: function () {
                                    handleReject(selectedApproval);
                                } },
                                React.createElement(lucide_react_1.XCircle, { size: 16, className: "mr-2" }),
                                " Reject"),
                            React.createElement(button_1.Button, { className: "flex-1 bg-green-600 hover:bg-green-700", disabled: approveInvoiceMutation.isPending ||
                                    approveEstimateMutation.isPending ||
                                    approvePaymentMutation.isPending ||
                                    approveExpenseMutation.isPending ||
                                    approveBudgetMutation.isPending ||
                                    approveLPOMutation.isPending ||
                                    approvePurchaseOrderMutation.isPending ||
                                    approveImprestMutation.isPending, onClick: function () {
                                    handleApprove(selectedApproval);
                                } },
                                React.createElement(lucide_react_1.CheckCircle, { size: 16, className: "mr-2" }),
                                " Approve"))))))))));
}
exports["default"] = Approvals;
