"use strict";
/**
 * Profile Setup Screen
 * Allows user to set up their profile information
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
var async_storage_1 = require("@react-native-async-storage/async-storage");
var OnboardingContext_1 = require("../../context/OnboardingContext");
var constants_1 = require("../../config/constants");
function ProfileSetupScreen() {
    var _this = this;
    var _a = OnboardingContext_1.useOnboarding(), nextStep = _a.nextStep, previousStep = _a.previousStep;
    var _b = react_1.useState({
        firstName: "",
        lastName: "",
        jobTitle: "",
        phone: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var validateForm = function () {
        if (!formData.firstName.trim()) {
            react_native_1.Alert.alert("Validation Error", "First name is required");
            return false;
        }
        if (!formData.lastName.trim()) {
            react_native_1.Alert.alert("Validation Error", "Last name is required");
            return false;
        }
        return true;
    };
    var handleContinue = function () { return __awaiter(_this, void 0, void 0, function () {
        var profileData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateForm())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    profileData = {
                        firstName: formData.firstName.trim(),
                        lastName: formData.lastName.trim(),
                        jobTitle: formData.jobTitle.trim(),
                        phone: formData.phone.trim(),
                        fullName: formData.firstName.trim() + " " + formData.lastName.trim()
                    };
                    return [4 /*yield*/, async_storage_1["default"].setItem(constants_1.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData))];
                case 2:
                    _a.sent();
                    nextStep();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error saving profile:", error_1);
                    react_native_1.Alert.alert("Error", "Failed to save profile information");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_native_1.SafeAreaView, { style: styles.container },
        react_1["default"].createElement(react_native_1.KeyboardAvoidingView, { behavior: react_native_1.Platform.OS === "ios" ? "padding" : "height", style: styles.keyboardAvoid },
            react_1["default"].createElement(react_native_1.ScrollView, { style: styles.scrollContainer, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false },
                react_1["default"].createElement(react_native_1.View, { style: styles.header },
                    react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Set Up Your Profile"),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.subtitle }, "Tell us a bit about yourself to personalize your experience")),
                react_1["default"].createElement(react_native_1.View, { style: styles.formContainer },
                    react_1["default"].createElement(react_native_1.View, { style: styles.avatarContainer },
                        react_1["default"].createElement(react_native_1.View, { style: styles.avatar },
                            react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: "account", size: 48, color: "#9ca3af" })),
                        react_1["default"].createElement(react_native_1.Text, { style: styles.avatarText }, "Profile Picture")),
                    react_1["default"].createElement(themed_1.Input, { label: "First Name *", placeholder: "Enter your first name", value: formData.firstName, onChangeText: function (value) { return handleInputChange("firstName", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Input, { label: "Last Name *", placeholder: "Enter your last name", value: formData.lastName, onChangeText: function (value) { return handleInputChange("lastName", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Input, { label: "Job Title", placeholder: "e.g. Sales Manager, Accountant", value: formData.jobTitle, onChangeText: function (value) { return handleInputChange("jobTitle", value); }, containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }),
                    react_1["default"].createElement(themed_1.Input, { label: "Phone Number", placeholder: "Enter your phone number", value: formData.phone, onChangeText: function (value) { return handleInputChange("phone", value); }, keyboardType: "phone-pad", containerStyle: styles.inputContainer, inputStyle: styles.input, labelStyle: styles.inputLabel }))),
            react_1["default"].createElement(react_native_1.View, { style: styles.footer },
                react_1["default"].createElement(themed_1.Button, { title: "Previous", type: "outline", buttonStyle: styles.secondaryButton, titleStyle: styles.secondaryButtonText, onPress: previousStep, containerStyle: styles.buttonWrapper, disabled: isLoading }),
                react_1["default"].createElement(themed_1.Button, { title: "Continue", buttonStyle: styles.primaryButton, titleStyle: styles.primaryButtonText, onPress: handleContinue, containerStyle: styles.buttonWrapper, loading: isLoading, disabled: isLoading })))));
}
exports["default"] = ProfileSetupScreen;
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
    formContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 32
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12
    },
    avatarText: {
        fontSize: 14,
        color: "#6b7280"
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
    footer: {
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        justifyContent: "space-between",
        backgroundColor: "#ffffff"
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
