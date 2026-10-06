import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  className,
}: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center gap-2 text-sm text-gray-600 px-4 py-3 bg-gray-50 border-b rounded-t-lg",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link href="/">
        <a className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </a>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {separator}
          {item.href ? (
            <Link href={item.href}>
              <a className="flex items-center gap-1 hover:text-blue-600 transition-colors max-w-xs truncate">
                {item.icon && <span>{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </a>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-900 font-medium max-w-xs truncate">
              {item.icon && <span>{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Common breadcrumb configurations

export function ClientBreadcrumb(clientName: string) {
  return (
    <Breadcrumb
      items={[
        { label: "Clients", href: "/clients" },
        { label: clientName },
      ]}
    />
  );
}

export function ProductBreadcrumb(productName?: string) {
  const items: BreadcrumbItem[] = [
    { label: "Products", href: "/products" },
  ];
  if (productName) {
    items.push({ label: productName });
  }
  return <Breadcrumb items={items} />;
}

export function InvoiceBreadcrumb(invoiceId?: string) {
  const items: BreadcrumbItem[] = [
    { label: "Invoices", href: "/invoices" },
  ];
  if (invoiceId) {
    items.push({ label: `Invoice #${invoiceId}` });
  }
  return <Breadcrumb items={items} />;
}

export function ProcurementBreadcrumb(page: "management" | "suppliers" | "deliveries" | "grn", detail?: string) {
  const pageNames = {
    management: "Procurement",
    suppliers: "Suppliers",
    deliveries: "Deliveries",
    grn: "Goods Receipts",
  };

  const items: BreadcrumbItem[] = [
    { label: "Procurement", href: "/procurement/management" },
    { label: pageNames[page], href: `/procurement/${page}` },
  ];

  if (detail) {
    items.push({ label: detail });
  }

  return <Breadcrumb items={items} />;
}

export function PayrollBreadcrumb(
  page: "allowances" | "deductions" | "approvals" | "processing" | "analytics",
  detail?: string
) {
  const pageNames = {
    allowances: "Allowances",
    deductions: "Deductions",
    approvals: "Approvals",
    processing: "Processing",
    analytics: "Analytics",
  };

  const items: BreadcrumbItem[] = [
    { label: "Payroll", href: "/payroll" },
    { label: pageNames[page], href: `/payroll/${page}` },
  ];

  if (detail) {
    items.push({ label: detail });
  }

  return <Breadcrumb items={items} />;
}

export default Breadcrumb;
