import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Building2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import { ModuleLayout } from "@/components/ModuleLayout";
import { parseCSV } from "@/utils/csvGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AllocationRow = { costCenterId: string; allocationPercentage: number };
const centerTypes = ["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"] as const;

function formatCents(value: number) {
  return new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
}

export default function PayrollCostAllocations() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const hasOrganization = Boolean(user?.organizationId);
  const isGlobalWorkspace = Boolean(user && !hasOrganization);
  const [employeeId, setEmployeeId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [allocationImportRows, setAllocationImportRows] = useState<Array<{
    employeeIdentifier: string;
    costCenterCode: string;
    budgetCode: string;
    allocationPercentage: number;
  }>>([]);
  const [importFileName, setImportFileName] = useState("");
  const [budgetCode, setBudgetCode] = useState("");
  const [annualBudget, setAnnualBudget] = useState("");
  const [budgetYear, setBudgetYear] = useState(String(new Date().getFullYear()));
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<(typeof centerTypes)[number]>("G&A");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [budgetDepartmentId, setBudgetDepartmentId] = useState("");
  const [newExpenseAccountId, setNewExpenseAccountId] = useState("");
  const [newPayrollLiabilityAccountId, setNewPayrollLiabilityAccountId] = useState("");
  const [centerAccountMappings, setCenterAccountMappings] = useState<Record<string, {
    expenseAccountId: string;
    payrollLiabilityAccountId: string;
  }>>({});
  const [exportStartDate, setExportStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX" | "PDF">("CSV");
  const employeesQuery = trpc.payrollAllocations.listEmployees.useQuery(undefined, {
    enabled: isGlobalWorkspace || hasOrganization,
  });
  const departmentsQuery = trpc.departments.list.useQuery({}, { enabled: isGlobalWorkspace || hasOrganization });
  const accountsQuery = trpc.chartOfAccounts.list.useQuery({ limit: 500 }, { enabled: isGlobalWorkspace || hasOrganization });
  const centersQuery = trpc.payrollAllocations.listCostCenters.useQuery(
    { includeInactive: true },
    { enabled: !authLoading && Boolean(user) },
  );
  const historyQuery = trpc.payrollAllocations.getEmployeeAllocations.useQuery(
    { employeeId },
    { enabled: (isGlobalWorkspace || hasOrganization) && Boolean(employeeId) },
  );
  const ledgerQuery = trpc.payrollAllocations.getLedger.useQuery({ limit: 100 }, { enabled: isGlobalWorkspace || hasOrganization });
  const summaryQuery = trpc.payrollAllocations.getCostCenterSummary.useQuery({}, { enabled: isGlobalWorkspace || hasOrganization });
  const utils = trpc.useUtils();
  const saveAllocations = trpc.payrollAllocations.setEmployeeAllocations.useMutation();
  const createCenter = trpc.payrollAllocations.createCostCenter.useMutation();
  const updateCenter = trpc.payrollAllocations.updateCostCenter.useMutation();
  const setPayrollBudget = trpc.payrollAllocations.setDepartmentPayrollBudget.useMutation();
  const importAllocations = trpc.payrollAllocations.importEmployeeAllocations.useMutation();
  const exportLedger = trpc.payrollAllocations.exportLedger.useMutation();
  const employees = employeesQuery.data ?? [];
  const centers = centersQuery.data ?? [];
  const departments = (departmentsQuery.data ?? []).filter((department: any) =>
    department.organizationId === (user?.organizationId ?? null)
  );
  const accounts = accountsQuery.data ?? [];
  const expenseAccounts = accounts.filter((account: any) =>
    ["expense", "operating expense", "cost of goods sold", "other expense"].includes(account.accountType)
  );
  const liabilityAccounts = accounts.filter((account: any) => account.accountType === "liability");
  const ledger = ledgerQuery.data ?? [];
  const currentSnapshotDate = historyQuery.data?.[0]?.effectiveDate;
  const totalPercentage = allocations.reduce((sum, row) => sum + (Number(row.allocationPercentage) || 0), 0);
  const activeCenters = useMemo(() => centers.filter((center) => center.isActive === 1), [centers]);

  useEffect(() => {
    if (!historyQuery.data) return;
    const latestDate = historyQuery.data[0]?.effectiveDate;
    const latest = latestDate ? historyQuery.data.filter((row) => row.effectiveDate === latestDate) : [];
    setAllocations(latest.map((row) => ({
      costCenterId: row.costCenterId,
      allocationPercentage: row.allocationPercentage,
    })));
  }, [historyQuery.data]);

  const updateAllocation = (index: number, patch: Partial<AllocationRow>) => {
    setAllocations((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };

  const handleSave = () => {
    if (!employeeId) {
      toast.error("Select an employee first.");
      return;
    }
    if (Math.round(totalPercentage * 100) !== 10_000) {
      toast.error("Allocations must total exactly 100%.");
      return;
    }
    saveAllocations.mutate({ employeeId, effectiveDate, allocations }, {
      onSuccess: () => {
        toast.success("Effective-dated payroll allocation saved.");
        historyQuery.refetch();
        utils.payrollAllocations.getLedger.invalidate();
        utils.payrollAllocations.getCostCenterSummary.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleCreateCenter = () => {
    if (!newCode.trim() || !newName.trim()) {
      toast.error("Enter a cost-center code and name.");
      return;
    }
    if (!newDepartmentId || !newExpenseAccountId || !newPayrollLiabilityAccountId) {
      toast.error("Select a department and map the cost center to payroll expense and liability accounts.");
      return;
    }
    createCenter.mutate({
      code: newCode.trim(),
      name: newName.trim(),
      type: newType,
      departmentId: newDepartmentId || undefined,
      expenseAccountId: newExpenseAccountId || undefined,
      payrollLiabilityAccountId: newPayrollLiabilityAccountId || undefined,
    }, {
      onSuccess: () => {
        setNewCode("");
        setNewName("");
        setNewDepartmentId("");
        setNewExpenseAccountId("");
        setNewPayrollLiabilityAccountId("");
        toast.success("Cost center created.");
        centersQuery.refetch();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const saveCenterAccounts = (center: (typeof centers)[number]) => {
    const mapping = centerAccountMappings[center.id] ?? {
      expenseAccountId: center.expenseAccountId ?? "",
      payrollLiabilityAccountId: center.payrollLiabilityAccountId ?? "",
    };
    if (!mapping.expenseAccountId || !mapping.payrollLiabilityAccountId) {
      toast.error("Select both a payroll expense and liability account.");
      return;
    }
    updateCenter.mutate({
      id: center.id,
      expenseAccountId: mapping.expenseAccountId,
      payrollLiabilityAccountId: mapping.payrollLiabilityAccountId,
    }, {
      onSuccess: () => {
        toast.success(`COA mapping saved for ${center.name}.`);
        centersQuery.refetch();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const accountLabel = (accountId?: string | null) => {
    const account = accounts.find((account: any) => account.id === accountId);
    return account ? `${account.accountCode} — ${account.accountName}` : "Not mapped";
  };

  const handleExport = () => {
    exportLedger.mutate({ startDate: exportStartDate, endDate: exportEndDate, format: exportFormat }, {
      onSuccess: (result) => {
        const binary = atob(result.data);
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: result.mimeType }));
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${result.rows} ledger rows · SHA-256 ${result.sha256}`);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleBudgetSave = () => {
    const parsedYear = Number(budgetYear);
    const parsedBudget = Number(annualBudget);
    if (!budgetDepartmentId || !budgetCode.trim() ||
      !Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2200 ||
      !Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      toast.error("Select a department and enter a budget code, valid fiscal year, and positive annual budget.");
      return;
    }
    setPayrollBudget.mutate({
      departmentId: budgetDepartmentId,
      year: parsedYear,
      budgetCode: budgetCode.trim(),
      annualBudget: parsedBudget,
    }, {
      onSuccess: () => {
        toast.success("Annual payroll budget and code saved.");
        setBudgetCode("");
        setAnnualBudget("");
        utils.payrollAllocations.getBudgetPreview.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleAllocationCsv = async (file?: File) => {
    if (!file) return;
    try {
      const rows = parseCSV((await file.text()).replace(/^\uFEFF/, "")).map((row, index) => {
        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([header, value]) => [header.trim().toLowerCase(), value])
        );
        const employeeIdentifier = String(normalizedRow.employee_id ?? normalizedRow.employee_number ?? "").trim();
        const costCenterCode = String(normalizedRow.cost_center_code ?? "").trim();
        const rowBudgetCode = String(normalizedRow.budget_code ?? "").trim();
        const allocationPercentage = Number(normalizedRow.allocation_pct);
        if (!employeeIdentifier || !costCenterCode || !rowBudgetCode ||
          !Number.isFinite(allocationPercentage) || allocationPercentage <= 0 || allocationPercentage > 100) {
          throw new Error(`Invalid CSV data on row ${index + 2}. Check employee_id, cost_center_code, budget_code, and allocation_pct.`);
        }
        return { employeeIdentifier, costCenterCode, budgetCode: rowBudgetCode, allocationPercentage };
      });
      if (!rows.length) throw new Error("The CSV has no allocation data rows.");
      setAllocationImportRows(rows);
      setImportFileName(file.name);
    } catch (error) {
      setAllocationImportRows([]);
      setImportFileName("");
      toast.error(error instanceof Error ? error.message : "Could not read payroll allocation CSV.");
    }
  };

  const handleImportAllocations = () => {
    if (!allocationImportRows.length) {
      toast.error("Choose a valid payroll allocation CSV file first.");
      return;
    }
    importAllocations.mutate({ effectiveDate, rows: allocationImportRows }, {
      onSuccess: (result) => {
        toast.success(`Imported ${result.importedAllocations} allocation rows for ${result.importedEmployees} employees.`);
        setAllocationImportRows([]);
        setImportFileName("");
        void utils.payrollAllocations.getEmployeeAllocations.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <ModuleLayout
      title="Payroll Cost Allocations"
      description="Manage effective-dated employee splits and review fully burdened payroll costs by cost center."
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Payroll", href: "/payroll" },
        { label: "Cost Allocations", href: "/payroll/cost-allocations" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setLocation("/payroll")}>Back to payroll</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {(isGlobalWorkspace || hasOrganization) && (
          <Card>
            <CardHeader>
              <CardTitle>Employee allocation</CardTitle>
              <CardDescription>
                Each effective-date snapshot must allocate 100%. If no split is set, payroll uses the single active cost center linked to the employee's department.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeNumber || employee.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="allocation-effective-date">Effective date</label>
                <Input id="allocation-effective-date" type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                {currentSnapshotDate && <p className="mt-1 text-xs text-muted-foreground">Latest saved allocation: {currentSnapshotDate}. Saving creates a new immutable snapshot.</p>}
              </div>
              {allocations.map((allocation, index) => (
                <div className="flex items-center gap-2" key={`${allocation.costCenterId}-${index}`}>
                  <Select value={allocation.costCenterId} onValueChange={(value) => updateAllocation(index, { costCenterId: value })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Cost center" /></SelectTrigger>
                    <SelectContent>
                      {activeCenters.map((center) => <SelectItem key={center.id} value={center.id}>{center.code} — {center.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    aria-label="Allocation percentage"
                    className="w-28"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={allocation.allocationPercentage}
                    onChange={(event) => updateAllocation(index, { allocationPercentage: Number(event.target.value) })}
                  />
                  <span className="text-sm">%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove allocation"
                    onClick={() => setAllocations((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                  ><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setAllocations((rows) => [...rows, { costCenterId: "", allocationPercentage: 0 }])}>
                  <Plus className="mr-2 h-4 w-4" /> Add allocation
                </Button>
                <span className={Math.round(totalPercentage * 100) === 10_000 ? "text-sm font-medium text-green-700" : "text-sm font-medium text-destructive"}>
                  Total: {totalPercentage.toFixed(2)}%
                </span>
              </div>
              <Button className="w-full" disabled={saveAllocations.isPending || !employeeId || allocations.length === 0} onClick={handleSave}>
                {saveAllocations.isPending ? "Saving..." : "Save allocation snapshot"}
              </Button>
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Cost centers</CardTitle>
              <CardDescription>
                {isGlobalWorkspace
                  ? "Manage global cost centers, isolated from organization records."
                  : "Link each cost center to a department and map its payroll expense and liability accounts. Payroll uses the department's active annual budget."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input aria-label="Cost center code" placeholder="Code" value={newCode} onChange={(event) => setNewCode(event.target.value)} />
                <Input aria-label="Cost center name" placeholder="Name" value={newName} onChange={(event) => setNewName(event.target.value)} />
                <Select value={newType} onValueChange={(value) => setNewType(value as (typeof centerTypes)[number])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{centerTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                {(isGlobalWorkspace || hasOrganization) && (
                  <>
                    <ChartOfAccountsSelector accounts={expenseAccounts} value={newExpenseAccountId} onChange={setNewExpenseAccountId} noneLabel="Select expense account" placeholder="Payroll expense account" ariaLabel="Payroll expense account" />
                    <ChartOfAccountsSelector accounts={liabilityAccounts} value={newPayrollLiabilityAccountId} onChange={setNewPayrollLiabilityAccountId} noneLabel="Select liability account" placeholder="Payroll liability account" ariaLabel="Payroll liability account" />
                  </>
                )}
                {(isGlobalWorkspace || hasOrganization) && <Select value={newDepartmentId || "none"} onValueChange={(value) => setNewDepartmentId(value === "none" ? "" : value)}>
                  <SelectTrigger aria-label="Department for payroll budget tagging"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select department</SelectItem>
                    {departments.map((department: any) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
                  </SelectContent>
                </Select>}
              </div>
              <Button onClick={handleCreateCenter} disabled={createCenter.isPending}>
                <Plus className="mr-2 h-4 w-4" /> Create cost center
              </Button>
              <div className="divide-y rounded-md border">
                {centers.map((center) => (
                  <div className="space-y-2 px-3 py-3 text-sm" key={center.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span><strong>{center.code}</strong> — {center.name}</span>
                      <span className="text-muted-foreground">
                        {center.type} · {departments.find((department: any) => department.id === center.departmentId)?.name || (center.departmentId ? "Department linked" : "Department missing")}
                        {center.isActive !== 1 ? " · inactive" : ""}
                      </span>
                    </div>
                    {(isGlobalWorkspace || hasOrganization) && (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <ChartOfAccountsSelector
                            accounts={expenseAccounts}
                            value={centerAccountMappings[center.id]?.expenseAccountId ?? center.expenseAccountId ?? ""}
                            onChange={(value) => setCenterAccountMappings((current) => ({
                              ...current,
                              [center.id]: {
                                expenseAccountId: value,
                                payrollLiabilityAccountId: current[center.id]?.payrollLiabilityAccountId ?? center.payrollLiabilityAccountId ?? "",
                              },
                            }))}
                            noneLabel="Select expense account"
                            placeholder={accountLabel(center.expenseAccountId)}
                            ariaLabel={`Expense account for ${center.name}`}
                          />
                          <ChartOfAccountsSelector
                            accounts={liabilityAccounts}
                            value={centerAccountMappings[center.id]?.payrollLiabilityAccountId ?? center.payrollLiabilityAccountId ?? ""}
                            onChange={(value) => setCenterAccountMappings((current) => ({
                              ...current,
                              [center.id]: {
                                expenseAccountId: current[center.id]?.expenseAccountId ?? center.expenseAccountId ?? "",
                                payrollLiabilityAccountId: value,
                              },
                            }))}
                            noneLabel="Select liability account"
                            placeholder={accountLabel(center.payrollLiabilityAccountId)}
                            ariaLabel={`Payroll liability account for ${center.name}`}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" disabled={updateCenter.isPending} onClick={() => saveCenterAccounts(center)}>
                            Save COA mapping
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {centers.length === 0 && <p className="p-3 text-sm text-muted-foreground">No cost centers configured yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {(isGlobalWorkspace || hasOrganization) && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll budget codes and CSV allocation import</CardTitle>
              <CardDescription>
                Configure annual department payroll caps in your workspace currency, then import effective-dated employee splits. CSV headers: employee_id (or employee_number), cost_center_code, budget_code, allocation_pct. Each employee&apos;s split must total 100%, and its budget code must belong to the cost-center department and fiscal year.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-5 md:items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="payroll-budget-department">Department</label>
                  <Select value={budgetDepartmentId} onValueChange={setBudgetDepartmentId}>
                    <SelectTrigger id="payroll-budget-department"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map((department: any) => (
                      <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="payroll-budget-year">Fiscal year</label>
                  <Input id="payroll-budget-year" type="number" min="2000" max="2200" value={budgetYear} onChange={(event) => setBudgetYear(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="payroll-budget-code">Budget code</label>
                  <Input id="payroll-budget-code" value={budgetCode} onChange={(event) => setBudgetCode(event.target.value)} placeholder="e.g. SALES-Q4-2026" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="payroll-annual-budget">Annual payroll budget</label>
                  <Input id="payroll-annual-budget" type="number" min="0.01" step="0.01" value={annualBudget} onChange={(event) => setAnnualBudget(event.target.value)} placeholder="KES" />
                </div>
                <Button onClick={handleBudgetSave} disabled={setPayrollBudget.isPending}>
                  {setPayrollBudget.isPending ? "Saving..." : "Save annual budget"}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <Input
                  aria-label="Payroll allocation CSV"
                  type="file"
                  accept=".csv,text/csv"
                  className="max-w-md"
                  onChange={(event) => void handleAllocationCsv(event.target.files?.[0])}
                />
                <Button variant="outline" onClick={handleImportAllocations} disabled={!allocationImportRows.length || importAllocations.isPending}>
                  <Upload className="mr-2 h-4 w-4" />
                  {importAllocations.isPending ? "Importing..." : `Import allocations${allocationImportRows.length ? ` (${allocationImportRows.length} rows)` : ""}`}
                </Button>
                {importFileName && <span className="text-sm text-muted-foreground">{importFileName}</span>}
              </div>
            </CardContent>
          </Card>
        )}

        {(isGlobalWorkspace || hasOrganization) && (
        <Card>
          <CardHeader>
            <CardTitle>Cost-center ledger</CardTitle>
            <CardDescription>Payroll amounts are stored and split in integer cents; the fully burdened cost includes employer statutory contributions and benefits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div><label className="mb-1 block text-xs font-medium">From</label><Input type="date" value={exportStartDate} onChange={(event) => setExportStartDate(event.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium">To</label><Input type="date" value={exportEndDate} onChange={(event) => setExportEndDate(event.target.value)} /></div>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "CSV" | "XLSX" | "PDF")}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="CSV">CSV</SelectItem><SelectItem value="XLSX">XLSX</SelectItem><SelectItem value="PDF">PDF</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} disabled={exportLedger.isPending || exportStartDate > exportEndDate}>
                {exportLedger.isPending ? "Preparing..." : "Export audited ledger"}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-2">Period</th><th className="p-2">Employee</th><th className="p-2">Cost center</th><th className="p-2">Split</th><th className="p-2 text-right">Gross</th><th className="p-2 text-right">Employer costs</th><th className="p-2 text-right">Fully burdened</th></tr></thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr className="border-b" key={entry.id}>
                      <td className="p-2">{String(entry.payrollPeriodEnd).slice(0, 7)}</td>
                      <td className="p-2">{entry.employeeName} {entry.employeeLastName}</td>
                      <td className="p-2">{entry.costCenterCode} — {entry.costCenterName}</td>
                      <td className="p-2">{(entry.allocationBasisPoints / 100).toFixed(2)}%</td>
                      <td className="p-2 text-right">{formatCents(entry.grossPayCents)}</td>
                      <td className="p-2 text-right">{formatCents(entry.employerStatutoryCents + entry.employerBenefitsCents)}</td>
                      <td className="p-2 text-right font-medium">{formatCents(entry.fullyBurdenedCostCents)}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && <tr><td className="p-3 text-muted-foreground" colSpan={7}>No payroll allocation ledger entries yet.</td></tr>}
                </tbody>
              </table>
            </div>
            {summaryQuery.data && summaryQuery.data.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryQuery.data.map((summary) => (
                  <div className="rounded-md border p-3" key={summary.costCenterId}>
                    <p className="text-sm font-medium">{summary.code} — {summary.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Fully burdened: {formatCents(summary.fullyBurdenedCostCents)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
