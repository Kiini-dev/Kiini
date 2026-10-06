/**
 * PageLayout — Universal master layout wrapper for all module pages.
 *
 * Applies the /crm design language (gradient hero, breadcrumbs, card styles)
 * consistently across every page in the application.
 *
 * Usage:
 *   <PageLayout title="Invoices" description="Manage your invoices" icon={<FileText />}
 *     breadcrumbs={[{ label: "Accounting" }, { label: "Invoices" }]}
 *     actions={<Button>New Invoice</Button>}>
 *     {children}
 *   </PageLayout>
 */

import React from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  /** Page title shown in hero */
  title: string;
  /** Short description shown below title */
  description?: string;
  /** Icon shown in the hero area */
  icon?: React.ReactNode;
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons placed top-right (e.g., "+ New") */
  actions?: React.ReactNode;
  /** Gradient override — defaults to brand gradient */
  heroGradient?: string;
  /** Whether to show a back button */
  showBack?: boolean;
  /** Optional additional hero content (e.g. stat chips) */
  heroExtra?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({
  title,
  description,
  icon,
  breadcrumbs,
  actions,
  heroGradient,
  showBack = true,
  heroExtra,
  children,
}: PageLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        <div
          className={cn(
            "kiini-hero rounded-2xl p-6 sm:p-8 shadow-xl text-white",
            heroGradient && `bg-gradient-to-br ${heroGradient}`
          )}
          style={
            !heroGradient
              ? {
                  background:
                    "linear-gradient(135deg, var(--brand-gradient-from,#1e40af) 0%, var(--brand-gradient-to,#7c3aed) 100%)",
                }
              : undefined
          }
        >
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="kiini-breadcrumb mb-4">
              <button
                onClick={() => navigate("/crm")}
                className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                title="Home"
              >
                <Home className="h-3.5 w-3.5" />
              </button>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                  {crumb.href ? (
                    <button
                      onClick={() => navigate(crumb.href!)}
                      className="text-white/70 hover:text-white transition-colors text-xs"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-white text-xs font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {showBack && (
                <button
                  onClick={() => window.history.back()}
                  className="mt-1 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              {icon && (
                <div className="p-2.5 rounded-xl bg-white/15 flex-shrink-0">
                  <div className="h-6 w-6">{icon}</div>
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-white/75 mt-1 max-w-xl">{description}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {actions && (
              <div className="flex flex-wrap gap-2 sm:flex-shrink-0">{actions}</div>
            )}
          </div>

          {/* Hero extra content */}
          {heroExtra && <div className="mt-6">{heroExtra}</div>}
        </div>

        {/* ── Page Content ────────────────────────────────────────────── */}
        {children}
      </div>
    </DashboardLayout>
  );
}
