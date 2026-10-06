import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getNavigationForRole } from "@/lib/permissions";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  User,
  ShoppingCart,
  MessageSquare,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Icon map
const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
};

/**
 * RoleBasedNavigation component that renders different menu items
 * based on the user's role and permissions
 */
export default function RoleBasedNavigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems = getNavigationForRole((user as any)?.effectiveRole || user?.role);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/" || location.startsWith("/dashboard");
    }
    if (href === "/account") {
      return location === "/account" || location.startsWith("/account");
    }
    // For parent items, check if any child is in the current route
    if (href === "/accounting") {
      return location.startsWith("/invoices") || location.startsWith("/payments") ||
             location.startsWith("/expenses") || location.startsWith("/bank-reconciliation") ||
             location.startsWith("/chart-of-accounts") || location.startsWith("/budgets");
    }
    if (href === "/procurement") {
      return location.startsWith("/lpos") || location.startsWith("/orders") ||
             location.startsWith("/imprests") || location.startsWith("/inventory");
    }
    return href !== "#" ? location.startsWith(href) : false;
  };

  return (
    <nav className="space-y-2 px-2 py-4">
      {navigationItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const itemIsActive = isActive(item.href);
        const isExpanded = expandedItems.includes(item.href);

        return (
          <div key={item.href}>
            <button
              onClick={() => {
                if (hasChildren) {
                  toggleExpanded(item.href);
                } else if (item.href !== "#") {
                  window.location.href = item.href;
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                itemIsActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {item.icon ? ICON_MAP[item.icon] : null}
                </span>
                <span>{item.label}</span>
              </div>
              {hasChildren && (
                <span className={cn(
                  "ml-auto transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              )}
            </button>

            {/* Submenu */}
            {hasChildren && isExpanded && (
              <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                {item.children.map((child) => {
                  const childIsActive = isActive(child.href);
                  return (
                    <a
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        childIsActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {child.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
