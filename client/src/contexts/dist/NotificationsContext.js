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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useNotifications = exports.NotificationsProvider = void 0;
var react_1 = require("react");
// ─── Context ────────────────────────────────────────────────────────────────
var NotificationsContext = react_1.createContext({
    notifications: [],
    unreadCount: 0,
    markAllRead: function () { },
    markRead: function () { },
    clearAll: function () { }
});
// ─── Provider ────────────────────────────────────────────────────────────────
var MAX_NOTIFICATIONS = 50;
var RECONNECT_DELAY_MS = 5000;
function NotificationsProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState([]), notifications = _b[0], setNotifications = _b[1];
    var esRef = react_1.useRef(null);
    var retryRef = react_1.useRef(null);
    var mountedRef = react_1.useRef(true);
    var connect = react_1.useCallback(function () {
        if (!mountedRef.current)
            return;
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
        // Build URL — include auth token as query param so EventSource can authenticate
        var token = localStorage.getItem("auth-token");
        // Don't open EventSource when user is not authenticated. This avoids
        // repeated 401 responses and native EventSource retry storms which can
        // keep the browser tab spinner active.
        if (!token) {
            // Schedule a passive retry to check for token later without opening sockets
            if (!mountedRef.current)
                return;
            if (retryRef.current)
                clearTimeout(retryRef.current);
            retryRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
            return;
        }
        var url = "/api/sse/notifications?token=" + encodeURIComponent(token);
        var es = new EventSource(url, { withCredentials: true });
        esRef.current = es;
        es.onmessage = function (event) {
            if (!mountedRef.current)
                return;
            try {
                var data_1 = JSON.parse(event.data);
                // Skip the initial "Connected" info ping from silent rendering
                if (data_1.type === "info" && data_1.title === "Connected")
                    return;
                setNotifications(function (prev) {
                    var next = __spreadArrays([
                        __assign(__assign({}, data_1), { read: false })
                    ], prev).slice(0, MAX_NOTIFICATIONS);
                    return next;
                });
            }
            catch (_a) {
                // ignore malformed events
            }
        };
        es.onerror = function () {
            // Close the failed EventSource (stops browser's native retry too).
            // Schedule our own reconnect so we can build a fresh EventSource instance
            // with a new socket, avoiding HTTP/1.1 keep-alive socket reuse issues.
            es.close();
            esRef.current = null;
            if (!mountedRef.current)
                return;
            // Wait before reconnecting to avoid rapid retry storms
            retryRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        };
    }, []);
    react_1.useEffect(function () {
        mountedRef.current = true;
        connect();
        return function () {
            var _a;
            mountedRef.current = false;
            (_a = esRef.current) === null || _a === void 0 ? void 0 : _a.close();
            if (retryRef.current)
                clearTimeout(retryRef.current);
        };
    }, [connect]);
    var markRead = react_1.useCallback(function (id) {
        setNotifications(function (prev) {
            return prev.map(function (n) { return (n.id === id ? __assign(__assign({}, n), { read: true }) : n); });
        });
    }, []);
    var markAllRead = react_1.useCallback(function () {
        setNotifications(function (prev) { return prev.map(function (n) { return (__assign(__assign({}, n), { read: true })); }); });
    }, []);
    var clearAll = react_1.useCallback(function () {
        setNotifications([]);
    }, []);
    var unreadCount = notifications.filter(function (n) { return !n.read; }).length;
    return (react_1["default"].createElement(NotificationsContext.Provider, { value: { notifications: notifications, unreadCount: unreadCount, markAllRead: markAllRead, markRead: markRead, clearAll: clearAll } }, children));
}
exports.NotificationsProvider = NotificationsProvider;
// ─── Hook ────────────────────────────────────────────────────────────────────
function useNotifications() {
    return react_1.useContext(NotificationsContext);
}
exports.useNotifications = useNotifications;
