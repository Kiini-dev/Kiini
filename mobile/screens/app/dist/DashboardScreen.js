"use strict";
/**
 * Dashboard / Home screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
var AuthContext_1 = require("../../context/AuthContext");
function DashboardScreen() {
    var user = AuthContext_1.useAuth().user;
    return (react_1["default"].createElement(react_native_1.ScrollView, { contentContainerStyle: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.heading }, "Welcome back"),
        react_1["default"].createElement(react_native_1.Text, { style: styles.subheading },
            (user === null || user === void 0 ? void 0 : user.name) || "Your team",
            ", here are your latest insights."),
        react_1["default"].createElement(react_native_1.View, { style: styles.card },
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardTitle }, "Invoices overview"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardText }, "Open invoices, overdue balances, and recent payments.")),
        react_1["default"].createElement(react_native_1.View, { style: styles.card },
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardTitle }, "Tasks & projects"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardText }, "Track project status and overdue tasks in one place.")),
        react_1["default"].createElement(react_native_1.View, { style: styles.card },
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardTitle }, "Customer activity"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.cardText }, "Latest contact interactions and sales opportunities."))));
}
exports["default"] = DashboardScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: "#f8fafc"
    },
    heading: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 8
    },
    subheading: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 24
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        color: "#111827"
    },
    cardText: {
        color: "#4b5563",
        lineHeight: 22
    }
});
