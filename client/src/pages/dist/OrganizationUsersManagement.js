"use strict";
/**
 * Organization Users Management
 * Complete user management for organization admins
 */
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
var useAuth_1 = require("@/_core/hooks/useAuth");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var PhoneInput_1 = require("@/components/PhoneInput");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var spinner_1 = require("@/components/ui/spinner");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
function OrganizationUsersManagement() {
    var _this = this;
    var _a, _b, _c, _d;
    var user = useAuth_1.useAuth().user;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    // Redirect if not org admin
    react_1.useEffect(function () {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId)) {
            navigate("/");
        }
    }, [user, navigate]);
    // State management
    var _f = react_1.useState(""), search = _f[0], setSearch = _f[1];
    var _g = react_1.useState(), roleFilter = _g[0], setRoleFilter = _g[1];
    var _h = react_1.useState(), isActiveFilter = _h[0], setIsActiveFilter = _h[1];
    var _j = react_1.useState("createdAt"), sortBy = _j[0], setSortBy = _j[1];
    var _k = react_1.useState("desc"), sortOrder = _k[0], setSortOrder = _k[1];
    var _l = react_1.useState([]), selectedUsers = _l[0], setSelectedUsers = _l[1];
    var _m = react_1.useState(false), showCreateDialog = _m[0], setShowCreateDialog = _m[1];
    var _o = react_1.useState(false), showEditDialog = _o[0], setShowEditDialog = _o[1];
    var _p = react_1.useState(null), editingUser = _p[0], setEditingUser = _p[1];
    var _q = react_1.useState({
        name: "",
        email: "",
        role: "staff",
        position: "",
        department: "",
        phone: ""
    }), formData = _q[0], setFormData = _q[1];
    // Queries
    var _r = trpc_1.trpc.organizationUsers.list.useQuery({
        organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "",
        search: search || undefined,
        role: roleFilter,
        isActive: isActiveFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: 100,
        offset: 0
    }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId) }), usersData = _r.data, isLoading = _r.isLoading, refetch = _r.refetch;
    var userLimitInfo = trpc_1.trpc.organizationUsers.getUserLimitInfo.useQuery({ organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "" }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId) }).data;
    // Mutations
    var createMutation = trpc_1.trpc.organizationUsers.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User created successfully");
            setShowCreateDialog(false);
            setFormData({ name: "", email: "", role: "staff", position: "", department: "", phone: "" });
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var updateMutation = trpc_1.trpc.organizationUsers.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User updated successfully");
            setShowEditDialog(false);
            setEditingUser(null);
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var deleteMutation = trpc_1.trpc.organizationUsers["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User deleted successfully");
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var bulkDeleteMutation = trpc_1.trpc.organizationUsers.bulkDelete.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Users deleted successfully");
            setSelectedUsers([]);
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    var bulkUpdateMutation = trpc_1.trpc.organizationUsers.bulkUpdate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Users updated successfully");
            setSelectedUsers([]);
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message); }
    });
    // Handlers
    var handleCreateUser = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!(user === null || user === void 0 ? void 0 : user.organizationId))
                return [2 /*return*/];
            createMutation.mutate({
                organizationId: user.organizationId,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                position: formData.position || undefined,
                department: formData.department || undefined,
                phone: formData.phone || undefined
            });
            return [2 /*return*/];
        });
    }); };
    var handleEditUser = function () {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId) || !editingUser)
            return;
        updateMutation.mutate({
            organizationId: user.organizationId,
            userId: editingUser.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            position: formData.position || undefined,
            department: formData.department || undefined,
            phone: formData.phone || undefined
        });
    };
    var handleDeleteUser = function (userId) {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId) || userId === user.id) {
            sonner_1.toast.error("Cannot delete your own account");
            return;
        }
        if (confirm("Are you sure you want to delete this user?")) {
            deleteMutation.mutate({
                organizationId: user.organizationId,
                userId: userId
            });
        }
    };
    var handleBulkDelete = function () {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId) || selectedUsers.length === 0)
            return;
        if (confirm("Delete " + selectedUsers.length + " users?")) {
            bulkDeleteMutation.mutate({
                organizationId: user.organizationId,
                userIds: selectedUsers
            });
        }
    };
    var handleBulkToggleActive = function (isActive) {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId) || selectedUsers.length === 0)
            return;
        bulkUpdateMutation.mutate({
            organizationId: user.organizationId,
            userIds: selectedUsers,
            isActive: isActive
        });
    };
    var toggleUserSelect = function (userId) {
        setSelectedUsers(function (prev) {
            return prev.includes(userId) ? prev.filter(function (id) { return id !== userId; }) : __spreadArrays(prev, [userId]);
        });
    };
    var toggleAllUsers = function () {
        if (!(usersData === null || usersData === void 0 ? void 0 : usersData.users))
            return;
        if (selectedUsers.length === usersData.users.length) {
            setSelectedUsers([]);
        }
        else {
            setSelectedUsers(usersData.users.map(function (u) { return u.id; }));
        }
    };
    var openEditDialog = function (userData) {
        setEditingUser(userData);
        setFormData({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            position: userData.position || "",
            department: userData.department || "",
            phone: userData.phone || ""
        });
        setShowEditDialog(true);
    };
    var isAtUserLimit = (_a = userLimitInfo === null || userLimitInfo === void 0 ? void 0 : userLimitInfo.isAtLimit) !== null && _a !== void 0 ? _a : false;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Organization Users", description: "Manage users and access within your organization", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "Users" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            userLimitInfo && (React.createElement(card_1.Card, { className: isAtUserLimit ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                            React.createElement(card_1.CardTitle, null, "User Allocation")),
                        React.createElement(badge_1.Badge, { variant: isAtUserLimit ? "destructive" : "default" },
                            userLimitInfo.current,
                            " / ",
                            userLimitInfo.limit,
                            " users")),
                    React.createElement("div", { className: "mt-2 flex items-center gap-2" },
                        React.createElement("div", { className: "flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden" },
                            React.createElement("div", { className: "h-full transition-all " + (isAtUserLimit ? "bg-red-500" : "bg-green-500"), style: { width: Math.min((userLimitInfo.current / userLimitInfo.limit) * 100, 100) + "%" } })),
                        React.createElement("span", { className: "text-sm text-slate-600 dark:text-slate-400" },
                            userLimitInfo.remaining,
                            " remaining")),
                    isAtUserLimit && (React.createElement("div", { className: "mt-3 flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-950 rounded" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
                        React.createElement("span", { className: "text-sm text-amber-800 dark:text-amber-200" }, "You've reached your user limit. Upgrade your plan to add more users.")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between gap-4" },
                        React.createElement("div", { className: "flex-1 flex gap-2" },
                            React.createElement("div", { className: "relative flex-1" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
                                React.createElement(input_1.Input, { placeholder: "Search users...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                            React.createElement(select_1.Select, { value: roleFilter || "", onValueChange: function (v) { return setRoleFilter(v || undefined); } },
                                React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Filter by role" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "" }, "All Roles"),
                                    React.createElement(select_1.SelectItem, { value: "super_admin" }, "Super Admin"),
                                    React.createElement(select_1.SelectItem, { value: "admin" }, "Admin"),
                                    React.createElement(select_1.SelectItem, { value: "manager" }, "Manager"),
                                    React.createElement(select_1.SelectItem, { value: "staff" }, "Staff"),
                                    React.createElement(select_1.SelectItem, { value: "viewer" }, "Viewer"),
                                    React.createElement(select_1.SelectItem, { value: "ict_manager" }, "ICT Manager"),
                                    React.createElement(select_1.SelectItem, { value: "project_manager" }, "Project Manager"),
                                    React.createElement(select_1.SelectItem, { value: "hr" }, "HR Manager"),
                                    React.createElement(select_1.SelectItem, { value: "accountant" }, "Accountant"),
                                    React.createElement(select_1.SelectItem, { value: "procurement_manager" }, "Procurement Manager"),
                                    React.createElement(select_1.SelectItem, { value: "sales_manager" }, "Sales Manager"))),
                            React.createElement(select_1.Select, { value: isActiveFilter === undefined ? "" : isActiveFilter ? "active" : "inactive", onValueChange: function (v) {
                                    if (v === "")
                                        setIsActiveFilter(undefined);
                                    else
                                        setIsActiveFilter(v === "active");
                                } },
                                React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "" }, "All Status"),
                                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                    React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive")))),
                        React.createElement(button_1.Button, { onClick: function () {
                                setFormData({ name: "", email: "", role: "staff", position: "", department: "", phone: "" });
                                setShowCreateDialog(true);
                            }, disabled: isAtUserLimit, className: "gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                            "Add User")))),
            selectedUsers.length > 0 && (React.createElement(card_1.Card, { className: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "text-sm font-medium" },
                            selectedUsers.length,
                            " user(s) selected"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleBulkToggleActive(true); } }, "Activate"),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleBulkToggleActive(false); } }, "Deactivate"),
                            React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: handleBulkDelete, disabled: bulkDeleteMutation.isPending },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-1" }),
                                "Delete")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" }, isLoading ? (React.createElement("div", { className: "flex items-center justify-center p-8" },
                    React.createElement(spinner_1.Spinner, { className: "mr-2" }),
                    "Loading users...")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-10" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedUsers.length === ((_b = usersData === null || usersData === void 0 ? void 0 : usersData.users) === null || _b === void 0 ? void 0 : _b.length) && ((_c = usersData === null || usersData === void 0 ? void 0 : usersData.users) === null || _c === void 0 ? void 0 : _c.length) > 0, onCheckedChange: toggleAllUsers })),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                        if (sortBy === "name") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        }
                                        else {
                                            setSortBy("name");
                                            setSortOrder("asc");
                                        }
                                    } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Name",
                                        sortBy === "name" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                        if (sortBy === "email") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        }
                                        else {
                                            setSortBy("email");
                                            setSortOrder("asc");
                                        }
                                    } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Email",
                                        sortBy === "email" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                        if (sortBy === "role") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        }
                                        else {
                                            setSortBy("role");
                                            setSortOrder("asc");
                                        }
                                    } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Role",
                                        sortBy === "role" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Last Signin"),
                                React.createElement(table_1.TableHead, { className: "w-10" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, (_d = usersData === null || usersData === void 0 ? void 0 : usersData.users) === null || _d === void 0 ? void 0 : _d.map(function (userData) { return (React.createElement(table_1.TableRow, { key: userData.id, className: selectedUsers.includes(userData.id) ? "bg-blue-50 dark:bg-blue-950/20" : "" },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(checkbox_1.Checkbox, { checked: selectedUsers.includes(userData.id), onCheckedChange: function () { return toggleUserSelect(userData.id); }, disabled: userData.id === (user === null || user === void 0 ? void 0 : user.id) })),
                            React.createElement(table_1.TableCell, { className: "font-medium" }, userData.name),
                            React.createElement(table_1.TableCell, { className: "text-sm text-slate-600 dark:text-slate-400" }, userData.email),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline" }, userData.role.replace(/_/g, " "))),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, userData.department || "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: userData.isActive ? "default" : "secondary" }, userData.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, { className: "text-sm text-slate-600 dark:text-slate-400" }, userData.lastSignedIn ? new Date(userData.lastSignedIn).toLocaleDateString() : "Never"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(dropdown_menu_1.DropdownMenu, null,
                                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                            React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                    React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return openEditDialog(userData); } },
                                            React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-2" }),
                                            "Edit"),
                                        userData.id !== (user === null || user === void 0 ? void 0 : user.id) && (React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleDeleteUser(userData.id); }, className: "text-red-600 dark:text-red-400" },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                            "Delete"))))))); }))))))),
            React.createElement(dialog_1.Dialog, { open: showCreateDialog || showEditDialog, onOpenChange: function (open) {
                    if (!open) {
                        setShowCreateDialog(false);
                        setShowEditDialog(false);
                        setEditingUser(null);
                    }
                } },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editingUser ? "Edit " + editingUser.name : "Add New User"),
                        React.createElement(dialog_1.DialogDescription, null, editingUser ? "Update user information" : "Invite a new user to your organization")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Name"),
                            React.createElement(input_1.Input, { id: "name", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, placeholder: "Full name" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                            React.createElement(input_1.Input, { id: "email", type: "email", value: formData.email, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }, placeholder: "user@example.com", disabled: !!editingUser })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "role" }, "Role"),
                            React.createElement(select_1.Select, { value: formData.role, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { role: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "viewer" }, "Viewer"),
                                    React.createElement(select_1.SelectItem, { value: "staff" }, "Staff"),
                                    React.createElement(select_1.SelectItem, { value: "manager" }, "Manager"),
                                    React.createElement(select_1.SelectItem, { value: "admin" }, "Admin"),
                                    React.createElement(select_1.SelectItem, { value: "super_admin" }, "Super Admin"),
                                    React.createElement(select_1.SelectItem, { value: "ict_manager" }, "ICT Manager"),
                                    React.createElement(select_1.SelectItem, { value: "project_manager" }, "Project Manager"),
                                    React.createElement(select_1.SelectItem, { value: "hr" }, "HR Manager"),
                                    React.createElement(select_1.SelectItem, { value: "accountant" }, "Accountant"),
                                    React.createElement(select_1.SelectItem, { value: "procurement_manager" }, "Procurement Manager"),
                                    React.createElement(select_1.SelectItem, { value: "sales_manager" }, "Sales Manager")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                            React.createElement(input_1.Input, { id: "department", value: formData.department, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { department: e.target.value })); }, placeholder: "e.g., Sales, HR" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "position" }, "Position"),
                            React.createElement(input_1.Input, { id: "position", value: formData.position, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { position: e.target.value })); }, placeholder: "e.g., Manager" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                            React.createElement(PhoneInput_1.PhoneInput, { id: "phone", value: formData.phone, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { phone: v })); }, placeholder: "700 000 000" }))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                setShowCreateDialog(false);
                                setShowEditDialog(false);
                                setEditingUser(null);
                            } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: editingUser ? handleEditUser : handleCreateUser, disabled: createMutation.isPending || updateMutation.isPending || !formData.name || !formData.email }, editingUser ? "Update" : "Invite")))))));
}
exports["default"] = OrganizationUsersManagement;
