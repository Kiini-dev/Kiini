"use strict";
exports.__esModule = true;
exports.AccountManagerSelector = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function AccountManagerSelector(_a) {
    var clientId = _a.clientId, onSuccess = _a.onSuccess;
    var _b = react_1.useState(false), isEditing = _b[0], setIsEditing = _b[1];
    var _c = react_1.useState(""), selectedUserId = _c[0], setSelectedUserId = _c[1];
    var _d = trpc_1.trpc.clients.getAccountManager.useQuery(clientId), accountManager = _d.data, accountManagerLoading = _d.isLoading, refetchAccountManager = _d.refetch;
    var _e = trpc_1.trpc.users.listForAssignment.useQuery({}), _f = _e.data, users = _f === void 0 ? [] : _f, usersLoading = _e.isLoading;
    var assignMutation = trpc_1.trpc.clients.assignAccountManager.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Account manager assigned successfully");
            setIsEditing(false);
            setSelectedUserId("");
            refetchAccountManager();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to assign account manager");
        }
    });
    var removeMutation = trpc_1.trpc.clients.removeAccountManager.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Account manager removed successfully");
            setIsEditing(false);
            setSelectedUserId("");
            refetchAccountManager();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to remove account manager");
        }
    });
    var handleAssign = function (e) {
        e.preventDefault();
        if (!selectedUserId) {
            sonner_1.toast.error("Please select an account manager");
            return;
        }
        assignMutation.mutate({
            clientId: clientId,
            userId: selectedUserId
        });
    };
    var handleRemove = function () {
        if (confirm("Are you sure you want to remove the account manager?")) {
            removeMutation.mutate(clientId);
        }
    };
    // Suggest sales managers and customer success managers first
    var suggestedUsers = react_1.useMemo(function () {
        var suggested = users.filter(function (u) { return u.role === 'sales_manager' || u.role === 'customer_success_manager'; });
        return suggested;
    }, [users]);
    var otherUsers = react_1.useMemo(function () {
        var suggestedIds = new Set(suggestedUsers.map(function (u) { return u.id; }));
        return users.filter(function (u) { return !suggestedIds.has(u.id); });
    }, [users, suggestedUsers]);
    if (accountManagerLoading || usersLoading) {
        return (React.createElement("div", { className: "flex justify-center items-center h-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" })));
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.User, { className: "h-5 w-5" }),
                "Account Manager"),
            React.createElement(card_1.CardDescription, null, "Assign a team member to manage this client's account")),
        React.createElement(card_1.CardContent, null, accountManager && !isEditing ? (
        /* Current Account Manager Display */
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "p-4 border rounded-lg bg-green-50 border-green-200" },
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" }),
                            React.createElement("span", { className: "font-semibold text-green-900" }, accountManager.employeeName || accountManager.name)),
                        React.createElement("div", { className: "text-sm text-green-800 ml-7" },
                            accountManager.email && React.createElement("div", null, accountManager.email),
                            accountManager.role && React.createElement("div", { className: "capitalize" }, accountManager.role.replace('_', ' ')))),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                setIsEditing(true);
                                setSelectedUserId(accountManager.id);
                            }, className: "text-blue-600 hover:text-blue-700" }, "Change"),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: handleRemove, disabled: removeMutation.isPending, className: "text-red-600 hover:text-red-700 hover:bg-red-50" },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))))) : isEditing ? (
        /* Edit Form */
        React.createElement("form", { onSubmit: handleAssign, className: "space-y-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { className: "text-sm font-medium" }, "Select Account Manager"),
                React.createElement(select_1.Select, { value: selectedUserId, onValueChange: setSelectedUserId },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, { placeholder: "Choose an account manager" })),
                    React.createElement(select_1.SelectContent, null,
                        suggestedUsers.length > 0 && (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "px-2 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50" }, "SUGGESTED FOR THIS ROLE"),
                            suggestedUsers.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-blue-600" }),
                                    user.name,
                                    " (",
                                    user.role.replace('_', ' '),
                                    ")"))); }))),
                        otherUsers.length > 0 && (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "px-2 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50" }, "OTHER TEAM MEMBERS"),
                            otherUsers.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id },
                                user.name,
                                " (",
                                user.role.replace('_', ' '),
                                ")")); })))))),
            React.createElement("div", { className: "flex gap-2 justify-end" },
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () {
                        setIsEditing(false);
                        setSelectedUserId("");
                    } }, "Cancel"),
                React.createElement(button_1.Button, { type: "submit", disabled: assignMutation.isPending || !selectedUserId },
                    assignMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                    accountManager ? 'Update' : 'Assign')))) : (
        /* No Account Manager Assigned */
        React.createElement("div", { className: "space-y-4" },
            React.createElement(alert_1.Alert, null,
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertDescription, null, "No account manager assigned yet.")),
            React.createElement(button_1.Button, { onClick: function () { return setIsEditing(true); }, className: "w-full" },
                React.createElement(lucide_react_1.User, { className: "h-4 w-4 mr-2" }),
                "Assign Account Manager"))))));
}
exports.AccountManagerSelector = AccountManagerSelector;
