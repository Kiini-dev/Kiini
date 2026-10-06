import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface StatsCardProps {
  label?: string;
  title?: string;
  value: string | number | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  /** Left border color class, e.g. "border-l-blue-500" */
  color?: string;
  /** Optional gradient bg for the icon container, e.g. "bg-gradient-to-br from-blue-500 to-blue-600" */
  iconBg?: string;
  change?: string | number;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  label,
  title,
  value,
  description,
  icon,
  color = "border-l-blue-500",
  iconBg,
  change,
  trend = "neutral",
  onClick,
  className,
  loading,
}: StatsCardProps) {
  const Comp = onClick ? "button" : "div";
  const trendClasses = {
    up: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    down: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    neutral: "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  };

  const trendLabel = typeof change === "number" ? `${change > 0 ? "+" : ""}${change}%` : change;

  const accentColor = color.includes("blue") ? "bg-blue-500" : color.includes("green") ? "bg-emerald-500" : color.includes("orange") ? "bg-orange-500" : color.includes("red") ? "bg-red-500" : color.includes("purple") ? "bg-purple-500" : "bg-slate-400";

  return (
    <Comp
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/85",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600",
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              {label ?? title}
            </p>
            {change !== undefined && (
              <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none", trendClasses[trend])}>
                {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"} {trendLabel}
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-3 flex h-8 items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : (
            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-[2rem]">
              {value}
            </p>
          )}

          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {icon && (
          iconBg ? (
            <div className={cn("ml-2 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-sm", iconBg)}>
              {icon}
            </div>
          ) : (
            <div className={cn("ml-2 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md shadow-sm", accentColor, "text-white")}>{icon}</div>
          )
        )}
      </div>

      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={cn("h-full rounded-full", accentColor)} style={{ width: `100%` }} />
      </div>
    </Comp>
  );
}
