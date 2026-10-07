import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ReportNavigation } from "@/components/ReportNavigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowDownLeft, ArrowUpRight, BookOpen, Calculator, Download, Loader2, Plus, RotateCcw, Save, ShieldCheck } from "lucide-react";

const rateMetricOptions = [
  ["projectsCount", "Projects"],
  ["tasksCount", "Tasks"],
  ["documentsCount", "Documents"],
  ["storageUsedMB", "Storage (MB)"],
  ["apiCallsCount", "API calls"],
  ["emailsSent", "Emails sent"],
] as const;

type RateTierDraft = { metricKey: string; unitFrom: string; unitTo: string; unitPriceCents: string };

const defaultRateCard = {
  planId: "",
  currency: "KES",
  monthlyBaseCents: "0",
  annualBaseCents: "0",
  includedSeats: "0",
  monthlySeatCents: "0",
  annualSeatCents: "0",
  tiers: [] as RateTierDraft[],
};

function amount(value: unknown, currency = "KES") {
  const cents = Number(value || 0);
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
}

function dateOnly(value: string) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function IncomeLedger() {
  const [, navigate] = useLocation();
  const [pathname] = useLocation();
  const { user } = useAuth();
  const orgWorkspace = pathname.startsWith("/org/");
  const isPlatformAdmin = user?.role === "super_admin" && !user?.organizationId;
  const initialScope = orgWorkspace || user?.organizationId ? "tenant_income" : "company_income";
  const [scope, setScope] = useState<"tenant_income" | "company_income" | "saas_revenue">(initialScope);
  const effectiveRole = user?.effectiveRole || user?.role || "";
  const canOffsetIncomeEntries = isPlatformAdmin || (
    scope === "tenant_income"
    && (
      ["admin", "accountant"].includes(effectiveRole)
      || user?.effectivePermissions?.some(permission => ["accounting:edit", "accounting:*"].includes(permission))
    )
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showRateCards, setShowRateCards] = useState(false);
  const [selectedRateCardId, setSelectedRateCardId] = useState("");
  const [isCreatingRateCard, setIsCreatingRateCard] = useState(false);
  const [rateCardDraft, setRateCardDraft] = useState(defaultRateCard);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!orgWorkspace && user?.organizationId && user.organizationSlug) {
      navigate(`/org/${user.organizationSlug}/income-ledger`);
    }
  }, [navigate, orgWorkspace, user?.organizationId, user?.organizationSlug]);

  useEffect(() => {
    setScope(orgWorkspace || user?.organizationId ? "tenant_income" : "company_income");
  }, [orgWorkspace, user?.organizationId]);

  const ledgerQuery = trpc.incomeLedger.list.useQuery({
    scope,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100,
    offset: 0,
  }, {
    enabled: !user?.organizationId || orgWorkspace,
    retry: false,
  });
  const rateCardsQuery = trpc.incomeLedger.listRateCards.useQuery(undefined, {
    enabled: isPlatformAdmin && scope === "saas_revenue",
    retry: false,
  });
  const plansQuery = trpc.incomeLedger.listActivePlans.useQuery(undefined, {
    enabled: isPlatformAdmin && scope === "saas_revenue",
    retry: false,
  });
  const offsetEntry = trpc.incomeLedger.offsetSaaSCharge.useMutation({
    onSuccess: async result => {
      toast.success(result.created ? `Offset ${result.entryNumber} posted.` : `This charge already has offset ${result.entryNumber}.`);
      await ledgerQuery.refetch();
    },
    onError: error => toast.error(`Could not post offset: ${error.message}`),
  });
  const offsetJournalEntry = trpc.incomeLedger.offsetJournalEntry.useMutation({
    onSuccess: async result => {
      toast.success(result.created ? `Offset ${result.entryNumber} posted.` : `This entry already has offset ${result.entryNumber}.`);
      await ledgerQuery.refetch();
    },
    onError: error => toast.error(`Could not post offset: ${error.message}`),
  });
  const saveRateCard = trpc.incomeLedger.saveRateCard.useMutation({
    onSuccess: async () => {
      toast.success("SaaS rate card saved. Future billing cycles will use these rates.");
      const refreshed = await rateCardsQuery.refetch();
      const savedCard = refreshed.data?.find((card: any) =>
        card.planId === rateCardDraft.planId && card.currency === rateCardDraft.currency,
      );
      if (savedCard) setSelectedRateCardId(savedCard.id);
      setIsCreatingRateCard(false);
    },
    onError: error => toast.error(`Could not save rate card: ${error.message}`),
  });

  const rateCards = rateCardsQuery.data || [];
  const plans = plansQuery.data || [];
  const selectedCard = isCreatingRateCard
    ? undefined
    : rateCards.find((card: any) => card.id === selectedRateCardId) || rateCards[0];
  useEffect(() => {
    if (!selectedCard) {
      setSelectedRateCardId("");
      if (!isCreatingRateCard) setRateCardDraft(defaultRateCard);
      return;
    }
    setSelectedRateCardId(selectedCard.id);
    setRateCardDraft({
      planId: selectedCard.planId,
      currency: selectedCard.currency || "KES",
      monthlyBaseCents: String(selectedCard.monthlyBaseCents ?? 0),
      annualBaseCents: String(selectedCard.annualBaseCents ?? 0),
      includedSeats: String(selectedCard.includedSeats ?? 0),
      monthlySeatCents: String(selectedCard.monthlySeatCents ?? 0),
      annualSeatCents: String(selectedCard.annualSeatCents ?? 0),
      tiers: (selectedCard.tiers || []).map((tier: any) => ({
        metricKey: tier.metricKey,
        unitFrom: String(tier.unitFrom),
        unitTo: tier.unitTo == null ? "" : String(tier.unitTo),
        unitPriceCents: String(tier.unitPriceCents),
      })),
    });
  // The draft should be replaced when selecting a different persisted card, not while editing it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatingRateCard, selectedRateCardId, rateCardsQuery.data]);

  const entries = (ledgerQuery.data as any)?.entries || [];
  const totals = ledgerQuery.data as any;
  const entryCurrency = entries[0]?.currency || "KES";
  const incomeDebit = scope === "saas_revenue"
    ? Number(totals?.totalIncomeCents || 0)
    : Number(totals?.totalIncomeDebitCents || 0);
  const incomeCredit = scope === "saas_revenue"
    ? Number(totals?.totalIncomeCents || 0)
    : Number(totals?.totalIncomeCreditCents || 0);

  const scopeLabel = useMemo(() => {
    if (scope === "saas_revenue") return "Kiini SaaS revenue";
    return scope === "company_income" ? "Kiini company income" : "Organization income";
  }, [scope]);

  function saveCurrentRateCard() {
    const numberValue = (value: string) => Number(value || 0);
    saveRateCard.mutate({
      planId: rateCardDraft.planId,
      currency: rateCardDraft.currency,
      monthlyBaseCents: numberValue(rateCardDraft.monthlyBaseCents),
      annualBaseCents: numberValue(rateCardDraft.annualBaseCents),
      includedSeats: numberValue(rateCardDraft.includedSeats),
      monthlySeatCents: numberValue(rateCardDraft.monthlySeatCents),
      annualSeatCents: numberValue(rateCardDraft.annualSeatCents),
      tiers: rateCardDraft.tiers.map(tier => ({
        metricKey: tier.metricKey as typeof rateMetricOptions[number][0],
        unitFrom: numberValue(tier.unitFrom),
        unitTo: tier.unitTo === "" ? null : numberValue(tier.unitTo),
        unitPriceCents: numberValue(tier.unitPriceCents),
      })),
    });
  }

  function startNewRateCard() {
    setIsCreatingRateCard(true);
    setSelectedRateCardId("");
    setRateCardDraft({ ...defaultRateCard, planId: plans[0]?.id || "" });
  }

  function requestOffset(entry: any) {
    const reason = window.prompt(`Reason for offsetting ${entry.entryNumber} (at least 5 characters):`);
    if (reason == null) return;
    offsetEntry.mutate({ entryId: entry.id, reason });
  }

  function requestJournalOffset(entry: any) {
    const reason = window.prompt(`Reason for offsetting ${entry.entryNumber} (at least 5 characters):`);
    if (reason == null) return;
    if (scope === "saas_revenue") return;
    offsetJournalEntry.mutate({ scope, entryId: entry.id, reason });
  }

  function formatSaaSTotals(kind: "debitCents" | "creditCents") {
    const currencyTotals = (totals?.totalsByCurrency || []) as Array<{ currency: string; debitCents: number; creditCents: number }>;
    if (currencyTotals.length === 0) return amount(0, entryCurrency);
    return currencyTotals.map(item => amount(item[kind], item.currency)).join(" · ");
  }

  async function exportLedger() {
    try {
      const exportedEntries: any[] = [];
      const pageSize = 200;
      let offset = 0;
      let total = Number(totals?.total || 0);
      do {
        const page = await utils.incomeLedger.list.fetch({
          scope,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit: pageSize,
          offset,
        });
        exportedEntries.push(...page.entries);
        total = page.total;
        offset += page.entries.length;
        if (page.entries.length === 0) break;
      } while (offset < total);

      const columns = [
        "Date", "Entry number", "Entry ID", "Source", "Reference", "Description",
        "Organization ID", "Status", "Account code", "Account name",
        "Debit (minor units)", "Credit (minor units)", "Currency", "Offset posted",
      ];
      const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const records = exportedEntries.flatMap(entry => {
        const lines = entry.lines?.length ? entry.lines : [{
          accountCode: "",
          accountName: "No ledger lines",
          debit: 0,
          credit: 0,
          debitCents: 0,
          creditCents: 0,
        }];
        return lines.map((line: any) => [
          dateOnly(entry.entryDate),
          entry.entryNumber,
          entry.id,
          entry.entrySource === "invoice_payment" ? "Invoice payment (payment record)" : entry.referenceType || entry.sourceType || entry.entrySource,
          entry.reference || entry.referenceId,
          entry.description,
          entry.organizationId,
          entry.status,
          line.accountCode,
          line.accountName,
          line.debitCents ?? line.debit ?? 0,
          line.creditCents ?? line.credit ?? 0,
          entry.currency || "KES",
          entry.hasOffset ? "Yes" : "No",
        ].map(csvCell).join(","));
      });
      const blob = new Blob([[columns.map(csvCell).join(","), ...records].join("\r\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `income-ledger-${scope}-${startDate || "all"}-to-${endDate || "all"}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${exportedEntries.length} ledger entries.`);
    } catch (error) {
      toast.error(`Could not export income ledger: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return (
    <ModuleLayout
      title="Income Ledger"
      description="Review immutable income postings, balanced debits and credits, and rated subscription revenue."
      icon={<BookOpen className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: orgWorkspace ? `/org/${user?.organizationSlug || ""}/dashboard` : "/crm-home" },
        { label: "Accounting", href: orgWorkspace ? `/org/${user?.organizationSlug || ""}/accounting` : "/accounting" },
        { label: "Income Ledger" },
      ]}
    >
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <ReportNavigation active="/income-ledger" />
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Ledger scope</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {orgWorkspace || user?.organizationId ? (
                <Badge variant="secondary">Organization income</Badge>
              ) : (
                <>
                  <Button size="sm" variant={scope === "company_income" ? "default" : "outline"} onClick={() => setScope("company_income")}>
                    Kiini company income
                  </Button>
                  <Button size="sm" variant={scope === "saas_revenue" ? "default" : "outline"} onClick={() => setScope("saas_revenue")}>
                    SaaS revenue
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button variant="outline" onClick={exportLedger} disabled={ledgerQuery.isFetching}>
              <Download className="mr-2 h-4 w-4" />Export CSV
            </Button>
            <Button variant="outline" onClick={() => navigate(orgWorkspace
              ? `/org/${user?.organizationSlug || ""}/finance/reports`
              : "/finance/reports")}>
              View Profit &amp; Loss
            </Button>
            <label className="grid gap-1 text-xs text-muted-foreground">From<Input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label>
            <label className="grid gap-1 text-xs text-muted-foreground">To<Input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></label>
            {isPlatformAdmin && scope === "saas_revenue" && (
              <Button variant="outline" onClick={() => setShowRateCards(value => !value)}>
                <Calculator className="mr-2 h-4 w-4" />{showRateCards ? "Hide rate cards" : "Configure rate cards"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardDescription>Income debits</CardDescription><CardTitle className="flex items-center gap-2 text-xl"><ArrowDownLeft className="h-4 w-4 text-rose-600" />{scope === "saas_revenue" ? formatSaaSTotals("debitCents") : amount(incomeDebit, entryCurrency)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Income credits</CardDescription><CardTitle className="flex items-center gap-2 text-xl"><ArrowUpRight className="h-4 w-4 text-emerald-600" />{scope === "saas_revenue" ? formatSaaSTotals("creditCents") : amount(incomeCredit, entryCurrency)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Net income movement</CardDescription><CardTitle className="text-xl">{scope === "saas_revenue" ? ((totals?.totalsByCurrency || []) as Array<{ currency: string; debitCents: number; creditCents: number }>).map(item => amount(item.creditCents - item.debitCents, item.currency)).join(" · ") || amount(0, entryCurrency) : amount(incomeCredit - incomeDebit, entryCurrency)}</CardTitle></CardHeader></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{scopeLabel}</CardTitle>
            <CardDescription>Finalized postings are append-only. Corrections appear as separate offsetting entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {ledgerQuery.isLoading ? (
              <div className="flex items-center justify-center py-14"><Loader2 className="h-7 w-7 animate-spin" /></div>
            ) : ledgerQuery.error ? (
              <p role="alert" className="rounded-md border border-destructive/40 p-4 text-sm text-destructive">{ledgerQuery.error.message}</p>
            ) : entries.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No finalized income entries found for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground">
                    <th className="p-3">Date</th><th className="p-3">Reference</th><th className="p-3">Description</th>
                    {scope === "saas_revenue" && <th className="p-3">Workspace</th>}
                    <th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th><th className="p-3">Double-entry</th><th className="p-3">Actions</th><th className="p-3">Details</th>
                  </tr></thead>
                  <tbody>
                    {entries.map((entry: any) => {
                      const currency = entry.currency || entryCurrency;
                      const debitCents = scope === "saas_revenue"
                        ? Number(entry.lines?.reduce((sum: number, line: any) => sum + Number(line.debitCents || 0), 0) || 0)
                        : Number(entry.incomeDebitCents || 0);
                      const creditCents = scope === "saas_revenue"
                        ? Number(entry.lines?.reduce((sum: number, line: any) => sum + Number(line.creditCents || 0), 0) || 0)
                        : Number(entry.incomeCreditCents || 0);
                      return (
                        <tr key={entry.id} className="border-b align-top last:border-0">
                          <td className="whitespace-nowrap p-3">{dateOnly(entry.entryDate)}</td>
                          <td className="p-3 font-mono text-xs">{entry.entryNumber}</td>
                          <td className="max-w-sm p-3">{entry.description || "Income posting"}{entry.entryType === "reversal" && <Badge className="ml-2" variant="outline">Offset</Badge>}{entry.hasOffset && <Badge className="ml-2" variant="outline">Offset posted</Badge>}</td>
                          {scope === "saas_revenue" && <td className="p-3">{entry.organizationName || entry.organizationId || "—"}</td>}
                          <td className="whitespace-nowrap p-3 text-right">{amount(debitCents, currency)}</td>
                          <td className="whitespace-nowrap p-3 text-right">{amount(creditCents, currency)}</td>
                          <td className="max-w-sm p-3 text-xs">
                            {entry.lines?.length ? (
                              <div className="space-y-1">
                                <p><span className="font-medium">Debit:</span> {entry.lines.filter((line: any) => Number(line.debitCents ?? line.debit ?? 0) > 0).map((line: any) => `${line.accountCode || line.accountId || "—"} ${line.accountName ? `· ${line.accountName}` : ""} (${amount(line.debitCents ?? line.debit, currency)})`).join("; ") || "—"}</p>
                                <p><span className="font-medium">Credit:</span> {entry.lines.filter((line: any) => Number(line.creditCents ?? line.credit ?? 0) > 0).map((line: any) => `${line.accountCode || line.accountId || "—"} ${line.accountName ? `· ${line.accountName}` : ""} (${amount(line.creditCents ?? line.credit, currency)})`).join("; ") || "—"}</p>
                              </div>
                            ) : <span className="text-muted-foreground">No posted journal lines</span>}
                            {entry.entrySource === "invoice_payment" && <p className="mt-2 text-amber-700">Derived from payment record; not posted to the journal.</p>}
                          </td>
                          <td className="p-3">
                            {scope === "saas_revenue" && isPlatformAdmin && entry.entryType === "charge" && !entry.hasOffset ? (
                              <Button variant="outline" size="sm" className="mb-2" disabled={offsetEntry.isPending || offsetJournalEntry.isPending} onClick={() => requestOffset(entry)}>
                                <RotateCcw className="mr-2 h-3.5 w-3.5" />Post offset
                              </Button>
                            ) : null}
                            {scope !== "saas_revenue" && canOffsetIncomeEntries && entry.entrySource === "journal"
                              && entry.referenceType !== "income_ledger_reversal" && !entry.hasOffset ? (
                              <Button variant="outline" size="sm" className="mb-2" disabled={offsetJournalEntry.isPending} onClick={() => requestJournalOffset(entry)}>
                                <RotateCcw className="mr-2 h-3.5 w-3.5" />Reverse with offset
                              </Button>
                            ) : null}
                          </td>
                          <td className="p-3">
                            <details>
                              <summary className="cursor-pointer text-primary">Lines</summary>
                              <div className="mt-2 min-w-64 space-y-2">
                                {entry.lines?.map((line: any) => (
                                  <div key={line.id} className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs">
                                    <span>{line.accountCode || line.accountId} · {line.accountName || line.accountCode}</span>
                                    <span>D {amount(line.debitCents ?? line.debit, currency)}</span>
                                    <span>C {amount(line.creditCents ?? line.credit, currency)}</span>
                                  </div>
                                ))}
                                {entry.usageSnapshot && (
                                  <div className="border-t pt-2 text-xs text-muted-foreground">
                                    <p>Active seats: {entry.usageSnapshot.activeSeats ?? 0}</p>
                                    {(entry.pricingSnapshot?.breakdown || []).map((line: any, index: number) => (
                                      <p key={`${line.metric}-${index}`}>{line.metric}: {line.units} × {amount(line.unitPriceCents, currency)} = {amount(line.amountCents, currency)}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {isPlatformAdmin && scope === "saas_revenue" && showRateCards && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />SaaS rate cards</CardTitle>
              <CardDescription>Tier bands are progressive: each band prices only units inside its range. Amounts are entered in minor currency units (for example, cents).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {rateCardsQuery.isLoading || plansQuery.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : rateCardsQuery.error || plansQuery.error ? (
                <p role="alert" className="text-sm text-destructive">{(rateCardsQuery.error || plansQuery.error)?.message}</p>
              ) : plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active pricing plans are available. Create an active pricing plan first.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    {rateCards.length > 0 && (
                      <label className="grid min-w-64 gap-1 text-sm">Existing rate card
                        <select className="h-10 rounded-md border bg-background px-3" value={isCreatingRateCard ? "" : selectedCard?.id || ""} onChange={event => { setIsCreatingRateCard(false); setSelectedRateCardId(event.target.value); }}>
                          {rateCards.map((card: any) => <option key={card.id} value={card.id}>{card.planName} · {card.tier} · {card.currency}</option>)}
                        </select>
                      </label>
                    )}
                    <Button variant="outline" onClick={startNewRateCard}><Plus className="mr-2 h-4 w-4" />New rate card</Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="grid gap-1 text-sm">Pricing plan
                      <select className="h-10 rounded-md border bg-background px-3" value={rateCardDraft.planId} onChange={event => setRateCardDraft(current => ({ ...current, planId: event.target.value }))}>
                        {plans.map((plan: any) => <option key={plan.id} value={plan.id}>{plan.planName} · {plan.tier}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm">Currency<Input maxLength={3} value={rateCardDraft.currency} onChange={event => setRateCardDraft(current => ({ ...current, currency: event.target.value.toUpperCase() }))} /></label>
                    <label className="grid gap-1 text-sm">Monthly base (minor units)<Input type="number" min="0" value={rateCardDraft.monthlyBaseCents} onChange={event => setRateCardDraft(current => ({ ...current, monthlyBaseCents: event.target.value }))} /></label>
                    <label className="grid gap-1 text-sm">Annual base (minor units)<Input type="number" min="0" value={rateCardDraft.annualBaseCents} onChange={event => setRateCardDraft(current => ({ ...current, annualBaseCents: event.target.value }))} /></label>
                    <label className="grid gap-1 text-sm">Seats included<Input type="number" min="0" value={rateCardDraft.includedSeats} onChange={event => setRateCardDraft(current => ({ ...current, includedSeats: event.target.value }))} /></label>
                    <label className="grid gap-1 text-sm">Monthly cost per extra seat<Input type="number" min="0" value={rateCardDraft.monthlySeatCents} onChange={event => setRateCardDraft(current => ({ ...current, monthlySeatCents: event.target.value }))} /></label>
                    <label className="grid gap-1 text-sm">Annual cost per extra seat<Input type="number" min="0" value={rateCardDraft.annualSeatCents} onChange={event => setRateCardDraft(current => ({ ...current, annualSeatCents: event.target.value }))} /></label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Usage bands</h3><Button variant="outline" size="sm" onClick={() => setRateCardDraft(current => ({ ...current, tiers: [...current.tiers, { metricKey: "apiCallsCount", unitFrom: "0", unitTo: "", unitPriceCents: "0" }] }))}><Plus className="mr-2 h-4 w-4" />Add band</Button></div>
                    {rateCardDraft.tiers.map((tier, index) => (
                      <div key={`${tier.metricKey}-${index}`} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto]">
                        <select className="h-10 rounded-md border bg-background px-3" value={tier.metricKey} onChange={event => setRateCardDraft(current => ({ ...current, tiers: current.tiers.map((item, itemIndex) => itemIndex === index ? { ...item, metricKey: event.target.value } : item) }))}>
                          {rateMetricOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <Input type="number" min="0" aria-label="Tier starts at units" value={tier.unitFrom} onChange={event => setRateCardDraft(current => ({ ...current, tiers: current.tiers.map((item, itemIndex) => itemIndex === index ? { ...item, unitFrom: event.target.value } : item) }))} />
                        <Input type="number" min="1" aria-label="Tier ends before units; blank means no limit" placeholder="No limit" value={tier.unitTo} onChange={event => setRateCardDraft(current => ({ ...current, tiers: current.tiers.map((item, itemIndex) => itemIndex === index ? { ...item, unitTo: event.target.value } : item) }))} />
                        <Input type="number" min="0" aria-label="Price per unit in minor currency units" placeholder="Price per unit (minor units)" value={tier.unitPriceCents} onChange={event => setRateCardDraft(current => ({ ...current, tiers: current.tiers.map((item, itemIndex) => itemIndex === index ? { ...item, unitPriceCents: event.target.value } : item) }))} />
                        <Button variant="ghost" size="sm" onClick={() => setRateCardDraft(current => ({ ...current, tiers: current.tiers.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={saveCurrentRateCard} disabled={saveRateCard.isPending}>
                    {saveRateCard.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save rate card
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </ModuleLayout>
  );
}
