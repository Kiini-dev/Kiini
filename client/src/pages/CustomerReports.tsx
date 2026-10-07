import { useState, useMemo, useCallback } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ReportNavigation } from "@/components/ReportNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import {
  BarChart,
  Bar,
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
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { reportingPeriodLabel } from "@/lib/reportingPeriods";
import { Users, TrendingUp, DollarSign, Award } from "lucide-react";

export default function CustomerReports() {
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const currentYear = new Date().getFullYear();
  const yearOptions = ["all", currentYear, currentYear - 1, currentYear - 2].map(String);
  const periodLabel = reportingPeriodLabel(yearFilter);
  const customerReport = trpc.reports.customerAnalysis.useQuery(
    yearFilter === "all"
      ? undefined
      : {
          startDate: new Date(Date.UTC(Number(yearFilter), 0, 1)),
          endDate: new Date(Date.UTC(Number(yearFilter), 11, 31, 23, 59, 59, 999)),
        }
  );
  const clients = customerReport.data?.allCustomers || [];
  const { symbol, position } = useCurrencySettings();

  const fmt = useCallback((amount: number) => {
    const value = amount / 100;
    if (position === "prefix") return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return `${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${symbol}`;
  }, [symbol, position]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === "active").length;
  const totalRevenue = customerReport.data?.summary.totalRevenue || 0;
  const avgClientValue = customerReport.data?.summary.avgCustomerValue || 0;

  const topClients = useMemo(() => {
    return (customerReport.data?.topCustomers || []).map((client: any) => ({
      name: (client.clientName || "Unknown").length > 20
        ? `${client.clientName.substring(0, 17)}...`
        : client.clientName || "Unknown",
      value: Math.round(client.totalInvoiced / 100),
    }));
  }, [customerReport.data?.topCustomers]);

  const clientsByStatus = useMemo(() => {
    return (customerReport.data?.clientsByStatus || []).map(({ status, count }: any) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [customerReport.data?.clientsByStatus]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ModuleLayout title="Customer Reports">
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ReportNavigation active="/reports/customers" />
        <div className="min-w-0 max-w-7xl w-full">
        {customerReport.isError && (
          <Card role="alert" className="mb-4 border-destructive">
            <CardContent className="pt-6 text-sm text-destructive">
              Unable to load customer report data: {customerReport.error.message}
            </CardContent>
          </Card>
        )}
        {customerReport.isLoading && (
          <Card className="mb-4">
            <CardContent className="pt-6 text-sm text-muted-foreground">Loading customer report data...</CardContent>
          </Card>
        )}
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
            title="Total Clients"
            value={totalClients.toString()}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Clients"
            value={activeClients.toString()}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Invoiced"
            value={fmt(totalRevenue)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Avg Client Value"
            value={fmt(avgClientValue)}
            icon={<Award className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Invoice Value</CardTitle>
              <CardDescription>Top 10 clients in {periodLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topClients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => fmt(Number(value) * 100)}
                    contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" name="Invoiced" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Clients by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Clients by Status</CardTitle>
              <CardDescription>Client distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Client Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Summary</CardTitle>
            <CardDescription>All clients in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Invoiced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.slice(0, 20).map((client: any) => {
                    return (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell>{client.contactPerson}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}>
                            {client.status || "unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">{fmt(client.totalInvoiced)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
    </ModuleLayout>
  );
}
