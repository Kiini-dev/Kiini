"use strict";
exports.__esModule = true;
exports.useUserLookup = void 0;
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
/**
 * Hook to resolve user IDs to display names.
 * Fetches the user list once and provides a lookup function.
 */
function useUserLookup() {
    var users = trpc_1.trpc.users.listNames.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    }).data;
    var userMap = react_1.useMemo(function () {
        var map = new Map();
        if (users && Array.isArray(users)) {
            for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
                var user = users_1[_i];
                if (user.id && user.name) {
                    map.set(user.id, user.name);
                }
            }
        }
        return map;
    }, [users]);
    var getUserName = function (userId) {
        if (!userId)
            return "-";
        return userMap.get(userId) || userId.slice(0, 8) + "...";
    };
    return { getUserName: getUserName, userMap: userMap, users: users };
}
exports.useUserLookup = useUserLookup;
