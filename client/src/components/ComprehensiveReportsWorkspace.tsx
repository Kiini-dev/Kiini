import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, BriefcaseBusiness, Building2, CalendarDays, Download, FileText, FolderKanban, Landmark, TrendingDown, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
import autoTable from "jspdf-autotable";
import { exportCsvWithCompanyHeader } from "@/utils/companyExport";
import { addPdfBarChart, addPdfKpiCards } from "@/utils/reportPdfAnalytics";

const TABS = [
  ["overview", "Homepage"], ["finance", "Financial"], ["crm", "CRM & Sales"], ["projects", "Projects"],
  ["hr", "HR & Payroll"], ["procurement", "Procurement"], ["operations", "Operations"], ["enterprise", "Enterprise"],
] as const;

const REPORT_PAGES = [
  ["/reports/sales", "Sales Reports"],
  ["/reports/projects", "Projects Reports"],
  ["/finance/reports", "Financial Reports"],
  ["/reports/customers", "Customer / Client Reports"],
  ["/payroll/tax-compliance", "Tax Compliance Reports"],
  ["/enterprise/reports", "Enterprise Reports & Analytics"],
] as const;

function ReportChart({ title, data, lines = false }: { title: string; data: any[]; lines?: boolean }) {
  return <Card className="kiini-report-panel"><CardHeader><CardTitle className="text-base uppercase tracking-wide text-slate-700">{title}</CardTitle><CardDescription>Visual trend for the selected period</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}>{lines ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line dataKey="revenue" name="Revenue" stroke="#1abb9c" strokeWidth={2} dot={false} /><Line dataKey="expenses" name="Expenses" stroke="#e74c3c" strokeWidth={2} dot={false} /></LineChart> : <BarChart data={data}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="value" name="Records" fill="#3498db" radius={[2, 2, 0, 0]} /></BarChart>}</ResponsiveContainer></CardContent></Card>;
}

function list(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const nested = Object.values(value as Record<string, unknown>).find(Array.isArray);
    return (nested as any[]) || [];
  }
  return [];
}
function amount(row: any) { return Number(row.total ?? row.amount ?? row.budget ?? row.value ?? 0) || 0; }
function date(row: any) { return new Date(row.paymentDate || row.invoiceDate || row.issueDate || row.expenseDate || row.date || row.createdAt || 0); }

