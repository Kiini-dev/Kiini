import React, { useState, useEffect } from "react";
import { useMaterialTailwindController, setOpenRightSidebar } from "@/contexts/MaterialTailwindContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { clearRuntimeUserInfo } from "@/lib/authStorage";
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Receipt,
  Briefcase,
  Package,
  Loader2,
  Moon,
  Sun,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";

interface RecentActivity {
  id: string;
  type: "create" | "update" | "delete" | "payment";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export function RightSidebar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openRightSidebar } = controller;
  const [, setLocation] = useLocation();
  
  // Settings state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = trpc.settings.getUserPreferences.useQuery(
    undefined,
    {
      retry: 1,
      retryDelay: 1000,
      onSuccess: (data: any) => {
        if (data && Array.isArray(data)) {
          data.forEach((setting) => {
            const keyParts = setting.key.split('_');
            const actualKey = keyParts.slice(2).join('_');
            
            switch (actualKey) {
              case 'theme':
                const themeValue = setting.value as "light" | "dark";
                setTheme(themeValue || "light");
                if (themeValue === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
                break;
              case 'notifications_enabled':
                const notifEnabled = setting.value === "true";
                setNotificationsEnabled(notifEnabled);
                break;
              case 'show_sidebar':
                const sidebarVisible = setting.value !== "false";
                setShowSidebar(sidebarVisible);
                break;
              case 'show_statistics':
                const statsVisible = setting.value !== "false";
                setShowStatistics(statsVisible);
                break;
            }
          });
        }
        setIsLoadingPrefs(false);
      },
      onError: () => {
        setIsLoadingPrefs(false);
      },
    } as any
  );

  // Mutation for saving preferences
  const setPreferenceMutation = trpc.settings.setUserPreference.useMutation({
    onError: (error) => {
      toast.error(`Failed to save preference: ${error.message}`);
    },
  });

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
      clearRuntimeUserInfo();
      
      setTimeout(() => {
        window.location.replace("/login");
      }, 300);
    },
    onError: (error) => {
      toast.error(`Logout failed: ${error.message}`);
      setTimeout(() => {
        window.location.replace("/login");
      }, 300);
    },
  });

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    setPreferenceMutation.mutate({
      key: 'theme',
      value: newTheme,
    } as any, {
      onSuccess: () => {
        toast.success(`Theme changed to ${newTheme} mode`);
      },
    });
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    setPreferenceMutation.mutate({
      key: 'notifications_enabled',
      value: String(newState),
    } as any, {
      onSuccess: () => {
        toast.success(`Notifications ${newState ? 'enabled' : 'disabled'}`);
      },
    });
  };

  // Handle sidebar visibility toggle
  const handleSidebarToggle = () => {
    const newState = !showSidebar;
    setShowSidebar(newState);
    
    setPreferenceMutation.mutate({
      key: 'show_sidebar',
      value: String(newState),
    } as any, {
      onSuccess: () => {
        toast.success(`Sidebar ${newState ? 'shown' : 'hidden'}`);
      },
    });
  };

  // Handle statistics visibility toggle
  const handleStatisticsToggle = () => {
    const newState = !showStatistics;
    setShowStatistics(newState);
    
    setPreferenceMutation.mutate({
      key: 'show_statistics',
      value: String(newState),
    } as any, {
      onSuccess: () => {
        toast.success(`Statistics ${newState ? 'shown' : 'hidden'}`);
      },
    });
  };

  // Fetch dashboard stats from backend
  const { data: dashboardStats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent activity from backend
  const { data: recentActivity, isLoading: activityLoading } = trpc.dashboard.recentActivity.useQuery(
    { limit: 5 },
    { refetchInterval: 30000 }
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    if (action.includes("invoice")) return <FileText className="w-4 h-4" />;
    if (action.includes("payment")) return <DollarSign className="w-4 h-4" />;
    if (action.includes("client")) return <Users className="w-4 h-4" />;
    if (action.includes("project")) return <Briefcase className="w-4 h-4" />;
    if (action.includes("product")) return <Package className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Get color for activity type
  const getActivityColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-600";
    if (action.includes("update")) return "bg-blue-100 text-blue-600";
    if (action.includes("delete")) return "bg-red-100 text-red-600";
    if (action.includes("payment")) return "bg-purple-100 text-purple-600";
    return "bg-gray-100 text-gray-600";
  };

  // Quick stats from backend or defaults
  const quickStats = [
    {
      label: "Total Revenue",
      value: statsLoading ? "..." : formatCurrency(dashboardStats?.totalRevenue || 0),
      change: statsLoading ? "" : `+${dashboardStats?.revenueGrowth || 0}%`,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Active Projects",
      value: statsLoading ? "..." : String(dashboardStats?.activeProjects || 0),
      change: statsLoading ? "" : `+${dashboardStats?.newProjects || 0}`,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Total Clients",
      value: statsLoading ? "..." : String(dashboardStats?.totalClients || 0),
      change: statsLoading ? "" : `+${dashboardStats?.newClients || 0}`,
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Quick action handlers
  const handleQuickAction = (path: string) => {
    setOpenRightSidebar(dispatch, false);
    setLocation(path);
  };

  return (
    <>
      {openRightSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpenRightSidebar(dispatch, false)}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-80 transition-transform duration-300",
          "border-l border-slate-200 bg-white shadow-lg dark:bg-slate-800 dark:border-slate-700",
          openRightSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Access</h2>
            <button
              onClick={() => setOpenRightSidebar(dispatch, false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 dark:text-slate-300" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Settings Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </h3>
                </div>
                
                {isLoadingPrefs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? (
                          <Moon className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {theme === "dark" ? "Dark" : "Light"} Mode
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={theme === "light" ? "default" : "ghost"}
                          className="h-7 px-2"
                          onClick={() => handleThemeChange("light")}
                          disabled={setPreferenceMutation.isPending}
                        >
                          <Sun className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === "dark" ? "default" : "ghost"}
                          className="h-7 px-2"
                          onClick={() => handleThemeChange("dark")}
                          disabled={setPreferenceMutation.isPending}
                        >
                          <Moon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        {notificationsEnabled ? (
                          <Bell className="w-4 h-4 text-blue-600" />
                        ) : (
                          <BellOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Notifications
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={notificationsEnabled ? "default" : "outline"}
                        className="h-7 px-3"
                        onClick={handleNotificationsToggle}
                        disabled={setPreferenceMutation.isPending}
                      >
                        {notificationsEnabled ? "On" : "Off"}
                      </Button>
                    </div>

                    {/* Sidebar Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        {showSidebar ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Main Sidebar
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={showSidebar ? "default" : "outline"}
                        className="h-7 px-3"
                        onClick={handleSidebarToggle}
                        disabled={setPreferenceMutation.isPending}
                      >
                        {showSidebar ? "Show" : "Hide"}
                      </Button>
                    </div>

                    {/* Statistics Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        {showStatistics ? (
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Statistics
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={showStatistics ? "default" : "outline"}
                        className="h-7 px-3"
                        onClick={handleStatisticsToggle}
                        disabled={setPreferenceMutation.isPending}
                      >
                        {showStatistics ? "Show" : "Hide"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="dark:bg-slate-700" />

              {/* Quick Stats (if enabled) */}
              {showStatistics && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Today's Stats</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  quickStats.map((stat, idx) => (
                    <div
                      key={stat.label || `stat-${idx}`}
                      className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{stat.label}</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500">{stat.icon}</div>
                      </div>
                      {stat.change && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">{stat.change}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
              )}

              {showStatistics && <Separator className="dark:bg-slate-700" />}

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/invoices/create")}
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Invoice
                </Button>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/clients/create")}
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Client
                </Button>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/projects/create")}
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Project
                </Button>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/estimates/create")}
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Estimate
                </Button>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/receipts/create")}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  New Receipt
                </Button>
                <Button 
                  className="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  variant="outline"
                  onClick={() => handleQuickAction("/payments/create")}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              <Separator className="dark:bg-slate-700" />

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                {activityLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivity.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors cursor-pointer"
                        onClick={() => {
                          if (activity.entityType && activity.entityId) {
                            setOpenRightSidebar(dispatch, false);
                            setLocation(`/${activity.entityType}s/${activity.entityId}`);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", getActivityColor(activity.action))}>
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {activity.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent activity</p>
                )}
              </div>

              <Separator className="dark:bg-slate-700" />

              {/* Logout Button */}
              <div>
                <Button 
                  className="w-full justify-start transition-all duration-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 text-red-600 hover:bg-red-50" 
                  variant="ghost"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
