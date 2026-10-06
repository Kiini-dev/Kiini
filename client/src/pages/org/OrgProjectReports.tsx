import { useState, useMemo, useCallback } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ReportNavigation } from "@/components/ReportNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { matchesReportingYear, reportingPeriodLabel } from "@/lib/reportingPeriods";
import { FolderKanban, Calendar, TrendingUp, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProjectReports() {
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const { symbol, position } = useCurrencySettings();

  // Fetch project data
  const { data: projects = [] } = trpc.projects.list.useQuery({});
  const { data: tasks = [] } = trpc.projects.tasks.listAll.useQuery({});
  const { data: timesheets = [] } = trpc.timeEntries.list.useQuery({});

  const currentYear = new Date().getFullYear();
  const yearOptions = ["all", currentYear, currentYear - 1, currentYear - 2].map(String);
  const periodLabel = reportingPeriodLabel(yearFilter);

  const fmt = useCallback((amount: number) => {
    const value = amount / 100;
    if (position === "prefix") return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K`;
    return `${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K${symbol}`;
  }, [symbol, position]);

  // Filter projects by year
  const filteredProjects = useMemo(() => {
    return projects.filter((proj: any) => {
      return matchesReportingYear(proj.startDate || proj.createdAt, yearFilter);
    });
  }, [projects, yearFilter]);

  const totalProjects = filteredProjects.length;
  const completedProjects = filteredProjects.filter((p: any) => p.status === "completed").length;
  const activeProjects = filteredProjects.filter((p: any) => p.status === "active").length;
  const overdueProjects = filteredProjects.filter((p: any) => {
    const dueDate = new Date(p.endDate);
    return dueDate < new Date() && p.status !== "completed";
  }).length;

  const totalBudget = useMemo(
    () => filteredProjects.reduce((sum: number, proj: any) => sum + (proj.budget || 0), 0),
    [filteredProjects]
  );

  // Project status distribution
  const projectsByStatus = useMemo(() => {
    const statusMap: Record<string, number> = {};
    filteredProjects.forEach((p: any) => {
      const status = p.status || "unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [filteredProjects]);

  // Top projects by budget
  const topProjects = useMemo(() => {
    return filteredProjects
      .sort((a: any, b: any) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 10)
      .map((proj: any) => ({
        name: proj.name.length > 20 ? proj.name.substring(0, 17) + "..." : proj.name,
        value: Math.round((proj.budget || 0) / 100),
        status: proj.status,
      }));
  }, [filteredProjects]);

  // Task completion timeline
  const taskTimeline = useMemo(() => {
    const monthMap: Record<string, { completed: number; total: number; sortKey: string }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (yearFilter !== "all") {
      for (let i = 0; i < 12; i++) {
        const month = monthNames[i];
        monthMap[month] = { completed: 0, total: 0, sortKey: `${yearFilter}-${String(i + 1).padStart(2, "0")}` };
      }
    }

    tasks.forEach((task: any) => {
      const date = new Date(task.dueDate || task.createdAt);
      if (!matchesReportingYear(date, yearFilter)) return;
      const month = yearFilter === "all" ? `${monthNames[date.getMonth()]} ${date.getFullYear()}` : monthNames[date.getMonth()];
      monthMap[month] ??= { completed: 0, total: 0, sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` };
      monthMap[month].total += 1;
      if (task.status === "completed") monthMap[month].completed += 1;
    });

    return Object.entries(monthMap).sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey)).map(([month, data]) => ({
      month,
      completed: data.completed,
      pending: data.total - data.completed,
    }));
  }, [tasks, yearFilter]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ModuleLayout title="Project Reports">
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ReportNavigation active="/reports/projects" />
        <div className="min-w-0 max-w-7xl w-full">
        {/* Year Filter */}
        <div className="flex gap-4 mb-6">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {yearOptions.map((year) => (
                year !== "all" &&
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Projects"
            value={totalProjects.toString()}
            icon={<FolderKanban className="h-4 w-4" />}
            trend={activeProjects}
            trendLabel="active"
          />
          <StatsCard
            title="Completed"
            value={completedProjects.toString()}
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend={Math.round((completedProjects / totalProjects) * 100) || 0}
            trendLabel="completion rate"
          />
          <StatsCard
            title="Total Budget"
            value={fmt(totalBudget)}
            icon={<DollarSign className="h-4 w-4" />}
            trend={0}
            trendLabel={totalProjects > 0 ? `${(totalBudget / (totalProjects * 100)).toFixed(0)}K avg` : "no data"}
          />
          <StatsCard
            title="Overdue"
            value={overdueProjects.toString()}
            icon={<AlertCircle className="h-4 w-4" />}
            trend={0}
            trendLabel="projects"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Projects by Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Top Projects by Budget</CardTitle>
              <CardDescription>Top 10 projects in {periodLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProjects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value}K`}
                    contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>Project distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Task Completion Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Completion Timeline</CardTitle>
            <CardDescription>Tasks completed vs pending by month in {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taskTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Projects List</CardTitle>
            <CardDescription>All projects in {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.slice(0, 10).map((proj: any) => (
                  <TableRow key={proj.id}>
                    <TableCell className="font-medium">{proj.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={proj.status === "completed" ? "bg-green-50 text-green-700" : proj.status === "active" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}>
                        {proj.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(proj.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</TableCell>
                    <TableCell>{new Date(proj.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</TableCell>
                    <TableCell className="text-right">{fmt(proj.budget || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
        </div>
    </ModuleLayout>
  );
}
