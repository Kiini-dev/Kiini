"use strict";
/**
 * Loading screen for mobile app
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function LoadingScreen() {
    return (react_1["default"].createElement(react_native_1.View, { style: styles.container },
        react_1["default"].createElement(react_native_1.ActivityIndicator, { size: "large", color: "#3b82f6" }),
        react_1["default"].createElement(react_native_1.Text, { style: styles.text }, "Loading Kiini...")));
}
exports["default"] = LoadingScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: "#1f2937"
    }
});
