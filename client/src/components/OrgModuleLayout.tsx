import React from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OrgModuleLayoutProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  backLink?: string;
  showOrgInfo?: boolean;
  hasAccess?: boolean;
  accessDeniedMessage?: string;
  accessDeniedAction?: React.ReactNode;
}

/**
 * OrgModuleLayout - Bridges org pages with ModuleLayout
 * 
 * This component wraps the main app's ModuleLayout to provide consistent styling
 * and behavior for organization module pages. It handles access control, breadcrumbs,
 * and standard page layout.
 * 
 * Usage:
 * const handleCreate = () => {};
 * 
 * function MyPage() {
 *   return (
 *     <OrgModuleLayout
 *       title="Invoices"
 *       description="Manage organization invoices"
 *       icon={FileText}
 *       breadcrumbs={[{ label: "Invoices" }]}
 *       actions={<Button>New Invoice</Button>}
 *     >
 *       Content here
 *     </OrgModuleLayout>
 *   );
 * }
 */
export function OrgModuleLayout({
  title,
  description,
  icon,
  children,
  breadcrumbs = [],
  actions,
  backLink,
  showOrgInfo = false,
  hasAccess = true,
  accessDeniedMessage = "Access to this feature is not enabled for your organization.",
  accessDeniedAction,
}: OrgModuleLayoutProps) {
  const Icon = icon;
  const iconNode = Icon ? <Icon className="h-5 w-5" /> : undefined;
  const normalizedBackLink = backLink ? { label: "Back", href: backLink } : undefined;
  // If access is denied, show alert
  if (!hasAccess) {
    return (
      <ModuleLayout
        title={title}
        description={description}
        icon={iconNode}
        breadcrumbs={breadcrumbs}
        backLink={normalizedBackLink}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{accessDeniedMessage}</AlertDescription>
        </Alert>
        {accessDeniedAction && <div className="mt-4">{accessDeniedAction}</div>}
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title={title}
      description={description}
      icon={iconNode}
      breadcrumbs={breadcrumbs}
      backLink={normalizedBackLink}
      actions={actions}
    >
      {children}
    </ModuleLayout>
  );
}

export default OrgModuleLayout;
