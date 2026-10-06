"use strict";
/**
 * Feature Lock UI Components
 * Crown/Diamond emblems for tier-locked features
 */
exports.__esModule = true;
exports.hasFeature = exports.TIER_FEATURES = exports.isFeatureLocked = exports.FeatureLockIndicator = exports.FeatureLockedOverlay = exports.FeatureLockBadge = void 0;
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function FeatureLockBadge(_a) {
    var tier = _a.tier, className = _a.className, showLabel = _a.showLabel;
    var tierConfig = {
        basic: {
            icon: lucide_react_1.Gem,
            color: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-950",
            borderColor: "border-amber-200 dark:border-amber-800",
            label: "Upgrade"
        },
        pro: {
            icon: lucide_react_1.Crown,
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            borderColor: "border-purple-200 dark:border-purple-800",
            label: "Pro"
        },
        enterprise: {
            icon: lucide_react_1.Crown,
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800",
            label: "Enterprise"
        }
    };
    var config = tierConfig[tier];
    var Icon = config.icon;
    return (React.createElement("div", { className: utils_1.cn("inline-flex items-center gap-1 px-2 py-1 rounded border", config.bgColor, config.borderColor, className) },
        React.createElement(Icon, { className: utils_1.cn("w-3 h-3", config.color) }),
        showLabel && React.createElement("span", { className: "text-xs font-medium" }, config.label)));
}
exports.FeatureLockBadge = FeatureLockBadge;
/**
 * Overlay component for locked features
 * Shows on hover when feature is not in current tier
 */
function FeatureLockedOverlay(_a) {
    var tier = _a.tier, children = _a.children, _b = _a.isLocked, isLocked = _b === void 0 ? true : _b;
    var tierNames = {
        basic: "Basic Plan",
        pro: "Pro Plan",
        enterprise: "Enterprise Plan"
    };
    if (!isLocked) {
        return React.createElement(React.Fragment, null, children);
    }
    return (React.createElement("div", { className: "relative group" },
        children,
        React.createElement("div", { className: "absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto" },
            React.createElement("div", { className: "bg-white dark:bg-slate-950 p-3 rounded shadow-lg text-center" },
                React.createElement("div", { className: "flex items-center justify-center gap-2 mb-1" },
                    tier === "enterprise" ? (React.createElement(lucide_react_1.Crown, { className: "w-4 h-4 text-blue-500" })) : (React.createElement(lucide_react_1.Gem, { className: "w-4 h-4 text-amber-500" })),
                    React.createElement("span", { className: "font-semibold text-sm" }, tierNames[tier])),
                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, "Upgrade to access this feature")))));
}
exports.FeatureLockedOverlay = FeatureLockedOverlay;
/**
 * Indicator showing if feature is locked based on tier
 */
function FeatureLockIndicator(_a) {
    var requiredTier = _a.requiredTier, currentTier = _a.currentTier, featureName = _a.featureName;
    var isLocked = !currentTier || isFeatureLocked(currentTier, requiredTier);
    if (!isLocked)
        return null;
    return (React.createElement("div", { className: "flex items-center gap-2 text-xs" },
        React.createElement(FeatureLockBadge, { tier: requiredTier }),
        featureName && React.createElement("span", { className: "text-slate-600 dark:text-slate-400" }, featureName)));
}
exports.FeatureLockIndicator = FeatureLockIndicator;
/**
 * Check if feature is locked based on current tier
 */
function isFeatureLocked(currentTier, requiredTier) {
    var tierHierarchy = { free: 0, basic: 1, pro: 2, enterprise: 3 };
    var current = tierHierarchy[currentTier] || 0;
    var required = tierHierarchy[requiredTier] || 3;
    return current < required;
}
exports.isFeatureLocked = isFeatureLocked;
/**
 * Get accessible features for a tier
 */
exports.TIER_FEATURES = {
    free: [
        "dashboard",
        "basic_crm",
        "invoices",
        "contacts",
        "5_users",
    ],
    basic: [
        "dashboard",
        "crm",
        "invoices",
        "estimates",
        "contacts",
        "products",
        "services",
        "10_users",
        "basic_reports",
    ],
    pro: [
        "dashboard",
        "crm",
        "invoices",
        "estimates",
        "contacts",
        "products",
        "services",
        "hr_management",
        "payroll",
        "50_users",
        "advanced_reports",
        "automation",
        "bulk_operations",
    ],
    enterprise: [
        "dashboard",
        "crm",
        "invoices",
        "estimates",
        "contacts",
        "products",
        "services",
        "hr_management",
        "payroll",
        "unlimited_users",
        "advanced_reports",
        "automation",
        "bulk_operations",
        "api_access",
        "sso",
        "custom_workflows",
        "dedicated_support",
    ]
};
/**
 * Check if feature is available in tier
 */
function hasFeature(tier, feature) {
    var features = exports.TIER_FEATURES[tier] || [];
    return features.includes(feature);
}
exports.hasFeature = hasFeature;
