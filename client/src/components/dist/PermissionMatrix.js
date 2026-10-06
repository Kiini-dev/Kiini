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
var lucide_react_1 = require("lucide-react");
/**
 * Permission Matrix Component
 * Allows super-admins to configure granular permissions for users/roles
 * Shows a matrix of modules × actions with toggle controls
 */
function PermissionMatrix(_a) {
    var _this = this;
    var organizationId = _a.organizationId, role = _a.role, userId = _a.userId;
    var _b = react_1.useState(new Set(['accounting', 'invoicing', 'hr', 'crm'])), expandedModules = _b[0], setExpandedModules = _b[1];
    var _c = react_1.useState({}), permissions = _c[0], setPermissions = _c[1];
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(false), saving = _e[0], setSaving = _e[1];
    var _f = react_1.useState(false), changed = _f[0], setChanged = _f[1];
    // Define available modules and their actions
    var moduleActions = {
        accounting: ['view', 'create_entry', 'edit_entry', 'delete_entry', 'approve', 'export'],
        invoicing: ['view', 'create', 'edit', 'delete', 'send', 'mark_paid', 'create_credit_note'],
        payments: ['view', 'record_payment', 'refund', 'reconcile', 'export'],
        crm: ['view', 'create_client', 'edit_client', 'delete_client', 'manage_opportunities', 'export'],
        hr: ['view', 'manage_employees', 'view_salary', 'edit_salary', 'approve_leave', 'export'],
        payroll: ['view', 'process_payroll', 'generate_payslip', 'send_payslip', 'export'],
        projects: ['view', 'create_project', 'edit_project', 'delete_project', 'manage_tasks', 'export'],
        procurement: ['view', 'create_lpo', 'edit_lpo', 'approve_lpo', 'manage_suppliers', 'export'],
        reports: ['view', 'generate_report', 'schedule_report', 'share_report', 'export'],
        communications: ['view', 'send_message', 'bulk_actions', 'manage_templates', 'export'],
        ai_insights: ['view', 'export_insights', 'configure_alerts', 'export'],
        security: ['view', 'manage_users', 'audit_logs', 'export_logs']
    };
    // Load permissions
    react_1.useEffect(function () {
        var loadPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
            var defaultPerms_1;
            return __generator(this, function (_a) {
                try {
                    setLoading(true);
                    defaultPerms_1 = {};
                    Object.entries(moduleActions).forEach(function (_a) {
                        var module = _a[0], actions = _a[1];
                        actions.forEach(function (action) {
                            defaultPerms_1[module + ":" + action] = Math.random() > 0.5;
                        });
                    });
                    setPermissions(defaultPerms_1);
                    setLoading(false);
                }
                catch (error) {
                    console.error('Error loading permissions:', error);
                    setLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        loadPermissions();
    }, [organizationId, userId]);
    var toggleModule = function (module) {
        var newExpanded = new Set(expandedModules);
        if (newExpanded.has(module)) {
            newExpanded["delete"](module);
        }
        else {
            newExpanded.add(module);
        }
        setExpandedModules(newExpanded);
    };
    var togglePermission = function (module, action, value) {
        var _a;
        var key = module + ":" + action;
        var newPermissions = __assign(__assign({}, permissions), (_a = {}, _a[key] = value, _a));
        setPermissions(newPermissions);
        setChanged(true);
    };
    var toggleModuleAll = function (module, value) {
        var newPermissions = __assign({}, permissions);
        moduleActions[module].forEach(function (action) {
            newPermissions[module + ":" + action] = value;
        });
        setPermissions(newPermissions);
        setChanged(true);
    };
    var savePermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setSaving(true);
                // TODO: Call API to save permissions
                // await trpc.multiTenancy.grantPermission.mutate({ organizationId, userId, ...permissions });
                console.log('Saving permissions:', permissions);
                setChanged(false);
                setSaving(false);
            }
            catch (error) {
                console.error('Error saving permissions:', error);
                setSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    var exportPermissions = function () {
        var data = {
            organizationId: organizationId,
            role: role,
            userId: userId,
            permissions: permissions,
            exportedAt: new Date().toISOString()
        };
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "permissions-" + organizationId + "-" + new Date().toISOString().split('T')[0] + ".json";
        a.click();
    };
    var getModuleStats = function (module) {
        var actions = moduleActions[module];
        var granted = actions.filter(function (a) { return permissions[module + ":" + a]; }).length;
        return granted + "/" + actions.length;
    };
    if (loading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center p-8" },
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" }),
                react_1["default"].createElement("p", { className: "text-gray-600" }, "Loading permissions..."))));
    }
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Permission Matrix"),
                react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, userId ? "Configure permissions for user" : "Configure permissions for role: " + role)),
            react_1["default"].createElement("div", { className: "flex gap-3" },
                react_1["default"].createElement("button", { onClick: exportPermissions, className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Download, { size: 18 }),
                    "Export"),
                react_1["default"].createElement("button", { disabled: !changed || saving, onClick: savePermissions, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2" }, saving ? 'Saving...' : 'Save Changes'))),
        react_1["default"].createElement("div", { className: "flex gap-8 p-4 bg-blue-50 rounded-lg text-sm" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Check, { size: 18, className: "text-green-600" }),
                react_1["default"].createElement("span", null, "Permission Granted")),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.X, { size: 18, className: "text-gray-400" }),
                react_1["default"].createElement("span", null, "Permission Denied"))),
        react_1["default"].createElement("div", { className: "space-y-4" }, Object.entries(moduleActions).map(function (_a) {
            var module = _a[0], actions = _a[1];
            var isExpanded = expandedModules.has(module);
            var stats = getModuleStats(module);
            return (react_1["default"].createElement("div", { key: module, className: "border border-gray-200 rounded-lg overflow-hidden" },
                react_1["default"].createElement("button", { onClick: function () { return toggleModule(module); }, className: "w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900 transition" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        isExpanded ? (react_1["default"].createElement(lucide_react_1.ChevronDown, { size: 20, className: "text-gray-600" })) : (react_1["default"].createElement(lucide_react_1.ChevronRight, { size: 20, className: "text-gray-600" })),
                        react_1["default"].createElement("div", { className: "capitalize" }, module.replace('_', ' ')),
                        react_1["default"].createElement("span", { className: "text-sm text-gray-600 ml-2" },
                            "(",
                            stats,
                            " granted)")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2", onClick: function (e) { return e.stopPropagation(); } },
                        react_1["default"].createElement("button", { onClick: function (e) {
                                e.stopPropagation();
                                toggleModuleAll(module, !actions.every(function (a) { return permissions[module + ":" + a]; }));
                            }, className: "px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100" }, actions.every(function (a) { return permissions[module + ":" + a]; }) ? 'Revoke All' : 'Grant All'))),
                isExpanded && (react_1["default"].createElement("div", { className: "px-6 py-4 bg-white border-t border-gray-200 space-y-3" }, actions.map(function (action) {
                    var key = module + ":" + action;
                    var isGranted = permissions[key];
                    return (react_1["default"].createElement("div", { key: key, className: "flex items-center justify-between" },
                        react_1["default"].createElement("label", { className: "flex items-center gap-3 cursor-pointer flex-1" },
                            react_1["default"].createElement("input", { type: "checkbox", checked: isGranted, onChange: function (e) { return togglePermission(module, action, e.target.checked); }, className: "w-4 h-4 rounded border-gray-300 text-blue-600" }),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "font-medium text-gray-900 capitalize" }, action.replace('_', ' ')),
                                react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                                    react_1["default"].createElement("span", { className: "inline-block px-2 py-1 bg-gray-100 rounded mt-1" },
                                        module,
                                        ":",
                                        action)))),
                        isGranted ? (react_1["default"].createElement(lucide_react_1.Check, { size: 20, className: "text-green-600" })) : (react_1["default"].createElement(lucide_react_1.X, { size: 20, className: "text-gray-300" }))));
                })))));
        })),
        react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-lg" },
            react_1["default"].createElement("p", { className: "text-sm text-gray-700" },
                react_1["default"].createElement("strong", null, Object.values(permissions).filter(Boolean).length),
                ' ',
                "of",
                ' ',
                react_1["default"].createElement("strong", null, Object.keys(permissions).length),
                ' ',
                "permissions granted")),
        changed && (react_1["default"].createElement("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between" },
            react_1["default"].createElement("span", { className: "text-yellow-800" }, "You have unsaved changes"),
            react_1["default"].createElement("button", { onClick: savePermissions, disabled: saving, className: "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400" }, saving ? 'Saving...' : 'Save Now')))));
}
exports["default"] = PermissionMatrix;
