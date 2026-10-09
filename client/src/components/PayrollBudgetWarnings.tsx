import { Link } from "wouter";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCurrencySettings } from "@/lib/currency";
import { formatMinorCurrencyAmount } from "../../../shared/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PayrollBudgetWarnings({ payrollPeriod }: { payrollPeriod: string }) {
  const { user } = useAuth();
  const { code: currencyCode } = useCurrencySettings();
  const preview = trpc.payrollAllocations.getBudgetPreview.useQuery(
    { payrollPeriod },
    { enabled: Boolean(user) && /^\d{4}-\d{2}$/.test(payrollPeriod) },
  );

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Department payroll budget outlook</CardTitle>
        <Button asChild variant="link" size="sm"><Link href="/payroll/gl-mapping">Configure GL mapping</Link></Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {preview.isLoading ? <p className="text-sm text-muted-foreground">Calculating budget outlook…</p> : null}
        {preview.isError ? (
          <p className="text-sm text-destructive">Budget outlook could not be loaded: {preview.error.message}</p>
        ) : null}
        {!preview.isLoading && !preview.isError && preview.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payroll-category department budgets are set for {payrollPeriod}.</p>
        ) : null}
        {preview.data?.map((item) => (
          <div key={item.departmentId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              {item.overBudget
                ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                : <CheckCircle2 className="h-4 w-4 text-green-600" />}
              <span className="font-medium">{item.departmentName}</span>
              <Badge variant={item.overBudget ? "destructive" : "secondary"}>
                {item.percentage === null ? "No cap" : `${item.percentage}% of quarterly budget`}
              </Badge>
              {item.consecutiveOverageQuarters > 0 ? (
                <Badge variant="outline">
                  {item.consecutiveOverageQuarters} consecutive over-budget quarter{item.consecutiveOverageQuarters === 1 ? "" : "s"}
                </Badge>
              ) : null}
            </div>
            <span className="text-sm text-muted-foreground">
              Projected {formatMinorCurrencyAmount(item.projectedQuarterSpendCents, currencyCode)} /
              {" "}{formatMinorCurrencyAmount(item.quarterlyBudgetCents, currencyCode)}
            </span>
            {item.overBudget ? (
              <p className="w-full text-sm text-amber-700">
                {item.departmentName} is projected to exceed its quarter payroll budget by{" "}
                {formatMinorCurrencyAmount(item.projectedQuarterSpendCents - item.quarterlyBudgetCents, currencyCode)}.
              </p>
            ) : null}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Quarterly caps are derived as one quarter of the annual payroll budget. The projection combines recorded payroll ledger costs through the prior month with this run&apos;s active employee salaries.
        </p>
      </CardContent>
    </Card>
  );
}
