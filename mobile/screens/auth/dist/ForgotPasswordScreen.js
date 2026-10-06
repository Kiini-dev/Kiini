"use strict";
/**
 * Forgot Password Screen
 */
exports.__esModule = true;
var react_1 = require("react");
var react_native_1 = require("react-native");
function ForgotPasswordScreen() {
    var _a = react_1.useState(""), email = _a[0], setEmail = _a[1];
    var _b = react_1.useState(""), message = _b[0], setMessage = _b[1];
    var handleSubmit = function () {
        if (!email) {
            return;
        }
        setMessage("If this email is registered, you'll receive reset instructions.");
    };
    return (react_1["default"].createElement(react_native_1.View, { style: styles.container },
        react_1["default"].createElement(react_native_1.Text, { style: styles.title }, "Reset password"),
        react_1["default"].createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Email", value: email, onChangeText: setEmail, keyboardType: "email-address", autoCapitalize: "none" }),
        react_1["default"].createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: handleSubmit },
            react_1["default"].createElement(react_native_1.Text, { style: styles.buttonText }, "Send reset link")),
        message ? react_1["default"].createElement(react_native_1.Text, { style: styles.message }, message) : null));
}
exports["default"] = ForgotPasswordScreen;
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
