"use strict";
/**
 * Reset Password Screen
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function ResetPasswordScreen() {
    var _a = react_1.useState(""), password = _a[0], setPassword = _a[1];
    var _b = react_1.useState(""), confirmPassword = _b[0], setConfirmPassword = _b[1];
    var _c = react_1.useState(""), message = _c[0], setMessage = _c[1];
    var handleSubmit = function () {
        if (!password || password !== confirmPassword) {
            setMessage("Passwords must match.");
            return;
        }
        setMessage("Password reset successful. Please sign in.");
    };
    return (react_1["default"].createElement(react_native_1.View, { style: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Set new password"),
        react_1["default"].createElement(react_native_1.TextInput, { style: styles.input, placeholder: "New password", value: password, onChangeText: setPassword, secureTextEntry: true }),
        react_1["default"].createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Confirm password", value: confirmPassword, onChangeText: setConfirmPassword, secureTextEntry: true }),
        react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: handleSubmit },
            react_1["default"].createElement(react_native_1.Text, { style: styles.buttonText }, "Save password")),
        message ? react_1["default"].createElement(react_native_1.Text, { style: styles.message }, message) : null));
}
exports["default"] = ResetPasswordScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: "#f8fafc"
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8
    },
    input: {
        height: 52,
        borderColor: "#d1d5db",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#fff"
    },
    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#3b82f6",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    },
    message: {
        marginTop: 16,
        color: "#065f46"
    }
});
