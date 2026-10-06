"use strict";
exports.__esModule = true;
exports.useMaintenanceModeEnforcement = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var useMaintenanceMode_1 = require("./useMaintenanceMode");
var permissions_1 = require("@/lib/permissions");
function useMaintenanceModeEnforcement() {
    var user = useAuth_1.useAuth().user;
    var maintenanceMode = useMaintenanceMode_1.useMaintenanceMode().maintenanceMode;
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var prevMaintenance = react_1.useRef(null);
    // Only GLOBAL (non-org-scoped) super_admin/ict_manager can bypass maintenance.
    // Org-scoped super_admins have organizationId set and must follow maintenance like all other org users.
    var canBypass = !(user === null || user === void 0 ? void 0 : user.organizationId) && ((user === null || user === void 0 ? void 0 : user.role) === "super_admin" || (user === null || user === void 0 ? void 0 : user.role) === "ict_manager");
    var isRestrictedByMaintenance = maintenanceMode && !canBypass;
    // Redirect to dashboard when maintenance is disabled
    react_1.useEffect(function () {
        if (prevMaintenance.current === true && maintenanceMode === false && user) {
            // For org users, redirect to their org dashboard
            var orgMatch = location.match(/^\/org\/([^/]+)/);
            if (orgMatch) {
                navigate("/org/" + orgMatch[1] + "/dashboard");
            }
            else {
                navigate(permissions_1.getDashboardUrl(user.role));
            }
        }
        prevMaintenance.current = maintenanceMode;
    }, [maintenanceMode, user, navigate, location]);
    return { maintenanceMode: maintenanceMode, canBypass: canBypass, isRestrictedByMaintenance: isRestrictedByMaintenance };
}
exports.useMaintenanceModeEnforcement = useMaintenanceModeEnforcement;
