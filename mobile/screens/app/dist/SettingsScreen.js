"use strict";
/**
 * Settings screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var AuthContext_1 = require("../../context/AuthContext");
function SettingsScreen() {
    var signOut = AuthContext_1.useAuth().signOut;
    return (react_1["default"].createElement(react_native_1.ScrollView, { contentContainerStyle: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Settings"),
        react_1["default"].createElement(react_native_1.View, { style: styles.section },
            react_1["default"].createElement(react_native_1.Text, { style: styles.sectionTitle }, "Account"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.sectionText }, "Update your profile and manage login settings.")),
        react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: signOut },
            react_1["default"].createElement(react_native_1.Text, { style: styles.buttonText }, "Sign out"))));
}
exports["default"] = SettingsScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: "#f8fafc"
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 16
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8
    },
    sectionText: {
        color: "#6b7280",
        lineHeight: 22
    },
    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    }
});
