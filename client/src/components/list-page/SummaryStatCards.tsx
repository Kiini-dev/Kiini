import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface SummaryCard {
  label?: string;
  title?: string;
  value: string | number;
  count?: number;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
  progress?: number;
  icon?: string | React.ReactNode;
  trend?: string;
}

const colorMap = {
  blue: { bar: "bg-blue-400", text: "text-blue-600" },
  green: { bar: "bg-emerald-400", text: "text-emerald-600" },
  orange: { bar: "bg-orange-400", text: "text-orange-600" },
  red: { bar: "bg-red-400", text: "text-red-600" },
  purple: { bar: "bg-purple-400", text: "text-purple-600" },
  gray: { bar: "bg-gray-400", text: "text-gray-600" },
};

export interface SummaryStatCardsProps {
  cards: SummaryCard[];
  className?: string;
}

export function SummaryStatCards({ cards, className }: SummaryStatCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {cards.map((card, i) => {
        const resolvedLabel = card.label ?? card.title ?? "Summary";
        const c = colorMap[card.color || "blue"];
        return (
          <div
            key={i}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/85",
              "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600"
            )}
          >
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    {resolvedLabel}
                    {card.count !== undefined && ` (${card.count})`}
                  </p>
                </div>
                <h3 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-[2rem]">
                  {card.value}
                </h3>
              </div>

              <div
                className={cn(
                  "mt-1 ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-sm",
                  c.bar,
                  "ring-1 ring-inset ring-white/40"
                )}
              >
                <span className="inline-block h-3.5 w-3.5 rounded-sm bg-white/80" aria-hidden="true" />
              </div>
            </div>

            <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn("h-full rounded-full transition-all", c.bar)}
                style={{ width: `${card.progress ?? 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
