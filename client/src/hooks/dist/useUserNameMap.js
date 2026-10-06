"use strict";
exports.__esModule = true;
exports.useUserNameMap = void 0;
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
/**
 * Hook that builds a userId → name lookup map from the users list.
 * Falls back to a truncated ID when the name cannot be resolved.
 */
function useUserNameMap() {
    var usersList = trpc_1.trpc.users.list.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    }).data;
    var userMap = react_1.useMemo(function () {
        var map = new Map();
        if (Array.isArray(usersList)) {
            for (var _i = 0, usersList_1 = usersList; _i < usersList_1.length; _i++) {
                var u = usersList_1[_i];
                if (u.id && u.name)
                    map.set(u.id, u.name);
                else if (u.id && u.email)
                    map.set(u.id, u.email);
            }
        }
        return map;
    }, [usersList]);
    /** Resolve a userId to a display name. */
    var resolve = function (userId) {
        if (!userId)
            return "-";
        return userMap.get(userId) || userId;
    };
    return { userMap: userMap, resolve: resolve };
}
exports.useUserNameMap = useUserNameMap;
