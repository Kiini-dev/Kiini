"use strict";
/**
 * Projects list screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function ProjectsScreen() {
    return (react_1["default"].createElement(react_native_1.ScrollView, { contentContainerStyle: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Projects"),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "Website redesign"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "In progress \u2022 Due May 24")),
        react_1["default"].createElement(react_native_1.View, { style: styles.item },
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemTitle }, "Payroll automation"),
            react_1["default"].createElement(react_native_1.Text, { style: styles.itemSubtitle }, "Pending approval \u2022 5 tasks")),
        react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.button },
            react_1["default"].createElement(react_native_1.Text, { style: styles.buttonText }, "Add new project"))));
}
exports["default"] = ProjectsScreen;
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