export default function ComprehensiveReportsWorkspace() {
  const { user } = useAuth();
  const { code } = useCurrencySettings();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [tab, setTab] = useState("overview");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("pdf");
  const [aiPrompt, setAiPrompt] = useState("Generate a quarterly performance summary with revenue, cost, margin, risks, and recommended actions.");
  const aiReportMutation = trpc.ai.generateCustomAnalyticsReport.useMutation();
  const invoicesQ = trpc.invoices.list.useQuery({});
  const paymentsQ = trpc.payments.list.useQuery({});
  const expensesQ = trpc.expenses.list.useQuery({});
  const clientsQ = trpc.clients.list.useQuery({});
  const projectsQ = trpc.projects.list.useQuery({});
  const employeesQ = trpc.employees.list.useQuery({});
  const departmentsQ = trpc.departments.list.useQuery({});
  const leaveQ = trpc.leave.list.useQuery({});
  const suppliersQ = trpc.suppliers.list.useQuery({ limit: 500 });
  const lpoQ = trpc.lpo.list.useQuery({});
  const ordersQ = trpc.procurementMgmt.orderList.useQuery({});
  const timeQ = trpc.timeEntries.list.useQuery({});
  const companyQ = trpc.settings.getCompanyInfo.useQuery();
  const enterpriseTenantsQ = trpc.enterpriseTenants.list.useQuery({ limit: 100, offset: 0, sortBy: "createdAt", sortOrder: "desc" }, { enabled: user?.role === "super_admin" });
  const invoices = list(invoicesQ.data), payments = list(paymentsQ.data), expenses = list(expensesQ.data), clients = list(clientsQ.data);
  const projects = list(projectsQ.data), employees = list(employeesQ.data), departments = list(departmentsQ.data), leave = list(leaveQ.data);
  const suppliers = list(suppliersQ.data), lpos = list(lpoQ.data), orders = list(ordersQ.data), timeEntries = list(timeQ.data);
  const enterpriseTenants = enterpriseTenantsQ.data?.tenants || [];
  const enterpriseActive = enterpriseTenants.filter((tenant: any) => tenant.isActive).length;
  const enterpriseUsers = enterpriseTenants.reduce((sum: number, tenant: any) => sum + Number(tenant.userCount || 0), 0);
  const enterpriseCapacity = enterpriseTenants.reduce((sum: number, tenant: any) => sum + (tenant.maxUsers > 0 ? tenant.maxUsers : 0), 0);
  const reportQueries = [invoicesQ, paymentsQ, expensesQ, clientsQ, projectsQ, employeesQ, departmentsQ, leaveQ, suppliersQ, lpoQ, ordersQ, timeQ];
  const loading = reportQueries.some((query) => query.isLoading);
  const queryErrors = reportQueries
    .filter((query) => query.isError)
    .map((query) => query.error?.message || "Request failed");
  const selectedYear = year === "all" ? null : Number(year);
  const reportPeriod = selectedYear === null ? "All time" : String(selectedYear);
  const inYear = (row: any) => {
    const recordDate = date(row);
    return !Number.isNaN(recordDate.getTime()) && (selectedYear === null || recordDate.getFullYear() === selectedYear);
  };
  const inv = useMemo(() => invoices.filter(inYear), [invoices, selectedYear]);
  const exp = useMemo(() => expenses.filter(inYear), [expenses, selectedYear]);
  const pay = useMemo(() => payments.filter((row) => inYear(row) && row.status === "completed"), [payments, selectedYear]);
  const invoiced = inv.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + amount(row), 0);
  const revenue = pay.reduce((sum, row) => sum + amount(row), 0);
  const expenseTotal = exp.reduce((sum, row) => sum + amount(row), 0);
  const collected = revenue;
  const net = revenue - expenseTotal;
  const fmt = (value: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(value / 100);
  const monthlyFinance = useMemo(() => {
    const buckets = new Map<string, { month: string; revenue: number; expenses: number }>();
    const addMonth = (recordDate: Date) => {
      const key = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          month: selectedYear === null
            ? recordDate.toLocaleString("en", { month: "short", year: "numeric" })
            : recordDate.toLocaleString("en", { month: "short" }),
          revenue: 0,
          expenses: 0,
        });
      }
      return buckets.get(key)!;
    };
    if (selectedYear !== null) {
      for (let month = 0; month < 12; month += 1) addMonth(new Date(selectedYear, month));
    }
    pay.forEach((row) => { addMonth(date(row)).revenue += amount(row) / 100; });
    exp.forEach((row) => { addMonth(date(row)).expenses += amount(row) / 100; });
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
  }, [pay, exp, selectedYear]);
  const statusRows = (rows: any[], key = "status") => Object.values(rows.reduce((map, row) => { const value = row[key] || "Unspecified"; map[value] = (map[value] || 0) + 1; return map; }, {} as Record<string, number>)).map((value, index) => ({ status: Object.keys(rows.reduce((map, row) => { const item = row[key] || "Unspecified"; map[item] = true; return map; }, {} as Record<string, boolean>))[index], count: value }));
  const enterprisePlanRows = statusRows(enterpriseTenants, "plan");
  const exportReport = () => {
    const company = companyQ.data as any;
    if (exportFormat === "pdf") {
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const safe = (value: string | number | undefined) => String(value ?? "").trim() || "N/A";
      const safeDate = (value: unknown) => {
        if (!value) return "N/A";
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-KE");
      };
      const addHeader = (title: string, subtitle?: string) => {
        pdf.setFillColor(15, 118, 110);
        pdf.rect(0, 0, pageWidth, 46, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(19);
        pdf.text(safe(company?.companyName || "Kiini"), margin, 28);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(safe(company?.companyAddress || company?.address || "Reports & Analytics"), margin, 40);
        pdf.setTextColor(38, 50, 56);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(title, margin, 86);
        if (subtitle) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          pdf.text(subtitle, margin, 104);
        }
        return 118;
      };
      const addFooter = () => {
        const pageCount = pdf.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          pdf.setPage(page);
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Prepared by ${safe(company?.companyName || "Kiini")} | Confidential`, margin, pageHeight - 28);
          pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 28, { align: "right" });
        }
      };
      const addSection = (title: string, headers: string[], rows: (string | number)[][], color: [number, number, number] = [15, 118, 110]) => {
        if (y > pageHeight - 120) {
          pdf.addPage();
          y = 58;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(38, 50, 56);
        pdf.text(title, margin, y);
        autoTable(pdf, {
          startY: y + 10,
          margin: { left: margin, right: margin, bottom: 48 },
          head: [headers],
          body: rows.length ? rows : [["No records for this period", ...headers.slice(1).map(() => "")]],
          styles: { fontSize: 7.5, cellPadding: 5, overflow: "linebreak" },
          headStyles: { fillColor: color, textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 247, 249] },
          didDrawPage: () => {
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Prepared by ${safe(company?.companyName || "Kiini")} | Confidential`, margin, pageHeight - 28);
          },
        });
        y = (pdf as any).lastAutoTable.finalY + 24;
      };

      const summaryRows = [
        ["Cash Revenue", fmt(revenue)],
        ["Invoiced", fmt(invoiced)],
        ["Actual Expenses", fmt(expenseTotal)],
        ["Net Result", fmt(net)],
        ["Cash Collected", fmt(collected)],
        ["Collection Rate", `${invoiced ? ((collected / invoiced) * 100).toFixed(1) : "0.0"}%`],
        ["Active Projects", String(projects.length)],
      ];

      let y = addHeader("Reports & Analytics", `Reporting period: ${reportPeriod} • Generated on ${new Date().toLocaleDateString()}`);
      addSection("Executive summary", ["Metric", "Value"], summaryRows);
      y = addPdfKpiCards(pdf, [
        { label: "Cash revenue", value: fmt(revenue), color: [15, 118, 110] },
        { label: "Invoiced", value: fmt(invoiced), color: [37, 99, 235] },
        { label: "Expenses", value: fmt(expenseTotal), color: [234, 88, 12] },
        { label: "Net result", value: fmt(net), color: net >= 0 ? [22, 163, 74] : [220, 38, 38] },
        { label: "Active projects", value: activeProjects, color: [8, 145, 178] },
        { label: "Active employees", value: activeEmployees, color: [79, 70, 229] },
      ], y + 8, margin);
      y = addPdfBarChart(pdf, "Monthly cash revenue and expenses", monthlyFinance.map((row) => row.month), [
        { label: "Cash revenue", values: monthlyFinance.map((row) => row.revenue), color: [15, 118, 110] },
        { label: "Expenses", values: monthlyFinance.map((row) => row.expenses), color: [234, 88, 12] },
      ], y + 8, margin);
      const chartStatusRows = (rows: any[], key = "status") => {
        const counts = new Map<string, number>();
        rows.forEach((row) => {
          const label = String(row[key] || "Unspecified");
          counts.set(label, (counts.get(label) || 0) + 1);
        });
        return Array.from(counts, ([label, count]) => ({ label, count })).slice(0, 8);
      };
      for (const chart of [
        { title: "Invoices by status", rows: chartStatusRows(inv) },
        { title: "Projects by status", rows: chartStatusRows(projects) },
        { title: "Leave requests by status", rows: chartStatusRows(leave) },
        { title: "Procurement by status", rows: chartStatusRows([...lpos, ...orders]) },
      ]) {
        y = addPdfBarChart(pdf, chart.title, chart.rows.map((row) => row.label), [
          { label: "Records", values: chart.rows.map((row) => row.count), color: [37, 99, 235] },
        ], y + 4, margin);
      }
      addSection("Monthly financial performance", ["Month", "Cash Revenue", "Expenses", "Net"], monthlyFinance.map((row) => [row.month, fmt(row.revenue * 100), fmt(row.expenses * 100), fmt((row.revenue - row.expenses) * 100)]), [52, 152, 219]);
      addSection("Operational coverage", ["Module", "Records", "Context"], [
        ["Invoices", String(inv.length), fmt(revenue)], ["Payments", String(pay.length), fmt(collected)],
        ["Clients", String(clients.length), "Customer base"], ["Projects", String(projects.length), `${activeProjects} active`],
        ["Employees", String(employees.length), `${activeEmployees} active`], ["Suppliers", String(suppliers.length), "Procurement partners"],
      ], [99, 102, 241]);
      addSection("Invoice detail", ["Number", "Date", "Status", "Client", "Total"], inv.map((row: any) => [safe(row.invoiceNumber || row.number || row.id), safeDate(row.invoiceDate || row.issueDate || row.createdAt), safe(row.status), safe(row.clientName || row.client?.companyName || row.clientId), fmt(amount(row))]));
      addSection("Payment detail", ["Reference", "Date", "Status", "Method", "Amount"], pay.map((row: any) => [safe(row.referenceNumber || row.paymentNumber || row.id), safeDate(row.paymentDate || row.date || row.createdAt), safe(row.status), safe(row.paymentMethod || row.method), fmt(amount(row))]), [16, 185, 129]);
      addSection("Expense detail", ["Description", "Date", "Category", "Status", "Amount"], exp.map((row: any) => [safe(row.description || row.title || row.id), safeDate(row.expenseDate || row.date || row.createdAt), safe(row.category), safe(row.status), fmt(amount(row))]), [234, 88, 12]);
      addSection("Client and project detail", ["Type", "Name", "Status", "Owner / Client", "Created"], [
        ...clients.map((row: any) => ["Client", safe(row.companyName || row.name || row.id), safe(row.status), safe(row.contactPerson || row.email), safeDate(row.createdAt)]),
        ...projects.map((row: any) => ["Project", safe(row.name || row.id), safe(row.status), safe(row.projectManagerName || row.clientId), safeDate(row.createdAt)]),
      ], [15, 23, 42]);
      addSection("HR detail", ["Employee / Request", "Type", "Status", "Department", "Date"], [
        ...employees.map((row: any) => [safe(`${row.firstName || ""} ${row.lastName || ""}`.trim() || row.id), "Employee", safe(row.status), safe(row.department), safeDate(row.createdAt)]),
        ...leave.map((row: any) => [safe(row.employeeName || row.employeeId || row.id), "Leave request", safe(row.status), safe(row.leaveType || row.type), safeDate(row.startDate || row.createdAt)]),
      ], [124, 58, 237]);
      addSection("Procurement detail", ["Record", "Type", "Status", "Supplier", "Amount"], [
        ...lpos.map((row: any) => [safe(row.lpoNumber || row.id), "LPO", safe(row.status), safe(row.supplierName || row.supplierId), fmt(amount(row))]),
        ...orders.map((row: any) => [safe(row.orderNumber || row.id), "Order", safe(row.status), safe(row.supplierName || row.supplierId), fmt(amount(row))]),
      ], [15, 23, 42]);
      addSection("Operations detail", ["Entry", "User / Project", "Date", "Hours", "Status"], timeEntries.map((row: any) => [safe(row.id), safe(row.userName || row.employeeName || row.projectId), safeDate(row.date || row.createdAt), String(Number(row.durationMinutes || row.hours * 60 || 0) / 60), safe(row.status)]), [71, 85, 105]);

      const aiSummaryText = aiPrompt || "Generate a quarterly performance summary with revenue, cost, margin, risks, and recommended actions.";
      const summaryLines = [
        "AI-assisted narrative:",
        `Requested prompt: ${aiSummaryText}`,
        `Revenue: ${fmt(revenue)} | Expenses: ${fmt(expenseTotal)} | Net: ${fmt(net)}`,
        `Collection rate: ${invoiced ? ((collected / invoiced) * 100).toFixed(1) : "0.0"}% | Active projects: ${projects.filter((row) => !["completed", "cancelled"].includes(String(row.status || "").toLowerCase())).length}`,
        "Action focus: improve collections, control discretionary spend, and keep delivery pipelines moving.",
      ];
      if (y > pageHeight - 180) { pdf.addPage(); y = 58; }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("AI-assisted executive summary", margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const wrapped = pdf.splitTextToSize(summaryLines.join("\n"), pageWidth - margin * 2);
      pdf.text(wrapped, margin, y + 16);

      addFooter();
      pdf.save(`reporting-analytics-${year === "all" ? "all-time" : selectedYear}.pdf`);
      toast.success("Comprehensive PDF report exported");
      return;
    }

    exportCsvWithCompanyHeader(`module-report-${year === "all" ? "all-time" : selectedYear}`, monthlyFinance.map((row) => ({ Month: row.month, Revenue: row.revenue.toFixed(2), Expenses: row.expenses.toFixed(2), Net: (row.revenue - row.expenses).toFixed(2) })), { name: company?.companyName || company?.name, email: company?.companyEmail || company?.email, phone: company?.companyPhone || company?.phone, address: company?.companyAddress || company?.address, website: company?.website, tagline: company?.tagline });
    toast.success("CSV report exported");
  };
  const table = (headers: string[], rows: (string | number)[][]) => <div className="overflow-x-auto"><Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length ? rows.map((row, index) => <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell key={cellIndex} className={cellIndex ? "text-right" : "font-medium"}>{cell}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={headers.length} className="py-10 text-center text-muted-foreground">No records for this period</TableCell></TableRow>}</TableBody></Table></div>;
  const activeProjects = projects.filter((row) => !["completed", "cancelled"].includes(row.status)).length;
  const activeEmployees = employees.filter((row) => row.isActive !== 0 && row.status !== "inactive").length;
  const pendingLeave = leave.filter((row) => row.status === "pending").length;
  const procurementValue = [...lpos, ...orders].filter(inYear).reduce((sum, row) => sum + amount(row), 0);
  const timeHours = timeEntries.filter(inYear).reduce((sum, row) => sum + Number(row.durationMinutes || row.hours * 60 || 0), 0) / 60;
  const financeRows = monthlyFinance.map((row) => [row.month, fmt(row.revenue * 100), fmt(row.expenses * 100), fmt((row.revenue - row.expenses) * 100)]);
  const activeReport = TABS.find(([value]) => value === tab)?.[1] || "Report";
  const chartData = tab === "finance" ? monthlyFinance.map((row) => ({ ...row, value: row.revenue })) : tab === "overview" ? monthlyFinance.map((row) => ({ month: row.month, value: row.revenue + row.expenses })) : (tab === "crm" ? statusRows(inv) : tab === "projects" ? statusRows(projects) : tab === "hr" ? statusRows(leave) : tab === "procurement" ? statusRows([...lpos, ...orders]) : [{ month: "Selected year", value: timeEntries.length }]).map((row: any) => ({ month: row.month || row.status, value: row.value ?? row.count ?? 0 }));

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner className="size-8" /></div>;
  return <ModuleLayout title="Reports & Analytics" description="Comprehensive reporting across finance, CRM, projects, people, procurement, and operations" icon={<BarChart3 className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Reports" }]} actions={<div className="flex gap-2"><Select value={exportFormat} onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="csv">CSV Data</SelectItem></SelectContent></Select><Button variant="outline" onClick={exportReport}><Download className="mr-2 h-4 w-4" />Export</Button></div>}>
    <div className="kiini-report-shell space-y-5">
      {queryErrors.length > 0 && <Card role="alert" className="border-destructive"><CardContent className="pt-6 text-sm text-destructive">Some report data could not be loaded: {queryErrors.join("; ")}</CardContent></Card>}
      <div className="kiini-report-toolbar flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reporting centre</p><p className="text-sm text-muted-foreground">Live operational reporting for {reportPeriod}</p></div><Select value={year} onValueChange={setYear}><SelectTrigger className="w-32"><CalendarDays className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All time</SelectItem>{[0, 1, 2].map((offset) => <SelectItem key={offset} value={String(new Date().getFullYear() - offset)}>{new Date().getFullYear() - offset}</SelectItem>)}</SelectContent></Select></div>
      <Tabs value={tab} onValueChange={setTab}><div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="kiini-report-sidebar h-fit p-2 lg:sticky lg:top-4"><p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Report views</p><TabsList className="flex h-auto flex-col items-stretch justify-start gap-0 bg-transparent p-0">{TABS.map(([value, label]) => <TabsTrigger key={value} value={value} className="justify-start px-3 py-2 text-left">{label}</TabsTrigger>)}</TabsList><div className="my-2 border-t border-slate-200" /><p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Report pages</p><nav className="space-y-0.5">{REPORT_PAGES.map(([href, label]) => <a key={href} href={href} className="block rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">{label}</a>)}</nav></aside><div className="min-w-0">
        <Card className="mb-5 border-emerald-200 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900"><FileText className="h-4 w-4" /> AI-assisted report query</CardTitle>
            <CardDescription className="text-emerald-800/80">Ask for a specific business summary, risk review, or KPI-focused report and generate a live executive brief from the organization data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} className="min-h-[96px] w-full rounded-md border border-emerald-200 bg-white p-3 text-sm outline-none ring-0" placeholder="Generate a quarterly performance summary with revenue, cost, margin, risks, and recommended actions." />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default" onClick={() => aiReportMutation.mutate({ prompt: aiPrompt, ...(selectedYear === null ? { allTime: true } : { year: selectedYear }) })} disabled={aiReportMutation.isPending}>
                {aiReportMutation.isPending ? "Generating..." : "Generate AI report"}
              </Button>
              <span className="text-xs text-slate-500">This combines live business metrics with AI narrative summarization.</span>
            </div>
            {aiReportMutation.data && (
              <div className="rounded-md border border-emerald-200 bg-white p-4 text-sm text-slate-700">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">{aiReportMutation.data.title}</div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">{aiReportMutation.data.provider}</span>
                </div>
                <div className="whitespace-pre-line text-sm leading-6 text-slate-700">{aiReportMutation.data.summary}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-slate-600">
                  <div className="rounded bg-slate-50 p-2"><div className="font-semibold text-slate-900">Revenue</div><div>{fmt(aiReportMutation.data.metrics.revenue)}</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="font-semibold text-slate-900">Expenses</div><div>{fmt(aiReportMutation.data.metrics.expenses)}</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="font-semibold text-slate-900">Net</div><div>{fmt(aiReportMutation.data.metrics.net)}</div></div>
                </div>
              </div>
            )}
            {aiReportMutation.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{aiReportMutation.error.message}</div>
            )}
          </CardContent>
        </Card>

        <TabsContent value="overview" className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><StatsCard label="Cash Revenue" value={fmt(revenue)} description={`${pay.length} completed payments`} icon={<TrendingUpIcon />} color="border-l-emerald-500" /><StatsCard label="Invoiced" value={fmt(invoiced)} description="Issued, non-cancelled invoices" icon={<FileText className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Actual Expenses" value={fmt(expenseTotal)} description={`${exp.length} records`} icon={<TrendingDownIcon />} color="border-l-orange-500" /><StatsCard label="Active Projects" value={activeProjects} description={`${projects.length} total projects`} icon={<FolderKanban className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Active Employees" value={activeEmployees} description={`${departments.length} departments`} icon={<Users className="h-5 w-5" />} color="border-l-violet-500" /></div><Card><CardHeader><CardTitle>Business performance</CardTitle><CardDescription>Completed payments and actual expense movement by month</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={330}><BarChart data={monthlyFinance}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="revenue" name="Cash Revenue" fill="#0f766e" /><Bar dataKey="expenses" name="Expenses" fill="#f97316" /></BarChart></ResponsiveContainer></CardContent></Card></TabsContent>
        <TabsContent value="finance" className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatsCard label="Surplus / Deficit" value={fmt(net)} description={net >= 0 ? "Positive operating result" : "Operating deficit"} icon={<Landmark className="h-5 w-5" />} color={net >= 0 ? "border-l-blue-500" : "border-l-red-500"} /><StatsCard label="Cash Collected" value={fmt(collected)} description="Payments recorded" icon={<Activity className="h-5 w-5" />} color="border-l-teal-500" /><StatsCard label="Collection Rate" value={`${revenue ? ((collected / revenue) * 100).toFixed(1) : "0.0"}%`} description="Collected against revenue" icon={<TrendingUpIcon />} color="border-l-green-500" /><StatsCard label="Reporting Detail" value="12 views" description="Open full Financial Dashboard" icon={<FileText className="h-5 w-5" />} color="border-l-amber-500" /></div><Card><CardHeader><CardTitle>Monthly income statement</CardTitle><CardDescription>Open the Financial Dashboard for the full tabbed analysis</CardDescription></CardHeader><CardContent>{table(["Month", "Revenue", "Expenses", "Surplus / Deficit"], financeRows)}</CardContent></Card><Button onClick={() => { window.location.href = "/financial-dashboard" }}>Open Financial Dashboard</Button></TabsContent>
        <TabsContent value="crm" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Clients" value={clients.length} description="Customer records" icon={<Users className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Invoices" value={inv.length} description={fmt(revenue)} icon={<FileText className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Payments" value={pay.length} description={fmt(collected)} icon={<Landmark className="h-5 w-5" />} color="border-l-teal-500" /></div><Card><CardHeader><CardTitle>Invoice status distribution</CardTitle></CardHeader><CardContent>{table(["Status", "Invoices"], statusRows(inv).map((row: any) => [row.status, row.count]))}</CardContent></Card></TabsContent>
        <TabsContent value="projects" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Total Projects" value={projects.length} description="All project records" icon={<FolderKanban className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Active Projects" value={activeProjects} description="In delivery" icon={<BriefcaseBusiness className="h-5 w-5" />} color="border-l-emerald-500" /><StatsCard label="Time Logged" value={`${timeHours.toFixed(1)} hrs`} description="Selected year" icon={<Activity className="h-5 w-5" />} color="border-l-violet-500" /></div><Card><CardHeader><CardTitle>Project status</CardTitle></CardHeader><CardContent>{table(["Status", "Projects"], statusRows(projects).map((row: any) => [row.status, row.count]))}</CardContent></Card></TabsContent>
        <TabsContent value="hr" className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatsCard label="Employees" value={employees.length} description={`${activeEmployees} active`} icon={<Users className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Departments" value={departments.length} description="Organizational units" icon={<Building2 className="h-5 w-5" />} color="border-l-violet-500" /><StatsCard label="Leave Requests" value={leave.length} description={`${pendingLeave} pending`} icon={<CalendarDays className="h-5 w-5" />} color="border-l-amber-500" /><StatsCard label="Payroll Scope" value="Live" description="Use HR reports for payroll detail" icon={<Landmark className="h-5 w-5" />} color="border-l-emerald-500" /></div><Card><CardHeader><CardTitle>Leave status analysis</CardTitle></CardHeader><CardContent>{table(["Status", "Requests"], statusRows(leave).map((row: any) => [row.status, row.count]))}</CardContent></Card></TabsContent>
        <TabsContent value="procurement" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Suppliers" value={suppliers.length} description="Vendor directory" icon={<Building2 className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Purchase Requests" value={lpos.length} description={fmt(procurementValue)} icon={<FileText className="h-5 w-5" />} color="border-l-orange-500" /><StatsCard label="Orders" value={orders.length} description="Procurement orders" icon={<BriefcaseBusiness className="h-5 w-5" />} color="border-l-teal-500" /></div><Card><CardHeader><CardTitle>Procurement status analysis</CardTitle></CardHeader><CardContent>{table(["Status", "Records"], statusRows([...lpos, ...orders]).map((row: any) => [row.status, row.count]))}</CardContent></Card></TabsContent>
        <TabsContent value="operations" className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Time Entries" value={timeEntries.length} description={`${timeHours.toFixed(1)} hours`} icon={<Activity className="h-5 w-5" />} color="border-l-blue-500" /><StatsCard label="Departments" value={departments.length} description="Operational structure" icon={<Building2 className="h-5 w-5" />} color="border-l-violet-500" /><StatsCard label="Data Coverage" value="Live" description="Current application records" icon={<BarChart3 className="h-5 w-5" />} color="border-l-emerald-500" /></div><Card><CardHeader><CardTitle>Operational reporting</CardTitle><CardDescription>Use module pages for drill-down and record-level actions.</CardDescription></CardHeader><CardContent>{table(["Module", "Records", "Primary report"], [["Clients", clients.length, "CRM & Sales"], ["Projects", projects.length, "Projects"], ["Employees", employees.length, "HR & Payroll"], ["Suppliers", suppliers.length, "Procurement"], ["Time entries", timeEntries.length, "Operations"]])}</CardContent></Card></TabsContent>
      </div></div></Tabs>
      <ReportChart title={`${activeReport} visual analysis`} data={chartData} lines={tab === "overview" || tab === "finance"} />
    </div>
  </ModuleLayout>;
}
function TrendingUpIcon() { return <TrendingUp className="h-5 w-5" />; }
function TrendingDownIcon() { return <TrendingDown className="h-5 w-5" />; }
