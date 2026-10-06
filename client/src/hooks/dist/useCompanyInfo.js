"use strict";
exports.__esModule = true;
exports.useCompanyInfo = void 0;
/**
 * Hook to fetch company information from settings.
 * Use this instead of hardcoding company name, email, phone, address, etc.
 */
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
function useCompanyInfo() {
    var data = trpc_1.trpc.settings.getByCategory.useQuery({ category: "company" }).data;
    return react_1.useMemo(function () {
        var map = {};
        if (Array.isArray(data)) {
            data.forEach(function (r) { var _a; if (r.key)
                map[r.key] = (_a = r.value) !== null && _a !== void 0 ? _a : ""; });
        }
        else if (data && typeof data === "object") {
            Object.assign(map, data);
        }
        return {
            name: map.companyName || map.name || import.meta.env.VITE_APP_TITLE || "Your Company",
            email: map.email || map.companyEmail || "",
            phone: map.phone || "",
            address: map.address || "",
            website: map.website || "",
            tagline: map.tagline || "",
            poBox: map.poBox || ""
        };
    }, [data]);
}
exports.useCompanyInfo = useCompanyInfo;
