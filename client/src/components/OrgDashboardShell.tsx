import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrgDashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string | number;
  };
}

export interface OrgDashboardMetric {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export interface OrgDashboardTip {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}

interface OrgDashboardShellProps {
  title: string;
  subtitle: string;
  actionCards: OrgDashboardAction[];
  overviewMetrics: OrgDashboardMetric[];
  monthlyChartData?: Array<{ name: string; income: number; expense: number }>;
  financialBreakdown?: Array<{ name: string; value: number }>;
  recentActivities?: Array<{ id: string; action?: string; entityType?: string; description?: string; createdAt?: string | number }>;
  recentActivityHref?: string;
  gettingStarted?: OrgDashboardTip[];
}

export default function OrgDashboardShell({
  title,
  subtitle,
  actionCards,
  overviewMetrics,
  monthlyChartData,
  financialBreakdown,
  recentActivities = [],
  recentActivityHref = "/audit-logs",
  gettingStarted = [],
}: OrgDashboardShellProps) {
  const [, navigate] = useLocation();

  const handleCardClick = (href: string) => {
    if (!href || href === "#") return;
    navigate(href);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actionCards.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleCardClick(action.href)}
            className="group relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground p-6 text-left transition-all hover:shadow-lg hover:border-primary/40"
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5",
                `bg-gradient-to-br ${action.color}`
              )}
            />
            <div className="relative space-y-4">
              <div className={cn("inline-flex p-3 rounded-lg text-white", `bg-gradient-to-br ${action.color}`)}>
                {action.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-card-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              {action.stats && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">{action.stats.label}</p>
                  <p className="text-lg font-bold text-card-foreground">{action.stats.value}</p>
                </div>
              )}
              <div className="absolute top-6 right-6 text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {overviewMetrics.map((metric) => (
            <button
              key={metric.title}
              type="button"
              onClick={() => handleCardClick(metric.href)}
              className={cn(
                "group relative overflow-hidden rounded-lg border-l-4 p-6 text-left transition-all hover:shadow-lg cursor-pointer",
                metric.color
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  {metric.icon}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {(monthlyChartData?.length || financialBreakdown?.length) ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Monthly Income vs Expenses
                </CardTitle>
                <CardDescription>Review your organization’s cash flow over time</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyChartData && monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
                      <Tooltip formatter={(value: number) => [value.toLocaleString(), undefined]} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expenses" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Financial Breakdown
                </CardTitle>
                <CardDescription>Revenue, payments, and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {financialBreakdown && financialBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={financialBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {financialBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toLocaleString(), undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <Button variant="outline" size="sm" onClick={() => handleCardClick(recentActivityHref)}>
            View All
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
            <CardDescription>Recent changes and activities in your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivities.length === 0 ? (
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Start by creating your first project or client</p>
                  </div>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {activity.action?.charAt(0).toUpperCase() ?? "A"}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{activity.description || `${activity.action} ${activity.entityType}`}</p>
                        <p className="text-xs text-muted-foreground capitalize">{activity.entityType?.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {gettingStarted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gettingStarted.map((tip) => (
              <Card key={tip.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                  <Button onClick={() => handleCardClick(tip.href)} className="w-full" size="sm">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {tip.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
