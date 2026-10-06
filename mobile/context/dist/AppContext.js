"use strict";
/**
 * App Context
 * Global app state for mobile, including user and onboarding progress
 */
exports.__esModule = true;
exports.useApp = exports.AppProvider = void 0;
var react_1 = require("react");
var AppContext = react_1.createContext(undefined);
function AppProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState(false), onboardingCompleted = _b[0], setOnboardingCompleted = _b[1];
    return (react_1["default"].createElement(AppContext.Provider, { value: { onboardingCompleted: onboardingCompleted, setOnboardingCompleted: setOnboardingCompleted } }, children));
}
exports.AppProvider = AppProvider;
function useApp() {
    var context = react_1.useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
}
exports.useApp = useApp;
