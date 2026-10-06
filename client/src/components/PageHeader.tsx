import React, { Fragment } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderIcon = React.ReactNode | React.ElementType;

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: PageHeaderIcon;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

function renderHeaderIcon(icon: PageHeaderIcon | undefined) {
  if (!icon) {
    return null;
  }

  if (React.isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === "string") {
    return <span className="text-sm font-semibold">{icon}</span>;
  }

  if (typeof icon === "function") {
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6" />;
  }

  if (typeof icon === "object" && icon !== null && "$$typeof" in icon && "render" in icon) {
    const IconComponent = icon as unknown as React.ElementType;
    return <IconComponent className="w-6 h-6" />;
  }

  return null;
}

export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-[#f5f7fa] px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.02)] dark:border-slate-700 dark:bg-slate-900/80">
        <div className="relative">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((item, index) => (
                <Fragment key={`${index}-${item.href || item.label}`}>
                  {index > 0 && (
                    <ChevronRight className="mx-1 h-3 w-3 text-slate-400" />
                  )}
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-teal-600 dark:hover:text-teal-300">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                  )}
                </Fragment>
              ))}
            </nav>
          )}

          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-teal-200 bg-[#dff7f4] text-teal-700 shadow-sm dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300">
                  {renderHeaderIcon(icon)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-slate-900 dark:text-white sm:text-[2.4rem]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-0.5 max-w-2xl text-[15px] text-slate-500 dark:text-slate-400">{description}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex w-full flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

