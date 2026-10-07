import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar, Download, Filter, RotateCcw, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getPaymentMethodOptions } from "@/const/paymentMethods";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { exportCsvWithCompanyHeader } from "@/utils/companyExport";

/**
 * PaymentReports component
 * 
 * Displays payment reports with filters and export options
 * Features:
 * - Date range filtering
 * - Payment method filtering
 * - Client filtering
 * - Summary statistics
 * - Visual charts by method
 * - CSV export functionality
 */
export default function PaymentReports() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const invalidDateRange = !startDate || !endDate || startDate > endDate;

  const { data: reportData, isLoading, isError, error, refetch } = trpc.invoices.payments.report.useQuery({
    startDate,
    endDate,
    paymentMethod: paymentMethod && paymentMethod !== "all" ? paymentMethod as any : undefined,
    clientId: clientId || undefined,
  }, { enabled: !invalidDateRange });

  const { data: clientsData, error: clientsError } = trpc.clients.list.useQuery({ limit: 500, offset: 0 });
  const { data: company } = trpc.settings.getCompanyInfo.useQuery();

  const handleResetFilters = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    setStartDate(date.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod("");
    setClientId("");
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.payments || reportData.payments.length === 0) {
      toast.warning("No payments to export");
      return;
    }

    const summary = reportData.summary;
    const exportRows = reportData.payments.map((p: any) => ({
      "Payment Date": new Date(p.paymentDate).toLocaleDateString(), "Invoice Number": p.invoiceNumber || "N/A",
      "Amount (KES)": (p.paymentAmount / 100).toFixed(2), "Payment Method": p.paymentMethod,
      Reference: p.reference || "", "Receipt ID": p.receiptId || "",
    }));
    exportRows.push({ "Payment Date": "SUMMARY", "Invoice Number": "Total Payments", "Amount (KES)": String(summary.totalPayments), "Payment Method": "", Reference: "", "Receipt ID": "" });
    exportRows.push({ "Payment Date": "SUMMARY", "Invoice Number": "Total Amount (KES)", "Amount (KES)": (summary.totalAmount / 100).toFixed(2), "Payment Method": "", Reference: "", "Receipt ID": "" });
    (summary.byMethod || []).forEach((item: any) => exportRows.push({ "Payment Date": "By Payment Method", "Invoice Number": item.method, "Amount (KES)": (item.amount / 100).toFixed(2), "Payment Method": `${item.count} payment(s)`, Reference: "", "Receipt ID": "" }));

    exportCsvWithCompanyHeader(`payment-report-${new Date().toISOString().split('T')[0]}`, exportRows, {
      name: (company as any)?.companyName || (company as any)?.name, email: (company as any)?.companyEmail || (company as any)?.email,
      phone: (company as any)?.companyPhone || (company as any)?.phone, address: (company as any)?.companyAddress || (company as any)?.address,
      website: (company as any)?.website, tagline: (company as any)?.tagline,
    });
  };

  const summary = reportData?.summary || {};
  const payments = reportData?.payments || [];

  // Prepare chart data for payment methods
  const chartData = summary.byMethod
    ? summary.byMethod.map((item: any) => ({
      name: item.method,
      amount: item.amount / 100,
      count: item.count,
      label: `${item.method}: ${item.count} payment(s)`,
    }))
    : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                From Date
              </label>
              <div className="flex gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-3" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                To Date
              </label>
              <div className="flex gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-3" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {getPaymentMethodOptions().map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Client
              </label>
              <Select value={clientId || "all"} onValueChange={(v) => setClientId(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clientsData &&
                    clientsData.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name || "N/A"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => handleExportCSV()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(isError || clientsError || invalidDateRange) && (
        <Card role="alert" className="border-destructive">
          <CardContent className="pt-6 text-sm text-destructive">
            {invalidDateRange
              ? "Choose a valid date range where the start date is on or before the end date."
              : `Unable to load payment report data: ${isError ? error.message : clientsError?.message}`}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {summary.totalPayments || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.totalAmount
                  ? `KES ${(summary.totalAmount / 100).toLocaleString('en-KE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : "KES 0.00"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                total received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Average Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.averagePayment
                  ? `KES ${(summary.averagePayment / 100).toLocaleString('en-KE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : "KES 0.00"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                per transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {new Date(startDate).toLocaleDateString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                to {new Date(endDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!isLoading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Methods - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payments by Method (Count)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Number of Payments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payments by Method (Amount)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry: any) => (
                      <Cell key={entry.name} fill={COLORS[chartData.indexOf(entry) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `KES ${(value / 100).toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods Detail */}
      {!isLoading && summary.byMethod && Array.isArray(summary.byMethod) && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.byMethod.map((method: any) => (
                <div
                  key={method.method}
                  className="p-4 border rounded-lg dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{method.method}</Badge>
                    <span className="text-sm font-medium">{method.count} transaction(s)</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    KES {(method.amount / 100).toLocaleString('en-KE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Avg: KES {((method.amount / method.count) / 100).toLocaleString('en-KE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${payments.length} payment(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.invoiceNumber || "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">
                      KES {(payment.paymentAmount / 100).toLocaleString('en-KE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {payment.reference || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {payment.receiptId ? (
                        <Badge variant="outline">{payment.receiptId.substring(0, 8)}...</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No payments found for the selected date range and filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
