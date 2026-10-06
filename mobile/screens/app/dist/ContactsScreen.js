"use strict";
/**
 * Contact list screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function ContactsScreen() {
    return (react_1["default"].createElement(react_native_1.ScrollView, { contentContainerStyle: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Customers"),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "Jane Doe"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "jane.doe@example.com")),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "Acme Corporation"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "Finance team"))));
}
exports["default"] = ContactsScreen;
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
    }
});
