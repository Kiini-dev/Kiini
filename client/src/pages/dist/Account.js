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
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var exportCsv_1 = require("@/utils/exportCsv");
var lucide_react_1 = require("lucide-react");
function Account() {
    var _this = this;
    var _a;
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState(false), isEditing = _b[0], setIsEditing = _b[1];
    var _c = react_1.useState(false), pwOpen = _c[0], setPwOpen = _c[1];
    var _d = react_1.useState(false), sessionsOpen = _d[0], setSessionsOpen = _d[1];
    var _e = react_1.useState({ currentPassword: "", newPassword: "", confirmPassword: "" }), pwForm = _e[0], setPwForm = _e[1];
    var changePasswordMutation = trpc_1.trpc.auth.changePassword.useMutation({
        onSuccess: function () { sonner_1.toast.success("Password changed successfully"); setPwOpen(false); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _f = react_1.useState(false), isUploadingAvatar = _f[0], setIsUploadingAvatar = _f[1];
    var _g = react_1.useState(null), avatarPreview = _g[0], setAvatarPreview = _g[1];
    var fileInputRef = react_1.useRef(null);
    var _h = react_1.useState({
        name: (user === null || user === void 0 ? void 0 : user.name) || "",
        email: (user === null || user === void 0 ? void 0 : user.email) || ""
    }), formData = _h[0], setFormData = _h[1];
    var updateProfileMutation = trpc_1.trpc.auth.updateProfile.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Profile updated successfully");
            setIsEditing(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update profile");
        }
    });
    var uploadAvatarMutation = trpc_1.trpc.fileStorage.uploadDocument.useMutation();
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSaveProfile = function () {
        if (!formData.name || !formData.email) {
            sonner_1.toast.error("Please fill in all fields");
            return;
        }
        updateProfileMutation.mutate(formData);
    };
    var handleAvatarChange = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, reader;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            // Validate file type
            if (!file.type.startsWith("image/")) {
                sonner_1.toast.error("Please select an image file");
                return [2 /*return*/];
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                sonner_1.toast.error("File size must be less than 5MB");
                return [2 /*return*/];
            }
            reader = new FileReader();
            reader.onloadend = function () {
                setAvatarPreview(reader.result);
                sonner_1.toast.success("Avatar preview updated. Ready to upload!");
            };
            reader.readAsDataURL(file);
            return [2 /*return*/];
        });
    }); };
    var handleAvatarUpload = function () { return __awaiter(_this, void 0, void 0, function () {
        var file, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0])) {
                        sonner_1.toast.error("Please select an image first");
                        return [2 /*return*/];
                    }
                    setIsUploadingAvatar(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    file = fileInputRef.current.files[0];
                    return [4 /*yield*/, uploadAvatarMutation.mutateAsync({
                            name: "avatar-" + Date.now() + "." + file.name.split('.').pop(),
                            mimeType: file.type,
                            size: file.size,
                            fileUrl: "/uploads/avatars/",
                            documentType: "other"
                        })];
                case 2:
                    _c.sent();
                    sonner_1.toast.success("Avatar uploaded successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _c.sent();
                    sonner_1.toast.error("Failed to upload avatar");
                    return [3 /*break*/, 5];
                case 4:
                    setIsUploadingAvatar(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Account Settings", description: "Manage your account and preferences", icon: React.createElement(lucide_react_1.User, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "Account" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(tabs_1.Tabs, { defaultValue: "profile", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "profile", className: "gap-2" },
                        React.createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                        "Profile"),
                    React.createElement(tabs_1.TabsTrigger, { value: "security", className: "gap-2" },
                        React.createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
                        "Security"),
                    React.createElement(tabs_1.TabsTrigger, { value: "notifications", className: "gap-2" },
                        React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
                        "Notifications"),
                    React.createElement(tabs_1.TabsTrigger, { value: "privacy", className: "gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                        "Privacy")),
                React.createElement(tabs_1.TabsContent, { value: "profile", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Profile Information"),
                            React.createElement(card_1.CardDescription, null, "Update your personal information")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "flex items-center gap-4 pb-6 border-b" },
                                React.createElement("div", { className: "relative group" },
                                    React.createElement("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden" }, avatarPreview ? (React.createElement("img", { src: avatarPreview, alt: "Avatar preview", className: "w-full h-full object-cover" })) : (((_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) || "U")),
                                    React.createElement("button", { onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity", title: "Upload avatar" },
                                        React.createElement(lucide_react_1.Camera, { className: "h-4 w-4" })),
                                    React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleAvatarChange, className: "hidden" })),
                                React.createElement("div", null,
                                    React.createElement("h3", { className: "font-semibold text-lg" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, (user === null || user === void 0 ? void 0 : user.email) || "No email"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground capitalize mt-1" },
                                        "Role: ",
                                        (user === null || user === void 0 ? void 0 : user.role) || "User"))),
                            avatarPreview && (React.createElement("div", { className: "space-y-4 pb-6 border-b" },
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-medium mb-2" }, "Avatar Preview"),
                                    React.createElement("p", { className: "text-sm text-muted-foreground mb-4" }, "Your new avatar is ready to upload"),
                                    React.createElement(button_1.Button, { onClick: handleAvatarUpload, disabled: isUploadingAvatar, className: "gap-2" },
                                        React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                                        isUploadingAvatar ? "Uploading..." : "Upload Avatar")))),
                            isEditing ? (React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "name" }, "Full Name"),
                                    React.createElement(input_1.Input, { id: "name", name: "name", value: formData.name, onChange: handleInputChange, placeholder: "Enter your full name" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address"),
                                    React.createElement(input_1.Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, placeholder: "Enter your email" })),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { onClick: handleSaveProfile, disabled: updateProfileMutation.isPending }, updateProfileMutation.isPending ? "Saving..." : "Save Changes"),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                                            setIsEditing(false);
                                            setFormData({
                                                name: (user === null || user === void 0 ? void 0 : user.name) || "",
                                                email: (user === null || user === void 0 ? void 0 : user.email) || ""
                                            });
                                        } }, "Cancel")))) : (React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Full Name"),
                                    React.createElement("p", { className: "text-base" }, formData.name)),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Email Address"),
                                    React.createElement("p", { className: "text-base" }, formData.email)),
                                React.createElement(button_1.Button, { onClick: function () { return setIsEditing(true); }, variant: "outline" }, "Edit Profile")))))),
                React.createElement(tabs_1.TabsContent, { value: "security", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Security Settings"),
                            React.createElement(card_1.CardDescription, null, "Manage your password and security options")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Change Password"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Update your password regularly to keep your account secure")),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setPwOpen(true); } }, "Change")),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Two-Factor Authentication"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Add an extra layer of security to your account")),
                                    React.createElement(button_1.Button, { variant: "outline", disabled: true, title: "2FA requires admin configuration" }, "Setup")),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Active Sessions"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage your active login sessions")),
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setSessionsOpen(true); } }, "View")),
                                React.createElement(dialog_1.Dialog, { open: sessionsOpen, onOpenChange: setSessionsOpen },
                                    React.createElement(dialog_1.DialogContent, null,
                                        React.createElement(dialog_1.DialogHeader, null,
                                            React.createElement(dialog_1.DialogTitle, null, "Active Sessions")),
                                        React.createElement("div", { className: "space-y-3 py-2" },
                                            React.createElement("div", { className: "flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20" },
                                                React.createElement("div", { className: "flex items-center gap-3" },
                                                    React.createElement("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                                                    React.createElement("div", null,
                                                        React.createElement("p", { className: "text-sm font-medium" }, "Current Session"),
                                                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                                                            navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Browser",
                                                            " on ",
                                                            navigator.platform),
                                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Last active: Just now"))),
                                                React.createElement("span", { className: "text-xs font-medium text-green-600" }, "Active")),
                                            React.createElement("p", { className: "text-xs text-muted-foreground text-center" }, "No other active sessions detected.")),
                                        React.createElement(dialog_1.DialogFooter, null,
                                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setSessionsOpen(false); } }, "Close")))))))),
                React.createElement(tabs_1.TabsContent, { value: "notifications", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Notification Preferences"),
                            React.createElement(card_1.CardDescription, null, "Choose how you want to be notified")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Email Notifications"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Receive updates via email")),
                                    React.createElement("input", { type: "checkbox", className: "w-4 h-4", defaultChecked: true })),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Invoice Reminders"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Get notified about upcoming invoice due dates")),
                                    React.createElement("input", { type: "checkbox", className: "w-4 h-4", defaultChecked: true })),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Payment Confirmations"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Receive notifications when payments are received")),
                                    React.createElement("input", { type: "checkbox", className: "w-4 h-4", defaultChecked: true })),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Low Stock Alerts"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Get notified when inventory is running low")),
                                    React.createElement("input", { type: "checkbox", className: "w-4 h-4" })))))),
                React.createElement(tabs_1.TabsContent, { value: "privacy", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Privacy & Data"),
                            React.createElement(card_1.CardDescription, null, "Control your privacy settings and data")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Data Privacy"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "View our privacy policy and data handling practices")),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return window.open("/privacy-policy", "_blank"); } }, "Read")),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Download Your Data"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Export all your personal data in a portable format")),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { if (user)
                                            exportCsv_1.exportToCsv("account-data", [{ name: user.name, email: user.email, role: user.role, createdAt: String(user.createdAt || "") }]); } }, "Download")),
                                React.createElement("div", { className: "flex items-center justify-between p-4 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium" }, "Delete Account"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Permanently delete your account and all associated data")),
                                    React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return sonner_1.toast.error("Account deletion requires admin approval"); } }, "Delete")))))))),
        React.createElement(dialog_1.Dialog, { open: pwOpen, onOpenChange: setPwOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Change Password")),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "currentPassword" }, "Current Password"),
                        React.createElement(input_1.Input, { id: "currentPassword", type: "password", value: pwForm.currentPassword, onChange: function (e) { return setPwForm(function (p) { return (__assign(__assign({}, p), { currentPassword: e.target.value })); }); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "newPassword" }, "New Password"),
                        React.createElement(input_1.Input, { id: "newPassword", type: "password", value: pwForm.newPassword, onChange: function (e) { return setPwForm(function (p) { return (__assign(__assign({}, p), { newPassword: e.target.value })); }); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm New Password"),
                        React.createElement(input_1.Input, { id: "confirmPassword", type: "password", value: pwForm.confirmPassword, onChange: function (e) { return setPwForm(function (p) { return (__assign(__assign({}, p), { confirmPassword: e.target.value })); }); } }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setPwOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () {
                            return changePasswordMutation.mutate({
                                currentPassword: pwForm.currentPassword,
                                newPassword: pwForm.newPassword,
                                confirmPassword: pwForm.confirmPassword
                            });
                        }, disabled: !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword || changePasswordMutation.isPending }, changePasswordMutation.isPending ? "Saving..." : "Save Password"))))));
}
exports["default"] = Account;
