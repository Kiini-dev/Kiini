import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Eye,
  Trash2,
  FileDown,
  Loader2,
  FileText,
  Zap,
  Calendar,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { StatsCard } from "@/components/ui/stats-card";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "draft" | "processed" | "paid";
  paymentDate: string;
  month: string;
}

export default function Payroll() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [isExporting, setIsExporting] = useState(false);
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState<"" | "draft" | "processed" | "paid">("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Manual trigger state
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
  const [isDispatchingPayslips, setIsDispatchingPayslips] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch real data from backend
  const { data: data = [], isLoading, isError, error } = trpc.payroll.list.useQuery({});
  const deleteMut = trpc.payroll.delete.useMutation();
  const updateMut = trpc.payroll.update.useMutation();
  const downloadP9 = trpc.payroll.downloadP9.useMutation();
  const exportMut = trpc.payroll.bulkExport.useMutation();
  const bulkUpdateStatusMut = trpc.payroll.bulkUpdateStatus.useMutation();
  const bulkDeleteMut = trpc.payroll.bulkDelete.useMutation();
  const listQ = trpc.payroll.list;
  const utils = trpc.useUtils();

  // Manual payroll automation triggers
  const processMonthlyMut = trpc.payroll.processMonthly.useMutation();
  const dispatchPayslipsMut = trpc.payroll.dispatchPayslips.useMutation();

  const [records, setRecords] = useState<PayrollRecord[]>([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setRecords(
        data.map((r: any) => ({
          id: r.id,
          employeeId: r.employeeId,
          employeeName: r.employeeName || '',
          department: r.department || '',
          basicSalary: r.basicSalary,
          allowances: r.allowances || 0,
          deductions: r.deductions || 0,
          netSalary: r.netSalary,
          status: r.status,
          paymentDate: r.paymentDate || '',
          month: r.month || '',
        }))
      );
    }
  }, [data]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesMonth = monthFilter === "all" || record.month?.slice(0, 7) === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "processed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-3 w-3" />;
      case "processed":
        return <Clock className="h-3 w-3" />;
      case "draft":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleMarkPaid = (id: string) => {
    updateMut.mutate(
      { id, status: "paid" },
      {
        onSuccess() {
          toast.success("Marked as paid");
          utils.payroll.list.refetch();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this payroll record?")) {
      deleteMut.mutate(id, {
        onSuccess() {
          toast.success("Deleted");
          utils.payroll.list.refetch();
        },
      });
    }
  };

  const handleDownloadP9 = (employeeId: string) => {
    downloadP9.mutate(
      { employeeId },
      {
        onSuccess() {
          toast.success("P9 downloaded");
        },
      }
    );
  };

  const handleExport = () => {
    if (selectedPayrollIds.size === 0) {
      toast.error("Select at least one record to export");
      return;
    }

    setIsExporting(true);
    exportMut.mutate(
      {
        payrollIds: Array.from(selectedPayrollIds),
        format: exportFormat,
      },
      {
        onSuccess(response) {
          // Convert base64 to blob and download
          const binaryString = atob(response.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], {
            type:
              exportFormat === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv",
          });

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `payroll-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          setSelectedPayrollIds(new Set());
          setIsExporting(false);
          toast.success(`Exported ${selectedPayrollIds.size} records`);
        },
        onError(error) {
          setIsExporting(false);
          toast.error("Export failed: " + error.message);
        },
      }
    );
  };

  const handleBulkUpdateStatus = () => {
    if (selectedPayrollIds.size === 0 || !bulkStatusUpdate) {
      toast.error("Select records and a status to update");
      return;
    }

    setIsBulkUpdating(true);
    bulkUpdateStatusMut.mutate(
      {
        payrollIds: Array.from(selectedPayrollIds),
        status: bulkStatusUpdate,
      },
      {
        onSuccess() {
          setSelectedPayrollIds(new Set());
          setBulkStatusUpdate("");
          setIsBulkUpdating(false);
          utils.payroll.list.refetch();
          toast.success(`Updated status for ${selectedPayrollIds.size} records`);
        },
        onError(error) {
          setIsBulkUpdating(false);
          toast.error("Update failed: " + error.message);
        },
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedPayrollIds.size === 0) {
      toast.error("Select records to delete");
      return;
    }

    if (
      !confirm(
        `Delete ${selectedPayrollIds.size} payroll record(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsBulkDeleting(true);
    bulkDeleteMut.mutate(
      {
        payrollIds: Array.from(selectedPayrollIds),
      },
      {
        onSuccess() {
          setSelectedPayrollIds(new Set());
          setIsBulkDeleting(false);
          utils.payroll.list.refetch();
          toast.success(`Deleted ${selectedPayrollIds.size} records`);
        },
        onError(error) {
          setIsBulkDeleting(false);
          toast.error("Delete failed: " + error.message);
        },
      }
    );
  };

  const totalGrossPay = filteredRecords.reduce((sum, r) => sum + r.basicSalary + r.allowances, 0);
  const totalDeductions = filteredRecords.reduce((sum, r) => sum + r.deductions, 0);
  const totalNetPay = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const paidCount = filteredRecords.filter((r) => r.status === "paid").length;

  const handleProcessPayroll = () => {
    setIsProcessingPayroll(true);
    processMonthlyMut.mutate(
      {
        year: selectedYear,
        month: selectedMonth,
      },
      {
        onSuccess(result) {
          setIsProcessingPayroll(false);
          utils.payroll.list.refetch();
          if (result.errors.length > 0) {
            result.errors.slice(0, 3).forEach((message) => toast.error(message));
            if (result.errors.length > 3) toast.error(`${result.errors.length - 3} additional payroll errors`);
          }
          if (result.processed > 0) {
            toast.success(`Payroll processed for ${result.processed} employees; ${result.skipped} skipped`);
          } else if (result.errors.length === 0) {
            toast.info(`No payroll records were created; ${result.skipped} employees were skipped`);
          }
        },
        onError(error) {
          setIsProcessingPayroll(false);
          toast.error("Payroll processing failed: " + error.message);
        },
      }
    );
  };

  const handleDispatchPayslips = () => {
    setIsDispatchingPayslips(true);
    dispatchPayslipsMut.mutate(
      {
        year: selectedYear,
        month: selectedMonth,
      },
      {
        onSuccess(result) {
          setIsDispatchingPayslips(false);
          utils.payroll.list.refetch();
          if (result.errors.length > 0) {
            result.errors.slice(0, 3).forEach((message) => toast.error(message));
            if (result.errors.length > 3) toast.error(`${result.errors.length - 3} additional payslip errors`);
          }
          if (result.dispatched > 0) {
            toast.success(`${result.dispatched} payslips generated and dispatched (${result.processed} payroll records newly processed)`);
          } else if (result.errors.length === 0) {
            toast.info("No payslips were dispatched");
          }
        },
        onError(error) {
          setIsDispatchingPayslips(false);
          toast.error("Payslip dispatch failed: " + error.message);
        },
      }
    );
  };

  return (
    <ModuleLayout
      title="Payroll Management"
      description="Process and manage employee salaries"
      icon={<DollarSign className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "HR", href: "/hr" },
        { label: "Payroll" },
      ]}
      actions={
        <Button
          onClick={() => setLocation("/payroll/tax-compliance")}
          className="gap-2"
          variant="outline"
        >
          <FileText className="h-4 w-4" />
          Tax Compliance Reports
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            label="Gross Pay"
            value={<>Ksh {(totalGrossPay / 100).toLocaleString()}</>}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-l-blue-500"
          />

          <StatsCard
            label="Deductions"
            value={<>Ksh {(totalDeductions / 100).toLocaleString()}</>}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-l-red-500"
          />

          <StatsCard
            label="Net Pay"
            value={<>Ksh {(totalNetPay / 100).toLocaleString()}</>}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-l-green-500"
          />

          <StatsCard label="Paid" value={paidCount} icon={<CheckCircle2 className="h-5 w-5" />} color="border-l-purple-500" />
        </div>

        {/* Automated Payroll Automation Controls */}
        <Card className="border-green-200 dark:border-green-900 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Payroll Automation
            </CardTitle>
            <CardDescription>
              Payroll processing on the 21st of each month at 08:00 AM EAT • Payslips are generated and dispatched on the last day of the month at 12:00 AM EAT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Process Payroll Manual Trigger */}
              <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Process Monthly Payroll</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manually trigger payroll processing for a specific month. All active employees will be included and budget costs will be automatically deducted.
                </p>
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString("en-US", { month: "short" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleProcessPayroll}
                    disabled={isProcessingPayroll}
                    size="sm"
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingPayroll ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        Process Now
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dispatch Payslips Manual Trigger */}
              <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm">Dispatch Payslips</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete any missing payroll processing for this month, then generate payslips and email them to employees.
                </p>
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString("en-US", { month: "short" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleDispatchPayslips}
                    disabled={isDispatchingPayslips}
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isDispatchingPayslips ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        Send Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <strong>Note:</strong> Payroll is processed on the 21st of each month at 08:00 AM EAT. On the last day of the month at 12:00 AM EAT, the system completes any missing payroll records before generating and dispatching payslips. Use the buttons above to run either step manually for a selected month.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        {filteredRecords.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPayrollIds.size === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPayrollIds(new Set(filteredRecords.map((r) => r.id)));
                      } else {
                        setSelectedPayrollIds(new Set());
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    {selectedPayrollIds.size > 0
                      ? `${selectedPayrollIds.size} selected`
                      : "Select records to manage"}
                  </span>
                </div>
              </div>

              {selectedPayrollIds.size > 0 && (
                <div className="space-y-3">
                  {/* Status Update */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={bulkStatusUpdate}
                      onValueChange={(value) =>
                        setBulkStatusUpdate(value as "" | "draft" | "processed" | "paid")
                      }
                    >
                      <SelectTrigger className="w-40 bg-white dark:bg-slate-950">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Mark as Draft</SelectItem>
                        <SelectItem value="processed">Mark as Processed</SelectItem>
                        <SelectItem value="paid">Mark as Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleBulkUpdateStatus}
                      disabled={isBulkUpdating || !bulkStatusUpdate}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {isBulkUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </Button>
                  </div>

                  {/* Export and Delete Actions */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={exportFormat}
                      onValueChange={(value) => setExportFormat(value as "xlsx" | "csv")}
                    >
                      <SelectTrigger className="w-32 bg-white dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="gap-2"
                      size="sm"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          Export
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      {isBulkDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {[...new Set(records.map((record) => record.month?.slice(0, 7)).filter(Boolean))]
                    .sort((left, right) => right.localeCompare(left))
                    .map((month) => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Records */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading payroll records...
              </CardContent>
            </Card>
          ) : isError ? (
            <Card role="alert" className="border-destructive">
              <CardContent className="py-8 text-center text-destructive">
                Failed to load payroll records: {error.message}
              </CardContent>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No payroll records found.
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start gap-4">
                    <Checkbox
                      checked={selectedPayrollIds.has(record.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedPayrollIds);
                        if (checked) {
                          newSet.add(record.id);
                        } else {
                          newSet.delete(record.id);
                        }
                        setSelectedPayrollIds(newSet);
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-2">
                        {record.employeeName}
                        <span className="text-sm text-muted-foreground ml-2">({record.employeeId})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Department:</span>
                          <div className="font-medium">{record.department}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Month:</span>
                          <div className="font-medium">{record.month}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Basic Salary:</span>
                          <div className="font-medium">Ksh {(record.basicSalary / 100).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Allowances:</span>
                          <div className="font-medium text-green-600">+Ksh {(record.allowances / 100).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deductions:</span>
                          <div className="font-medium text-red-600">-Ksh {(record.deductions / 100).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Salary:</span>
                          <div className="font-bold text-lg">Ksh {(record.netSalary / 100).toLocaleString()}</div>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(record.status)} className="gap-1">
                        {getStatusIcon(record.status)}
                        {record.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => setLocation(`/payroll/${record.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {record.status !== "paid" && (
                        <Button size="sm" onClick={() => handleMarkPaid(record.id)}>
                          Mark Paid
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDownloadP9(record.employeeId)}>
                        <Download className="h-4 w-4 mr-2" />
                        P9
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
