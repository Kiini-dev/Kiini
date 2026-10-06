"use strict";
/**
 * useRequireFeature Hook
 * Ensures user has required feature permission before rendering component
 * Automatically redirects to appropriate dashboard if unauthorized
 */
exports.__esModule = true;
exports.useRequireFeature = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var permissions_1 = require("@/lib/permissions");
var sonner_1 = require("sonner");
function useRequireFeature(feature) {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = useAuth_1.useAuth(), user = _b.user, isLoading = _b.isLoading;
    react_1.useEffect(function () {
        if (isLoading)
            return;
        if (!user) {
            sonner_1.toast.error("Please log in to access this page");
            navigate("/");
            return;
        }
        if (!permissions_1.canAccessFeature(user.role, feature)) {
            sonner_1.toast.error("Access denied: You don't have permission for this feature");
            navigate(permissions_1.getDashboardUrl(user.role));
        }
    }, [user, feature, isLoading, navigate]);
    return {
        allowed: !isLoading && user && permissions_1.canAccessFeature(user.role, feature),
        isLoading: isLoading,
        user: user
    };
}
exports.useRequireFeature = useRequireFeature;
