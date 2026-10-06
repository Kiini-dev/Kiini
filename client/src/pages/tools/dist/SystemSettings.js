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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var DEFAULT_SETTINGS = {
    applicationName: "CRM Platform",
    applicationDescription: "Enterprise CRM and Business Management System",
    maintenanceMode: false,
    maintenanceMessage: "The system is under maintenance. Please try again later.",
    autoBackupEnabled: true,
    backupFrequency: "daily",
    backupRetentionDays: 30,
    emailNotificationsEnabled: true,
    systemLogsEnabled: true,
    apiRateLimitPerMinute: 60,
    sessionTimeoutMinutes: 30,
    twoFactorAuthenticationRequired: false,
    fileUploadLimitMB: 100
};
function SystemSettings() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = permissions_1.useRequireFeature("admin:system:settings"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(DEFAULT_SETTINGS), settings = _c[0], setSettings = _c[1];
    var _d = react_1.useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState(false), isSaving = _e[0], setIsSaving = _e[1];
    // Fetch system settings
    var _f = trpc_1.trpc.settings.getAll.useQuery(), fetchedSettings = _f.data, isFetchingSettings = _f.isLoading;
    var saveMutation = trpc_1.trpc.settings.set.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("System settings saved successfully!");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to save: " + error.message);
        }
    });
    react_1.useEffect(function () {
        if (fetchedSettings && Array.isArray(fetchedSettings)) {
            // Map backend settings to form structure
            var mappedSettings_1 = {};
            for (var _i = 0, fetchedSettings_1 = fetchedSettings; _i < fetchedSettings_1.length; _i++) {
                var setting = fetchedSettings_1[_i];
                if (setting.key === "app_name")
                    mappedSettings_1.applicationName = setting.value;
                if (setting.key === "app_description")
                    mappedSettings_1.applicationDescription = setting.value;
                if (setting.key === "maintenance_mode")
                    mappedSettings_1.maintenanceMode = setting.value === "true";
                if (setting.key === "maintenance_message")
                    mappedSettings_1.maintenanceMessage = setting.value;
                if (setting.key === "backup_enabled")
                    mappedSettings_1.autoBackupEnabled = setting.value === "true";
                if (setting.key === "backup_frequency")
                    mappedSettings_1.backupFrequency = setting.value;
                if (setting.key === "backup_retention_days")
                    mappedSettings_1.backupRetentionDays = parseInt(setting.value);
                if (setting.key === "email_notifications")
                    mappedSettings_1.emailNotificationsEnabled = setting.value === "true";
                if (setting.key === "system_logs")
                    mappedSettings_1.systemLogsEnabled = setting.value === "true";
                if (setting.key === "api_rate_limit")
                    mappedSettings_1.apiRateLimitPerMinute = parseInt(setting.value);
                if (setting.key === "session_timeout")
                    mappedSettings_1.sessionTimeoutMinutes = parseInt(setting.value);
                if (setting.key === "2fa_required")
                    mappedSettings_1.twoFactorAuthenticationRequired = setting.value === "true";
                if (setting.key === "file_upload_limit_mb")
                    mappedSettings_1.fileUploadLimitMB = parseInt(setting.value);
            }
            setSettings(function (prev) { return (__assign(__assign({}, prev), mappedSettings_1)); });
        }
        setIsLoading(false);
    }, [fetchedSettings]);
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var settingsToSave, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    settingsToSave = [
                        { key: "app_name", value: settings.applicationName, category: "general", description: "Application name" },
                        { key: "app_description", value: settings.applicationDescription, category: "general", description: "Application description" },
                        { key: "maintenance_mode", value: String(settings.maintenanceMode), category: "maintenance", description: "Maintenance mode toggle" },
                        { key: "maintenance_message", value: settings.maintenanceMessage, category: "maintenance", description: "Maintenance message" },
                        { key: "backup_enabled", value: String(settings.autoBackupEnabled), category: "backup", description: "Auto backup enabled" },
                        { key: "backup_frequency", value: settings.backupFrequency, category: "backup", description: "Backup frequency" },
                        { key: "backup_retention_days", value: String(settings.backupRetentionDays), category: "backup", description: "Backup retention days" },
                        { key: "email_notifications", value: String(settings.emailNotificationsEnabled), category: "notifications", description: "Email notifications enabled" },
                        { key: "system_logs", value: String(settings.systemLogsEnabled), category: "general", description: "System logs enabled" },
                        { key: "api_rate_limit", value: String(settings.apiRateLimitPerMinute), category: "security", description: "API rate limit per minute" },
                        { key: "session_timeout", value: String(settings.sessionTimeoutMinutes), category: "security", description: "Session timeout in minutes" },
                        { key: "2fa_required", value: String(settings.twoFactorAuthenticationRequired), category: "security", description: "Two-factor authentication required" },
                        { key: "file_upload_limit_mb", value: String(settings.fileUploadLimitMB), category: "general", description: "File upload limit in MB" },
                    ];
                    return [4 /*yield*/, Promise.all(settingsToSave.map(function (s) { return saveMutation.mutateAsync(s); }))];
                case 2:
                    _a.sent();
                    setIsSaving(false);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to save system settings");
                    setIsSaving(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleReset = function () {
        if (confirm("Are you sure you want to reset all settings to defaults?")) {
            setSettings(DEFAULT_SETTINGS);
            sonner_1.toast.success("Settings reset to defaults");
        }
    };
    if (permissionLoading || isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "System Settings", description: "Configure application-wide system settings and preferences", icon: React.createElement(lucide_react_1.Settings, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Settings", href: "/settings" },
                { label: "System Settings" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-screen" },
                React.createElement(spinner_1.Spinner, { className: "size-8" }))));
    }
    if (!allowed) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "System Settings", description: "Configure application-wide settings, security, and backup preferences", icon: React.createElement(lucide_react_1.Settings, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "System Settings" },
        ] },
        React.createElement("div", { className: "space-y-8 max-w-4xl" },
            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-blue-900 dark:text-blue-100 flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }),
                        "System Administration"),
                    React.createElement(card_1.CardDescription, { className: "text-blue-800 dark:text-blue-200" }, "These settings affect the entire application. Changes apply immediately. Edit with caution."))),
            React.createElement(tabs_1.Tabs, { defaultValue: "general", className: "w-full" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    React.createElement(tabs_1.TabsTrigger, { value: "general" }, "General"),
                    React.createElement(tabs_1.TabsTrigger, { value: "maintenance" }, "Maintenance"),
                    React.createElement(tabs_1.TabsTrigger, { value: "backup" }, "Backup"),
                    React.createElement(tabs_1.TabsTrigger, { value: "security" }, "Security")),
                React.createElement(tabs_1.TabsContent, { value: "general", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Application Information"),
                            React.createElement(card_1.CardDescription, null, "Configure basic application information displayed to users")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "appName" }, "Application Name"),
                                React.createElement(input_1.Input, { id: "appName", value: settings.applicationName, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { applicationName: e.target.value }));
                                    }, placeholder: "Enter application name" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "appDesc" }, "Application Description"),
                                React.createElement(textarea_1.Textarea, { id: "appDesc", value: settings.applicationDescription, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { applicationDescription: e.target.value }));
                                    }, placeholder: "Enter application description", rows: 3 })),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "fileLimit" }, "File Upload Limit (MB)"),
                                React.createElement(input_1.Input, { id: "fileLimit", type: "number", value: settings.fileUploadLimitMB, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { fileUploadLimitMB: parseInt(e.target.value) }));
                                    }, min: "1", max: "1000" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Maximum file size allowed for uploads (1-1000 MB)"))))),
                React.createElement(tabs_1.TabsContent, { value: "maintenance", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Maintenance Mode"),
                            React.createElement(card_1.CardDescription, null, "Put the application in maintenance mode to prevent user access")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-base" }, "Enable Maintenance Mode"),
                                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Users will see a maintenance message instead of the application")),
                                React.createElement(switch_1.Switch, { checked: settings.maintenanceMode, onCheckedChange: function (checked) {
                                        return setSettings(__assign(__assign({}, settings), { maintenanceMode: checked }));
                                    } })),
                            settings.maintenanceMode && (React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "mainMsg" }, "Maintenance Message"),
                                React.createElement(textarea_1.Textarea, { id: "mainMsg", value: settings.maintenanceMessage, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { maintenanceMessage: e.target.value }));
                                    }, placeholder: "Enter message to display to users during maintenance", rows: 4 })))))),
                React.createElement(tabs_1.TabsContent, { value: "backup", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Automatic Backups"),
                            React.createElement(card_1.CardDescription, null, "Configure automatic database backup settings")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-base" }, "Enable Automatic Backups"),
                                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Automatically backup the database on a schedule")),
                                React.createElement(switch_1.Switch, { checked: settings.autoBackupEnabled, onCheckedChange: function (checked) {
                                        return setSettings(__assign(__assign({}, settings), { autoBackupEnabled: checked }));
                                    } })),
                            settings.autoBackupEnabled && (React.createElement(React.Fragment, null,
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "frequency" }, "Backup Frequency"),
                                    React.createElement(select_1.Select, { value: settings.backupFrequency, onValueChange: function (value) {
                                            return setSettings(__assign(__assign({}, settings), { backupFrequency: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, { id: "frequency" },
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "daily" }, "Daily"),
                                            React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                            React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly")))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "retention" }, "Backup Retention (Days)"),
                                    React.createElement(input_1.Input, { id: "retention", type: "number", value: settings.backupRetentionDays, onChange: function (e) {
                                            return setSettings(__assign(__assign({}, settings), { backupRetentionDays: parseInt(e.target.value) }));
                                        }, min: "1", max: "365" }),
                                    React.createElement("p", { className: "text-xs text-gray-500" }, "Delete backups older than this many days (1-365 days)"))))))),
                React.createElement(tabs_1.TabsContent, { value: "security", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Security Configuration"),
                            React.createElement(card_1.CardDescription, null, "Configure security settings and access controls")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "sessionTimeout" }, "Session Timeout (Minutes)"),
                                React.createElement(input_1.Input, { id: "sessionTimeout", type: "number", value: settings.sessionTimeoutMinutes, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { sessionTimeoutMinutes: parseInt(e.target.value) }));
                                    }, min: "5", max: "480" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Log out inactive users after this many minutes (5-480 minutes)")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "rateLimit" }, "API Rate Limit (Requests per Minute)"),
                                React.createElement(input_1.Input, { id: "rateLimit", type: "number", value: settings.apiRateLimitPerMinute, onChange: function (e) {
                                        return setSettings(__assign(__assign({}, settings), { apiRateLimitPerMinute: parseInt(e.target.value) }));
                                    }, min: "10", max: "1000" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Maximum API requests allowed per minute (10-1000)")),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-base" }, "Two-Factor Authentication Required"),
                                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Require all users to enable 2FA for account access")),
                                React.createElement(switch_1.Switch, { checked: settings.twoFactorAuthenticationRequired, onCheckedChange: function (checked) {
                                        return setSettings(__assign(__assign({}, settings), { twoFactorAuthenticationRequired: checked }));
                                    } })),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-base" }, "Enable System Logs"),
                                    React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Log all system activities and user actions for audit purposes")),
                                React.createElement(switch_1.Switch, { checked: settings.systemLogsEnabled, onCheckedChange: function (checked) {
                                        return setSettings(__assign(__assign({}, settings), { systemLogsEnabled: checked }));
                                    } })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement(button_1.Button, { onClick: handleSave, disabled: isSaving, className: "flex items-center gap-2" }, isSaving ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                            "Saving...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                            "Save Changes"))),
                        React.createElement(button_1.Button, { variant: "outline", onClick: handleReset },
                            React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                            "Reset to Defaults")))))));
}
exports["default"] = SystemSettings;
