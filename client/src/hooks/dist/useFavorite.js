"use strict";
exports.__esModule = true;
exports.useFavorite = void 0;
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
/**
 * Hook to manage star/favorite toggle on detail pages.
 * Returns { isStarred, toggleStar, isLoading }
 */
function useFavorite(entityType, entityId, entityName) {
    var _a;
    var utils = trpc_1.trpc.useUtils();
    var _b = trpc_1.trpc.favorites.isStarred.useQuery({ entityType: entityType, entityId: entityId }, { enabled: !!entityId, staleTime: 30000 }), data = _b.data, checking = _b.isLoading;
    var toggleMutation = trpc_1.trpc.favorites.toggle.useMutation({
        onSuccess: function (result) {
            utils.favorites.isStarred.invalidate({ entityType: entityType, entityId: entityId });
            utils.favorites.list.invalidate();
            sonner_1.toast.success(result.starred ? "Added to favorites" : "Removed from favorites");
        },
        onError: function () {
            sonner_1.toast.error("Failed to update favorite");
        }
    });
    var toggleStar = function () {
        toggleMutation.mutate({ entityType: entityType, entityId: entityId, entityName: entityName });
    };
    return {
        isStarred: (_a = data === null || data === void 0 ? void 0 : data.starred) !== null && _a !== void 0 ? _a : false,
        toggleStar: toggleStar,
        isLoading: checking || toggleMutation.isPending
    };
}
exports.useFavorite = useFavorite;
