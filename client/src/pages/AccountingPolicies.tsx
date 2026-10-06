import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { getDashboardUrl } from "@/lib/permissions";
import { getOrgSubdomainSlug } from "@/lib/organizationUrl";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type PolicyForm = {
  country: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  accountingMethod: "accrual" | "cash";
  defaultCurrency: string;
  taxInclusiveInvoicing: boolean;
  autoReconciliation: boolean;
  requireInvoiceApproval: boolean;
  requireExpenseApproval: boolean;
  defaultPaymentTerms: string;
  depreciationMethod: "straight_line" | "declining_balance" | "units_of_production";
  capitalizedAssetThreshold: number;
  roundingMethod: "round" | "truncate";
  retentionPeriod: number;
  auditTrailRequired: boolean;
  allowManualJournalEntries: boolean;
};

const defaultPolicy: PolicyForm = {
  country: "KE",
  fiscalYearStart: "01-01",
  fiscalYearEnd: "12-31",
  accountingMethod: "accrual",
  defaultCurrency: "KES",
  taxInclusiveInvoicing: true,
  autoReconciliation: false,
  requireInvoiceApproval: true,
  requireExpenseApproval: true,
  defaultPaymentTerms: "net30",
  depreciationMethod: "straight_line",
  capitalizedAssetThreshold: 50000,
  roundingMethod: "round",
  retentionPeriod: 7,
  auditTrailRequired: true,
  allowManualJournalEntries: true,
};

const countries = [
  ["KE", "Kenya"],
  ["NG", "Nigeria"],
  ["ZA", "South Africa"],
  ["UG", "Uganda"],
] as const;

function asBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) return fallback;
  return value === true || value === 1 || value === "1";
}

