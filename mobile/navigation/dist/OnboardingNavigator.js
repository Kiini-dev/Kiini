"use strict";
/**
 * Onboarding Navigator
 * Manages the onboarding flow screens
 */
exports.__esModule = true;
var react_1 = require("react");
var native_stack_1 = require("@react-navigation/native-stack");
var OnboardingContext_1 = require("../context/OnboardingContext");
var WelcomeScreen_1 = require("../screens/onboarding/WelcomeScreen");
var FeaturesScreen_1 = require("../screens/onboarding/FeaturesScreen");
var PermissionsScreen_1 = require("../screens/onboarding/PermissionsScreen");
var ProfileSetupScreen_1 = require("../screens/onboarding/ProfileSetupScreen");
var OrganizationSetupScreen_1 = require("../screens/onboarding/OrganizationSetupScreen");
var Stack = native_stack_1.createNativeStackNavigator();
function OnboardingNavigator() {
    var currentStep = OnboardingContext_1.useOnboarding().currentStep;
    var getCurrentScreen = function () {
        switch (currentStep) {
            case 0:
                return "Welcome";
            case 1:
                return "Features";
            case 2:
                return "Permissions";
            case 3:
                return "ProfileSetup";
            case 4:
                return "OrganizationSetup";
            default:
                return "Welcome";
        }
    };
    return (react_1["default"].createElement(Stack.Navigator, { screenOptions: {
            headerShown: false,
            animationEnabled: true,
            gestureEnabled: false
        }, initialRouteName: getCurrentScreen() },
        react_1["default"].createElement(Stack.Screen, { name: "Welcome", component: WelcomeScreen_1["default"] }),
        react_1["default"].createElement(Stack.Screen, { name: "Features", component: FeaturesScreen_1["default"] }),
        react_1["default"].createElement(Stack.Screen, { name: "Permissions", component: PermissionsScreen_1["default"] }),
        react_1["default"].createElement(Stack.Screen, { name: "ProfileSetup", component: ProfileSetupScreen_1["default"] }),
        react_1["default"].createElement(Stack.Screen, { name: "OrganizationSetup", component: OrganizationSetupScreen_1["default"] })));
}
exports["default"] = OnboardingNavigator;
