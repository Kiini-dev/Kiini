"use strict";
exports.__esModule = true;
exports.useMaintenanceMode = void 0;
var trpc_1 = require("@/lib/trpc");
function useMaintenanceMode() {
    var _a;
    var data = trpc_1.trpc.settings.getMaintenanceStatus.useQuery(undefined, { retry: false, refetchInterval: 30000 }).data;
    var maintenanceMode = (_a = data === null || data === void 0 ? void 0 : data.enabled) !== null && _a !== void 0 ? _a : false;
    return { maintenanceMode: maintenanceMode, maintenanceData: data };
}
exports.useMaintenanceMode = useMaintenanceMode;
