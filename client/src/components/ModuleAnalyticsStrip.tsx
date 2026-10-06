import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";

export interface ModuleAnalyticsMetric {
  label: string;
  value: string | number;
  hint: string;
  tone?: "teal" | "blue" | "amber" | "rose" | "violet";
  trend?: "up" | "down" | "flat";
}

interface ModuleAnalyticsStripProps {
  title: string;
  description: string;
  metrics: ModuleAnalyticsMetric[];
  bars?: number[];
  href?: string;
  onOpen?: () => void;
}

const toneClasses: Record<NonNullable<ModuleAnalyticsMetric["tone"]>, string> = {
  teal: "border-l-emerald-500",
  blue: "border-l-blue-500",
  amber: "border-l-amber-500",
  rose: "border-l-rose-500",
  violet: "border-l-violet-500",
};

const toneIcons: Record<NonNullable<ModuleAnalyticsMetric["tone"]>, string> = {
  teal: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  blue: "bg-gradient-to-br from-blue-500 to-blue-600",
  amber: "bg-gradient-to-br from-amber-500 to-amber-600",
  rose: "bg-gradient-to-br from-rose-500 to-red-600",
  violet: "bg-gradient-to-br from-violet-500 to-violet-600",
};

export function ModuleAnalyticsStrip({ title, description, metrics, bars = [36, 52, 44, 68, 58, 76, 64], onOpen }: ModuleAnalyticsStripProps) {
  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-700">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        {onOpen && (
          <button onClick={onOpen} className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300">
            Open analytics <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatsCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.hint}
              color={toneClasses[metric.tone || "blue"]}
              iconBg={toneIcons[metric.tone || "blue"]}
              icon={null}
              trend={metric.trend === "down" ? "down" : metric.trend === "up" ? "up" : "neutral"}
              change={metric.trend === "up" ? 12 : metric.trend === "down" ? 8 : undefined}
              className="min-h-[120px]"
            />
          ))}
        </div>

        {bars && (
          <div className="mt-3 flex h-10 items-end gap-1 overflow-hidden rounded-lg bg-slate-100/80 px-2 pt-2 dark:bg-slate-800/80">
            {bars.map((height, index) => (
              <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-500" style={{ height: `${Math.max(18, height)}%` }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
