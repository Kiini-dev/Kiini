/**
 * Mobile-specific React hooks for responsive design and device detection
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: "portrait" | "landscape";
  isIOS: boolean;
  isAndroid: boolean;
  browserName: string;
}

/**
 * Hook to detect device type and orientation
 */
export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape",
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    browserName: getBrowserName(),
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDeviceInfo({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: height > width ? "portrait" : "landscape",
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        browserName: getBrowserName(),
      });
    };

    const handleOrientationChange = () => {
      handleResize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown";
}

/**
 * Hook for handling mobile touch gestures
 */
interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export const useTouchGestures = (
  element: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers
) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);

  useEffect(() => {
    if (!element.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Date.now() - touchStartTime.current;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const threshold = 50;
      const longPressThreshold = 500;

      // Check for long press
      if (touchDuration > longPressThreshold && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
        handlers.onLongPress?.();
        return;
      }

      // Check for double tap
      const now = Date.now();
      if (now - lastTapTime.current < 300 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
        handlers.onDoubleTap?.();
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      // Check for swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) {
          handlers.onSwipeRight?.();
        } else if (deltaX < -threshold) {
          handlers.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold) {
          handlers.onSwipeDown?.();
        } else if (deltaY < -threshold) {
          handlers.onSwipeUp?.();
        }
      }
    };

    element.current.addEventListener("touchstart", handleTouchStart);
    element.current.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.current?.removeEventListener("touchstart", handleTouchStart);
      element.current?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handlers]);
};

/**
 * Hook for managing mobile viewport and safe areas
 */
interface ViewportInfo {
  viewportWidth: number;
  viewportHeight: number;
  safeAreaInsetTop: number;
  safeAreaInsetBottom: number;
  safeAreaInsetLeft: number;
  safeAreaInsetRight: number;
  isFullscreen: boolean;
}

export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    safeAreaInsetTop: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0"
    ),
    safeAreaInsetBottom: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0"
    ),
    safeAreaInsetLeft: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)") || "0"
    ),
    safeAreaInsetRight: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0"
    ),
    isFullscreen: document.fullscreenElement !== null,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        safeAreaInsetTop: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0"
        ),
        safeAreaInsetBottom: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)") || "0"
        ),
        safeAreaInsetLeft: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)") || "0"
        ),
        safeAreaInsetRight: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)") || "0"
        ),
        isFullscreen: document.fullscreenElement !== null,
      });
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleResize);
    };
  }, []);

  return viewport;
};

/**
 * Hook for managing mobile keyboard interactions
 */
interface KeyboardMetrics {
  isVisible: boolean;
  height: number;
  animationDuration: number;
}

export const useKeyboardMetrics = (): KeyboardMetrics => {
  const [keyboardMetrics, setKeyboardMetrics] = useState<KeyboardMetrics>({
    isVisible: false,
    height: 0,
    animationDuration: 250,
  });

  useEffect(() => {
    let isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!isIOSDevice) {
      // For Android/Web
      const handleFocus = () => {
        setKeyboardMetrics((prev) => ({ ...prev, isVisible: true }));
      };

      const handleBlur = () => {
        setKeyboardMetrics((prev) => ({ ...prev, isVisible: false }));
      };

      document.addEventListener("focusin", (e) => {
        if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
          handleFocus();
        }
      });

      document.addEventListener("focusout", handleBlur);

      return () => {
        document.removeEventListener("focusin", handleFocus);
        document.removeEventListener("focusout", handleBlur);
      };
    }
  }, []);

  return keyboardMetrics;
};

/**
 * Hook for managing offline/online status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
};

/**
 * Hook for battery status
 */
interface BatteryStatus {
  level: number;
  isCharging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export const useBatteryStatus = () => {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    // @ts-ignore - Battery API not in TypeScript types
    if (!navigator.getBattery) {
      return;
    }

    // @ts-ignore
    navigator.getBattery().then((battery: any) => {
      setBatteryStatus({
        level: battery.level,
        isCharging: battery.isCharging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      });

      const updateHandler = () => {
        setBatteryStatus({
          level: battery.level,
          isCharging: battery.isCharging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
      };

      battery.addEventListener?.("levelchange", updateHandler);
      battery.addEventListener?.("chargingchange", updateHandler);
      battery.addEventListener?.("chargingtimechange", updateHandler);
      battery.addEventListener?.("dischargingtimechange", updateHandler);

      return () => {
        battery.removeEventListener?.("levelchange", updateHandler);
        battery.removeEventListener?.("chargingchange", updateHandler);
        battery.removeEventListener?.("chargingtimechange", updateHandler);
        battery.removeEventListener?.("dischargingtimechange", updateHandler);
      };
    });
  }, []);

  return batteryStatus;
};

/**
 * Hook for managing mobile scroll behavior
 */
interface ScrollInfo {
  scrollY: number;
  scrollX: number;
  isScrolling: boolean;
  direction: "up" | "down" | "none";
}

export const useScroll = (): ScrollInfo => {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    scrollY: 0,
    scrollX: 0,
    isScrolling: false,
    direction: "none",
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction: "up" | "down" | "none" =
        currentScrollY > lastScrollYRef.current
          ? "down"
          : currentScrollY < lastScrollYRef.current
            ? "up"
            : "none";

      lastScrollYRef.current = currentScrollY;

      setScrollInfo({
        scrollY: currentScrollY,
        scrollX: window.scrollX,
        isScrolling: true,
        direction,
      });

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set isScrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(
        () => {
          setScrollInfo((prev) => ({ ...prev, isScrolling: false }));
        },
        150
      );
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
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
export const useVibration = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!navigator.vibrate) {
      return;
    }

    navigator.vibrate(pattern);
  }, []);

  return { vibrate };
};

export default useDeviceInfo;
