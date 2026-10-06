"use strict";
/**
 * Invoice list screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function InvoicesScreen() {
    return (react_1["default"].createElement(react_native_1.ScrollView, { contentContainerStyle: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Invoices"),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "INV-0001"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "Due in 7 days \u2022 KES 53,000")),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "INV-0002"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "Overdue \u2022 KES 14,500")),
        react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.button },
            react_1["default"].createElement(react_native_1.Text, { style: styles.buttonText }, "Create new invoice"))));
}
exports["default"] = InvoicesScreen;
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
    item: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb"
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827"
    },
    itemSubtitle: {
        color: "#6b7280",
        marginTop: 4
    },
    button: {
        marginTop: 12,
        height: 52,
        borderRadius: 12,
        backgroundColor: "#3b82f6",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    }
});
