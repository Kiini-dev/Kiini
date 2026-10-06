import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, LineChart, PieChart, TrendingUp, Download, Filter } from "lucide-react";
import { BarChart as BarChartComponent, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as LineChartComponent, Line, PieChart as PieChartComponent, Pie, Cell } from "recharts";

interface AnalyticsData {
  period: string;
  value: number;
  percentage?: number;
  trend?: "up" | "down" | "stable";
}

interface DashboardMetric {
  title: string;
  value: number | string;
  change: number;
  trend: "up" | "down";
  color: string;
}

export function AdvancedAnalyticsPanel() {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMetrics, setSelectedMetrics] = useState(["revenue", "growth", "retention"]);

  // Sample data - replace with real API data
  const revenueData: AnalyticsData[] = [
    { period: "Jan", value: 45000, percentage: 100 },
    { period: "Feb", value: 52000, percentage: 115 },
    { period: "Mar", value: 48000, percentage: 106 },
    { period: "Apr", value: 61000, percentage: 135 },
    { period: "May", value: 55000, percentage: 122 },
    { period: "Jun", value: 67000, percentage: 148 },
  ];

  const growthData: AnalyticsData[] = [
    { period: "Week 1", value: 12, percentage: 100 },
    { period: "Week 2", value: 15, percentage: 125 },
    { period: "Week 3", value: 18, percentage: 150 },
    { period: "Week 4", value: 22, percentage: 183 },
  ];

  const categoryDistribution = [
    { name: "Products", value: 35, color: "#3b82f6" },
    { name: "Services", value: 25, color: "#8b5cf6" },
    { name: "Consulting", value: 20, color: "#ec4899" },
    { name: "Support", value: 20, color: "#f59e0b" },
  ];

  const metrics: DashboardMetric[] = [
    { title: "Total Revenue", value: "$287K", change: 12.5, trend: "up", color: "bg-blue-50 text-blue-700" },
    { title: "Growth Rate", value: "23.5%", change: 8.2, trend: "up", color: "bg-green-50 text-green-700" },
    { title: "Customer Count", value: "1,245", change: -2.1, trend: "down", color: "bg-purple-50 text-purple-700" },
    { title: "Avg Order Value", value: "$2,341", change: 5.3, trend: "up", color: "bg-orange-50 text-orange-700" },
  ];

  const handleExport = () => {
    // Export chart as image/CSV
  };

  const handleFilterApply = () => {
    // Apply selected metrics
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time business metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-4 h-4 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                    <span className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.trend === "up" ? "+" : "-"}{Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChartComponent data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Growth Rate
            </CardTitle>
            <CardDescription>Weekly growth percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChartComponent data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
              </LineChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Mix
            </CardTitle>
            <CardDescription>Revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChartComponent>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChartComponent>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-semibold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
            <CardDescription>Data-driven actionable insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">📈 Revenue Growth</p>
                <p className="text-sm text-blue-800 mt-1">Revenue increased 48% compared to last quarter. Continue focus on high-margin product categories.</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">✅ Customer Acquisition</p>
                <p className="text-sm text-green-800 mt-1">New customers acquired: 245 this month (↑18% vs last month). Marketing campaigns are performing well.</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900">⚠️ Retention Rate</p>
                <p className="text-sm text-yellow-800 mt-1">Customer retention dipped 2.1%. Consider launching retention program or improving customer support.</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-900">💡 Opportunity</p>
                <p className="text-sm text-purple-800 mt-1">Services category showing strong growth (23% this month). Consider expanding service offerings.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Filtering & Export</CardTitle>
          <CardDescription>Customize dashboard view and export data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Revenue", "Growth", "Retention", "Costs", "Profit", "CTR", "Conversion", "CAC"].map((metric) => (
              <div key={metric} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={selectedMetrics.includes(metric.toLowerCase())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMetrics([...selectedMetrics, metric.toLowerCase()]);
                    } else {
                      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric.toLowerCase()));
                    }
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{metric}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFilterApply} className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" className="flex-1">
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedAnalyticsPanel;
