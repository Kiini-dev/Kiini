"use strict";
exports.__esModule = true;
exports.RoleBasedDashboard = void 0;
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
/**
 * RoleBasedDashboard component that routes users to their appropriate dashboard
 * based on their role and handles authentication state persistence
 *
 * This component:
 * 1. Checks authentication status from cookies or localStorage
 * 2. Waits for user data to load
 * 3. Routes to role-specific dashboard
 * 4. Persists login state across page reloads
 */
function RoleBasedDashboard() {
    var _a = useAuthWithPersistence_1.useAuthWithPersistence(), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var hasRedirected = react_1.useRef(false);
    react_1.useEffect(function () {
        // Prevent infinite loops by tracking if we've already redirected
        if (hasRedirected.current) {
            return;
        }
        // Wait for hydration to complete before making routing decisions
        if (loading) {
            return;
        }
        // If not authenticated, redirect to login and prevent further redirects
        if (!isAuthenticated) {
            hasRedirected.current = true;
            setLocation("/login");
            return;
        }
        // If authenticated but no user data yet, wait for it
        if (!user) {
            return;
        }
        // Route based on user role
        var role = user.role;
        // Mark that we're about to redirect
        hasRedirected.current = true;
        // Route to role-specific dashboard
        switch (role) {
            case "super_admin":
                setLocation("/crm/super-admin");
                break;
            case "admin":
                setLocation("/crm/admin");
                break;
            case "hr":
                setLocation("/crm/hr");
                break;
            case "accountant":
                setLocation("/crm/accountant");
                break;
            case "project_manager":
                setLocation("/crm/project-manager");
                break;
            case "staff":
                setLocation("/crm/staff");
                break;
            case "client":
                setLocation("/crm/client-portal");
                break;
            case "user":
            default:
                // Default user dashboard - stay on current page or show a general dashboard
                setLocation("/");
                break;
        }
    }, [loading, isAuthenticated, user, setLocation]);
    // Show loading state
    if (loading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" },
            React.createElement("div", { className: "flex flex-col items-center gap-4" },
                React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading dashboard..."))));
    }
    // If not authenticated, return null (useEffect will redirect)
    if (!isAuthenticated) {
        return null;
    }
    // For default user role, render a generic dashboard
    // This can be replaced with a specific default dashboard component
    return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" },
        React.createElement("div", { className: "text-center" },
            React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-4" }, "Welcome to Your Dashboard"),
            React.createElement("p", { className: "text-gray-600" }, "Redirecting to your dashboard..."))));
}
exports.RoleBasedDashboard = RoleBasedDashboard;
exports["default"] = RoleBasedDashboard;
