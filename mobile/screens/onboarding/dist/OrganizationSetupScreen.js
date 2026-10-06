"use strict";
/**
 * Organization Setup Screen
 * Allows user to set up their organization or join existing one
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
var async_storage_1 = require("@react-native-async-storage/async-storage");
var OnboardingContext_1 = require("../../context/OnboardingContext");
var constants_1 = require("../../config/constants");
function OrganizationSetupScreen() {
    var _this = this;
    var _a = OnboardingContext_1.useOnboarding(), completeOnboarding = _a.completeOnboarding, previousStep = _a.previousStep;
    var _b = react_1.useState("create"), setupMode = _b[0], setSetupMode = _b[1];
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState({
        name: "",
        industry: "",
        size: ""
    }), createForm = _d[0], setCreateForm = _d[1];
    var _e = react_1.useState({
        inviteCode: ""
    }), joinForm = _e[0], setJoinForm = _e[1];
    var handleCreateInputChange = function (field, value) {
        setCreateForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleJoinInputChange = function (field, value) {
        setJoinForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var validateCreateForm = function () {
        if (!createForm.name.trim()) {
            react_native_1.Alert.alert("Validation Error", "Organization name is required");
            return false;
        }
        return true;
    };
    var validateJoinForm = function () {
        if (!joinForm.inviteCode.trim()) {
            react_native_1.Alert.alert("Validation Error", "Invite code is required");
            return false;
        }
        return true;
    };
    var handleCreateOrganization = function () { return __awaiter(_this, void 0, void 0, function () {
        var orgData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateCreateForm())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    orgData = {
                        setupMode: "create",
                        organization: {
                            name: createForm.name.trim(),
                            industry: createForm.industry.trim(),
                            size: createForm.size.trim()
                        }
                    };
                    return [4 /*yield*/, async_storage_1["default"].setItem(constants_1.STORAGE_KEYS.ORGANIZATION_SETUP, JSON.stringify(orgData))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, completeOnboarding()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error creating organization:", error_1);
                    react_native_1.Alert.alert("Error", "Failed to create organization");
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleJoinOrganization = function () { return __awaiter(_this, void 0, void 0, function () {
        var orgData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateJoinForm())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    orgData = {
                        setupMode: "join",
                        inviteCode: joinForm.inviteCode.trim()
                    };
                    return [4 /*yield*/, async_storage_1["default"].setItem(constants_1.STORAGE_KEYS.ORGANIZATION_SETUP, JSON.stringify(orgData))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, completeOnboarding()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error joining organization:", error_2);
                    react_native_1.Alert.alert("Error", "Failed to join organization");
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_native_1.SafeAreaView, { style: styles.container },
        react_1["default"].createElement(react_native_1.KeyboardAvoidingView, { behavior: react_native_1.Platform.OS === "ios" ? "padding" : "height", style: styles.keyboardAvoid },
            react_1["default"].createElement(react_native_1.ScrollView, { style: styles.scrollContainer, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false },
                react_1["default"].createElement(react_native_1.View, { style: styles.header },
                    react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Set Up Organization"),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.subtitle }, "Create a new organization or join an existing one")),
                react_1["default"].createElement(react_native_1.View, { style: styles.modeSelector },
                    react_1["default"].createElement(themed_1.Button, { title: "Create New", type: setupMode === "create" ? "solid" : "outline", buttonStyle: setupMode === "create" ? styles.activeModeButton : styles.inactiveModeButton, titleStyle: setupMode === "create" ? styles.activeModeText : styles.inactiveModeText, onPress: function () { return setSetupMode("create"); }, containerStyle: styles.modeButtonContainer }),
                    react_1["default"].createElement(themed_1.Button, { title: "Join Existing", type: setupMode === "join" ? "solid" : "outline", buttonStyle: setupMode === "join" ? styles.activeModeButton : styles.inactiveModeButton, titleStyle: setupMode === "join" ? styles.activeModeText : styles.inactiveModeText, onPress: function () { return setSetupMode("join"); }, containerStyle: styles.modeButtonContainer })),
                setupMode === "create" ? (react_1["default"].createElement(themed_1.Card, { containerStyle: styles.formCard },
                    react_1["default"].createElement(themed_1.Card.Title, { style: styles.cardTitle }, "Create Organization"),
                    react_1["default"].createElement(themed_1.Card.Divider, null),
                    react_1["default"].createElement(themed_1.Input, { label: "Organization Name *", placeholder: "Enter organization name", value: createForm.name, onChangeText: function (value) { return handleCreateInputChange("name", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Input, { label: "Industry", placeholder: "e.g. Technology, Healthcare, Finance", value: createForm.industry, onChangeText: function (value) { return handleCreateInputChange("industry", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Input, { label: "Company Size", placeholder: "e.g. 1-10, 11-50, 51-200", value: createForm.size, onChangeText: function (value) { return handleCreateInputChange("size", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Button, { title: "Create Organization", buttonStyle: styles.primaryButton, titleStyle: styles.primaryButtonText, onPress: handleCreateOrganization, containerStyle: styles.formButton, loading: isLoading, disabled: isLoading }))) : (react_1["default"].createElement(themed_1.Card, { containerStyle: styles.formCard },
                    react_1["default"].createElement(themed_1.Card.Title, { style: styles.cardTitle }, "Join Organization"),
                    react_1["default"].createElement(themed_1.Card.Divider, null),
                    react_1["default"].createElement(themed_1.Input, { label: "Invite Code *", placeholder: "Enter invite code", value: joinForm.inviteCode, onChangeText: function (value) { return handleJoinInputChange("inviteCode", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.helpText }, "Ask your organization admin for an invite code"),
                    react_1["default"].createElement(themed_1.Button, { title: "Join Organization", buttonStyle: styles.primaryButton, titleStyle: styles.primaryButtonText, onPress: handleJoinOrganization, containerStyle: styles.formButton, loading: isLoading, disabled: isLoading })))),
            react_1["default"].createElement(react_native_1.View, { style: styles.footer },
                react_1["default"].createElement(themed_1.Button, { title: "Previous", type: "outline", buttonStyle: styles.secondaryButton, titleStyle: styles.secondaryButtonText, onPress: previousStep, containerStyle: styles.buttonWrapper, disabled: isLoading })))));
}
exports["default"] = OrganizationSetupScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    keyboardAvoid: {
        flex: 1
    },
    scrollContainer: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1
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
    modeSelector: {
        flexDirection: "row",
        paddingHorizontal: 24,
        marginBottom: 20
    },
    modeButtonContainer: {
        flex: 1,
        marginHorizontal: 8
    },
    activeModeButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        paddingVertical: 12
    },
    inactiveModeButton: {
        borderColor: "#d1d5db",
        borderRadius: 12,
        paddingVertical: 12
    },
    activeModeText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff"
    },
    inactiveModeText: {
        color: "#6b7280",
        fontSize: 16,
        fontWeight: "600"
    },
    formCard: {
        marginHorizontal: 24,
        borderRadius: 12,
        padding: 20
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937"
    },
    inputContainer: {
        marginBottom: 16
    },
    input: {
        fontSize: 16,
        color: "#1f2937"
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8
    },
    helpText: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 20,
        fontStyle: "italic"
    },
    formButton: {
        marginTop: 20
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
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        backgroundColor: "#ffffff"
    },
    buttonWrapper: {
        marginHorizontal: 8
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
