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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.useAuthWithPersistence = void 0;
var const_1 = require("@/const");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var client_1 = require("@trpc/client");
var const_2 = require("@shared/const");
var react_1 = require("react");
/**
 * Enhanced auth hook with persistent login state
 *
 * Features:
 * - Persists user data to localStorage as fallback when cookies fail
 * - Stores JWT token in localStorage for Docker/HTTP environments
 * - Handles hydration to prevent SSR mismatches
 * - Provides role-based routing information
 * - Automatic redirect on unauthenticated access
 */
function useAuthWithPersistence(options) {
    var _this = this;
    var _a = options !== null && options !== void 0 ? options : {}, _b = _a.redirectOnUnauthenticated, redirectOnUnauthenticated = _b === void 0 ? false : _b, _c = _a.redirectPath, redirectPath = _c === void 0 ? const_1.getLoginUrl() : _c;
    var utils = trpc_1.trpc.useUtils();
    // Try to load persisted user and token synchronously from localStorage
    // This is the SOURCE OF TRUTH for who is logged in on protected pages
    var _d = react_1.useState(function () {
        if (typeof window === "undefined")
            return null;
        try {
            var storedUser = localStorage.getItem("auth-user");
            return storedUser ? JSON.parse(storedUser) : null;
        }
        catch (_a) {
            return null;
        }
    }), persistedUser = _d[0], setPersistedUser = _d[1];
    var _e = react_1.useState(function () {
        if (typeof window === "undefined")
            return null;
        return localStorage.getItem("auth-token");
    }), persistedToken = _e[0], setPersistedToken = _e[1];
    // Helper to clear all auth state (token, user, and query cache)
    var clearAuthState = react_1.useCallback(function () {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        setPersistedToken(null);
        setPersistedUser(null);
        // Reset the query to clear loading state
        utils.auth.me.setData(undefined, null);
    }, [utils.auth.me]);
    // Only fetch auth status if we have a token; prevents 401 errors on public pages
    // Use localStorage directly to ensure we have latest token
    var shouldFetchAuth = persistedToken !== null || !!localStorage.getItem("auth-token");
    var meQuery = trpc_1.trpc.auth.me.useQuery(undefined, {
        enabled: shouldFetchAuth,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5
    });
    // Only log every 3rd render to avoid console spam
    var _f = react_1.useState(0), logCounter = _f[0], setLogCounter = _f[1];
    react_1.useEffect(function () {
        setLogCounter(function (c) { return c + 1; });
    }, []);
    if (logCounter % 3 === 0) {
        console.log('[useAuthWithPersistence] meQuery state:', {
            shouldFetchAuth: shouldFetchAuth,
            isLoading: meQuery.isLoading,
            isFetching: meQuery.isFetching,
            hasData: !!meQuery.data,
            hasError: !!meQuery.error,
            status: meQuery.status
        });
    }
    // Only clear auth state on genuine UNAUTHORIZED errors (not network/server errors).
    // A 500 or network error should NOT log the user out — trust localStorage instead.
    react_1.useEffect(function () {
        var _a;
        if (!meQuery.error || !persistedToken)
            return;
        var err = meQuery.error;
        var isUnauthorized = (err instanceof client_1.TRPCClientError &&
            (err.message === const_2.UNAUTHED_ERR_MSG ||
                ((_a = err.data) === null || _a === void 0 ? void 0 : _a.code) === 'UNAUTHORIZED')) ||
            (err instanceof client_1.TRPCClientError && err.message === 'UNAUTHORIZED');
        if (isUnauthorized) {
            clearAuthState();
        }
        // Non-401 errors (5xx, network) — leave localStorage intact so user stays logged in
    }, [meQuery.error, persistedToken, clearAuthState]);
    var logoutMutation = trpc_1.trpc.auth.logout.useMutation({
        onSuccess: function () {
            utils.auth.me.setData(undefined, null);
            localStorage.removeItem("auth-user");
            localStorage.removeItem("auth-token");
            setPersistedUser(null);
            setPersistedToken(null);
        }
    });
    var logout = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    // Clear local state and cache FIRST
                    utils.auth.me.setData(undefined, null);
                    localStorage.removeItem("auth-user");
                    localStorage.removeItem("auth-token");
                    setPersistedUser(null);
                    setPersistedToken(null);
                    // Invalidate the query to clear any cached data
                    return [4 /*yield*/, utils.auth.me.invalidate()];
                case 1:
                    // Invalidate the query to clear any cached data
                    _b.sent();
                    // Then call the server logout endpoint
                    return [4 /*yield*/, mutationHelpers_1["default"](logoutMutation)];
                case 2:
                    // Then call the server logout endpoint
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    if (error_1 instanceof client_1.TRPCClientError &&
                        ((_a = error_1.data) === null || _a === void 0 ? void 0 : _a.code) === "UNAUTHORIZED") {
                        // Already logged out on server, that's fine
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [logoutMutation, utils]);
    // Update persisted user and token when meQuery data changes
    react_1.useEffect(function () {
        var _a;
        console.log('[useAuthWithPersistence] meQuery data changed:', {
            hasData: !!meQuery.data,
            dataType: meQuery.data ? typeof meQuery.data : 'null',
            isLoading: meQuery.isLoading,
            error: (_a = meQuery.error) === null || _a === void 0 ? void 0 : _a.message
        });
        if (meQuery.data) {
            console.log('[useAuthWithPersistence] meQuery.data received:', meQuery.data);
            var _b = meQuery.data, token = _b.token, rest = __rest(_b, ["token"]);
            var userData = rest;
            console.log('[useAuthWithPersistence] Extracted userData:', userData);
            localStorage.setItem("auth-user", JSON.stringify(userData));
            setPersistedUser(userData);
            // Store token if available (from login response)
            if (token) {
                localStorage.setItem("auth-token", token);
                setPersistedToken(token);
            }
        }
        else if (!meQuery.isLoading && meQuery.data === null && !meQuery.error) {
            // Server explicitly returned null (not an error) — user is not authenticated
            console.log('[useAuthWithPersistence] Server returned null user, clearing auth state');
            localStorage.removeItem("auth-user");
            localStorage.removeItem("auth-token");
            setPersistedUser(null);
            setPersistedToken(null);
        }
    }, [meQuery.data, meQuery.isLoading, meQuery.error]);
    // Use backend user if available, otherwise use persisted user
    var user = meQuery.data || persistedUser;
    var state = react_1.useMemo(function () {
        var _a, _b;
        var effectiveUser = user || null;
        // Only block rendering on loading if we have NO persisted user
        // If we have a user from localStorage, render immediately (don't wait for server validation)
        var shouldWaitForQuery = persistedToken !== null && !persistedUser && meQuery.isLoading;
        var isWaitingForAuth = logoutMutation.isPending || shouldWaitForQuery;
        console.log('[useAuthWithPersistence] Computing state:', {
            effectiveUserEmail: effectiveUser === null || effectiveUser === void 0 ? void 0 : effectiveUser.email,
            userSource: meQuery.data ? 'meQuery' : (persistedUser ? 'persistedUser' : 'null'),
            shouldWaitForQuery: shouldWaitForQuery,
            isWaitingForAuth: isWaitingForAuth,
            persistedToken: persistedToken ? 'exists' : 'null',
            persistedUserExists: !!persistedUser,
            meQueryLoading: meQuery.isLoading
        });
        return {
            user: effectiveUser,
            loading: isWaitingForAuth,
            error: (_b = (_a = meQuery.error) !== null && _a !== void 0 ? _a : logoutMutation.error) !== null && _b !== void 0 ? _b : null,
            isAuthenticated: Boolean(effectiveUser)
        };
    }, [
        user,
        meQuery.error,
        meQuery.isLoading,
        logoutMutation.error,
        logoutMutation.isPending,
        persistedToken,
        persistedUser,
    ]);
    react_1.useEffect(function () {
        if (!redirectOnUnauthenticated)
            return;
        if (meQuery.isLoading || logoutMutation.isPending)
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
    ]);
    return __assign(__assign({}, state), { refresh: function () { return meQuery.refetch(); }, logout: logout });
}
exports.useAuthWithPersistence = useAuthWithPersistence;
