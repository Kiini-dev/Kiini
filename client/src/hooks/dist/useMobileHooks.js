"use strict";
/**
 * Mobile-specific React hooks for responsive design and device detection
 */
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
exports.useVibration = exports.useScroll = exports.useBatteryStatus = exports.useNetworkStatus = exports.useKeyboardMetrics = exports.useViewport = exports.useTouchGestures = exports.useDeviceInfo = void 0;
var react_1 = require("react");
/**
 * Hook to detect device type and orientation
 */
exports.useDeviceInfo = function () {
    var _a = react_1.useState({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape",
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        browserName: getBrowserName()
    }), deviceInfo = _a[0], setDeviceInfo = _a[1];
    react_1.useEffect(function () {
        var handleResize = function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            setDeviceInfo({
                isMobile: width < 640,
                isTablet: width >= 640 && width < 1024,
                isDesktop: width >= 1024,
                screenWidth: width,
                screenHeight: height,
                orientation: height > width ? "portrait" : "landscape",
                isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                isAndroid: /Android/.test(navigator.userAgent),
                browserName: getBrowserName()
            });
        };
        var handleOrientationChange = function () {
            handleResize();
        };
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleOrientationChange);
        return function () {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleOrientationChange);
        };
    }, []);
    return deviceInfo;
};
function getBrowserName() {
    var ua = navigator.userAgent;
    if (ua.includes("Firefox"))
        return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome"))
        return "Safari";
    if (ua.includes("Chrome"))
        return "Chrome";
    if (ua.includes("Edge"))
        return "Edge";
    return "Unknown";
}
exports.useTouchGestures = function (element, handlers) {
    var touchStartX = react_1.useRef(0);
    var touchStartY = react_1.useRef(0);
    var touchStartTime = react_1.useRef(0);
    var lastTapTime = react_1.useRef(0);
    react_1.useEffect(function () {
        if (!element.current)
            return;
        var handleTouchStart = function (e) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            touchStartTime.current = Date.now();
        };
        var handleTouchEnd = function (e) {
            var _a, _b, _c, _d, _e, _f;
            var touchEndX = e.changedTouches[0].clientX;
            var touchEndY = e.changedTouches[0].clientY;
            var touchDuration = Date.now() - touchStartTime.current;
            var deltaX = touchEndX - touchStartX.current;
            var deltaY = touchEndY - touchStartY.current;
            var threshold = 50;
            var longPressThreshold = 500;
            // Check for long press
            if (touchDuration > longPressThreshold && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
                (_a = handlers.onLongPress) === null || _a === void 0 ? void 0 : _a.call(handlers);
                return;
            }
            // Check for double tap
            var now = Date.now();
            if (now - lastTapTime.current < 300 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
                (_b = handlers.onDoubleTap) === null || _b === void 0 ? void 0 : _b.call(handlers);
                lastTapTime.current = 0;
                return;
            }
            lastTapTime.current = now;
            // Check for swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > threshold) {
                    (_c = handlers.onSwipeRight) === null || _c === void 0 ? void 0 : _c.call(handlers);
                }
                else if (deltaX < -threshold) {
                    (_d = handlers.onSwipeLeft) === null || _d === void 0 ? void 0 : _d.call(handlers);
                }
            }
            else {
                // Vertical swipe
                if (deltaY > threshold) {
                    (_e = handlers.onSwipeDown) === null || _e === void 0 ? void 0 : _e.call(handlers);
                }
                else if (deltaY < -threshold) {
                    (_f = handlers.onSwipeUp) === null || _f === void 0 ? void 0 : _f.call(handlers);
                }
            }
        };
        element.current.addEventListener("touchstart", handleTouchStart);
        element.current.addEventListener("touchend", handleTouchEnd);
        return function () {
            var _a, _b;
            (_a = element.current) === null || _a === void 0 ? void 0 : _a.removeEventListener("touchstart", handleTouchStart);
            (_b = element.current) === null || _b === void 0 ? void 0 : _b.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handlers]);
};
exports.useViewport = function () {
    var _a = react_1.useState({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        safeAreaInsetTop: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0"),
        safeAreaInsetBottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0"),
        safeAreaInsetLeft: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)") || "0"),
        safeAreaInsetRight: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0"),
        isFullscreen: document.fullscreenElement !== null
    }), viewport = _a[0], setViewport = _a[1];
    react_1.useEffect(function () {
        var handleResize = function () {
            setViewport({
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                safeAreaInsetTop: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0"),
                safeAreaInsetBottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0"),
                safeAreaInsetLeft: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)") || "0"),
                safeAreaInsetRight: parseInt(getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0"),
                isFullscreen: document.fullscreenElement !== null
            });
        };
        window.addEventListener("resize", handleResize);
        document.addEventListener("fullscreenchange", handleResize);
        return function () {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("fullscreenchange", handleResize);
        };
    }, []);
    return viewport;
};
exports.useKeyboardMetrics = function () {
    var _a = react_1.useState({
        isVisible: false,
        height: 0,
        animationDuration: 250
    }), keyboardMetrics = _a[0], setKeyboardMetrics = _a[1];
    react_1.useEffect(function () {
        var isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIOSDevice) {
            // For Android/Web
            var handleFocus_1 = function () {
                setKeyboardMetrics(function (prev) { return (__assign(__assign({}, prev), { isVisible: true })); });
            };
            var handleBlur_1 = function () {
                setKeyboardMetrics(function (prev) { return (__assign(__assign({}, prev), { isVisible: false })); });
            };
            document.addEventListener("focusin", function (e) {
                if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
                    handleFocus_1();
                }
            });
            document.addEventListener("focusout", handleBlur_1);
            return function () {
                document.removeEventListener("focusin", handleFocus_1);
                document.removeEventListener("focusout", handleBlur_1);
            };
        }
    }, []);
    return keyboardMetrics;
};
/**
 * Hook for managing offline/online status
 */
