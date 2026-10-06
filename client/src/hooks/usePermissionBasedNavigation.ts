import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions } from "@/_core/hooks/usePermissions";
import { canAccessFeature, canAccessRoute } from "@/lib/permissions";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
  roles?: string[];
  feature?: string;
}

export function usePermissionBasedNavigation() {
  const { user } = useAuth();
  const { hasPermission: hasDbPermission, loading: permissionsLoading } = usePermissions(user?.id);

  const PATH_PERMISSION_MAP: Record<string, string[]> = {
    "/dashboard": ["dashboard.view", "dashboard_customize"],
    "/crm/super-admin": ["dashboard.view", "admin:system", "settings_view"],
    "/admin/management": ["users_view", "settings_view", "permission.manage", "users_manage_permissions"],
    "/clients": ["clients_view"],
    "/projects": ["projects_view"],
    "/invoices": ["invoices_view", "accounting:invoices:view", "org:invoicing:view"],
    "/estimates": ["estimates_view"],
    "/payments": ["payments_view", "accounting:payments:view", "org:payments:view"],
    "/expenses": ["expenses_view", "accounting:expenses:view", "org:expenses:view"],
    "/products": ["products_view", "products:view", "org:products:view"],
    "/reports": ["reports_view", "reports:view", "org:reports:view"],
    "/hr": ["hr_view", "hr:view", "org:hr:view"],
    "/employees": ["hr_view", "hr_employees_manage", "hr:employees:view", "org:employees:view"],
    "/departments": ["departments_view", "hr:departments:view", "org:departments:view"],
    "/payroll": ["hr_payroll_view", "hr:payroll:view", "org:payroll:view"],
    "/suppliers": ["suppliers_view", "procurement:suppliers:view", "org:suppliers:view"],
    "/budgets": ["budgets_view", "accounting:budgets:view", "org:budgets:view"],
    "/procurement": ["suppliers_view", "budgets_view", "procurement:view", "org:procurement:view"],
    "/accounting": ["payments_view", "expenses_view", "invoices_view", "accounting:dashboard:view", "org:accounting:view"],
    "/staff-chat": ["communications:view", "communications:read", "communications:messaging", "org:communications:view", "org:communications:read", "org:communications:messaging"],
    "/contacts": ["contacts_view", "contacts:view", "crm:contacts:view"],
    "/leads": ["leads_view", "leads:view", "crm:leads:view", "sales:leads:view"],
    "/tasks": ["tasks_view", "tasks:read", "projects_view", "projects:view"],
    "/receipts": ["receipts_view", "accounting:receipts:view"],
    "/tickets": ["tickets_view", "tickets:read", "support:tickets:view"],
    "/communications": ["communications:view", "communications:read", "org:communications:view"],
    "/timesheets": ["timesheets_view", "time_entries:view", "time_entries:read"],
    "/attendance": ["attendance_view", "hr:attendance:view", "org:attendance:view"],
    "/leave-management": ["leave_view", "hr:leave:view", "org:leave:view"],
    "/inventory": ["inventory_view", "inventory:view", "procurement:inventory:view"],
    "/lpos": ["lpos_view", "purchase_orders:view", "procurement:purchase_orders:view"],
    "/contracts": ["contracts_view", "contracts:view"],
    "/assets": ["assets_view", "assets:view"],
    "/warranty": ["warranty_view", "warranty:view"],
    "/work-orders": ["work_orders_view", "work_orders:view"],
    "/ai-hub": ["ai_hub:view", "ai:view"],
    "/files": ["files_view", "files:view"],
  };

  const effectiveRole = (user as any)?.effectiveRole || user?.role;
  const explicitPermissions = (user as any)?.effectivePermissions as string[] | undefined;
  const hasExplicitPermission = (permission: string) =>
    explicitPermissions?.some((granted) =>
      granted === permission ||
      (granted.endsWith(":*") && permission.startsWith(granted.slice(0, -1)))
    ) ?? false;
  const hasPermission = (permission: string) => {
    if (effectiveRole === "super_admin") return true;
    if (hasExplicitPermission(permission)) return true;
    if (canAccessFeature(effectiveRole || "", permission)) return true;
    return hasDbPermission(permission);
  };

  const hasExplicitPathPermission = (href: string) => {
    const matchedPath = Object.keys(PATH_PERMISSION_MAP)
      .filter((path) => href.startsWith(path))
      .sort((left, right) => right.length - left.length)[0];
    const routePermissions = matchedPath ? PATH_PERMISSION_MAP[matchedPath] : [];
    const routeSegment = href.split(/[?#]/, 1)[0].split("/").filter(Boolean).at(-1)?.replace(/-/g, "_");
    const inferredPermissions = routeSegment
      ? [`${routeSegment}_view`, `${routeSegment}:view`, `org:${routeSegment}:view`]
      : [];
    return [...routePermissions, ...inferredPermissions].some((permission) =>
      hasExplicitPermission(permission) || hasDbPermission(permission)
    );
  };

  const pathAllowed = (href?: string) => {
    if (!href) return true;
    if (hasExplicitPathPermission(href)) return true;

    const match = Object.entries(PATH_PERMISSION_MAP)
      .filter(([path]) => href.startsWith(path))
      .sort(([left], [right]) => right.length - left.length)[0];
    if (!match) return canAccessRoute(effectiveRole as any, href);

    const requiredPermissions = match[1];
    return requiredPermissions.some((permission) => hasPermission(permission))
      && canAccessRoute(effectiveRole as any, href);
  };

  const getFilteredNav = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (item.roles && item.roles.length > 0) {
        if (!item.roles.includes(effectiveRole || "")) return false;
      }
      if (item.feature) {
        if (!canAccessFeature(effectiveRole || "", item.feature)) return false;
      }
      if (item.href && !pathAllowed(item.href)) return false;
      return true;
    }).map((item) => {
      if (item.children) {
        return { ...item, children: getFilteredNav(item.children) };
      }
      return item;
    }).filter((item) => !item.children || item.children.length > 0);
  };

  const getCustomNavigation = (items: NavItem[], existingHrefs: Set<string> = new Set()): NavItem[] => {
    const links: NavItem[] = [];
    const seenHrefs = new Set(existingHrefs);
    const collectGrantedLinks = (entries: NavItem[]) => {
      entries.forEach((item) => {
        if (item.href && !seenHrefs.has(item.href) && hasExplicitPathPermission(item.href)) {
          seenHrefs.add(item.href);
          links.push({ ...item, children: undefined });
        }
        if (item.children) collectGrantedLinks(item.children);
      });
    };
    collectGrantedLinks(items);
    return links;
  };

  return { getFilteredNav, getCustomNavigation, hasPermission, permissionsLoading };
}
