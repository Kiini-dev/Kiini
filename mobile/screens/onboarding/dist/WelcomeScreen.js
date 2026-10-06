"use strict";
/**
 * Welcome Screen
 * First screen in the onboarding flow
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var themed_1 = require("@rneui/themed");
var vector_icons_1 = require("@expo/vector-icons");
var OnboardingContext_1 = require("../../context/OnboardingContext");
var _a = react_native_1.Dimensions.get("window"), width = _a.width, height = _a.height;
function WelcomeScreen() {
    var _a = OnboardingContext_1.useOnboarding(), nextStep = _a.nextStep, skipOnboarding = _a.skipOnboarding;
    return (react_1["default"].createElement(react_native_1.SafeAreaView, { style: styles.container },
        react_1["default"].createElement(react_native_1.View, { style: styles.content },
            react_1["default"].createElement(react_native_1.View, { style: styles.logoContainer },
                react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: "office-building", size: 80, color: "#3b82f6" })),
            react_1["default"].createElement(react_native_1.View, { style: styles.titleContainer },
                react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Welcome to Kiini"),
                react_1["default"].createElement(react_native_1.Text, { style: styles.subtitle }, "Your comprehensive CRM and business management solution")),
            react_1["default"].createElement(react_native_1.View, { style: styles.featuresContainer },
                react_1["default"].createElement(react_native_1.View, { style: styles.featureItem },
                    react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: "file-document-outline", size: 24, color: "#6b7280" }),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.featureText }, "Manage invoices & payments")),
                react_1["default"].createElement(react_native_1.View, { style: styles.featureItem },
                    react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: "contacts-outline", size: 24, color: "#6b7280" }),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.featureText }, "Track clients & contacts")),
                react_1["default"].createElement(react_native_1.View, { style: styles.featureItem },
                    react_1["default"].createElement(vector_icons_1.MaterialCommunityIcons, { name: "briefcase-outline", size: 24, color: "#6b7280" }),
                    react_1["default"].createElement(react_native_1.Text, { style: styles.featureText }, "Organize projects & tasks"))),
            react_1["default"].createElement(react_native_1.View, { style: styles.buttonContainer },
                react_1["default"].createElement(themed_1.Button, { title: "Get Started", buttonStyle: styles.primaryButton, titleStyle: styles.primaryButtonText, onPress: nextStep, containerStyle: styles.buttonWrapper }),
                react_1["default"].createElement(themed_1.Button, { title: "Skip for now", type: "outline", buttonStyle: styles.secondaryButton, titleStyle: styles.secondaryButtonText, onPress: skipOnboarding, containerStyle: styles.buttonWrapper })))));
}
exports["default"] = WelcomeScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: "space-between"
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 40
    },
    titleContainer: {
        alignItems: "center",
        marginVertical: 40
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 12
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20
    },
    featuresContainer: {
        marginVertical: 40
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 16
    },
    featureText: {
        fontSize: 16,
        color: "#374151",
        marginLeft: 16,
        flex: 1
    },
    buttonContainer: {
        marginTop: 40
    },
    buttonWrapper: {
        marginVertical: 8
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
