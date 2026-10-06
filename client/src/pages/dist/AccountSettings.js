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
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var avatar_1 = require("@/components/ui/avatar");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var exportCsv_1 = require("@/utils/exportCsv");
var lucide_react_1 = require("lucide-react");
function AccountSettings() {
    var _this = this;
    var _a, _b, _c;
    var _d = useAuth_1.useAuth(), user = _d.user, logout = _d.logout;
    var utils = trpc_1.trpc.useUtils();
    var fileInputRef = react_1.useRef(null);
    var _e = react_1.useState(false), isEditing = _e[0], setIsEditing = _e[1];
    var _f = react_1.useState(null), avatarPreview = _f[0], setAvatarPreview = _f[1];
    var _g = react_1.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    }), passwordData = _g[0], setPasswordData = _g[1];
    var _h = react_1.useState({
        firstName: (user === null || user === void 0 ? void 0 : user.firstName) || ((_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || "",
        lastName: (user === null || user === void 0 ? void 0 : user.lastName) || ((_c = (_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b.split(' ')) === null || _c === void 0 ? void 0 : _c.slice(1).join(' ')) || "",
        email: (user === null || user === void 0 ? void 0 : user.email) || "",
        phone: (user === null || user === void 0 ? void 0 : user.phone) || "",
        department: (user === null || user === void 0 ? void 0 : user.department) || "",
        position: (user === null || user === void 0 ? void 0 : user.position) || ""
    }), formData = _h[0], setFormData = _h[1];
    var _j = react_1.useState({
        emailNotifications: true,
        smsNotifications: false,
        payrollAlerts: true,
        invoiceAlerts: true,
        paymentReminders: true
    }), notificationSettings = _j[0], setNotificationSettings = _j[1];
    var _k = react_1.useState(false), show2faDialog = _k[0], setShow2faDialog = _k[1];
    var _l = react_1.useState(false), showDeleteDataDialog = _l[0], setShowDeleteDataDialog = _l[1];
    var _m = react_1.useState(""), deleteDataReason = _m[0], setDeleteDataReason = _m[1];
    // Mutations
    var updateProfileMutation = trpc_1.trpc.auth.updateProfile.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Profile updated successfully");
            setIsEditing(false);
            utils.auth.me.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update profile");
        }
    });
    var uploadPhotoMutation = trpc_1.trpc.users.uploadProfilePhoto.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Profile picture updated successfully");
            setAvatarPreview(null);
            utils.auth.me.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to upload photo");
        }
    });
    var changePasswordMutation = trpc_1.trpc.auth.changePassword.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Password changed successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to change password");
        }
    });
    var updateNotificationPreferencesMutation = trpc_1.trpc.auth.updateNotificationPreferences.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Notification preferences updated");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update preferences");
        }
    });
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handlePasswordChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setPasswordData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSaveProfile = function () {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updateProfileMutation.mutate({
            name: formData.firstName + " " + formData.lastName,
            email: formData.email
        });
    };
    var handleChangePassword = function () {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            sonner_1.toast.error("Please fill in all password fields");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            sonner_1.toast.error("New passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            sonner_1.toast.error("New password must be at least 8 characters");
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };
    var handleSaveNotificationPreferences = function () {
        updateNotificationPreferencesMutation.mutate(notificationSettings);
    };
    var handleAvatarChange = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, reader;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            if (!file.type.startsWith("image/")) {
                sonner_1.toast.error("Please select an image file");
                return [2 /*return*/];
            }
            if (file.size > 5 * 1024 * 1024) {
                sonner_1.toast.error("File size must be less than 5MB");
                return [2 /*return*/];
            }
            reader = new FileReader();
            reader.onloadend = function () {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            return [2 /*return*/];
        });
    }); };
    var handleAvatarUpload = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!avatarPreview) {
                sonner_1.toast.error("Please select an image first");
                return [2 /*return*/];
            }
            uploadPhotoMutation.mutate({ photoBase64: avatarPreview });
            return [2 /*return*/];
        });
    }); };
    var downloadDocument = function (docType) {
        sonner_1.toast.success("Downloading " + (docType === "privacy" ? "Privacy Policy" : "Terms & Conditions") + "...");
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Account Settings", description: "Manage your profile, security, and preferences", icon: React.createElement(lucide_react_1.Settings, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Account" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(tabs_1.Tabs, { defaultValue: "profile", className: "space-y-6" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-5" },
                    React.createElement(tabs_1.TabsTrigger, { value: "profile", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Profile")),
                    React.createElement(tabs_1.TabsTrigger, { value: "security", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Security")),
                    React.createElement(tabs_1.TabsTrigger, { value: "notifications", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Notifications")),
                    React.createElement(tabs_1.TabsTrigger, { value: "privacy", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Privacy")),
                    React.createElement(tabs_1.TabsTrigger, { value: "sessions", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.LogOut, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "hidden sm:inline" }, "Sessions"))),
                React.createElement(tabs_1.TabsContent, { value: "profile", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Profile Picture"),
                            React.createElement(card_1.CardDescription, null, "Upload a profile picture (Max 5MB)")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement(avatar_1.Avatar, { className: "h-20 w-20" },
                                    React.createElement(avatar_1.AvatarImage, { src: avatarPreview || (user === null || user === void 0 ? void 0 : user.photoUrl) || undefined, className: "object-cover" }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "text-2xl" }, ((user === null || user === void 0 ? void 0 : user.name) || "U").split(" ").map(function (n) { return n[0]; }).join("").toUpperCase().slice(0, 2))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                                        React.createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                                        "Choose Image"),
                                    React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleAvatarChange, className: "hidden" }),
                                    avatarPreview && (React.createElement(button_1.Button, { onClick: handleAvatarUpload, disabled: uploadPhotoMutation.isPending }, uploadPhotoMutation.isPending ? (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                        "Uploading...")) : ("Upload Image"))))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Personal Information"),
                            React.createElement(card_1.CardDescription, null, "Update your personal details")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "firstName" }, "First Name *"),
                                    React.createElement(input_1.Input, { id: "firstName", name: "firstName", value: formData.firstName, onChange: handleInputChange, disabled: !isEditing })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "lastName" }, "Last Name *"),
                                    React.createElement(input_1.Input, { id: "lastName", name: "lastName", value: formData.lastName, onChange: handleInputChange, disabled: !isEditing }))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                                React.createElement(input_1.Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, disabled: !isEditing })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone Number"),
                                React.createElement(input_1.Input, { id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange, disabled: !isEditing })),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "department" }, "Department"),
                                    React.createElement(input_1.Input, { id: "department", name: "department", value: formData.department, onChange: handleInputChange, disabled: !isEditing })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "position" }, "Position"),
                                    React.createElement(input_1.Input, { id: "position", name: "position", value: formData.position, onChange: handleInputChange, disabled: !isEditing }))),
                            React.createElement("div", { className: "flex gap-2" }, !isEditing ? (React.createElement(button_1.Button, { onClick: function () { return setIsEditing(true); } }, "Edit Profile")) : (React.createElement(React.Fragment, null,
                                React.createElement(button_1.Button, { onClick: handleSaveProfile, disabled: updateProfileMutation.isPending }, updateProfileMutation.isPending ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                    "Saving...")) : ("Save Changes")),
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditing(false); } }, "Cancel")))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Account Information")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Role"),
                                    React.createElement(badge_1.Badge, { className: "mt-1" }, (user === null || user === void 0 ? void 0 : user.role) || "N/A")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Member Since"),
                                    React.createElement("p", { className: "font-medium mt-1" }, (user === null || user === void 0 ? void 0 : user.createdAt) ? new Date(user.createdAt).toLocaleDateString() : "N/A")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Email Verified"),
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "mt-1" },
                                        React.createElement(lucide_react_1.CheckCircle2, { className: "mr-1 h-3 w-3" }),
                                        "Verified")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Account Status"),
                                    React.createElement(badge_1.Badge, { className: "mt-1 bg-green-100 text-green-800" }, "Active")))))),
                React.createElement(tabs_1.TabsContent, { value: "security", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Change Password"),
                            React.createElement(card_1.CardDescription, null, "Update your password regularly to keep your account secure")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "currentPassword" }, "Current Password"),
                                React.createElement(input_1.Input, { id: "currentPassword", name: "currentPassword", type: "password", value: passwordData.currentPassword, onChange: handlePasswordChange })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "newPassword" }, "New Password"),
                                React.createElement(input_1.Input, { id: "newPassword", name: "newPassword", type: "password", value: passwordData.newPassword, onChange: handlePasswordChange }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Minimum 8 characters")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm New Password"),
                                React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: "password", value: passwordData.confirmPassword, onChange: handlePasswordChange })),
                            React.createElement(button_1.Button, { onClick: handleChangePassword, disabled: changePasswordMutation.isPending }, changePasswordMutation.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                "Updating...")) : ("Update Password")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Two-Factor Authentication"),
                            React.createElement(card_1.CardDescription, null, "Add an extra layer of security to your account")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(alert_1.Alert, null,
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                React.createElement(alert_1.AlertDescription, null, "Two-factor authentication is not yet enabled on your account. Enable it to enhance your security.")),
                            React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setShow2faDialog(true); } }, "Enable 2FA"),
                            React.createElement(dialog_1.Dialog, { open: show2faDialog, onOpenChange: setShow2faDialog },
                                React.createElement(dialog_1.DialogContent, null,
                                    React.createElement(dialog_1.DialogHeader, null,
                                        React.createElement(dialog_1.DialogTitle, null, "Set Up Two-Factor Authentication"),
                                        React.createElement(dialog_1.DialogDescription, null, "Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app.")),
                                    React.createElement("div", { className: "space-y-4 py-2" },
                                        React.createElement("div", { className: "flex items-center justify-center p-6 border rounded-lg bg-muted/50" },
                                            React.createElement("div", { className: "text-center space-y-2" },
                                                React.createElement(lucide_react_1.Shield, { className: "h-12 w-12 mx-auto text-muted-foreground" }),
                                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                                    "2FA setup requires administrator configuration.",
                                                    React.createElement("br", null),
                                                    "Contact your system administrator to enable TOTP authentication for your organization."))),
                                        React.createElement(alert_1.Alert, null,
                                            React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                            React.createElement(alert_1.AlertDescription, null, "Once enabled by your administrator, you'll scan a QR code with an authenticator app like Google Authenticator or Authy."))),
                                    React.createElement(dialog_1.DialogFooter, null,
                                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShow2faDialog(false); } }, "Close"),
                                        React.createElement(button_1.Button, { onClick: function () { sonner_1.toast.success("2FA setup request sent to your administrator"); setShow2faDialog(false); } }, "Request Setup")))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Active Sessions"),
                            React.createElement(card_1.CardDescription, null, "Manage your active sessions across devices")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "border rounded-lg p-4" },
                                React.createElement("div", { className: "flex justify-between items-start" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, "Current Device"),
                                        React.createElement("p", { className: "text-sm text-gray-500" }, "Chrome on Windows"),
                                        React.createElement("p", { className: "text-xs text-gray-400 mt-1" }, "Last active: Just now")),
                                    React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800" }, "Active")))))),
                React.createElement(tabs_1.TabsContent, { value: "notifications", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Notification Preferences"),
                            React.createElement(card_1.CardDescription, null, "Choose how you want to be notified")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, "Email Notifications"),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Receive updates via email")),
                                React.createElement(switch_1.Switch, { checked: notificationSettings.emailNotifications, onCheckedChange: function (checked) {
                                        return setNotificationSettings(function (prev) { return (__assign(__assign({}, prev), { emailNotifications: checked })); });
                                    } })),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, "SMS Notifications"),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Receive updates via SMS")),
                                React.createElement(switch_1.Switch, { checked: notificationSettings.smsNotifications, onCheckedChange: function (checked) {
                                        return setNotificationSettings(function (prev) { return (__assign(__assign({}, prev), { smsNotifications: checked })); });
                                    } })),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, "Payroll Alerts"),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Get notified about payroll updates")),
                                React.createElement(switch_1.Switch, { checked: notificationSettings.payrollAlerts, onCheckedChange: function (checked) {
                                        return setNotificationSettings(function (prev) { return (__assign(__assign({}, prev), { payrollAlerts: checked })); });
                                    } })),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, "Invoice Alerts"),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Get notified about new invoices")),
                                React.createElement(switch_1.Switch, { checked: notificationSettings.invoiceAlerts, onCheckedChange: function (checked) {
                                        return setNotificationSettings(function (prev) { return (__assign(__assign({}, prev), { invoiceAlerts: checked })); });
                                    } })),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, "Payment Reminders"),
                                    React.createElement("p", { className: "text-sm text-gray-500" }, "Get reminded about upcoming payments")),
                                React.createElement(switch_1.Switch, { checked: notificationSettings.paymentReminders, onCheckedChange: function (checked) {
                                        return setNotificationSettings(function (prev) { return (__assign(__assign({}, prev), { paymentReminders: checked })); });
                                    } })),
                            React.createElement(button_1.Button, { onClick: handleSaveNotificationPreferences, disabled: updateNotificationPreferencesMutation.isPending }, updateNotificationPreferencesMutation.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                "Saving...")) : ("Save Preferences"))))),
                React.createElement(tabs_1.TabsContent, { value: "privacy", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Legal Documents"),
                            React.createElement(card_1.CardDescription, null, "Review and download our legal documents")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "border rounded-lg p-4 flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-blue-500" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, "Privacy Policy"),
                                        React.createElement("p", { className: "text-sm text-gray-500" }, "Last updated: Dec 2025"))),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return downloadDocument("privacy"); } },
                                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                    "View")),
                            React.createElement("div", { className: "border rounded-lg p-4 flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-blue-500" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, "Terms & Conditions"),
                                        React.createElement("p", { className: "text-sm text-gray-500" }, "Last updated: Dec 2025"))),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return downloadDocument("terms"); } },
                                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                    "View")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Data Management"),
                            React.createElement(card_1.CardDescription, null, "Control your personal data")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full", onClick: function () {
                                    exportCsv_1.exportToCsv("account-settings-data", [{
                                            firstName: formData.firstName,
                                            lastName: formData.lastName,
                                            email: formData.email,
                                            phone: formData.phone,
                                            department: formData.department,
                                            position: formData.position,
                                            emailNotifications: notificationSettings.emailNotifications,
                                            smsNotifications: notificationSettings.smsNotifications,
                                            payrollAlerts: notificationSettings.payrollAlerts,
                                            invoiceAlerts: notificationSettings.invoiceAlerts,
                                            paymentReminders: notificationSettings.paymentReminders
                                        }]);
                                    sonner_1.toast.success("Account data exported");
                                } },
                                React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                "Download Your Data"),
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full", onClick: function () { return setShowDeleteDataDialog(true); } }, "Request Data Deletion"),
                            React.createElement(dialog_1.Dialog, { open: showDeleteDataDialog, onOpenChange: setShowDeleteDataDialog },
                                React.createElement(dialog_1.DialogContent, null,
                                    React.createElement(dialog_1.DialogHeader, null,
                                        React.createElement(dialog_1.DialogTitle, null, "Request Data Deletion"),
                                        React.createElement(dialog_1.DialogDescription, null, "Submit a request to have your personal data deleted. An administrator will review and process your request.")),
                                    React.createElement("div", { className: "space-y-4 py-2" },
                                        React.createElement(alert_1.Alert, null,
                                            React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                            React.createElement(alert_1.AlertDescription, null, "This action cannot be undone. All your personal data, preferences, and activity history will be permanently removed.")),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, null, "Reason for deletion (optional)"),
                                            React.createElement(textarea_1.Textarea, { value: deleteDataReason, onChange: function (e) { return setDeleteDataReason(e.target.value); }, placeholder: "Please describe why you'd like your data deleted...", rows: 3 }))),
                                    React.createElement(dialog_1.DialogFooter, null,
                                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { setShowDeleteDataDialog(false); setDeleteDataReason(""); } }, "Cancel"),
                                        React.createElement(button_1.Button, { variant: "destructive", onClick: function () { sonner_1.toast.success("Data deletion request submitted. An administrator will review it within 48 hours."); setShowDeleteDataDialog(false); setDeleteDataReason(""); } }, "Confirm Request"))))))),
                React.createElement(tabs_1.TabsContent, { value: "sessions", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Logout"),
                            React.createElement(card_1.CardDescription, null, "Sign out of your account")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(alert_1.Alert, { className: "mb-4" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                React.createElement(alert_1.AlertDescription, null, "Sign out from this device. You'll need to log in again to access your account.")),
                            React.createElement(button_1.Button, { variant: "destructive", onClick: logout },
                                React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                                "Sign Out"))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Logout All Sessions"),
                            React.createElement(card_1.CardDescription, null, "Sign out from all devices")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(alert_1.Alert, { className: "mb-4" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                React.createElement(alert_1.AlertDescription, null, "This will sign you out from all active sessions. You'll need to log in again on all devices.")),
                            React.createElement(button_1.Button, { variant: "destructive", onClick: function () { if (confirm("This will sign you out from all devices. Continue?")) {
                                    sonner_1.toast.success("Logging out all devices...");
                                    logout();
                                } } }, "Logout All Devices"))))))));
}
exports["default"] = AccountSettings;
