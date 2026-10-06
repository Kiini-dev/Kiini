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
var trpc_1 = require("@/lib/trpc");
var const_1 = require("@shared/const");
var permissions_1 = require("@/lib/permissions");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@trpc/client");
var client_2 = require("react-dom/client");
var superjson_1 = require("superjson");
var App_1 = require("./App");
var SystemSettingsContext_1 = require("./contexts/SystemSettingsContext");
var const_2 = require("./const");
require("./index.css");
// ensure the Download icon is available globally in case a bundle chunk
// accidentally references it as a global variable (observed in production)
var lucide_react_1 = require("lucide-react");
;
window.Download = lucide_react_1.Download;
var queryClient = new react_query_1.QueryClient();
var isPublicPath = function (pathname) {
    return permissions_1.PUBLIC_ROUTES.some(function (route) {
        if (route === "/") {
            return pathname === "/" || pathname.startsWith("/?");
        }
        return (pathname === route ||
            pathname.startsWith(route + "/") ||
            pathname.startsWith(route + "?"));
    });
};
var redirectToLoginIfUnauthorized = function (error) {
    if (!(error instanceof client_1.TRPCClientError))
        return;
    if (typeof window === "undefined")
        return;
    var isUnauthorized = error.message === const_1.UNAUTHED_ERR_MSG;
    if (!isUnauthorized)
        return;
    var pathname = window.location.pathname;
    if (isPublicPath(pathname))
        return;
    // If localStorage still has a valid user AND token, this UNAUTHORIZED is likely a
    // stale pre-login query completing after the user just logged in, or a race on
    // page load. Bail out — useAuthWithPersistence handles real auth failures.
    var localUser = localStorage.getItem("auth-user");
    var localToken = localStorage.getItem("auth-token");
    if (localUser && localToken) {
        console.warn("[Auth] Ignoring UNAUTHORIZED error — user still in localStorage (stale query).");
        return;
    }
    window.location.href = const_2.getLoginUrl();
};
queryClient.getQueryCache().subscribe(function (event) {
    if (event.type === "updated" && event.action.type === "error") {
        var error = event.query.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Query Error]", error);
    }
});
queryClient.getMutationCache().subscribe(function (event) {
    if (event.type === "updated" && event.action.type === "error") {
        var error = event.mutation.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Mutation Error]", error);
    }
});
// Log initialization status
console.log("[App Init] Starting React app initialization...");
console.log("[App Init] VITE_API_URL env var:", import.meta.env.VITE_API_URL);
console.log("[App Init] Root element:", document.getElementById("root"));
// Initialize tRPC using the same origin as the page so it always hits the
// correct backend regardless of which port the dev/prod server is running on.
var trpcEndpoint = window.location.origin + "/api/trpc";
var trpcClient = trpc_1.trpc.createClient({
    links: [
        client_1.httpBatchLink({
            url: trpcEndpoint,
            transformer: superjson_1["default"],
            fetch: function (input, init) {
                var _a;
                var headers = __assign({}, ((_a = init === null || init === void 0 ? void 0 : init.headers) !== null && _a !== void 0 ? _a : {}));
                // Send token from localStorage as Authorization header ALWAYS for tRPC
                var localToken = localStorage.getItem("auth-token");
                var url = String(input);
                // ALWAYS add token if present - don't check URL
                if (localToken) {
                    headers['Authorization'] = "Bearer " + localToken;
                    console.log('[tRPC fetch] Token added to all requests, URL:', url.substring(0, 60));
                }
                else {
                    console.log('[tRPC fetch] NO token in localStorage - URL:', url.substring(0, 60));
                }
                return globalThis.fetch(input, __assign(__assign({}, (init !== null && init !== void 0 ? init : {})), { credentials: "include", headers: headers }));
            }
        }),
    ]
});
console.log("[App Init] tRPC client created");
try {
    var root = document.getElementById("root");
    if (!root) {
        throw new Error("Root element not found in DOM");
    }
    console.log("[App Init] Creating React root...");
    client_2.createRoot(root).render(React.createElement(trpc_1.trpc.Provider, { client: trpcClient, queryClient: queryClient },
        React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
            React.createElement(SystemSettingsContext_1.SystemSettingsProvider, null,
                React.createElement(App_1["default"], null)))));
    console.log("[App Init] React app rendered successfully");
}
catch (error) {
    console.error("[App Init] FATAL ERROR", error);
    document.body.innerHTML = "\n    <div style=\"color: red; font-family: monospace; padding: 20px;\">\n      <h2>Application initialization failed</h2>\n      <pre>" + String(error) + "</pre>\n    </div>\n  ";
}