export default function AccountingPoliciesPage() {
  const { user, loading } = useAuthWithPersistence();
  const [location, navigate] = useLocation();
  const role = user?.effectiveRole || user?.role || "";
  const hasOrganizationRoute = location.startsWith("/org/") || Boolean(getOrgSubdomainSlug());
  const isGlobalPolicyPage = role === "super_admin" && !user?.organizationId && !hasOrganizationRoute;
  const userPermissions = user?.effectivePermissions ?? [];
  const canReadPolicies = ["super_admin", "admin", "accountant", "project_manager", "ict_manager"].includes(role)
    || userPermissions.some((permission) => [
      "accounting:read",
      "accounting:*",
      "accounting:policies:view",
      "accounting:policies:read",
      "accounting:policies:*",
    ].includes(permission));
  const canEditPolicies = ["super_admin", "admin", "accountant"].includes(role)
    || userPermissions.some((permission) => [
      "accounting:edit",
      "accounting:*",
      "accounting:policies:update",
      "accounting:policies:create",
      "accounting:policies:*",
    ].includes(permission));
  const utils = trpc.useUtils();
  const organizationPolicyQuery = trpc.accountingPolicies.getOrgPolicies.useQuery(undefined, { enabled: !isGlobalPolicyPage });
  const globalPolicyQuery = trpc.accountingPolicies.getGlobalPolicies.useQuery(undefined, { enabled: isGlobalPolicyPage });
  const policyQuery = isGlobalPolicyPage ? globalPolicyQuery : organizationPolicyQuery;
  const updateMutation = trpc.accountingPolicies.updatePolicies.useMutation();
  const updateGlobalMutation = trpc.accountingPolicies.updateGlobalPolicies.useMutation();
  const [templateLoading, setTemplateLoading] = useState(false);
  const [complianceEntityType, setComplianceEntityType] = useState<"invoice" | "expense">("invoice");
  const [complianceEntityId, setComplianceEntityId] = useState("");
  const complianceQuery = trpc.accountingPolicies.checkPolicyCompliance.useQuery(
    { entityType: complianceEntityType, entityId: complianceEntityId },
    { enabled: false },
  );
  const [form, setForm] = useState<PolicyForm>(defaultPolicy);

  useEffect(() => {
    if (loading || canReadPolicies) return;
    navigate(user ? getDashboardUrl(user.role || "user") : "/login");
  }, [loading, canReadPolicies, navigate, user]);

  useEffect(() => {
    const policy = policyQuery.data;
    if (!policy) return;
    setForm({
      country: policy.country || defaultPolicy.country,
      fiscalYearStart: policy.fiscalYearStart || defaultPolicy.fiscalYearStart,
      fiscalYearEnd: policy.fiscalYearEnd || defaultPolicy.fiscalYearEnd,
      accountingMethod: policy.accountingMethod || defaultPolicy.accountingMethod,
      defaultCurrency: policy.defaultCurrency || defaultPolicy.defaultCurrency,
      taxInclusiveInvoicing: asBoolean(policy.taxInclusiveInvoicing, defaultPolicy.taxInclusiveInvoicing),
      autoReconciliation: asBoolean(policy.autoReconciliation, defaultPolicy.autoReconciliation),
      requireInvoiceApproval: asBoolean(policy.requireInvoiceApproval, defaultPolicy.requireInvoiceApproval),
      requireExpenseApproval: asBoolean(policy.requireExpenseApproval, defaultPolicy.requireExpenseApproval),
      defaultPaymentTerms: policy.defaultPaymentTerms || defaultPolicy.defaultPaymentTerms,
      depreciationMethod: policy.depreciationMethod || defaultPolicy.depreciationMethod,
      capitalizedAssetThreshold: Number(policy.capitalizedAssetThreshold ?? defaultPolicy.capitalizedAssetThreshold),
      roundingMethod: policy.roundingMethod || defaultPolicy.roundingMethod,
      retentionPeriod: Number(policy.retentionPeriod ?? defaultPolicy.retentionPeriod),
      auditTrailRequired: asBoolean(policy.auditTrailRequired, defaultPolicy.auditTrailRequired),
      allowManualJournalEntries: asBoolean(policy.allowManualJournalEntries, defaultPolicy.allowManualJournalEntries),
    });
  }, [policyQuery.data]);

  const setValue = <K extends keyof PolicyForm>(key: K, value: PolicyForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadCountryTemplate = async () => {
    if (templateLoading) return;
    setTemplateLoading(true);
    try {
      const template = await utils.accountingPolicies.getPolicyTemplate.fetch({ country: form.country });
      setForm((current) => ({
        ...current,
        fiscalYearStart: template.fiscalYearStart,
        fiscalYearEnd: template.fiscalYearEnd,
        accountingMethod: template.accountingMethod,
        defaultCurrency: template.defaultCurrency,
        taxInclusiveInvoicing: template.taxInclusiveInvoicing,
        autoReconciliation: template.autoReconciliation,
        requireInvoiceApproval: template.requireInvoiceApproval,
        requireExpenseApproval: template.requireExpenseApproval,
        defaultPaymentTerms: template.defaultPaymentTerms,
        depreciationMethod: template.depreciationMethod,
        capitalizedAssetThreshold: template.capitalizedAssetThreshold,
        roundingMethod: template.roundingMethod,
        retentionPeriod: template.retentionPeriod,
        auditTrailRequired: template.auditTrailRequired,
        allowManualJournalEntries: template.allowManualJournalEntries,
      }));
      toast.success(`${countries.find(([code]) => code === form.country)?.[1] ?? form.country} policy template loaded. Save to apply it.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the accounting policy template.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const save = () => {
    const mutation = isGlobalPolicyPage ? updateGlobalMutation : updateMutation;
    mutation.mutate(form, {
      onSuccess: async () => {
        toast.success(isGlobalPolicyPage ? "Global accounting policies saved." : "Organization accounting policies saved.");
        if (isGlobalPolicyPage) await utils.accountingPolicies.getGlobalPolicies.invalidate();
        else await utils.accountingPolicies.getOrgPolicies.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  if (loading || !user || !canReadPolicies) return null;

  return (
    <ModuleLayout
      title="Accounting Policies"
      description={isGlobalPolicyPage
        ? "Configure accounting rules for Kiini's global application."
        : "Configure your organization's accounting, approval, fiscal-year and record-retention rules."}
      icon={<Settings className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Policies" },
      ]}
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={templateLoading}
            onClick={() => void loadCountryTemplate()}
          >
            {templateLoading ? "Loading template…" : "Load country template"}
          </Button>
        </div>
      )}
    >
      {policyQuery.isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading accounting policies…</div>
      ) : policyQuery.error ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load accounting policies: {policyQuery.error.message}
        </div>
      ) : (
        <div className="space-y-6">
          {!canEditPolicies && (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              You can view this policy configuration, but your permissions do not allow changes.
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Accounting configuration</CardTitle>
              <CardDescription>Country templates provide suggested values; changes are only applied after you save.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Compliance country">
                <Select value={form.country} onValueChange={(value) => setValue("country", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{countries.map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Accounting method">
                <Select value={form.accountingMethod} onValueChange={(value) => setValue("accountingMethod", value as PolicyForm["accountingMethod"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="accrual">Accrual</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Default currency">
                <Input maxLength={3} value={form.defaultCurrency} onChange={(event) => setValue("defaultCurrency", event.target.value.toUpperCase())} />
              </Field>
              <Field label="Fiscal year starts (MM-DD)">
                <Input maxLength={5} placeholder="01-01" value={form.fiscalYearStart} onChange={(event) => setValue("fiscalYearStart", event.target.value)} />
              </Field>
              <Field label="Fiscal year ends (MM-DD)">
                <Input maxLength={5} placeholder="12-31" value={form.fiscalYearEnd} onChange={(event) => setValue("fiscalYearEnd", event.target.value)} />
              </Field>
              <Field label="Default payment terms">
                <Input maxLength={20} value={form.defaultPaymentTerms} onChange={(event) => setValue("defaultPaymentTerms", event.target.value)} />
              </Field>
              <Field label="Depreciation method">
                <Select value={form.depreciationMethod} onValueChange={(value) => setValue("depreciationMethod", value as PolicyForm["depreciationMethod"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">Straight line</SelectItem>
                    <SelectItem value="declining_balance">Declining balance</SelectItem>
                    <SelectItem value="units_of_production">Units of production</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Capitalized asset threshold">
                <Input type="number" min="0" value={form.capitalizedAssetThreshold} onChange={(event) => setValue("capitalizedAssetThreshold", Number(event.target.value))} />
              </Field>
              <Field label="Rounding method">
                <Select value={form.roundingMethod} onValueChange={(value) => setValue("roundingMethod", value as PolicyForm["roundingMethod"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="round">Round</SelectItem><SelectItem value="truncate">Truncate</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Record retention (years)">
                <Input type="number" min="1" value={form.retentionPeriod} onChange={(event) => setValue("retentionPeriod", Number(event.target.value))} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Controls and approvals</CardTitle>
              <CardDescription>Set the organization-wide posting, reconciliation and audit requirements.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <PolicyToggle label="Tax-inclusive invoicing" checked={form.taxInclusiveInvoicing} onCheckedChange={(checked) => setValue("taxInclusiveInvoicing", checked)} />
              <PolicyToggle label="Automatic reconciliation" checked={form.autoReconciliation} onCheckedChange={(checked) => setValue("autoReconciliation", checked)} />
              <PolicyToggle label="Require invoice approval" checked={form.requireInvoiceApproval} onCheckedChange={(checked) => setValue("requireInvoiceApproval", checked)} />
              <PolicyToggle label="Require expense approval" checked={form.requireExpenseApproval} onCheckedChange={(checked) => setValue("requireExpenseApproval", checked)} />
              <PolicyToggle label="Require audit trail" checked={form.auditTrailRequired} onCheckedChange={(checked) => setValue("auditTrailRequired", checked)} />
              <PolicyToggle label="Allow manual journal entries" checked={form.allowManualJournalEntries} onCheckedChange={(checked) => setValue("allowManualJournalEntries", checked)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check a record against policy</CardTitle>
              <CardDescription>Run the policy compliance check for an invoice or expense by its record ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)_auto]">
                <Field label="Record type">
                  <Select value={complianceEntityType} onValueChange={(value) => setComplianceEntityType(value as "invoice" | "expense")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="invoice">Invoice</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Record ID">
                  <Input value={complianceEntityId} onChange={(event) => setComplianceEntityId(event.target.value)} placeholder="Enter invoice or expense ID" />
                </Field>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    disabled={!complianceEntityId.trim() || complianceQuery.isFetching}
                    onClick={() => void complianceQuery.refetch()}
                  >
                    {complianceQuery.isFetching ? "Checking…" : "Check compliance"}
                  </Button>
                </div>
              </div>
              {complianceQuery.error && <p role="alert" className="text-sm text-destructive">{complianceQuery.error.message}</p>}
              {complianceQuery.data && (
                <div className="space-y-2 rounded-md border p-3">
                  <Badge variant={complianceQuery.data.compliant ? "default" : "destructive"}>
                    {complianceQuery.data.compliant ? "Compliant" : "Action required"}
                  </Badge>
                  {complianceQuery.data.issues.map((issue, index) => <p className="text-sm text-muted-foreground" key={`${issue}-${index}`}>{issue}</p>)}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save} disabled={!canEditPolicies || updateMutation.isPending || updateGlobalMutation.isPending}>
              {updateMutation.isPending || updateGlobalMutation.isPending ? "Saving…" : "Save accounting policies"}
            </Button>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}

function PolicyToggle({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
