import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";
import { ReportNavigation } from "@/components/ReportNavigation";

export default function FinancialReportsPage() {
  const [location, setLocation] = useLocation();
  const { allowed, isLoading } = useRequireFeature("reports:financial");
  
  const [from, setFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));

  const plQuery = trpc.financialReports.profitLoss.useQuery(
    { startDate: from, endDate: to },
    { enabled: !!from && !!to }
  );

  const bsQuery = trpc.financialReports.balanceSheet.useQuery({});
  const formatMoney = (value: number) => `KES ${(Number(value || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
  const financialChartData = [
    { metric: "Revenue", amount: Number(plQuery.data?.revenue || 0) },
    { metric: "Other income", amount: Number(plQuery.data?.otherIncome || 0) },
    { metric: "Total income", amount: Number(plQuery.data?.totalIncome ?? plQuery.data?.revenue ?? 0) },
    { metric: "Expenses", amount: Number(plQuery.data?.expenses || 0) },
    { metric: "Net profit", amount: Number(plQuery.data?.netProfit || 0) },
  ];
  const financialMetrics = [
    { label: "Revenue", value: formatMoney(plQuery.data?.revenue || 0), description: "Selected period", color: "border-l-teal-600" },
    { label: "Other income", value: formatMoney(plQuery.data?.otherIncome || 0), description: "Donations and non-sales income", color: "border-l-emerald-600" },
    { label: "Total income", value: formatMoney(plQuery.data?.totalIncome ?? plQuery.data?.revenue ?? 0), description: "Revenue plus other income", color: "border-l-cyan-600" },
    { label: "Expenses", value: formatMoney(plQuery.data?.expenses || 0), description: "Operating costs", color: "border-l-orange-500" },
    { label: "Net profit", value: formatMoney(plQuery.data?.netProfit || 0), description: "After expenses", color: "border-l-blue-600" },
  ];
  
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleRun = () => {
    if (!from || !to) {
      toast.error("Please select both dates");
      return;
    }
    plQuery.refetch();
    bsQuery.refetch();
  };

  return (
    <ModuleLayout
      title="Financial Reports"
      icon={<BarChart3 className="h-5 w-5" />}
      description="Profit & Loss, non-sales income and balance sheet summaries"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finance", href: "/accounting" },
        { label: "Reports" },
      ]}
      actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setLocation(location.replace(/\/finance\/reports$/, "/income-ledger"))}>Income ledger</Button><Button onClick={handleRun}>Run</Button></div>}
    >
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
       <ReportNavigation active="/finance/reports" />
       <div className="min-w-0 space-y-6">

        <ReportAnalyticsPanel title="Financial performance" description={`${from} to ${to}`} categoryKey="metric" data={financialChartData} series={[{ dataKey: "amount", label: "Amount", color: "#0f766e" }]} metrics={financialMetrics} />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {plQuery.data && (
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss ({from} - {to})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>Total Revenue: Ksh {(plQuery.data.revenue / 100).toLocaleString('en-KE')}</div>
                  <div>Other Income: Ksh {(Number(plQuery.data.otherIncome || 0) / 100).toLocaleString('en-KE')}</div>
                  <div>Total Income: Ksh {(Number(plQuery.data.totalIncome ?? plQuery.data.revenue ?? 0) / 100).toLocaleString('en-KE')}</div>
                  <div>Total Expenses: Ksh {(plQuery.data.expenses / 100).toLocaleString('en-KE')}</div>
                  <div className={`font-semibold ${plQuery.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net Profit: Ksh {(plQuery.data.netProfit / 100).toLocaleString('en-KE')}
                  </div>
                  <div>Net Margin: {(plQuery.data.netMarginPercentage || 0).toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {plQuery.data && (
          <>
            <Card>
              <CardHeader><CardTitle>Invoice and payment detail</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="overflow-x-auto">
                  <h3 className="mb-2 text-sm font-semibold">Invoices</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead>Issue date</TableHead><TableHead>Invoice</TableHead><TableHead>Client ID</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
                    <TableBody>{(plQuery.data.invoiceDetails || []).map((row) => <TableRow key={row.id}><TableCell>{new Date(row.issueDate).toLocaleDateString()}</TableCell><TableCell>{row.invoiceNumber}</TableCell><TableCell className="font-mono">{row.clientId}</TableCell><TableCell className="capitalize">{row.status}</TableCell><TableCell className="text-right">{formatMoney(row.total)}</TableCell><TableCell className="text-right">{formatMoney(row.paidAmount || 0)}</TableCell><TableCell className="text-right">{formatMoney(row.total - (row.paidAmount || 0))}</TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
                <div className="overflow-x-auto">
                  <h3 className="mb-2 text-sm font-semibold">Completed payments</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Payment reference</TableHead><TableHead>Invoice ID</TableHead><TableHead>Client ID</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>{(plQuery.data.revenueDetails || []).map((row) => <TableRow key={row.id}><TableCell>{new Date(row.paymentDate).toLocaleDateString()}</TableCell><TableCell>{row.referenceNumber || row.id}</TableCell><TableCell className="font-mono">{row.invoiceId}</TableCell><TableCell className="font-mono">{row.clientId}</TableCell><TableCell className="capitalize">{row.paymentMethod?.replaceAll("_", " ")}</TableCell><TableCell className="text-right">{formatMoney(row.amount)}</TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Expense transaction detail</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Category</TableHead><TableHead>Vendor</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>{(plQuery.data.expenseDetails || []).map((row) => <TableRow key={row.id}><TableCell>{new Date(row.expenseDate).toLocaleDateString()}</TableCell><TableCell>{row.expenseNumber || row.id}</TableCell><TableCell>{row.category || "Uncategorised"}</TableCell><TableCell>{row.vendor || "—"}</TableCell><TableCell>{row.description || "—"}</TableCell><TableCell className="capitalize">{row.status}</TableCell><TableCell className="text-right">{formatMoney(row.amount)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {bsQuery.data && (
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet by Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bsQuery.data?.accounts || []).map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell className="capitalize">{account.type}</TableCell>
                      <TableCell>{account.isActive ? "Active" : "Inactive"}</TableCell>
                      <TableCell className="text-right">Ksh {(Number(account.balance) / 100).toLocaleString('en-KE')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </ModuleLayout>
  );
}
