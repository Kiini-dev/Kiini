import React, { useState, useEffect } from "react";
import { Settings, X, Bell, Eye, Moon, Sun, ChevronLeft, ChevronRight, User, HelpCircle, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { clearRuntimeUserInfo } from "@/lib/authStorage";

// Settings keys for user preferences
const SETTINGS_KEYS = {
  THEME: "theme",
  NOTIFICATIONS_ENABLED: "notifications_enabled",
  SHOW_SIDEBAR: "show_sidebar",
  SHOW_STATISTICS: "show_statistics",
} as const;

interface CollapsibleSettingsSidebarProps {
  onThemeChange?: (theme: "light" | "dark") => void;
  onNotificationsToggle?: (enabled: boolean) => void;
  onSidebarVisibilityChange?: (visible: boolean) => void;
  onStatisticsVisibilityChange?: (visible: boolean) => void;
}

export function CollapsibleSettingsSidebar({
  onThemeChange,
  onNotificationsToggle,
  onSidebarVisibilityChange,
  onStatisticsVisibilityChange,
}: CollapsibleSettingsSidebarProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user preferences from backend using user-specific endpoint
  const { data: userPreferences, isLoading: preferencesLoading, error: preferencesError } = trpc.settings.getUserPreferences.useQuery(
    undefined,
    ({
      retry: 1,
      retryDelay: 1000,
      onSuccess: (data: any) => {
        if (data && Array.isArray(data)) {
          data.forEach((setting) => {
            // Extract the actual key from user-prefixed key (e.g., "user_123_theme" -> "theme")
            const keyParts = setting.key.split('_');
            const actualKey = keyParts.slice(2).join('_'); // Skip user ID prefix
            
            switch (actualKey) {
              case SETTINGS_KEYS.THEME:
                const themeValue = setting.value as "light" | "dark";
                setTheme(themeValue || "light");
                onThemeChange?.(themeValue || "light");
                // Apply theme to document
                if (themeValue === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
                break;
              case SETTINGS_KEYS.NOTIFICATIONS_ENABLED:
                const notifEnabled = setting.value === "true";
                setNotificationsEnabled(notifEnabled);
                onNotificationsToggle?.(notifEnabled);
                break;
              case SETTINGS_KEYS.SHOW_SIDEBAR:
                const sidebarVisible = setting.value !== "false";
                setShowSidebar(sidebarVisible);
                onSidebarVisibilityChange?.(sidebarVisible);
                break;
              case SETTINGS_KEYS.SHOW_STATISTICS:
                const statsVisible = setting.value !== "false";
                setShowStatistics(statsVisible);
                onStatisticsVisibilityChange?.(statsVisible);
                break;
            }
          });
        }
        setIsLoading(false);
      },
      onError: (error: any) => {
        console.error("Failed to load preferences:", error);
        setIsLoading(false);
        // Use default values on error
        toast.error("Using default preferences");
      },
    } as any)
  );

  // Add timeout fallback for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Preferences loading timeout, using defaults");
        setIsLoading(false);
        toast.warning("Using default preferences");
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Mutation for saving user preferences
  const setPreferenceMutation = trpc.settings.setUserPreference.useMutation({
    onError: (error) => {
      toast.error(`Failed to save preference: ${error.message}`);
    },
  });

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      // Clear any local storage tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
      clearRuntimeUserInfo();
      
      // Use window.location.replace to avoid 404 flash and ensure clean redirect
      setTimeout(() => {
        window.location.replace("/login");
      }, 300);
    },
    onError: (error) => {
      toast.error(`Logout failed: ${error.message}`);
      // Still redirect even if logout fails
      setTimeout(() => {
        window.location.replace("/login");
      }, 300);
    },
  });

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);

    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to backend
    setPreferenceMutation.mutate(
      ({
        key: SETTINGS_KEYS.THEME,
        value: newTheme,
        description: "User preferred theme (light/dark)",
      } as any),
      {
        onSuccess: () => {
          toast.success(`Theme changed to ${newTheme} mode`);
        },
      }
    );
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    onNotificationsToggle?.(newState);

    // Save to backend
    setPreferenceMutation.mutate(
      ({
        key: SETTINGS_KEYS.NOTIFICATIONS_ENABLED,
        value: String(newState),
        description: "Enable or disable notifications",
      } as any),
      {
        onSuccess: () => {
          toast.success(`Notifications ${newState ? "enabled" : "disabled"}`);
        },
      }
    );
  };

  // Handle sidebar visibility toggle
  const handleSidebarToggle = () => {
    const newState = !showSidebar;
    setShowSidebar(newState);
    onSidebarVisibilityChange?.(newState);

    // Save to backend
    setPreferenceMutation.mutate(
      ({
        key: SETTINGS_KEYS.SHOW_SIDEBAR,
        value: String(newState),
        description: "Show or hide the main sidebar",
      } as any),
      {
        onSuccess: () => {
          toast.success(`Sidebar ${newState ? "shown" : "hidden"}`);
        },
      }
    );
  };

  // Handle statistics visibility toggle
  const handleStatisticsToggle = () => {
    const newState = !showStatistics;
    setShowStatistics(newState);
    onStatisticsVisibilityChange?.(newState);

    // Save to backend
    setPreferenceMutation.mutate(
      ({
        key: SETTINGS_KEYS.SHOW_STATISTICS,
        value: String(newState),
        description: "Show or hide statistics widgets",
      } as any),
      {
        onSuccess: () => {
          toast.success(`Statistics ${newState ? "shown" : "hidden"}`);
        },
      }
    );
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle profile settings navigation
  const handleProfileSettings = () => {
    setIsOpen(false);
    navigate("/settings/profile");
  };

  // Handle help & support navigation
  const handleHelpSupport = () => {
    setIsOpen(false);
    navigate("/help");
  };

  return (
    <>
      {/* Collapsible Settings Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-40 transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Loading preferences...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Theme Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Appearance
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange("light")}
                    disabled={setPreferenceMutation.isPending}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all",
                      theme === "light"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                      setPreferenceMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    disabled={setPreferenceMutation.isPending}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all",
                      theme === "dark"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                      setPreferenceMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Notifications
                </h3>
                <div 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={handleNotificationsToggle}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Enable Notifications
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Get real-time updates
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={handleNotificationsToggle}
                    disabled={setPreferenceMutation.isPending}
                    className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Visibility Section */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Visibility
                </h3>
                <div className="space-y-2">
                  <div 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={handleSidebarToggle}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Show Sidebar
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showSidebar}
                      onChange={handleSidebarToggle}
                      disabled={setPreferenceMutation.isPending}
                      className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={handleStatisticsToggle}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Show Statistics
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showStatistics}
                      onChange={handleStatisticsToggle}
                      disabled={setPreferenceMutation.isPending}
                      className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Account
                </h3>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={handleProfileSettings}
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={handleHelpSupport}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </>
          )}

          {/* Footer - Company name from VITE_APP_TITLE environment variable */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {APP_TITLE} CRM v1.0.0
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
              © {new Date().getFullYear()} {APP_TITLE}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Button - Fixed on Right Side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-l-lg shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
          "hover:shadow-xl hover:from-blue-600 hover:to-blue-700",
          isOpen && "translate-x-80"
        )}
        title={isOpen ? "Close Settings" : "Open Settings"}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
