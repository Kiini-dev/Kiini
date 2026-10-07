import React from "react";
import { Link, useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/MaterialTailwind";
import { OrgLayout } from "@/components/OrgLayout";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrgSubdomainSlug } from "@/lib/organizationUrl";

interface ModuleLayoutProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  backLink?: { label: string; href: string };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ModuleLayout({
  title,
  description,
  icon,
  breadcrumbs,
  backLink,
  actions,
  children,
  className,
  contentClassName,
}: ModuleLayoutProps) {
  const [location] = useLocation();
  const params = useParams<{ slug?: string }>();
  const orgSubdomainSlug = getOrgSubdomainSlug();
  const organizationSlug = params.slug || orgSubdomainSlug;
  const isOrganizationPage = location.startsWith("/org/") || Boolean(params.slug) || Boolean(orgSubdomainSlug);
  const resolveHref = (href: string) => {
    if (!isOrganizationPage || !organizationSlug || !href.startsWith("/") || href.startsWith("//")) return href;
    if (orgSubdomainSlug) {
      const tenantPathPrefix = `/org/${organizationSlug}`;
      if (href === tenantPathPrefix) return "/crm-home";
      if (href.startsWith(`${tenantPathPrefix}/`)) return href.slice(tenantPathPrefix.length);
      return href;
    }
    if (href === `/org/${organizationSlug}` || href.startsWith(`/org/${organizationSlug}/`)) return href;
    if (href.startsWith("/org/")) return href;
    return `/org/${organizationSlug}${href === "/" ? "/crm-home" : href}`;
  };

  // Combine back button with custom actions
  const combinedActions = (
    <div className="flex items-center gap-2 [&_button]:border-gray-300 [&_button]:text-gray-700 [&_button]:hover:bg-gray-100 dark:[&_button]:border-white/20 dark:[&_button]:text-white dark:[&_button]:hover:bg-white/10">
      {backLink && (
        <Link href={resolveHref(backLink.href)}>
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {backLink.label}
          </Button>
        </Link>
      )}
      {actions}
    </div>
  );

  if (isOrganizationPage) {
    return (
      <OrgLayout>
        <div className={cn("space-y-3 bg-[#f3f5f7] px-3 pb-6 pt-3 dark:bg-slate-950 sm:px-4 lg:px-6", className)}>
          <PageHeader
            title={title}
            description={description}
            icon={icon}
            breadcrumbs={breadcrumbs?.map((item) => ({ ...item, href: item.href ? resolveHref(item.href) : undefined }))}
            actions={combinedActions}
          />
          <div className={cn("w-full min-w-0 max-w-full overflow-x-hidden", contentClassName)}>
            {children}
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn("space-y-3 bg-[#f3f5f7] px-3 pb-6 pt-3 dark:bg-slate-950 sm:px-4 lg:px-6", className)}>
        <PageHeader
          title={title}
          description={description}
          icon={icon}
          breadcrumbs={breadcrumbs}
          actions={combinedActions}
        />

        <div className={cn("w-full min-w-0 max-w-full overflow-x-hidden", contentClassName)}>
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ModuleLayout;
