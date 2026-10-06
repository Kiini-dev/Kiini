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
import { Users, DollarSign, Calendar, TrendingUp, Briefcase, AlertCircle } from "lucide-react";

export default function HRReports() {
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { symbol, position } = useCurrencySettings();

  // Fetch HR data
  const { data: employees = [] } = trpc.employees.list.useQuery({});
  const { data: leaves = [] } = trpc.leave.listForApproval.useQuery({});
  const { data: payslips = [] } = trpc.payroll.list.useQuery({});
  const { data: attendance = [] } = trpc.attendance.list.useQuery({});

  const currentYear = new Date().getFullYear();
  const yearOptions = ["all", currentYear, currentYear - 1, currentYear - 2].map(String);
  const periodLabel = reportingPeriodLabel(yearFilter);

  const fmt = useCallback((amount: number) => {
    const value = amount / 100;
    if (position === "prefix") return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`;
  }, [symbol, position]);

  // Filter data by year
  const filteredPayslips = useMemo(() => {
    return payslips.filter((ps: any) => {
      const date = new Date(ps.payDate || ps.createdAt);
      const inYear = matchesReportingYear(date, yearFilter);
      const afterStart = !startDate || date >= new Date(`${startDate}T00:00:00`);
      const beforeEnd = !endDate || date <= new Date(`${endDate}T23:59:59`);
      return inYear && afterStart && beforeEnd;
    });
  }, [payslips, yearFilter, startDate, endDate]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l: any) => {
      const date = new Date(l.startDate || l.createdAt);
      return matchesReportingYear(date, yearFilter);
    });
  }, [leaves, yearFilter]);

  // Key Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.status === "active").length;
  const totalPayroll = useMemo(
    () => filteredPayslips.reduce((sum: number, ps: any) => sum + (ps.netSalary || 0), 0),
    [filteredPayslips]
  );
  const avgEmployeeSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  // Leave data by type
  const leavesByType = useMemo(() => {
    const typeMap: Record<string, number> = {};
    filteredLeaves.forEach((l: any) => {
      const type = l.type || "other";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    return Object.entries(typeMap).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredLeaves]);

  // Department distribution
  const departmentDistribution = useMemo(() => {
    const deptMap: Record<string, number> = {};
    employees.forEach((e: any) => {
      const dept = e.department || "unassigned";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    return Object.entries(deptMap).map(([dept, count]) => ({
      name: dept.charAt(0).toUpperCase() + dept.slice(1),
      value: count,
    }));
  }, [employees]);

  // Attendance trend
  const attendanceTrend = useMemo(() => {
    const monthMap: Record<string, { present: number; absent: number; late: number; sortKey: string }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (yearFilter !== "all") {
      for (let i = 0; i < 12; i++) {
        const month = monthNames[i];
        monthMap[month] = { present: 0, absent: 0, late: 0, sortKey: `${yearFilter}-${String(i + 1).padStart(2, "0")}` };
      }
    }

    attendance.forEach((att: any) => {
      const date = new Date(att.date || att.createdAt);
      if (!matchesReportingYear(date, yearFilter)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = yearFilter === "all" ? `${monthNames[date.getMonth()]} ${date.getFullYear()}` : monthNames[date.getMonth()];
      monthMap[month] ??= { present: 0, absent: 0, late: 0, sortKey: key };
      if (att.status === "present") monthMap[month].present += 1;
      else if (att.status === "absent") monthMap[month].absent += 1;
      else if (att.status === "late") monthMap[month].late += 1;
    });

    return Object.entries(monthMap).sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey)).map(([month, data]) => ({
      month,
      present: data.present,
      absent: data.absent,
      late: data.late,
    }));
  }, [attendance, yearFilter]);

  // Payroll trend
  const payrollTrend = useMemo(() => {
    const monthMap: Record<string, { payroll: number; sortKey: string }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (yearFilter !== "all") {
      for (let i = 0; i < 12; i++) {
        monthMap[monthNames[i]] = { payroll: 0, sortKey: `${yearFilter}-${String(i + 1).padStart(2, "0")}` };
      }
    }

    filteredPayslips.forEach((ps: any) => {
      const date = new Date(ps.payDate || ps.createdAt);
      const month = yearFilter === "all" ? `${monthNames[date.getMonth()]} ${date.getFullYear()}` : monthNames[date.getMonth()];
      monthMap[month] ??= { payroll: 0, sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` };
      monthMap[month].payroll += (ps.netSalary || 0);
    });

    return Object.entries(monthMap).sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey)).map(([month, data]) => ({
      month,
      payroll: Math.round(data.payroll / 100),
    }));
  }, [filteredPayslips, yearFilter]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ModuleLayout title="HR Reports">
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ReportNavigation active="/reports/hr" />
        <div className="min-w-0 max-w-7xl w-full">
        {/* Year Filter */}
        <div className="flex gap-4 mb-6 flex-wrap">
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
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Report start date" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="Report end date" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Employees"
            value={totalEmployees.toString()}
            icon={<Users className="h-4 w-4" />}
            trend={activeEmployees}
            trendLabel="active"
          />
          <StatsCard
            title="Active Employees"
            value={activeEmployees.toString()}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={Math.round((activeEmployees / totalEmployees) * 100) || 0}
            trendLabel="% active"
          />
          <StatsCard
            title="Total Payroll"
            value={fmt(totalPayroll)}
            icon={<DollarSign className="h-4 w-4" />}
            trend={filteredPayslips.length}
            trendLabel="payslips"
          />
          <StatsCard
            title="Avg Salary"
            value={fmt(avgEmployeeSalary)}
            icon={<Briefcase className="h-4 w-4" />}
            trend={0}
            trendLabel="per employee"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle>Employees by Department</CardTitle>
              <CardDescription>Department distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leave Types */}
          <Card>
            <CardHeader>
              <CardTitle>Leaves by Type</CardTitle>
              <CardDescription>Leave usage in {periodLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leavesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leavesByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance summary in {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Trend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
            <CardDescription>Monthly payroll expenses in {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => fmt(value * 100)}
                  contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                />
                <Bar dataKey="payroll" fill="#3b82f6" name="Payroll" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees List</CardTitle>
            <CardDescription>All employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.slice(0, 10).map((emp: any) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.department || "N/A"}</TableCell>
                    <TableCell>{emp.position || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={emp.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
                        {emp.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
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
