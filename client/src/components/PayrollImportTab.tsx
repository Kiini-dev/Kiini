import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { AlertCircle, FileUp, CheckCircle, XCircle, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportError {
  row: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportError[];
}

const PAYROLL_FIELDS = [
  "employeeId",
  "payPeriodStart",
  "payPeriodEnd",
  "basicSalary",
  "allowances",
  "deductions",
  "tax",
  "netSalary",
  "status",
  "paymentDate",
  "paymentMethod",
  "notes",
];

export default function PayrollImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const importPayroll = trpc.importExport.importPayroll.useMutation({
    onSuccess: (result) => {
      setImportResult({
        imported: result.imported || 0,
        skipped: result.skipped || 0,
        errors: result.errors || [],
      });
      toast.success(`Import completed: ${result.imported} records imported`);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        employeeId: "EMP001",
        payPeriodStart: "2024-01-01",
        payPeriodEnd: "2024-01-31",
        basicSalary: "50000",
        allowances: "5000",
        deductions: "2000",
        tax: "8000",
        netSalary: "45000",
        status: "draft",
        paymentDate: "2024-02-05",
        paymentMethod: "bank_transfer",
        notes: "January payroll",
      },
      {
        employeeId: "EMP002",
        payPeriodStart: "2024-01-01",
        payPeriodEnd: "2024-01-31",
        basicSalary: "45000",
        allowances: "4000",
        deductions: "1800",
        tax: "7200",
        netSalary: "40000",
        status: "draft",
        paymentDate: "2024-02-05",
        paymentMethod: "bank_transfer",
        notes: "January payroll",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 }, // employeeId
      { wch: 15 }, // payPeriodStart
      { wch: 15 }, // payPeriodEnd
      { wch: 12 }, // basicSalary
      { wch: 12 }, // allowances
      { wch: 12 }, // deductions
      { wch: 10 }, // tax
      { wch: 12 }, // netSalary
      { wch: 10 }, // status
      { wch: 15 }, // paymentDate
      { wch: 15 }, // paymentMethod
      { wch: 20 }, // notes
    ];

    XLSX.writeFile(workbook, `payroll-import-template-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Template downloaded successfully");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setValidationErrors([]);
      setImportResult(null);

      // Preview file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          setPreviewRows(rows.slice(0, 5));
        } catch (error) {
          toast.error("Failed to read file");
          setFile(null);
        }
      };
      reader.readAsBinaryString(f);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(worksheet);

          // Validate rows
          const errors: ImportError[] = [];
          rows.forEach((row: any, index: number) => {
            if (!row.employeeId) {
              errors.push({
                row: index + 2,
                field: "employeeId",
                message: "Employee ID is required",
                severity: "error",
              });
            }
            if (!row.payPeriodStart) {
              errors.push({
                row: index + 2,
                field: "payPeriodStart",
                message: "Pay Period Start is required",
                severity: "error",
              });
            }
            if (!row.basicSalary) {
              errors.push({
                row: index + 2,
                field: "basicSalary",
                message: "Basic Salary is required",
                severity: "error",
              });
            }
          });

          setValidationErrors(errors);

          if (errors.length > 0) {
            toast.error(`Validation failed: ${errors.length} error(s) found`);
            setIsProcessing(false);
            return;
          }

          // Import data
          await importPayroll.mutateAsync({
            data: rows,
            skipDuplicates,
          });
        } catch (error) {
          toast.error(`Import error: ${error instanceof Error ? error.message : "Unknown error"}`);
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast.error("Failed to process file");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Template Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            CSV Template
          </CardTitle>
          <CardDescription>Download a sample payroll import template to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Template includes columns for:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Employee ID</li>
              <li>Pay Period Start & End</li>
              <li>Basic Salary, Allowances, Deductions</li>
              <li>Tax, Net Salary, Payment Details</li>
              <li>Status and Notes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Import Payroll Data
          </CardTitle>
          <CardDescription>Upload a CSV or Excel file with payroll records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select File</label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {file && (
              <p className="text-sm text-green-600 mt-2">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                File selected: {file.name}
              </p>
            )}
          </div>

          {previewRows.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Preview (First 5 rows)</label>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewRows[0] || {}).map((key) => (
                        <TableHead key={key} className="min-w-[100px]">
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow key={`row-${idx}`}>
                        {Object.entries(row).map(([colKey, value]) => (
                          <TableCell key={`${idx}-${colKey}`}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  {validationErrors.length} validation error(s) found:
                </p>
                <ul className="space-y-1 text-sm">
                  {validationErrors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>
                      Row {error.row}: {error.field} - {error.message}
                    </li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li>... and {validationErrors.length - 10} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 items-center">
            <Button
              onClick={handleImport}
              disabled={!file || isProcessing || validationErrors.length !== previewRows.length}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileUp className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Import Data"}
            </Button>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                disabled={isProcessing}
              />
              <span className="text-sm">Skip duplicate records</span>
            </label>
          </div>

          {importResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="font-medium text-green-900">Import Completed Successfully</p>
                <div className="mt-2 text-sm text-green-800 space-y-1">
                  <p>✓ Imported: {importResult.imported} records</p>
                  <p>⊘ Skipped: {importResult.skipped} records</p>
                  {importResult.errors.length > 0 && (
                    <p>✗ Errors: {importResult.errors.length} records</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
