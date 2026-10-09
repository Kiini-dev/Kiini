import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";

const componentTypes = [
  { value: "basic_salary", label: "Basic Salary" },
  { value: "allowance", label: "Allowance" },
  { value: "employer_benefit", label: "Employer Benefit" },
  { value: "employer_statutory", label: "Employer Statutory Contribution" },
  { value: "statutory_liability", label: "Statutory Deduction Liability" },
] as const;

export default function PayrollGLMapping() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [componentType, setComponentType] = useState<(typeof componentTypes)[number]["value"]>("allowance");
  const [componentName, setComponentName] = useState("*");
  const [accountId, setAccountId] = useState("");
  const hasPayrollWorkspace = Boolean(user);
  const utils = trpc.useUtils();
  const mappingsQuery = trpc.payrollAllocations.listComponentMappings.useQuery(undefined, {
    enabled: hasPayrollWorkspace,
  });
  const accountsQuery = trpc.chartOfAccounts.list.useQuery({ limit: 500 }, {
    enabled: hasPayrollWorkspace,
  });
  const saveMapping = trpc.payrollAllocations.setComponentMapping.useMutation({
    onSuccess: () => {
      toast.success("Payroll GL mapping saved.");
      setAccountId("");
      void utils.payrollAllocations.listComponentMappings.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const isLiabilityMapping = componentType === "statutory_liability";
  const accounts = (accountsQuery.data ?? []).filter((account: any) =>
    isLiabilityMapping
      ? account.accountType === "liability"
      : ["expense", "operating expense", "cost of goods sold", "other expense"].includes(account.accountType)
  );
  const mappings = mappingsQuery.data ?? [];

  const save = () => {
    if (!componentName.trim() || !accountId) {
      toast.error("Enter a component name and select a GL account.");
      return;
    }
    saveMapping.mutate({
      componentType,
      componentName: componentName.trim(),
      accountId,
    });
  };

  const accountLabel = (id: string) => {
    const account = accountsQuery.data?.find((row: any) => row.id === id);
    return account ? `${account.accountCode} — ${account.accountName}` : "Account unavailable";
  };

  return (
    <ModuleLayout
      title="Payroll GL Mapping"
      description="Map payroll expense components to Chart of Accounts codes once for this payroll workspace."
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Payroll GL Mapping" },
      ]}
      actions={
        <Button variant="outline" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payroll
        </Button>
      }
    >
      {!user ? (
        <Card><CardContent className="pt-6">Payroll workspace settings are unavailable until your user context is loaded.</CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add or update a mapping</CardTitle>
              <CardDescription>
                Use * as the component name for a category-wide default, or enter an exact component name to override it.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4 md:items-end">
              <div className="space-y-2">
                <Label>Component</Label>
                <Select value={componentType} onValueChange={(value: typeof componentType) => setComponentType(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Component name</Label>
                <Input value={componentName} onChange={(event) => setComponentName(event.target.value)} placeholder="* or exact component name" />
              </div>
              <div className="space-y-2">
                <Label>GL Account Code ({isLiabilityMapping ? "liability" : "expense"})</Label>
                <ChartOfAccountsSelector accounts={accounts} value={accountId} onChange={setAccountId} placeholder="Select account" />
              </div>
              <Button onClick={save} disabled={saveMapping.isPending}>
                <Save className="mr-2 h-4 w-4" /> Save mapping
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Configured mappings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mappingsQuery.isLoading ? <p>Loading mappings…</p> : mappings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No component mappings configured yet. Cost-center expense accounts remain the fallback.</p>
              ) : mappings.map((mapping) => (
                <div key={mapping.id} className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm">
                  <span>{componentTypes.find((item) => item.value === mapping.componentType)?.label ?? mapping.componentType}: {mapping.componentName}</span>
                  <span className="font-medium">{accountLabel(mapping.accountId)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </ModuleLayout>
  );
}
