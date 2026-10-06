"use strict";
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
exports.usePermissionBasedNavigation = void 0;
var useAuth_1 = require("@/_core/hooks/useAuth");
var usePermissions_1 = require("@/_core/hooks/usePermissions");
var permissions_1 = require("@/lib/permissions");
function usePermissionBasedNavigation() {
    var user = useAuth_1.useAuth().user;
    var _a = usePermissions_1.usePermissions(user === null || user === void 0 ? void 0 : user.id), hasDbPermission = _a.hasPermission, permissionsLoading = _a.loading;
    var hasPermission = function (permission) {
        // Super admin and ict_manager have all permissions
        if ((user === null || user === void 0 ? void 0 : user.role) === "super_admin" || (user === null || user === void 0 ? void 0 : user.role) === "ict_manager")
            return true;
        // Check static role-based permissions first
        if (permissions_1.canAccessFeature((user === null || user === void 0 ? void 0 : user.role) || "", permission))
            return true;
        // Fall back to DB-stored per-user permissions
        return hasDbPermission(permission);
    };
    var getFilteredNav = function (items) {
        return items.filter(function (item) {
            // Role-based filtering
            if (item.roles && item.roles.length > 0) {
                if (!item.roles.includes((user === null || user === void 0 ? void 0 : user.role) || ""))
                    return false;
            }
            // Feature-based filtering using role check
            if (item.feature) {
                return permissions_1.canAccessFeature((user === null || user === void 0 ? void 0 : user.role) || "", item.feature);
            }
            return true;
        }).map(function (item) {
            if (item.children) {
                return __assign(__assign({}, item), { children: getFilteredNav(item.children) });
            }
            return item;
        });
    };
    return { getFilteredNav: getFilteredNav, hasPermission: hasPermission, permissionsLoading: permissionsLoading };
}
exports.usePermissionBasedNavigation = usePermissionBasedNavigation;
