import { useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, Download, FileText, PieChart as PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import jsPDF from "jspdf";
import { filterCarryForwardInvoices } from "@/lib/invoiceCarryForward";

const COLORS = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];
const TAB_ITEMS = [
  ["home", "Homepage"], ["revenue-expense", "Revenue vs Expense"], ["top-revenue", "Top Revenue"], ["top-expenses", "Top Expenses"],
  ["income-revenue", "Income statement - Revenue"], ["income-expenses", "Income statement - Expenses"], ["ytd-revenue", "YTD Revenue Variable Analysis"],
  ["ytd-expenses", "YTD Expenses Variable Analysis"], ["variances", "Yearly Variances"], ["mom", "MoM Growth"], ["distribution", "Distribution"], ["budget", "Budget Analysis"],
] as const;

function records(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const result = Object.values(value as Record<string, unknown>).find(Array.isArray);
    return (result as any[]) || [];
  }
  return [];
}
function dateOf(item: any) { return new Date(item.invoiceDate || item.issueDate || item.expenseDate || item.date || item.createdAt || 0); }
function amountOf(item: any) { return Number(item.total ?? item.amount ?? item.value ?? 0) || 0; }

export default function FinancialReportingWorkspace({ organization = false }: { organization?: boolean }) {
  const { code: currencyCode } = useCurrencySettings();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [activeTab, setActiveTab] = useState("home");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("pdf");
  const invoicesQuery = trpc.invoices.list.useQuery({ limit: 1000 });
  const expensesQuery = trpc.expenses.list.useQuery({ limit: 1000 });
  const paymentsQuery = trpc.payments.list.useQuery({ limit: 1000 });
  const budgetsQuery = trpc.budgets.list.useQuery({});
  const companyQuery = trpc.settings.getCompanyInfo.useQuery();
  const isLoading = invoicesQuery.isLoading || expensesQuery.isLoading || paymentsQuery.isLoading || budgetsQuery.isLoading;
  const invoices = records(invoicesQuery.data);
  const expenses = records(expensesQuery.data);
  const payments = records(paymentsQuery.data);
  const budgets = records(budgetsQuery.data);
  const selectedYear = Number(year);
  const allTime = year === "all";
  const currentYear = new Date().getFullYear();
  const periodLabel = allTime ? "All time" : String(selectedYear);
  const fmt = (cents: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(cents / 100);
  const fmtNumber = (amount: number) => new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(amount);
  const inPeriod = (item: any) => {
    const date = dateOf(item);
    return !Number.isNaN(date.getTime()) && date <= new Date()
      && (allTime || date.getFullYear() === selectedYear);
  };
  const yearInvoices = useMemo(() => filterCarryForwardInvoices(invoices.filter(inPeriod)), [invoices, year]);
  const yearExpenses = useMemo(() => expenses.filter(inPeriod), [expenses, year]);
  const yearPayments = useMemo(() => payments.filter(inPeriod), [payments, year]);
  const revenue = yearInvoices.reduce((sum, item) => sum + amountOf(item), 0);
  const actualExpense = yearExpenses.reduce((sum, item) => sum + amountOf(item), 0);
  const collected = yearPayments.reduce((sum, item) => sum + amountOf(item), 0);
  const surplus = revenue - actualExpense;
  const surplusPercent = revenue ? (surplus / revenue) * 100 : 0;
  const reportingYear = allTime ? currentYear : selectedYear;
  const comparisonYear = reportingYear - 1;
  const comparisonCutoff = new Date(currentYear - 1, new Date().getMonth(), new Date().getDate(), 23, 59, 59, 999);
  const compareYearToDate = reportingYear === currentYear;
  const comparisonInvoices = allTime
    ? filterCarryForwardInvoices(invoices.filter((item) => dateOf(item).getFullYear() === reportingYear && dateOf(item) <= new Date()))
    : yearInvoices;
  const comparisonExpenses = allTime
    ? expenses.filter((item) => dateOf(item).getFullYear() === reportingYear && dateOf(item) <= new Date())
    : yearExpenses;
  const comparisonRevenue = comparisonInvoices.reduce((sum, item) => sum + amountOf(item), 0);
  const comparisonExpense = comparisonExpenses.reduce((sum, item) => sum + amountOf(item), 0);
  const previousInvoices = invoices.filter((item) => {
    const date = dateOf(item);
    return date.getFullYear() === comparisonYear && (!compareYearToDate || date <= comparisonCutoff);
  }).reduce((sum, item) => sum + amountOf(item), 0);
  const previousExpenses = expenses.filter((item) => {
    const date = dateOf(item);
    return date.getFullYear() === comparisonYear && (!compareYearToDate || date <= comparisonCutoff);
  }).reduce((sum, item) => sum + amountOf(item), 0);
  const variance = comparisonRevenue - previousInvoices;
  const expenseVariance = comparisonExpense - previousExpenses;

  const monthly = useMemo(() => {
    const buckets = new Map<string, { month: string; revenue: number; expense: number; collected: number }>();
    const addMonth = (date: Date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          month: allTime
            ? date.toLocaleString("en", { month: "short", year: "numeric" })
            : date.toLocaleString("en", { month: "short" }),
          revenue: 0,
          expense: 0,
          collected: 0,
        });
      }
      return buckets.get(key)!;
    };
    if (!allTime) {
      for (let month = 0; month < 12; month += 1) addMonth(new Date(selectedYear, month));
    }
    yearInvoices.forEach((item) => { addMonth(dateOf(item)).revenue += amountOf(item) / 100; });
    yearExpenses.forEach((item) => { addMonth(dateOf(item)).expense += amountOf(item) / 100; });
    yearPayments.forEach((item) => { addMonth(dateOf(item)).collected += amountOf(item) / 100; });
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, item]) => ({
      ...item,
      surplus: item.revenue - item.expense,
    }));
  }, [yearInvoices, yearExpenses, yearPayments, selectedYear, allTime]);
  const mom = monthly.map((item, index) => ({ ...item, growth: index && monthly[index - 1].revenue ? ((item.revenue - monthly[index - 1].revenue) / monthly[index - 1].revenue) * 100 : 0 }));
  const groupBy = (items: any[], key: string): { name: string; amount: number; count: number }[] => {
    const grouped: Record<string, { name: string; amount: number; count: number }> = {};
    items.forEach((item) => {
      const name = item[key] || item.category || item.vendor || "Uncategorised";
      grouped[name] = grouped[name] || { name, amount: 0, count: 0 };
      grouped[name].amount += amountOf(item);
      grouped[name].count += 1;
    });
    return (Object.values(grouped) as { name: string; amount: number; count: number }[]).sort((a, b) => b.amount - a.amount);
  };
  const topRevenue = groupBy(yearInvoices, "clientName").slice(0, 10);
  const topExpenses = groupBy(yearExpenses, "category").slice(0, 10);
  const budgetRows = budgets.filter((item) => allTime || !item.fiscalYear || Number(item.fiscalYear) === selectedYear).map((item) => ({ name: item.departmentName || item.categoryName || item.name || "Budget", budget: amountOf(item), spent: Number(item.spent || item.spentAmount || 0) }));
  const totalBudget = budgetRows.reduce((sum, item) => sum + item.budget, 0);
  const totalBudgetSpend = budgetRows.reduce((sum, item) => sum + item.spent, 0);
  const averageInvoice = yearInvoices.length ? revenue / yearInvoices.length : 0;
  const expenseByCategory = groupBy(yearExpenses, "category").slice(0, 6);
  const exportReport = () => {
    const company = companyQuery.data as any;
    if (exportFormat === "pdf") {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setTextColor(38, 50, 56);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(company?.companyName || company?.name || "Your Company", 18, 24);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text([company?.companyPhone || company?.phone, company?.companyEmail || company?.email, company?.website, company?.companyAddress || company?.address].filter(Boolean).join(" | ") || "Financial reporting centre", 18, 31);
      if (company?.logo || company?.companyLogo) {
        try { pdf.addImage(company.logo || company.companyLogo, /^data:image\/jpe?g/i.test(company.logo || company.companyLogo) ? "JPEG" : "PNG", pageWidth - 52, 10, 34, 25); } catch { /* Ignore invalid configured logos. */ }
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.line(18, 38, pageWidth - 18, 38);
      pdf.setTextColor(15, 118, 110);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text("Financial Performance Report", 18, 51);
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Reporting period: ${periodLabel}    Generated: ${new Date().toLocaleDateString()}`, 18, 58);
      const metrics = [["Accrual Revenue", fmt(revenue)], ["Actual Expense", fmt(actualExpense)], ["Surplus / Deficit", fmt(surplus)], ["Surplus / Deficit %", `${surplusPercent.toFixed(2)}%`]];
      metrics.forEach(([label, value], index) => { const x = 18 + (index % 2) * 88; const y = 72 + Math.floor(index / 2) * 25; pdf.setFillColor(245, 247, 249); pdf.roundedRect(x, y, 78, 18, 2, 2, "F"); pdf.setTextColor(100, 116, 139); pdf.setFontSize(8); pdf.text(label, x + 4, y + 6); pdf.setTextColor(38, 50, 56); pdf.setFontSize(11); pdf.setFont("helvetica", "bold"); pdf.text(value, x + 4, y + 14); pdf.setFont("helvetica", "normal"); });
      let y = 132;
      pdf.setTextColor(38, 50, 56);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Monthly Revenue vs Expense", 18, y);
      y += 10;
      pdf.setFontSize(8);
      monthly.forEach((item) => { pdf.setFont("helvetica", "normal"); pdf.text(item.month, 18, y); pdf.text(fmt(item.revenue * 100), 52, y); pdf.text(fmt(item.expense * 100), 102, y); pdf.text(fmt(item.surplus * 100), 152, y); y += 6; if (y > 275) { pdf.addPage(); y = 20; } });
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Prepared by ${company?.companyName || "Kiini"} | Confidential`, 18, 288);
      pdf.save(`financial-report-${year === "all" ? "all-time" : selectedYear}.pdf`);
      toast.success("PDF report exported");
      return;
    }
    const rows = [
      ["Company", company?.companyName || company?.name || "Your Company"],
      ["Phone", company?.companyPhone || company?.phone || ""],
      ["Email", company?.companyEmail || company?.email || ""],
      ["Website", company?.website || ""],
      ["Address", company?.companyAddress || company?.address || ""],
      [],
      ["Month", "Revenue", "Expenses", "Surplus"],
      ...monthly.map((item) => [item.month, item.revenue.toFixed(2), item.expense.toFixed(2), item.surplus.toFixed(2)]),
    ];
    const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `financial-report-${year === "all" ? "all-time" : selectedYear}.csv`; link.click(); URL.revokeObjectURL(url); toast.success("CSV report exported");
  };
  const table = (headers: string[], rows: (string | number)[][]) => <div className="overflow-x-auto"><Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length ? rows.map((row, index) => <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell key={cellIndex} className={cellIndex ? "text-right" : "font-medium"}>{cell}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={headers.length} className="py-10 text-center text-muted-foreground">No records for this period</TableCell></TableRow>}</TableBody></Table></div>;

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner className="size-8" /></div>;
  return <ModuleLayout title="Financial & Accounting" description={`${organization ? "Organization" : "Enterprise"} financial reporting workspace`} icon={<BarChart3 className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Accounting", href: "/accounting" }, { label: "Financial Dashboard" }]} actions={<div className="flex gap-2"><Select value={exportFormat} onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="csv">CSV Data</SelectItem></SelectContent></Select><Button variant="outline" onClick={exportReport}><Download className="mr-2 h-4 w-4" />Export</Button></div>}>
    <div className="kiini-report-shell space-y-5">
      <div className="kiini-report-toolbar flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financial reporting centre</p><p className="text-sm text-muted-foreground">Accrual basis reporting for {periodLabel.toLowerCase()}</p><p className="text-xs text-muted-foreground">Updated {new Date().toLocaleString()}</p></div><Select value={year} onValueChange={setYear}><SelectTrigger className="w-36"><CalendarDays className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All time</SelectItem>{[0, 1, 2, 3].map((offset) => <SelectItem key={offset} value={String(currentYear - offset)}>{currentYear - offset}</SelectItem>)}</SelectContent></Select></div>
      <Tabs value={activeTab} onValueChange={setActiveTab}><div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><TabsList className="kiini-report-sidebar h-fit flex-col items-stretch justify-start gap-0 p-2 lg:sticky lg:top-4">{TAB_ITEMS.map(([value, label]) => <TabsTrigger key={value} value={value} className="justify-start px-3 py-2 text-left">{label}</TabsTrigger>)}</TabsList><div className="min-w-0">
        <TabsContent value="home" className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatsCard label="Accrual Revenue" value={fmt(revenue)} description={`${yearInvoices.length} invoices`} icon={<TrendingUp className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Actual Expense" value={fmt(actualExpense)} description={`${yearExpenses.length} expense records`} icon={<TrendingDown className="h-5 w-5" />} color="border-l-orange-500" /><StatsCard label="Surplus / Deficit" value={fmt(surplus)} description={surplus >= 0 ? "Positive operating result" : "Operating deficit"} icon={<BarChart3 className="h-5 w-5" />} color={surplus >= 0 ? "border-l-blue-500" : "border-l-red-500"} /><StatsCard label="Surplus / Deficit %" value={`${surplusPercent.toFixed(2)}%`} description={`${fmt(collected)} cash collected`} icon={<PieChartIcon className="h-5 w-5" />} color="border-l-violet-500" /></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatsCard label="Collection rate" value={`${revenue ? ((collected / revenue) * 100).toFixed(1) : "0.0"}%`} description="Collected against accrual revenue" color="border-l-cyan-500" /><StatsCard label="Average invoice" value={fmt(averageInvoice)} description="Average invoice value for this period" color="border-l-indigo-500" /><StatsCard label="Budget utilization" value={`${totalBudget ? ((totalBudgetSpend / totalBudget) * 100).toFixed(1) : "0.0"}%`} description={`${fmt(totalBudgetSpend)} of ${fmt(totalBudget)} allocated`} color="border-l-amber-500" /><StatsCard label="Cash collected" value={fmt(collected)} description={`${yearPayments.length} payment records`} color="border-l-teal-500" /></div><Card><CardHeader><CardTitle>Revenue vs Expense</CardTitle><CardDescription>Monthly accrual revenue and actual expenses for {periodLabel.toLowerCase()}</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={330}><BarChart data={monthly}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value: number) => fmt(value * 100)} /><Legend /><Bar dataKey="revenue" name="Revenue" fill="#0f766e" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" name="Expense" fill="#f97316" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card><div className="grid gap-5 xl:grid-cols-2"><Card><CardHeader><CardTitle>Cash Collections Trend</CardTitle><CardDescription>Payments received across the selected reporting period</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value: number) => fmt(value * 100)} /><Line dataKey="collected" name="Collected" stroke="#2563eb" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Expense Breakdown</CardTitle><CardDescription>Largest expense categories for {periodLabel.toLowerCase()}</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={expenseByCategory} dataKey="amount" nameKey="name" outerRadius={95} label>{expenseByCategory.map((row, index) => <Cell key={row.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => fmt(value)} /><Legend /></PieChart></ResponsiveContainer></CardContent></Card></div></TabsContent>
        <TabsContent value="revenue-expense"><Card><CardHeader><CardTitle>Revenue vs Expense</CardTitle><CardDescription>Monthly operating result</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={400}><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value: number) => fmt(value * 100)} /><Legend /><Line dataKey="revenue" name="Revenue" stroke="#0f766e" strokeWidth={3} /><Line dataKey="expense" name="Expense" stroke="#f97316" strokeWidth={3} /><Line dataKey="surplus" name="Surplus / Deficit" stroke="#2563eb" strokeDasharray="6 4" /></LineChart></ResponsiveContainer></CardContent></Card></TabsContent>
        <TabsContent value="top-revenue" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Revenue contributors" value={topRevenue.length} description="Clients with invoices" icon={<TrendingUp className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Top contributor" value={topRevenue[0]?.name || "-"} description={topRevenue[0] ? fmt(topRevenue[0].amount) : "No revenue"} icon={<BarChart3 className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Top 5 share" value={revenue ? `${((topRevenue.slice(0, 5).reduce((sum, row) => sum + row.amount, 0) / revenue) * 100).toFixed(1)}%` : "0.0%"} description="Of YTD accrual revenue" icon={<PieChartIcon className="h-5 w-5" />} color="border-l-violet-500" /></div><Card><CardHeader><CardTitle>Top Revenue Contributors</CardTitle><CardDescription>Ranked client revenue for {selectedYear}</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><BarChart data={topRevenue.slice(0, 8)} layout="vertical"><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={130} /><Tooltip formatter={(value: number) => fmt(value)} /><Bar dataKey="amount" name="Revenue" fill="#1abb9c" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer>{table(["Client", "Invoices", "Revenue", "Share"], topRevenue.map((row: any) => [row.name, row.count, fmt(row.amount), revenue ? `${((row.amount / revenue) * 100).toFixed(1)}%` : "0.0%" ]))}</CardContent></Card></TabsContent>
        <TabsContent value="top-expenses"><Card><CardHeader><CardTitle>Top Expenses</CardTitle><CardDescription>Expense concentration by category</CardDescription></CardHeader><CardContent>{table(["Category", "Transactions", "Actual expense"], topExpenses.map((row: any) => [row.name, row.count, fmt(row.amount)]))}</CardContent></Card></TabsContent>
        <TabsContent value="income-revenue"><Card><CardHeader><CardTitle>Income statement - Revenue</CardTitle></CardHeader><CardContent>{table(["Revenue line", "Transactions", "Amount"], topRevenue.map((row: any) => [row.name, row.count, fmt(row.amount)]))}</CardContent></Card></TabsContent>
        <TabsContent value="income-expenses"><Card><CardHeader><CardTitle>Income statement - Expenses</CardTitle></CardHeader><CardContent>{table(["Expense line", "Transactions", "Amount"], topExpenses.map((row: any) => [row.name, row.count, fmt(row.amount)]))}</CardContent></Card></TabsContent>
        <TabsContent value="ytd-revenue"><Card><CardHeader><CardTitle>{allTime ? "All-time Revenue Variable Analysis" : "YTD Revenue Variable Analysis"}</CardTitle><CardDescription>Monthly revenue movement and contribution for {periodLabel}</CardDescription></CardHeader><CardContent>{table(["Month", "Revenue", "Share"], monthly.map((row) => [row.month, fmt(row.revenue * 100), revenue ? `${((row.revenue * 100 / revenue) * 100).toFixed(1)}%` : "0.0%" ]))}</CardContent></Card></TabsContent>
        <TabsContent value="ytd-expenses"><Card><CardHeader><CardTitle>{allTime ? "All-time Expense Variable Analysis" : "YTD Expenses Variable Analysis"}</CardTitle><CardDescription>Monthly cost movement and contribution for {periodLabel}</CardDescription></CardHeader><CardContent>{table(["Month", "Expense", "Share"], monthly.map((row) => [row.month, fmt(row.expense * 100), actualExpense ? `${((row.expense * 100 / actualExpense) * 100).toFixed(1)}%` : "0.0%" ]))}</CardContent></Card></TabsContent>
        <TabsContent value="variances" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Revenue variance" value={`${variance >= 0 ? "+" : ""}${fmt(variance)}`} description={`Compared with ${comparisonYear}`} icon={<TrendingUp className="h-5 w-5" />} color={variance >= 0 ? "border-l-emerald-500" : "border-l-red-500"} /><StatsCard label="Expense variance" value={`${expenseVariance >= 0 ? "+" : ""}${fmt(expenseVariance)}`} description="Lower is better" icon={<TrendingDown className="h-5 w-5" />} color={expenseVariance <= 0 ? "border-l-emerald-500" : "border-l-orange-500"} /><StatsCard label="Result variance" value={fmt((comparisonRevenue - comparisonExpense) - (previousInvoices - previousExpenses))} description="Change in surplus / deficit" icon={<BarChart3 className="h-5 w-5" />} color="border-l-blue-500" /></div><Card><CardHeader><CardTitle>Yearly Variance Comparison</CardTitle><CardDescription>{reportingYear} compared with {comparisonYear}</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={[{ name: "Revenue", current: comparisonRevenue / 100, previous: previousInvoices / 100 }, { name: "Expenses", current: comparisonExpense / 100, previous: previousExpenses / 100 }, { name: "Surplus", current: (comparisonRevenue - comparisonExpense) / 100, previous: (previousInvoices - previousExpenses) / 100 }]}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="current" name={String(reportingYear)} fill="#3498db" /><Bar dataKey="previous" name={String(comparisonYear)} fill="#95a5a6" /></BarChart></ResponsiveContainer>{table(["Measure", String(reportingYear), String(comparisonYear), "Variance"], [["Revenue", fmt(comparisonRevenue), fmt(previousInvoices), `${variance >= 0 ? "+" : ""}${fmt(variance)}`], ["Expenses", fmt(comparisonExpense), fmt(previousExpenses), `${expenseVariance >= 0 ? "+" : ""}${fmt(expenseVariance)}`], ["Surplus / Deficit", fmt(comparisonRevenue - comparisonExpense), fmt(previousInvoices - previousExpenses), fmt((comparisonRevenue - comparisonExpense) - (previousInvoices - previousExpenses))]])}</CardContent></Card></TabsContent>
        <TabsContent value="mom" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Average MoM growth" value={`${(mom.reduce((sum, row) => sum + row.growth, 0) / Math.max(1, mom.length - 1)).toFixed(1)}%`} description="Average monthly revenue change" icon={<TrendingUp className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Best month" value={mom.reduce((best, row) => row.growth > best.growth ? row : best, mom[0]).month} description={`${mom.reduce((best, row) => row.growth > best.growth ? row : best, mom[0]).growth.toFixed(1)}% growth`} icon={<BarChart3 className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Lowest month" value={mom.reduce((worst, row) => row.growth < worst.growth ? row : worst, mom[0]).month} description={`${mom.reduce((worst, row) => row.growth < worst.growth ? row : worst, mom[0]).growth.toFixed(1)}% growth`} icon={<TrendingDown className="h-5 w-5" />} color="border-l-orange-500" /></div><Card><CardHeader><CardTitle>Month-over-Month Growth</CardTitle><CardDescription>Revenue movement and monthly variance</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><LineChart data={mom}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} /><Line dataKey="growth" name="Revenue growth" stroke="#3498db" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>{table(["Month", "Revenue", "Growth", "Surplus / Deficit"], mom.map((row) => [row.month, fmt(row.revenue * 100), `${row.growth >= 0 ? "+" : ""}${row.growth.toFixed(1)}%`, fmt(row.surplus * 100)]))}</CardContent></Card></TabsContent>
        <TabsContent value="distribution"><Card><CardHeader><CardTitle>Distribution</CardTitle><CardDescription>Revenue and expense concentration</CardDescription></CardHeader><CardContent><div className="grid gap-6 lg:grid-cols-2"><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={topRevenue.slice(0, 6)} dataKey="amount" nameKey="name" outerRadius={110} label>{topRevenue.slice(0, 6).map((row: any, index) => <Cell key={row.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => fmt(value)} /></PieChart></ResponsiveContainer><ResponsiveContainer width="100%" height={320}><BarChart data={topExpenses.slice(0, 6)} layout="vertical"><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={110} /><Tooltip formatter={(value: number) => fmt(value)} /><Bar dataKey="amount" fill="#f97316" /></BarChart></ResponsiveContainer></div></CardContent></Card></TabsContent>
        <TabsContent value="budget"><Card><CardHeader><CardTitle>Budget Analysis</CardTitle><CardDescription>Budget allocation versus actual spend</CardDescription></CardHeader><CardContent>{table(["Budget line", "Allocated", "Spent", "Utilisation"], budgetRows.map((row: any) => [row.name, fmt(row.budget), fmt(row.spent), row.budget ? `${((row.spent / row.budget) * 100).toFixed(1)}%` : "0.0%" ]))}</CardContent></Card></TabsContent>
      </div></div></Tabs>
    </div>
  </ModuleLayout>;
}
