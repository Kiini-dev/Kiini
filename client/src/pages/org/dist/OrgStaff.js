"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var ROLE_COLORS = {
    super_admin: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    admin: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    manager: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    accountant: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    hr: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    staff: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    project_manager: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    sales_manager: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    ict_manager: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    procurement_manager: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
};
function OrgStaff() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var user = useAuth_1.useAuth().user;
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = trpc_1.trpc.multiTenancy.getMyOrgUsers.useQuery(undefined, {
        enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId) && user.role === "super_admin"
    }), data = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var removeMutation = trpc_1.trpc.multiTenancy.removeOrgUser.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User removed");
            refetch();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var staff = (_a = data === null || data === void 0 ? void 0 : data.users) !== null && _a !== void 0 ? _a : [];
    var filtered = react_1.useMemo(function () {
        return staff.filter(function (member) {
            var _a, _b, _c;
            var searchLower = search.toLowerCase();
            return (((_a = member.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) || ((_b = member.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchLower)) || ((_c = member.role) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchLower)));
        });
    }, [staff, search]);
    var summaryStats = [
        { label: "Total Staff", value: String(staff.length), trend: undefined },
        { label: "Active", value: String(staff.filter(function (s) { return s.isActive; }).length), trend: undefined },
        { label: "Inactive", value: String(staff.filter(function (s) { return !s.isActive; }).length), trend: undefined },
        { label: "Admins", value: String(staff.filter(function (s) { return s.role === "admin" || s.role === "super_admin"; }).length), trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/staff/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/staff/" + id + "/edit");
    };
    var handleDelete = function (id) {
        var member = staff.find(function (s) { return s.id === id; });
        if (confirm("Are you sure you want to remove " + (member === null || member === void 0 ? void 0 : member.name) + " from the organization?")) {
            removeMutation.mutate({ userId: id });
        }
    };
    var handleNewStaff = function () {
        navigate("/org/" + slug + "/staff/new");
    };
    var hasAccess = (user === null || user === void 0 ? void 0 : user.role) === "super_admin";
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Staff Management", description: "Manage organization staff members and their roles", icon: lucide_react_1.Users, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Staff" },
        ], actions: hasAccess && (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleNewStaff },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " Add Staff")), backLink: "/org/" + slug + "/dashboard", hasAccess: hasAccess, accessDeniedMessage: "Only organization administrators can manage staff." },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-wrap" },
                react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search by name, email, or role...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" }))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search ? "No staff match your search" : "No staff members yet"),
                    hasAccess && (react_1["default"].createElement(button_1.Button, { className: "mt-4", size: "sm", onClick: handleNewStaff },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Add First Staff Member")))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Name"),
                                react_1["default"].createElement(table_1.TableHead, null, "Email"),
                                react_1["default"].createElement(table_1.TableHead, null, "Role"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.map(function (member) {
                            var _a, _b;
                            return (react_1["default"].createElement(table_1.TableRow, { key: member.id, className: "hover:bg-muted/30" },
                                react_1["default"].createElement(table_1.TableCell, { className: "font-semibold" }, member.name),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground" }, member.email),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: (_a = ROLE_COLORS[member.role]) !== null && _a !== void 0 ? _a : "bg-muted text-muted-foreground" }, (_b = member.role) === null || _b === void 0 ? void 0 : _b.replace(/_/g, " "))),
                                react_1["default"].createElement(table_1.TableCell, null, member.isActive ? (react_1["default"].createElement("span", { className: "inline-flex items-center gap-1 text-xs text-green-600" },
                                    react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-3.5 w-3.5" }),
                                    " Active")) : (react_1["default"].createElement("span", { className: "inline-flex items-center gap-1 text-xs text-red-500" },
                                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3.5 w-3.5" }),
                                    " Inactive"))),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(member.id); }, title: "View" },
                                        react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    hasAccess && member.id !== (user === null || user === void 0 ? void 0 : user.id) && member.role !== "super_admin" && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(member.id); }, title: "Edit" },
                                            react_1["default"].createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(member.id); }, title: "Remove" },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))));
                        }))))))))));
}
exports["default"] = OrgStaff;
