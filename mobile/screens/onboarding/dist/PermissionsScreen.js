"use strict";
/**
 * Permissions Screen
 * Requests necessary app permissions
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
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var themed_1 = require("@rneui/themed");
var vector_icons_1 = require("@expo/vector-icons");
var Notifications = require("expo-notifications");
var OnboardingContext_1 = require("../../context/OnboardingContext");
function PermissionsScreen() {
    var _this = this;
    var _a = OnboardingContext_1.useOnboarding(), nextStep = _a.nextStep, previousStep = _a.previousStep;
    var _b = react_1.useState([
        {
            id: "notifications",
            title: "Push Notifications",
            description: "Receive reminders for invoices, payments, and important updates",
            icon: "bell-outline",
            required: false,
            granted: false
        },
        {
            id: "storage",
            title: "Storage Access",
            description: "Save and access files, documents, and offline data",
            icon: "folder-outline",
            required: true,
            granted: true
        },
    ]), permissions = _b[0], setPermissions = _b[1];
    var requestNotificationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var status, granted_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Notifications.requestPermissionsAsync()];
                case 1:
                    status = (_a.sent()).status;
                    granted_1 = status === "granted";
                    setPermissions(function (prev) {
                        return prev.map(function (p) {
                            return p.id === "notifications" ? __assign(__assign({}, p), { granted: granted_1 }) : p;
                        });
                    });
                    if (!granted_1) {
                        react_native_1.Alert.alert("Notifications Disabled", "You can enable notifications later in your device settings.", [{ text: "OK" }]);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error requesting notification permission:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleContinue = function () {
        var requiredPermissions = permissions.filter(function (p) { return p.required && !p.granted; });
        if (requiredPermissions.length > 0) {
            react_native_1.Alert.alert("Required Permissions", "Please grant all required permissions to continue.", [{ text: "OK" }]);
            return;
        }
        nextStep();
    };
    var togglePermission = function (permissionId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(permissionId === "notifications")) return [3 /*break*/, 2];
                    return [4 /*yield*/, requestNotificationPermission()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_native_1.SafeAreaView, { style: styles.container },
        react_1["default"].createElement(react_native_1.View, { style: styles.header },
            react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "App Permissions"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.subtitle }, "Grant permissions to get the best experience")),
        react_1["default"].createElement(react_native_1.View, { style: styles.permissionsContainer }, permissions.map(function (permission) { return (react_1["default"].createElement(react_native_1.View, { key: permission.id, style: styles.permissionCard },
            react_1["default"].createElement(react_native_1.View, { style: styles.permissionHeader },
                react_1["default"].createElement(react_native_1.View, { style: styles.iconContainer },
                    react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: permission.icon, size: 24, color: "#3b82f6" })),
                react_1["default"].createElement(react_native_1.View, { style: styles.permissionInfo },
                    react_1["default"].createElement(react_native_1.Text, { style: styles.permissionTitle },
                        permission.title,
                        permission.required && react_1["default"].createElement(react_native_1.Text, { style: styles.required }, "*")),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.permissionDescription }, permission.description))),
            react_1["default"].createElement(themed_1.CheckBox, { checked: permission.granted, onPress: function () { return togglePermission(permission.id); }, checkedColor: "#3b82f6", containerStyle: styles.checkbox }))); })),
        react_1["default"].createElement(react_native_1.View, { style: styles.noteContainer },
            react_1["default"].createElement(react_native_1.Text, { style: styles.note }, "* Required permissions are necessary for core app functionality")),
        react_1["default"].createElement(react_native_1.View, { style: styles.footer },
            react_1["default"].createElement(themed_1.Button, { title: "Previous", type: "outline", buttonStyle: styles.secondaryButton, titleStyle: styles.secondaryButtonText, onPress: previousStep, containerStyle: styles.buttonWrapper }),
            react_1["default"].createElement(themed_1.Button, { title: "Continue", buttonStyle: styles.primaryButton, titleStyle: styles.primaryButtonText, onPress: handleContinue, containerStyle: styles.buttonWrapper }))));
}
exports["default"] = PermissionsScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        alignItems: "center"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 24
    },
    permissionsContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20
    },
    permissionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
    },
    permissionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1
    },
    iconContainer: {
        marginRight: 16,
        marginTop: 2
    },
    permissionInfo: {
        flex: 1
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4
    },
    required: {
        color: "#ef4444"
    },
    permissionDescription: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20
    },
    checkbox: {
        backgroundColor: "transparent",
        borderWidth: 0,
        margin: 0,
        padding: 0
    },
    noteContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20
    },
    note: {
        fontSize: 12,
        color: "#9ca3af",
        textAlign: "center",
        fontStyle: "italic"
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        justifyContent: "space-between"
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 8
    },
    primaryButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        paddingVertical: 16
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600"
    },
    secondaryButton: {
        borderColor: "#d1d5db",
        borderRadius: 12,
        paddingVertical: 16
    },
    secondaryButtonText: {
        color: "#6b7280",
        fontSize: 16,
        fontWeight: "600"
    }
});
