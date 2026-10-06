"use strict";
/**
 * Module Access Control Hook
 * Provides frontend utilities for checking and filtering available modules
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.withModuleAccess = exports.useSubscriptionTier = exports.useModuleAvailability = exports.useAvailableModules = exports.useModuleAccess = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var useAuth_1 = require("@/_core/hooks/useAuth");
var moduleAccess_1 = require("@/../server/modules/moduleAccess");
/**
 * Hook to check if user has access to a specific module
 */
function useModuleAccess(module) {
    var user = useAuth_1.useAuth().user;
    var subscription = trpc_1.trpc.settings.getSubscription.useQuery({ organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "" }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId), retry: 1 }).data;
    return react_1.useMemo(function () {
        if (!subscription)
            return false;
        if (!(user === null || user === void 0 ? void 0 : user.organizationId))
            return true; // Platform admins have everything
        var tier = subscription.tier || "starter";
        return moduleAccess_1.hasModuleAccess(tier, module);
    }, [subscription, user === null || user === void 0 ? void 0 : user.organizationId]);
}
exports.useModuleAccess = useModuleAccess;
/**
 * Hook to get all available modules for user
 */
function useAvailableModules() {
    var user = useAuth_1.useAuth().user;
    var subscription = trpc_1.trpc.settings.getSubscription.useQuery({ organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "" }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId), retry: 1 }).data;
    return react_1.useMemo(function () {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId)) {
            // Platform admins can access all modules
            return Object.keys(moduleAccess_1.MODULE_METADATA);
        }
        if (!subscription)
            return [];
        var tier = subscription.tier || "starter";
        return moduleAccess_1.getAvailableModules(tier);
    }, [subscription, user === null || user === void 0 ? void 0 : user.organizationId]);
}
exports.useAvailableModules = useAvailableModules;
/**
 * Hook to get modules with their availability status and metadata
 */
function useModuleAvailability() {
    var user = useAuth_1.useAuth().user;
    var subscription = trpc_1.trpc.settings.getSubscription.useQuery({ organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "" }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId), retry: 1 }).data;
    return react_1.useMemo(function () {
        var tier = (subscription === null || subscription === void 0 ? void 0 : subscription.tier) ? subscription.tier : "starter";
        return Object.entries(moduleAccess_1.MODULE_METADATA).map(function (_a) {
            var moduleKey = _a[0], metadata = _a[1];
            return ({
                module: moduleKey,
                available: !(user === null || user === void 0 ? void 0 : user.organizationId) ||
                    moduleAccess_1.hasModuleAccess(tier, moduleKey),
                metadata: metadata,
                minTier: metadata.minTier
            });
        });
    }, [subscription, user === null || user === void 0 ? void 0 : user.organizationId]);
}
exports.useModuleAvailability = useModuleAvailability;
/**
 * Hook to get subscription tier
 */
function useSubscriptionTier() {
    var user = useAuth_1.useAuth().user;
    var subscription = trpc_1.trpc.settings.getSubscription.useQuery({ organizationId: (user === null || user === void 0 ? void 0 : user.organizationId) || "" }, { enabled: !!(user === null || user === void 0 ? void 0 : user.organizationId), retry: 1 }).data;
    return react_1.useMemo(function () {
        if (!(user === null || user === void 0 ? void 0 : user.organizationId))
            return "enterprise"; // Platform admins
        return (subscription === null || subscription === void 0 ? void 0 : subscription.tier) || "starter";
    }, [subscription, user === null || user === void 0 ? void 0 : user.organizationId]);
}
exports.useSubscriptionTier = useSubscriptionTier;
/**
 * Utility to conditionally render based on module access
 */
function withModuleAccess(Component, module, fallback) {
    return function ProtectedComponent(props) {
        var hasAccess = useModuleAccess(module);
        if (!hasAccess) {
            return fallback ? ({ fallback: fallback } < />) : className = "p-8 text-center" >
                className;
            "text-muted-foreground" >
                This;
            feature;
            is;
            not;
            available in your;
            subscription;
            tier.
                < /p>
                < /div>;
            ;
        }
        return __assign({}, props) /  > ;
    };
}
exports.withModuleAccess = withModuleAccess;
