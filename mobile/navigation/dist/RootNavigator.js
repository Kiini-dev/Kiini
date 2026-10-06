"use strict";
/**
 * Root Navigator
 * Handles navigation between Auth, Onboarding, and App stacks based on authentication and onboarding state
 */
exports.__esModule = true;
var react_1 = require("react");
var native_stack_1 = require("@react-navigation/native-stack");
var AuthContext_1 = require("../context/AuthContext");
var OnboardingContext_1 = require("../context/OnboardingContext");
var AuthStack_1 = require("./stacks/AuthStack");
var AppStack_1 = require("./stacks/AppStack");
var OnboardingNavigator_1 = require("./OnboardingNavigator");
var LoadingScreen_1 = require("../screens/LoadingScreen");
var Stack = native_stack_1.createNativeStackNavigator();
function RootNavigator() {
    var _a = AuthContext_1.useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var _b = OnboardingContext_1.useOnboarding(), isOnboarding = _b.isOnboarding, hasCompletedOnboarding = _b.hasCompletedOnboarding;
    if (authLoading) {
        return react_1["default"].createElement(LoadingScreen_1["default"], null);
    }
    return (react_1["default"].createElement(Stack.Navigator, { screenOptions: {
            headerShown: false,
            animationEnabled: true
        } }, isAuthenticated ? (isOnboarding ? (react_1["default"].createElement(Stack.Screen, { name: "Onboarding", component: OnboardingNavigator_1["default"] })) : (react_1["default"].createElement(Stack.Screen, { name: "App", component: AppStack_1["default"] }))) : (react_1["default"].createElement(Stack.Screen, { name: "Auth", component: AuthStack_1["default"] }))));
}
exports["default"] = RootNavigator;