exports.useNetworkStatus = function () {
    var _a = react_1.useState(navigator.onLine), isOnline = _a[0], setIsOnline = _a[1];
    react_1.useEffect(function () {
        var handleOnline = function () { return setIsOnline(true); };
        var handleOffline = function () { return setIsOnline(false); };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return function () {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    return { isOnline: isOnline };
};
exports.useBatteryStatus = function () {
    var _a = react_1.useState(null), batteryStatus = _a[0], setBatteryStatus = _a[1];
    react_1.useEffect(function () {
        // @ts-ignore - Battery API not in TypeScript types
        if (!navigator.getBattery) {
            return;
        }
        // @ts-ignore
        navigator.getBattery().then(function (battery) {
            setBatteryStatus(battery);
            var updateHandler = function () {
                setBatteryStatus({
                    level: battery.level,
                    isCharging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                });
            };
            battery.addEventListener("levelchange", updateHandler);
            battery.addEventListener("chargingchange", updateHandler);
            battery.addEventListener("chargingtimechange", updateHandler);
            battery.addEventListener("dischargingtimechange", updateHandler);
            return function () {
                battery.removeEventListener("levelchange", updateHandler);
                battery.removeEventListener("chargingchange", updateHandler);
                battery.removeEventListener("chargingtimechange", updateHandler);
                battery.removeEventListener("dischargingtimechange", updateHandler);
            };
        });
    }, []);
    return batteryStatus;
};
exports.useScroll = function () {
    var _a = react_1.useState({
        scrollY: 0,
        scrollX: 0,
        isScrolling: false,
        direction: "none"
    }), scrollInfo = _a[0], setScrollInfo = _a[1];
    var scrollTimeoutRef = react_1.useRef();
    var lastScrollYRef = react_1.useRef(0);
    react_1.useEffect(function () {
        var handleScroll = function () {
            var currentScrollY = window.scrollY;
            var direction = currentScrollY > lastScrollYRef.current
                ? "down"
                : currentScrollY < lastScrollYRef.current
                    ? "up"
                    : "none";
            lastScrollYRef.current = currentScrollY;
            setScrollInfo({
                scrollY: currentScrollY,
                scrollX: window.scrollX,
                isScrolling: true,
                direction: direction
            });
            // Clear existing timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            // Set isScrolling to false after scroll ends
            scrollTimeoutRef.current = setTimeout(function () {
                setScrollInfo(function (prev) { return (__assign(__assign({}, prev), { isScrolling: false })); });
            }, 150);
        };
        window.addEventListener("scroll", handleScroll);
        return function () {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);
    return scrollInfo;
};
/**
 * Hook for vibration feedback
 */
exports.useVibration = function () {
    var vibrate = react_1.useCallback(function (pattern) {
        if (!navigator.vibrate) {
            return;
        }
        navigator.vibrate(pattern);
    }, []);
    return { vibrate: vibrate };
};
exports["default"] = exports.useDeviceInfo;
