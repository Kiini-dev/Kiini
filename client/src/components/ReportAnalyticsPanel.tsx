import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartColumnIncreasing } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";

export type ReportAnalyticsMetric = {
  label: string;
  value: ReactNode;
  description: string;
  color?: string;
};

export type ReportAnalyticsSeries = {
  dataKey: string;
  label: string;
  color: string;
};

type ReportAnalyticsPanelProps = {
  title: string;
  description?: string;
  categoryKey: string;
  data: Array<Record<string, string | number>>;
  series: ReportAnalyticsSeries[];
  metrics?: ReportAnalyticsMetric[];
  formatValue?: (value: number) => string;
};

export function ReportAnalyticsPanel({
  title,
  description = "Selected reporting period",
  categoryKey,
  data,
  series,
  metrics = [],
  formatValue,
}: ReportAnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      {metrics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatsCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
              icon={<ChartColumnIncreasing className="h-5 w-5" />}
              color={metric.color || "border-l-teal-600"}
            />
          ))}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 && series.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={categoryKey} minTickGap={24} />
                <YAxis tickFormatter={formatValue} />
                <Tooltip formatter={(value) => formatValue ? formatValue(Number(value) || 0) : value} />
                {series.length > 1 && <Legend />}
                {series.map((item) => (
                  <Bar key={item.dataKey} dataKey={item.dataKey} name={item.label} fill={item.color} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No analytics data is available for this period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}