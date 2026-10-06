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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.useAuthPersistent = void 0;
var const_1 = require("@/const");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var client_1 = require("@trpc/client");
var react_1 = require("react");
/**
 * Enhanced useAuth hook with persistent localStorage fallback
 * Ensures users stay logged in across page refreshes
 */
function useAuthPersistent(options) {
    var _this = this;
    var _a = options !== null && options !== void 0 ? options : {}, _b = _a.redirectOnUnauthenticated, redirectOnUnauthenticated = _b === void 0 ? false : _b, _c = _a.redirectPath, redirectPath = _c === void 0 ? const_1.getLoginUrl() : _c;
    var utils = trpc_1.trpc.useUtils();
    var _d = react_1.useState(null), persistedUser = _d[0], setPersistedUser = _d[1];
    var _e = react_1.useState(false), isHydrated = _e[0], setIsHydrated = _e[1];
    // Load persisted user from localStorage on mount
    react_1.useEffect(function () {
        var stored = localStorage.getItem("auth-user");
        if (stored) {
            try {
                setPersistedUser(JSON.parse(stored));
            }
            catch (error) {
                localStorage.removeItem("auth-user");
            }
        }
        setIsHydrated(true);
    }, []);
    var meQuery = trpc_1.trpc.auth.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false
    });
    var logoutMutation = trpc_1.trpc.auth.logout.useMutation({
        onSuccess: function () {
            utils.auth.me.setData(undefined, null);
            localStorage.removeItem("auth-user");
            setPersistedUser(null);
        }
    });
    var logout = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Clear local state FIRST to ensure immediate logout
                    utils.auth.me.setData(undefined, null);
                    localStorage.removeItem("auth-user");
                    setPersistedUser(null);
                    return [4 /*yield*/, utils.auth.me.invalidate()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    // Call server logout endpoint
                    return [4 /*yield*/, mutationHelpers_1["default"](logoutMutation)];
                case 3:
                    // Call server logout endpoint
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    if (error_1 instanceof client_1.TRPCClientError &&
                        ((_a = error_1.data) === null || _a === void 0 ? void 0 : _a.code) === "UNAUTHORIZED") {
                        // Already logged out on server, that's fine
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [logoutMutation, utils]);
    // Update persisted user when meQuery data changes
    react_1.useEffect(function () {
        if (meQuery.data) {
            var userData = {
                id: meQuery.data.id,
                email: meQuery.data.email,
                name: meQuery.data.name,
                role: meQuery.data.role,
                loginMethod: meQuery.data.loginMethod
            };
            localStorage.setItem("auth-user", JSON.stringify(userData));
            setPersistedUser(userData);
        }
        else if (!meQuery.isLoading && meQuery.data === null) {
            // User is not authenticated
            localStorage.removeItem("auth-user");
            setPersistedUser(null);
        }
    }, [meQuery.data, meQuery.isLoading]);
    // Use backend user if available, otherwise use persisted user
    var user = meQuery.data || persistedUser;
    var state = react_1.useMemo(function () {
        var _a, _b;
        return {
            user: user || null,
            loading: meQuery.isLoading || logoutMutation.isPending || !isHydrated,
            error: (_b = (_a = meQuery.error) !== null && _a !== void 0 ? _a : logoutMutation.error) !== null && _b !== void 0 ? _b : null,
            isAuthenticated: Boolean(user)
        };
    }, [
        user,
        meQuery.error,
        meQuery.isLoading,
        logoutMutation.error,
        logoutMutation.isPending,
        isHydrated,
    ]);
    react_1.useEffect(function () {
        if (!redirectOnUnauthenticated)
            return;
        if (meQuery.isLoading || logoutMutation.isPending || !isHydrated)
            return;
        if (state.user)
            return;
        if (typeof window === "undefined")
            return;
        if (window.location.pathname === redirectPath)
            return;
        window.location.href = redirectPath;
    }, [
        redirectOnUnauthenticated,
        redirectPath,
        logoutMutation.isPending,
        meQuery.isLoading,
        state.user,
        isHydrated,
    ]);
    return __assign(__assign({}, state), { refresh: function () { return meQuery.refetch(); }, logout: logout });
}
exports.useAuthPersistent = useAuthPersistent;
