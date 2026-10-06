import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, FileText, Filter, Landmark, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ReportNavigation } from "@/components/ReportNavigation";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { exportCsvWithCompanyHeader } from "@/utils/companyExport";

const today = new Date();
const startOfYear = `${today.getFullYear()}-01-01`;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export default function FinancialReportsPage() {
  const [, setLocation] = useLocation();
  const { allowed, isLoading } = useRequireFeature("reports:financial");
  const { code } = useCurrencySettings();
  const company = useCompanyInfo();
  const [from, setFrom] = useState(startOfYear);
  const [to, setTo] = useState(isoDate(today));
  const [departmentId, setDepartmentId] = useState("all");
  const [invoiceStatus, setInvoiceStatus] = useState("all");
  const [expenseStatus, setExpenseStatus] = useState("all");
  const [applied, setApplied] = useState({ from: startOfYear, to: isoDate(today), departmentId: "all", invoiceStatus: "all", expenseStatus: "all" });
  const { data: departments = [] } = trpc.departments.list.useQuery({});
  const plQueryInput = {
    startDate: applied.from,
    endDate: applied.to,
    invoiceStatus: applied.invoiceStatus as any,
    expenseStatus: applied.expenseStatus as any,
    ...(applied.departmentId && applied.departmentId !== "all" ? { departmentId: applied.departmentId } : {}),
  };
  const plQuery = trpc.financialReports.profitLoss.useQuery(plQueryInput, { enabled: !!applied.from && !!applied.to });
  const bsQuery = trpc.financialReports.balanceSheet.useQuery({});
  const formatMoney = (value: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: code, maximumFractionDigits: 0 }).format((value || 0) / 100);
  const runReport = () => {
    if (!from || !to || from > to) { toast.error("Choose a valid reporting period"); return; }
    setApplied({ from, to, departmentId, invoiceStatus, expenseStatus });
  };
  const exportCsv = () => {
    const report = plQuery.data;
    if (!report) return;
    const rows = [{ Metric: "Revenue", Amount: report.revenue }, { Metric: "Other income", Amount: report.otherIncome || 0 }, { Metric: "Total income", Amount: report.totalIncome || report.revenue }, { Metric: "Expenses", Amount: report.expenses }, { Metric: "Net Profit", Amount: report.netProfit }, { Metric: "Net Margin", Amount: `${report.netMarginPercentage}%` }, ...(report.expenseBreakdown || []).map((row: any) => ({ Metric: `Expense: ${row.category}`, Amount: row.amount }))];
    exportCsvWithCompanyHeader(`profit-loss-${applied.from}-${applied.to}`, rows, company);
    toast.success("Profit & Loss exported");
  };
  const netPositive = (plQuery.data?.netProfit || 0) >= 0;
  const financialChartData = [
    { metric: "Revenue", amount: plQuery.data?.revenue || 0 },
    { metric: "Other income", amount: plQuery.data?.otherIncome || 0 },
    { metric: "Expenses", amount: plQuery.data?.expenses || 0 },
    { metric: "Net profit", amount: plQuery.data?.netProfit || 0 },
  ];
  if (isLoading || !allowed) return null;
  return (
    <ModuleLayout title="Financial Reports" description="Profit & Loss, balance sheet and operating performance" icon={<BarChart3 className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Reports", href: "/reports" }, { label: "Financial Reports" }]} actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setLocation("/finance/non-sales-inflows")}>Non-sales inflows</Button><Button variant="outline" onClick={() => setLocation("/finance/accounting-policies")}>Accounting policies</Button><Button variant="outline" onClick={exportCsv} disabled={!plQuery.data}><Download className="mr-2 h-4 w-4" />Export CSV</Button><Button onClick={runReport}><RefreshCcw className="mr-2 h-4 w-4" />Run report</Button></div>}>
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><ReportNavigation active="/finance/reports" /><div className="min-w-0 space-y-5">
        <Card className="kiini-report-toolbar"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" />Reporting controls</CardTitle><CardDescription>Filter by period, department and document status.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">From</label><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">To</label><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Department</label><Select value={departmentId} onValueChange={setDepartmentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All departments</SelectItem>{(departments as any[]).map((department) => <SelectItem key={department.id} value={department.id}>{department.name || department.departmentName}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Invoice status</label><Select value={invoiceStatus} onValueChange={setInvoiceStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["all", "draft", "sent", "paid", "partial", "overdue"].map((status) => <SelectItem key={status} value={status}>{status === "all" ? "All invoices" : status}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Expense status</label><Select value={expenseStatus} onValueChange={setExpenseStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["all", "pending", "approved", "paid", "rejected"].map((status) => <SelectItem key={status} value={status}>{status === "all" ? "All expenses" : status}</SelectItem>)}</SelectContent></Select></div>
        </CardContent></Card>
        {plQuery.isLoading ? <div className="py-16 text-center text-muted-foreground">Loading financial report...</div> : <>
          <ReportAnalyticsPanel title="Financial performance" description={`${applied.from} to ${applied.to}`} categoryKey="metric" data={financialChartData} series={[{ dataKey: "amount", label: "Amount", color: "#0f766e" }]} formatValue={formatMoney} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"><StatsCard label="Cash Revenue" value={formatMoney(plQuery.data?.revenue || 0)} description="Completed payments" icon={<TrendingUp className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Other Income" value={formatMoney(plQuery.data?.otherIncome || 0)} description="Donations and non-sales income" icon={<Landmark className="h-5 w-5" />} color="border-l-teal-500" /><StatsCard label="Total Income" value={formatMoney(plQuery.data?.totalIncome || 0)} description="Cash revenue plus other income" icon={<TrendingUp className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Invoiced" value={formatMoney(plQuery.data?.invoiced || 0)} description="Issued invoices" icon={<FileText className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Expenses" value={formatMoney(plQuery.data?.expenses || 0)} description="Operating costs" icon={<TrendingDown className="h-5 w-5" />} color="border-l-orange-500" /><StatsCard label="Net Profit" value={formatMoney(plQuery.data?.netProfit || 0)} description={netPositive ? "Positive result" : "Operating deficit"} icon={<Landmark className="h-5 w-5" />} color={netPositive ? "border-l-blue-500" : "border-l-red-500"} /></div>
          <Tabs defaultValue="profit-loss"><TabsList><TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger><TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger><TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger></TabsList><TabsContent value="profit-loss"><Card><CardHeader><CardTitle>Profit & Loss Statement</CardTitle><CardDescription>{applied.from} to {applied.to} · {applied.departmentId === "all" ? "All departments" : "Filtered department"}</CardDescription></CardHeader><CardContent><Table><TableBody><TableRow><TableHead>Operating revenue</TableHead><TableCell className="text-right font-semibold">{formatMoney(plQuery.data?.revenue || 0)}</TableCell></TableRow><TableRow><TableHead>Non-operating income</TableHead><TableCell className="text-right">{formatMoney(plQuery.data?.otherIncome || 0)}</TableCell></TableRow><TableRow><TableHead>Total income</TableHead><TableCell className="text-right font-semibold">{formatMoney(plQuery.data?.totalIncome || 0)}</TableCell></TableRow><TableRow><TableHead>Operating expenses</TableHead><TableCell className="text-right">({formatMoney(plQuery.data?.expenses || 0)})</TableCell></TableRow><TableRow className="border-t-2"><TableHead className="text-base">Net profit / (loss)</TableHead><TableCell className={`text-right text-base font-bold ${netPositive ? "text-emerald-600" : "text-red-600"}`}>{formatMoney(plQuery.data?.netProfit || 0)}</TableCell></TableRow></TableBody></Table></CardContent></Card></TabsContent><TabsContent value="breakdown"><Card><CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{(plQuery.data?.expenseBreakdown || []).map((row: any) => <TableRow key={row.category}><TableCell>{row.category}</TableCell><TableCell className="text-right">{formatMoney(row.amount)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent><TabsContent value="balance-sheet"><Card><CardHeader><CardTitle>Balance Sheet Summary</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Account type</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader><TableBody>{Object.entries(bsQuery.data || {}).map(([type, amount]) => <TableRow key={type}><TableCell className="capitalize">{type}</TableCell><TableCell className="text-right">{formatMoney(Number(amount))}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent></Tabs>
        </>}
      </div></div>
    </ModuleLayout>
  );
}
