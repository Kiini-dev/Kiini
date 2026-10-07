import { useLocation, useParams } from "wouter";
import { ArrowLeft, CheckCircle2, Heart, Minus, Wallet } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { toast } from "sonner";

type CompensationKind = "allowance" | "deduction" | "benefit";

const kindConfig: Record<CompensationKind, { title: string; nameField: string; icon: typeof Wallet }> = {
  allowance: { title: "Allowance", nameField: "allowanceType", icon: Wallet },
  deduction: { title: "Deduction", nameField: "deductionType", icon: Minus },
  benefit: { title: "Benefit", nameField: "benefitType", icon: Heart },
};

export default function CompensationItemDetails() {
  const { id, kind: routeKind } = useParams();
  const [location, navigate] = useLocation();
  const { formatMinorAmount } = useCurrencySettings();
  const pathKind = location.split("/").find((segment) => segment === "allowances" || segment === "deductions" || segment === "benefits");
  const resolvedKind = routeKind || (pathKind === "allowances" ? "allowance" : pathKind === "deductions" ? "deduction" : pathKind === "benefits" ? "benefit" : null);
  const kind = resolvedKind && resolvedKind in kindConfig ? resolvedKind as CompensationKind : null;
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.payroll.compensationItemDetails.useQuery(
    { kind: kind || "allowance", id: id || "" },
    { enabled: Boolean(kind && id) },
  );
  const statusMutation = trpc.payroll.setCompensationItemActive.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.payroll.compensationItemDetails.invalidate(),
        utils.payroll.allowances.list.invalidate(),
        utils.payroll.deductions.list.invalidate(),
        utils.payroll.benefits.list.invalidate(),
        utils.payroll.employeePackage.invalidate(),
      ]);
      toast.success("Compensation item status updated");
    },
    onError: (mutationError) => toast.error(mutationError.message || "Unable to update status"),
  });

  if (!kind) {
    return <ModuleLayout title="Compensation item" description="Invalid compensation item type"><p>Invalid compensation item type.</p></ModuleLayout>;
  }

  const config = kindConfig[kind];
  const Icon = config.icon;
  const item = data?.item as Record<string, any> | undefined;
  const employee = data?.employee;
  const amount = kind === "benefit" ? Number(item?.cost || 0) : Number(item?.amount || 0);
  const employeeName = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "Unknown employee";
  const active = item?.isActive !== false;

  return (
    <ModuleLayout
      title={`${config.title} details`}
      description="Configured compensation and payroll history"
      icon={<Icon className="h-6 w-6" />}
      breadcrumbs={[
        { label: "HR", href: "/hr" },
        { label: "Payroll", href: "/payroll" },
        { label: `${config.title}s`, href: `/payroll/${kind === "benefit" ? "benefits" : `${kind}s`}` },
        { label: "Details" },
      ]}
      backLink={{ label: `${config.title}s`, href: `/payroll/${kind === "benefit" ? "benefits" : `${kind}s`}` }}
    >
      {isLoading ? <p className="text-sm text-muted-foreground">Loading compensation details...</p> : error ? (
        <Card><CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent></Card>
      ) : item ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{item[config.nameField]}</h2>
              <p className="text-sm text-muted-foreground">{employeeName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
              <Button
                variant={active ? "outline" : "default"}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ kind, id: item.id, isActive: !active })}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm">Configured amount</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{formatMinorAmount(amount)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">{kind === "benefit" ? "Employee payroll total" : "Payroll total"}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{formatMinorAmount(kind === "benefit" ? data.totals.employeePayrollTotal : data.totals.payrollTotal)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Payroll runs</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{data.totals.distinctPayrollCount}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Frequency / provider</CardTitle></CardHeader><CardContent className="text-base capitalize">{item.frequency?.replace("_", " ") || item.provider || "—"}</CardContent></Card>
            {kind === "benefit" && <Card><CardHeader><CardTitle className="text-sm">Employer payroll total</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{formatMinorAmount(data.totals.employerPayrollTotal)}</CardContent></Card>}
          </div>

          {kind === "benefit" && (
            <Card>
              <CardHeader><CardTitle>Benefit configuration</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Provider</p><p>{item.provider || "—"}</p></div>
                <div><p className="text-sm text-muted-foreground">Coverage</p><p>{item.coverage || "—"}</p></div>
                <div><p className="text-sm text-muted-foreground">Employer contribution</p><p>{formatMinorAmount(Number(item.employerCost || 0))}</p></div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Payroll history</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Pay period</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {!data.history.length ? (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No payroll history has been recorded for this item yet.</TableCell></TableRow>
                  ) : data.history.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.payPeriodStart ? new Date(line.payPeriodStart).toLocaleDateString() : "—"} – {line.payPeriodEnd ? new Date(line.payPeriodEnd).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{line.description || item[config.nameField]}</TableCell>
                      <TableCell className="capitalize">{line.itemType.replaceAll("_", " ")}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{line.payrollStatus}</Badge></TableCell>
                      <TableCell className="text-right">{formatMinorAmount(line.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={() => navigate(`/payroll/${kind === "benefit" ? "benefits" : `${kind}s`}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {config.title.toLowerCase()}s
          </Button>
        </div>
      ) : null}
    </ModuleLayout>
  );
}
