import { useState } from "react";
import { format } from "date-fns";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, FileCheck2, Filter, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { toast } from "sonner";
import { ReportNavigation } from "@/components/ReportNavigation";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";

const currentYear = new Date().getFullYear();
const money = (value: number, currency: string) => new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 0 }).format((value || 0) / 100);

export default function TaxComplianceReportsPage() {
  const { code } = useCurrencySettings();
  const [from, setFrom] = useState(format(new Date(currentYear, 0, 1), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [taxYear, setTaxYear] = useState(String(currentYear));
  const [employeeId, setEmployeeId] = useState("all");
  const [p9Status, setP9Status] = useState("all");
  const rangeInput = { from: new Date(from), to: new Date(to) };
  const paye = trpc.taxCompliance.getPAYEReport.useQuery(rangeInput);
  const nssf = trpc.taxCompliance.getNSSFReport.useQuery(rangeInput);
  const shif = trpc.taxCompliance.getSHIFReport.useQuery(rangeInput);
  const housing = trpc.taxCompliance.getHousingLevyReport.useQuery(rangeInput);
  const kraExport = trpc.taxCompliance.getKRAFilingFormat.useQuery(rangeInput, { enabled: false });
  const ytd = trpc.taxCompliance.getYearToDateSummary.useQuery({});
  const employees = trpc.employees.list.useQuery({});
  const p9QueryInput = {
    taxYear: Number(taxYear),
    ...(employeeId && employeeId !== "all" ? { employeeId } : {}),
    ...(p9Status && p9Status !== "all" ? { status: p9Status as any } : {}),
    limit: 200,
    offset: 0,
  };
  const p9 = trpc.p9Forms.list.useQuery(p9QueryInput);
  const generateP9 = trpc.p9Forms.generateForTaxYear.useMutation({ onSuccess: (result) => { toast.success(result.message); p9.refetch(); }, onError: (error) => toast.error(error.message) });
  const refresh = () => { paye.refetch(); nssf.refetch(); shif.refetch(); housing.refetch(); ytd.refetch(); p9.refetch(); };
  const exportKra = async () => {
    const result = await kraExport.refetch();
    if (!result.data) { toast.error("No KRA filing data is available for this period"); return; }
    const blob = new Blob([atob(result.data)], { type: "text/csv" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `KRA_Filing_${from}_to_${to}.csv`; link.click(); URL.revokeObjectURL(link.href); toast.success("KRA filing exported");
  };
  const p9Rows = p9.data?.p9Forms || [];
  const total = (rows: any[], key: string) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
  const taxCards = [{ label: "PAYE", value: total(paye.data || [], "totalPayee"), tone: "border-l-blue-500" }, { label: "NSSF", value: total(nssf.data || [], "totalNSSF"), tone: "border-l-emerald-500" }, { label: "SHIF", value: total(shif.data || [], "totalSHIF"), tone: "border-l-violet-500" }, { label: "Housing Levy", value: total(housing.data || [], "totalHousing"), tone: "border-l-orange-500" }];
  const taxRowsByMonth = new Map<string, { month: string; paye: number; nssf: number; shif: number; housing: number }>();
  const addTaxRows = (rows: any[], key: "paye" | "nssf" | "shif" | "housing", amountKey: string) => {
    rows.forEach((row) => {
      const month = String(row.month);
      const data = taxRowsByMonth.get(month) || { month, paye: 0, nssf: 0, shif: 0, housing: 0 };
      data[key] = Number(row[amountKey] || 0) / 100;
      taxRowsByMonth.set(month, data);
    });
  };
  addTaxRows(paye.data || [], "paye", "totalPayee");
  addTaxRows(nssf.data || [], "nssf", "totalNSSF");
  addTaxRows(shif.data || [], "shif", "totalSHIF");
  addTaxRows(housing.data || [], "housing", "totalHousing");
  const taxChartData = Array.from(taxRowsByMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
  const table = (rows: any[], amountKey: string) => <Table><TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.month}><TableCell>{format(new Date(`${row.month}-01`), "MMM yyyy")}</TableCell><TableCell className="text-right">{money(Number(row[amountKey] || 0), code)}</TableCell></TableRow>)}</TableBody></Table>;
  return <ModuleLayout title="Tax Compliance & P9" description="PAYE, statutory deductions, KRA filing and annual employee certificates" icon={<BarChart3 className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Reports", href: "/reports" }, { label: "Tax Compliance" }]} actions={<div className="flex gap-2"><Button variant="outline" onClick={refresh}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button><Button onClick={exportKra}><Download className="mr-2 h-4 w-4" />KRA export</Button></div>}>
    <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><ReportNavigation active="/payroll/tax-compliance" /><div className="min-w-0 space-y-5">
      <Card className="kiini-report-toolbar"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" />Compliance controls</CardTitle><CardDescription>Use the same reporting period for monthly statutory returns and select a tax year for P9 certificates.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">From</label><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">To</label><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">P9 tax year</label><Select value={taxYear} onValueChange={setTaxYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[0, 1, 2, 3].map((offset) => <SelectItem key={offset} value={String(currentYear - offset)}>{currentYear - offset}</SelectItem>)}</SelectContent></Select></div><div><label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Employee</label><Select value={employeeId} onValueChange={setEmployeeId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All employees</SelectItem>{(employees.data as any[] || []).map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{taxCards.map((card) => <StatsCard key={card.label} label={card.label} value={money(card.value, code)} description="Selected period" icon={<ShieldCheck className="h-5 w-5" />} color={card.tone} />)}</div>
      <ReportAnalyticsPanel title="Monthly statutory contributions" description={`${from} to ${to}`} categoryKey="month" data={taxChartData} series={[{ dataKey: "paye", label: "PAYE", color: "#0f766e" }, { dataKey: "nssf", label: "NSSF", color: "#2563eb" }, { dataKey: "shif", label: "SHIF", color: "#e8790c" }, { dataKey: "housing", label: "Housing levy", color: "#15803d" }]} formatValue={(value) => money(value * 100, code)} />
      <Tabs defaultValue="statutory"><TabsList><TabsTrigger value="statutory">Statutory returns</TabsTrigger><TabsTrigger value="p9">P9 certificates</TabsTrigger><TabsTrigger value="summary">YTD summary</TabsTrigger></TabsList><TabsContent value="statutory" className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>PAYE withholding</CardTitle></CardHeader><CardContent>{table(paye.data || [], "totalPayee")}</CardContent></Card><Card><CardHeader><CardTitle>NSSF contributions</CardTitle></CardHeader><CardContent>{table(nssf.data || [], "totalNSSF")}</CardContent></Card><Card><CardHeader><CardTitle>SHIF contributions</CardTitle></CardHeader><CardContent>{table(shif.data || [], "totalSHIF")}</CardContent></Card><Card><CardHeader><CardTitle>Housing levy</CardTitle></CardHeader><CardContent>{table(housing.data || [], "totalHousing")}</CardContent></Card></TabsContent><TabsContent value="p9"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>P9 certificates for {taxYear}</CardTitle><CardDescription>{p9.data?.total || 0} certificates available for review or download.</CardDescription></div><Button onClick={() => generateP9.mutate({ taxYear: Number(taxYear) })} disabled={generateP9.isPending}><FileCheck2 className="mr-2 h-4 w-4" />{generateP9.isPending ? "Generating..." : "Generate P9 forms"}</Button></CardHeader><CardContent><div className="mb-4 max-w-xs"><Select value={p9Status} onValueChange={setP9Status}><SelectTrigger><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent>{["all", "draft", "generated", "sent", "received"].map((status) => <SelectItem key={status} value={status}>{status === "all" ? "All statuses" : status}</SelectItem>)}</SelectContent></Select></div><Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Employee no.</TableHead><TableHead className="text-right">Gross income</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{p9Rows.map((row: any) => <TableRow key={row.id}><TableCell className="font-medium">{row.firstName} {row.lastName}</TableCell><TableCell>{row.employeeNumber || "-"}</TableCell><TableCell className="text-right">{money(row.grossIncome * 100, code)}</TableCell><TableCell className="text-right">{money(row.paye * 100, code)}</TableCell><TableCell className="capitalize">{row.status}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent><TabsContent value="summary"><Card><CardHeader><CardTitle>Year-to-date statutory summary</CardTitle><CardDescription>Payroll totals available from the compliance service.</CardDescription></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Gross salary", (ytd.data as any)?.grossSalary], ["PAYE", (ytd.data as any)?.payeeTax], ["NSSF", (ytd.data as any)?.nssfContribution], ["SHIF", (ytd.data as any)?.shifContribution], ["Housing levy", (ytd.data as any)?.housingLevy]].map(([label, value]) => <div key={label as string} className="rounded-lg border bg-muted/30 p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold">{money(Number(value || 0), code)}</p></div>)}</div></CardContent></Card></TabsContent></Tabs>
    </div></div>
  </ModuleLayout>;
}
