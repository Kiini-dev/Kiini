/**
 * MetricCard — Unified metric card matching DashboardHome design.
 * Use this everywhere instead of raw <Card> for metric tiles.
 */
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { ArrowRight, Loader2 } from "lucide-react";
import React from "react";

interface MetricCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  /** Tailwind gradient e.g. "from-blue-500 to-blue-600" */
  gradient?: string;
  /** left-border colour class e.g. "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20" */
  colorClass?: string;
  href?: string;
  loading?: boolean;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  gradient,
  colorClass,
  href,
  loading = false,
  badge,
  className,
  onClick,
}: MetricCardProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (href) navigate(href);
  };

  const isClickable = !!(href || onClick);

  const inner = (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/85",
      isClickable && "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] dark:hover:border-slate-600",
      gradient
        ? `bg-gradient-to-br ${gradient} border-transparent text-white shadow-lg`
        : cn("border-slate-200 dark:border-slate-700", colorClass),
      "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-slate-300 before:content-[''] dark:before:bg-slate-600",
      className
    )} onClick={isClickable ? handleClick : undefined}>

      {!gradient && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-slate-100/80 via-transparent to-slate-50/80 dark:from-slate-700/40 dark:via-transparent dark:to-slate-800/40" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.15em]",
            gradient ? "text-white/80" : "text-slate-500 dark:text-slate-400"
          )}>{title}</p>

          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <p className={cn(
              "truncate text-xl font-bold tracking-tight",
              gradient ? "text-white" : "text-slate-900 dark:text-slate-50"
            )}>{value ?? "—"}</p>
          )}

          {description && (
            <p className={cn(
              "text-xs",
              gradient ? "text-white/70" : "text-slate-500 dark:text-slate-400"
            )}>{description}</p>
          )}

          {badge && <div className="mt-1">{badge}</div>}
        </div>

        <div className={cn(
          "ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm",
          gradient ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        )}>
          {icon}
        </div>
      </div>

      {isClickable && (
        <div className={cn(
          "absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100",
          gradient ? "text-white/80" : "text-slate-400"
        )}>
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  return inner;
}

export default MetricCard;
