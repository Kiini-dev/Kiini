"use strict";
/**
 * Auth Stack Navigator
 * Navigation for unauthenticated users (Login, Signup, Password Reset)
 */
exports.__esModule = true;
var react_1 = require("react");
var native_stack_1 = require("@react-navigation/native-stack");
var LoginScreen_1 = require("../../screens/auth/LoginScreen");
var SignupScreen_1 = require("../../screens/auth/SignupScreen");
var ForgotPasswordScreen_1 = require("../../screens/auth/ForgotPasswordScreen");
var ResetPasswordScreen_1 = require("../../screens/auth/ResetPasswordScreen");
var Stack = native_stack_1.createNativeStackNavigator();
function AuthStack() {
    return (react_1["default"].createElement(Stack.Navigator, { screenOptions: {
            headerShown: false,
            animationEnabled: true,
            cardStyle: { backgroundColor: "#fff" }
        } },
        react_1["default"].createElement(Stack.Screen, { name: "Login", component: LoginScreen_1["default"], options: {
                animationTypeForReplace: "pop"
            } }),
        react_1["default"].createElement(Stack.Screen, { name: "Signup", component: SignupScreen_1["default"], options: {
                presentation: "card"
            } }),
        react_1["default"].createElement(Stack.Screen, { name: "ForgotPassword", component: ForgotPasswordScreen_1["default"], options: {
                presentation: "card"
            } }),
        react_1["default"].createElement(Stack.Screen, { name: "ResetPassword", component: ResetPasswordScreen_1["default"], options: {
                presentation: "card"
            } })));
}
exports["default"] = AuthStack;
