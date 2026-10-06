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
var spinner_1 = require("@/components/ui/spinner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var PhoneInput_1 = require("@/components/PhoneInput");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var use_toast_1 = require("@/components/ui/use-toast");
var tabs_1 = require("@/components/ui/tabs");
function GlobalSettings() {
    var _this = this;
    var profileData = trpc_1.trpc.auth.me.useQuery({}).data;
    var toast = use_toast_1.useToast().toast;
    var _a = react_1.useState(false), isSaving = _a[0], setIsSaving = _a[1];
    var _b = react_1.useState("profile"), activeTab = _b[0], setActiveTab = _b[1];
    var _c = react_1.useState({
        firstName: (profileData === null || profileData === void 0 ? void 0 : profileData.firstName) || "",
        lastName: (profileData === null || profileData === void 0 ? void 0 : profileData.lastName) || "",
        email: (profileData === null || profileData === void 0 ? void 0 : profileData.email) || "",
        phone: (profileData === null || profileData === void 0 ? void 0 : profileData.phone) || ""
    }), profileSettings = _c[0], setProfileSettings = _c[1];
    var _d = react_1.useState({
        emailNotifications: true,
        systemNotifications: true,
        chatNotifications: true,
        dailyDigest: false
    }), notificationSettings = _d[0], setNotificationSettings = _d[1];
    var _e = react_1.useState({
        profileVisibility: "private",
        activityStatus: true,
        analyticsTracking: false
    }), privacySettings = _e[0], setPrivacySettings = _e[1];
    var handleSaveProfile = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setIsSaving(true);
                // TODO: Call API to save profile settings
                toast({
                    title: "Success",
                    description: "Profile settings saved successfully"
                });
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleSaveNotifications = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setIsSaving(true);
                // TODO: Call API to save notification settings
                toast({
                    title: "Success",
                    description: "Notification settings saved successfully"
                });
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleSavePrivacy = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setIsSaving(true);
                // TODO: Call API to save privacy settings
                toast({
                    title: "Success",
                    description: "Privacy settings saved successfully"
                });
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    if (!profileData) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Settings", description: "Manage your personal settings and preferences", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }] },
        React.createElement("div", { className: "max-w-4xl mx-auto space-y-6" },
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    React.createElement(tabs_1.TabsTrigger, { value: "profile", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Profile")),
                    React.createElement(tabs_1.TabsTrigger, { value: "notifications", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Notifications")),
                    React.createElement(tabs_1.TabsTrigger, { value: "privacy", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Privacy")),
                    React.createElement(tabs_1.TabsTrigger, { value: "accessibility", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Accessibility, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Access"))),
                React.createElement(tabs_1.TabsContent, { value: "profile", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Profile Information"),
                            React.createElement(card_1.CardDescription, null, "Update your personal profile information")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name"),
                                    React.createElement(input_1.Input, { id: "firstName", value: profileSettings.firstName, onChange: function (e) {
                                            return setProfileSettings(__assign(__assign({}, profileSettings), { firstName: e.target.value }));
                                        } })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name"),
                                    React.createElement(input_1.Input, { id: "lastName", value: profileSettings.lastName, onChange: function (e) {
                                            return setProfileSettings(__assign(__assign({}, profileSettings), { lastName: e.target.value }));
                                        } }))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address"),
                                React.createElement(input_1.Input, { id: "email", type: "email", value: profileSettings.email, disabled: true, className: "bg-gray-100" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Email address cannot be changed. Contact support if needed.")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                                React.createElement(PhoneInput_1.PhoneInput, { id: "phone", value: profileSettings.phone, onChange: function (v) {
                                        return setProfileSettings(__assign(__assign({}, profileSettings), { phone: v }));
                                    }, placeholder: "700 000 000" })),
                            React.createElement(button_1.Button, { onClick: handleSaveProfile, disabled: isSaving, className: "w-full" }, isSaving ? "Saving..." : "Save Profile"))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Lock, { className: "h-5 w-5" }),
                                "Password & Security"),
                            React.createElement(card_1.CardDescription, null, "Manage your account security")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full" }, "Change Password"),
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full" }, "Enable Two-Factor Authentication"),
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full" }, "View Active Sessions")))),
                React.createElement(tabs_1.TabsContent, { value: "notifications", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Notification Preferences"),
                            React.createElement(card_1.CardDescription, null, "Control how and when you receive notifications")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement(SettingToggle, { label: "Email Notifications", description: "Receive important updates via email", checked: notificationSettings.emailNotifications, onChange: function (checked) {
                                    return setNotificationSettings(__assign(__assign({}, notificationSettings), { emailNotifications: checked }));
                                } }),
                            React.createElement(SettingToggle, { label: "System Notifications", description: "Receive in-app notifications for system events", checked: notificationSettings.systemNotifications, onChange: function (checked) {
                                    return setNotificationSettings(__assign(__assign({}, notificationSettings), { systemNotifications: checked }));
                                } }),
                            React.createElement(SettingToggle, { label: "Chat Notifications", description: "Get notified when you receive new messages", checked: notificationSettings.chatNotifications, onChange: function (checked) {
                                    return setNotificationSettings(__assign(__assign({}, notificationSettings), { chatNotifications: checked }));
                                } }),
                            React.createElement(SettingToggle, { label: "Daily Digest", description: "Receive a daily summary of important activity", checked: notificationSettings.dailyDigest, onChange: function (checked) {
                                    return setNotificationSettings(__assign(__assign({}, notificationSettings), { dailyDigest: checked }));
                                } }),
                            React.createElement(button_1.Button, { onClick: handleSaveNotifications, disabled: isSaving, className: "w-full" }, isSaving ? "Saving..." : "Save Notification Settings")))),
                React.createElement(tabs_1.TabsContent, { value: "privacy", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Privacy & Data"),
                            React.createElement(card_1.CardDescription, null, "Control your privacy and data sharing preferences")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "profileVisibility" }, "Profile Visibility"),
                                React.createElement("select", { id: "profileVisibility", value: privacySettings.profileVisibility, onChange: function (e) {
                                        return setPrivacySettings(__assign(__assign({}, privacySettings), { profileVisibility: e.target.value }));
                                    }, className: "w-full px-3 py-2 border rounded-md" },
                                    React.createElement("option", { value: "private" }, "Private - Only visible to you"),
                                    React.createElement("option", { value: "org" }, "Organization - Visible to org members"),
                                    React.createElement("option", { value: "public" }, "Public - Visible to all users"))),
                            React.createElement(SettingToggle, { label: "Activity Status", description: "Let others see your online status", checked: privacySettings.activityStatus, onChange: function (checked) {
                                    return setPrivacySettings(__assign(__assign({}, privacySettings), { activityStatus: checked }));
                                } }),
                            React.createElement(SettingToggle, { label: "Analytics Tracking", description: "Help us improve by allowing anonymous usage analytics", checked: privacySettings.analyticsTracking, onChange: function (checked) {
                                    return setPrivacySettings(__assign(__assign({}, privacySettings), { analyticsTracking: checked }));
                                } }),
                            React.createElement(button_1.Button, { onClick: handleSavePrivacy, disabled: isSaving, className: "w-full" }, isSaving ? "Saving..." : "Save Privacy Settings"))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Data & Export")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("p", { className: "text-sm text-gray-600" }, "Download your personal data or delete your account"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", className: "flex-1" }, "Download My Data"),
                                React.createElement(button_1.Button, { variant: "destructive", className: "flex-1" }, "Delete Account"))))),
                React.createElement(tabs_1.TabsContent, { value: "accessibility", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Accessibility Settings"),
                            React.createElement(card_1.CardDescription, null, "Configure accessibility options for better usability")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
                                React.createElement("p", { className: "text-sm text-blue-900" },
                                    React.createElement("strong", null, "Tip:"),
                                    " You can also access quick accessibility options using the floating accessibility icon on the right side of the screen.")),
                            React.createElement(SettingToggle, { label: "High Contrast Mode", description: "Increase contrast for better readability", checked: false, onChange: function () { } }),
                            React.createElement(SettingToggle, { label: "Reduce Motion", description: "Minimize animations and transitions", checked: false, onChange: function () { } }),
                            React.createElement(SettingToggle, { label: "Larger Text", description: "Increase default text size", checked: false, onChange: function () { } }),
                            React.createElement(SettingToggle, { label: "Screen Reader Optimization", description: "Optimize interface for screen readers", checked: false, onChange: function () { } }),
                            React.createElement("p", { className: "text-xs text-gray-500" }, "These settings are managed through the accessibility widget. Changes are saved automatically."))))))));
}
exports["default"] = GlobalSettings;
function SettingToggle(_a) {
    var label = _a.label, description = _a.description, checked = _a.checked, onChange = _a.onChange;
    return (React.createElement("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50" },
        React.createElement("div", null,
            React.createElement("p", { className: "font-medium text-sm" }, label),
            React.createElement("p", { className: "text-xs text-gray-600" }, description)),
        React.createElement("input", { type: "checkbox", checked: checked, onChange: function (e) { return onChange(e.target.checked); }, className: "w-5 h-5 cursor-pointer" })));
}
